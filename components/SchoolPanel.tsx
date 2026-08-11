"use client";

import { useState } from "react";
import { useAppState } from "./StateProvider";
import { Button, Card, Empty, Input, Pill, SectionTitle, Select, relativeDue } from "./ui";
import { uid } from "@/lib/id";
import { celebrate } from "@/lib/celebrate";
import type { Assignment, AssignmentType, Clinical, StudyBlock } from "@/lib/types";

const SUB = [
  { id: "assignments", label: "Assignments" },
  { id: "study", label: "Study blocks" },
  { id: "clinicals", label: "Clinicals" },
] as const;
type Sub = (typeof SUB)[number]["id"];

export default function SchoolPanel() {
  const [sub, setSub] = useState<Sub>("assignments");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1">
        {SUB.map((s) => (
          <button
            key={s.id}
            onClick={() => setSub(s.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              sub === s.id ? "bg-brand text-white" : "text-muted hover:text-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {sub === "assignments" && <Assignments />}
      {sub === "study" && <StudyBlocks />}
      {sub === "clinicals" && <Clinicals />}
    </div>
  );
}

/* ---------------- Assignments ---------------- */

const TYPES: AssignmentType[] = ["homework", "project", "exam", "reading", "study", "other"];

function Assignments() {
  const { state, update } = useAppState();
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [type, setType] = useState<AssignmentType>("homework");
  const [due, setDue] = useState("");
  const [hours, setHours] = useState("");

  function add() {
    if (!title.trim()) return;
    const a: Assignment = {
      id: uid("asgn"),
      title: title.trim(),
      course: course.trim() || "General",
      type,
      due: due || null,
      estimatedHours: hours ? Number(hours) : undefined,
      done: false,
      createdAt: new Date().toISOString(),
    };
    update((d) => {
      d.school.assignments.unshift(a);
      return d;
    });
    setTitle("");
    setDue("");
    setHours("");
  }

  function toggle(id: string, el?: HTMLElement | null) {
    let becameDone = false;
    update((d) => {
      const a = d.school.assignments.find((x) => x.id === id);
      if (a) {
        a.done = !a.done;
        becameDone = a.done;
      }
      return d;
    });
    if (becameDone) celebrate(el ?? null);
  }
  function remove(id: string) {
    update((d) => {
      d.school.assignments = d.school.assignments.filter((x) => x.id !== id);
      return d;
    });
  }

  const items = [...state.school.assignments].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.due && b.due) return a.due < b.due ? -1 : 1;
    if (a.due) return -1;
    if (b.due) return 1;
    return 0;
  });

  return (
    <Card>
      <SectionTitle
        title="Assignments"
        count={state.school.assignments.filter((a) => !a.done).length}
      />
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input value={title} placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
        <Input value={course} placeholder="Course" onChange={(e) => setCourse(e.target.value)} />
        <Select value={type} onChange={(e) => setType(e.target.value as AssignmentType)}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="flex-1" />
          <Input
            type="number"
            value={hours}
            placeholder="hrs"
            onChange={(e) => setHours(e.target.value)}
            className="w-20"
          />
        </div>
      </div>
      <Button onClick={add} className="mb-4">
        Add assignment
      </Button>

      {items.length === 0 ? (
        <Empty>No assignments yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => {
            const rd = relativeDue(a.due);
            return (
              <li key={a.id} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2">
                <input
                  type="checkbox"
                  checked={a.done}
                  onChange={(e) => toggle(a.id, e.currentTarget)}
                  className="h-4 w-4 accent-[rgb(var(--brand))]"
                />
                <div className="flex-1">
                  <div className={`text-sm ${a.done ? "text-muted line-through" : "text-ink"}`}>
                    {a.title}
                  </div>
                  <div className="text-xs text-muted">
                    {a.course} · {a.type}
                    {a.estimatedHours ? ` · ~${a.estimatedHours}h` : ""}
                  </div>
                </div>
                {rd.label && !a.done && <Pill tone={rd.tone}>{rd.label}</Pill>}
                <button onClick={() => remove(a.id)} className="text-muted hover:text-red-500">
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

/* ---------------- Study blocks ---------------- */

function StudyBlocks() {
  const { state, update } = useAppState();
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  function add() {
    if (!title.trim() || !date || !start || !end) return;
    const b: StudyBlock = {
      id: uid("block"),
      title: title.trim(),
      course: course.trim() || undefined,
      date,
      start,
      end,
      createdAt: new Date().toISOString(),
    };
    update((d) => {
      d.school.studyBlocks.push(b);
      return d;
    });
    setTitle("");
    setCourse("");
  }
  function remove(id: string) {
    update((d) => {
      d.school.studyBlocks = d.school.studyBlocks.filter((x) => x.id !== id);
      return d;
    });
  }

  const upcoming = [...state.school.studyBlocks].sort((a, b) =>
    a.date + a.start < b.date + b.start ? -1 : 1
  );

  return (
    <Card>
      <SectionTitle title="Study blocks" count={state.school.studyBlocks.length} />
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input value={title} placeholder="What to study" onChange={(e) => setTitle(e.target.value)} />
        <Input value={course} placeholder="Course (optional)" onChange={(e) => setCourse(e.target.value)} />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="flex-1" />
          <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="flex-1" />
        </div>
      </div>
      <Button onClick={add} className="mb-4">
        Add block
      </Button>

      {upcoming.length === 0 ? (
        <Empty>No study blocks scheduled.</Empty>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((b) => (
            <li key={b.id} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2">
              <div className="w-24 text-xs text-muted">
                {new Date(b.date + "T00:00:00").toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="flex-1">
                <div className="text-sm text-ink">{b.title}</div>
                <div className="text-xs text-muted">
                  {b.start}–{b.end}
                  {b.course ? ` · ${b.course}` : ""}
                </div>
              </div>
              <button onClick={() => remove(b.id)} className="text-muted hover:text-red-500">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ---------------- Clinicals ---------------- */

function Clinicals() {
  const { state, update } = useAppState();
  const [site, setSite] = useState("");
  const [unit, setUnit] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [preceptor, setPreceptor] = useState("");

  function add() {
    if (!site.trim() || !date) return;
    const c: Clinical = {
      id: uid("clin"),
      site: site.trim(),
      unit: unit.trim() || undefined,
      date,
      start: start || "07:00",
      end: end || "15:00",
      preceptor: preceptor.trim() || undefined,
      prepDone: false,
      paperworkDone: false,
      createdAt: new Date().toISOString(),
    };
    update((d) => {
      d.school.clinicals.push(c);
      return d;
    });
    setSite("");
    setUnit("");
    setPreceptor("");
  }
  function toggleFlag(id: string, key: "prepDone" | "paperworkDone") {
    update((d) => {
      const c = d.school.clinicals.find((x) => x.id === id);
      if (c) c[key] = !c[key];
      return d;
    });
  }
  function remove(id: string) {
    update((d) => {
      d.school.clinicals = d.school.clinicals.filter((x) => x.id !== id);
      return d;
    });
  }

  const shifts = [...state.school.clinicals].sort((a, b) =>
    a.date + a.start < b.date + b.start ? -1 : 1
  );

  return (
    <Card>
      <SectionTitle title="Clinicals" count={state.school.clinicals.length} />
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input value={site} placeholder="Site / hospital" onChange={(e) => setSite(e.target.value)} />
        <Input value={unit} placeholder="Unit / floor" onChange={(e) => setUnit(e.target.value)} />
        <Input value={preceptor} placeholder="Preceptor (optional)" onChange={(e) => setPreceptor(e.target.value)} />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="flex-1" />
          <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="flex-1" />
        </div>
      </div>
      <Button onClick={add} className="mb-4">
        Add clinical shift
      </Button>

      {shifts.length === 0 ? (
        <Empty>No clinical shifts scheduled.</Empty>
      ) : (
        <ul className="space-y-2">
          {shifts.map((c) => {
            const rd = relativeDue(c.date);
            return (
              <li key={c.id} className="rounded-lg border border-line px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-ink">
                      {c.site}
                      {c.unit ? ` · ${c.unit}` : ""}
                    </div>
                    <div className="text-xs text-muted">
                      {new Date(c.date + "T00:00:00").toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {c.start}–{c.end}
                      {c.preceptor ? ` · ${c.preceptor}` : ""}
                    </div>
                  </div>
                  {rd.label && <Pill tone={rd.tone}>{rd.label}</Pill>}
                  <button onClick={() => remove(c.id)} className="text-muted hover:text-red-500">
                    ✕
                  </button>
                </div>
                <div className="mt-2 flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 text-muted">
                    <input
                      type="checkbox"
                      checked={c.prepDone}
                      onChange={() => toggleFlag(c.id, "prepDone")}
                      className="h-3.5 w-3.5 accent-[rgb(var(--brand))]"
                    />
                    Prep done
                  </label>
                  <label className="flex items-center gap-1.5 text-muted">
                    <input
                      type="checkbox"
                      checked={c.paperworkDone}
                      onChange={() => toggleFlag(c.id, "paperworkDone")}
                      className="h-3.5 w-3.5 accent-[rgb(var(--brand))]"
                    />
                    Paperwork done
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
