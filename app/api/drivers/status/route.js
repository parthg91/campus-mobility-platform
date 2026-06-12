import { fail, ok } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { emitRealtime } from "@/lib/realtime";
import { readStore, writeStore } from "@/lib/localStore";

export async function PATCH(request) {
  const session = await getSessionUser();
  if (!session || session.role !== "driver") return fail("Driver access required", 403);

  const { availability, currentLocation, latitude, longitude } = await request.json();
  if (!["online", "offline", "busy"].includes(availability)) return fail("Invalid availability", 422);

  const db = await readStore();
  const driver = db.driverProfiles.find((item) => item.userId === session.id);
  if (!driver) return fail("Driver profile not found", 404);

  driver.availability = availability;
  if (currentLocation) driver.currentLocation = currentLocation;
  if (Number.isFinite(latitude)) driver.latitude = latitude;
  if (Number.isFinite(longitude)) driver.longitude = longitude;
  driver.updatedAt = new Date().toISOString();

  await writeStore(db);
  emitRealtime("driver:availability", { driver }, ["passengers", "drivers"]);
  return ok({ driver });
}
