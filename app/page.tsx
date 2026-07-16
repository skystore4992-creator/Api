import { WebhookPanel } from "@/components/webhook-panel"
import { Bot, Eye, MessageSquare, Sparkles, KeyRound, Send } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "ឆ្លាតវៃខ្លាំង",
    desc: "ដំណើរការដោយ Google Gemini (ឥតគិតថ្លៃ) ជាមួយ persona ThatGPT-5.5 — ឆ្លើយត្រឹមត្រូវ ច្បាស់លាស់ ជាភាសាខ្មែរ ឬភាសាដទៃ។",
  },
  {
    icon: Eye,
    title: "មើលឃើញរូបភាព (Vision)",
    desc: "ផ្ញើរូបភាពមក រួចសួរសំណួរអំពីខ្លឹមសារ — bot វិភាគ និងឆ្លើយដូច ChatGPT។",
  },
  {
    icon: MessageSquare,
    title: "ចងចាំការសន្ទនា",
    desc: "រក្សាបរិបទនៃការសន្ទនាក្នុងជជែកនីមួយៗ ដើម្បីឆ្លើយបានស៊ីជម្រៅ។",
  },
]

const steps = [
  {
    icon: Bot,
    title: "បង្កើត Bot",
    desc: "នៅ Telegram បើក @BotFather រួចវាយ /newbot ដើម្បីទទួល token។",
  },
  {
    icon: KeyRound,
    title: "បញ្ចូល Keys",
    desc: "បន្ថែម TELEGRAM_BOT_TOKEN និង GOOGLE_GENERATIVE_AI_API_KEY (ឥតគិតថ្លៃ ពី Google AI Studio) ទៅ Environment Variables។",
  },
  {
    icon: Send,
    title: "ភ្ជាប់ & សាកល្បង",
    desc: "Publish, ចុច ភ្ជាប់ Webhook, រួចផ្ញើ /start ទៅ bot របស់អ្នក។",
  },
]

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col items-center gap-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Bot className="size-8" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-3">
          <span className="mx-auto rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Telegram AI Bot
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            ThatGPT-5.5
          </h1>
          <p className="mx-auto max-w-xl text-pretty leading-relaxed text-muted-foreground">
            ជំនួយការ AI ដ៏ឆ្លាតវៃសម្រាប់ Telegram ដែលអាចឆ្លើយសំណួរ និង
            <span className="text-foreground"> មើលឃើញរូបភាព</span> ដែលអ្នកផ្ញើ។
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="មុខងារ">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="size-5" aria-hidden="true" />
            </div>
            <h2 className="font-medium text-card-foreground">{f.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-5" aria-label="ការតំឡើង">
        <h2 className="text-xl font-semibold text-foreground">របៀបចាប់ផ្តើម</h2>
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <s.icon className="size-4 text-primary" aria-hidden="true" />
                  <h3 className="font-medium text-card-foreground">{s.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Webhook">
        <WebhookPanel />
      </section>

      <footer className="mt-auto border-t border-border pt-6 text-center text-sm text-muted-foreground">
        <p>
          ក្នុង Telegram៖ ផ្ញើ <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">/start</code> ដើម្បីចាប់ផ្តើម ឬ{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">/reset</code> ដើម្បីលុបប្រវត្តិ។
        </p>
      </footer>
    </main>
  )
}
