import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
// Import Groq instead of Google Generative AI
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store chat histories in memory
const chatHistories = new Map();

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

// Comment out the Gemini AI initialization
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

      case '.sql':  // Handling SQL file
        fileContent = fs.readFileSync(filePath, 'utf8');
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

// Generate response endpoint - updated to use Groq API
app.post('/generate', async (req, res) => {
  try {
    const { prompt, documentId, conversationId, deepThink } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Retrieve or initialize chat history
    let chatHistory = chatHistories.get(conversationId) || [];
    
    // Prepare messages for Groq API
    let messages = [...chatHistory];
    let modal = deepThink ? "deepseek-r1-distill-llama-70b" : "llama-3.1-8b-instant"; // Switch models based on deepThink flag

    // If there's a document context, add it as a system message
    if (documentId && documents.has(documentId)) {
      modal=deepThink ? "deepseek-r1-distill-llama-70b" : "gemma2-9b-it";
      const documentContent = documents.get(documentId);
      messages.unshift({
        role: "system",
        content: `Context from the document:\n${documentContent}`
      });
    }
    
    // Add the current user message
    messages.push({ role: "user", content:`Return response in markdown with proper format :${prompt}` });

    // Generate response using Groq API
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: modal,
    });

    const response = completion.choices[0]?.message?.content || "";

    // Update chat history with the user prompt and assistant's response
    chatHistory.push({ role: "user", content: prompt });
    chatHistory.push({ role: "assistant", content: response });
    chatHistories.set(conversationId, chatHistory);

    res.json({ response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Image processing endpoint - updated to use Groq API
app.post('/process-image', imageUpload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const inputPath = req.file.path;
  try {
    console.log("Running OCR with Tesseract...");

    // Step 1: Perform OCR using Tesseract.js
    const { data: { text } } = await Tesseract.recognize(
      inputPath,
      'eng',  // Language (English in this case)
      {
         // Optional: Log progress updates
      }
    );

    // Check if OCR extracted any text
    if (!text) {
      throw new Error('No text was extracted from the image');
    }

    // Step 2: Refining the extracted text using Groq API
    const prompt = `
    I have extracted text from an image using OCR. Please:
    1. Fix any obvious OCR errors
    2. Correct spelling and grammar
    3. Properly format paragraphs and spacing
    4. Maintain the original meaning and structure
    5. Ensure the text is clear and easy to read
    6. Remove any unnecessary information
    7. Make the text more engaging and interesting
    8. Keep the text relevant to the image content
    9. Read the text carefully if it is type of card return it like card in markdown
    10. Read the text carefully if it is type of resume return it like resume in markdown
    
    Original text:
    ${text}
    
    Enhanced version:`;
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-r1-distill-llama-70b",
    });

    let refinedText = completion.choices[0]?.message?.content || text;

    // Remove any <think> or other unnecessary tags if present in the refinedText
    refinedText = refinedText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

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

// Endpoint for code search
app.post('/search-code', async (req, res) => {
  try {
    const { language, query, deepThink } = req.body;

    const prompt = `
    Act as a senior developer. I need help with code in ${language}.
    Query: ${query}

    Please provide:
    1. A detailed, production-ready code solution
    2. Brief explanation of how the code works
    3. Best practices and considerations
    4. Example usage if applicable

    Return the response in markdown format with proper code blocks.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: deepThink ? "deepseek-r1-distill-llama-70b" : "llama-3.3-70b-specdec", // Using a powerful model for code generation
      temperature: 0.5,
    });

    res.json({ response: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error('Error searching code:', error);
    res.status(500).json({ error: 'Failed to search code' });
  }
});

// Endpoint for documentation search
app.post('/search-docs', async (req, res) => {
  try {
    const { query ,deepThink} = req.body;

    const prompt = `
    Act as a technical documentation expert. I need information about:
    ${query}

    Please provide:
    1. Detailed explanation
    2. Key concepts
    3. Common use cases
    4. Best practices
    5. Examples if applicable

    Return the response in well-formatted markdown.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model:deepThink ? "deepseek-r1-distill-llama-70b" : "llama-3.3-70b-specdec", // Using a balanced model for documentation
      temperature: 0.3,
    });

    res.json({ response: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error('Error searching documentation:', error);
    res.status(500).json({ error: 'Failed to search documentation' });
  }
});


app.delete('/clear-chat/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  chatHistories.delete(conversationId);
  res.json({ message: 'Chat history cleared' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});