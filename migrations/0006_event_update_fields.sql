-- スキーマ追従: ライブDBの events には created_at / upteded_at / stage_costume が
-- 既にSQL Editorから手動で追加済みだが、どのmigrationファイルにも反映されていなかった。
-- 新規インストール(0001から積む場合)でもライブDBと同じ形になるよう追従させる。
--
-- 注意: upteded_at はタイポではなく実際のライブカラム名。リネームはここではやらない
-- (コード側の参照箇所を洗い出す必要があり、イベント編集機能の追加とは別作業のため)。
--
-- stage_costume はそのライブの衣装(メンバーの自撮り等から後で手動入力)を記録する列。

alter table events add column if not exists created_at timestamptz not null default now();
alter table events add column if not exists upteded_at timestamptz;
alter table events add column if not exists stage_costume text;
