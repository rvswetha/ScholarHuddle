import express from 'express';
import { sendChatNotification } from '../controllers/notificationController.js';

const router = express.Router();

// Your frontend will call this endpoint when a message is sent
router.post('/chat', sendChatNotification);

export default router;