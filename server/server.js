import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import rankRouter from './routes/rankRoutes.js';
import analysisRouter from './routes/analysisRoutes.js';
import cronRouter from './routes/cronRoutes.js';
import { startRankTrackingCron } from './cron/rankTrackingCron.js';



const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});
app.use('/api/auth', authRouter);
app.use('/api/rank', rankRouter);
app.use('/api/analysis', analysisRouter)
app.use('/api/cron', cronRouter)

// On Vercel, Vercel Cron Jobs hits /api/cron/rank-tracking on schedule instead -
// there's no long-lived process here for node-cron's in-process timer to fire in.
if (!process.env.VERCEL) {
  startRankTrackingCron()
}

const PORT = process.env.PORT || 3000;

// Vercel's Node builder imports this file and calls the exported app directly
// as a request handler - it must not also try to bind a port.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;