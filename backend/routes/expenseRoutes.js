import express from 'express';
import { getExpenses, addExpense } from '../controllers/expenseController.js';
const router = express.Router();

router.get('/', getExpenses);
router.post('/', addExpense);

export default router;
