"use client";

import { Activity, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { GameInfo } from "@/types/api";

export function GameStatus() {
  const [info, setInfo] = useState<GameInfo | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await api.getGameInfo();
        if (active) setInfo(data);
      } catch {
        if (active) setInfo(null);
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
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-white/6 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
          <Activity className="h-4 w-4 text-[#23d18b]" />
          Durum
        </div>
        <div className="text-2xl font-black text-white">{info?.status === "active" ? "Aktif" : "Bekleniyor"}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/6 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
          <Users className="h-4 w-4 text-[#00b3ff]" />
          Finalist
        </div>
        <div className="text-2xl font-black text-white">{info?.totalParticipants ?? 0}</div>
      </div>
    </div>
  );
}
