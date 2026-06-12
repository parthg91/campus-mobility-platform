import { fail, ok, publicUser } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { emitRealtime } from "@/lib/realtime";
import { makeId, readStore, writeStore } from "@/lib/localStore";
import { rideSchema } from "@/lib/validators";

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

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const db = await readStore();
  let rides = db.rides;
  if (session.role === "passenger") rides = rides.filter((ride) => ride.passengerId === session.id);
  if (session.role === "driver") {
    const driver = db.driverProfiles.find((item) => item.userId === session.id);
    rides = rides.filter((ride) => ride.status === "requested" || ride.driverId === driver?.id);
  }

  return ok({ rides: rides.map((ride) => enrichRide(db, ride)).reverse() });
}

export async function POST(request) {
  const session = await getSessionUser();
  if (!session || session.role !== "passenger") return fail("Passenger access required", 403);

  const body = await request.json();
  const parsed = rideSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid ride details", 422, parsed.error.flatten());

  const data = parsed.data;
  const db = await readStore();

  const isScheduled = data.scheduledFor && new Date(data.scheduledFor) > new Date();

  const ride = {
    id: makeId("ride"),
    passengerId: session.id,
    driverId: null,
    pickup: data.pickup,
    destination: data.destination,
    status: isScheduled ? "scheduled" : "requested",
    fare: 20 + Math.floor(Math.random() * 35),
    scheduledFor: data.scheduledFor || null,
    paymentMethod: data.paymentMethod,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.rides.push(ride);
  db.payments.push({
    id: makeId("pay"),
    rideId: ride.id,
    amount: ride.fare,
    method: data.paymentMethod,
    status: data.paymentMethod === "cash" ? "pending" : "paid",
    transactionRef: data.paymentMethod === "cash" ? "" : `TXN-${Date.now()}`,
    createdAt: new Date().toISOString()
  });

  await writeStore(db);
  const enriched = enrichRide(db, ride);

  if (!isScheduled) {
    emitRealtime("ride:requested", { ride: enriched }, ["drivers", "passengers"]);
  } else {
    emitRealtime("ride:requested", { ride: enriched }, [`user:${session.id}`]);
  }

  return ok({ ride: enriched }, 201);
}
