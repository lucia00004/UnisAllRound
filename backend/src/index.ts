import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { seedDatabase } from './seeder';

// Import routers
import academicRouter from './routes/academic';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import examsRouter from './routes/exams';
import slotsRouter from './routes/slots';
import ticketsRouter from './routes/tickets';
import notificationsRouter from './routes/notifications';
import newsRouter from './routes/news';
import canteenRouter from './routes/canteen';

dotenv.config();

// Global bypass for SSL/TLS validation errors on development (e.g. news fetching)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routers
app.use('/api/academic', academicRouter);
app.use('/api/auth', authRouter);
app.use('/api/exams', examsRouter);
app.use('/api/slots', slotsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/news', newsRouter);
app.use('/api/canteen', canteenRouter);
app.use('/api', profileRouter); // Mount profile / users endpoints

// Start Server & Run Seeding
app.listen(PORT, async () => {
  console.log(`UnisAllRound backend running on http://localhost:${PORT}`);
  
  // Wait a few seconds for DBs to settle, then run seeder
  setTimeout(seedDatabase, 3000);
});
