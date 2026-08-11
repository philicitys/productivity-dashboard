"use client";

import { useState } from "react";
import { useAppState } from "./StateProvider";
import { Button, Card, Empty, Input, SectionTitle } from "./ui";
import { uid } from "@/lib/id";
import { celebrate } from "@/lib/celebrate";
import type { Goal } from "@/lib/types";

export default function GoalsPanel() {
  const { state, update } = useAppState();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");

  function add() {
    if (!title.trim() || !target) return;
    const goal: Goal = {
      id: uid("goal"),
      title: title.trim(),
      target: Number(target) || 1,
      current: 0,
      unit: unit.trim() || undefined,
      done: false,
      createdAt: new Date().toISOString(),
    };
    update((d) => {
      d.goals.push(goal);
      return d;
    });
    setTitle("");
    setTarget("");
    setUnit("");
  }

  function step(id: string, delta: number, el?: HTMLElement | null) {
    let justCompleted = false;
    update((d) => {
      const g = d.goals.find((x) => x.id === id);
      if (g) {
        const wasDone = g.done;
        g.current = Math.max(0, Math.min(g.target, g.current + delta));
        g.done = g.current >= g.target;
        justCompleted = g.done && !wasDone;
      }
      return d;
    });
    if (justCompleted) celebrate(el ?? null);
  }

  function setCurrent(id: string, value: number) {
    update((d) => {
      const g = d.goals.find((x) => x.id === id);
      if (g) {
        g.current = Math.max(0, Math.min(g.target, value));
        g.done = g.current >= g.target;
      }
      return d;
    });
  }

  function remove(id: string) {
    update((d) => {
      d.goals = d.goals.filter((x) => x.id !== id);
      return d;
    });
  }

  return (
    <Card>
      <SectionTitle title="Goals" count={state.goals.filter((g) => !g.done).length} />

      <div className="mb-5 flex flex-wrap gap-2">
        <Input
          value={title}
          placeholder="Goal (e.g. Clinical hours)"
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-[160px] flex-1"
        />
        <Input
          type="number"
          value={target}
          placeholder="Target"
          onChange={(e) => setTarget(e.target.value)}
          className="w-24"
        />
        <Input
          value={unit}
          placeholder="Unit"
          onChange={(e) => setUnit(e.target.value)}
          className="w-24"
        />
        <Button onClick={add}>Add</Button>
      </div>

      {state.goals.length === 0 ? (
        <Empty>No goals yet.</Empty>
      ) : (
        <div className="space-y-4">
          {state.goals.map((g) => {
            const pct = Math.round((g.current / g.target) * 100);
            return (
              <div key={g.id} className="rounded-lg border border-line p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">
                    {g.title} {g.done && "✅"}
                  </span>
                  <button
                    onClick={() => remove(g.id)}
                    className="text-muted hover:text-red-500"
                    aria-label="Delete goal"
                  >
                    ✕
                  </button>
                </div>
                <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Button variant="ghost" onClick={() => step(g.id, -1)}>
                    −
                  </Button>
                  <input
                    type="number"
                    value={g.current}
                    onChange={(e) => setCurrent(g.id, Number(e.target.value))}
                    className="w-16 rounded-lg border border-line bg-surface px-2 py-1 text-center text-ink outline-none focus:border-brand"
                  />
                  <span>
                    / {g.target} {g.unit || ""} · {pct}%
                  </span>
                  <Button variant="ghost" onClick={(e) => step(g.id, 1, e.currentTarget)}>
                    +
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
