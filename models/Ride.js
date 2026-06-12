import mongoose from "mongoose";

const RideSchema = new mongoose.Schema(
  {
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "DriverProfile" },
    pickup: { type: String, required: true },
    destination: { type: String, required: true },
    status: {
      type: String,
      enum: ["requested", "accepted", "in_progress", "completed", "cancelled", "rejected"],
      default: "requested"
    },
    fare: { type: Number, default: 20 },
    scheduledFor: Date,
    paymentMethod: { type: String, enum: ["cash", "upi", "qr"], default: "cash" },
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date
  },
  { timestamps: true }
);

export default mongoose.models.Ride || mongoose.model("Ride", RideSchema);
