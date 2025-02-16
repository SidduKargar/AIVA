import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Sparkles, Copy, ThumbsDown } from 'lucide-react';
import TypeWriter from './TypeWriter';

const Message = ({
  content,
  role,
  darkMode,
  isTyping,
  onDislike,
  disliked,
}) => {
  const isAssistant = role === 'assistant';

  if (!content) return null;

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex space-x-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isAssistant
                ? darkMode
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
                : darkMode
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-purple-50 text-purple-600'
            }`}
          >
            {isAssistant ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
            )}
          </div>
          <div className="flex-1">
            {isAssistant ? (
              <div
                className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none`}
              >
                {isTyping ? (
                  <TypeWriter text={content} darkMode={darkMode} />
                ) : (
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="relative group">
                            <SyntaxHighlighter
                              {...props}
                              style={darkMode ? oneDark : oneLight}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-xl overflow-hidden"
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                            <button
                              onClick={() => copyToClipboard(String(children))}
                              className={`absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                                darkMode
                                  ? 'bg-gray-800 hover:bg-gray-700'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <code {...props} className={className}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                )}
                {isAssistant && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={onDislike}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center space-x-2 ${
                        disliked
                          ? darkMode
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-red-100 text-red-600'
                          : darkMode
                          ? 'hover:bg-gray-800 bg-gray-900/50 text-gray-300'
                          : 'hover:bg-gray-100 bg-gray-50 text-gray-600'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Dislike</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p
                className={`${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                } text-lg`}
              >
                {content}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
