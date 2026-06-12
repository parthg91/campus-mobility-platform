import { fail, ok, publicUser } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { emitRealtime } from "@/lib/realtime";
import { readStore, writeStore } from "@/lib/localStore";

function enrichRide(db, ride) {
  const passenger = db.users.find((user) => user.id === ride.passengerId);
  const driver = db.driverProfiles.find((item) => item.id === ride.driverId);
  return {
    ...ride,
    passenger: publicUser(passenger),
    driver: driver ? { ...driver, user: publicUser(db.users.find((user) => user.id === driver.userId)) } : null,
    rating: db.ratings.find((rating) => rating.rideId === ride.id) || null,
    payment: db.payments.find((payment) => payment.rideId === ride.id) || null
  };
}

export async function PATCH(request, { params }) {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const { id } = await params;
  const { action } = await request.json();
  const db = await readStore();
  const ride = db.rides.find((item) => item.id === id);
  if (!ride) return fail("Ride not found", 404);

  const driver = db.driverProfiles.find((item) => item.userId === session.id);

  if (action === "accept") {
    if (session.role !== "driver" || !driver) return fail("Driver access required", 403);
    if (driver.availability !== "online") return fail("You are not available to accept rides", 409);
    if (ride.status !== "requested" || ride.driverId) return fail("Ride has already been assigned", 409);
    ride.driverId = driver.id;
    ride.status = "accepted";
    driver.availability = "busy";
  } else if (action === "reject") {
    if (session.role !== "driver") return fail("Driver access required", 403);
    return ok({ ride: enrichRide(db, ride), rejected: true });
  } else if (action === "start") {
    if (ride.driverId !== driver?.id || ride.status !== "accepted") return fail("Ride cannot be started", 409);
    ride.status = "in_progress";
    ride.startedAt = new Date().toISOString();
  } else if (action === "complete") {
    if (ride.driverId !== driver?.id || ride.status !== "in_progress") return fail("Ride cannot be completed", 409);
    ride.status = "completed";
    ride.completedAt = new Date().toISOString();
    driver.availability = "online";
    driver.totalRides = (driver.totalRides || 0) + 1;
    const payment = db.payments.find((item) => item.rideId === ride.id);
    if (payment) payment.status = "paid";
  } else if (action === "cancel") {
    const canCancel = session.role === "passenger" && ride.passengerId === session.id;
    if (!canCancel && ride.driverId !== driver?.id) return fail("Not allowed to cancel this ride", 403);
    if (["completed", "cancelled"].includes(ride.status)) return fail("Ride cannot be cancelled", 409);
    ride.status = "cancelled";
    ride.cancelledAt = new Date().toISOString();
    const assignedDriver = db.driverProfiles.find(item => item.id === ride.driverId);
    if (assignedDriver) assignedDriver.availability = "online";
  } else {
    return fail("Unsupported ride action", 422);
  }

  ride.updatedAt = new Date().toISOString();
  await writeStore(db);
  const enriched = enrichRide(db, ride);
  emitRealtime("ride:updated", { ride: enriched }, [`ride:${ride.id}`, `user:${ride.passengerId}`, "drivers", "passengers"]);
  return ok({ ride: enriched });
}
