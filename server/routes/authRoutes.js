import express from 'express';
import { registerUser, login, getCurrentUser } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', login);
authRouter.get('/me', auth, getCurrentUser);

export default authRouter;
