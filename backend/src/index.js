import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChromaClient } from "chromadb";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize ChromaDB client with port 8000
const chromaClient = new ChromaClient({
  path: "http://localhost:8000" // Connect to ChromaDB running on port 8000
});

// Create collection for document chunks
let documentCollection;
(async function initializeChroma() {
  try {
    // Try to get the collection first
    try {
      documentCollection = await chromaClient.getCollection({ name: "document_chunks" });
      console.log("Existing ChromaDB collection retrieved successfully");
    } catch (err) {
      // If collection doesn't exist, create it
      documentCollection = await chromaClient.createCollection({
        name: "document_chunks",
        metadata: { 
          "description": "Document chunks for RAG implementation"
        }
      });
      console.log("New ChromaDB collection created successfully");
    }
  } catch (error) {
    console.error("Error initializing ChromaDB collection:", error);
  }
})();

// Ollama embedding function
async function getEmbeddings(text) {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text", // or any other embedding model available in Ollama
        prompt: text,
      }),
    });
    
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Error getting embeddings from Ollama:", error);
    throw error;
  }
}

// Text chunking function
function chunkText(text, maxChunkSize = 1000, overlapSize = 100) {
  const chunks = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    // Find a good break point (period, newline, etc.)
    let endIndex = Math.min(startIndex + maxChunkSize, text.length);
    
    if (endIndex < text.length) {
      // Try to find a sentence or paragraph end for a cleaner break
      const possibleBreakPoints = [
        text.lastIndexOf(". ", endIndex),
        text.lastIndexOf("\n", endIndex),
        text.lastIndexOf(". \n", endIndex)
      ].filter(idx => idx > startIndex);
      
      if (possibleBreakPoints.length > 0) {
        endIndex = Math.max(...possibleBreakPoints) + 1; // Include the period/newline
      }
    }
    
    chunks.push(text.substring(startIndex, endIndex));
    
    // Move start with overlap
    startIndex = endIndex - overlapSize;
    if (startIndex < 0) startIndex = 0;
    
    // Break if we've reached the end
    if (startIndex >= text.length - overlapSize) break;
  }
  
  return chunks;
}

// Store uploaded documents in memory and their ids
const documents = new Map();
const documentIdToName = new Map();

// Store chat histories in memory
const chatHistories = new Map();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");
const imagesDir = path.join(uploadsDir, "images");
const svgsDir = path.join(uploadsDir, "svgs");

// Create necessary directories
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
if (!fs.existsSync(svgsDir)) {
  fs.mkdirSync(svgsDir, { recursive: true });
}

// Configure storage for documents
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Configure storage for images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const documentUpload = multer({ storage: documentStorage });
const imageUpload = multer({ storage: imageStorage });

// UPDATED: Document upload endpoint with RAG implementation
app.post("/upload", documentUpload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileExtension = path.extname(fileName).toLowerCase();
    let fileContent;

    switch (fileExtension) {
      case ".txt":
        fileContent = fs.readFileSync(filePath, "utf8");
        break;

      case ".pdf":
        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        fileContent = pages
          .map((page) =>
            page
              .getTextContent()
              .items.map((item) => item.str)
              .join(" ")
          )
          .join("\n");
        break;

      case ".docx":
      case ".doc":
        const result = await mammoth.extractRawText({ path: filePath });
        fileContent = result.value;
        break;

      case ".sql": // Handling SQL file
        fileContent = fs.readFileSync(filePath, "utf8");
        break;

      default:
        return res.status(400).json({ error: "Unsupported file type" });
    }

    const documentId = req.file.filename;
    documents.set(documentId, fileContent);
    documentIdToName.set(documentId, fileName);

    // Create chunks from the document content
    const textChunks = chunkText(fileContent);
    
    // Process chunks for RAG
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      
      try {
        // Generate embeddings for each chunk
        const embedding = await getEmbeddings(chunk);
        
        // Store chunk with its embedding in ChromaDB
        await documentCollection.add({
          ids: [`${documentId}-chunk-${i}`],
          embeddings: [embedding],
          metadatas: [{ 
            documentId: documentId,
            fileName: fileName,
            chunkIndex: i,
            totalChunks: textChunks.length
          }],
          documents: [chunk]
        });
      } catch (error) {
        console.error(`Error processing chunk ${i} for document ${documentId}:`, error);
        // Continue with next chunk even if this one fails
      }
    }

    fs.unlinkSync(filePath);

    res.json({
      message: "File uploaded successfully and indexed for RAG",
      documentId: documentId,
      chunksProcessed: textChunks.length
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).json({ error: "Failed to process file", details: error.message });
  }
});

