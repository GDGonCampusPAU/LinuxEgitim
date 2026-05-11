import { Archive, BookOpen, FileSearch, FileText, Flag, Globe, KeyRound, Lock, Network, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";

interface Step {
  n: number;
  title: string;
  icon: typeof Globe;
  concept: string;
  description: string;
  command: string;
  expect?: string;
  hint?: string;
}

const steps: Step[] = [
  {
    n: 1,
    title: "Başlangıç & Redirect",
    icon: Globe,
    concept: "HTTP 302",
    description:
      "Sunucu seni başka bir adrese yönlendiriyor. Bu yönlendirmeyi otomatik takip etmek için -L parametresi kullanılır.",
    command: "curl -L http://api.col/start",
    expect: "Hoş geldin metni ve bir sonraki adımın ipucu.",
  },
  {
    n: 2,
    title: "Görünmez Başlıklar",
    icon: Network,
    concept: "Response Headers",
    description:
      "Sayfa içeriği boş olsa da HTTP başlıklarında bilgi gizli. -I parametresi sadece başlıkları döner.",
    command: "curl -I http://api.col/step/02-headers",
    hint: "X-Next-Step header'ında bir yol göreceksin.",
  },
  {
    n: 3,
    title: "Dosya İndirme",
    icon: FileText,
    concept: "curl -o",
    description:
      "Sunucudan bir ipucu dosyası indireceksin. -o ile özel bir isimle kaydet.",
    command: "curl -o ipucu.txt http://api.col/step/03-download",
    expect: "ipucu.txt adlı dosya kaydedildi.",
  },
  {
    n: 4,
    title: "İçeriği Oku",
    icon: BookOpen,
    concept: "cat",
    description:
      "İndirdiğin dosyanın içinde bir arşiv linki ve parola ipucu var. Terminale bas ve oku.",
    command: "cat ipucu.txt",
    hint: "Parola ipucu Linux felsefesiyle ilgili. İngilizce, küçük harfler, alt çizgi.",
  },
  {
    n: 5,
    title: "Arşivi Çek",
    icon: Archive,
    concept: "curl -O",
    description:
      "Bir önceki adımdaki bağlantıdan bir zip arşivi indir. -O parametresi orijinal isimle kaydeder.",
    command: "curl -O http://api.col/step/05-archive/mission.zip",
  },
  {
    n: 6,
    title: "Arşivi Aç & Kelime Avı",
    icon: FileSearch,
    concept: "unzip + grep",
    description:
      "Zip parolayla korumalı. Parolayı çözdükten sonra içindeki devasa list.txt dosyasında ACCESS anahtarını grep ile ara.",
    command: 'unzip -P "<PAROLA>" mission.zip && grep "ACCESS" list.txt',
    hint: "Parola ipucuyla bulduğun şeyi <PAROLA> yerine yaz.",
  },
  {
    n: 7,
    title: "Güvensiz HTTPS",
    icon: ShieldCheck,
    concept: "curl -k",
    description:
      "Bir HTTPS adresine bağlanacaksın ama sertifikası geçersiz. -k parametresi sertifika kontrolünü atlar.",
    command: "curl -k https://api.col/step/07-secure",
    expect: "Final talimatı: /finish adresine POST gönder.",
  },
  {
    n: 8,
    title: "Skorboarda Yaz",
    icon: Flag,
    concept: "curl -X POST -d",
    description:
      "İsmini ve adım 6'da bulduğun kodu /finish endpoint'ine form-data olarak POST et. Sıralamaya kaydedilirsin.",
    command:
      'curl -X POST -d "name=ISMIN&code=BULDUGUN_KOD" http://api.col/finish',
    expect: "Tebrikler! Sıralamadaki yerin döner.",
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="mb-2 inline-flex items-center gap-2 text-emerald-400">
          <KeyRound className="h-4 w-4" />
          <span className="font-mono text-xs uppercase tracking-wider">guide</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Rehber
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Hazine avı 8 adımdan oluşur. Her adımda yeni bir{" "}
          <code className="rounded bg-zinc-900 px-1 py-0.5 font-mono text-emerald-300">curl</code>{" "}
          parametresi öğreneceksin. Sırayla ilerle, takıldığında ipuçlarına bak.
        </p>
      </div>

      <div className="relative space-y-6">
        <div className="absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-emerald-400/30 via-zinc-800 to-transparent" />

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.n} className="relative pl-14">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 bg-zinc-950 font-mono text-sm font-bold text-emerald-400 shadow-lg shadow-emerald-400/10">
                {step.n}
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-zinc-800/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                        <Icon className="h-3 w-3" />
                        {step.concept}
                      </div>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CodeBlock code={step.command} />
                  {step.expect && (
                    <div className="rounded-md border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-200/80">
                      <span className="font-semibold text-emerald-300">Beklenen: </span>
                      {step.expect}
                    </div>
                  )}
                  {step.hint && (
                    <div className="rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200/80">
                      <span className="font-semibold text-amber-300">İpucu: </span>
                      {step.hint}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}

        <div className="relative pl-14">
          <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-400/10 text-emerald-400">
            <Lock className="h-4 w-4" />
          </div>
          <Card className="border-emerald-400/20 bg-emerald-400/5">
            <CardHeader>
              <CardTitle>Bitti — Sıralamaya bak</CardTitle>
              <CardDescription>
                İlk 3'te misin? <a href="/leaderboard" className="text-emerald-300 underline">Sıralama sayfasından</a> kontrol et.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
