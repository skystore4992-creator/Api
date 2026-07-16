import { type NextRequest, NextResponse } from "next/server"
import { callTelegram } from "@/lib/telegram"

/**
 * Register the Telegram webhook.
 *
 * Telegram only accepts a public HTTPS URL on ports 80, 88, 443 or 8443, so
 * the v0 preview (http://localhost:3000) will NOT work. You must Publish/Deploy
 * first, then call this with your deployed domain.
 *
 * The base URL is resolved in this order:
 *   1. `?url=` query param (e.g. ?url=https://my-bot.vercel.app)
 *   2. VERCEL_PROJECT_PRODUCTION_URL env var (set automatically on Vercel)
 *   3. the request origin (only works once deployed)
 */
export async function GET(req: NextRequest) {
  try {
    const override = req.nextUrl.searchParams.get("url")?.trim()
    const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL

    let base: string
    if (override) {
      base = override.startsWith("http") ? override : `https://${override}`
    } else if (prodUrl) {
      base = `https://${prodUrl}`
    } else {
      base = req.nextUrl.origin
    }

    const parsed = new URL(base)

    // Guard against the classic mistake: pointing Telegram at the local preview.
    if (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      (parsed.port && !["", "80", "88", "443", "8443"].includes(parsed.port))
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Telegram webhooks require a public HTTPS URL on port 443. " +
            "Publish this app first, then open this page on your deployed domain " +
            "(or paste the deployed URL below). The v0 preview on port 3000 cannot receive webhooks.",
        },
        { status: 400 },
      )
    }

    const webhookUrl = `${parsed.origin}/api/telegram`
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET

    const result = await callTelegram("setWebhook", {
      url: webhookUrl,
      allowed_updates: ["message"],
      drop_pending_updates: true,
      ...(secret ? { secret_token: secret } : {}),
    })

    const info = await callTelegram("getWebhookInfo", {})

    return NextResponse.json({
      ok: true,
      message: `Webhook set to ${webhookUrl}`,
      result,
      info,
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    )
  }
}
