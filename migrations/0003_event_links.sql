-- Related URLs per event (X posts, blog articles, etc.), shown on the
-- event card with an OGP preview. New table, so it's the same for both a
-- fresh project (after 0001) and the existing project (after 0002).

create table if not exists event_links (
  id bigint generated always as identity primary key,
  event_id bigint not null references events (id) on delete cascade,
  url text not null,
  "order" integer not null default 0
);

create index if not exists event_links_event_id_idx on event_links (event_id);

alter table event_links enable row level security;
create policy "Public read access" on event_links for select using (true);
create policy "Public write access" on event_links for all using (true) with check (true);
