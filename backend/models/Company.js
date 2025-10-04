import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: String,
  currency: { type: String, default: "USD" },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
},{ timestamps: true });

export default mongoose.model("Company", companySchema);
