import express from 'express';
import { reviewResume } from '../controllers/document.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.post('/resume-review', protect, upload.single('resume'), reviewResume);

export default router;