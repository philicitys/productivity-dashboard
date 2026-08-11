"use client";

import { useState } from "react";
import { useAppState } from "./StateProvider";
import { Button, Card, Empty, Input, Select } from "./ui";
import { addDays, startOfWeek, uid, weekDays } from "@/lib/id";
import { celebrate } from "@/lib/celebrate";
import type { Habit } from "@/lib/types";

const COLORS = ["#785b4e", "#7a816c", "#d68d84", "#cfbb9f", "#8e967d", "#c98a5e"];
const ICONS = ["📚", "💪", "😴", "💧", "🧘", "🙏", "🥗", "📝", "🏃", "☀️"];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function currentStreak(log: Record<string, boolean>): number {
  let streak = 0;
  const d = new Date();
  if (!log[d.toISOString().slice(0, 10)]) {
    d.setDate(d.getDate() - 1);
    if (!log[d.toISOString().slice(0, 10)]) return 0;
  }
  while (log[d.toISOString().slice(0, 10)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function HabitsPanel() {
  const { state, update } = useAppState();
  const [weekOffset, setWeekOffset] = useState(0);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [goal, setGoal] = useState(5);

  const weekStart = addDays(startOfWeek(new Date()), weekOffset * 7);
  const days = weekDays(weekStart);
  const todayStr = new Date().toISOString().slice(0, 10);

  function add() {
    if (!name.trim()) return;
    const habit: Habit = {
      id: uid("habit"),
      name: name.trim(),
      icon,
      color: COLORS[state.habits.length % COLORS.length],
      goal,
      createdAt: new Date().toISOString(),
      log: {},
    };
    update((d) => {
      d.habits.push(habit);
      return d;
    });
    setName("");
    setIcon(ICONS[(ICONS.indexOf(icon) + 1) % ICONS.length]);
  }

  function toggle(id: string, day: string, el?: HTMLElement | null) {
    let turnedOn = false;
    update((d) => {
      const h = d.habits.find((x) => x.id === id);
      if (h) {
        if (h.log[day]) delete h.log[day];
        else {
          h.log[day] = true;
          turnedOn = true;
        }
      }
      return d;
    });
    if (turnedOn) celebrate(el ?? null);
  }

  function remove(id: string) {
    update((d) => {
      d.habits = d.habits.filter((x) => x.id !== id);
      return d;
    });
  }

  // Weekly completion score across all habits vs. their goals.
  const totalGoal = state.habits.reduce((s, h) => s + Math.min(h.goal, 7), 0);
  const totalDone = state.habits.reduce(
    (s, h) => s + Math.min(days.filter((day) => h.log[day]).length, h.goal),
    0
  );
  const score = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0;

  const rangeLabel = `${weekStart.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${addDays(weekStart, 6).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Habit tracker</h2>
            <p className="text-sm text-muted">{rangeLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="rounded-lg border border-line px-2.5 py-1 text-sm text-muted hover:bg-surface"
            >
              ←
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="rounded-lg border border-line px-2.5 py-1 text-xs text-muted hover:bg-surface"
              >
                This week
              </button>
            )}
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="rounded-lg border border-line px-2.5 py-1 text-sm text-muted hover:bg-surface"
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(var(--line))" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="rgb(var(--brand))"
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-ink">
              {score}%
            </span>
          </div>
          <p className="text-sm text-muted">
            {totalDone} of {totalGoal} weekly targets hit. Keep the streaks alive.
          </p>
        </div>

        {state.habits.length === 0 ? (
          <div className="mt-4">
            <Empty>No habits yet. Add one below to start a streak.</Empty>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1 text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="text-left font-normal" />
                  {days.map((day, i) => {
                    const isToday = day === todayStr;
                    return (
                      <th
                        key={day}
                        className={`w-9 pb-1 text-center text-xs font-medium ${
                          isToday ? "text-brand" : ""
                        }`}
                      >
                        {DAY_LABELS[i]}
                      </th>
                    );
                  })}
                  <th className="w-14 pb-1 text-center text-xs font-medium">Goal</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {state.habits.map((h) => {
                  const doneCount = days.filter((day) => h.log[day]).length;
                  const met = doneCount >= h.goal;
                  const streak = currentStreak(h.log);
                  return (
                    <tr key={h.id}>
                      <td className="pr-3">
                        <div className="flex items-center gap-2">
                          <span>{h.icon}</span>
                          <div>
                            <div className="font-medium text-ink">{h.name}</div>
                            {streak > 0 && (
                              <div className="text-xs text-muted">🔥 {streak}d</div>
                            )}
                          </div>
                        </div>
                      </td>
                      {days.map((day) => {
                        const on = !!h.log[day];
                        const isToday = day === todayStr;
                        return (
                          <td key={day} className="text-center">
                            <button
                              onClick={(e) => toggle(h.id, day, e.currentTarget)}
                              title={day}
                              className={`h-7 w-7 rounded-md transition ${
                                isToday ? "ring-1 ring-brand" : ""
                              }`}
                              style={{
                                background: on ? h.color : "rgb(var(--surface))",
                                border: on ? "none" : "1px solid rgb(var(--line))",
                              }}
                            />
                          </td>
                        );
                      })}
                      <td className="text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            met
                              ? "bg-sage/20 text-sage"
                              : "bg-surface text-muted"
                          }`}
                          style={met ? { color: h.color } : undefined}
                        >
                          {doneCount}/{h.goal}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => remove(h.id)}
                          className="text-muted hover:text-red-500"
                          aria-label="Delete habit"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-ink">Add a habit</h3>
        <div className="flex flex-wrap items-end gap-2">
          <Select value={icon} onChange={(e) => setIcon(e.target.value)} className="w-16 text-center">
            {ICONS.map((ic) => (
              <option key={ic} value={ic}>
                {ic}
              </option>
            ))}
          </Select>
          <Input
            value={name}
            placeholder="Habit name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="min-w-[160px] flex-1"
          />
          <label className="flex items-center gap-1 text-sm text-muted">
            Goal
            <Select value={goal} onChange={(e) => setGoal(Number(e.target.value))} className="w-16">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n}/wk
                </option>
              ))}
            </Select>
          </label>
          <Button onClick={add}>Add</Button>
        </div>
      </Card>
    </div>
  );
}
