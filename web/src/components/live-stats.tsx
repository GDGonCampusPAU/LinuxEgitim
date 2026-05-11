"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, Zap } from "lucide-react";
import { api } from "@/lib/api";
import type { GameInfo } from "@/types/api";
import { LeaderboardTable } from "./leaderboard-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const POLL_INTERVAL_MS = 10000;

export function LiveStats() {
  const [info, setInfo] = useState<GameInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await api.getGameInfo();
        if (active) {
          setInfo(data);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Bağlantı hatası");
      }
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription className="mt-0 flex items-center gap-2 text-xs uppercase tracking-wider">
            <Users className="h-3.5 w-3.5" />
            Toplam Katılımcı
          </CardDescription>
          <CardTitle className="mt-2 text-4xl font-mono text-emerald-400">
            {info ? info.totalParticipants : "—"}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="mt-0 flex items-center gap-2 text-xs uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5" />
            Durum
          </CardDescription>
          <CardTitle className="mt-2 flex items-center gap-2 text-xl">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 pulse-glow" />
            <span className="capitalize text-zinc-100">
              {error ? "bağlantı yok" : info?.status ?? "yükleniyor"}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="mt-0 flex items-center justify-between text-xs uppercase tracking-wider">
            <span>Tüm Sıralama</span>
            <Link href="/leaderboard" className="text-emerald-400 hover:underline">
              tümü →
            </Link>
          </CardDescription>
          <CardTitle className="mt-2 text-base font-normal text-zinc-300">
            {info?.totalParticipants ?? 0} kayıt
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>İlk 3</CardTitle>
          <CardDescription>Yarışmayı kazananların güncel sıralaması.</CardDescription>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={info?.topThree ?? []} compact />
        </CardContent>
      </Card>
    </div>
  );
}
