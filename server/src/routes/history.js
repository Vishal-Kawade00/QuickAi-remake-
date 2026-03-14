import express from 'express';
import { getUserHistory } from '../controllers/history.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getUserHistory);

export default router;