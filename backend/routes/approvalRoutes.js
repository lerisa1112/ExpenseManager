import express from "express";
import { approveExpense, rejectExpense } from "../controllers/approvalController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/approve", protect, authorize("Manager","Admin"), approveExpense);
router.post("/reject", protect, authorize("Manager","Admin"), rejectExpense);

export default router;
