// Local-only deterministic V1 verification and scale baseline; no hosted access.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';
const db=new PGlite();
const read=f=>readFileSync(f,'utf8');
await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$; grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated; grant usage on schema public to anon, authenticated;`);
for(const f of ['supabase/migrations/202611010001_catalog.sql','tests/fixtures/catalog-seed.sql','supabase/migrations/202611010002_least_privilege_catalog_grants.sql','supabase/seed.test-fixtures.sql','supabase/migrations/202611020001_search_ranking.sql']) await db.exec(read(f));
const sql=read('supabase/migrations/202611020001_search_ranking.sql');
await db.exec(`insert into public.documents(slug,title,description,original_url,platform,subject_id,course_id,semester,topic,document_type,keywords,tags,is_featured,publication_status,created_at)
  select 'akv2-scale-'||i,
    case when i between 21 and 100 then 'Equal title' when i=101 then 'Akzephyr synthetic resource' when i=102 then 'It''s a synthetic resource' else 'Synthetic resource '||lpad(i::text,5,'0') end,
    'Synthetic filler study resource '||case when i%3<>0 then 'graviton' else 'zephyrq' end||' topic paragraph.',
    'https://example.com/fixtures/'||i,
    case when i%4=0 then 'Google Drive' else 'Other' end,s.id,c.id,
    case when i%3=0 then 'Sem 1' else 'Sem 2' end,'Scale',case when i%5=0 or i=101 then 'Worksheet' else 'Notes' end,
    array['filler','kw'||(i%90)],array['synthetic'],i%7=0,'published',
    '2024-01-01'::timestamptz + (i%4)*interval '1 day'
  from generate_series(1,4000) i cross join public.subjects s cross join public.courses c
  where s.slug='fixture-mathematics' and c.slug='fixture-class-10'; analyze public.documents;`);
const counts=(await db.query(`select count(*)::int as total, count(*) filter (where publication_status='published')::int as published from public.documents`)).rows[0];
console.log('COUNTS',JSON.stringify(counts));
const inputs=['akzephyr graviton','akzephyr graviton mathematics worksheet','1','10','Sem 1','Class 10','Class 1','Worksheet','Google Drive','"intro boundary"','algebra OR chemistry','zephyrq -Title','-algebra','','"unterminated','!!!',"'); DROP TABLE public.documents; --",'a'.repeat(300),"it's",'noSuchScaleTermEver','filler','graviton','zephyrq','Fixture Mathematics','Fixture Class 10','mathematics algebra','algebra geometry','"algebra practice"'];
assert.equal(inputs.length,28);
const subject=(await db.query("select id from public.subjects where slug='fixture-mathematics'")).rows[0].id;
const course=(await db.query("select id from public.courses where slug='fixture-class-10'")).rows[0].id;
const otherSubject=(await db.query("select id from public.subjects where slug<>'fixture-mathematics' limit 1")).rows[0].id;
const extra=[['filler',{}],['filler',{offset:48}],['filler',{offset:1980}],['filler',{sort:'title',offset:24}],['filler',{sort:'newest',offset:48}],['',{size:null,offset:null}],['filler',{size:0}],['filler',{size:-5}],['filler',{size:9999}],['filler',{offset:-5}],['filler',{offset:99999}],['filler',{semester:'Sem 1',type:'Worksheet',platform:'Google Drive'}],['filler',{featured:true}],['Equal',{sort:'title',size:12}],['Equal',{sort:'title',size:12,offset:12}],['filler',{subject}],['filler',{subject,course,topic:'Scale'}],['filler',{subject:otherSubject}],['filler',{offset:3990}],[null,{size:null,offset:null}]];
assert.equal(extra.length,20);
const params=(q,x)=>[q,x.subject??null,x.course??null,x.semester??null,x.topic??null,x.type??null,x.platform??null,x.featured??false,x.sort??'relevance',Object.hasOwn(x,'size')?x.size:48,Object.hasOwn(x,'offset')?x.offset:0];
const call=async(q,x={})=>(await db.query(`select public.search_catalog(query_text=>$1,subject_id_filter=>$2,course_id_filter=>$3,semester_filter=>$4,topic_filter=>$5,document_type_filter=>$6,platform_filter=>$7,featured_filter=>$8,sort_option=>$9,page_size=>$10,page_offset=>$11) result`,params(q,x))).rows[0].result;
// Full scan and weighting are independent of the RPC's candidate union. No
// LIMIT or OFFSET: this is the unpaginated expected order and total.
const ref=`with vectors as (
 select d.id,d.title,d.created_at,d.is_featured,d.subject_id,d.course_id,d.semester,d.topic,d.document_type,d.platform,
 setweight(to_tsvector('simple',d.title),'A') || setweight(to_tsvector('simple',d.topic || ' ' || public.document_terms(d.keywords) || ' ' || public.document_terms(d.tags)),'B') ||
 setweight(to_tsvector('simple',s.name || ' ' || coalesce(c.name,'') || ' ' || coalesce(d.semester,'') || ' ' || d.document_type || ' ' || d.platform),'C') || setweight(to_tsvector('simple',d.description),'D') as vector
 from public.documents d join public.subjects s on s.id=d.subject_id left join public.courses c on c.id=d.course_id where d.publication_status='published'), ranked as (
 select v.*,ts_rank(v.vector,websearch_to_tsquery('simple',left(btrim(coalesce($1,'')),200))) rank from vectors v
 where (btrim(coalesce($1,''))='' or v.vector @@ websearch_to_tsquery('simple',left(btrim(coalesce($1,'')),200)))
 and ($2::uuid is null or v.subject_id=$2) and ($3::uuid is null or v.course_id=$3) and ($4::text is null or v.semester=$4)
 and ($5::text is null or v.topic=$5) and ($6::text is null or v.document_type=$6) and ($7::text is null or v.platform=$7) and (not coalesce($8::boolean,false) or v.is_featured))
 select id from ranked order by case when $9='title' then title end asc,
 case when $9='newest' then created_at end desc nulls last,
 case when coalesce($9,'relevance') not in ('title','newest') and btrim(coalesce($1,''))<>'' then rank end desc,
 case when coalesce($9,'relevance') not in ('title','newest') and btrim(coalesce($1,''))='' then is_featured end desc, title asc, id asc`;
const reference=async(q,x={})=>(await db.query(ref,params(q,x).slice(0,9))).rows.map(r=>r.id);
// Inspect the actual candidate/re-filter CTE, but compare its complete set to
// the independent full scan. Filters are applied identically to both paths.
let ctes=sql.slice(sql.indexOf('  with parsed as ('),sql.indexOf('  ), ordered as ('))+'  ) select id from filtered order by id';
for(const [name,replacement] of Object.entries({query_text:'$1::text',subject_id_filter:'$2::uuid',course_id_filter:'$3::uuid',semester_filter:'$4::text',topic_filter:'$5::text',document_type_filter:'$6::text',platform_filter:'$7::text',featured_filter:'$8::boolean'})) ctes=ctes.replaceAll(name,replacement);
const candidate=async(q,x)=>(await db.query(ctes,params(q,x).slice(0,8))).rows.map(r=>r.id);
async function verify(q,x,label) {
 const expected=await reference(q,x), result=await call(q,x), candidates=await candidate(q,x);
 assert.deepEqual(candidates,[...expected].sort(),`${label}: full candidate set`);
 assert.equal(result.total,expected.length,`${label}: total`);
 const requested=Object.hasOwn(x,'size')?x.size:48;const size=requested==null?12:Math.max(1,Math.min(requested,48));const offset=Math.max(0,x.offset??0);
 assert.deepEqual(result.documents.map(d=>d.id),expected.slice(offset,offset+size),`${label}: ordered page`);
 console.log('PASS',label,'total',result.total,'returned',result.documents.length);
}
for(let i=0;i<inputs.length;i++) await verify(inputs[i],{},`case ${i+1} ${JSON.stringify(inputs[i].slice(0,40))}`);
for(let i=0;i<extra.length;i++) await verify(extra[i][0],extra[i][1],`extra ${i+1} ${JSON.stringify(extra[i])}`);
for(const [q,x] of [['filler',{}],['Equal',{sort:'title',size:12}]]) {
 const expected=await reference(q,x), joined=[];const size=x.size??48;
 for(let offset=0;offset<expected.length;offset+=size){const page=await call(q,{...x,size,offset});assert.equal(page.total,expected.length);joined.push(...page.documents.map(d=>d.id));}
 assert.equal(new Set(joined).size,expected.length);assert.deepEqual(joined,expected);
 const repeated=await call(q,{...x,size,offset:0});assert.deepEqual(repeated.documents.map(d=>d.id),expected.slice(0,size));
 console.log('ALL PAGES',q,'rows',expected.length,'pages',Math.ceil(expected.length/size),'duplicates',joined.length-new Set(joined).size);
}
await db.exec("set request.jwt.claims='{}'; set role anon;");
for(const role of ['anon','authenticated']) {
 if(role==='authenticated') await db.exec('reset role; set role authenticated;');
 assert.equal((await call('draft')).total,0);
 await assert.rejects(db.query("insert into public.subjects(name,slug) values ('Denied','denied-ordering')"),e=>e.code==='42501');
 console.log('RLS',role,'draft hidden; insert denied 42501');
}
await db.exec('reset role;');
const timings={};
for(const [name,q,x] of [['graviton','graviton',{}],['filler','filler',{}],['deep-page','graviton',{offset:1980}],['selective','kw12',{}],['facet','filler',{semester:'Sem 1',type:'Worksheet',platform:'Google Drive'}]]) {
 for(let i=0;i<2;i++) await call(q,x);
 const samples=[];for(let i=0;i<5;i++){const t=performance.now();await call(q,x);samples.push(+(performance.now()-t).toFixed(2));}
 const sorted=[...samples].sort((a,b)=>a-b);timings[name]={median:sorted[2],min:sorted[0],max:sorted[4],samples};console.log('TIME',name,JSON.stringify(timings[name]));
}
const plans={};
for(const term of ['graviton','kw12']){const r=await db.query(`explain (analyze,buffers,format json) select d.id from public.documents d where d.publication_status='published' and d.search_vector @@ websearch_to_tsquery('simple',$1)`,[term]);plans[term]=r.rows[0]['QUERY PLAN'];console.log('PLAN',term,JSON.stringify(plans[term]));}
await db.exec('set enable_seqscan=off');
for(const term of ['graviton','kw12']){const r=await db.query(`explain (analyze,buffers,format json) select d.id from public.documents d where d.publication_status='published' and d.search_vector @@ websearch_to_tsquery('simple',$1)`,[term]);plans['forced-'+term]=r.rows[0]['QUERY PLAN'];console.log('FORCED PLAN',term,JSON.stringify(plans['forced-'+term]));}
plans.eligible=(await db.query(`explain (analyze,buffers,format json) select d.id from public.documents d where d.search_vector @@ websearch_to_tsquery('simple',$1)`,['kw12'])).rows[0]['QUERY PLAN'];console.log('GIN ELIGIBILITY',JSON.stringify(plans.eligible));await db.exec('reset enable_seqscan');
let body=sql.slice(sql.indexOf('  with parsed as ('),sql.indexOf('\n$$;'));
for(const [name,replacement] of Object.entries({query_text:"'graviton'::text",subject_id_filter:'null::uuid',course_id_filter:'null::uuid',semester_filter:'null::text',topic_filter:'null::text',document_type_filter:'null::text',platform_filter:'null::text',featured_filter:'false',sort_option:"'relevance'::text",page_size:'48',page_offset:'0'})) body=body.replaceAll(name,replacement);
plans.body=(await db.query('explain (analyze,buffers,format json) '+body)).rows[0]['QUERY PLAN'];
const nodes=[];const walk=n=>{nodes.push(n['Node Type']+(n['Index Name']?' '+n['Index Name']:''));for(const child of n.Plans??[])walk(child)};walk(plans.body[0].Plan);console.log('BODY PLAN',JSON.stringify({nodes,execution:plans.body[0]['Execution Time']}));
if(process.env.SEARCH_ORDER_RESULTS) writeFileSync(process.env.SEARCH_ORDER_RESULTS,JSON.stringify({counts,timings,plans},null,2));
console.log('SUMMARY 28 reconstructed cases and 20 extras matched independent full sets, totals and ordered pages');
await db.close();
