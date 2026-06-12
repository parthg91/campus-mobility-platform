import { fail, ok } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { emitRealtime } from "@/lib/realtime";
import { makeId, readStore, writeStore } from "@/lib/localStore";
import { ratingSchema } from "@/lib/validators";
import { DriverProfile, Rating, Ride, serializeDriver, serializeRating, useMongoStore } from "@/lib/mongoStore";

export async function POST(request) {
  const session = await getSessionUser();
  if (!session || session.role !== "passenger") return fail("Passenger access required", 403);

  const parsed = ratingSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid rating details", 422, parsed.error.flatten());

  if (await useMongoStore()) {
    const ride = await Ride.findById(parsed.data.rideId);
    if (!ride || ride.passenger?.toString() !== session.id) return fail("Ride not found", 404);
    if (ride.status !== "completed") return fail("Only completed rides can be rated", 409);
    if (await Rating.exists({ ride: ride._id })) return fail("Ride already rated", 409);

    const rating = await Rating.create({
      ride: ride._id,
      passenger: session.id,
      driver: ride.driver,
      score: parsed.data.score,
      feedback: parsed.data.feedback || ""
    });

    const driverRatings = await Rating.find({ driver: ride.driver });
    const driver = await DriverProfile.findById(ride.driver);
    if (driver) {
      driver.averageRating = Number((driverRatings.reduce((sum, item) => sum + item.score, 0) / driverRatings.length).toFixed(2));
      await driver.save();
    }

    const serializedRating = serializeRating(rating);
    const serializedDriver = serializeDriver(driver);
    emitRealtime("rating:created", { rating: serializedRating, driver: serializedDriver }, ["drivers"]);
    return ok({ rating: serializedRating, driver: serializedDriver }, 201);
  }

  const db = await readStore();
  const ride = db.rides.find((item) => item.id === parsed.data.rideId);
  if (!ride || ride.passengerId !== session.id) return fail("Ride not found", 404);
  if (ride.status !== "completed") return fail("Only completed rides can be rated", 409);
  if (db.ratings.some((item) => item.rideId === ride.id)) return fail("Ride already rated", 409);

  const rating = {
    id: makeId("rate"),
    rideId: ride.id,
    passengerId: session.id,
    driverId: ride.driverId,
    score: parsed.data.score,
    feedback: parsed.data.feedback || "",
    createdAt: new Date().toISOString()
  };

  db.ratings.push(rating);
  const driverRatings = db.ratings.filter((item) => item.driverId === ride.driverId);
  const driver = db.driverProfiles.find((item) => item.id === ride.driverId);
  if (driver) {
    driver.averageRating = Number((driverRatings.reduce((sum, item) => sum + item.score, 0) / driverRatings.length).toFixed(2));
  }

  await writeStore(db);
  emitRealtime("rating:created", { rating, driver }, ["drivers"]);
  return ok({ rating, driver }, 201);
}
