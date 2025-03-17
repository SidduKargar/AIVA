import React, { useState } from "react";
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
} from "lucide-react";

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
    console.log("Delete All Chats");
  };

  const handleContactUs = () => {
    // Add logic to handle Contact Us
    console.log("Contact Us");
  };

  const handleLogout = () => {
    // Add logic to handle Logout
    console.log("Log Out");
  };

  return (
    <>
      {/* Sidebar Toggle Button - Floating */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 z-50 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "left-60" : "left-4"
        }`}
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-full shadow-lg border 
          ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }
          transform transition-all duration-200 hover:scale-105`}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Main Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out shadow-lg z-40 ${
          isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
        } ${
          darkMode
            ? "bg-gray-900 border-gray-800 text-gray-200"
            : "bg-white border-gray-200 text-gray-800"
        } border-r flex flex-col`}
      >
        {/* Header with Brand */}
        <div className="h-[3.8rem] flex items-center px-6 border-b border-opacity-50 border-gray-700">
          <h2
            className={`text-lg font-medium ${
              darkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Conversations
          </h2>
        </div>

        {/* New Chat Button */}
        <div className="p-5">
          <button
            onClick={startNewChat}
            className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-medium
              ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
              transition-colors duration-200 shadow-sm transform hover:shadow hover:translate-y-px`}
          >
            <Sparkles className="w-4 h-4" />
            <span>New chat</span>
          </button>
        </div>

        {/* Chat History Header */}
        <div className="px-6 pt-2 pb-1">
          <h3
            className={`text-xs font-semibold uppercase tracking-wider ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Recent Conversations
          </h3>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {chatHistory.length === 0 ? (
            <div
              className={`text-center py-8 px-4 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              } text-sm italic`}
            >
              No conversation history
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`group relative rounded-lg mb-1.5 ${
                  activeChat === chat.id
                    ? darkMode
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-900"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-800/50"
                    : "text-gray-700 hover:bg-gray-100"
                } transition-all duration-150`}
              >
                <button
                  onClick={() => switchChat(chat.id)}
                  className="w-full px-4 py-2.5 flex items-center space-x-3 text-left"
                  aria-selected={activeChat === chat.id}
                >
                  <MessageSquare
                    className={`w-4 h-4 flex-shrink-0 ${
                      activeChat === chat.id
                        ? darkMode
                          ? "text-blue-400"
                          : "text-blue-600"
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span className="truncate text-sm font-medium">
                    {chat.title}
                  </span>
                </button>
                {activeChat === chat.id && (
                  <button
                    onClick={clearChat}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                        : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                    }`}
                    aria-label="Clear conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Divider */}
        <div
          className={`mx-5 h-px ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
        ></div>

        {/* Profile Section */}
        <div className="p-4 relative">
          <button
            onClick={handleProfileClick}
            className={`w-full px-4 py-2.5 rounded-lg ${
              darkMode
                ? "bg-gray-800/70 hover:bg-gray-800 text-gray-200"
                : "bg-gray-100/70 hover:bg-gray-100 text-gray-800"
            } flex items-center justify-between transition-colors duration-200`}
            aria-expanded={isProfilePopupOpen}
          >
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5" />
              <span className="font-medium">My Profile</span>
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                isProfilePopupOpen
                  ? darkMode
                    ? "bg-blue-400"
                    : "bg-blue-600"
                  : darkMode
                  ? "bg-gray-700"
                  : "bg-gray-300"
              }`}
            ></div>
          </button>

          {/* Profile Popup Menu */}
          {isProfilePopupOpen && (
            <div
              className={`absolute bottom-16 left-4 w-56 rounded-lg shadow-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              } border ${
                darkMode ? "border-gray-700" : "border-gray-200"
              } z-50 overflow-hidden animate-fade-in`}
            >
              <button
                onClick={() => console.log("Settings")}
                className={`w-full px-4 py-3 flex items-center space-x-3 ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-200"
                    : "hover:bg-gray-100 text-gray-800"
                } transition-colors duration-150`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleDeleteAllChats}
                className={`w-full px-4 py-3 flex items-center space-x-3 ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-200"
                    : "hover:bg-gray-100 text-gray-800"
                } transition-colors duration-150`}
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete All Chats</span>
              </button>
              <button
                onClick={handleContactUs}
                className={`w-full px-4 py-3 flex items-center space-x-3 ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-200"
                    : "hover:bg-gray-100 text-gray-800"
                } transition-colors duration-150`}
              >
                <Mail className="w-5 h-5" />
                <span>Contact Us</span>
              </button>
              <div
                className={`h-px mx-3 ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
              <button
                onClick={handleLogout}
                className={`w-full px-4 py-3 flex items-center space-x-3 ${
                  darkMode
                    ? "hover:bg-red-900/40 text-red-400"
                    : "hover:bg-red-50 text-red-600"
                } transition-colors duration-150`}
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
