-- One-time, additive import of the 22 curated Class 12 papers. Not a seed.
-- Existing records are never overwritten. Run only after reviewing the target project.
begin;
insert into public.subjects (name, slug) values ('Mathematics', 'mathematics') on conflict (slug) do nothing;
insert into public.courses (name, slug) values ('Class 12', 'class-12') on conflict (slug) do nothing;
insert into public.documents (
  slug, title, description, original_url, platform, subject_id, course_id,
  topic, document_type, keywords, tags, is_featured, publication_status
)
select
  'maths-paper-' || lpad(n::text, 2, '0'),
  case when n = 1 then 'Class 12 Mathematics — CBSE Exam Paper 2026'
       when n = 2 then 'Class 12 Mathematics — CBSE Exam Paper 2025'
       else 'Class 12 Mathematics — Sample Paper ' || lpad((n - 2)::text, 2, '0') end,
  case when n <= 2 then 'A Class 12 mathematics CBSE exam paper for independent practice. Download the PDF to study offline.'
       else 'A Class 12 mathematics sample paper for independent practice. Download the PDF to study offline.' end,
  'https://github.com/hh6762907-png/Nodia-/raw/9ced0726e2f242b5e5567c6e626d77d34fdc1054/extracted_papers/Paper_' || lpad(n::text, 2, '0') || '.pdf',
  'Other', s.id, c.id,
  case when n <= 2 then 'CBSE exam paper' else 'Sample paper' end,
  'Practice questions',
  array['mathematics','maths','class 12','cbse','paper', case when n <= 2 then 'exam' else 'sample' end],
  array['mathematics','class-12', case when n <= 2 then 'exam-paper' else 'sample-paper' end],
  n <= 3, 'published'
from generate_series(1,22) n
cross join public.subjects s cross join public.courses c
where s.slug = 'mathematics' and c.slug = 'class-12'
on conflict (slug) do nothing;
commit;
