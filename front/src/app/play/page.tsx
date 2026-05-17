"use client";

import {
  Archive,
  DoorOpen,
  Download,
  FileSearch,
  LockKeyhole,
  Radio,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { FinishForm } from "@/components/finish-form";
import { Scoreboard } from "@/components/scoreboard";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Uyanış", icon: Radio },
  { title: "Kapı", icon: DoorOpen },
  { title: "Arşiv", icon: FileSearch },
  { title: "Kasa", icon: Archive },
  { title: "Sunak", icon: LockKeyhole },
];

export default function PlayPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [maxUnlocked, setMaxUnlocked] = useState(0);
  const [uyanis, setUyanis] = useState("");
  const [kapiYol, setKapiYol] = useState("");
  const [parca, setParca] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState("");

  async function run(label: string, action: () => Promise<void>) {
    setLoading(label);
    setMessage("");
    try {
      await action();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "İşlem tamamlanamadı.");
    } finally {
      setLoading("");
    }
  }

  function unlock(step: number) {
    setMaxUnlocked((value) => Math.max(value, step));
    setActiveStep(step);
  }

  function resetGame() {
    setActiveStep(0);
    setMaxUnlocked(0);
    setUyanis("");
    setKapiYol("");
    setParca("");
    setMessage("");
  }

  return (
    <SiteShell>
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-[#0b151d]/90 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-[#23d18b]">Oyun alanı</p>
            <h1 className="mt-1 text-4xl font-black text-white">Görevleri Sırayla Çöz</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
              Her kart gerçek backend endpoint’ini çağırır. Bir görevi tamamlamadan sonraki görev açılmaz.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-5">
            {steps.map((step, index) => {
              const locked = index > maxUnlocked;
              const done = index < maxUnlocked;
              return (
                <button
                  key={step.title}
                  disabled={locked}
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left transition",
                    activeStep === index && "border-[#ffcf24] bg-[#ffcf24]/12",
                    done && activeStep !== index && "border-[#23d18b]/35 bg-[#23d18b]/8",
                    locked && "cursor-not-allowed border-white/6 bg-white/[0.03] opacity-45",
                    !locked && activeStep !== index && !done && "border-white/10 bg-white/6 hover:bg-white/10",
                  )}
                >
                  <step.icon className={activeStep === index ? "h-5 w-5 text-[#ffcf24]" : "h-5 w-5 text-white/54"} />
                  <div>
                    <div className="text-xs font-black text-white/45">Adım {index + 1}</div>
                    <div className="text-sm font-bold text-white">{step.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {activeStep === 0 ? (
            <MissionCard
              title="1. Uyanışı oku"
              intro="Backend seni ilk metne yönlendirir. Bu görevde oyunun başlangıç cevabını alıyoruz."
              command={`curl -L ${api.baseUrl}/uyanis`}
              actionLabel="Uyanışı Al"
              loading={loading === "uyanis"}
              onAction={() =>
                run("uyanis", async () => {
                  setUyanis(await api.getUyanis());
                  unlock(1);
                })
              }
            >
              <Output value={uyanis || "Butona basınca backend'in uyanış metni burada görünecek."} />
            </MissionCard>
          ) : null}

          {activeStep === 1 ? (
            <MissionCard
              title="2. Kapının söylemediğini header'da bul"
              intro="Bu görevde cevap gövdede değil. Backend, sonraki yolu X-Yol header'ında saklıyor."
              command={`curl -I ${api.baseUrl}/kapi`}
              actionLabel="Header'ı Kontrol Et"
              loading={loading === "kapi"}
              onAction={() =>
                run("kapi", async () => {
                  setKapiYol(await api.getKapiYol());
                  unlock(2);
                })
              }
            >
              <Output value={kapiYol ? `Bulunan header:\nX-Yol: ${kapiYol}` : "Header okununca sıradaki endpoint burada çıkacak."} />
            </MissionCard>
          ) : null}

          {activeStep === 2 ? (
            <MissionCard
              title="3. Arşivdeki parçayı oku"
              intro="Sıradaki görev arsiv.txt dosyasını indiriyor. İçinde kasaya götürecek ipucu var."
              command={`curl ${api.baseUrl}/arsiv`}
              actionLabel="arsiv.txt Dosyasını Aç"
              loading={loading === "parca"}
              onAction={() =>
                run("parca", async () => {
                  setParca(await api.getParca());
                  unlock(3);
                })
              }
            >
              <Output value={parca || "Dosya açılınca ipucu burada görünecek."} />
            </MissionCard>
          ) : null}

          {activeStep === 3 ? (
            <div className="rounded-xl border border-white/10 bg-[#0b151d]/90 p-5">
              <h2 className="text-2xl font-black text-white">4. Kasayı aç ve gizli kodu bul</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                parca.txt'deki ipucundan arşiv şifresini çıkar. Zip içindeki sistem.txt kayıtlarında gerçek kod gizli.
              </p>

              <Command code={`curl -O ${api.baseUrl}/kasa/kalinti.zip\nunzip -P <sifre> kalinti.zip\ncat sistem.txt`} />

              <div className="mt-4 flex flex-wrap gap-2">
                <a href={api.kalintiZipUrl}>
                  <Button variant="secondary">
                    <Download className="h-4 w-4" />
                    kalinti.zip İndir
                  </Button>
                </a>
                <Button onClick={() => unlock(4)}>
                  Sunak Görevini Aç
                  <LockKeyhole className="h-4 w-4" />
                </Button>
              </div>

              <p className="mt-4 text-xs leading-5 text-white/45">
                Arşivi yerelde çöz. sistem.txt içinde [INFO] kod=... satırını bul; final formuna o değeri gir.
              </p>
            </div>
          ) : null}

          {activeStep === 4 ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="rounded-xl border border-white/10 bg-[#0b151d]/90 p-5">
                <h2 className="text-2xl font-black text-white">5. Sunağa adını yaz</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  sistem.txt'den çıkardığın kodu final alanına gir. Kod doğruysa backend seni canlı sıralamaya ekler.
                </p>
                <Command code={`curl -X POST -d "name=TAKIM&code=KOD" ${api.baseUrl}/sunak`} />
              </div>
              <FinishForm />
            </div>
          ) : null}

          {message ? (
            <div className="rounded-xl border border-[#ff4d6d]/30 bg-[#ff4d6d]/10 p-4 text-sm text-[#ffb3c0]">{message}</div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <Scoreboard compact />
          <div className="rounded-xl border border-white/10 bg-white/6 p-4">
            <Button variant="ghost" className="w-full" onClick={resetGame}>
              <RotateCcw className="h-4 w-4" />
              Bu Turun Ekranını Sıfırla
            </Button>
          </div>
        </aside>
      </main>
    </SiteShell>
  );
}

function MissionCard({
  title,
  intro,
  command,
  actionLabel,
  loading,
  onAction,
  children,
}: {
  title: string;
  intro: string;
  command: string;
  actionLabel: string;
  loading: boolean;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b151d]/90 p-5">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/60">{intro}</p>
      <Command code={command} />
      <div className="mt-4">{children}</div>
      <div className="mt-4 flex justify-end">
        <Button onClick={onAction} disabled={loading}>
          <Terminal className="h-4 w-4" />
          {loading ? "Çalışıyor" : actionLabel}
        </Button>
      </div>
    </div>
  );
}

function Command({ code }: { code: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#071016] p-4 font-mono text-sm leading-6 text-[#b6ffdf]">
      {code}
    </pre>
  );
}

function Output({ value }: { value: string }) {
  return (
    <pre className="min-h-28 overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-white/6 p-4 text-sm leading-6 text-white/72">
      {value}
    </pre>
  );
}
