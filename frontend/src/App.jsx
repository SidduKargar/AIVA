import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Message from './components/Message';
import SkeletonLoader from './components/SkeletonLoader';
import InputFooter from './components/InputFooter';
import WelcomeCards from './components/WelcomeCards';

const App = () => {

  const isNightTime = () => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6; // Nighttime from 6 PM to 6 AM
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(isNightTime() ? true : false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(Date.now());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { id: Date.now(), title: 'New Chat', messages: [] },
  ]);
  const [activeChat, setActiveChat] = useState(Date.now());
  const [deepThink, setDeepThink] = useState(false); // Add this state
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setChatHistory(parsedHistory);
      if (parsedHistory.length > 0) {
        setActiveChat(parsedHistory[0].id);
        setMessages(parsedHistory[0].messages);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
  
    const userMessage = input.trim();
    setInput('');
  
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
  
    // Update chat history
    setChatHistory((prevHistory) =>
      prevHistory.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: newMessages,
              title: userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : ''),
            }
          : chat
      )
    );
  
    setLoading(true);
  
    try {
      let endpoint = 'generate'; // default endpoint
      let requestBody = {
        prompt: userMessage,
        documentId: activeDocumentId,
        conversationId,
        deepThink,
      };
  
      // Check if the last assistant message was about code search
      const lastAssistantMessage = messages
        .filter(m => m.role === 'assistant')
        .pop()?.content;
  
      if (lastAssistantMessage?.includes('programming language are you looking for')) {
        endpoint = 'search-code';
        // Extract language and query from user message
        const [language, ...queryParts] = userMessage.split(' ');
        requestBody = {
          language,
          query: queryParts.join(' '),
          conversationId,
          deepThink
        };
      } 
      // Check if the last assistant message was about documentation search
      else if (lastAssistantMessage?.includes('documentation or technical information')) {
        endpoint = 'search-docs';
        requestBody = {
          query: userMessage,
          conversationId,
          deepThink
        };
      }
  
      const res = await fetch(`http://localhost:3000/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!res.ok) throw new Error('Failed to generate response');
  
      const data = await res.json();
      const updatedMessages = [...newMessages, { role: 'assistant', content: data.response }];
      setMessages(updatedMessages);
  
      // Update chat history
      setChatHistory((prevHistory) =>
        prevHistory.map((chat) =>
          chat.id === activeChat ? { ...chat, messages: updatedMessages } : chat
        )
      );
  
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, data.response.length * 10);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
  
      setChatHistory((prevHistory) =>
        prevHistory.map((chat) =>
          chat.id === activeChat ? { ...chat, messages: updatedMessages } : chat
        )
      );
    } finally {
      setLoading(false);
    }
  };
  
  const startNewChat = () => {
    const newChatId = Date.now();
    setChatHistory((prev) => [
      { id: newChatId, title: 'New Chat', messages: [] },
      ...prev,
    ]);
    setActiveChat(newChatId);
    setMessages([]);
    setInput('');
    setIsTyping(false);
    setConversationId(newChatId);
    setActiveDocumentId(null);
  
    // Optionally, you can clear the server-side chat history for the old conversationId
    fetch(`http://localhost:3000/clear-chat/${conversationId}`, {
      method: 'DELETE',
    });
  };

  const switchChat = (chatId) => {
    setActiveChat(chatId);
    const chat = chatHistory.find((c) => c.id === chatId);
    setMessages(chat.messages);
    setConversationId(chatId);
  };

  const clearChat = () => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== activeChat));
    if (chatHistory.length > 1) {
      const nextChat = chatHistory.find((chat) => chat.id !== activeChat);
      setActiveChat(nextChat.id);
      setMessages(nextChat.messages);
      setConversationId(nextChat.id);
    } else {
      startNewChat();
    }
  };

  const handleDislike = (messageIndex) => {
    const updatedMessages = messages.map((msg, idx) => {
      if (idx === messageIndex && msg.role === 'assistant') {
        return { ...msg, disliked: !msg.disliked };
      }
      return msg;
    });
    setMessages(updatedMessages);

    setChatHistory((prevHistory) =>
      prevHistory.map((chat) =>
        chat.id === activeChat ? { ...chat, messages: updatedMessages } : chat
      )
    );
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        chatHistory={chatHistory}
        activeChat={activeChat}
        startNewChat={startNewChat}
        switchChat={switchChat}
        clearChat={clearChat}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <Header
          isSidebarOpen={isSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          clearChat={clearChat}
        />

        <main className="pt-16 pb-32">
          {messages.length === 0 ? (
            <WelcomeCards
              darkMode={darkMode}
              setActiveDocumentId={setActiveDocumentId}
              setMessages={setMessages}
            />
          ) : (
            <>
              {messages.map((message, index) => (
                <Message
                  key={`${conversationId}-${index}`}
                  content={message.content}
                  role={message.role}
                  darkMode={darkMode}
                  isTyping={
                    isTyping &&
                    index === messages.length - 1 &&
                    message.role === 'assistant'
                  }
                  onDislike={() => handleDislike(index)}
                  disliked={message.disliked}
                />
              ))}
              {loading && <SkeletonLoader darkMode={darkMode} />}
            </>
          )}
          <div ref={messagesEndRef} />
        </main>

        <InputFooter
          isSidebarOpen={isSidebarOpen}
          darkMode={darkMode}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          loading={loading}
          deepThink={deepThink} // Pass the deepThink state
          setDeepThink={setDeepThink} // Pass the setter function
        />
      </div>
    </div>
  );
};

export default App;
