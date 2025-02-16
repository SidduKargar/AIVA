import React, { useState } from 'react';
import { Paintbrush } from 'lucide-react';

const ImageGenerationCard = ({ darkMode, setMessages }) => {
  const [prompt, setPrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleImageGeneration = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setGeneratingImage(true);
    try {
      const response = await fetch('http://localhost:3000/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.generatedImageUrl);
        
        // Add the generated image and description to chat messages
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'user', content: `Generated image for prompt: "${prompt}"` },
          { 
            role: 'assistant', 
            content: `
              Image generated successfully! 
              Description: ${data.description}
              ![Generated Image](http://localhost:3000${data.generatedImageUrl})
            `
          }
        ]);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image');
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105`}>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-400 mx-auto flex items-center justify-center">
        <Paintbrush className="w-6 h-6 text-white" />
      </div>
      <h2 className={`text-lg font-bold mt-4 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Generate Image
      </h2>
      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
        Create AI-generated images
      </p>
      <input
        type="text"
        placeholder="Enter image description"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className={`w-full p-2 mt-4 rounded-lg ${
          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      />
      <button
        onClick={handleImageGeneration}
        disabled={generatingImage}
        className={`mt-4 px-4 py-2 rounded-lg w-full
          ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
          ${generatingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {generatingImage ? 'Generating...' : 'Generate Image'}
      </button>
      
      {generatedImage && (
        <div className="mt-4">
          <img
            src={`http://localhost:3000${generatedImage}`}
            alt="Generated visualization"
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
};

export default ImageGenerationCard;

