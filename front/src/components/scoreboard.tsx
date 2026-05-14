"use client";

import { Crown, Medal, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn, formatFinishTime } from "@/lib/utils";
import type { ScoreEntry } from "@/types/api";

export function Scoreboard({ compact = false }: { compact?: boolean }) {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await api.getScoreboard();
        if (!active) return;
        setEntries(data);
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Skorbord alınamadı.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const interval = window.setInterval(load, 7000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="rounded-xl border border-white/10 bg-[#0b151d]/86">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-base font-bold text-white">Canlı Sıralama</h2>
          <p className="text-xs text-white/52">{entries.length} finalist</p>
        </div>
        <RefreshCw className={cn("h-4 w-4 text-[#23d18b]", loading && "animate-spin")} />
      </div>

      {error ? <div className="px-4 py-5 text-sm text-[#ff8aa0]">{error}</div> : null}

      {!error && entries.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-white/55">
          Henüz bitiren yok. İlk isim burada parlayacak.
        </div>
      ) : null}

      <div className="divide-y divide-white/8">
        {entries.slice(0, compact ? 5 : 20).map((entry) => (
          <div key={`${entry.rank}-${entry.timestampMs}`} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-4 py-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black",
                entry.rank === 1 && "bg-[#ffcf24] text-[#111111]",
                entry.rank === 2 && "bg-[#d8e0e7] text-[#111111]",
                entry.rank === 3 && "bg-[#ff9f43] text-[#111111]",
                entry.rank > 3 && "bg-white/8 text-white/72",
              )}
            >
              {entry.rank <= 3 ? <Medal className="h-4 w-4" /> : entry.rank}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {entry.rank === 1 ? <Crown className="mr-1 inline h-4 w-4 text-[#ffcf24]" /> : null}
                {entry.name}
              </div>
              <div className="text-xs text-white/45">{formatFinishTime(entry.timestampMs)}</div>
            </div>
            <div className="text-sm font-black text-white/80">#{entry.rank}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
