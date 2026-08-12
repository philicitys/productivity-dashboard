"use client";

import { useState } from "react";
import { useAppState } from "./StateProvider";
import { SectionBox } from "./ui";
import { ymd } from "@/lib/id";

type Ev = { title: string; color: string };

const TYPE_COLOR = {
  task: "rgb(var(--brand))",
  assignment: "rgb(var(--sage))",
  clinical: "rgb(var(--accent))",
  study: "rgb(var(--muted))",
};

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export default function Calendar() {
  const { state } = useAppState();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Aggregate everything with a date into a map: yyyy-mm-dd -> events
  const events: Record<string, Ev[]> = {};
  const add = (date: string | null | undefined, ev: Ev) => {
    if (!date) return;
    (events[date] ||= []).push(ev);
  };
  state.tasks
    .filter((t) => !t.done)
    .forEach((t) => add(t.due, { title: t.title, color: TYPE_COLOR.task }));
  state.school.assignments
    .filter((a) => !a.done)
    .forEach((a) => add(a.due, { title: a.title, color: TYPE_COLOR.assignment }));
  state.school.clinicals.forEach((c) =>
    add(c.date, { title: c.site, color: TYPE_COLOR.clinical })
  );
  state.school.studyBlocks.forEach((b) =>
    add(b.date, { title: b.title, color: TYPE_COLOR.study })
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Sunday-based grid.
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset);

  const cells: Date[] = [];
  const cur = new Date(gridStart);
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  // Keep only weeks that touch this month (trims a fully-trailing week).
  const rows: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row = cells.slice(w * 7, w * 7 + 7);
    if (row.some((d) => d.getMonth() === month)) rows.push(row);
  }

  const label = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const navBtn =
    "rounded-md border border-line px-2 py-0.5 text-xs text-muted hover:bg-surface";

  return (
    <SectionBox
      icon="🗓"
      title="Calendar"
      bodyClassName="p-3"
      right={
        <div className="flex items-center gap-1">
          <button className={navBtn} onClick={() => setCursor(new Date(year, month - 1, 1))}>
            ←
          </button>
          <button
            className={navBtn}
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
          >
            Today
          </button>
          <button className={navBtn} onClick={() => setCursor(new Date(year, month + 1, 1))}>
            →
          </button>
        </div>
      }
    >
      <div className="mb-2 text-center font-display text-lg text-ink">{label}</div>

      <div className="grid grid-cols-7 gap-1">
        {DOW.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] uppercase tracking-wide text-muted"
          >
            {d}
          </div>
        ))}

        {rows.flat().map((day, idx) => {
          const inMonth = day.getMonth() === month;
          const key = ymd(day);
          const isToday = key === ymd(today);
          const evs = events[key] || [];
          return (
            <div
              key={idx}
              className={`min-h-[70px] rounded-md border p-1 ${
                inMonth
                  ? "border-[rgb(var(--edge))] bg-card"
                  : "border-transparent bg-transparent"
              } ${isToday ? "ring-2 ring-brand" : ""}`}
            >
              <div
                className={`text-[11px] ${
                  !inMonth
                    ? "text-muted/40"
                    : isToday
                    ? "font-semibold text-brand"
                    : "text-ink"
                }`}
              >
                {day.getDate()}
              </div>
              <div className="mt-0.5 space-y-0.5">
                {evs.slice(0, 3).map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 text-[10px] leading-tight text-ink"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: ev.color }}
                    />
                    <span className="truncate">{ev.title}</span>
                  </div>
                ))}
                {evs.length > 3 && (
                  <div className="text-[10px] text-muted">+{evs.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 px-1 text-[10px] text-muted">
        <Legend color={TYPE_COLOR.task} label="Task" />
        <Legend color={TYPE_COLOR.assignment} label="Assignment" />
        <Legend color={TYPE_COLOR.clinical} label="Clinical" />
        <Legend color={TYPE_COLOR.study} label="Study block" />
      </div>
    </SectionBox>
  );
}
