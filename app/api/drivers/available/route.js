import { ok, publicUser } from "@/lib/api";
import { ensureDemoUsers } from "@/lib/localStore";

export async function GET() {
  const db = await ensureDemoUsers();
  const drivers = db.driverProfiles
    .filter((driver) => driver.availability === "online" && driver.verificationStatus === "verified")
    .map((driver) => ({
      ...driver,
      user: publicUser(db.users.find((user) => user.id === driver.userId))
    }));

  return ok({ drivers });
}
