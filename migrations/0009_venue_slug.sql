-- 会場別ページ(/venues/[slug])用のURLスラッグ。songs.slug(0004)と同じ方式。

begin;

alter table venues add column slug text;

update venues
set slug = substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 8)
where slug is null;

alter table venues alter column slug set default substr(md5(random()::text || clock_timestamp()::text), 1, 8);
alter table venues alter column slug set not null;
alter table venues add constraint venues_slug_key unique (slug);

commit;
