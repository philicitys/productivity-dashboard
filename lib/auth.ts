import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "pd_auth";

function secret() {
  return process.env.AUTH_SECRET || "insecure-dev-secret-change-me";
}

// Deterministic token derived from the password + secret.
// The raw password is never stored in the cookie.
export function expectedToken(): string {
  const password = process.env.APP_PASSWORD || "";
  return createHmac("sha256", secret()).update(`v1:${password}`).digest("hex");
}

export function verifyPassword(input: string): boolean {
  const password = process.env.APP_PASSWORD || "";
  if (!password) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(password);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function tokenIsValid(token: string | undefined): boolean {
  if (!token) return false;
  const expected = expectedToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isAuthed(): boolean {
  const token = cookies().get(AUTH_COOKIE)?.value;
  return tokenIsValid(token);
}
