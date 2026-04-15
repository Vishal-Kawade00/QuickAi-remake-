import express from 'express';
import { getCategoryHistory } from '../controllers/history.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:type', protect, getCategoryHistory);

export default router;