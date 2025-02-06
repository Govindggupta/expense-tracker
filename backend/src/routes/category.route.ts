import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';

const router = express.Router();

router.get('/', protectedRoute, getAllCategories);
router.post('/', protectedRoute, createCategory);
router.put('/:id', protectedRoute, updateCategory);
router.delete('/:id', protectedRoute, deleteCategory);

export default router;
