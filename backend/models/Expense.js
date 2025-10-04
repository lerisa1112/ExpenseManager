import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  originalCurrency: String,
  convertedAmount: Number,
  category: String,
  description: String,
  date: String,
  status: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  approvalHistory: Array,
  receiptUrl: String,
  submittedAt: String
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
