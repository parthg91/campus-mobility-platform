import bcrypt from "bcryptjs";
import { fail, ok, publicUser } from "@/lib/api";
import { loginSchema } from "@/lib/validators";
import { ensureDemoUsers, readStore } from "@/lib/localStore";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid login details", 422, parsed.error.flatten());

  const db = await ensureDemoUsers();
  const user = db.users.find((item) => item.email === parsed.data.email.toLowerCase());
  if (!user) return fail("Invalid email or password", 401);

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return fail("Invalid email or password", 401);

  await setSessionCookie(signToken(user));
  const driverProfile = user.role === "driver" ? db.driverProfiles.find((driver) => driver.userId === user.id) : null;
  return ok({ user: publicUser(user), driverProfile });
}
