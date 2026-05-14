"use client";

import {
  CheckCircle2,
  Download,
  FileSearch,
  ListChecks,
  LockKeyhole,
  Radio,
  RotateCcw,
  Search,
  Terminal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FinishForm } from "@/components/finish-form";
import { Scoreboard } from "@/components/scoreboard";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Başlangıç", icon: Radio },
  { title: "Header Avı", icon: ListChecks },
  { title: "İpucu Dosyası", icon: Download },
  { title: "Kod Avı", icon: FileSearch },
  { title: "Final", icon: LockKeyhole },
];

export default function PlayPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [maxUnlocked, setMaxUnlocked] = useState(0);
  const [welcome, setWelcome] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [ipucu, setIpucu] = useState("");
  const [archivePassword, setArchivePassword] = useState("");
  const [passwordSolved, setPasswordSolved] = useState(false);
  const [listText, setListText] = useState("");
  const [search, setSearch] = useState("ACCESS");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState("");

  const matches = useMemo(() => {
    if (!listText || !search.trim()) return [];
    return listText
      .split("\n")
      .map((line, index) => ({ line, index: index + 1 }))
      .filter((item) => item.line.toLowerCase().includes(search.trim().toLowerCase()))
      .slice(0, 12);
  }, [listText, search]);

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

  function checkPassword() {
    if (archivePassword.trim() !== "everything_is_a_file") {
      setMessage("Şifre doğru değil. İpucundaki cümleyi İngilizce, küçük harf ve boşluk yerine alt çizgiyle yaz.");
      return;
    }

    setPasswordSolved(true);
    setMessage("");
  }

  function resetGame() {
    setActiveStep(0);
    setMaxUnlocked(0);
    setWelcome("");
    setNextStep("");
    setIpucu("");
    setArchivePassword("");
    setPasswordSolved(false);
    setListText("");
    setSearch("ACCESS");
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
              Burası oyunun oynandığı yer. Her kart gerçek backend endpoint’ini çağırır. Bir görevi tamamlamadan sonraki görev açılmaz.
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
              title="1. Oyunu başlat"
              intro="Backend seni ilk metne yönlendirir. Bu görevde oyunun başlangıç cevabını alıyoruz."
              command={`curl -L ${api.baseUrl}/start`}
              actionLabel="Başlangıç Cevabını Al"
              loading={loading === "welcome"}
              onAction={() =>
                run("welcome", async () => {
                  setWelcome(await api.getWelcome());
                  unlock(1);
                })
              }
            >
              <Output value={welcome || "Butona basınca backend'in hoş geldin metni burada görünecek."} />
            </MissionCard>
          ) : null}

          {activeStep === 1 ? (
            <MissionCard
              title="2. Header içindeki gizli yolu bul"
              intro="Bu görevde cevap sayfanın içinde değil. Backend, sonraki yolu X-Next-Step header'ında saklıyor."
              command={`curl -I ${api.baseUrl}/step/02-headers`}
              actionLabel="Header'ı Kontrol Et"
              loading={loading === "headers"}
              onAction={() =>
                run("headers", async () => {
                  setNextStep(await api.getNextStepFromHeaders());
                  unlock(2);
                })
              }
            >
              <Output value={nextStep ? `Bulunan header:\nX-Next-Step: ${nextStep}` : "Header okununca sıradaki endpoint burada çıkacak."} />
            </MissionCard>
          ) : null}

          {activeStep === 2 ? (
            <MissionCard
              title="3. İpucu dosyasını oku"
              intro="Sıradaki görev bir dosya indiriyor. Dosyanın içinde arşiv şifresini bulmanı sağlayan ipucu var."
              command={`curl -O ${api.baseUrl}/step/03-download`}
              actionLabel="ipucu.txt Dosyasını Aç"
              loading={loading === "ipucu"}
              onAction={() =>
                run("ipucu", async () => {
                  setIpucu(await api.getIpucu());
                  unlock(3);
                })
              }
            >
              <Output value={ipucu || "Dosya açılınca ipucu burada görünecek."} />
            </MissionCard>
          ) : null}

          {activeStep === 3 ? (
            <div className="rounded-xl border border-white/10 bg-[#0b151d]/90 p-5">
              <h2 className="text-2xl font-black text-white">4. Arşivi çöz ve final kodunu bul</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                İpucundan arşiv şifresini çıkar. Şifre doğruysa liste açılır; listede `ACCESS` arayıp final kodunu bulursun.
              </p>

              <Command code={`curl -O ${api.baseUrl}/step/05-archive/mission.zip\nunzip -P <şifre> mission.zip\ngrep ACCESS list.txt`} />

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <Input
                  value={archivePassword}
                  onChange={(event) => setArchivePassword(event.target.value)}
                  placeholder="Arşiv şifresi"
                />
                <Button variant="ghost" onClick={checkPassword}>
                  Şifreyi Kontrol Et
                </Button>
                <a href={`${api.baseUrl}/step/05-archive/mission.zip`}>
                  <Button variant="secondary">
                    <Download className="h-4 w-4" />
                    Zip İndir
                  </Button>
                </a>
              </div>

              {passwordSolved ? (
                <>
                  <div className="mt-4 rounded-xl border border-[#23d18b]/25 bg-[#23d18b]/8 p-4 text-sm text-[#c8ffe7]">
                    <CheckCircle2 className="mr-2 inline h-4 w-4 text-[#23d18b]" />
                    Şifre doğru. Şimdi listede ACCESS satırını bul.
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/38" />
                      <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </div>
                    <Button
                      onClick={() =>
                        run("list", async () => {
                          setListText(await api.getList());
                        })
                      }
                      disabled={loading === "list"}
                    >
                      <FileSearch className="h-4 w-4" />
                      Listeyi Tara
                    </Button>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-[#071016]">
                    {matches.length > 0 ? (
                      matches.map((match) => (
                        <div key={match.index} className="grid grid-cols-[64px_1fr] gap-3 border-b border-white/8 px-4 py-3 font-mono text-sm last:border-b-0">
                          <span className="text-white/42">{match.index}</span>
                          <span className="break-all text-[#b6ffdf]">{match.line}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-5 text-sm text-white/52">{listText ? "Arama sonucu yok." : "Liste henüz yüklenmedi."}</div>
                    )}
                  </div>

                  {matches.length > 0 ? (
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => unlock(4)}>
                        Final Görevini Aç
                        <LockKeyhole className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}

          {activeStep === 4 ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="rounded-xl border border-white/10 bg-[#0b151d]/90 p-5">
                <h2 className="text-2xl font-black text-white">5. Skorborda yazıl</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  ACCESS_CODE değerini final kodu alanına yaz. Kod doğruysa backend seni canlı sıralamaya ekler.
                </p>
                <Command code={`curl -k https://localhost:8443/step/07-secure\ncurl -X POST -d "name=TAKIM&code=KOD" ${api.baseUrl}/finish`} />
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
