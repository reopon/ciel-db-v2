-- Gran☆Ciel setlist DB schema (renewal)
--
-- Design note: `setlists` rows are songs only. MC / non-song segments
-- (talk corners, encores, wardrobe changes, ...) are not separate rows;
-- they are stored as free text attached to the adjacent song via
-- `note_before` / `note_after`. This means the song's position in an
-- event ("order") is always a clean, gapless song count with no need to
-- skip non-song rows when numbering.

create table if not exists songs (
  id bigint generated always as identity primary key,
  title text not null,
  release_date date not null,
  lyricist text,
  composer text,
  arranger text,
  choreographer text,
  notes text
);

create table if not exists events (
  id bigint generated always as identity primary key,
  event_name text not null,
  date date not null,
  location text,
  notes text
);

create table if not exists setlists (
  id bigint generated always as identity primary key,
  event_id bigint not null references events (id) on delete cascade,
  song_id bigint not null references songs (id) on delete restrict,
  "order" integer not null,
  note_before text,
  note_after text,
  unique (event_id, "order")
);

create index if not exists setlists_event_id_idx on setlists (event_id);
create index if not exists setlists_song_id_idx on setlists (song_id);
create index if not exists events_date_idx on events (date desc);
