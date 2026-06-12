import { fail, ok, publicUser } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDemoUsers, readStore } from "@/lib/localStore";

export async function GET() {
  await ensureDemoUsers();
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const db = await readStore();
  const user = db.users.find((item) => item.id === session.id);
  if (!user) return fail("Session user not found", 401);

  const driverProfile = user.role === "driver" ? db.driverProfiles.find((driver) => driver.userId === user.id) : null;
  return ok({ user: publicUser(user), driverProfile });
}
