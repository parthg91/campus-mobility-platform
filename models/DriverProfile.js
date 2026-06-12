import mongoose from "mongoose";

const DriverProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicleNumber: { type: String, required: true },
    vehicleType: { type: String, default: "E-Rickshaw" },
    licenseNumber: { type: String, required: true },
    verificationId: String,
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    availability: { type: String, enum: ["online", "offline", "busy"], default: "offline" },
    currentLocation: String,
    latitude: Number,
    longitude: Number,
    averageRating: { type: Number, default: 0 },
    totalRides: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.DriverProfile || mongoose.model("DriverProfile", DriverProfileSchema);
