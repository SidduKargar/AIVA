import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadsDir, 'images');

// Create necessary directories
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure storage for documents
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Configure storage for images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const documentUpload = multer({ storage: documentStorage });
const imageUpload = multer({ storage: imageStorage });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store uploaded documents in memory
const documents = new Map();

// Document upload endpoint
app.post('/upload', documentUpload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let fileContent;

    switch (fileExtension) {
      case '.txt':
        fileContent = fs.readFileSync(filePath, 'utf8');
        break;

      case '.pdf':
        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        fileContent = pages
          .map((page) =>
            page
              .getTextContent()
              .items.map((item) => item.str)
              .join(' ')
          )
          .join('\n');
        break;

      case '.docx':
      case '.doc':
        const result = await mammoth.extractRawText({ path: filePath });
        fileContent = result.value;
        break;

      default:
        return res.status(400).json({ error: 'Unsupported file type' });
    }

    const documentId = req.file.filename;
    documents.set(documentId, fileContent);

    fs.unlinkSync(filePath);

    res.json({
      message: 'File uploaded successfully',
      documentId: documentId,
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Generate response endpoint
app.post('/generate', async (req, res) => {
  try {
    const { prompt, documentId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    let finalPrompt = prompt;

    if (documentId && documents.has(documentId)) {
      const documentContent = documents.get(documentId);
      finalPrompt = `Context from the document: 
      ${documentContent}
      
      Question: 
      ${prompt}
      
      Instructions:
      1. Carefully read the provided context from the document.
      2. Use the information in the context to answer the question as accurately and concisely as possible.
      3. If the answer is not explicitly mentioned in the document, provide an informed response or state that the answer is not available.
      
      Answer:
      `;
    }

    const result = await model.generateContent(finalPrompt);
    const response = result.response.text();
    res.json({ response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Image processing endpoint
app.post('/process-image', imageUpload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const inputPath = req.file.path;
  const pythonScriptPath = path.join(__dirname, 'ocr_script.py'); // Not used, but keeping for the sake of reference

  try {
    console.log("Running OCR with Tesseract...");

    // Step 1: Perform OCR using Tesseract.js
    const { data: { text } } = await Tesseract.recognize(
      inputPath,
      'eng',  // Language (English in this case)
      {
        logger: (m) => console.log(m),  // Optional: Log progress updates
      }
    );

    // Check if OCR extracted any text
    if (!text) {
      throw new Error('No text was extracted from the image');
    }

    // Step 2: Refining the extracted text using Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `
      I have extracted text from an image using OCR. Please:
      1. Fix any obvious OCR errors
      2. Correct spelling and grammar
      3. Properly format paragraphs and spacing
      4. Maintain the original meaning and structure
      5. Ensure the text is clear and easy to read
      6. Remove any unnecessary information
      7. Make the text more engaging and interesting

      
      Original text:
      ${text}
      
      Enhanced version:`;

    const result = await model.generateContent(prompt);
    const refinedText = result.response.text();

    // Step 3: Clean up the uploaded image after processing
    fs.unlink(inputPath, (err) => {
      if (err) console.error('Error deleting uploaded image:', err);
    });

    res.json({
      success: true,
      extractedText: refinedText,
      refinedText: refinedText, // Send the refined text as part of the response
    });
  } catch (error) {
    console.error('Error processing image:', error);

    // Clean up the uploaded image even if processing failed
    fs.unlink(inputPath, (err) => {
      if (err) console.error('Error deleting uploaded image:', err);
    });

    res.status(500).json({
      success: false,
      error: 'Failed to process image',
      details: error.message,
    });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
