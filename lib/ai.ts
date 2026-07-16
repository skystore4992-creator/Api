import { generateText, type ModelMessage } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

// Free Google Gemini provider — uses GOOGLE_GENERATIVE_AI_API_KEY (no credit card needed).
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

// gemini-2.5-flash: fast, generous free tier, and supports vision (image input).
const MODEL = google("gemini-2.5-flash")

const SYSTEM_PROMPT = `You are "ThatGPT-5.5", an extremely intelligent, capable, and friendly AI assistant living inside a Telegram bot.

Guidelines:
- Answer in the same language the user writes in. If the user writes in Khmer (ភាសាខ្មែរ), reply in natural, fluent Khmer.
- Be accurate, thoughtful, and genuinely helpful. Reason step by step for hard problems, but keep answers concise and well-structured.
- You have vision: when a user sends an image, analyze it carefully and answer their question about its contents.
- Use light Markdown (bold, bullet lists, code blocks) since this runs in Telegram.
- If you are unsure, say so honestly instead of inventing facts.`

// Simple in-memory conversation history per chat. Resets on server restart,
// which is fine for a lightweight bot. Keyed by Telegram chat id.
const conversations = new Map<number, ModelMessage[]>()
const MAX_TURNS = 12 // keep the last ~12 messages per chat

function getHistory(chatId: number): ModelMessage[] {
  return conversations.get(chatId) ?? []
}

function saveHistory(chatId: number, messages: ModelMessage[]) {
  // Trim to the most recent messages to bound memory / token usage.
  conversations.set(chatId, messages.slice(-MAX_TURNS))
}

export function resetConversation(chatId: number) {
  conversations.delete(chatId)
}

type TextPart = { type: "text"; text: string }
type FilePart = { type: "file"; data: string; mediaType: string }
type UserContent = string | Array<TextPart | FilePart>

/** Generate a reply, remembering the conversation for the given chat. */
export async function generateReply(
  chatId: number,
  userContent: UserContent,
): Promise<string> {
  const history = getHistory(chatId)
  const messages: ModelMessage[] = [
    ...history,
    { role: "user", content: userContent },
  ]

  const { text } = await generateText({
    model: MODEL,
    system: SYSTEM_PROMPT,
    messages,
    maxOutputTokens: 1500,
  })

  saveHistory(chatId, [
    ...messages,
    { role: "assistant", content: text },
  ])

  return text
}

/** Build a multimodal user message from one or more images plus a caption. */
export function buildImageContent(
  images: Array<{ base64: string; mediaType: string }>,
  caption: string,
): UserContent {
  return [
    {
      type: "text" as const,
      text: caption || "តើនៅក្នុងរូបភាពនេះមានអ្វីខ្លះ? សូមពិពណ៌នា និងវិភាគ។",
    },
    ...images.map((img) => ({
      type: "file" as const,
      data: img.base64,
      mediaType: img.mediaType,
    })),
  ]
}
