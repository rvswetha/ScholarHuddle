import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notificationRoutes.js';

// --- Import Active Routes ---
import aiRoutes from './routes/aiRoutes.js';

// --- Configuration ---
dotenv.config();

// --- App Initialization ---
const app = express();

// --- Middleware ---
// 1. CORS: Allows your React frontend to communicate with this server
app.use(cors());

// 2. JSON Parser: Allows the server to read JSON bodies in POST requests
app.use(express.json());

// --- API Routes ---
// The only route we still need a Node backend for is the AI processing!
app.use('/api/ai', aiRoutes);

// --- Default Route ---
// A simple health-check route to test if your server is alive.
app.get('/', (req, res) => {
  res.send('StudyHuddle API is running smoothly!');
});

app.use('/api/notifications', notificationRoutes);

// --- Export the App ---
export default app;