import { ok, publicUser } from "@/lib/api";
import { ensureDemoUsers } from "@/lib/localStore";
import { DriverProfile, serializeDriver, useMongoStore } from "@/lib/mongoStore";

export async function GET() {
  if (await useMongoStore()) {
    const drivers = await DriverProfile.find({ availability: "online", verificationStatus: "verified" }).populate("user");
    return ok({ drivers: drivers.map(serializeDriver) });
  }

  const db = await ensureDemoUsers();
  const drivers = db.driverProfiles
    .filter((driver) => driver.availability === "online" && driver.verificationStatus === "verified")
    .map((driver) => ({
      ...driver,
      user: publicUser(db.users.find((user) => user.id === driver.userId))
    }));

  return ok({ drivers });
}
