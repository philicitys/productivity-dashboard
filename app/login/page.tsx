"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect password");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-line bg-card p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-ink">Welcome, that girl</h1>
        <p className="mt-1 text-sm text-muted">Enter your password to continue.</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="mt-6 w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-brand"
        />

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 w-full rounded-lg bg-brand px-3 py-2 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
    </main>
  );
}
