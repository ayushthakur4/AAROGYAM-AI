import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { PGlite } from '@electric-sql/pglite'

const userOne = '11111111-1111-4111-8111-111111111111'
const userTwo = '22222222-2222-4222-8222-222222222222'
const searchOne = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const searchTwo = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const guideOne = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const guideTwo = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
const remedyOne = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
const remedyTwo = 'ffffffff-ffff-4fff-8fff-ffffffffffff'

let database

async function useRole(role, userId = '') {
  await database.exec(`reset role; set role ${role}; select set_config('request.jwt.claim.sub', '${userId}', false);`)
}

beforeAll(async () => {
  database = new PGlite()
  await database.exec(`
    create role anon;
    create role authenticated;
    create role service_role with bypassrls;
    create schema auth;
    create table auth.users (
      id uuid primary key,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create function auth.uid()
    returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  `)

  const migrationNames = [
    '20261122131000_initial_wellness_schema.sql',
    '20261122142000_save_wellness_guide_rpc.sql',
  ]
  for (const migrationName of migrationNames) {
    const migrationPaths = [
      resolve(process.cwd(), 'supabase/migrations', migrationName),
      resolve(process.cwd(), '../supabase/migrations', migrationName),
    ]
    const migrationPath = migrationPaths.find(existsSync)
    if (!migrationPath) throw new Error(`Could not locate migration ${migrationName}.`)
    await database.exec(await readFile(migrationPath, 'utf8'))
  }
  await database.exec(`
    insert into auth.users (id, raw_user_meta_data) values
      ('${userOne}', '{"display_name":"User One"}'),
      ('${userTwo}', '{"display_name":"User Two"}');

    insert into public.searches (id, user_id, query, status) values
      ('${searchOne}', '${userOne}', 'common cold', 'complete'),
      ('${searchTwo}', '${userTwo}', 'headache', 'complete');

    insert into public.wellness_guides (id, search_id, summary, safety_note) values
      ('${guideOne}', '${searchOne}', 'Guide one summary', 'Guide one safety note'),
      ('${guideTwo}', '${searchTwo}', 'Guide two summary', 'Guide two safety note');

    insert into public.remedies (id, guide_id, title) values
      ('${remedyOne}', '${guideOne}', 'User one remedy'),
      ('${remedyTwo}', '${guideTwo}', 'User two remedy');
  `)
}, 30000)

beforeEach(async () => {
  await database.exec("reset role; select set_config('request.jwt.claim.sub', '', false);")
})

afterAll(async () => {
  await database?.close()
})

describe('Supabase schema and row ownership', () => {
  it('creates a profile from each auth.users insert', async () => {
    const result = await database.query('select id, display_name from public.profiles order by id')
    expect(result.rows).toEqual([
      { id: userOne, display_name: 'User One' },
      { id: userTwo, display_name: 'User Two' },
    ])
  })

  it('shows each authenticated user only their own searches, guide, and remedies', async () => {
    await useRole('authenticated', userOne)
    expect((await database.query('select query from public.searches')).rows).toEqual([{ query: 'common cold' }])
    expect((await database.query('select summary from public.wellness_guides')).rows).toEqual([{ summary: 'Guide one summary' }])
    expect((await database.query('select title from public.remedies')).rows).toEqual([{ title: 'User one remedy' }])

    await useRole('authenticated', userTwo)
    expect((await database.query('select query from public.searches')).rows).toEqual([{ query: 'headache' }])
    expect((await database.query('select title from public.remedies')).rows).toEqual([{ title: 'User two remedy' }])
  })

  it('rejects inserting a search under another user id', async () => {
    await useRole('authenticated', userOne)
    await expect(database.query(
      "insert into public.searches (user_id, query) values ($1, 'not my search')",
      [userTwo],
    )).rejects.toMatchObject({ code: '42501' })
  })

  it('allows saving an owned remedy and rejects saving another user’s remedy', async () => {
    await useRole('authenticated', userOne)
    await database.query('insert into public.saved_items (user_id, remedy_id) values ($1, $2)', [userOne, remedyOne])
    expect((await database.query('select remedy_id from public.saved_items')).rows).toEqual([{ remedy_id: remedyOne }])

    await useRole('authenticated', userTwo)
    await expect(database.query('insert into public.saved_items (user_id, remedy_id) values ($1, $2)', [userTwo, remedyOne]))
      .rejects.toMatchObject({ code: '42501' })
  })

  it('denies anonymous reads and checks the saved-item target constraint', async () => {
    await useRole('anon')
    await expect(database.query('select * from public.searches')).rejects.toMatchObject({ code: '42501' })
    await expect(database.query('select * from public.wellness_response_cache')).rejects.toMatchObject({ code: '42501' })

    await database.exec('reset role')
    await expect(database.query('insert into public.saved_items (user_id) values ($1)', [userOne]))
      .rejects.toMatchObject({ code: '23514' })
  })

  it('lets the service role prune expired cache rows', async () => {
    await database.exec(`
      insert into public.wellness_response_cache (cache_key, response_json, model_version, safety_version, created_at, expires_at)
      values (
        repeat('a', 64), '{"summary":"generic sample"}'::jsonb, 'test-model', 'test-safety',
        now() - interval '2 days', now() - interval '1 day'
      );
    `)
    await useRole('service_role')
    const result = await database.query('select public.prune_expired_wellness_cache() as deleted')
    expect(result.rows[0].deleted).toBe(1)
  })

  it('saves an authenticated guide atomically and returns its owned item IDs', async () => {
    await useRole('authenticated', userOne)
    const guide = {
      summary: 'A gentle general wellness guide.',
      safety_note: 'General information only.',
      model_version: 'test-model',
      remedies: [{ title: 'Warm drink', summary: 'A simple comfort.', ingredients: [], steps: ['Prepare gently'], usage: 'As desired', precautions: [] }],
      yoga: [{ title: 'Restful pose', summary: 'A gentle stretch.', duration_minutes: 3, steps: ['Move gently'], precautions: [] }],
      videos: [],
    }
    const result = await database.query('select public.save_wellness_guide($1, $2::jsonb) as saved', ['sleep routine', JSON.stringify(guide)])
    const saved = result.rows[0].saved
    expect(saved.remedyIds).toHaveLength(1)
    expect(saved.yogaIds).toHaveLength(1)
    expect((await database.query('select query, status from public.searches where id = $1', [saved.searchId])).rows).toEqual([{ query: 'sleep routine', status: 'complete' }])
    expect((await database.query('select title from public.remedies where id = $1', [saved.remedyIds[0]])).rows).toEqual([{ title: 'Warm drink' }])
  })

  it('rejects anonymous execution and invalid or oversized guide payloads', async () => {
    await useRole('anon')
    await expect(database.query("select public.save_wellness_guide('topic', '{}'::jsonb)")).rejects.toMatchObject({ code: '42501' })
    await useRole('authenticated', userOne)
    await expect(database.query("select public.save_wellness_guide('topic', '{}'::jsonb)")).rejects.toMatchObject({ code: '22023' })
  })
})
