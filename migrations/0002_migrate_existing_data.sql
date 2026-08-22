-- Migrates an EXISTING ciel-db Supabase project (old `setlists` schema:
-- item_type / nullable song_id / notes / a single "order" spanning all
-- rows) into the new song-only schema used by ciel-db-v2.
--
-- Do NOT run 0001_init.sql against this project first — `songs` and
-- `events` already exist there with a matching shape, and running 0001
-- would leave the old `setlists` table untouched (it only creates tables
-- that don't already exist). This script replaces `setlists` itself.
--
-- Safety: the old table is renamed to `setlists_v1_backup`, not dropped.
-- After running this and checking the app / row counts look right, you
-- can drop the backup manually:
--   drop table setlists_v1_backup;
--
-- Run this in the Supabase SQL Editor for the ciel-db project.

begin;

alter table setlists rename to setlists_v1_backup;

create table setlists (
  id bigint generated always as identity primary key,
  event_id bigint not null references events (id) on delete cascade,
  song_id bigint not null references songs (id) on delete restrict,
  "order" integer not null,
  note_before text,
  note_after text,
  unique (event_id, "order")
);

-- Walk each event's old rows in their original order and rebuild
-- song-only rows, folding non-song rows (and any stray notes on a song
-- row itself) into the adjacent song's note_before / note_after —
-- mirrors the logic in src/lib/setlist-parser.ts (buildSetlistEntries).
do $$
declare
  ev record;
  row_rec record;
  song_order integer;
  pending_before text;
  last_new_id bigint;
begin
  for ev in select id from events loop
    song_order := 0;
    pending_before := null;
    last_new_id := null;

    for row_rec in
      select * from setlists_v1_backup
      where event_id = ev.id
      order by "order"
    loop
      if row_rec.item_type = 'song' and row_rec.song_id is not null then
        song_order := song_order + 1;
        insert into setlists (event_id, song_id, "order", note_before, note_after)
        values (ev.id, row_rec.song_id, song_order, pending_before, row_rec.notes)
        returning id into last_new_id;
        pending_before := null;
      else
        if last_new_id is not null then
          update setlists
          set note_after = case
            when note_after is null then row_rec.notes
            else note_after || ' / ' || row_rec.notes
          end
          where id = last_new_id;
        else
          pending_before := case
            when pending_before is null then row_rec.notes
            else pending_before || ' / ' || row_rec.notes
          end;
        end if;
      end if;
    end loop;
  end loop;
end $$;

create index if not exists setlists_event_id_idx on setlists (event_id);
create index if not exists setlists_song_id_idx on setlists (song_id);

-- The new table doesn't inherit setlists_v1_backup's RLS policies, so the
-- anon key can't read or write it until we open it back up the same way
-- (register/import insert setlist rows through the anon key too).
alter table setlists enable row level security;
create policy "Public read access" on setlists for select using (true);
create policy "Public write access" on setlists for all using (true) with check (true);

commit;

-- Sanity checks before dropping the backup:
--   select count(*) from setlists;
--   select count(*) from setlists_v1_backup where item_type = 'song';
--   -- these two counts should match
