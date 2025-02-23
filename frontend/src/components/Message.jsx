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
    <div className={`py-8 ${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-white to-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-8">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform ${
              isAssistant
                ? darkMode
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                  : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                : darkMode
                ? 'bg-gradient-to-br from-pink-500 to-orange-400'
                : 'bg-gradient-to-br from-pink-400 to-orange-300'
            }`}
          >
            {isAssistant ? (
              <Sparkles className="w-6 h-6" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/90" />
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 space-y-2">
            {/* Role Label */}
            <div className={`text-sm font-medium mb-3 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {isAssistant ? 'Assistant' : 'You'}
            </div>

            {/* Content */}
            {isAssistant ? (
              <div
                className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none 
                ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
                style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.75',
                  overflowWrap: 'break-word', // Ensure long words break
                  whiteSpace: 'pre-wrap', // Preserve whitespace but allow wrapping
                }}
              >
                {isTyping ? (
                  <TypeWriter text={content} darkMode={darkMode} />
                ) : (
                  <ReactMarkdown
                  components={{
                    // Headers with one-line gap
                    h3: ({node, ...props}) => <h3 className="text-2xl font-bold mt-2 mb-1" {...props} />, // One-line gap
                    h4: ({node, ...props}) => <h4 className="text-xl font-bold mt-1.5 mb-1" {...props} />, // One-line gap
                    h5: ({node, ...props}) => <h5 className="text-lg font-bold mt-1 mb-1" {...props} />, // One-line gap
                
                    // Paragraphs
                    p: ({node, ...props}) => <p className="my-3 leading-relaxed" {...props} />,
                
                    // Lists
                    ul: ({node, ...props}) => <ul className="my-3 " {...props} />,
                    ol: ({node, ...props}) => <ol className="my-3 " {...props} />,
                    li: ({node, ...props}) => <li className="ml-4" {...props} />,
                
                    // Code blocks (unchanged)
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="relative group my-6">
                          <div className={`absolute top-0 left-0 right-0 px-4 py-2 rounded-t-xl font-mono text-sm ${
                            darkMode ? 'bg-gray-800' : 'bg-gray-100'
                          }`}>
                            {match[1]}
                          </div>
                          <SyntaxHighlighter
                            {...props}
                            style={darkMode ? oneDark : oneLight}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-xl mt-8 !pt-12 shadow-lg"
                            customStyle={{
                              margin: 0,
                              padding: '3rem 1rem 1rem 1rem',
                            }}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                          <button
                            onClick={() => copyToClipboard(String(children))}
                            className={`absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                              darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <code
                          {...props}
                          className={`${className} px-1.5 py-0.5 rounded-md ${
                            darkMode
                              ? 'bg-gray-800 text-gray-200'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
                )}

                {/* Feedback Section */}
                {isAssistant && (
                  <div className="flex items-center space-x-4 mt-6 pt-4 border-t border-gray-700/20">
                    <button
                      onClick={onDislike}
                      className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors ${
                        disliked
                          ? darkMode
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                          : darkMode
                          ? 'hover:bg-gray-700 bg-gray-800 text-gray-300'
                          : 'hover:bg-gray-200 bg-gray-100 text-gray-600'
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
                className={`text-lg leading-relaxed ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
                style={{
                  overflowWrap: 'break-word', // Ensure long words break
                  whiteSpace: 'pre-wrap', // Preserve whitespace but allow wrapping
                }}
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