import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

const COOKIE_NAME = "admin_session";
const EXPIRES_IN_MS = 60 * 60 * 24 * 14 * 1000; // 14 dias (maximo permitido pelo Firebase)

export async function createAdminSession(idToken: string) {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN_MS });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: EXPIRES_IN_MS / 1000,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await adminAuth.verifySessionCookie(token, true);
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
