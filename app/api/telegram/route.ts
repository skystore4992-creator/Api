import { type NextRequest, NextResponse } from "next/server"
import { sendMessage, sendChatAction, downloadFile } from "@/lib/telegram"
import { generateReply, buildImageContent, resetConversation } from "@/lib/ai"

// Give the model room to think on longer requests.
export const maxDuration = 60

type TelegramPhotoSize = { file_id: string; width: number; height: number }
type TelegramMessage = {
  message_id: number
  chat: { id: number }
  text?: string
  caption?: string
  photo?: TelegramPhotoSize[]
}
type TelegramUpdate = { message?: TelegramMessage }

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret) return true // no secret configured -> allow
  return req.headers.get("x-telegram-bot-api-secret-token") === secret
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let update: TelegramUpdate
  try {
    update = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const message = update.message
  if (!message) return NextResponse.json({ ok: true })

  const chatId = message.chat.id

  // Process asynchronously but await so serverless doesn't cut us off.
  try {
    await handleMessage(message, chatId)
  } catch (err) {
    console.log("[v0] handler error:", (err as Error).message)
    await sendMessage(chatId, "សូមអភ័យទោស មានបញ្ហាបច្ចេកទេសបន្តិច។ សូមព្យាយាមម្តងទៀត។").catch(() => {})
  }

  // Always ack so Telegram doesn't retry.
  return NextResponse.json({ ok: true })
}

async function handleMessage(message: TelegramMessage, chatId: number) {
  const text = message.text?.trim()

  // Commands
  if (text === "/start") {
    await sendMessage(
      chatId,
      "សួស្តី! ខ្ញុំគឺ *ThatGPT-5.5* ជាជំនួយការ AI ដ៏ឆ្លាតវៃ។\n\nសួរខ្ញុំបានគ្រប់សំណួរ ឬ *ផ្ញើរូបភាព* មកខ្ញុំ រួចសួរអំពីវា ខ្ញុំមើលឃើញ!\n\nប្រើ /reset ដើម្បីចាប់ផ្តើមការសន្ទនាថ្មី។",
    )
    return
  }
  if (text === "/reset") {
    resetConversation(chatId)
    await sendMessage(chatId, "បានលុបប្រវត្តិការសន្ទនា។ តោះចាប់ផ្តើមថ្មី!")
    return
  }

  await sendChatAction(chatId, "typing")

  // Image message (Vision)
  if (message.photo && message.photo.length > 0) {
    // Telegram sends multiple sizes; the last is the largest/highest quality.
    const largest = message.photo[message.photo.length - 1]
    const image = await downloadFile(largest.file_id)
    const content = buildImageContent([image], message.caption ?? "")
    const reply = await generateReply(chatId, content)
    await sendMessage(chatId, reply)
    return
  }

  // Text message
  if (text) {
    const reply = await generateReply(chatId, text)
    await sendMessage(chatId, reply)
    return
  }

  await sendMessage(chatId, "ខ្ញុំអាចឆ្លើយសារជាអក្សរ និងវិភាគរូបភាពប៉ុណ្ណោះនៅពេលនេះ។")
}
