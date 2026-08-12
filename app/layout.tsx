import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Welcome, that girl",
  description: "Personal tasks, habits, goals, and school planner.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
