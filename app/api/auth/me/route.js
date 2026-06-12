import { fail, ok, publicUser } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDemoUsers, readStore } from "@/lib/localStore";
import { DriverProfile, ensureDemoMongoUsers, serializeDriver, serializeUser, useMongoStore, User } from "@/lib/mongoStore";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  if (await useMongoStore()) {
    await ensureDemoMongoUsers();
    const user = await User.findById(session.id);
    if (!user) return fail("Session user not found", 401);

    const driverProfile = user.role === "driver" ? await DriverProfile.findOne({ user: user._id }) : null;
    return ok({ user: serializeUser(user), driverProfile: serializeDriver(driverProfile) });
  }

  await ensureDemoUsers();
  const db = await readStore();
  const user = db.users.find((item) => item.id === session.id);
  if (!user) return fail("Session user not found", 401);

  const driverProfile = user.role === "driver" ? db.driverProfiles.find((driver) => driver.userId === user.id) : null;
  return ok({ user: publicUser(user), driverProfile });
}
