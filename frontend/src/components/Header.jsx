import React, { useState } from 'react';
import { Settings, Sun, Moon, MessageCircle, Trash2, X } from 'lucide-react';

const Header = ({ darkMode, setDarkMode, clearChat }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [systemPrompt, setSystemPrompt] = useState('');

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Selected Model:', selectedModel);
    console.log('System Prompt:', systemPrompt);
    setIsSettingsOpen(false); // Close the popup
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-64 z-10 border-b transition-all duration-300 ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4 ml-12">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold">Aiva</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Settings Popup */}
      {isSettingsOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300`}
        >
          <div
            className={`w-full max-w-md rounded-lg shadow-xl transition-all duration-300 ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Settings</h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Model Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Select Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-100 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                  <option value="gemma2-9b-it">gemma2-9b-it</option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                  <option value="deepseek-r1-distill-qwen-32b">deepseek-r1-distill-qwen-32b</option>
                </select>
              </div>

              {/* System Prompt */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  System Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows="3"
                  className={`w-full p-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-100 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter a system prompt..."
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                } transition-colors duration-200`}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
