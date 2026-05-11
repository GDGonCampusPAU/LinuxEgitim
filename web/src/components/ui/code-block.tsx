"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showPrompt?: boolean;
}

export function CodeBlock({ code, language, className, showPrompt = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "group relative rounded-md border border-zinc-800 bg-zinc-950/80 font-mono text-sm",
        className,
      )}
    >
      {language && (
        <div className="border-b border-zinc-800 px-4 py-1.5 text-xs uppercase tracking-wider text-zinc-500">
          {language}
        </div>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-zinc-100 group-hover:opacity-100 focus:opacity-100"
        aria-label="Kodu kopyala"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre className="overflow-x-auto p-4 leading-relaxed">
        <code>
          {code.split("\n").map((line, i) => (
            <div key={i} className="whitespace-pre">
              {showPrompt && <span className="select-none text-emerald-400">$ </span>}
              <span className="text-zinc-200">{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
