// import dotenv from 'dotenv';
// dotenv.config({ quiet: true });


import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';

// Route Imports
import authRoutes from './src/routes/auth.js';
import contentRoutes from './src/routes/content.js'
import imageRoutes from './src/routes/image.js'
import documentRoutes from './src/routes/document.js'
import youtubeRoutes from './src/routes/youtube.js';
import historyRoutes from './src/routes/history.js';


connectDB();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow local frontend and ANY Chrome extension to connect
    if (origin.startsWith('chrome-extension://') || origin.startsWith('http://localhost')) {
        return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/history', historyRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));