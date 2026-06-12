import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["passenger", "driver"]),
  phone: z.string().min(8),
  department: z.string().optional(),
  year: z.string().optional(),
  vehicleNumber: z.string().optional(),
  vehicleType: z.string().optional(),
  licenseNumber: z.string().optional(),
  verificationId: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const rideSchema = z.object({
  pickup: z.string().min(2),
  destination: z.string().min(2),
  scheduledFor: z.string().optional(),
  paymentMethod: z.enum(["cash", "upi", "qr"]).default("cash")
});

export const ratingSchema = z.object({
  rideId: z.string().min(1),
  score: z.number().min(1).max(5),
  feedback: z.string().max(500).optional()
});
