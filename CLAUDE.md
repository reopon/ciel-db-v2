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
- `songs`: id, slug(ランダム8文字、URL用、`/music/[slug]`), title, release_date, lyricist, composer, arranger, choreographer, note(`0015_rename_notes_to_note.sql`で`notes`から単数形にリネーム、`setlists.note`と命名を揃えた), **is_repertoire**(bool — `/music` の一覧に出す「持ち曲」かどうかのフラグ。生誕イベント等で数回しかやらないカバー曲を除外するためのもので、「カバー曲かどうか」とは別概念。**このカラムは migrations に SQL ファイルがなく、SQL Editor から直接追加されたもの**なので、スキーマの実態は Supabase 側が正、migrations ディレクトリだけを見ても追いつかない場合がある)
- `events`: id, slug(ランダム8文字、`0010_event_slug.sql`で追加、公開URL`/events/[slug]`用。**管理編集ページ`/events/edit/[slug]`もこのslugを使う**(当初はID方式だったが、ユーザー判断でslug方式に統一)、event_name, date, venue_id(`venues` へのFK。表記ゆれ対策で`0008`より前は自由記述の`location`だった), note(`0015_rename_notes_to_note.sql`で`notes`からリネーム。`EventEditForm`の編集フォームにはあるが読み取り専用の表示箇所は無い)
- `venues`: id, name(unique), slug(ランダム8文字、`0009_venue_slug.sql`で追加、`/venues/[slug]`用) — `0008_venues.sql` で `events.location` から名寄せして移行。同じビル内でも別フロア/別ステージは別会場として区別している(例: GOTANDA G4とG7)。`events.location` カラム自体は突き合わせ用にまだ残っている(アプリ側はもう参照しない、削除は検証後に別migrationで行う予定)。新規会場の作成は `src/lib/events.ts` の `findOrCreateVenueId`(名前で検索→無ければinsert)を通す。
- `setlists`: id, event_id, song_id, order(欠番なしの曲番号), note_before, note_after, note(`0014_setlist_note.sql`で追加。note_before/note_afterが「曲の前後に起きたこと」なのに対し、こちらは曲名自体に添える補足、例: 「曲名 (メドレーver.)」。旧版の`setlists.notes`列はこの意味だったが、`0002`の移行時に`note_after`へ丸ごと統合されてしまっていた〈ユーザー指摘で発覚〉。既存データのうち本来これに該当する値(`note_after`の「メドレーver.」「Acoustic ver.」等)は自動移行せず、ユーザーが目視で`note`に入れ直す方針)

**`note`の表示・編集**: `EventEditForm`のセットリスト各行に「曲名の補足(任意)」欄を追加(曲プルダウンの直下、note_before/note_after欄より上 — タイトルに紐づく情報であることを示す位置)。保存は`updateEventAction`で他のnote同様そのままinsert。表示は`SetlistView.tsx`で曲名リンクの直後に`<span className="text-[10px] text-muted-foreground align-super">`として添える(括弧書きにせず、上付きの小さい文字で目立たせすぎない、という変更前にユーザーに複数案をartifactで見せて選んでもらったデザイン)。`note`は「ある特定の公演でのこの曲の演奏形態」を表すものなので、セットリスト文脈(`SetlistView`)にのみ表示し、曲そのものの情報を見せる`SongModal`・`/music/[slug]`・`SongTable`等には出さない。
- `event_links`: id, event_id, url, order — イベントに紐づくX投稿/ブログ等のURL、OGPプレビュー表示用
- `events` には他に created_at, updated_at(`0006`追従時は `upteded_at` というタイポだったが`0007`でリネーム済み)もある。もともと SQL Editor から直接追加されたもので migration には無かったが、`0006_event_update_fields.sql` で追従済み。
- `stage_costumes`: id, name(unique) — `0012_stage_costumes.sql` で新設、`events.stage_costume`(自由記述)を`stage_costume_id`というFKに正規化(venuesと全く同じパターン)。初期7件を投入済み。属性はnameのみ(その回の衣装。メンバーの自撮り等から手動入力、随時埋めていく運用)。`events.stage_costume` カラム自体は突き合わせ用にまだ残っている(venuesの`location`と同じ扱い)。新規衣装の作成は `src/lib/events.ts` の `findOrCreateStageCostumeId`(`findOrCreateVenueId`と同型)を通す。
- `events.display_order`(`0011_event_display_order.sql`で追加、nullable integer): 同日に複数イベントがある場合の表示順。`fetchEvents`/`fetchEventsByDate`/`fetchEventsByVenueId` は `date desc → display_order asc(nulls last) → id asc` の順でソートするので、未設定(null)のイベントは常にid順(≒登録順)で後ろに並ぶ。`EventEditForm`の「表示順」欄から編集可能。
- `about_entries`: id, title(nullable), body, is_visible, order — `/about` の表示内容。1行1セクションで、`is_visible=true` のものを `order` 昇順で表示する。`body` 内の素のURLは `src/app/about/page.tsx` の `linkify` がそのままリンク化する(記法なし)。編集はSupabaseのTable Editorから直接行う想定で、サイト側に編集UIはない。
- 新規/リネーム後のテーブルは RLS ポリシーを引き継がない。テーブルを追加・再作成したら必ず `enable row level security` + 読み書きポリシーをセットで追加すること(0002, 0003 で実際に踏んだ地雷)。

### Vercel ビルドの静的生成に注意
Supabase を読むページは `export const dynamic = "force-dynamic"` を必ず付ける。`export const revalidate = 0` では不十分で、Vercel本番ビルドだけが静的生成を試みて `supabaseUrl is required` で失敗する(ローカル `next build` では再現しない)。新しくページを追加したら既存ページに揃えてこれを付ける。

### ページ遷移中のローディング表示(`src/app/loading.tsx`)
全ページが `force-dynamic`(= 毎回Supabaseにfetchしてから描画)なので、遷移が体感できるようルート直下に1つだけ `loading.tsx` を置いている。App RouterはNext.js自身の規約でこれを`layout.tsx`の`children`を包むSuspenseのfallbackとして自動的に使う(個別ページ側は何もしなくてよい)ので、サイト全体の遷移を1ファイルでカバーできる。ヘッダー/ナビは`layout.tsx`側でこのSuspenseの外にあるため遷移中も表示され続け、`main`の中身だけがスピナーに置き換わる。ページ単位で別の `loading.tsx` を置けば、その配下だけ上書きできる。

### インポート経路
- `/import`: `#しえるセットリスト` 形式のテキストを貼り付けて `parseImportText` で日付/会場/曲リストに分解し登録。X投稿URLを貼ると `src/lib/twitter-oembed.ts`(公開oEmbedエンドポイント、APIキー不要、1件のURLのみ対応)で本文を取得してテキスト欄に流し込める。**未来のイベントを先に登録→開催後に各ページの「編集」リンクからセットリストを埋める運用に変わったため、ほぼ使わなくなった機能としてナビから外している**(`/register`と同じ扱い。ソース・ルートとも削除はしていない)。
- `/register`: 1行1曲手入力フォーム。現在ナビ(`src/app/layout.tsx` の `navLinks`)からは外しているが、ソース・ルートとも削除していない。会場は `<input list>` + `<datalist>` で既存 `venues` をオートコンプリートしつつ自由入力も可能(`findOrCreateVenueId` が同名なら再利用、無ければ新規作成)。ページ自体は Server Component(`fetchVenuesForPicker` 用)、フォーム部分だけ `src/components/RegisterForm.tsx` に切り出したクライアントコンポーネント。
- `src/lib/ogp.ts`: イベントリンクのOGPプレビュー用に `<meta property="og:...">` を正規表現で抜くだけの軽量スクレイパー(外部HTMLパーサ依存なし)。

### イベント編集(`/events/edit/[id]`)
`/import`・`/register` が新規作成専用なのに対し、こちらは既存イベントを後から更新するための経路(「先にイベントを登録→開催後にセットリストを埋める」運用のため)。`src/app/(admin)/` ルートグループ配下にあり、`(admin)/layout.tsx` が `ADMIN_PASSWORD`(簡易パスワード、Supabaseの書き込みRLSが元々anonキーに開放されているためUIへの軽い鍵でしかないことに注意)によるクッキー認証をかけている。

**ID/日付で検索する専用の入り口ページ(`/events/edit`)は廃止済み**。`EventCard`(カード右上の「編集」)とカレンダーモーダル(パーマリンクの隣の「編集」)の両方に `/events/edit/${event.id}` への直リンクが出るようになり、各ページから直接編集に飛べるようになったため、IDを調べて手打ちする検索フォームは不要になった。これに伴い `src/lib/events.ts` の `fetchEventsByDate`(検索専用だった)も削除し、ログイン後のデフォルトリダイレクト先(`src/actions/admin.ts`)も `/calendar` に変更した。`/events/edit/[id]` の「戻る」リンクも(検索ページが無くなったため)`/calendar` へのリンクに差し替えている。

**`/events/[id]/edit` ではなく `/events/edit/[id]` という構成にしている理由**: 公開ページ`/events/[slug]`と動的セグメント名が競合する(`/events/` 直下の最初の動的セグメントの名前はルートグループをまたいで統一する必要があり、`[slug]` と `[id]` が共存できない)。`npm run build` では検出されないが `npm run dev` で `Error: You cannot use different slug names for the same dynamic path` として起動時エラーになるため、`edit` という静的セグメントを先に挟むことで回避している。

保存(`src/actions/event-edit.ts` の `updateEventAction`)はセットリスト・関連URLとも**差分更新ではなく全削除→再insert**という割り切った実装(低頻度の個人管理ツールのため)。ナビゲーションには出していない(`/register` と同じ扱い)。

**保存後に`<select>`が見た目だけ選択解除される不具合への対処**: `EventEditForm`で保存すると、セットリストの曲プルダウンが「選択してください」に戻って見える不具合をユーザーが実機で発見。調査の結果、**React 19の`<form action={...}>`は、成功したアクションの後に`<select>`要素をSSR/マウント時点のデフォルト値に自動リセットする**(`<input type="text">`等は影響なし、`<select>`限定。保存自体やDBの値は正しいが、画面上の表示だけがリセットされる)。対処として、selectに`ref`を持たせ、`useActionState`の`state`が変化するたびに`useEffect`でDOMの`.value`を正しい値に書き戻している。現在この対処が残っているのは**衣装(`stageCostumeId`)のみ** — 会場・曲名の2つは後述の`<datalist>`化で`<select>`自体をやめたため、この不具合の対象から自然に外れた。

**会場・曲名の入力を`<select>`から`/register`と同じ`<datalist>`方式に統一**: ユーザーが`/register`ページの会場入力(`<input list="venue-options">`、入力しながら候補が出る)を気に入り、`EventEditForm`の会場・セットリストの曲名にも同じUIを要望。
- **会場**: `venueId`(既存選択)+`newVenueName`(新規追加、優先)という2フィールド構成をやめ、`venueName`という1つの自由入力+`<datalist>`に統一(`/register`の`RegisterForm`と全く同じパターン)。サーバー側(`updateEventAction`)も`findOrCreateVenueId`を常に呼ぶだけになり、2フィールドの優先順位ロジックが丸ごと不要になった。
- **曲名**(セットリスト各行): `<select>`(IDで厳密選択)から`<input list="song-options">`(自由入力+`<datalist>`)に変更。ただし曲は`song_id`という外部キーで参照する必要があり、会場のように「無ければ作る」ができない(曲には作詞・作曲等の付随情報があり、タイプミスから空の曲レコードが作られては困るため)。そこで`RowState`に`songTitle`(表示用テキスト)を追加し、入力のたびに`songs`配列を完全一致検索して`songId`を解決する(`EventEditForm.tsx`の`updateRowSongTitle`)。一致しない場合は`songId`が`null`のままとなり、`setlistJson`組み立て時に黙って除外される(未選択行と同じ扱い)だけでは入力したのに消えたように見えて紛らわしいため、`songTitle`はあるのに`songId`が`null`のときだけ「曲名が一致しません」という注意書きを行の下に出す。

### 楽曲ページ(`/music`, `/music/lyricists`, `/music/composers`, `/music/arrangers`, `/music/choreographers`, `/music/[slug]`)
`/music` 配下は「同じ曲コレクションに対するソート/グルーピングの違い」という位置づけで、発表順・作詞別・作曲別・編曲別・振付別の5ビューをタブで束ねている。実装はルートグループ `src/app/music/(collections)/` に `layout.tsx`(共通の見出し「楽曲」+ `MusicTabs`)を置き、5つの `page.tsx` をその中に収める構成(URLはルートグループの影響を受けないので `/music`, `/music/composers` 等そのまま)。`/music/[slug]`(個別曲ページ)はこのグループの外にあり、タブは出ない。

`src/components/MusicTabs.tsx` はクライアントコンポーネントで `usePathname()` によりアクティブなタブを判定する実際の `<Link>` 群(`@radix-ui/react-tabs` 等の新規ライブラリは使っていない — 各「タブ」は別々のURLとしてSSRされる個別ページなので、同一ページ内でパネルを切り替えるタブUIライブラリとは要件が異なるため)。`/music` だけは `pathname === "/music"` の厳密一致、他4タブは `startsWith` で判定している(`/music` を `startsWith` で判定すると他の全タブ用URLもこれにマッチしてしまうバグになるため、意図的に分けている)。

発表順・作詞別・作曲別・編曲別・振付別の5ビューはすべて同じ`src/components/SongTable.tsx`(曲名/作詞/作曲/編曲/振付の列を持つテーブル、フック無しの純粋な表示コンポーネント、`SetlistView`と同じく`onSongClick`をpropで受け取るだけ)を使う。「◯◯別」ページでカード型の専用UIを別に作っていたのをやめ、一覧(発表順)と全く同じtableを使い回す形に統一した(ユーザーの「似たような別のUIがある意味がない」という指摘による)。

- 発表順(`/music`): `fetchRepertoireSongs`(`src/lib/songs.ts`)で`is_repertoire=true`の曲を発売日順に取得し、`src/components/SongListView.tsx`(`SongTable`1つ+モーダル状態を持つだけの薄いClient Component)でそのまま表示。
- 作詞別・作曲別・編曲別・振付別: `src/components/GroupedSongs.tsx`(データ取得のみのServer Component、`field: "composer"|"lyricist"|"arranger"|"choreographer"`でグルーピング)+ `src/components/GroupedSongsView.tsx`(描画とモーダル状態を持つClient Component)の2段構成。グループごとに見出し`「名前 (n曲)」` + その下に`SongTable`を並べる(グループ内では表題フィールドを省略したりせず、発表順と同じ4列をそのまま表示)。グループの並び順は曲数の多い順(`fetchGrouped`内で`.sort((a,b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "ja"))`、同数はあいうえお順でタイブレーク — `fetchVenuesWithEventCounts`と同じパターン)。

モーダルは各ページに1つだけ(`GroupedSongsView`はグループ数だけ`SongTable`を並べても`useSongModal`は1インスタンスだけ、各`SongTable`に同じ`handleSongClick`を渡して共有する — グループごとに別々のモーダルを持たせると表示中のDialogがグループ数だけ無駄に増えるため)。`/music`配下で曲名をクリックすると`/music/[slug]`へ直接遷移せず、`src/components/SongModal.tsx`(`useSongModal`フック + `SongModal`コンポーネント)のモーダルを1枚挟む。これは元々`InteractiveSetlist.tsx`(カレンダー・イベントのセットリスト用)にあった「曲名クリック→モーダル→披露履歴」の「ザップ」パターンをそのまま抽出・共通化したもので、`InteractiveSetlist`自身もこの共有フックを使うようにリファクタ済み。cmd/ctrl/shift+クリックは通常のリンク遷移にフォールバックする(`e.metaKey || e.ctrlKey || e.shiftKey`判定)。

**曲に関連リンクがあることを示すアイコン**: `SongTable`(発表順・各グルーピング共通)の曲名の隣に、`song_links`が1件以上ある曲だけ`lucide-react`の`Link2`アイコンを小さく表示する(押せる必要はなく、あくまで目印)。`src/lib/songs.ts`の`fetchSongIdsWithLinks()`(`song_links`の`song_id`だけ取得してJSの`Set`に、`fetchVenuesWithEventCounts`と同じ「単純な集計はJSでやる」パターン)を`fetchRepertoireSongs()`・`GroupedSongs.tsx`の`fetchGrouped()`それぞれで並列取得し、各曲に`hasLinks: boolean`を合成して`SongTable`に渡す。

いずれもナビには出していない(ハンバーガーメニューにも `/music` 配下の個別ビューは置かず、`/music` 本体からタブで辿る導線のみ — ユーザーの要望通り「メニューには出さない」方針を維持)。

**披露回数順ビューは一旦見送り**: 当初「披露回数順」というソートも検討したが、(1)披露回数データがまだ全件入力しきれておらず不正確、(2)披露回数は曲ごとのページ(`/music/[slug]`)の披露履歴で既に確認できる、(3)「ランキング化」すること自体への抵抗感、という理由でユーザー判断により今回は実装していない。データが揃えば将来的に再検討する余地がある(`fetchSongsWithPerformanceCounts`のような `fetchVenuesWithEventCounts` 同型の集計関数を追加すれば技術的には容易)。

**曲の関連リンク(`song_links`)**: 1曲につき複数の外部リンク(YouTubeのMV等)を持てるよう、`event_links`(0003)と同じ形の `song_links` テーブルを追加(`migrations/0013_song_links.sql`、`song_id`・`url`・`order`、RLSも同じく公開read/write)。`src/lib/songs.ts`の`fetchSongLinks(songId)`で取得し(`order`が予約語なのでevent_linksと同じくJS側でソート)、`/music/[slug]`では直接呼び出し、`SongModal`(クライアント)からは`fetchSongLinksAction`(`src/actions/songs.ts`)経由で呼ぶ。

表示には、元々`EventLinks`/`EventLinksClient`という名前でイベント専用だったOGPプレビューコンポーネントを `LinkPreviewList`/`LinkPreviewListClient` に改名して流用(ロジックは`urls: string[]`を受け取るだけで元々entity非依存だったため、リネームのみで曲にも使える)。`EventCard`・`MonthCalendar`のイベントモーダルは`LinkPreviewList`/`LinkPreviewListClient`に、`/music/[slug]`は`LinkPreviewList`(Server Component)、`SongModal`は`LinkPreviewListClient`(Client Component)を使う。

**曲の編集画面(`/music/edit/[id]`)**: 当初「`songs`テーブル自体に管理画面がない」運用だったが、`song_links`を追加したのを機にユーザーから編集画面が欲しいと要望があり追加した。`/events/edit/[id]`と全く同じ構造で、`(admin)`ルートグループ配下(`src/app/(admin)/music/edit/[id]/page.tsx`)に置くことでパスワード認証も自動的にかかる。静的セグメント`edit`を`[id]`より前に挟む構成も`/events/edit/[id]`と同じで、`/music/[slug]`という既存の動的ルートと衝突しない(このプロジェクトで過去に実際に踏んだ「同じ階層に異なる名前の動的セグメントを共存させるとnext build/next devで壊れる」問題の回避策)。

編集対象は曲の基本情報(曲名・発売日・作詞・作曲・編曲・振付・備考)と関連URL(`song_links`、イベント編集と同じ行ごとの追加/削除/並び替えUI)。`slug`・`is_repertoire`は編集対象外(スコープ外、今回のユーザーの要望は「曲の内容と関連リンク」のみ)。保存は`src/actions/song-edit.ts`の`updateSongAction`で、`songs`テーブルの直接updateと、`song_links`の全削除→再insert(イベント編集の`updateEventAction`と同じ「低頻度の個人管理ツールなので差分更新でなく全置換で割り切る」パターン)。

`EventEditForm`と`SongEditForm`で重複していた`newKey`/`moveItem`/`inputClass`は`src/lib/form-utils.ts`に、`Field`コンポーネントは`src/components/FormField.tsx`に、それぞれ共通化した(2つ目の利用箇所ができたタイミングで初めて抽出 — 1箇所だけの時に先回りして共通化はしない、という既存の設計判断を踏襲)。

「編集」リンクは`/music/[slug]`(戻るリンクと同じ行、右寄せ)と`SongModal`(「この曲の全履歴を見る→」と同じ行、右寄せ)の両方に設置。`EventCard`の「編集」リンクと同じ見た目・同じ`text-xs text-muted-foreground hover:underline`。

**`LinkPreviewCard`のタイトルはtruncateでなくline-clamp-2**: 実際にYouTubeのMVリンクを貼ったところ、長いタイトル("MV(フルサイズ) Gran☆Ciel「はじまりのPARADE」...")がDialog(`DialogContent`は`display:grid`)内で`truncate`(nowrap+ellipsis)されずカード全体が画面幅をはみ出し、モバイルでページ全体が横スクロールしてしまう不具合が実機で発覚した。原因はnowrapテキストの「1行分の内容幅」がgridの暗黙トラック幅を押し広げてしまうこと(`min-w-0`を内側のdivに付けていても、`<a>`自体やgridトラックまでは伝播しない)。`NoteLine`(セットリストのMC note)で過去に同種の横スクロール不具合を「nowrapでなくwrapさせる」方針で直した前例があり、今回も同じ方針で`LinkPreviewCard`のタイトル・descriptionを`truncate`から`line-clamp-2 break-words`に変更(2行で折り返し、幅を強制的に要求しない)、`<a>`にも念のため`min-w-0`を追加して解決。この修正は`EventCard`・`MonthCalendar`・`SongModal`すべてで共有される`LinkPreviewCard`への変更なので、イベント側の関連リンクにも同様に効く。

**YouTubeリンクは`src/lib/ogp.ts`内で専用処理**: 当初は汎用のOGPメタタグスクレイピング(`fetchLinkPreview`の`<meta property="og:...">`パース)に任せていたが、本番で実際にYouTubeのMVリンクを貼ったところサムネイル・タイトルが取得できず、裸のURL表示にフォールバックする不具合が確認された。YouTubeの動画ページは数百KB〜1MB超あり、サーバーサイド(特にデータセンターIP)からの自動フェッチは同意ページへのリダイレクトや`FETCH_TIMEOUT_MS`(5秒)超過が起きやすいため。対処として、URLのhostnameが`youtube.com`/`youtu.be`系かを`isYouTubeUrl`で判定し、該当すればYouTube公式のoEmbedエンドポイント(`https://www.youtube.com/oembed?url=...&format=json`、軽量なJSONでtitle/author_name/thumbnail_urlを返す、まさにリンクプレビュー用途向けのAPI)を先に試す`fetchYouTubeOembed`を使う。oEmbedが失敗した場合(非公開/削除済み動画など)のみ、従来の汎用スクレイピングにフォールバックする。

### 会場別ページ(`/venues`, `/venues/[slug]`)
`/music`・`/music/composers` 等と同じ構造。一覧(`/venues`)は `fetchVenuesWithEventCounts`(venuesとeventsを別クエリで取得してJS側でカウント集計、`groupByYearMonth`等と同じ「単純な集計はJSでやる」という既存方針を踏襲)で公演数の多い順にテーブル表示、詳細(`/venues/[slug]`)はその会場の `EventCard` を日付降順で並べる(披露履歴のような軽量リストではなく、`/events` と同じ「その会場で何が起きたか」が主目的のページなのでフルの `EventCard` を採用)。

**ナビ導線は一度`/events`配下へのタブ統合を検討したが見送り**: `/music`の作曲別等と同じ発想で`/venues`を`/events`のタブに統合し、`/events`自体もカード型からテーブル型に変える計画を一度詳しく設計したが、イベント名は曲名より長く、テーブルの1セルに収めようとすると横スクロールか省略のどちらかを強いられることにユーザーが気づき、この再構成自体を中止した。代わりに、`/events`ページの検索フォーム直下に「会場別に見る →」(`/venues`への)リンクを追加し、ハンバーガーメニューからは「会場別」を削除した(ナビの入り口を`/events`経由の1本化する、という意図は維持しつつ、ページ構造自体は変えない軽量な対応)。

### イベント一覧・カレンダー系ページ(`/events`, `/calendar`, `/calendar/[year]/[month]`)
URL遍歴: 旧「アーカイブ」(`/archive`、検索+月別`EventCard`一覧)は一時的に「カレンダー」(`/calendar`)に改名したが、未来のイベントも載るうえにカレンダーUI自体は無いページだったため体を表しておらず、**検索+月別一覧の機能ごと `/events`(表示名「イベント」)に移設**。`/calendar` は**別物として新設し直し、月間カレンダーグリッド(`MonthCalendar`)が新しい月から順に縦に並ぶだけのページ**にした(検索・`EventCard`一覧は持たない。欲しければ `/events` へ)。各月の見出しは `/calendar/{year}/{month}` へのリンクになっている。`/events` の検索(`q`)は実装上イベント名・会場名・曲名すべてをhaystackに含めている(`event_name`・`venue.name`・`setlist[].song.title` を連結)ので、placeholderもそれに合わせて「イベント名・曲名・会場名で検索」としている。各月セクションにあった「この月だけのページ→」リンクと、年で絞り込む`year`パラメータ・セレクトボックスは使う場面が薄いため削除済み(テキスト検索の`q`のみ)。

旧URLからのリダイレクト(`next.config.ts` の `redirects()`): `/archive` → `/events`(中身の引き継ぎ先)、`/archive/[year]/[month]` → `/calendar/[year]/[month]`(この月別詳細ページ自体はURL・中身とも今回変更していない)。

トップページ(今月)と `/calendar/[year]/[month]` では `MonthCalendar` の前月/次月リンク(`showNav`、デフォルト`true`)を出したままにしている(コンポーネント自身が `/calendar/{year}/{month}` へのリンクを内蔵しているので、矢印をたどって月を遡っても常にカレンダー付きのページに着地する連鎖になる)。一方 `/calendar` の一覧(複数月ぶん)は**スクロールで前後の月に行けるため冗長**として `showNav={false}` で各月の矢印を消している。グリッドは画面幅に収まるようレスポンシブ(`sm:`で余白・文字サイズを変える、横スクロールはさせない)。

`/calendar` は `src/components/CalendarMonthsList.tsx`(クライアントコンポーネント)が本体を担う: **今月を常にページの先頭セクションとして固定**し(今月の見出し行の右に「未来のカレンダーを表示する」トグルボタンを置く)、未来の月は初期状態で非表示、トグルを押すと今月より上に展開される。過去の月は今月の下にそのまま並ぶ(`groupByYearMonth`の降順を利用)。これは「カレンダーを見に来た人がまず今月を見たいはず」という考えで、公演予定が先々まで登録されるようになったことで今月が埋もれないようにするための設計。今月に公演が無くても(`groupByYearMonth`は実績のある月しか返さないため)`grouped.find` のフォールバックで空配列を渡し、必ず今月のセクション自体は表示する。

各日のイベントラベルは `"use client"` の `MonthCalendar` 内でモーダル(`src/components/ui/dialog.tsx`)を開く(ザッピングしたいという要望のため、フルページ遷移にはしていない)。クリックは `href="/events/[slug]"` を持つ実リンクのまま `onClick` で `preventDefault` しているだけなので、Ctrl/Cmd+クリックや右クリック→リンクをコピーは素のリンクとして機能し、SNS等への共有パーマリンクとして `/events/[slug]`(新規・パスワード不要の公開ページ)が独立して成立する。`/events/[slug]` は `(admin)/events/edit/[slug]`(編集用、パスワード保護)とは別物。

モーダルには、パーマリンクの隣に小さく「編集」リンク(`/events/edit/${event.id}`)を置いている。パスワード保護された管理ページへの導線だが、RLSがもともとanonキー書き込みを許可している(= このパスワードはUIの軽い鍵でしかない)という前提に沿って、誰でも踏める場所に出すことを許容している。`EventCard` 自体にも同じ「編集」リンクを `CardAction`(shadcnのcard.tsxに元からあるグリッド配置用プリミティブ、`CardHeader` 内に置くと右上に寄る)で置いているので、`EventCard` を使う全ページ(トップ・`/calendar/[year]/[month]`・`/events`・`/events/[slug]`・`/venues/[slug]`)で編集導線がカード右上に出る。`/events/[slug]` ページ自体が持っていた専用の編集リンクは、`EventCard` 側に出るようになったため重複を避けて削除した。

**注意**: モーダルの中身は `EventCard` をそのまま使わず、`SetlistView` の代わりに `InteractiveSetlist`、`EventLinks` の代わりに `EventLinksClient` で自前に組んでいる。`EventLinks`(OGPプレビュー付きリンクカード)は `async function` のServer Componentで、クライアントコンポーネントのツリーに直接持ち込むと `Only Server Components can be async` でクラッシュするため。

### 関連URLのOGPプレビュー(カード表示をモーダルでも統一)
最初はこの制約を理由にモーダル内は素のURLリンクのみにしていたが、「カードは画像つきなのにモーダルは味気ない」という指摘を受けて統一した。カード描画そのもの(`<img>` + タイトル + description + サイト名)は `src/components/LinkPreviewCard.tsx` に切り出し、純粋な同期コンポーネント(hooksなし)にしてサーバー/クライアント両方から安全に使えるようにしてある:
- `EventLinks`(サーバー、`EventCard`経由で`/events/[slug]`・`/calendar/[year]/[month]`・`/venues/[slug]`等)は従来通り`fetchLinkPreview`を直接awaitしてから`LinkPreviewCard`を並べる。
- `EventLinksClient`(クライアント、`MonthCalendar`のモーダル専用)は`src/actions/link-previews.ts`の`fetchLinkPreviewsAction`(読み取り専用Server Action、`fetchRecentSongPerformancesAction`と同じ理由で存在)をマウント時に呼び、取得が終わるまでは素のURLリンク、終わったら`LinkPreviewCard`に差し替える。

プレビュー画像(`src/components/LinkPreviewImage.tsx`)は`w-20`(80px)から`w-28`(112px)に拡大した。

### 曲名クリックのモーダル化(`src/components/InteractiveSetlist.tsx`)
セットリストの曲名クリックも同じザッピング思想で、`/music/[slug]` へのフルページ遷移の代わりにモーダルで曲情報(発売日・作詞・作曲・編曲・振付。`song` オブジェクトに元から含まれているため追加fetch不要)+ 直近5回の披露履歴(巨大化を避けるため絞っている。`src/lib/songs.ts` の `fetchSongPerformances(songId, limit)`、全件取得が要る `/music/[slug]` 側では `limit` 省略)を表示する。披露履歴の取得は `src/actions/songs.ts` の `fetchRecentSongPerformancesAction`(読み取り専用だが、クライアントコンポーネントから呼ぶために Server Action にしている — 唯一の読み取り用途のServer Action)。

この曲モーダルは `SetlistView`(素の`<Link>`版)をラップした `InteractiveSetlist` が自前でstate管理ごと持っており、**`EventCard`(`/events/[slug]`・`/calendar`・トップページ等、素のページ)と `MonthCalendar` のイベントモーダル(入れ子のDialog)の両方で同じコンポーネントを共用**している(`EventCard`・`MonthCalendar`とも `SetlistView` ではなく `InteractiveSetlist` を使う)。`MonthCalendar` 側は外側のイベントDialogが閉じると `{selected && (...)}` ごとアンマウントされるので、曲モーダルのstateも連動して自然にリセットされる(明示的な後始末コードは不要)。

**注意**: `SetlistView` の `NoteLine`(MC等の備考を表示する `Badge`)は、`src/components/ui/badge.tsx` の `badgeVariants` がデフォルトで `whitespace-nowrap` を持つため、備考テキストが長い(複数曲名を`/`で連結した長いMC note等)とスマホでページ全体が横スクロールする不具合があった。`NoteLine` 側で `whitespace-normal break-words max-w-full` を上書きして対応済み(`/events` のように全期間の`EventCard`を並べるページで、長い備考を持つイベントに当たる確率が上がり顕在化した)。`Badge` 自体の既存利用箇所はここ1箇所のみなので、共通コンポーネント側のデフォルトは変えていない。

### ナビゲーション(`src/app/layout.tsx`, `src/components/HamburgerMenu.tsx`)
ロゴ(Gran☆Ciel)クリックで`/`に戻れるため、ナビ本体(`navLinks`)には「カレンダー」「楽曲」の2つだけを常時表示し、残り(「イベント」「About」)はナビ右端のハンバーガーメニューに畳んでいる。ハンバーガーは `@radix-ui/react-popover`(既存依存、以前は未使用だった)を薄くラップした `src/components/ui/popover.tsx` の上に組んだ `HamburgerMenu`。メニュー項目クリックで自動的に閉じる(`onClick={() => setOpen(false)}`)。「会場別」(`/venues`)は以前はここにもう1項目として出ていたが削除し、`/events`ページ内のリンクからのみ辿れるようにした。

### トップページ(`/`)
見出しは目立たせず「今月の公演」と小さく(`text-sm text-muted-foreground`)表示するだけに留め、その下は `/calendar/[year]/[month]` の今月ページと同じ構成(`MonthCalendar` + `EventCard` 一覧)。最下部の「他の月を見る」は全期間ぶんの月リンクを表示する(件数上限なし)。トップページ自体にはカレンダー一覧ページのような「今月を先頭に固定」の特別な仕組みは不要(そもそも今月しか出していないため)。

月リンクの一覧(`src/lib/events.ts` の `buildMonthLinks(events, excludeKey)` + `src/components/MonthLinksSection.tsx`)はトップページと `/calendar/[year]/[month]` の両方で共用している。`/calendar/[year]/[month]` 側は以前「← カレンダーに戻る」という単一リンクだけだったが、表示中の月を除いた全月へのリンク一覧に差し替えた。ラベルはどちらも「他の月を見る」で統一している(未来のイベントも登録されるようになったため、トップページの「今月以外」にも未来の月が混ざり得る — 「過去の月を見る」というラベルは体を表さなくなった)。

### デザイントークン
`src/app/globals.css` に Option A "Cool Precision"(紺/白/エレクトリックブルー)パレットを `:root` / `.dark` で定義、`--brand` が強調色。フォントは `next/font/google` 経由で Oswald(`--font-oswald` / `font-display`、見出し用)と Zen Kaku Gothic New(`--font-zen-kaku-gothic-new` / `font-sans`、本文用)。リンクは `text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand` で統一し、クリック可否を視覚的に明示する。

### 個別ページのメタデータ・OGP画像(`generateMetadata`, `opengraph-image.tsx`)
`/events/[slug]`・`/music/[slug]` は `generateMetadata` でイベント名/曲名を `title`(`"{名前} | Gran☆Ciel"`)・`description`(日付+会場 / 発売日)として返す。元々ルートレイアウトの静的メタデータ(`Gran☆Ciel Setlists`)しか無く、SNSに貼った共有用URL(`/events/[slug]`)のプレビューが全ページ同じで味気なかったため追加した。

OGP画像(`og:image`)は写真素材を使わず、サイトの配色トークンだけで組んだテキストカード(`src/lib/og-image.tsx` の `renderOgImage({ label, title, meta })`、`next/og` の `ImageResponse`)。ブランド名+カテゴリラベル("SETLIST"/"MUSIC"/"SETLIST ARCHIVE")+タイトル+日付・会場等のmetaの4要素だけのシンプルな構成で、ユーザーに事前承認を得たデザイン。`/events/[slug]/opengraph-image.tsx`・`/music/[slug]/opengraph-image.tsx` がそれぞれのデータで描画し、`src/app/opengraph-image.tsx`(ルート直下)がそれ以外の全ページの既定画像になる(Next.jsのファイル規約上、より深い階層の`opengraph-image`が優先される)。

**フォントはビルド時にバンドルしたファイルを使う(`src/assets/fonts/ZenKakuGothicNew-{Bold,Black}.ttf`、Google Fontsから直接取得したもの)**。`next/font/google`のフォントハンドルはsatori(ImageResponseの内部実装)にそのまま渡せない(satoriは生のフォントバイト列が必要)ため、`fs.readFile`で読み込んでいる(`export const runtime = "nodejs"`が必須、`fs`はedgeランタイムでは使えない)。リクエストごとに `fonts.gstatic.com` へfetchする実装も可能だが、このセッション中に dev サーバーで同ホストへの接続が何度か不安定になったことがあり、外部クローラーからのOGP取得でも同じ不安定さを持ち込みたくなかったためローカルバンドルを選んだ。

`metadataBase`(ルートレイアウトの`metadata`)に本番URL(`https://ciel-live.vercel.app`)を設定している。これが無いと`og:image`等のURLが相対パスのままになり、外部クローラーが解決できない。

既知の制約: 一部のタイトルに含まれる全角チルダ(「～」U+FF5E)がZen Kaku Gothic Newで欠落し、OGP画像上だけ空白になることがある(ページ本体の表示はブラウザのフォールバックフォントで正常)。日本語フォントのチルダ問題と呼ばれる既知の現象で、レイアウトが壊れるような実害は無いため今は許容している。

### JST日付の扱い
Vercel の関数はUTCで動くため、「今日」をJSTで計算する必要がある箇所(トップページの「今月」判定など)は `src/lib/format.ts` の `todayJstIso()` を使う(`Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", ... })` 方式)。
