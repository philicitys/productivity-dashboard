import type { AppState } from "./types";

// Seed content shown the first time the app runs (empty DB).
// Tailored a little toward a nursing / clinicals student — edit freely.
export function defaultState(): AppState {
  const now = new Date().toISOString();
  return {
    version: 1,
    tasks: [
      {
        id: "seed-task-1",
        title: "Refill and label clinical badge + supplies",
        priority: "medium",
        due: null,
        done: false,
        createdAt: now,
      },
      {
        id: "seed-task-2",
        title: "Email professor about make-up lab",
        priority: "high",
        due: null,
        done: false,
        createdAt: now,
      },
    ],
    habits: [
      {
        id: "seed-habit-1",
        name: "Review notes 30 min",
        icon: "📚",
        color: "#785b4e",
        goal: 5,
        createdAt: now,
        log: {},
      },
      {
        id: "seed-habit-2",
        name: "Sleep by 11pm",
        icon: "😴",
        color: "#7a816c",
        goal: 6,
        createdAt: now,
        log: {},
      },
      {
        id: "seed-habit-3",
        name: "Move / workout",
        icon: "💪",
        color: "#d68d84",
        goal: 4,
        createdAt: now,
        log: {},
      },
    ],
    goals: [
      {
        id: "seed-goal-1",
        title: "Clinical hours this term",
        target: 120,
        current: 36,
        unit: "hrs",
        done: false,
        createdAt: now,
      },
    ],
    school: {
      assignments: [
        {
          id: "seed-a-1",
          title: "Pharmacology Chapter 12 quiz",
          course: "Pharmacology",
          type: "exam",
          due: null,
          estimatedHours: 3,
          done: false,
          createdAt: now,
        },
        {
          id: "seed-a-2",
          title: "Care plan write-up",
          course: "Med-Surg",
          type: "project",
          due: null,
          estimatedHours: 5,
          done: false,
          createdAt: now,
        },
      ],
      studyBlocks: [],
      clinicals: [
        {
          id: "seed-c-1",
          site: "General Hospital",
          unit: "Med-Surg 4W",
          date: new Date().toISOString().slice(0, 10),
          start: "06:45",
          end: "15:00",
          preceptor: "",
          prepDone: false,
          paperworkDone: false,
          createdAt: now,
        },
      ],
    },
    weekly: {},
    updatedAt: now,
  };
}
