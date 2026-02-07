-- Formly AI - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Organisations
create table organisations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now() not null
);

-- Users (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  organisation_id uuid references organisations(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Forms
create table forms (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations(id) on delete cascade not null,
  name text not null,
  description text,
  status text check (status in ('draft', 'published', 'closed')) default 'draft' not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now() not null
);

-- Questions
create table questions (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references forms(id) on delete cascade not null,
  text text not null,
  type text check (type in ('likert', 'multiple_choice', 'short_text')) not null,
  category text,
  default_weight numeric default 1.0 not null,
  options jsonb,
  order_index integer default 0 not null,
  created_at timestamptz default now() not null
);

-- Segments
create table segments (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references forms(id) on delete cascade not null,
  name text not null,
  weight numeric default 1.0 not null,
  created_at timestamptz default now() not null
);

-- Question-Segment assignments (which questions go to which segments)
create table question_segments (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references questions(id) on delete cascade not null,
  segment_id uuid references segments(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(question_id, segment_id)
);

-- Respondents
create table respondents (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references forms(id) on delete cascade not null,
  segment_id uuid references segments(id) on delete set null,
  email text,
  created_at timestamptz default now() not null
);

-- Responses
create table responses (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references forms(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade not null,
  respondent_id uuid references respondents(id) on delete cascade not null,
  numeric_value numeric,
  text_value text,
  created_at timestamptz default now() not null
);

-- Response flags (for outlier detection)
create table response_flags (
  id uuid primary key default uuid_generate_v4(),
  response_id uuid references responses(id) on delete cascade not null,
  flag_type text not null,
  details text,
  created_at timestamptz default now() not null
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_users_organisation on users(organisation_id);
create index idx_forms_organisation on forms(organisation_id);
create index idx_questions_form on questions(form_id);
create index idx_segments_form on segments(form_id);
create index idx_respondents_form on respondents(form_id);
create index idx_respondents_segment on respondents(segment_id);
create index idx_responses_form on responses(form_id);
create index idx_responses_question on responses(question_id);
create index idx_responses_respondent on responses(respondent_id);
create index idx_question_segments_question on question_segments(question_id);
create index idx_question_segments_segment on question_segments(segment_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table organisations enable row level security;
alter table users enable row level security;
alter table forms enable row level security;
alter table questions enable row level security;
alter table segments enable row level security;
alter table question_segments enable row level security;
alter table respondents enable row level security;
alter table responses enable row level security;
alter table response_flags enable row level security;

-- Organisations: users can only see their own org
create policy "Users can view own organisation"
  on organisations for select
  using (id in (select organisation_id from users where id = auth.uid()));

-- Users: can only see users in same org
create policy "Users can view org members"
  on users for select
  using (organisation_id in (select organisation_id from users where id = auth.uid()));

create policy "Users can insert own record"
  on users for insert
  with check (id = auth.uid());

-- Forms: org-level isolation
create policy "Users can view org forms"
  on forms for select
  using (organisation_id in (select organisation_id from users where id = auth.uid()));

create policy "Users can create org forms"
  on forms for insert
  with check (organisation_id in (select organisation_id from users where id = auth.uid()));

create policy "Users can update org forms"
  on forms for update
  using (organisation_id in (select organisation_id from users where id = auth.uid()));

create policy "Users can delete org forms"
  on forms for delete
  using (organisation_id in (select organisation_id from users where id = auth.uid()));

-- Questions: access through form ownership
create policy "Users can view form questions"
  on questions for select
  using (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

create policy "Users can create form questions"
  on questions for insert
  with check (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

create policy "Users can update form questions"
  on questions for update
  using (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

create policy "Users can delete form questions"
  on questions for delete
  using (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

-- Segments: access through form ownership
create policy "Users can view form segments"
  on segments for select
  using (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

create policy "Users can create form segments"
  on segments for insert
  with check (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

create policy "Users can update form segments"
  on segments for update
  using (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

create policy "Users can delete form segments"
  on segments for delete
  using (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

-- Question segments: access through form ownership
create policy "Users can view question segments"
  on question_segments for select
  using (question_id in (select id from questions where form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid()))));

create policy "Users can create question segments"
  on question_segments for insert
  with check (question_id in (select id from questions where form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid()))));

create policy "Users can delete question segments"
  on question_segments for delete
  using (question_id in (select id from questions where form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid()))));

-- Respondents: access through form ownership
create policy "Users can view form respondents"
  on respondents for select
  using (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

create policy "Users can create form respondents"
  on respondents for insert
  with check (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

create policy "Users can update form respondents"
  on respondents for update
  using (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

create policy "Users can delete form respondents"
  on respondents for delete
  using (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

-- Responses: public insert (for respondents), org-level read
create policy "Anyone can submit responses to published forms"
  on responses for insert
  with check (form_id in (select id from forms where status = 'published'));

create policy "Users can view form responses"
  on responses for select
  using (form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid())));

-- Response flags: org-level access
create policy "Users can view response flags"
  on response_flags for select
  using (response_id in (select id from responses where form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid()))));

create policy "Users can create response flags"
  on response_flags for insert
  with check (response_id in (select id from responses where form_id in (select id from forms where organisation_id in (select organisation_id from users where id = auth.uid()))));

-- ============================================
-- PUBLIC ACCESS for respondents
-- ============================================

-- Allow anonymous users to read published forms (for response collection)
create policy "Anyone can view published forms"
  on forms for select
  using (status = 'published');

-- Allow anonymous users to read questions of published forms
create policy "Anyone can view published form questions"
  on questions for select
  using (form_id in (select id from forms where status = 'published'));

-- Allow anonymous users to read segments of published forms
create policy "Anyone can view published form segments"
  on segments for select
  using (form_id in (select id from forms where status = 'published'));

-- Allow anonymous users to create respondent records for published forms
create policy "Anyone can become a respondent on published forms"
  on respondents for insert
  with check (form_id in (select id from forms where status = 'published'));

-- ============================================
-- FUNCTION: Auto-create org and user on signup
-- ============================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  new_org_id uuid;
begin
  -- Create a default organisation for the user
  insert into public.organisations (name)
  values (coalesce(new.raw_user_meta_data->>'organisation_name', split_part(new.email, '@', 2)))
  returning id into new_org_id;

  -- Create the user record
  insert into public.users (id, email, organisation_id)
  values (new.id, new.email, new_org_id);

  return new;
end;
$$;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
