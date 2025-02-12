import express from 'express';
import { requireAuth } from '@clerk/express';
import {
  expenseOverview,
  incomeOverview,
  walletAnalysis,
  getExpenseOverviewByPeriod,
  getIncomeOverviewByPeriod,
  getWalletAnalysisByPeriod,
} from '../controllers/analysis.controller.js';

const router = express.Router();

// Existing routes
router.get('/expense-overview', requireAuth(), expenseOverview);
router.get('/income-overview', requireAuth(), incomeOverview);
router.get('/wallet-analysis', requireAuth(), walletAnalysis);

// New routes for time-based analysis
router.get('/expense-overview/period', requireAuth(), getExpenseOverviewByPeriod);
router.get('/income-overview/period', requireAuth(), getIncomeOverviewByPeriod);
router.get('/wallet-analysis/period', requireAuth(), getWalletAnalysisByPeriod);

export default router;