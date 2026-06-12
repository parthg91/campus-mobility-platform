import { fail, ok } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { readStore } from "@/lib/localStore";
import { DriverProfile, Rating, Ride, useMongoStore } from "@/lib/mongoStore";

function movingAverageForecast(byHour) {
  const active = byHour.filter((item) => item.rides > 0);
  if (active.length === 0) return [];

  const top = [...byHour]
    .sort((a, b) => b.rides - a.rides)
    .slice(0, 6);

  return top.map((item) => {
    const prev1 = byHour[(item.hour - 1 + 24) % 24].rides;
    const prev2 = byHour[(item.hour - 2 + 24) % 24].rides;
    const forecast = Math.round((item.rides * 3 + prev1 * 2 + prev2 * 1) / 6);
    return { label: `${item.hour}:00`, actual: item.rides, demand: forecast };
  }).sort((a, b) => b.demand - a.demand).slice(0, 3);
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  if (await useMongoStore()) {
    const [rides, ratings, onlineDrivers] = await Promise.all([
      Ride.find({}),
      Rating.find({}),
      DriverProfile.countDocuments({ availability: "online" })
    ]);
    const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, rides: 0 }));
    const locations = {};

    rides.forEach((ride) => {
      const hour = new Date(ride.createdAt).getHours();
      byHour[hour].rides += 1;
      locations[ride.pickup] = (locations[ride.pickup] || 0) + 1;
    });

    const popularPickups = Object.entries(locations)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const activeRides = rides.filter((ride) => ["requested", "scheduled", "accepted", "in_progress"].includes(ride.status)).length;
    const completedRides = rides.filter((ride) => ride.status === "completed").length;

    return ok({
      stats: {
        totalRides: rides.length,
        activeRides,
        completedRides,
        onlineDrivers,
        averageRating: ratings.length
          ? Number((ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length).toFixed(2))
          : 0
      },
      byHour,
      popularPickups,
      forecast: movingAverageForecast(byHour)
    });
  }

  const db = await readStore();
  const rides = db.rides;
  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, rides: 0 }));
  const locations = {};

  rides.forEach((ride) => {
    const hour = new Date(ride.createdAt).getHours();
    byHour[hour].rides += 1;
    locations[ride.pickup] = (locations[ride.pickup] || 0) + 1;
  });

  const popularPickups = Object.entries(locations)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const activeRides = rides.filter((ride) => ["requested", "accepted", "in_progress"].includes(ride.status)).length;
  const completedRides = rides.filter((ride) => ride.status === "completed").length;
  const onlineDrivers = db.driverProfiles.filter((driver) => driver.availability === "online").length;

  return ok({
    stats: {
      totalRides: rides.length,
      activeRides,
      completedRides,
      onlineDrivers,
      averageRating: db.ratings.length
        ? Number((db.ratings.reduce((sum, rating) => sum + rating.score, 0) / db.ratings.length).toFixed(2))
        : 0
    },
    byHour,
    popularPickups,
    forecast: movingAverageForecast(byHour)
  });
}
