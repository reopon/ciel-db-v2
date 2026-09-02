"use server"

import { fetchTweetText } from "@/lib/twitter-oembed"

export interface TweetFetchResult {
  status: "success" | "error"
  message: string
  text?: string
}

export async function fetchTweetTextAction(tweetUrl: string): Promise<TweetFetchResult> {
  const trimmed = tweetUrl.trim()
  if (!trimmed) {
    return { status: "error", message: "URLを入力してください" }
  }

  let text: string | null
  try {
    text = await fetchTweetText(trimmed)
  } catch (err) {
    console.error(err)
    return { status: "error", message: "投稿の取得に失敗しました" }
  }

  if (!text) {
    return {
      status: "error",
      message: "投稿本文を取得できませんでした(鍵アカウントか、削除された投稿の可能性があります)",
    }
  }

  return { status: "success", message: "取得しました。内容を確認してから登録してください。", text }
}
