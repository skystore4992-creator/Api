const TELEGRAM_API = "https://api.telegram.org"

function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not set")
  return t
}

/** Call any Telegram Bot API method. */
export async function callTelegram<T = unknown>(
  method: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${TELEGRAM_API}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!data.ok) {
    console.log("[v0] Telegram API error:", method, JSON.stringify(data))
    throw new Error(`Telegram ${method} failed: ${data.description}`)
  }
  return data.result as T
}

export async function sendMessage(chatId: number, text: string) {
  // Telegram messages are limited to 4096 chars. Split long replies.
  const chunks = text.match(/[\s\S]{1,4000}/g) ?? [text]
  for (const chunk of chunks) {
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: chunk,
      parse_mode: "Markdown",
    }).catch(async () => {
      // Fall back to plain text if Markdown parsing fails.
      await callTelegram("sendMessage", { chat_id: chatId, text: chunk })
    })
  }
}

export async function sendChatAction(chatId: number, action = "typing") {
  await callTelegram("sendChatAction", { chat_id: chatId, action }).catch(() => {})
}

type TelegramFile = { file_path?: string }

/** Download a Telegram file (by file_id) and return it as base64 + media type. */
export async function downloadFile(
  fileId: string,
): Promise<{ base64: string; mediaType: string }> {
  const file = await callTelegram<TelegramFile>("getFile", { file_id: fileId })
  if (!file.file_path) throw new Error("No file_path returned by Telegram")

  const url = `${TELEGRAM_API}/file/bot${token()}/${file.file_path}`
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")

  const ext = file.file_path.split(".").pop()?.toLowerCase()
  const mediaType =
    ext === "png"
      ? "image/png"
      : ext === "webp"
        ? "image/webp"
        : ext === "gif"
          ? "image/gif"
          : "image/jpeg"

  return { base64, mediaType }
}
