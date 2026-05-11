import { Code } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-zinc-500 sm:flex-row">
        <div>
          GDG on Campus PAU · Linux Treasure Hunt
        </div>
        <a
          href="https://github.com/GDGonCampusPAU/LinuxEgitim"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 transition-colors hover:text-zinc-300"
        >
          <Code className="h-4 w-4" />
          Kaynak Kod
        </a>
      </div>
    </footer>
  );
}
