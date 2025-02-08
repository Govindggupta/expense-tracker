import express from 'express';
import {
  createWallet,
  getAllWallets,
  updateWallet,
  deleteWallet,
} from '../controllers/wallet.controller.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

router.post('/', requireAuth(), createWallet);
router.get('/', requireAuth(), getAllWallets);
router.put('/:id', requireAuth(), updateWallet);
router.delete('/:id', requireAuth(), deleteWallet);

export default router;
