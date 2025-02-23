import React from 'react';
import { Image, Send } from 'lucide-react';

const DeepThinkIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 2.5C4.96243 2.5 2.5 4.96243 2.5 8C2.5 11.0376 4.96243 13.5 8 13.5C11.0376 13.5 13.5 11.0376 13.5 8C13.5 4.96243 11.0376 2.5 8 2.5ZM1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 4.5C6.067 4.5 4.5 6.067 4.5 8C4.5 9.933 6.067 11.5 8 11.5C9.933 11.5 11.5 9.933 11.5 8C11.5 6.067 9.933 4.5 8 4.5Z"
      fill="currentColor"
    />
  </svg>
);

const InputFooter = ({
  isSidebarOpen,
  darkMode,
  input = '',
  setInput,
  handleSubmit,
  loading,
  deepThink,
  setDeepThink,
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
                onClick={() => setDeepThink(!deepThink)}
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                } ${deepThink ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                <DeepThinkIcon />
                <span className="text-sm">DeepThink (R1)</span>
              </button>
              <button
                type="submit"
                disabled={loading || !input?.trim()}
                className={`p-2 rounded-lg ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                } ${!input?.trim() || loading ? 'opacity-50' : ''}`}
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