import { fail, ok, publicUser } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { readStore, writeStore } from "@/lib/localStore";
import { DriverProfile, serializeDriver, serializeUser, useMongoStore, User } from "@/lib/mongoStore";

export async function PATCH(request) {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const body = await request.json();

  if (await useMongoStore()) {
    const user = await User.findById(session.id);
    if (!user) return fail("User not found", 404);

    ["name", "phone", "department", "year"].forEach((field) => {
      if (typeof body[field] === "string") user[field] = body[field];
    });

    let driverProfile = null;
    if (user.role === "driver") {
      driverProfile = await DriverProfile.findOne({ user: user._id });
      if (driverProfile) {
        ["vehicleNumber", "vehicleType", "licenseNumber", "verificationId", "currentLocation"].forEach((field) => {
          if (typeof body[field] === "string") driverProfile[field] = body[field];
        });
        await driverProfile.save();
      }
    }

    await user.save();
    return ok({ user: serializeUser(user), driverProfile: serializeDriver(driverProfile) });
  }

  const db = await readStore();
  const user = db.users.find((item) => item.id === session.id);
  if (!user) return fail("User not found", 404);

  ["name", "phone", "department", "year"].forEach((field) => {
    if (typeof body[field] === "string") user[field] = body[field];
  });

  if (user.role === "driver") {
    const driver = db.driverProfiles.find((item) => item.userId === user.id);
    if (driver) {
      ["vehicleNumber", "vehicleType", "licenseNumber", "verificationId", "currentLocation"].forEach((field) => {
        if (typeof body[field] === "string") driver[field] = body[field];
      });
      driver.updatedAt = new Date().toISOString();
    }
  }

  user.updatedAt = new Date().toISOString();
  await writeStore(db);
  const driverProfile = user.role === "driver" ? db.driverProfiles.find((item) => item.userId === user.id) : null;
  return ok({ user: publicUser(user), driverProfile });
}
