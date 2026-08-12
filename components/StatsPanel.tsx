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
import { Empty, Pill, SectionBox, relativeDue } from "./ui";
import { startOfWeek, weekKey } from "@/lib/id";
import Calendar from "./CalendarPanel";

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
    <SectionBox icon="✷" title="This week" className="border-l-2 border-l-accent">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Focus
          </label>
          <textarea
            value={notes.focus || ""}
            onChange={(e) => set("focus", e.target.value)}
            placeholder="What matters most this week?"
            rows={2}
            className="mt-1 w-full resize-none rounded-lg border border-line bg-surface/50 px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Reflection
          </label>
          <textarea
            value={notes.reflection || ""}
            onChange={(e) => set("reflection", e.target.value)}
            placeholder="How did it go? What did you notice?"
            rows={2}
            className="mt-1 w-full resize-none rounded-lg border border-line bg-surface/50 px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
        </div>
      </div>
    </SectionBox>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--edge))] bg-card p-4 text-center shadow-[0_1px_2px_rgb(0_0_0/0.03)]">
      <div className="font-display text-3xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted">{label}</div>
    </div>
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
  const todayStr = new Date().toISOString().slice(0, 10);

  const openTasks = state.tasks.filter((t) => !t.done).length;
  const openAssignments = state.school.assignments.filter((a) => !a.done).length;
  const upcomingClinicals = state.school.clinicals.filter(
    (c) => c.date >= todayStr
  ).length;

  const days = lastDays(7);
  const habitData = days.map((day) => ({
    day: new Date(day + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }),
    done: state.habits.filter((h) => h.log[day]).length,
  }));

  const typeCounts: Record<string, number> = {};
  state.school.assignments
    .filter((a) => !a.done)
    .forEach((a) => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#3f3a34", "#96a085", "#caa6a5", "#b9b0a2", "#8c857a", "#d8cfc2"];

  const openGoals = state.goals.filter((g) => !g.done);

  type Up = { title: string; sub: string; due: string };
  const upcoming: Up[] = [];
  state.tasks.filter((t) => !t.done && t.due).forEach((t) =>
    upcoming.push({ title: t.title, sub: "Task", due: t.due! })
  );
  state.school.assignments.filter((a) => !a.done && a.due).forEach((a) =>
    upcoming.push({ title: a.title, sub: `${a.course} · ${a.type}`, due: a.due! })
  );
  state.school.clinicals
    .filter((c) => c.date >= todayStr)
    .forEach((c) =>
      upcoming.push({ title: `${c.site}${c.unit ? " · " + c.unit : ""}`, sub: "Clinical", due: c.date })
    );
  upcoming.sort((a, b) => (a.due < b.due ? -1 : 1));
  const nextUp = upcoming.slice(0, 6);

  const chartTooltip = {
    background: "rgb(var(--card))",
    border: "1px solid rgb(var(--line))",
    borderRadius: 8,
    color: "rgb(var(--ink))",
  };

  return (
    <div className="space-y-5">
      <WeeklyFocus />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Open tasks" value={openTasks} />
        <Stat label="Assignments due" value={openAssignments} />
        <Stat label="Habits tracked" value={state.habits.length} />
        <Stat label="Upcoming clinicals" value={upcomingClinicals} />
      </div>

      <Calendar />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionBox icon="✎" title="In progress goals">
          {openGoals.length === 0 ? (
            <Empty>No goals in progress.</Empty>
          ) : (
            <div className="space-y-3">
              {openGoals.map((g) => {
                const pct = Math.round((g.current / g.target) * 100);
                return (
                  <div key={g.id}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-ink">{g.title}</span>
                      <span className="text-xs text-muted">
                        {g.current}/{g.target} {g.unit || ""} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionBox>

        <SectionBox icon="🗓" title="Coming up">
          {nextUp.length === 0 ? (
            <Empty>No upcoming deadlines.</Empty>
          ) : (
            <ul className="space-y-2">
              {nextUp.map((u, i) => {
                const rd = relativeDue(u.due);
                return (
                  <li key={i} className="flex items-center gap-3">
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
        </SectionBox>

        <SectionBox icon="📈" title="Habits · last 7 days">
          {state.habits.length === 0 ? (
            <Empty>Add habits to see completions.</Empty>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" />
                  <XAxis dataKey="day" stroke="rgb(var(--muted))" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="rgb(var(--muted))" fontSize={12} />
                  <Tooltip contentStyle={chartTooltip} />
                  <Bar dataKey="done" fill="rgb(var(--brand))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionBox>

        <SectionBox icon="📚" title="Open assignments by type">
          {pieData.length === 0 ? (
            <Empty>Nothing due right now.</Empty>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={78} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionBox>
      </div>
    </div>
  );
}
