import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import DriverProfile from "@/models/DriverProfile";
import Payment from "@/models/Payment";
import Rating from "@/models/Rating";
import Ride from "@/models/Ride";
import User from "@/models/User";

export async function useMongoStore() {
  const conn = await connectDB();
  return Boolean(conn);
}

export function serializeUser(user) {
  if (!user) return null;
  const item = user.toObject ? user.toObject() : user;
  const { _id, __v, passwordHash, ...rest } = item;
  return {
    id: _id?.toString() || item.id,
    ...rest
  };
}

export function serializeDriver(driver) {
  if (!driver) return null;
  const item = driver.toObject ? driver.toObject() : driver;
  const { _id, __v, user, ...rest } = item;
  return {
    id: _id?.toString() || item.id,
    userId: user?._id?.toString?.() || user?.toString?.() || item.userId,
    ...rest,
    user: user?.email ? serializeUser(user) : undefined
  };
}

export function serializePayment(payment) {
  if (!payment) return null;
  const item = payment.toObject ? payment.toObject() : payment;
  const { _id, __v, ride, ...rest } = item;
  return {
    id: _id?.toString() || item.id,
    rideId: ride?._id?.toString?.() || ride?.toString?.() || item.rideId,
    ...rest
  };
}

export function serializeRating(rating) {
  if (!rating) return null;
  const item = rating.toObject ? rating.toObject() : rating;
  const { _id, __v, ride, passenger, driver, ...rest } = item;
  return {
    id: _id?.toString() || item.id,
    rideId: ride?._id?.toString?.() || ride?.toString?.() || item.rideId,
    passengerId: passenger?._id?.toString?.() || passenger?.toString?.() || item.passengerId,
    driverId: driver?._id?.toString?.() || driver?.toString?.() || item.driverId,
    ...rest
  };
}

export function serializeRide(ride, rating = null, payment = null) {
  if (!ride) return null;
  const item = ride.toObject ? ride.toObject() : ride;
  const { _id, __v, passenger, driver, ...rest } = item;
  const passengerId = passenger?._id?.toString?.() || passenger?.toString?.() || item.passengerId;
  const driverId = driver?._id?.toString?.() || driver?.toString?.() || item.driverId || null;

  return {
    id: _id?.toString() || item.id,
    passengerId,
    driverId,
    ...rest,
    passenger: passenger?.email ? serializeUser(passenger) : null,
    driver: driver?.vehicleNumber ? serializeDriver(driver) : null,
    rating: serializeRating(rating),
    payment: serializePayment(payment)
  };
}

export async function ensureDemoMongoUsers() {
  await connectDB();
  if (await User.exists({})) return;

  const passenger = await User.create({
    name: "Aarav Passenger",
    email: "passenger@campus.test",
    passwordHash: await bcrypt.hash("password123", 10),
    role: "passenger",
    phone: "9999999991",
    department: "Architecture",
    year: "2nd Year"
  });

  const driver = await User.create({
    name: "Ramesh Driver",
    email: "driver@campus.test",
    passwordHash: await bcrypt.hash("password123", 10),
    role: "driver",
    phone: "9999999992"
  });

  await DriverProfile.create({
    user: driver._id,
    vehicleNumber: "UK08 ER 2046",
    vehicleType: "E-Rickshaw",
    licenseNumber: "DL-IITR-0246",
    verificationStatus: "verified",
    availability: "online",
    currentLocation: "Main Building",
    latitude: 29.8649,
    longitude: 77.8958,
    totalRides: 0,
    averageRating: 0
  });

  await passenger.save();
}

export { DriverProfile, Payment, Rating, Ride, User };
