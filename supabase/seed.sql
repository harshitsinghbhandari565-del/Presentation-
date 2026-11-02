-- Optional, reviewed seed of the ONE real legacy resource. Run after migration.
-- Idempotent: never overwrites an existing edited resource or category.
begin;
insert into public.subjects(name,slug) values ('English','english') on conflict (slug) do nothing;
insert into public.courses(name,slug) values ('Class 12','class-12') on conflict (slug) do nothing;
insert into public.documents (
  slug,title,description,original_url,platform,subject_id,course_id,topic,document_type,keywords,tags,is_featured,publication_status,presentation_url,embed_url,backup_links
) select
  'english-lost-spring-mcqs','MCQs Practice',
  'MCQs practice presentation for English Chapter 2, The Lost Spring.',
  'https://docs.google.com/presentation/d/1652VXDxhNDAvwRLVOMduFi10BadnKH8R/edit?usp=drivesdk&ouid=113784417699374679691&rtpof=true&sd=true',
  'Google Slides',s.id,c.id,'Ch 2 – The Lost Spring','Presentation',
  array['english','the-lost-spring','mcqs','class-12'],array['english','the-lost-spring','mcqs','class-12'],true,'published',
  'https://docs.google.com/presentation/d/1652VXDxhNDAvwRLVOMduFi10BadnKH8R/present',
  'https://docs.google.com/presentation/d/1652VXDxhNDAvwRLVOMduFi10BadnKH8R/embed?start=false&loop=false&delayms=3000',
  '[{"label":"Backup PPTX","platform":"Dropbox","url":"https://www.dropbox.com/scl/fi/ovqnktu25x7f2oq6txzjr/The_Lost_Spring_MCQs.pptx?rlkey=ethvwy1cuuvdasrn0gxk6p1sg&st=raevvife&dl=0","description":"Backup presentation file if the primary Google Slides link is unavailable."}]'::jsonb
from public.subjects s cross join public.courses c
where s.slug='english' and c.slug='class-12'
on conflict (slug) do nothing;
commit;
