# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Gran☆Ciel(アイドルグループ)のセットリストアーカイブサイト。旧 [ciel-db](https://github.com/reopon/ciel-db) のスクラッチリニューアル版。本番は Vercel (ciel-live.vercel.app)、データは Supabase (Postgres) + `@supabase/supabase-js`。

サイトの目的: Gran☆Cielに興味を持つ人を増やし、好きになってもらい、2027年1月31日のワンマンに興味を持ってもらい、来てもらう人を増やすこと。機能追加・デザイン判断はこの目的に資するかどうかで評価する。

## Commands

```bash
npm run dev     # 開発サーバー (next dev)
npm run build   # 本番ビルド (next build) — Vercel と同じ静的生成チェックが走るので、Supabase を触るページを増やしたら必ずローカルでも通すこと
npm run lint     # eslint
```

テストは未整備(テストコマンドなし)。初回セットアップは `.env.example` を `.env.local` にコピーし `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `ADMIN_PASSWORD` を設定(前者2つは `NEXT_PUBLIC_` プレフィックスなし — サーバー専用、ブラウザには出さない)。新規 Supabase プロジェクトなら `migrations/0001_init.sql` を SQL Editor で実行。

## Architecture

### データ取得/更新の分離
- 読み取りは Server Components(`src/app/**/page.tsx` 内で直接 `getSupabaseClient()` を呼ぶ)
- 書き込みは Server Actions(`src/actions/*.ts`、`"use server"`)
- `"use server"` ファイルは async 関数のみ export 可能。型や定数(`ActionState` / `initialActionState` など)は `src/lib/action-state.ts` のような別ファイルに置く。

### setlists は曲のみの行、MC等は隣接する曲のnote
これが旧版からの最大の設計変更(README参照)。`setlists` の1行は常に曲1つ。MC・衣装換え・アンコール等の曲以外の演目は独立した行を持たず、直前/直後の曲の `note_before` / `note_after` に文字列として格納する。これにより `order` カラムがそのまま欠番のない曲番号になり、「曲以外はカウントしない」ロジックが各画面に重複することがない。同じ2曲の間に複数の区切りがある場合は `note_after` に `"MC / 衣装換え"` のようにスラッシュ区切りでまとめる。

新しいテキストから setlist 行を組み立てるロジック(タイトル不一致の行を前後の note に畳み込む処理)は `src/lib/setlist-parser.ts` の `buildSetlistEntries` に集約されており、`/import`(`importSetlistAction`)と `/register`(`registerEventAction`、現在ナビから隠しているが残存)の両方がこれを共有する。

### スキーマ(`migrations/*.sql`が正、順に適用)
- `songs`: id, slug(ランダム8文字、URL用、`/music/[slug]`), title, release_date, lyricist, composer, arranger, choreographer, notes, **is_repertoire**(bool — `/music` の一覧に出す「持ち曲」かどうかのフラグ。生誕イベント等で数回しかやらないカバー曲を除外するためのもので、「カバー曲かどうか」とは別概念。**このカラムは migrations に SQL ファイルがなく、SQL Editor から直接追加されたもの**なので、スキーマの実態は Supabase 側が正、migrations ディレクトリだけを見ても追いつかない場合がある)
- `events`: id, event_name, date, venue_id(`venues` へのFK。表記ゆれ対策で`0008`より前は自由記述の`location`だった), notes
- `venues`: id, name(unique), slug(ランダム8文字、`0009_venue_slug.sql`で追加、`/venues/[slug]`用) — `0008_venues.sql` で `events.location` から名寄せして移行。同じビル内でも別フロア/別ステージは別会場として区別している(例: GOTANDA G4とG7)。`events.location` カラム自体は突き合わせ用にまだ残っている(アプリ側はもう参照しない、削除は検証後に別migrationで行う予定)。新規会場の作成は `src/lib/events.ts` の `findOrCreateVenueId`(名前で検索→無ければinsert)を通す。
- `setlists`: id, event_id, song_id, order(欠番なしの曲番号), note_before, note_after
- `event_links`: id, event_id, url, order — イベントに紐づくX投稿/ブログ等のURL、OGPプレビュー表示用
- `events` には他に created_at, updated_at(`0006`追従時は `upteded_at` というタイポだったが`0007`でリネーム済み), stage_costume(その回の衣装。メンバーの自撮り等から手動入力、随時埋めていく運用)もある。もともと SQL Editor から直接追加されたもので migration には無かったが、`0006_event_update_fields.sql` で追従済み。
- `about_entries`: id, title(nullable), body, is_visible, order — `/about` の表示内容。1行1セクションで、`is_visible=true` のものを `order` 昇順で表示する。`body` 内の素のURLは `src/app/about/page.tsx` の `linkify` がそのままリンク化する(記法なし)。編集はSupabaseのTable Editorから直接行う想定で、サイト側に編集UIはない。
- 新規/リネーム後のテーブルは RLS ポリシーを引き継がない。テーブルを追加・再作成したら必ず `enable row level security` + 読み書きポリシーをセットで追加すること(0002, 0003 で実際に踏んだ地雷)。

### Vercel ビルドの静的生成に注意
Supabase を読むページは `export const dynamic = "force-dynamic"` を必ず付ける。`export const revalidate = 0` では不十分で、Vercel本番ビルドだけが静的生成を試みて `supabaseUrl is required` で失敗する(ローカル `next build` では再現しない)。新しくページを追加したら既存ページに揃えてこれを付ける。

### インポート経路
- `/import`: `#しえるセットリスト` 形式のテキストを貼り付けて `parseImportText` で日付/会場/曲リストに分解し登録。X投稿URLを貼ると `src/lib/twitter-oembed.ts`(公開oEmbedエンドポイント、APIキー不要、1件のURLのみ対応)で本文を取得してテキスト欄に流し込める。
- `/register`: 1行1曲手入力フォーム。現在ナビ(`src/app/layout.tsx` の `navLinks`)からは外しているが、ソース・ルートとも削除していない。会場は `<input list>` + `<datalist>` で既存 `venues` をオートコンプリートしつつ自由入力も可能(`findOrCreateVenueId` が同名なら再利用、無ければ新規作成)。ページ自体は Server Component(`fetchVenuesForPicker` 用)、フォーム部分だけ `src/components/RegisterForm.tsx` に切り出したクライアントコンポーネント。
- `src/lib/ogp.ts`: イベントリンクのOGPプレビュー用に `<meta property="og:...">` を正規表現で抜くだけの軽量スクレイパー(外部HTMLパーサ依存なし)。

### イベント編集(`/events/edit`, `/events/[id]/edit`)
`/import`・`/register` が新規作成専用なのに対し、こちらは既存イベントを後から更新するための経路(「先にイベントを登録→開催後にセットリストを埋める」運用のため)。`src/app/(admin)/` ルートグループ配下にあり、`(admin)/layout.tsx` が `ADMIN_PASSWORD`(簡易パスワード、Supabaseの書き込みRLSが元々anonキーに開放されているためUIへの軽い鍵でしかないことに注意)によるクッキー認証をかけている。`/events/edit` はID or 日付でイベントを検索(`<form method="get">`、Server Action不要)、`/events/[id]/edit` が本体フォーム。保存(`src/actions/event-edit.ts` の `updateEventAction`)はセットリスト・関連URLとも**差分更新ではなく全削除→再insert**という割り切った実装(低頻度の個人管理ツールのため)。ナビゲーションには出していない(`/register` と同じ扱い)。

### 会場別ページ(`/venues`, `/venues/[slug]`)
`/music`・`/music/composers` 等と同じ構造。一覧(`/venues`)は `fetchVenuesWithEventCounts`(venuesとeventsを別クエリで取得してJS側でカウント集計、`groupByYearMonth`等と同じ「単純な集計はJSでやる」という既存方針を踏襲)で公演数の多い順にテーブル表示、詳細(`/venues/[slug]`)はその会場の `EventCard` を日付降順で並べる(披露履歴のような軽量リストではなく、アーカイブページと同じ「その会場で何が起きたか」が主目的のページなのでフルの `EventCard` を採用)。ナビにも「会場別」として出している(`/music/composers`等とは違い、ユーザー自身が要望した導線のため)。

### デザイントークン
`src/app/globals.css` に Option A "Cool Precision"(紺/白/エレクトリックブルー)パレットを `:root` / `.dark` で定義、`--brand` が強調色。フォントは `next/font/google` 経由で Oswald(`--font-oswald` / `font-display`、見出し用)と Zen Kaku Gothic New(`--font-zen-kaku-gothic-new` / `font-sans`、本文用)。リンクは `text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand` で統一し、クリック可否を視覚的に明示する。

### JST日付の扱い
Vercel の関数はUTCで動くため、「今日」をJSTで計算する必要がある箇所(トップページの「今月」判定など)は `src/lib/format.ts` の `todayJstIso()` を使う(`Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", ... })` 方式)。
