import express from 'express';
import { register, login } from '../controllers/auth.js';
import { protect } from '../middlewares/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Add this route to get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;