// UPDATED: Generate response endpoint with RAG implementation
app.post("/generate", async (req, res) => {
  try {
    const { prompt, documentId, conversationId, deepThink } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Retrieve or initialize chat history
    let chatHistory = chatHistories.get(conversationId) || [];

    // Prepare messages for Groq API
    let messages = [...chatHistory];
    let modal = deepThink
      ? "deepseek-r1-distill-llama-70b"
      : "llama-3.3-70b-versatile";

    // RAG implementation: If there's a document context
    if (documentId) {
      modal = deepThink ? "deepseek-r1-distill-llama-70b" : "gemma2-9b-it";
      
      try {
        // Generate embeddings for the prompt
        const promptEmbedding = await getEmbeddings(prompt);
        
        // Retrieve relevant chunks from ChromaDB
        const queryResult = await documentCollection.query({
          queryEmbeddings: [promptEmbedding],
          nResults: 5,
          where: { "documentId": documentId },
        });
        
        
        // Extract and process retrieved chunks
        if (queryResult.documents && queryResult.documents[0] && queryResult.documents[0].length > 0) {
          const documentChunks = queryResult.documents[0];
          const formattedContext = documentChunks.join("\n\n");
          
          // Add context as a system message
          const documentName = documentIdToName.get(documentId) || "uploaded document";
          messages.unshift({
            role: "system",
            content: `You are answering questions about the document "${documentName}". Here are the most relevant sections from the document to help you provide an accurate response:\n\n${formattedContext}`
          });
        } else {
          // Fallback to full document if no chunks were found
          console.log("No relevant chunks found, falling back to full document");
          const documentContent = documents.get(documentId);
          if (documentContent) {
            messages.unshift({
              role: "system",
              content: `Context from the document:\n${documentContent}`,
            });
          }
        }
      } catch (error) {
        console.error("Error during RAG retrieval:", error);
        // Fallback to full document in case of RAG failure
        const documentContent = documents.get(documentId);
        if (documentContent) {
          messages.unshift({
            role: "system",
            content: `Context from the document:\n${documentContent}`,
          });
        }
      }
    }

    // Add the current user message
    messages.push({
      role: "user",
      content: `Please provide your response in a clear format. Only use markdown when it's necessary for better clarity, such as for code snippets, tables, or lists. For example, if you include code, please format it within code blocks. Similarly, use tables for structured data when appropriate. Here's the request: ${prompt}`,
    });

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
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate response", details: error.message });
  }
});

