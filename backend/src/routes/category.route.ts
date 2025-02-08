import express from 'express';
import { requireAuth } from '@clerk/express';

import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';

const router = express.Router();

router.get('/', requireAuth(), getAllCategories);
router.post('/', requireAuth(), createCategory);
router.put('/:id', requireAuth(), updateCategory);
router.delete('/:id', requireAuth(), deleteCategory);

export default router;
