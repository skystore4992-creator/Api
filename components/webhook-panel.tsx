"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Webhook, Info } from "lucide-react"

type Result = {
  ok: boolean
  message?: string
  error?: string
  info?: { url?: string; pending_update_count?: number }
}

export function WebhookPanel() {
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState("")
  const [result, setResult] = useState<Result | null>(null)

  async function register() {
    setLoading(true)
    setResult(null)
    try {
      const query = url.trim() ? `?url=${encodeURIComponent(url.trim())}` : ""
      const res = await fetch(`/api/telegram/setup${query}`)
      setResult(await res.json())
    } catch (err) {
      setResult({ ok: false, error: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Webhook className="size-5" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-card-foreground">ភ្ជាប់ Webhook</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Telegram ត្រូវការ URL ជា HTTPS សាធារណៈ (port 443)។ ការមើលជាមុន (preview) លើ port 3000
            មិនអាចទទួល webhook បានទេ — អ្នកត្រូវ Publish ជាមុនសិន។
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="leading-relaxed">
          {"ជំហាន៖ (1) ចុច Publish នៅជ្រុងខាងស្តាំ  (2) ចម្លង URL ដែល deploy រួច (ឧ. "}
          <code className="rounded bg-background px-1 py-0.5 text-xs">https://your-bot.vercel.app</code>
          {") ដាក់ក្នុងប្រអប់ខាងក្រោម  (3) ចុចភ្ជាប់។"}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-bot.vercel.app"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40"
          aria-label="URL ដែល deploy រួច"
        />
        <Button onClick={register} disabled={loading} className="shrink-0">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              កំពុងភ្ជាប់...
            </>
          ) : (
            "ភ្ជាប់ Webhook"
          )}
        </Button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        ទុកប្រអប់ទទេ ប្រសិនបើអ្នកកំពុងបើកទំព័រនេះនៅលើ domain ដែល deploy រួចហើយ។
      </p>

      {result && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${
            result.ok
              ? "border-primary/30 bg-primary/5 text-card-foreground"
              : "border-destructive/30 bg-destructive/5 text-card-foreground"
          }`}
        >
          {result.ok ? (
            <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <XCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
          )}
          <div className="min-w-0 break-words">
            {result.ok ? (
              <>
                <p className="font-medium">ភ្ជាប់បានជោគជ័យ!</p>
                <p className="text-muted-foreground">{result.info?.url}</p>
              </>
            ) : (
              <>
                <p className="font-medium">មានបញ្ហា</p>
                <p className="text-muted-foreground">
                  {result.error ?? "សូមពិនិត្យ TELEGRAM_BOT_TOKEN ម្តងទៀត។"}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
