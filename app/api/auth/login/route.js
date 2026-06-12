import bcrypt from "bcryptjs";
import { fail, ok, publicUser } from "@/lib/api";
import { loginSchema } from "@/lib/validators";
import { ensureDemoUsers, readStore } from "@/lib/localStore";
import { signToken, setSessionCookie } from "@/lib/auth";
import { DriverProfile, ensureDemoMongoUsers, serializeDriver, serializeUser, useMongoStore, User } from "@/lib/mongoStore";

export async function POST(request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid login details", 422, parsed.error.flatten());

  if (await useMongoStore()) {
    await ensureDemoMongoUsers();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user) return fail("Invalid email or password", 401);

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return fail("Invalid email or password", 401);

    await setSessionCookie(signToken(user));
    const driverProfile = user.role === "driver" ? await DriverProfile.findOne({ user: user._id }) : null;
    return ok({ user: serializeUser(user), driverProfile: serializeDriver(driverProfile) });
  }

  const db = await ensureDemoUsers();
  const user = db.users.find((item) => item.email === parsed.data.email.toLowerCase());
  if (!user) return fail("Invalid email or password", 401);

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return fail("Invalid email or password", 401);

  await setSessionCookie(signToken(user));
  const driverProfile = user.role === "driver" ? db.driverProfiles.find((driver) => driver.userId === user.id) : null;
  return ok({ user: publicUser(user), driverProfile });
}
