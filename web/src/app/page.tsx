import Link from "next/link";
import { ArrowRight, BookOpen, Lock, Terminal, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { LiveStats } from "@/components/live-stats";

const features = [
  {
    icon: Terminal,
    title: "Sadece curl",
    description:
      "Hiçbir grafik arayüz, hiçbir GUI editör. Her şey terminalde, sadece curl ve birkaç temel komutla.",
  },
  {
    icon: BookOpen,
    title: "8 Adım",
    description:
      "Redirect'lerden HTTP başlıklarına, parolalı arşivlerden geçersiz SSL'e — her adım yeni bir kavram.",
  },
  {
    icon: Trophy,
    title: "Canlı Sıralama",
    description:
      "İlk 3'e girersen sıralamada yerini al. Sonuçlar gerçek zamanlı, herkes izleyebilir.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-zinc-950">
      <section className="relative overflow-hidden border-b border-zinc-800 terminal-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/40 to-zinc-950" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              GDG on Campus PAU
            </div>
            <h1 className="font-mono text-4xl font-bold tracking-tight text-zinc-100 sm:text-6xl">
              <span className="text-emerald-400">curl</span>
              <span className="text-zinc-500"> </span>
              <span className="cursor-blink">master</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-zinc-400">
              Linux ve terminal becerilerini sınayan 8 adımlı bir hazine avı.
              Yalnızca <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-emerald-300">curl</code> komutuyla, yalnızca terminal üzerinde.
            </p>

            <div className="mt-10 w-full max-w-2xl">
              <CodeBlock code="curl -L http://api.col/start" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/guide">
                <Button size="lg" className="gap-2">
                  Rehberi Aç
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="lg" variant="secondary">
                  Sıralamayı Gör
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
              Canlı Durum
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Her 10 saniyede bir güncellenir.
            </p>
          </div>
        </div>
        <LiveStats />
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Ne yapıyor bu oyun?
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-400">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-400/10 text-amber-300">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Hazır mısın?</CardTitle>
                <CardDescription>
                  Avı başlatmadan önce rehberi okumanı tavsiye ederiz. İçeride 8 adım, her birinde yeni bir komut.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/guide">
              <Button>
                Rehberle Başla
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
