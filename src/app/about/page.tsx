export default function AboutPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-10 text-sm leading-relaxed space-y-6">
      <h1 className="text-2xl font-display tracking-wide font-semibold">About</h1>

      <p>
        Gran☆Cielのセットリストを記録・整理することを目的とした、非公式・非営利のデータベースサイトです。
        <br />
        楽曲情報もまとめています。
        <br />
        所属事務所やメンバーご本人、関係各所とは一切関係ございません。
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold">情報の出典について</h2>
        <p>
          Gran☆Ciel公式やメンバー、関係者のSNSなどweb公開情報を参照しています。
          <br />
          また、Wikipediaやファンの方が発信した情報も参考にしています。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">セットリストの登録状況</h2>
        <p>
          ライブイベントのセットリストは、情報を確認できましたら数日以内に登録しています。
          <br />
          過去のデータについては随時、追える範囲で追加していく予定です。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">お問い合わせ</h2>
        <p>
          <a
            href="https://x.com/reopon"
            className="text-primary underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            @reopon
          </a>{" "}
          までご連絡いただければ幸いです。
        </p>
      </section>
    </main>
  )
}
