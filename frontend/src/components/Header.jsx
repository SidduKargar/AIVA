import React from 'react';
import { Settings, Sun, Moon, MessageCircle, Trash2 } from 'lucide-react';

const Header = ({ darkMode, setDarkMode, clearChat }) => {
  return (
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
  );
};

export default Header;
