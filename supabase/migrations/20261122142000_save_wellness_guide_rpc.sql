-- Save one authenticated guide atomically. The caller can only save for auth.uid().
create function public.save_wellness_guide(p_query text, p_guide jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  new_search_id uuid;
  new_guide_id uuid;
  item jsonb;
  new_item_id uuid;
  remedy_ids uuid[] := array[]::uuid[];
  yoga_ids uuid[] := array[]::uuid[];
begin
  if owner_id is null then raise exception 'Authentication required.' using errcode = '28000'; end if;
  if p_query is null or char_length(btrim(p_query)) not between 1 and 180 then
    raise exception 'Invalid query.' using errcode = '22023';
  end if;
  if jsonb_typeof(p_guide) <> 'object'
    or jsonb_typeof(p_guide -> 'remedies') <> 'array'
    or jsonb_typeof(p_guide -> 'yoga') <> 'array'
    or jsonb_typeof(coalesce(p_guide -> 'videos', '[]'::jsonb)) <> 'array'
    or jsonb_array_length(p_guide -> 'remedies') > 5
    or jsonb_array_length(p_guide -> 'yoga') > 4
    or jsonb_array_length(coalesce(p_guide -> 'videos', '[]'::jsonb)) > 5
    or nullif(btrim(p_guide ->> 'summary'), '') is null
    or nullif(btrim(p_guide ->> 'safety_note'), '') is null then
    raise exception 'Invalid guide.' using errcode = '22023';
  end if;

  insert into public.searches (user_id, query, status)
  values (owner_id, btrim(p_query), 'pending') returning id into new_search_id;
  insert into public.wellness_guides (search_id, summary, safety_note, model_version)
  values (new_search_id, p_guide ->> 'summary', p_guide ->> 'safety_note', p_guide ->> 'model_version')
  returning id into new_guide_id;

  for item in select value from jsonb_array_elements(p_guide -> 'remedies') loop
    insert into public.remedies (guide_id, title, summary, ingredients, preparation_steps, usage_instructions, precautions, sort_order)
    values (
      new_guide_id, item ->> 'title', coalesce(item ->> 'summary', ''),
      coalesce(item -> 'ingredients', '[]'::jsonb), coalesce(item -> 'steps', '[]'::jsonb),
      coalesce(item ->> 'usage', ''), coalesce(item -> 'precautions', '[]'::jsonb),
      cardinality(remedy_ids)
    ) returning id into new_item_id;
    remedy_ids := array_append(remedy_ids, new_item_id);
  end loop;

  for item in select value from jsonb_array_elements(p_guide -> 'yoga') loop
    insert into public.yoga_practices (guide_id, title, summary, duration_minutes, instructions, precautions, sort_order)
    values (
      new_guide_id, item ->> 'title', coalesce(item ->> 'summary', ''),
      (item ->> 'duration_minutes')::smallint, coalesce(item -> 'steps', '[]'::jsonb),
      coalesce(item -> 'precautions', '[]'::jsonb), cardinality(yoga_ids)
    ) returning id into new_item_id;
    yoga_ids := array_append(yoga_ids, new_item_id);
  end loop;

  for item in select value from jsonb_array_elements(coalesce(p_guide -> 'videos', '[]'::jsonb)) loop
    insert into public.related_videos (guide_id, youtube_video_id, title, channel_name, thumbnail_url, sort_order)
    values (
      new_guide_id, item ->> 'id', item ->> 'title', coalesce(item ->> 'channel', ''),
      item ->> 'thumbnail_url', (select count(*)::smallint from public.related_videos where guide_id = new_guide_id)
    );
  end loop;

  update public.searches set status = 'complete' where id = new_search_id;
  return jsonb_build_object('searchId', new_search_id, 'remedyIds', to_jsonb(remedy_ids), 'yogaIds', to_jsonb(yoga_ids));
end;
$$;

revoke all on function public.save_wellness_guide(text, jsonb) from public, anon, authenticated, service_role;
grant execute on function public.save_wellness_guide(text, jsonb) to authenticated;
