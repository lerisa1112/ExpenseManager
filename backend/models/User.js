import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ['Admin', 'Manager', 'Employee'], default: 'Employee' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  companyId: String
});

const User = mongoose.model('User', userSchema);
export default User;
