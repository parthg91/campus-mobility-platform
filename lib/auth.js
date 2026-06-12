import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "mobility_token";

export function signToken(user) {
  return jwt.sign(
    { id: user.id || user._id?.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET || "development-secret-change-me",
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "development-secret-change-me");
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

export async function setSessionCookie(token) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}
