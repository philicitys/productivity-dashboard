import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { loadState, saveState } from "@/lib/db";
import type { AppState } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const state = await loadState();
    return NextResponse.json(state);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as AppState;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const saved = await saveState(body);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save" }, { status: 500 });
  }
}
