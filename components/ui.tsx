"use client";

import React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-card p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand ${props.className || ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand ${props.className || ""}`}
    />
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-brand text-white hover:opacity-90",
    ghost: "border border-line text-ink hover:bg-surface",
    danger: "text-red-500 hover:bg-red-500/10",
  }[variant];
  return (
    <button
      {...rest}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "high" | "medium" | "low" | "done";
}) {
  const tones = {
    default: "bg-surface text-muted",
    high: "bg-red-500/15 text-red-500",
    medium: "bg-amber-500/15 text-amber-600",
    low: "bg-slate-500/15 text-muted",
    done: "bg-emerald-500/15 text-emerald-600",
  }[tone];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones}`}>
      {children}
    </span>
  );
}

export function SectionTitle({
  title,
  count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {typeof count === "number" && (
        <span className="text-sm text-muted">{count}</span>
      )}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
      {children}
    </p>
  );
}

export function relativeDue(due?: string | null): {
  label: string;
  tone: "default" | "high" | "medium" | "low";
} {
  if (!due) return { label: "", tone: "default" };
  const d = new Date(due + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, tone: "high" };
  if (diff === 0) return { label: "Today", tone: "high" };
  if (diff === 1) return { label: "Tomorrow", tone: "medium" };
  if (diff <= 7) return { label: `In ${diff}d`, tone: "medium" };
  return { label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), tone: "low" };
}
