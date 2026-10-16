-- /about ページの表示内容をDB管理にする。1行 = 1セクション。
-- title は nullable(先頭の見出しなし導入文のため)。body 内の素のURLは
-- ページ側で自動的にリンク化する(マークダウン等の記法は使わない)。

create table if not exists about_entries (
  id bigint generated always as identity primary key,
  title text,
  body text not null,
  is_visible boolean not null default true,
  "order" integer not null default 0
);

create index if not exists about_entries_order_idx on about_entries ("order");

alter table about_entries enable row level security;
create policy "Public read access" on about_entries for select using (true);
create policy "Public write access" on about_entries for all using (true) with check (true);

-- 既存の about/page.tsx にハードコードされていた内容をそのまま移行
insert into about_entries (title, body, is_visible, "order") values
(
  null,
  'Gran☆Cielのセットリストを記録・整理することを目的とした、非公式・非営利のデータベースサイトです。
楽曲情報もまとめています。
所属事務所やメンバーご本人、関係各所とは一切関係ございません。',
  true,
  1
),
(
  '情報の出典について',
  'Gran☆Ciel公式やメンバー、関係者のSNSなどweb公開情報を参照しています。
また、Wikipediaやファンの方が発信した情報も参考にしています。',
  true,
  2
),
(
  'セットリストの登録状況',
  'ライブイベントのセットリストは、情報を確認できましたら数日以内に登録しています。
過去のデータについては随時、追える範囲で追加していく予定です。',
  true,
  3
),
(
  'お問い合わせ',
  'https://x.com/reopon までご連絡いただければ幸いです。',
  true,
  4
);
