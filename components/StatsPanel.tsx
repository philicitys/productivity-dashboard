"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppState } from "./StateProvider";
import { Card, Empty, Pill, relativeDue } from "./ui";
import { startOfWeek, weekKey } from "@/lib/id";

function WeeklyFocus() {
  const { state, update } = useAppState();
  const key = weekKey(startOfWeek(new Date()));
  const notes = state.weekly[key] || {};

  function set(field: "focus" | "reflection", value: string) {
    update((d) => {
      d.weekly[key] = { ...(d.weekly[key] || {}), [field]: value };
      return d;
    });
  }

  return (
    <Card className="border-l-4 border-l-accent">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            This week's focus
          </label>
          <textarea
            value={notes.focus || ""}
            onChange={(e) => set("focus", e.target.value)}
            placeholder="What matters most this week?"
            rows={2}
            className="mt-1 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Reflection
          </label>
          <textarea
            value={notes.reflection || ""}
            onChange={(e) => set("reflection", e.target.value)}
            placeholder="How did it go? What did you notice?"
            rows={2}
            className="mt-1 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="text-center">
      <div className="text-3xl font-bold text-ink">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </Card>
  );
}

function lastDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(d);
    day.setDate(d.getDate() - i);
    out.push(day.toISOString().slice(0, 10));
  }
  return out;
}

export default function StatsPanel({
  onNavigate,
}: {
  onNavigate?: (tab: any) => void;
}) {
  const { state } = useAppState();

  const openTasks = state.tasks.filter((t) => !t.done).length;
  const openAssignments = state.school.assignments.filter((a) => !a.done).length;
  const upcomingClinicals = state.school.clinicals.filter(
    (c) => c.date >= new Date().toISOString().slice(0, 10)
  ).length;

  // Habit completions across last 7 days
  const days = lastDays(7);
  const habitData = days.map((day) => ({
    day: new Date(day + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }),
    done: state.habits.filter((h) => h.log[day]).length,
  }));

  // Assignment mix by type (open only)
  const typeCounts: Record<string, number> = {};
  state.school.assignments
    .filter((a) => !a.done)
    .forEach((a) => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

  // Combined upcoming deadlines across tasks + assignments + clinicals
  type Up = { title: string; sub: string; due: string };
  const upcoming: Up[] = [];
  state.tasks.filter((t) => !t.done && t.due).forEach((t) =>
    upcoming.push({ title: t.title, sub: "Task", due: t.due! })
  );
  state.school.assignments.filter((a) => !a.done && a.due).forEach((a) =>
    upcoming.push({ title: a.title, sub: `${a.course} · ${a.type}`, due: a.due! })
  );
  state.school.clinicals
    .filter((c) => c.date >= new Date().toISOString().slice(0, 10))
    .forEach((c) =>
      upcoming.push({ title: `${c.site}${c.unit ? " · " + c.unit : ""}`, sub: "Clinical", due: c.date })
    );
  upcoming.sort((a, b) => (a.due < b.due ? -1 : 1));
  const nextUp = upcoming.slice(0, 6);

  return (
    <div className="space-y-6">
      <WeeklyFocus />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Open tasks" value={openTasks} />
        <Stat label="Assignments due" value={openAssignments} />
        <Stat label="Habits tracked" value={state.habits.length} />
        <Stat label="Upcoming clinicals" value={upcomingClinicals} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-ink">Habits · last 7 days</h2>
          {state.habits.length === 0 ? (
            <Empty>Add habits to see completions here.</Empty>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" />
                  <XAxis dataKey="day" stroke="rgb(var(--muted))" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="rgb(var(--muted))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(var(--card))",
                      border: "1px solid rgb(var(--line))",
                      borderRadius: 8,
                      color: "rgb(var(--ink))",
                    }}
                  />
                  <Bar dataKey="done" fill="rgb(var(--brand))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-ink">Open assignments by type</h2>
          {pieData.length === 0 ? (
            <Empty>Nothing due right now. 🎉</Empty>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgb(var(--card))",
                      border: "1px solid rgb(var(--line))",
                      borderRadius: 8,
                      color: "rgb(var(--ink))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-ink">Coming up</h2>
        {nextUp.length === 0 ? (
          <Empty>No upcoming deadlines. Enjoy the breathing room.</Empty>
        ) : (
          <ul className="space-y-2">
            {nextUp.map((u, i) => {
              const rd = relativeDue(u.due);
              return (
                <li key={i} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2">
                  <div className="flex-1">
                    <div className="text-sm text-ink">{u.title}</div>
                    <div className="text-xs text-muted">{u.sub}</div>
                  </div>
                  <Pill tone={rd.tone}>{rd.label}</Pill>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
