-- upteded_at は 0006 で追従させた既存カラムのタイポ(正しくは updated_at)。
-- events の更新経路(イベント編集機能)が実際にこのカラムへ書き込むようになり、
-- タイポのまま運用するのは避けたいとのことでリネームする。

alter table events rename column upteded_at to updated_at;
