import bcrypt from "bcryptjs";
import { fail, ok, publicUser } from "@/lib/api";
import { registerSchema } from "@/lib/validators";
import { makeId, readStore, writeStore } from "@/lib/localStore";
import { signToken, setSessionCookie } from "@/lib/auth";
import { DriverProfile, serializeDriver, serializeUser, useMongoStore, User } from "@/lib/mongoStore";

export async function POST(request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid registration details", 422, parsed.error.flatten());

  const data = parsed.data;
  if (data.role === "driver" && (!data.vehicleNumber || !data.licenseNumber)) {
    return fail("Vehicle number and license number are required for drivers", 422);
  }

  if (await useMongoStore()) {
    const exists = await User.exists({ email: data.email.toLowerCase() });
    if (exists) return fail("Email is already registered", 409);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(data.password, 10),
      role: data.role,
      phone: data.phone,
      department: data.department || "",
      year: data.year || ""
    });

    const driverProfile = data.role === "driver" ? await DriverProfile.create({
      user: user._id,
      vehicleNumber: data.vehicleNumber,
      vehicleType: data.vehicleType || "E-Rickshaw",
      licenseNumber: data.licenseNumber,
      verificationId: data.verificationId || "",
      verificationStatus: "verified",
      availability: "offline",
      currentLocation: "Campus Gate",
      latitude: 29.8649,
      longitude: 77.8958,
      totalRides: 0,
      averageRating: 0
    }) : null;

    await setSessionCookie(signToken(user));
    return ok({ user: serializeUser(user), driverProfile: serializeDriver(driverProfile) }, 201);
  }

  const db = await readStore();
  const exists = db.users.some((user) => user.email.toLowerCase() === data.email.toLowerCase());
  if (exists) return fail("Email is already registered", 409);

  const user = {
    id: makeId("usr"),
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash: await bcrypt.hash(data.password, 10),
    role: data.role,
    phone: data.phone,
    department: data.department || "",
    year: data.year || "",
    createdAt: new Date().toISOString()
  };

  db.users.push(user);

  if (data.role === "driver") {
    db.driverProfiles.push({
      id: makeId("drv"),
      userId: user.id,
      vehicleNumber: data.vehicleNumber,
      vehicleType: data.vehicleType || "E-Rickshaw",
      licenseNumber: data.licenseNumber,
      verificationId: data.verificationId || "",
      verificationStatus: "verified",
      availability: "offline",
      currentLocation: "Campus Gate",
      latitude: 29.8649,
      longitude: 77.8958,
      totalRides: 0,
      averageRating: 0,
      createdAt: new Date().toISOString()
    });
  }

  await writeStore(db);
  await setSessionCookie(signToken(user));
  return ok({ user: publicUser(user) }, 201);
}
