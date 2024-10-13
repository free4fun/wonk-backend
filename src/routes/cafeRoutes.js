import express from 'express';
import { createCafe, getCafe, updateCafe, deleteCafe, getAllCafes } from '../controllers/cafeController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', auth, createCafe);
router.get('/', getAllCafes);
router.get('/:id', getCafe);
router.put('/:id', auth, updateCafe);
router.delete('/:id', auth, deleteCafe);

export default router;
