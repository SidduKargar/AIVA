import React, {useEffect, useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trash2,
  User,
  Settings,
  Mail,
  LogOut,
} from 'lucide-react';

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  darkMode,
  chatHistory,
  activeChat,
  startNewChat,
  switchChat,
  clearChat,
}) => {
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfilePopupOpen(!isProfilePopupOpen);
  };

  const handleDeleteAllChats = () => {
    // Add logic to delete all chats
    console.log('Delete All Chats');
  };

  const handleContactUs = () => {
    // Add logic to handle Contact Us
    console.log('Contact Us');
  };

  const handleLogout = () => {
    // Add logic to handle Logout
    console.log('Log Out');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-0'
      } ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      } border-r flex flex-col`}
    >
      {/* Expand/Collapse Button - Outside the sidebar */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 transition-all duration-300 z-50 ${
          isSidebarOpen ? 'left-60' : 'left-4'
        }`}
      >
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 
          ${
            darkMode
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }
          transform transition-all duration-200 hover:scale-110`}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Main Sidebar Content - Only visible when expanded */}
      <div
        className={`${
          isSidebarOpen ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-200 flex flex-col h-full`}
      >
        {/* Header */}
        <div className="h-[3.8rem] flex items-center px-4 border-b border-gray-800">
          <h2
            className={`font-semibold ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            Chats
          </h2>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={startNewChat}
            className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2
              ${darkMode ? 'bg-blue-500 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
              text-white transition-colors duration-200`}
          >
            <Sparkles className="w-4 h-4" />
            <span>New chat</span>
          </button>
        </div>


        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`group relative mx-2 mb-1 rounded-lg ${
                activeChat === chat.id
                  ? darkMode
                    ? 'bg-gray-800'
                    : 'bg-gray-100'
                  : darkMode
                  ? 'hover:bg-gray-800/50'
                  : 'hover:bg-gray-100'
              } transition-colors duration-200`}
            >
              <button
                onClick={() => switchChat(chat.id)}
                className="w-full px-4 py-2 flex items-center space-x-3"
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-left text-sm">{chat.title}</span>
              </button>
              {activeChat === chat.id && (
                <button
                  onClick={clearChat}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t border-gray-800 ${
            darkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'
          }`}
        >
          <div
            className={`text-xs ${
              darkMode ? 'text-gray-500' : 'text-gray-600'
            }`}
          >
            Chat History
          </div>
        </div>

        {/* Profile Section */}
        <div
          className={`p-4 border-t border-gray-800 ${
            darkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'
          } relative`}
        >
          <button
            onClick={handleProfileClick}
            className={`w-full px-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-gray-800/50 hover:bg-gray-800'
                : 'bg-gray-50 hover:bg-gray-100'
            } flex items-center space-x-3 transition-colors duration-200`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>

          {/* Profile Popup */}
          {isProfilePopupOpen && (
            <div
              className={`absolute bottom-16 left-4 w-56 rounded-lg shadow-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } border ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } z-50`}
            >
              <button
                onClick={() => console.log('Settings')}
                className={`w-full px-4 py-2 flex items-center space-x-3 ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleDeleteAllChats}
                className={`w-full px-4 py-2 flex items-center space-x-3 ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete All Chats</span>
              </button>
              <button
                onClick={handleContactUs}
                className={`w-full px-4 py-2 flex items-center space-x-3 ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <Mail className="w-5 h-5" />
                <span>Contact Us</span>
              </button>
              <button
                onClick={handleLogout}
                className={`w-full px-4 py-2 flex items-center space-x-3 ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;