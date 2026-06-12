import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const dbPath = path.join(process.cwd(), "data", "local-db.json");

const seed = {
  users: [],
  driverProfiles: [],
  rides: [],
  ratings: [],
  payments: []
};

async function ensureDb() {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(seed, null, 2));
  }
}

export async function readStore() {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(raw);
}

export async function writeStore(data) {
  await ensureDb();
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function ensureDemoUsers() {
  const db = await readStore();
  if (db.users.length) return db;

  const passenger = {
    id: makeId("usr"),
    name: "Aarav Passenger",
    email: "passenger@campus.test",
    passwordHash: await bcrypt.hash("password123", 10),
    role: "passenger",
    phone: "9999999991",
    department: "Architecture",
    year: "2nd Year",
    createdAt: new Date().toISOString()
  };

  const driver = {
    id: makeId("usr"),
    name: "Ramesh Driver",
    email: "driver@campus.test",
    passwordHash: await bcrypt.hash("password123", 10),
    role: "driver",
    phone: "9999999992",
    department: "",
    year: "",
    createdAt: new Date().toISOString()
  };

  db.users.push(passenger, driver);
  db.driverProfiles.push({
    id: makeId("drv"),
    userId: driver.id,
    vehicleNumber: "UK08 ER 2046",
    vehicleType: "E-Rickshaw",
    licenseNumber: "DL-IITR-0246",
    verificationStatus: "verified",
    availability: "online",
    currentLocation: "Main Building",
    latitude: 29.8649,
    longitude: 77.8958,
    totalRides: 0,
    averageRating: 0,
    createdAt: new Date().toISOString()
  });

  await writeStore(db);
  return db;
}
