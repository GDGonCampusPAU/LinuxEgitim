"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff, KeyRound, LogOut, RefreshCw, Shield, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { api, ApiError } from "@/lib/api";
import type { AdminState } from "@/types/api";

const STORAGE_KEY = "curlmaster.admin-key";

export default function AdminPage() {
  const [key, setKey] = useState<string | null>(null);
  const [state, setState] = useState<AdminState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setKey(stored);
  }, []);

  const fetchState = async (currentKey: string) => {
    setBusy(true);
    setError(null);
    try {
      const data = await api.admin.getState(currentKey);
      setState(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Geçersiz API anahtarı.");
        setKey(null);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (key) fetchState(key);
  }, [key]);

  const handleLogin = (newKey: string) => {
    localStorage.setItem(STORAGE_KEY, newKey);
    setKey(newKey);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setKey(null);
    setState(null);
  };

  const handleClearScoreboard = async () => {
    if (!key) return;
    if (!confirm("Skorbordu sıfırlamak istediğine emin misin? Bu işlem geri alınamaz.")) return;
    setBusy(true);
    try {
      await api.admin.clearScoreboard(key);
      await fetchState(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      setBusy(false);
    }
  };

  const handleRegenerate = async () => {
    if (!key) return;
    setBusy(true);
    try {
      await api.admin.regenerateContent(key);
      await fetchState(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      setBusy(false);
    }
  };

  if (!key) {
    return <AdminLogin onLogin={handleLogin} error={error} />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-emerald-400">
            <Shield className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-wider">admin</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Yönetim Paneli
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Skorbordu yönet ve içerikleri yeniden üret.
          </p>
        </div>
        <Button onClick={handleLogout} variant="ghost" size="sm">
          <LogOut className="h-3.5 w-3.5" />
          Çıkış
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-500/30 bg-red-500/5">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-400" />
              <div>
                <CardTitle className="text-base text-red-400">Hata</CardTitle>
                <CardDescription className="text-red-300/80">{error}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-400/10 text-amber-300">
              <Trash2 className="h-4 w-4" />
            </div>
            <CardTitle>Skorbordu Sıfırla</CardTitle>
            <CardDescription>
              Tüm kayıtları siler. Yarışma yeniden başlayacaksa önce burayı temizle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleClearScoreboard} variant="danger" disabled={busy}>
              Skorbordu Temizle
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-300">
              <Zap className="h-4 w-4" />
            </div>
            <CardTitle>İçeriği Yeniden Üret</CardTitle>
            <CardDescription>
              ipucu.txt, list.txt ve mission.zip dosyalarını mevcut config'le tazeler.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRegenerate} variant="secondary" disabled={busy}>
              <RefreshCw className="h-3.5 w-3.5" />
              Yeniden Üret
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Yapılandırma</CardTitle>
          <CardDescription>Aktif oyun parametreleri.</CardDescription>
        </CardHeader>
        <CardContent>
          {state ? (
            <dl className="grid grid-cols-1 gap-3 font-mono text-sm sm:grid-cols-2">
              <ConfigRow label="Access Code" value={state.accessCode} />
              <ConfigRow label="Arşiv Parolası" value={state.archivePassword} />
              <ConfigRow label="Katılımcı Sayısı" value={String(state.participantCount)} />
            </dl>
          ) : (
            <div className="text-sm text-zinc-500">Yükleniyor...</div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Skorbord</CardTitle>
          <CardDescription>Tüm kayıtlar — IP/saat damgalarıyla.</CardDescription>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={state?.scoreboard ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
      <dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-1 break-all text-zinc-200">{value}</dd>
    </div>
  );
}

function AdminLogin({ onLogin, error }: { onLogin: (key: string) => void; error: string | null }) {
  const [input, setInput] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onLogin(input.trim());
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:px-6">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/5">
        <KeyRound className="h-6 w-6 text-emerald-400" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Admin Girişi
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-400">
        Yönetim paneline erişmek için API anahtarını gir.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-3">
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="API Anahtarı"
            className="pr-10"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            aria-label={show ? "Gizle" : "Göster"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={!input.trim()}>
          Giriş Yap
        </Button>
      </form>

      <p className="mt-6 text-xs text-zinc-600">
        Anahtar tarayıcı localStorage'da saklanır.
      </p>
    </div>
  );
}
