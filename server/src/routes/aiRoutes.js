// server/src/routes/aiRoutes.js
import express from 'express';
import multer from 'multer';
import { 
  handleSummarizeRequest, 
  handleFileProcessRequest, 
  handleChatRequest 
} from '../controllers/aiController.js';

const router = express.Router();
// Keeps files in memory (RAM) as a buffer, which is super fast
const upload = multer();

// Route for text summary
router.post('/summarize', handleSummarizeRequest);

// Route for files (PDF & PPT)
router.post('/process-file', upload.single('file'), handleFileProcessRequest);

// Route for chat
router.post('/chat', handleChatRequest);

export default router;