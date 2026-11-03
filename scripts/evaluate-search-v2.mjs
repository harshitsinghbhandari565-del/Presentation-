// Local-only experiment; does not access hosted Supabase. Run from the repository root.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';
const db=new PGlite();
const root=process.cwd()+'/';
const read=f=>readFileSync(root+f,'utf8');
await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$; grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated; grant usage on schema public to anon, authenticated;`);
for(const f of ['supabase/migrations/202611010001_catalog.sql','supabase/seed.sql','supabase/migrations/202611010002_least_privilege_catalog_grants.sql','supabase/seed.test-fixtures.sql']) await db.exec(read(f));
const sql=read('supabase/migrations/202611020001_search_ranking.sql');
await db.exec(sql);
const match=sql.match(/  \), ordered as \(\n    select f\.\*, row_number\(\) over \(\n      order by\n([\s\S]*?)\n    \) as rn\n    from filtered f\n    order by rn/);
if(!match) throw new Error('Could not identify v1 ordering');
const order=match[1];
const v2=sql.replaceAll('public.search_catalog(', 'public.search_catalog_v2(').replace('  ), filtered as (','  ), filtered as materialized (').replace(match[0], `  ), ordered as (\n    select f.*\n    from filtered f\n    order by\n${order}`).replace(') order by o.rn) from ordered o)', `) order by\n${order.replaceAll('f.','o.')}\n    ) from ordered o)`);
assert.notEqual(v2,sql);assert(!v2.includes('row_number()'));assert(v2.includes('filtered as materialized'));

await db.exec(v2);
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
const items=['akzephyr graviton','akzephyr graviton mathematics worksheet','1','10','Sem 1','Class 10','Class 1','Worksheet','Google Drive','"intro boundary"','algebra OR chemistry','zephyrq -Title','-algebra','','"unterminated','!!!',"'); DROP TABLE public.documents; --",'a'.repeat(300),"it's",'noSuchScaleTermEver','filler','graviton','zephyrq','Fixture Mathematics','Fixture Class 10','mathematics algebra','algebra geometry','"algebra practice"'];
assert.equal(items.length,28);
const orderSql=(alias)=>order.replaceAll('f.',alias+'.');
const oracle=`with vectors as (select d.id,d.slug,d.title,d.created_at,d.is_featured,d.subject_id,d.course_id,d.semester,d.topic,d.document_type,d.platform,
 setweight(to_tsvector('simple',d.title),'A') || setweight(to_tsvector('simple',d.topic || ' ' || public.document_terms(d.keywords) || ' ' || public.document_terms(d.tags)),'B') || setweight(to_tsvector('simple',s.name || ' ' || coalesce(c.name,'') || ' ' || coalesce(d.semester,'') || ' ' || d.document_type || ' ' || d.platform),'C') || setweight(to_tsvector('simple',d.description),'D') as vector
 from public.documents d join public.subjects s on s.id=d.subject_id left join public.courses c on c.id=d.course_id where d.publication_status='published'), q as (select websearch_to_tsquery('simple',left(btrim(coalesce($1,'')),200)) tsq) select count(*)::int as total from vectors v cross join q where (btrim(coalesce($1,''))='' or v.vector @@ q.tsq)`;
const call=async(fn,q,extra={})=>{const r=await db.query(`select public.${fn}(query_text=>$1, subject_id_filter=>$2, course_id_filter=>$3, semester_filter=>$4, topic_filter=>$5, document_type_filter=>$6, platform_filter=>$7, featured_filter=>$8, sort_option=>$9, page_size=>$10,page_offset=>$11) as result`,[q,extra.subject??null,extra.course??null,extra.semester??null,extra.topic??null,extra.type??null,extra.platform??null,extra.featured??false,extra.sort??'relevance',Object.hasOwn(extra,'size')?extra.size:48,Object.hasOwn(extra,'offset')?extra.offset:0]);return r.rows[0].result};
// Independently scan *every* published row; compare exact sets, not just counts.
// The candidate query is extracted from the unchanged migration so it exercises
// its real union and full re-filter. The oracle has no candidate stage.
let ctes=sql.slice(sql.indexOf('  with parsed as ('),sql.indexOf('  ), ordered as ('))+'  ) select id from filtered order by id';
for(const [name,replacement] of Object.entries({query_text:'$1::text',subject_id_filter:'null::uuid',course_id_filter:'null::uuid',semester_filter:'null::text',topic_filter:'null::text',document_type_filter:'null::text',platform_filter:'null::text',featured_filter:'false'})) ctes=ctes.replaceAll(name,replacement);
const oracleIds=oracle.replace('select count(*)::int as total from vectors v','select v.id from vectors v')+' order by v.id';
let mismatches=[];let oracleMismatches=[];
for(const q of items){const a=await call('search_catalog',q);const b=await call('search_catalog_v2',q);const expected=(await db.query(oracleIds,[q])).rows.map(r=>r.id);const candidate=(await db.query(ctes,[q])).rows.map(r=>r.id);const count=expected.length;if(a.total!==count||b.total!==count||JSON.stringify(candidate)!==JSON.stringify(expected))oracleMismatches.push({q,count,candidate:candidate.length,old:a.total,new:b.total});if(JSON.stringify(a)!==JSON.stringify(b))mismatches.push({q,total:a.total,old:a.documents.map(x=>x.slug),new:b.documents.map(x=>x.slug)});console.log('CASE',JSON.stringify(q.slice(0,80)),a.total,count,JSON.stringify(a)===JSON.stringify(b)?'same':'DIFF');}
const subject=(await db.query("select id from public.subjects where slug='fixture-mathematics'")).rows[0].id; const course=(await db.query("select id from public.courses where slug='fixture-class-10'")).rows[0].id; const otherSubject=(await db.query("select id from public.subjects where slug<>'fixture-mathematics' limit 1")).rows[0].id;
const more=[['filler',{}],['filler',{offset:48}],['filler',{offset:1980}],['filler',{sort:'title',offset:24}],['filler',{sort:'newest',offset:48}],['',{size:null,offset:null}],['filler',{size:0}],['filler',{size:-5}],['filler',{size:9999}],['filler',{offset:-5}],['filler',{offset:99999}],['filler',{semester:'Sem 1',type:'Worksheet',platform:'Google Drive'}],['filler',{featured:true}],['Equal',{sort:'title',size:12}],['Equal',{sort:'title',size:12,offset:12}],['filler',{subject}],['filler',{subject,course,topic:'Scale'}],['filler',{subject:otherSubject}],['filler',{offset:3990}],[null,{size:null,offset:null}]];
for(const [q,x] of more){const a=await call('search_catalog',q,x);const b=await call('search_catalog_v2',q,x);const filteredOracle=oracle+" and ($2::uuid is null or v.subject_id=$2) and ($3::uuid is null or v.course_id=$3) and ($4::text is null or v.semester=$4) and ($5::text is null or v.topic=$5) and ($6::text is null or v.document_type=$6) and ($7::text is null or v.platform=$7) and (not coalesce($8::boolean,false) or v.is_featured)";const expectedTotal=(await db.query(filteredOracle,[q,x.subject??null,x.course??null,x.semester??null,x.topic??null,x.type??null,x.platform??null,x.featured??false])).rows[0].total; if(a.total!==expectedTotal||b.total!==expectedTotal) oracleMismatches.push({q,x,expectedTotal,old:a.total,new:b.total});if(JSON.stringify(a)!==JSON.stringify(b))mismatches.push({q,x,total:a.total,old:a.documents.map(x=>x.slug),new:b.documents.map(x=>x.slug)});console.log('EXTRA',JSON.stringify([q,x]),a.total,a.documents.length,b.documents.length,JSON.stringify(a)===JSON.stringify(b)?'same':'DIFF'); if(q==='filler' && (Object.hasOwn(x,'size') || Object.hasOwn(x,'offset'))) { const requested=Object.hasOwn(x,'size')?x.size:48; const size=requested==null?12:Math.max(1,Math.min(requested,48)); const offset=Math.max(0,x.offset??0); assert.equal(a.documents.length,Math.min(size,Math.max(0,4000-offset))); assert.equal(b.documents.length,a.documents.length); assert.equal(a.total,4000) }}
await db.exec(`set request.jwt.claims='{}'; set role anon;`);
for(const fn of ['search_catalog','search_catalog_v2']){const draft=await call(fn,'draft');assert.equal(draft.total,0);assert.equal(draft.documents.some(d=>d.slug==='fixture-draft-hidden'),false);try{await db.query("insert into public.subjects(name,slug) values ('Denied','denied-v2')");throw Error('anon write succeeded')}catch(e){assert.equal(e.code,'42501')}}
await db.exec('reset role; set role authenticated;'); for(const fn of ['search_catalog','search_catalog_v2']) { const r=await call(fn,'draft'); assert.equal(r.total,0);assert.equal(r.documents.some(d=>d.slug==='fixture-draft-hidden'),false); try {await db.query("insert into public.subjects(name,slug) values ('Denied','denied-v2-auth')");throw Error('authenticated write succeeded')}catch(e){assert.equal(e.code,'42501')} } await db.exec('reset role;');
const timings={};
for(const [name,q,x] of [['graviton','graviton',{}],['filler','filler',{}],['deep-page','graviton',{offset:1980}],['selective','kw12',{}],['facet','filler',{semester:'Sem 1',type:'Worksheet',platform:'Google Drive'}]]){
 for(let i=0;i<2;i++){await call('search_catalog',q,x);await call('search_catalog_v2',q,x)}
 const old=[],optimized=[];
 for(let i=0;i<5;i++){for(const v of (i%2?['v2','old']:['old','v2'])){const t=performance.now();await call(v==='old'?'search_catalog':'search_catalog_v2',q,x);(v==='old'?old:optimized).push(performance.now()-t)}}
 const stats=a=>{const s=[...a].sort((a,b)=>a-b);return {median:+s[2].toFixed(2),min:+s[0].toFixed(2),max:+s[4].toFixed(2),samples:a.map(n=>+n.toFixed(2))}};
 timings[name]={query:q,filters:x,old:stats(old),v2:stats(optimized)};console.log('TIME',name,JSON.stringify(timings[name]));
}
const plans={};for(const term of ['graviton','kw12','noSuchScaleTermEver']){const r=await db.query(`explain (analyze,buffers,format json) select d.id from public.documents d where d.publication_status='published' and d.search_vector @@ websearch_to_tsquery('simple',$1)`,[term]);plans[term]=r.rows[0]['QUERY PLAN'];console.log('PLAN',term,JSON.stringify(plans[term]));}
await db.exec('set enable_seqscan=off'); for(const term of ['graviton','kw12']) { const r=await db.query(`explain (analyze,buffers,format json) select d.id from public.documents d where d.publication_status='published' and d.search_vector @@ websearch_to_tsquery('simple',$1)`,[term]); plans['forced-'+term]=r.rows[0]['QUERY PLAN'];console.log('FORCED PLAN',term,JSON.stringify(plans['forced-'+term])); } const gin=await db.query(`explain (analyze,buffers,format json) select d.id from public.documents d where d.search_vector @@ websearch_to_tsquery('simple',$1)`,['kw12']);plans['forced-gin-eligibility']=gin.rows[0]['QUERY PLAN'];console.log('FORCED GIN ELIGIBILITY PLAN',JSON.stringify(plans['forced-gin-eligibility']));await db.exec('reset enable_seqscan');
// Explain the full SQL body: a scalar function EXPLAIN alone hides its internal plan.
for(const [label,source] of [['v1',sql],['v2',v2]]) {
 let body=source.slice(source.indexOf('  with parsed as ('),source.indexOf('\n$$;'));
 for(const [name,replacement] of Object.entries({query_text:"'graviton'::text",subject_id_filter:'null::uuid',course_id_filter:'null::uuid',semester_filter:'null::text',topic_filter:'null::text',document_type_filter:'null::text',platform_filter:'null::text',featured_filter:'false',sort_option:"'relevance'::text",page_size:'48',page_offset:'0'})) body=body.replaceAll(name,replacement);
 const r=await db.query('explain (analyze,buffers,format json) '+body); plans['body-'+label]=r.rows[0]['QUERY PLAN'];
 const nodes=[]; const walk=n=>{nodes.push(n['Node Type']+(n['Index Name']?' '+n['Index Name']:''));for(const child of n.Plans??[])walk(child)};walk(plans['body-'+label][0].Plan);console.log('BODY PLAN',label,JSON.stringify({nodes,execution:plans['body-'+label][0]['Execution Time']}));
}
const output={counts,inputs:items,mismatches,oracleMismatches,timings,plans}; if(process.env.SEARCH_V2_RESULTS) writeFileSync(process.env.SEARCH_V2_RESULTS,JSON.stringify(output,null,2));
console.log('SUMMARY',JSON.stringify({cases:items.length,mismatches:mismatches.length,oracleMismatches:oracleMismatches.length}));
if(mismatches.length) console.log('DIFFS',JSON.stringify(mismatches.slice(0,4)));
await db.close();
