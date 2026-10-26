-- Adds a per-song annotation column to setlists, distinct from
-- note_before/note_after (which are MC/commentary shown before/after a
-- song). `note` is meant to be displayed alongside the song title itself,
-- e.g. "曲名 (メドレーver.)".
--
-- Historical context: the original (pre-0002) setlists schema had a
-- `notes` column with exactly this meaning, but the 0002 migration folded
-- it into note_after when rebuilding the table, conflating "title
-- annotation" with "MC after this song". This column restores the
-- original concept under its own name. Backfilling existing rows (some
-- note_after values like "メドレーver." / "Acoustic ver." are really this)
-- is being done by hand — not part of this migration.

alter table setlists add column if not exists note text;
