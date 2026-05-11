"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { api } from "@/lib/api";
import type { ScoreEntry } from "@/types/api";

const POLL_INTERVAL_MS = 10000;

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<ScoreEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const data = await api.getScoreboard();
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bağlantı hatası");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-emerald-400">
            <Trophy className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-wider">leaderboard</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Sıralama
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Hazineyi bulan herkes, geliş sırasına göre listelenir.
          </p>
        </div>
        <Button onClick={load} variant="secondary" size="sm" disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Yenile
        </Button>
      </div>

      {error && (
        <Card className="mb-4 border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-base text-red-400">Bağlantı Hatası</CardTitle>
            <CardDescription className="text-red-300/80">{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {entries === null && !error ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-2 text-sm">Yükleniyor...</span>
          </CardContent>
        </Card>
      ) : (
        <LeaderboardTable entries={entries ?? []} />
      )}

      <p className="mt-6 text-center text-xs text-zinc-600">
        Otomatik olarak her 10 saniyede bir tazelenir.
      </p>
    </div>
  );
}
