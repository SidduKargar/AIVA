import React from 'react';
import { Image, Send } from 'lucide-react';

const InputFooter = ({
  isSidebarOpen,
  darkMode,
  input,
  setInput,
  handleSubmit,
  loading,
}) => {
  return (
    <footer
      className={`fixed bottom-0 right-0 ${
        isSidebarOpen ? 'left-64' : 'left-0'
      } border-t ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Enter a prompt here"
              className={`w-full p-4 pr-24 rounded-2xl resize-none ${
                darkMode
                  ? 'bg-gray-800 focus:bg-gray-800 border-gray-700'
                  : 'bg-gray-50 focus:bg-gray-50 border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows="2"
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-2">
              <button
                type="button"
                className={`p-2 rounded-lg ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <Image className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className={`p-2 rounded-lg ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                } ${!input.trim() || loading ? 'opacity-50' : ''}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </footer>
  );
};

export default InputFooter;
