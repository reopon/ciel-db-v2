-- 同日内に複数イベントがある場合の表示順。NULLなら登録順(id順)にフォールバック。

alter table events add column display_order integer;
