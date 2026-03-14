import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plan: { type: String, enum: ['free', 'premium'], default: 'premium' },
    dailyUsageCount: { type: Number, default: 0 },
    lastUsageDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
