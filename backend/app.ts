import express from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes/api.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

export default app; 