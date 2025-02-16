// src/components/Message/ImageMessage.js
import React from 'react';

const ImageMessage = ({ content, darkMode }) => {
  // Extract image URL from markdown-style content
  const getImageUrl = (content) => {
    const match = content.match(/!\[.*?\]\((.*?)\)/);
    return match ? match[1] : null;
  };

  const imageUrl = getImageUrl(content);

  return (
    <div className={`my-2 p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}>
      <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {content.split('![')[0].trim()}
      </p>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Generated"
          className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
        />
      )}
    </div>
  );
};

export default ImageMessage;