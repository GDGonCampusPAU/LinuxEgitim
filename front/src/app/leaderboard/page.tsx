import { MonitorUp } from "lucide-react";
import { Scoreboard } from "@/components/scoreboard";
import { SiteShell } from "@/components/site-shell";

export default function LeaderboardPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#23d18b]">Salon ekranı</p>
            <h1 className="text-4xl font-black text-white sm:text-6xl">Canlı Sıralama</h1>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-sm text-white/60">
            <MonitorUp className="h-4 w-4" />
            7 saniyede bir yenilenir
          </div>
        </div>
        <Scoreboard />
      </main>
    </SiteShell>
  );
}
