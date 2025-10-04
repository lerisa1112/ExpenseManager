import Expense from "../models/Expense.js";

export const approveExpense = async (req,res)=>{
  try{
    const { expenseId, comment } = req.body;

    const expense = await Expense.findById(expenseId);
    if(!expense) return res.status(404).json({ message: "Expense not found" });

    expense.approvals.push({
      approver: req.user._id,
      status: "Approved",
      comment
    });

    // Simple rule: all approvers approved → mark expense Approved
    const allApproved = expense.approvals.every(a => a.status === "Approved");
    if(allApproved) expense.status = "Approved";

    await expense.save();
    res.json(expense);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}

export const rejectExpense = async (req,res)=>{
  try{
    const { expenseId, comment } = req.body;

    const expense = await Expense.findById(expenseId);
    if(!expense) return res.status(404).json({ message: "Expense not found" });

    expense.approvals.push({
      approver: req.user._id,
      status: "Rejected",
      comment
    });

    expense.status = "Rejected";

    await expense.save();
    res.json(expense);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}
