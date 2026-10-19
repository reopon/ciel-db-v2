-- /events/[slug] 用のURLスラッグ。songs.slug(0004)・venues.slug(0009)と同じ方式。

begin;

alter table events add column slug text;

update events
set slug = substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 8)
where slug is null;

alter table events alter column slug set default substr(md5(random()::text || clock_timestamp()::text), 1, 8);
alter table events alter column slug set not null;
alter table events add constraint events_slug_key unique (slug);

commit;