app.post("/generate-svg", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const svgPrompt = `
    Generate a detailed SVG image of ${prompt} with realistic proportions and accurate details. The image should:

    1. Use precise vector paths to capture the natural contours and shapes
    2. Incorporate appropriate lighting and shading through gradient fills to create depth
    3. Maintain accurate proportions and scale relationships between all elements
    4. Use a color palette that reflects natural/realistic tones
    5. Include fine details that enhance realism
    6. Be optimized for web display with clean, efficient SVG code
    7. Have a viewBox dimension of "0 0 800 600"
    8. Use appropriate grouping (<g>) elements to organize related components

    Please provide ONLY the complete SVG code wrapped in <svg> tags with all necessary attributes and ensure all paths are properly closed. The final image should be visually accurate and realistic.
    `;

    // Generate response using Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: svgPrompt }] }] }),
      }
    );

    const data = await response.json();
    let svgContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract the SVG code from the response
    let svgMatch = svgContent.match(/<svg[\s\S]*<\/svg>/i);

    // Handle markdown code blocks
    if (!svgMatch) {
      svgMatch = svgContent.match(
        /```(?:svg|xml)?\s*(<svg[\s\S]*<\/svg>)\s*```/i
      );
      if (svgMatch) {
        svgContent = svgMatch[1];
      }
    } else {
      svgContent = svgMatch[0];
    }

    // Final check if we have valid SVG
    if (!svgContent.startsWith("<svg")) {
      return res.status(500).json({
        error: "Failed to generate valid SVG",
        raw: svgContent, // Return raw content for debugging
      });
    }

    // Sanitize SVG to ensure it's safe
    svgContent = svgContent
      .replace(/script/gi, "removed-script") // Remove potential script tags
      .replace(/on\w+=/gi, "data-removed="); // Remove event handlers

    // Add responsive attributes if not present
    if (!svgContent.includes("preserveAspectRatio")) {
      svgContent = svgContent.replace(
        /<svg/,
        '<svg preserveAspectRatio="xMidYMid meet"'
      );
    }

    // Save SVG file
    const svgFileName = `${Date.now()}-${prompt
      .substring(0, 20)
      .replace(/[^a-z0-9]/gi, "-")}.svg`;
    const svgFilePath = path.join(svgsDir, svgFileName);
    fs.writeFileSync(svgFilePath, svgContent);

    res.json({
      svg: svgContent,
      fileName: svgFileName,
      filePath: `/uploads/svgs/${svgFileName}`,
      message: "SVG generated successfully",
    });
  } catch (error) {
    console.error("Error generating SVG:", error);
    res.status(500).json({
      error: "Failed to generate SVG",
      details: error.message,
    });
  }
});

// Image processing endpoint
app.post("/process-image", imageUpload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  const inputPath = req.file.path;
  try {
    console.log("Running OCR with Tesseract...");

    // Step 1: Perform OCR using Tesseract.js
    const {
      data: { text },
    } = await Tesseract.recognize(
      inputPath,
      "eng", // Language (English in this case)
      {
        // Optional: Log progress updates
      }
    );

    // Check if OCR extracted any text
    if (!text) {
      throw new Error("No text was extracted from the image");
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
    refinedText = refinedText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Step 3: Clean up the uploaded image after processing
    fs.unlink(inputPath, (err) => {
      if (err) console.error("Error deleting uploaded image:", err);
    });

    res.json({
      success: true,
      extractedText: refinedText,
      refinedText: refinedText, // Send the refined text as part of the response
    });
  } catch (error) {
    console.error("Error processing image:", error);

    // Clean up the uploaded image even if processing failed
    fs.unlink(inputPath, (err) => {
      if (err) console.error("Error deleting uploaded image:", err);
    });

    res.status(500).json({
      success: false,
      error: "Failed to process image",
      details: error.message,
    });
  }
});

// Endpoint for code search
app.post("/search-code", async (req, res) => {
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
      model: deepThink
        ? "deepseek-r1-distill-llama-70b"
        : "llama-3.3-70b-specdec", // Using a powerful model for code generation
      temperature: 0.5,
    });

    res.json({ response: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error("Error searching code:", error);
    res.status(500).json({ error: "Failed to search code" });
  }
});

// Endpoint for documentation search
app.post("/search-docs", async (req, res) => {
  try {
    const { query, deepThink } = req.body;

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
      model: deepThink
        ? "deepseek-r1-distill-llama-70b"
        : "llama-3.3-70b-specdec", // Using a balanced model for documentation
      temperature: 0.3,
    });

    res.json({ response: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error("Error searching documentation:", error);
    res.status(500).json({ error: "Failed to search documentation" });
  }
});


// Clear chat history endpoint
app.delete("/clear-chat/:conversationId", (req, res) => {
  const { conversationId } = req.params;
  chatHistories.delete(conversationId);
  res.json({ message: "Chat history cleared" });
});

// Serve the SVG files statically
app.use("/uploads/svgs", express.static(svgsDir));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
