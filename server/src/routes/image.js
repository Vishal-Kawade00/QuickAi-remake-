import express from 'express';
import { generateImage, removeImageBackground, removeImageObject } from '../controllers/image.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.post('/generate', protect, generateImage);
router.post('/remove-background', protect, upload.single('image'), removeImageBackground);
router.post('/remove-object', protect, upload.single('image'), removeImageObject);

export default router;