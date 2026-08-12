"use client";

import { useState } from "react";
import { useAppState } from "./StateProvider";
import { Button, Input, SectionBox, Select } from "./ui";
import { uid, ymd } from "@/lib/id";

type Ev = { title: string; color: string };

const TYPE_COLOR = {
  event: "#8f86a6",
  task: "rgb(var(--brand))",
  assignment: "rgb(var(--sage))",
  clinical: "rgb(var(--accent))",
  study: "rgb(var(--muted))",
};

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Kind = "event" | "task" | "assignment" | "clinical" | "study";

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function pretty(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function Calendar() {
  const { state, update } = useAppState();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Add-event form state.
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<Kind>("event");

  // Aggregate everything with a date into a map: yyyy-mm-dd -> events
  const events: Record<string, Ev[]> = {};
  const add = (date: string | null | undefined, ev: Ev) => {
    if (!date) return;
    (events[date] ||= []).push(ev);
  };
  state.events.forEach((e) => add(e.date, { title: e.title, color: TYPE_COLOR.event }));
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

  function addToDay() {
    if (!selectedDay || !title.trim()) return;
    const t = title.trim();
    const now = new Date().toISOString();
    update((d) => {
      if (kind === "event") {
        d.events.push({ id: uid("evt"), title: t, date: selectedDay, createdAt: now });
      } else if (kind === "task") {
        d.tasks.unshift({
          id: uid("task"),
          title: t,
          priority: "medium",
          due: selectedDay,
          done: false,
          createdAt: now,
        });
      } else if (kind === "assignment") {
        d.school.assignments.unshift({
          id: uid("asgn"),
          title: t,
          course: "General",
          type: "other",
          due: selectedDay,
          done: false,
          createdAt: now,
        });
      } else if (kind === "clinical") {
        d.school.clinicals.push({
          id: uid("clin"),
          site: t,
          date: selectedDay,
          start: "07:00",
          end: "15:00",
          prepDone: false,
          paperworkDone: false,
          createdAt: now,
        });
      } else if (kind === "study") {
        d.school.studyBlocks.push({
          id: uid("block"),
          title: t,
          date: selectedDay,
          start: "09:00",
          end: "10:00",
          createdAt: now,
        });
      }
      return d;
    });
    setTitle("");
  }

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
          const isSelected = key === selectedDay;
          const evs = events[key] || [];
          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedDay(key);
                setTitle("");
              }}
              className={`min-h-[70px] rounded-md border p-1 text-left transition hover:border-brand ${
                inMonth
                  ? "border-[rgb(var(--edge))] bg-card"
                  : "border-transparent bg-transparent"
              } ${isToday ? "ring-2 ring-brand" : ""} ${
                isSelected ? "ring-2 ring-accent" : ""
              }`}
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
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="mt-3 rounded-xl border border-[rgb(var(--edge))] bg-surface/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Add to {pretty(selectedDay)}
            </span>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-muted hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              value={title}
              autoFocus
              placeholder="What's happening?"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addToDay()}
              className="min-w-[180px] flex-1"
            />
            <Select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
              <option value="event">Event</option>
              <option value="task">Task</option>
              <option value="assignment">Assignment</option>
              <option value="clinical">Clinical</option>
              <option value="study">Study block</option>
            </Select>
            <Button onClick={addToDay}>Add</Button>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Tip: pick a type so it also shows up in the matching tab.
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3 px-1 text-[10px] text-muted">
        <Legend color={TYPE_COLOR.event} label="Event" />
        <Legend color={TYPE_COLOR.task} label="Task" />
        <Legend color={TYPE_COLOR.assignment} label="Assignment" />
        <Legend color={TYPE_COLOR.clinical} label="Clinical" />
        <Legend color={TYPE_COLOR.study} label="Study block" />
      </div>
    </SectionBox>
  );
}
