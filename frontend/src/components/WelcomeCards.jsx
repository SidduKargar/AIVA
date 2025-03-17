import React, { useState, useRef, useEffect } from "react";
import { Upload, Image, Code, FileText, PenTool, Loader, Download, ChevronDown, ChevronUp } from "lucide-react";

const WelcomeCards = ({ darkMode, setActiveDocumentId, setMessages }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [showExtractedText, setShowExtractedText] = useState(false); // For toggling extracted text visibility

  // Simulate typing effect for extracted text
  const typeText = (text, delay = 50) => {
    let index = 0;
    setDisplayedText("");
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
    // Simulate upload process
    setTimeout(() => {
      setSelectedFile(file.name);
      setDocumentUploading(false);
    }, 2000);
  };

  // Image upload handler
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageUploading(true);
    // Simulate image processing
    setTimeout(() => {
      setExtractedText("This is a sample extracted text from the image.");
      setImageUploading(false);
    }, 2000);
  };

  return (
    <div className={`min-h-[70vh] flex items-center justify-center p-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="text-center w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Document Upload Card */}
          <div
            className={`${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            } p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl border flex flex-col h-full`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center mb-4 shadow-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Upload Document
            </h2>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-4 text-sm flex-grow`}>
              {selectedFile
                ? `Uploaded: ${selectedFile}`
                : "Upload a document to analyze its content with AI assistance"}
            </p>
            <label
              className={`mt-auto inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm duration-200
              ${
                darkMode
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }
              ${documentUploading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={documentUploading}
                accept=".txt,.pdf,.doc,.docx,.sql"
              />
              {documentUploading ? (
                <span className="flex items-center">
                  <Loader className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="w-4 h-4 mr-2" /> Choose File
                </span>
              )}
            </label>
          </div>

          {/* Image Processing Card */}
          <div
            className={`${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            } p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl border flex flex-col h-full`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto flex items-center justify-center mb-4 shadow-lg">
              <Image className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Process Image
            </h2>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-4 text-sm flex-grow`}>
              Upload and process images with AI to extract text and analyze content
            </p>
            <label
              className={`mt-auto inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm duration-200
              ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              }
              ${imageUploading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
                disabled={imageUploading}
                accept="image/*"
              />
              {imageUploading ? (
                <span className="flex items-center">
                  <Loader className="w-4 h-4 mr-2 animate-spin" /> Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <Image className="w-4 h-4 mr-2" /> Upload Image
                </span>
              )}
            </label>
            {extractedText && (
              <div className="mt-4">
                <button
                  onClick={() => setShowExtractedText(!showExtractedText)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                  } transition-colors duration-200`}
                >
                  <span className={`text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {showExtractedText ? "Hide Extracted Text" : "Show Extracted Text"}
                  </span>
                  {showExtractedText ? (
                    <ChevronUp className={`w-4 h-4 ${darkMode ? "text-white" : "text-gray-800"}`} />
                  ) : (
                    <ChevronDown className={`w-4 h-4 ${darkMode ? "text-white" : "text-gray-800"}`} />
                  )}
                </button>
                {showExtractedText && (
                  <div className={`mt-2 p-3 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg text-left transition-all duration-300 text-sm`}>
                    <p className={darkMode ? "text-gray-300" : "text-gray-700"}>{displayedText}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Code Card */}
          <div
            onClick={() => setMessages((prev) => [...prev, { role: "assistant", content: "What programming language are you looking for help with?" }])}
            className={`${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            } p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl border cursor-pointer flex flex-col h-full`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 mx-auto flex items-center justify-center mb-4 shadow-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Search Code
            </h2>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-4 text-sm flex-grow`}>
              Get help with code in any programming language with AI assistance
            </p>
            <button
              className={`mt-auto px-4 py-2 rounded-lg w-full text-sm
                ${
                  darkMode
                    ? "bg-pink-600 hover:bg-pink-700"
                    : "bg-pink-500 hover:bg-pink-600"
                } 
                text-white font-medium transition-colors duration-200 flex items-center justify-center`}
            >
              <Code className="w-4 h-4 mr-2" /> Start Searching
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCards;
