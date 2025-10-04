import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema({
  expense: { type: mongoose.Schema.Types.ObjectId, ref: "Expense", required: true },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Pending","Approved","Rejected"], default: "Pending" },
  comment: String,
  step: { type: Number, default: 1 }, // sequence step in workflow
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Approval", approvalSchema);
