import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.middleware.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import focusSessionRoutes from './routes/focusSessionRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/focus-sessions', focusSessionRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/events', eventRoutes);


// Error Handling Middleware (ALWAYS LAST)
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
