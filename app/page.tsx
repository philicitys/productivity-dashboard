import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { loadState } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!isAuthed()) {
    redirect("/login");
  }
  const initialState = await loadState();
  return <DashboardClient initialState={initialState} />;
}
