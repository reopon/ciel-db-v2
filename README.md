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

Supabase プロジェクトを新規に用意する場合は `migrations/0001_init.sql` を SQL Editor から実行してテーブルを作成してください。

`ciel-db` の既存 Supabase プロジェクトをそのまま使う場合は、下記「既存データの移行について」を参照し、`0001_init.sql` の代わりに `0002_migrate_existing_data.sql` を実行してください。

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

旧 `ciel-db` の Supabase データ(`item_type` カラムを使うスキーマ)をそのまま流用することはできません。`songs` / `events` はそのまま引き継げますが、`setlists` は新スキーマに合わせて詰め直す必要があります。

`migrations/0002_migrate_existing_data.sql` が、既存の `setlists` の中身(`item_type` が `song` の行と `other` の行が混在した状態)を、新スキーマ(曲だけの行 + `note_before`/`note_after`)に変換するスクリプトです。

**実行前に必ずバックアップを取ってください**(Supabaseダッシュボードのバックアップ機能、またはTable Editorからのエクスポート)。このスクリプトは古い `setlists` を `setlists_v1_backup` にリネームしてから新しい `setlists` を作るため、失敗してもデータ自体は残りますが、念のため別途バックアップを推奨します。

1. ciel-db の Supabase プロジェクトの SQL Editor を開く
2. `migrations/0002_migrate_existing_data.sql` の中身を貼り付けて実行
3. 実行後、件数チェック(スクリプト末尾のコメント参照)で移行結果を確認
4. 問題なければ `.env.local` にこのプロジェクトの `SUPABASE_URL` / `SUPABASE_ANON_KEY` を設定してアプリを起動し、実データで表示を確認
5. 問題なければ `drop table setlists_v1_backup;` で旧データを削除(任意、急がなくてOK)
