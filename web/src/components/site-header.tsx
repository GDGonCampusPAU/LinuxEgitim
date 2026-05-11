import Link from "next/link";
import { Terminal } from "lucide-react";

const nav = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/guide", label: "Rehber" },
  { href: "/leaderboard", label: "Sıralama" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="text-zinc-100">curl</span>
          <span className="text-emerald-400">master</span>
        </Link>

        <nav className="flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
