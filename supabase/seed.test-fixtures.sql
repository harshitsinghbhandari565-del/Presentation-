-- TEST FIXTURES ONLY. NOT APPLIED TO HOSTED SUPABASE. NOT REAL RESOURCES.
-- Idempotent local/CI seed used to exercise search ranking and facets at N=16.
-- The original resource seed remains untouched.
begin;
insert into public.subjects(name, slug) values
  ('Fixture Mathematics', 'fixture-mathematics'),
  ('Fixture Science', 'fixture-science'),
  ('Fixture History', 'fixture-history')
on conflict (slug) do nothing;
insert into public.courses(name, slug) values
  ('Fixture Class 10', 'fixture-class-10'),
  ('Fixture Class 12', 'fixture-class-12')
on conflict (slug) do nothing;
insert into public.documents(
  slug, title, description, original_url, platform, subject_id, course_id, semester, topic,
  document_type, keywords, tags, is_featured, publication_status
)
select
  v.slug, v.title, v.description, 'https://example.com/fixtures/' || v.slug, 'Other',
  s.id, c.id, v.semester, v.topic, v.document_type, v.keywords, v.tags, v.featured, 'published'
from (values
  ('fixture-algebra-title', 'Algebra practice worksheet', 'Fixture description about photosynthesis and cells.', 'Fixture Semester 1', 'Algebra', 'Worksheet', array['algebra','practice'], array['fixture','math'], false, 'fixture-mathematics', 'fixture-class-10'),
  ('fixture-algebra-body', 'Geometry notes', 'Fixture description focused on algebra equations and practice.', 'Fixture Semester 1', 'Geometry', 'Notes', array['geometry'], array['fixture','math'], true, 'fixture-mathematics', 'fixture-class-10'),
  ('fixture-algebra-tag', 'Trigonometry reference', 'Fixture description about circles.', 'Fixture Semester 2', 'Trigonometry', 'Reference', array['trigonometry'], array['algebra','fixture'], false, 'fixture-mathematics', 'fixture-class-12'),
  ('fixture-photosynthesis-title', 'Photosynthesis presentation', 'Fixture description about algebra.', 'Fixture Semester 1', 'Photosynthesis', 'Presentation', array['photosynthesis','cells'], array['fixture','science'], true, 'fixture-science', 'fixture-class-10'),
  ('fixture-photosynthesis-body', 'Cell structure notes', 'Fixture description focused on photosynthesis and chlorophyll.', 'Fixture Semester 1', 'Cells', 'Notes', array['cells'], array['fixture','science'], false, 'fixture-science', 'fixture-class-10'),
  ('fixture-photosynthesis-tag', 'Human biology practice questions', 'Fixture description about digestion.', 'Fixture Semester 2', 'Biology', 'Practice questions', array['biology'], array['photosynthesis','fixture'], false, 'fixture-science', 'fixture-class-12'),
  ('fixture-history-title', 'Industrial revolution worksheet', 'Fixture description about trade.', 'Fixture Semester 1', 'Industrial revolution', 'Worksheet', array['industry'], array['fixture','history'], false, 'fixture-history', 'fixture-class-10'),
  ('fixture-history-body', 'Nationalism notes', 'Fixture description focused on the industrial revolution and factories.', 'Fixture Semester 1', 'Nationalism', 'Notes', array['nationalism'], array['fixture','history'], true, 'fixture-history', 'fixture-class-10'),
  ('fixture-history-tag', 'Print culture reference', 'Fixture description about books.', 'Fixture Semester 2', 'Print culture', 'Reference', array['print'], array['industrial revolution','fixture'], false, 'fixture-history', 'fixture-class-12'),
  ('fixture-english-title', 'Lost spring comprehension', 'Fixture description about reading.', 'Fixture Semester 1', 'Reading', 'Worksheet', array['reading'], array['fixture','english'], false, 'english', 'fixture-class-12'),
  ('fixture-english-body', 'Writing skills notes', 'Fixture description focused on comprehension and lost spring.', 'Fixture Semester 1', 'Writing', 'Notes', array['writing'], array['fixture','english'], false, 'english', 'fixture-class-12'),
  ('fixture-english-tag', 'Grammar practice questions', 'Fixture description about sentences.', 'Fixture Semester 2', 'Grammar', 'Practice questions', array['grammar'], array['comprehension','fixture'], true, 'english', 'fixture-class-12'),
  ('fixture-math-featured', 'Featured calculus overview', 'Fixture description about limits.', 'Fixture Semester 2', 'Calculus', 'Presentation', array['calculus'], array['fixture','math'], true, 'fixture-mathematics', 'fixture-class-12'),
  ('fixture-science-featured', 'Featured chemistry overview', 'Fixture description about reactions.', 'Fixture Semester 2', 'Chemistry', 'Presentation', array['chemistry'], array['fixture','science'], true, 'fixture-science', 'fixture-class-12'),
  ('fixture-history-featured', 'Featured civics overview', 'Fixture description about government.', 'Fixture Semester 2', 'Civics', 'Presentation', array['civics'], array['fixture','history'], true, 'fixture-history', 'fixture-class-12'),
  ('fixture-draft-hidden', 'Fixture draft not public', 'Fixture draft description.', 'Fixture Semester 1', 'Drafts', 'Notes', array['draft'], array['fixture'], false, 'fixture-mathematics', 'fixture-class-10')
) as v(slug, title, description, semester, topic, document_type, keywords, tags, featured, subject_slug, course_slug)
join public.subjects s on s.slug = v.subject_slug
join public.courses c on c.slug = v.course_slug
on conflict (slug) do nothing;
update public.documents set publication_status = 'draft' where slug = 'fixture-draft-hidden';
commit;
