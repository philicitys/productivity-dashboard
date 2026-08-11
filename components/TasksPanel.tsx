"use client";

import { useState } from "react";
import { useAppState } from "./StateProvider";
import { Button, Card, Empty, Input, Pill, SectionTitle, Select, relativeDue } from "./ui";
import { uid } from "@/lib/id";
import { celebrate } from "@/lib/celebrate";
import type { Priority, Task } from "@/lib/types";

export default function TasksPanel() {
  const { state, update } = useAppState();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState<"active" | "all" | "done">("active");

  function add() {
    if (!title.trim()) return;
    const task: Task = {
      id: uid("task"),
      title: title.trim(),
      priority,
      due: due || null,
      done: false,
      createdAt: new Date().toISOString(),
    };
    update((d) => {
      d.tasks.unshift(task);
      return d;
    });
    setTitle("");
    setDue("");
    setPriority("medium");
  }

  function toggle(id: string, el?: HTMLElement | null) {
    let becameDone = false;
    update((d) => {
      const t = d.tasks.find((x) => x.id === id);
      if (t) {
        t.done = !t.done;
        t.completedAt = t.done ? new Date().toISOString() : null;
        becameDone = t.done;
      }
      return d;
    });
    if (becameDone) celebrate(el ?? null);
  }

  function remove(id: string) {
    update((d) => {
      d.tasks = d.tasks.filter((x) => x.id !== id);
      return d;
    });
  }

  const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  const visible = state.tasks
    .filter((t) =>
      filter === "all" ? true : filter === "done" ? t.done : !t.done
    )
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.due && b.due && a.due !== b.due) return a.due < b.due ? -1 : 1;
      if (a.due && !b.due) return -1;
      if (!a.due && b.due) return 1;
      return priorityRank[a.priority] - priorityRank[b.priority];
    });

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle title="Tasks" count={state.tasks.filter((t) => !t.done).length} />
        <Select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="active">Active</option>
          <option value="all">All</option>
          <option value="done">Done</option>
        </Select>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={title}
          placeholder="Add a task…"
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="min-w-[180px] flex-1"
        />
        <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <Button onClick={add}>Add</Button>
      </div>

      {visible.length === 0 ? (
        <Empty>No tasks here. Add one above.</Empty>
      ) : (
        <ul className="space-y-2">
          {visible.map((t) => {
            const rd = relativeDue(t.due);
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-lg border border-line px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => toggle(t.id, e.currentTarget)}
                  className="h-4 w-4 accent-[rgb(var(--brand))]"
                />
                <span
                  className={`flex-1 text-sm ${t.done ? "text-muted line-through" : "text-ink"}`}
                >
                  {t.title}
                </span>
                {!t.done && (
                  <Pill tone={t.priority}>{t.priority}</Pill>
                )}
                {rd.label && !t.done && <Pill tone={rd.tone}>{rd.label}</Pill>}
                <button
                  onClick={() => remove(t.id)}
                  className="text-muted hover:text-red-500"
                  aria-label="Delete task"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
