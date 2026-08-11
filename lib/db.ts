import { neon } from "@neondatabase/serverless";
import type { AppState } from "./types";
import { defaultState } from "./defaultState";

// Because everything lives in one flexible JSON object, new fields added over
// time may be missing from older saved state. Fill in safe defaults on load
// so the UI never crashes on undefined keys.
function normalize(state: any): AppState {
  const base = defaultState();
  const s = state && typeof state === "object" ? state : {};
  return {
    version: s.version ?? base.version,
    tasks: Array.isArray(s.tasks) ? s.tasks : [],
    goals: Array.isArray(s.goals) ? s.goals : [],
    habits: Array.isArray(s.habits)
      ? s.habits.map((h: any) => ({
          icon: "✅",
          color: "#785b4e",
          goal: 5,
          log: {},
          ...h,
        }))
      : [],
    school: {
      assignments: Array.isArray(s.school?.assignments) ? s.school.assignments : [],
      studyBlocks: Array.isArray(s.school?.studyBlocks) ? s.school.studyBlocks : [],
      clinicals: Array.isArray(s.school?.clinicals) ? s.school.clinicals : [],
    },
    weekly: s.weekly && typeof s.weekly === "object" ? s.weekly : {},
    updatedAt: s.updatedAt,
  };
}

// A single flexible JSON object is stored in one row of one table.
// Table: app_state(id=1, data jsonb, updated_at timestamptz)

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it in your .env / Vercel env vars.");
  }
  return neon(url);
}

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT single_row CHECK (id = 1)
    )
  `;
  schemaReady = true;
}

export async function loadState(): Promise<AppState> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`SELECT data FROM app_state WHERE id = 1`) as { data: AppState }[];
  if (rows.length === 0) {
    const seed = defaultState();
    await sql`
      INSERT INTO app_state (id, data, updated_at)
      VALUES (1, ${JSON.stringify(seed)}::jsonb, now())
      ON CONFLICT (id) DO NOTHING
    `;
    return seed;
  }
  return normalize(rows[0].data);
}

export async function saveState(state: AppState): Promise<AppState> {
  await ensureSchema();
  const sql = getSql();
  const toSave: AppState = { ...state, updatedAt: new Date().toISOString() };
  await sql`
    INSERT INTO app_state (id, data, updated_at)
    VALUES (1, ${JSON.stringify(toSave)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = now()
  `;
  return toSave;
}
