import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Sparkles, Copy, ThumbsDown, Check, User, Clock } from "lucide-react";
import TypeWriter from "./TypeWriter";
import SvgViewer from "./SvgViewer";

const Message = ({
  content,
  role,
  darkMode,
  isTyping,
  onDislike,
  disliked,
  timestamp,
}) => {
  const isAssistant = role === "assistant";
  const [svgContent, setSvgContent] = useState("");
  const [svgAltText, setSvgAltText] = useState("");
  const [displayedContent, setDisplayedContent] = useState(content);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const svgMatch = content.match(/!\[([^\]]*)\]\((https?:\/\/[^)]+\.svg)\)/);
    if (svgMatch && isAssistant) {
      const altText = svgMatch[1];
      const svgUrl = svgMatch[2];
      setSvgAltText(altText);
      fetch(svgUrl)
        .then((response) => response.text())
        .then((data) => {
          setSvgContent(data);
          const cleanedContent = content.replace(
            /!\[([^\]]*)\]\((https?:\/\/[^)]+\.svg)\)/,
            ""
          );
          setDisplayedContent(cleanedContent);
        })
        .catch((error) => {
          console.error("Error fetching SVG:", error);
          setDisplayedContent(content);
        });
    } else {
      setDisplayedContent(content);
      setSvgContent("");
      setSvgAltText("");
    }
  }, [content, isAssistant]);

  if (!content) return null;

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div
      className={`py-2 transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      <div className="max-w-4xl mx-auto px-3">
        <div
          className={`rounded-md shadow-sm p-3 ${
            isAssistant
              ? darkMode
                ? "bg-gray-800 border-l-2 border-blue-600"
                : "bg-white border-l-2 border-blue-500"
              : darkMode
              ? "bg-gray-800/60 border-l-2 border-orange-500"
              : "bg-gray-50 border-l-2 border-orange-400"
          }`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
                isAssistant
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-orange-600"
                  : "bg-orange-400"
              }`}
            >
              {isAssistant ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1">
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {isAssistant ? "Assistant" : "You"}
                  </span>
                  {isTyping && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        darkMode
                          ? "bg-blue-900/40 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      typing...
                    </span>
                  )}
                </div>

                {timestamp && (
                  <div
                    className={`flex items-center text-xs ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{timestamp}</span>
                  </div>
                )}
              </div>

              <div
                className={`prose ${
                  darkMode ? "prose-invert" : ""
                } max-w-none ${darkMode ? "text-gray-200" : "text-gray-800"}`}
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                }}
              >
                {isTyping ? (
                  <TypeWriter text={displayedContent} darkMode={darkMode} />
                ) : (
                  <>
                    <ReactMarkdown
                      components={{
                        h3: ({ node, ...props }) => (
                          <h3
                            className={`text-lg font-bold mt-2 mb-1 ${
                              darkMode ? "text-gray-100" : "text-gray-800"
                            }`}
                            {...props}
                          />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4
                            className="text-base font-bold mt-2 mb-1"
                            {...props}
                          />
                        ),
                        h5: ({ node, ...props }) => (
                          <h5
                            className="text-sm font-bold mt-1 mb-1"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="my-1.5 leading-relaxed" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="my-1.5 pl-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="my-1.5 pl-1" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="ml-4 mb-1" {...props} />
                        ),
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <div className="relative group my-2 rounded-md overflow-hidden">
                              <div
                                className={`absolute top-0 left-0 right-0 px-3 py-1 flex justify-between items-center ${
                                  darkMode
                                    ? "bg-gray-700 text-gray-300 border-b border-gray-600"
                                    : "bg-gray-100 text-gray-700 border-b border-gray-200"
                                }`}
                              >
                                <span className="font-mono text-xs">
                                  {match[1]}
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(String(children))
                                  }
                                  className={`p-1 rounded-md transition-colors ${
                                    darkMode
                                      ? "hover:bg-gray-600 text-gray-300"
                                      : "hover:bg-gray-200 text-gray-700"
                                  }`}
                                  title="Copy code"
                                >
                                  {copySuccess ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <SyntaxHighlighter
                                {...props}
                                style={darkMode ? oneDark : oneLight}
                                language={match[1]}
                                PreTag="div"
                                className="!pt-8"
                                customStyle={{
                                  margin: 0,
                                  padding: "2rem 0.75rem 0.75rem 0.75rem",
                                  borderRadius: "0.375rem",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code
                              {...props}
                              className={`${className} px-1 py-0.5 rounded-sm font-mono text-xs ${
                                darkMode
                                  ? "bg-gray-700 text-gray-200"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {displayedContent}
                    </ReactMarkdown>

                    {svgContent && (
                      <div className="mt-2 p-1 rounded-md border border-gray-200/20">
                        <SvgViewer
                          svgContent={svgContent}
                          altText={svgAltText}
                          darkMode={darkMode}
                        />
                      </div>
                    )}
                  </>
                )}

                {isAssistant && !isTyping && (
                  <div
                    className={`flex items-center justify-end mt-2 pt-1 ${
                      darkMode
                        ? "border-t border-gray-700/30"
                        : "border-t border-gray-200/50"
                    }`}
                  >
                    <button
                      onClick={onDislike}
                      className={`px-2 py-1 rounded-md text-xs flex items-center space-x-1 transition-all ${
                        disliked
                          ? darkMode
                            ? "bg-red-500/20 text-red-400"
                            : "bg-red-100 text-red-600"
                          : darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      <span>Dislike</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
