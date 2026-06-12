import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["cash", "upi", "qr"], required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    transactionRef: String
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
