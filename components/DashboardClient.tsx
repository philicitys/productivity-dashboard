"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppState } from "@/lib/types";
import StateProvider, { useAppState } from "./StateProvider";
import TasksPanel from "./TasksPanel";
import HabitsPanel from "./HabitsPanel";
import GoalsPanel from "./GoalsPanel";
import SchoolPanel from "./SchoolPanel";
import StatsPanel from "./StatsPanel";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks" },
  { id: "school", label: "School" },
  { id: "habits", label: "Habits" },
  { id: "goals", label: "Goals" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SaveIndicator() {
  const { saveStatus } = useAppState();
  const map: Record<string, string> = {
    idle: "",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed — retrying on next change",
  };
  const text = map[saveStatus];
  if (!text) return null;
  return (
    <span
      className={`text-xs ${saveStatus === "error" ? "text-red-500" : "text-muted"}`}
    >
      {text}
    </span>
  );
}

function Shell() {
  const [tab, setTab] = useState<TabId>("overview");
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-muted">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SaveIndicator />
          <button
            onClick={logout}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:bg-card"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-brand text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="space-y-6">
        {tab === "overview" && <StatsPanel onNavigate={setTab} />}
        {tab === "tasks" && <TasksPanel />}
        {tab === "school" && <SchoolPanel />}
        {tab === "habits" && <HabitsPanel />}
        {tab === "goals" && <GoalsPanel />}
      </main>

      <footer className="mt-10 text-center text-xs text-muted">
        Everything autosaves to your Neon database.
      </footer>
    </div>
  );
}

export default function DashboardClient({
  initialState,
}: {
  initialState: AppState;
}) {
  return (
    <StateProvider initialState={initialState}>
      <Shell />
    </StateProvider>
  );
}
