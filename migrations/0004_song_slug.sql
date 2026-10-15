begin;

alter table songs add column slug text;

update songs
set slug = substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 8)
where slug is null;

alter table songs alter column slug set default substr(md5(random()::text || clock_timestamp()::text), 1, 8);
alter table songs alter column slug set not null;
alter table songs add constraint songs_slug_key unique (slug);

commit;
