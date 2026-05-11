"use client";

import { Crown, Medal, Trophy } from "lucide-react";
import type { ScoreEntry } from "@/types/api";
import { cn, formatTimestamp, relativeTime } from "@/lib/utils";

interface LeaderboardTableProps {
  entries: ScoreEntry[];
  compact?: boolean;
}

const podiumIcons: Record<number, { icon: typeof Crown; color: string; bg: string }> = {
  1: { icon: Crown, color: "text-amber-300", bg: "bg-amber-400/10 border-amber-400/30" },
  2: { icon: Trophy, color: "text-zinc-300", bg: "bg-zinc-300/10 border-zinc-400/30" },
  3: { icon: Medal, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30" },
};

export function LeaderboardTable({ entries, compact = false }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">
        Henüz kimse bitirmedi. İlk olmak ister misin?
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800">
      <table className="w-full">
        <thead className="bg-zinc-900/80">
          <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3 w-16">Sıra</th>
            <th className="px-4 py-3">İsim</th>
            {!compact && <th className="hidden px-4 py-3 sm:table-cell">Zaman</th>}
            <th className="px-4 py-3 text-right">{compact ? "Süre" : "Önce"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/70">
          {entries.map((entry) => {
            const podium = podiumIcons[entry.rank];
            const Icon = podium?.icon;
            return (
              <tr
                key={`${entry.rank}-${entry.name}`}
                className={cn(
                  "transition-colors hover:bg-zinc-900/50",
                  entry.rank <= 3 && "bg-zinc-900/30",
                )}
              >
                <td className="px-4 py-3">
                  {podium ? (
                    <div className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full border", podium.bg)}>
                      {Icon && <Icon className={cn("h-3.5 w-3.5", podium.color)} />}
                    </div>
                  ) : (
                    <span className="text-sm font-mono text-zinc-500">#{entry.rank}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-100">{entry.name}</td>
                {!compact && (
                  <td className="hidden px-4 py-3 font-mono text-xs text-zinc-400 sm:table-cell">
                    {formatTimestamp(entry.timestampMs)}
                  </td>
                )}
                <td className="px-4 py-3 text-right font-mono text-xs text-zinc-500">
                  {relativeTime(entry.timestampMs)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
