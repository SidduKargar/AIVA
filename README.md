# AIVA (Artificial Intelligence and Virtual Assistance)

AIVA (Artificial Intelligence and Virtual Assistance) is a web-based application designed to provide seamless text-based interactions and code generation. It leverages advanced AI technologies to process and analyze documents and images uploaded by users.

With the ability to analyze text and images, AIVA extracts meaningful information, converts it into readable formats, and allows users to interact with an AI-driven virtual assistant to meet their needs.

In addition, AIVA now integrates **Retrieval-Augmented Generation (RAG)** for more accurate and contextually relevant responses, enhanced by **Chroma DB** and **Ollama embedding models** for document analysis, chatbot interactions, and multi-modal functionalities. It also includes a **conversation history saver**, allowing users to revisit past interactions.

## Features

- **Text-Based Interaction:** Engage in intelligent conversations with AIVA through natural language processing (NLP), powered by advanced AI models.
- **Code Generation:** Generate code snippets based on user input for various programming tasks.
- **Document Analysis:** Upload documents for analysis, with AIVA extracting key information and providing insights, enhanced by **RAG** powered by **Chroma DB** and **Ollama embedding models**.
- **Image Processing:** Upload images, and AIVA will extract text using Optical Character Recognition (OCR) and convert it into a readable format.
- **AI-Powered Assistance:** AIVA uses advanced AI models to enhance the quality of interactions and content generation.
- **Conversation History:** AIVA saves past interactions, allowing users to revisit and continue previous conversations at any time.
- **Multi-Model Support:** AIVA intelligently switches between multiple AI models to deliver the most relevant responses, depending on the task at hand.

## Technologies Used

- **Frontend:**
  - **React.js:** A popular JavaScript library for building the user interface.
  - **Tailwind CSS:** A utility-first CSS framework for creating custom designs quickly.
  - **Lucid Icons:** A modern icon library used for clear and minimalist iconography.

- **Backend:**
  - **Node.js:** JavaScript runtime environment to handle server-side operations.
  - **Chroma DB:** A database used for storing, indexing, and querying vectorized embeddings for retrieval-augmented generation.
  - **Ollama Embedding Models:** Embedding models that help convert text into vectors for more accurate document analysis and chatbot interactions.
  - **Gemini AI Model APIs:** Used for AI-driven interactions and providing virtual assistant capabilities.
  - **Retrieval-Augmented Generation (RAG):** Used to enhance the quality and relevance of responses by retrieving contextually relevant information from the database.
  - **Groq cloud ai modals:** Used for AI-driven interactions and providing virtual assistant capabilities.

- **Image Processing:**
  - **Tesseract OCR:** A powerful Optical Character Recognition engine for extracting text from images.

- **Conversation History:**
  - AIVA tracks and stores conversation histories in a local or cloud database, enabling users to revisit past chats and continue where they left off.

## Installation

### 1. Clone the repository:
```bash
git clone https://github.com/yourusername/aiva.git
cd aiva
