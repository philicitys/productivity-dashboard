// The entire app state is persisted as one flexible JSON object in Neon.
// Add fields freely — the DB stores whatever shape you give it.

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  due?: string | null; // ISO date (yyyy-mm-dd)
  done: boolean;
  createdAt: string; // ISO datetime
  completedAt?: string | null;
}

export interface Habit {
  id: string;
  name: string;
  icon: string; // emoji
  color: string;
  goal: number; // target days per week (1-7)
  createdAt: string;
  // Map of yyyy-mm-dd -> true for days completed
  log: Record<string, boolean>;
}

export interface Goal {
  id: string;
  title: string;
  detail?: string;
  target: number; // e.g. 100
  current: number; // e.g. 40
  unit?: string; // e.g. "hours", "%"
  due?: string | null;
  done: boolean;
  createdAt: string;
}

export type AssignmentType =
  | "homework"
  | "project"
  | "exam"
  | "reading"
  | "study"
  | "other";

export interface Assignment {
  id: string;
  title: string;
  course: string;
  type: AssignmentType;
  due?: string | null;
  estimatedHours?: number;
  done: boolean;
  notes?: string;
  createdAt: string;
}

export interface StudyBlock {
  id: string;
  title: string;
  course?: string;
  date: string; // yyyy-mm-dd
  start: string; // HH:mm
  end: string; // HH:mm
  createdAt: string;
}

export interface Clinical {
  id: string;
  site: string;
  unit?: string;
  date: string; // yyyy-mm-dd
  start: string; // HH:mm
  end: string; // HH:mm
  preceptor?: string;
  prepDone: boolean;
  paperworkDone: boolean;
  notes?: string;
  createdAt: string;
}

export interface School {
  assignments: Assignment[];
  studyBlocks: StudyBlock[];
  clinicals: Clinical[];
}

// A generic calendar event (appointment, birthday, reminder…).
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  createdAt: string;
}

// Per-week notes keyed by ISO week (e.g. "2026-W33"): a focus and a reflection.
export interface WeekNotes {
  focus?: string;
  reflection?: string;
}

export interface AppState {
  version: number;
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  school: School;
  events: CalendarEvent[];
  weekly: Record<string, WeekNotes>;
  updatedAt?: string;
}
