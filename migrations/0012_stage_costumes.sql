-- events.stage_costume(自由記述)を stage_costumes テーブルへのFKに正規化。
-- venues(0008)と同じパターン。属性はnameのみ。

begin;

create table if not exists stage_costumes (
  id bigint generated always as identity primary key,
  name text not null unique
);

alter table stage_costumes enable row level security;
create policy "Public read access" on stage_costumes for select using (true);
create policy "Public write access" on stage_costumes for all using (true) with check (true);

insert into stage_costumes (name) values
  ('はじまりのパレード衣装'),
  ('2024夏衣装'),
  ('We Can衣装'),
  ('2025夏衣装'),
  ('夜明けのBrave衣装'),
  ('2026夏衣装'),
  ('Never End衣装');

alter table events add column if not exists stage_costume_id bigint references stage_costumes (id);
create index if not exists events_stage_costume_id_idx on events (stage_costume_id);

-- 既存データのバックフィル(確認時点で "We Can衣装" のみ2件が該当)。
update events e
set stage_costume_id = sc.id
from stage_costumes sc
where e.stage_costume = sc.name;

commit;

-- events.stage_costume(自由記述カラム)はvenuesの時と同じく突き合わせ用に
-- しばらく残す。アプリ側はもう参照しない。削除は検証後に別migrationで。
