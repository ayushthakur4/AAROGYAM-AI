-- AAROGYAM AI: initial wellness data model and owner-only access policies.
-- Wellness searches may contain sensitive information. Keep their retention
-- limited and never copy raw query text into the response cache.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  query text not null check (char_length(btrim(query)) between 1 and 180),
  status text not null default 'pending' check (status in ('pending', 'complete', 'failed')),
  created_at timestamptz not null default now()
);

create table public.wellness_guides (
  id uuid primary key default gen_random_uuid(),
  search_id uuid not null unique references public.searches (id) on delete cascade,
  summary text not null check (char_length(btrim(summary)) > 0),
  safety_note text not null,
  model_version text,
  prompt_version text,
  created_at timestamptz not null default now()
);

create table public.remedies (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.wellness_guides (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  summary text not null default '',
  ingredients jsonb not null default '[]'::jsonb check (jsonb_typeof(ingredients) = 'array'),
  preparation_steps jsonb not null default '[]'::jsonb check (jsonb_typeof(preparation_steps) = 'array'),
  usage_instructions text not null default '',
  precautions jsonb not null default '[]'::jsonb check (jsonb_typeof(precautions) = 'array'),
  sort_order smallint not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create table public.yoga_practices (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.wellness_guides (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  summary text not null default '',
  duration_minutes smallint not null check (duration_minutes between 1 and 240),
  instructions jsonb not null default '[]'::jsonb check (jsonb_typeof(instructions) = 'array'),
  precautions jsonb not null default '[]'::jsonb check (jsonb_typeof(precautions) = 'array'),
  sort_order smallint not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create table public.related_videos (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.wellness_guides (id) on delete cascade,
  youtube_video_id varchar(11) not null check (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null,
  channel_name text not null default '',
  thumbnail_url text not null,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  sort_order smallint not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (guide_id, youtube_video_id)
);

create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  remedy_id uuid references public.remedies (id) on delete cascade,
  yoga_practice_id uuid references public.yoga_practices (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_items_exactly_one_target check (
    (remedy_id is not null and yoga_practice_id is null)
    or (remedy_id is null and yoga_practice_id is not null)
  )
);

-- Opaque HMAC keys avoid storing raw or easily reversible user search text.
-- Only trusted server-side code may access this cache.
create table public.wellness_response_cache (
  cache_key char(64) primary key check (cache_key ~ '^[a-f0-9]{64}$'),
  response_json jsonb not null check (jsonb_typeof(response_json) = 'object'),
  model_version text not null,
  safety_version text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint wellness_response_cache_expiry_after_creation check (expires_at > created_at)
);

create index searches_user_created_at_idx on public.searches (user_id, created_at desc);
create index searches_user_status_idx on public.searches (user_id, status);
create index remedies_guide_sort_idx on public.remedies (guide_id, sort_order);
create index yoga_practices_guide_sort_idx on public.yoga_practices (guide_id, sort_order);
create index related_videos_guide_sort_idx on public.related_videos (guide_id, sort_order);
create index saved_items_user_created_at_idx on public.saved_items (user_id, created_at desc);
create unique index saved_items_user_remedy_unique_idx on public.saved_items (user_id, remedy_id) where remedy_id is not null;
create unique index saved_items_user_yoga_unique_idx on public.saved_items (user_id, yoga_practice_id) where yoga_practice_id is not null;
create index wellness_response_cache_expiry_idx on public.wellness_response_cache (expires_at);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function public.prune_expired_wellness_cache()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_rows integer;
begin
  delete from public.wellness_response_cache where expires_at <= now();
  get diagnostics deleted_rows = row_count;
  return deleted_rows;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.handle_new_user() from public, anon, authenticated, service_role;
revoke all on function public.prune_expired_wellness_cache() from public, anon, authenticated;
grant execute on function public.prune_expired_wellness_cache() to service_role;

alter table public.profiles enable row level security;
alter table public.searches enable row level security;
alter table public.wellness_guides enable row level security;
alter table public.remedies enable row level security;
alter table public.yoga_practices enable row level security;
alter table public.related_videos enable row level security;
alter table public.saved_items enable row level security;
alter table public.wellness_response_cache enable row level security;

revoke all on table public.profiles, public.searches, public.wellness_guides,
  public.remedies, public.yoga_practices, public.related_videos,
  public.saved_items, public.wellness_response_cache from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, delete on table public.searches to authenticated;
grant select on table public.wellness_guides, public.remedies,
  public.yoga_practices, public.related_videos to authenticated;
grant select, insert, delete on table public.saved_items to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage on schema public to authenticated, service_role;

create policy profiles_select_own
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy profiles_update_own
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy searches_select_own
on public.searches for select to authenticated
using (user_id = (select auth.uid()));

create policy searches_insert_own
on public.searches for insert to authenticated
with check (user_id = (select auth.uid()));

create policy searches_delete_own
on public.searches for delete to authenticated
using (user_id = (select auth.uid()));

create policy wellness_guides_select_own
on public.wellness_guides for select to authenticated
using (exists (
  select 1 from public.searches s
  where s.id = wellness_guides.search_id and s.user_id = (select auth.uid())
));

create policy remedies_select_own
on public.remedies for select to authenticated
using (exists (
  select 1
  from public.wellness_guides g
  join public.searches s on s.id = g.search_id
  where g.id = remedies.guide_id and s.user_id = (select auth.uid())
));

create policy yoga_practices_select_own
on public.yoga_practices for select to authenticated
using (exists (
  select 1
  from public.wellness_guides g
  join public.searches s on s.id = g.search_id
  where g.id = yoga_practices.guide_id and s.user_id = (select auth.uid())
));

create policy related_videos_select_own
on public.related_videos for select to authenticated
using (exists (
  select 1
  from public.wellness_guides g
  join public.searches s on s.id = g.search_id
  where g.id = related_videos.guide_id and s.user_id = (select auth.uid())
));

create policy saved_items_select_own
on public.saved_items for select to authenticated
using (user_id = (select auth.uid()));

create policy saved_items_insert_own
on public.saved_items for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (
    (remedy_id is not null and exists (
      select 1
      from public.remedies r
      join public.wellness_guides g on g.id = r.guide_id
      join public.searches s on s.id = g.search_id
      where r.id = saved_items.remedy_id and s.user_id = (select auth.uid())
    ))
    or
    (yoga_practice_id is not null and exists (
      select 1
      from public.yoga_practices y
      join public.wellness_guides g on g.id = y.guide_id
      join public.searches s on s.id = g.search_id
      where y.id = saved_items.yoga_practice_id and s.user_id = (select auth.uid())
    ))
  )
);

create policy saved_items_delete_own
on public.saved_items for delete to authenticated
using (user_id = (select auth.uid()));
