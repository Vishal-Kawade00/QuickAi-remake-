import express from 'express';
import { 
  summarizeVideo, 
  chatWithVideo, 
  generateDetailedNotes,
  getRecentSessions,
  getTranscriptByVideoId 
} from '../controllers/youtube.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/summarize', protect, summarizeVideo);
router.post('/chat', protect, chatWithVideo);
router.post('/detailed-notes', protect, generateDetailedNotes);
router.get('/recent-sessions', protect, getRecentSessions);
router.get('/transcript/:videoId', protect, getTranscriptByVideoId);

export default router;