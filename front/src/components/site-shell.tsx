import Link from "next/link";
import { Gamepad2, Terminal, Trophy, Wrench } from "lucide-react";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#071016] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071016]/88 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-black">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffcf24] text-[#101014]">
              <Terminal className="h-5 w-5" />
            </span>
            Curl Master
          </Link>
          <div className="flex items-center gap-1">
            <Link className="rounded-lg px-3 py-2 text-sm text-white/68 hover:bg-white/8 hover:text-white" href="/play">
              <Gamepad2 className="mr-1 inline h-4 w-4" />
              Oyna
            </Link>
            <Link className="rounded-lg px-3 py-2 text-sm text-white/68 hover:bg-white/8 hover:text-white" href="/leaderboard">
              <Trophy className="mr-1 inline h-4 w-4" />
              Sıralama
            </Link>
            <Link className="rounded-lg px-3 py-2 text-sm text-white/68 hover:bg-white/8 hover:text-white" href="/admin">
              <Wrench className="mr-1 inline h-4 w-4" />
              Admin
            </Link>
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
