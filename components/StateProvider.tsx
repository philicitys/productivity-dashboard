"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AppState } from "@/lib/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Ctx {
  state: AppState;
  update: (updater: (draft: AppState) => AppState) => void;
  saveStatus: SaveStatus;
}

const StateContext = createContext<Ctx | null>(null);

export function useAppState() {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useAppState must be used inside StateProvider");
  return ctx;
}

export default function StateProvider({
  initialState,
  children,
}: {
  initialState: AppState;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AppState>(initialState);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  const persist = useCallback(async (next: AppState) => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, []);

  // Debounced autosave whenever state changes (skips the initial mount).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(state), 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, persist]);

  const update = useCallback((updater: (draft: AppState) => AppState) => {
    setState((prev) => updater(structuredClone(prev)));
  }, []);

  return (
    <StateContext.Provider value={{ state, update, saveStatus }}>
      {children}
    </StateContext.Provider>
  );
}
