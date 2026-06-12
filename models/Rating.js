import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "DriverProfile", required: true },
    score: { type: Number, min: 1, max: 5, required: true },
    feedback: String
  },
  { timestamps: true }
);

export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema);
