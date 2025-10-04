import axios from "axios";

const API_URL = "http://localhost:5000/api/expenses";

// Add new expense
export const addExpense = async (expense) => {
  const res = await axios.post(API_URL, expense);
  return res.data;
};

// Get all expenses
export const getExpenses = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
