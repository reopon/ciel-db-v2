-- Related external links per song (YouTube videos, MVs, etc.), shown on the
-- song detail page (/music/[slug]) and the song modal. Mirrors event_links
-- (0003) — same shape, same RLS pattern. Rows are managed directly via the
-- Supabase SQL editor/dashboard, same as the songs table itself (there is
-- no admin UI for songs in this app).

create table if not exists song_links (
  id bigint generated always as identity primary key,
  song_id bigint not null references songs (id) on delete cascade,
  url text not null,
  "order" integer not null default 0
);

create index if not exists song_links_song_id_idx on song_links (song_id);

alter table song_links enable row level security;
create policy "Public read access" on song_links for select using (true);
create policy "Public write access" on song_links for all using (true) with check (true);
