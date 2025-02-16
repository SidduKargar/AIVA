// src/components/WelcomeCards.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image,
  Code,
  FileText,
} from 'lucide-react';

const WelcomeCards = ({ darkMode, setActiveDocumentId, setMessages }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [displayedText, setDisplayedText] = useState('');

  // Function to simulate typing effect
  const typeText = (text, delay = 50) => {
    let index = 0;
    setDisplayedText('');
    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, delay);
  };

  useEffect(() => {
    if (extractedText) {
      typeText(extractedText);
    }
  }, [extractedText]);

  // Document upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setDocumentUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedFile(file.name);
        setActiveDocumentId(data.documentId);
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'user', content: `Uploaded document: ${file.name}` },
          { role: 'assistant', content: 'Document uploaded successfully. How can I help you with this document?' }
        ]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'Failed to upload document. Please try again.' }
      ]);
    } finally {
      setDocumentUploading(false);
    }
  };

  // Image upload and processing handler
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setImageUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:3000/process-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.extractedText);
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'user', content: `Uploaded image: ${file.name}` },
          { role: 'assistant', content: `${data.extractedText}` }
        ]);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    } finally {
      setImageUploading(false);
    }
  };


  return (
    <div className="h-[80vh] flex items-center justify-center p-4">
      <div className="text-center w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Document Upload Card */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 mx-auto flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-lg font-bold mt-4 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Upload Document
            </h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {selectedFile ? `Uploaded: ${selectedFile}` : 'Upload a document to analyze'}
            </p>
            <label className={`mt-4 inline-block px-4 py-2 rounded-lg cursor-pointer
              ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
              ${documentUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={documentUploading}
                accept=".txt,.pdf,.doc,.docx"
              />
              {documentUploading ? 'Uploading...' : 'Choose File'}
            </label>
          </div>

          {/* Image Processing Card */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 mx-auto flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-lg font-bold mt-4 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Process Image
            </h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Upload and process images with AI
            </p>
            <label className={`mt-4 inline-block px-4 py-2 rounded-lg cursor-pointer
              ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
              ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
                disabled={imageUploading}
                accept="image/*"
              />
              {imageUploading ? 'Processing...' : 'Upload Image'}
            </label>
            {extractedText && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                <h3 className="font-bold mb-2">Extracted Text:</h3>
                <p className="text-gray-700">{displayedText}</p>
              </div>
            )}
          </div>

          {/* Search Code Card */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 mx-auto flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-lg font-bold mt-4 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Search Code
            </h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Quickly find code snippets and examples
            </p>
          </div>

          {/* Documentation Card */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-lg font-bold mt-4 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Find Documentation
            </h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Access detailed documentation for various libraries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCards;