"use client";

import { Eye, EyeOff, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatFinishTime } from "@/lib/utils";
import type { AdminState } from "@/types/api";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [state, setState] = useState<AdminState | null>(null);
  const [message, setMessage] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      setState(await api.admin.getState(key));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Admin bilgisi alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function clearScoreboard() {
    setLoading(true);
    try {
      await api.admin.clearScoreboard(key);
      await load();
      setMessage("Skorbord sıfırlandı.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Skorbord sıfırlanamadı.");
      setLoading(false);
    }
  }

  async function regenerateContent() {
    setLoading(true);
    try {
      await api.admin.regenerateContent(key);
      await load();
      setMessage("Oyun içerikleri yeniden üretildi.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "İçerikler üretilemedi.");
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-[#23d18b]">Yönetim</p>
          <h1 className="text-4xl font-black text-white">Oyun Kontrol Paneli</h1>
        </div>

        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#0b151d]/90 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/55">Admin API Key</label>
            <Input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="Bearer token" />
            <Button className="w-full" onClick={load} disabled={!key || loading}>
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Durumu Getir
            </Button>
            {message ? <p className="text-sm text-white/62">{message}</p> : null}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0b151d]/90 p-4">
            {!state ? (
              <div className="py-16 text-center text-white/52">Admin anahtarını girince oyun durumu burada görünecek.</div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat label="Finalist" value={state.participantCount.toString()} />
                  <Stat label="Erişim Kodu" value={showSecrets ? state.accessCode : "••••••••"} />
                  <Stat label="Arşiv Şifresi" value={showSecrets ? state.archivePassword : "••••••••"} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => setShowSecrets((value) => !value)}>
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    Gizli Bilgiler
                  </Button>
                  <Button variant="ghost" onClick={regenerateContent} disabled={loading}>
                    <RefreshCw className="h-4 w-4" />
                    İçeriği Üret
                  </Button>
                  <Button variant="danger" onClick={clearScoreboard} disabled={loading}>
                    <Trash2 className="h-4 w-4" />
                    Skoru Sıfırla
                  </Button>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  {state.scoreboard.map((entry) => (
                    <div key={`${entry.rank}-${entry.timestampMs}`} className="grid grid-cols-[64px_1fr_auto] border-b border-white/8 px-4 py-3 last:border-b-0">
                      <strong>#{entry.rank}</strong>
                      <span>{entry.name}</span>
                      <span className="text-white/50">{formatFinishTime(entry.timestampMs)}</span>
                    </div>
                  ))}
                  {state.scoreboard.length === 0 ? <div className="p-8 text-center text-white/52">Skorbord boş.</div> : null}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/6 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-white/48">{label}</div>
      <div className="mt-2 truncate text-xl font-black text-white">{value}</div>
    </div>
  );
}
