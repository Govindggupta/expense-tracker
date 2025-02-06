import express from 'express';
import {
  createWallet,
  getAllWallets,
  updateWallet,
  deleteWallet,
} from '../controllers/wallet.controller.js';

const router = express.Router();

router.post('/', createWallet);
router.get('/', getAllWallets);
router.put('/:id', updateWallet);
router.delete('/:id', deleteWallet);

export default router;
