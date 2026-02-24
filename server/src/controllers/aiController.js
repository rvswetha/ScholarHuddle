// server/src/controllers/aiController.js
import pdfExtract from 'pdf-extraction';
import officeParser from 'officeparser';
import { generateAiContent } from '../services/aiService.js';

export const handleSummarizeRequest = async (req, res) => {
  try {
    const { text, mode } = req.body;
    const aiResponse = await generateAiContent(text, mode || 'summary');
    res.status(200).json({ success: true, data: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleFileProcessRequest = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let extractedText = "";
    const originalName = req.file.originalname.toLowerCase();

    if (originalName.endsWith('.pdf')) {
      const data = await pdfExtract(req.file.buffer);
      extractedText = data.text;
    } 
    else if (originalName.endsWith('.pptx') || originalName.endsWith('.ppt') || originalName.endsWith('.docx')) {
      extractedText = await officeParser.parseOfficeAsync(req.file.buffer);
    } 
    else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF, Word, or PowerPoint file.' });
    }

    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ error: 'Could not extract text. The document might be scanned or image-based.' });
    }

    const { mode } = req.body;
    const aiResponse = await generateAiContent(extractedText, mode || 'summary');
    res.status(200).json({ success: true, data: aiResponse });

  } catch (error) {
    console.error("File Error:", error);
    res.status(500).json({ error: 'Failed to process the document. Ensure it is a valid text-based file.' });
  }
};

export const handleChatRequest = async (req, res) => {
  try {
    const { message } = req.body;
    const aiResponse = await generateAiContent(message, 'chat');
    res.status(200).json({ success: true, data: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};