import express from 'express';
import { generateArticle, generateBlogTitle } from '../controllers/content.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/article', protect, generateArticle);
router.post('/blog-title', protect, generateBlogTitle);

export default router;