# ciel-db-v2

Gran☆Ciel のセットリストアーカイブサイト。[ciel-db](https://github.com/reopon/ciel-db) のリニューアル版(スクラッチ実装)。

## 技術構成

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix UI)
- Supabase (Postgres)
- データ取得は Server Components、更新は Server Actions で行う(Supabaseキーはサーバー側のみで使用し、ブラウザに露出しない)

## セットアップ

```bash
npm install
cp .env.example .env.local  # SUPABASE_URL, SUPABASE_ANON_KEY を設定
npm run dev
```

Supabase プロジェクト側で `migrations/0001_init.sql` を SQL Editor から実行してテーブルを作成してください。

## データモデル

`ciel-db` からの主な変更点は `setlists` テーブルです。旧版では MC などの曲以外の演目も1行として保存していたため、曲番号を出すために「曲以外はカウントしない」というロジックが各画面に重複していました。

新版では **`setlists` の行は曲のみ** とし、曲の前後に入る MC 等は隣接する曲の `note_before` / `note_after` に文字列として保存します。

```
setlists
  id
  event_id
  song_id
  order        -- 曲順(1,2,3...)。そのまま曲番号として使える
  note_before  -- nullable。この曲の前に入るMC等
  note_after   -- nullable。この曲の後に入るMC等(最後の曲のafterはエンディングMC等)
```

同じ2曲の間に複数の区切り(例: MC + 衣装換え)が入る場合は `note_after` に `"MC / 衣装換え"` のようにまとめて保存する想定です。

## 既存データの移行について

旧 `ciel-db` の Supabase データ(`item_type` カラムを使うスキーマ)をそのまま流用することはできません。曲データはそのまま引き継げますが、セットリストは新スキーマに合わせて詰め直す必要があります。
