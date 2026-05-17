import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, ListChecks, LockKeyhole, Radio, Terminal } from "lucide-react";
import { GameStatus } from "@/components/game-status";
import { Scoreboard } from "@/components/scoreboard";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

const rounds = [
  { icon: Radio, title: "Başlat", text: "Oyuna gir, ilk endpoint'i çağır." },
  { icon: ListChecks, title: "Header", text: "Bir sonraki ipucunu HTTP başlığında bul." },
  { icon: Download, title: "Dosya", text: "İpucu dosyasını indir ve oku." },
  { icon: LockKeyhole, title: "Final", text: "Kodu bul, takımını skorborda yaz." },
];

export default function Home() {
  return (
    <SiteShell>
      <main>
        <section className="arena-grid border-b border-white/10">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_380px] lg:py-12">
            <div className="float-in flex min-h-[520px] flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#23d18b]/35 bg-[#23d18b]/10 px-3 py-1 text-xs font-bold text-[#8dffd1]">
                <span className="h-2 w-2 rounded-full bg-[#23d18b]" />
                Canlı terminal yarışması
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-white sm:text-7xl">
                Curl komutlarıyla hazine avı.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
                Ana sayfa sadece lobi ekranı. Oyunu oynamak için akış ekranına gir, görevleri sırayla çöz ve final kodunu bulunca skorborda yazıl.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/play">
                  <Button>
                    Oyuna Gir
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="ghost">Salon Sıralaması</Button>
                </Link>
              </div>
              <div className="mt-8 rounded-xl border border-white/10 bg-[#0b151d]/90 p-4 font-mono text-sm text-[#b6ffdf]">
                <Terminal className="mr-2 inline h-4 w-4" />
                curl -L {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/uyanis
              </div>
            </div>

            <aside className="space-y-4 lg:pt-6">
              <GameStatus />
              <Scoreboard compact />
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-3 md:grid-cols-4">
            {rounds.map((round) => (
              <article key={round.title} className="rounded-xl border border-white/10 bg-white/6 p-4">
                <round.icon className="mb-4 h-6 w-6 text-[#ffcf24]" />
                <h2 className="text-lg font-black text-white">{round.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/58">{round.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#23d18b]/25 bg-[#23d18b]/8 p-4 text-sm text-[#c8ffe7]">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#23d18b]" />
            Oyun ekranı backend’e bağlanır. Backend varsayılan olarak http://localhost:8080 adresinden okunur.
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
