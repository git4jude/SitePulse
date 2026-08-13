import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/db.js';
import authRouter from './routes/authRoute.js';
import rankRouter from './routes/rankRoute.js';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});
app.use('/api/auth', authRouter);
app.use('/api/rank', rankRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});