"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FinishForm() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setStatus("idle");

    try {
      const result = await api.finish(name.trim(), code.trim());
      setMessage(result);
      setStatus("success");
      setName("");
      setCode("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Kayıt gönderilemedi.");
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-white/10 bg-[#0b151d]/90 p-4">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/55">Takım adı</label>
        <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="Örn. Terminal Tayfa" required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/55">Final kodu</label>
        <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="ACCESS_CODE" required />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        <Send className="h-4 w-4" />
        {submitting ? "Gönderiliyor" : "Skora Yaz"}
      </Button>
      {message ? (
        <p className={status === "success" ? "text-sm text-[#23d18b]" : "text-sm text-[#ff8aa0]"}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
