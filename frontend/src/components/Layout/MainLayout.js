import React, { useState, useEffect } from 'react';
import { FiMenu, FiMessageSquare, FiPlus } from 'react-icons/fi';
import { cn } from '../../lib/utils';
import './MainLayout.css';

const MainLayout = ({ historyComponent, chatComponent, onNewChat, onHistoryItemClick }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  // Close history on mobile when clicking outside
  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      const toggleButton = document.querySelector('.toggle-sidebar');
      
      if (isHistoryOpen && 
          !sidebar?.contains(event.target) && 
          !toggleButton?.contains(event.target)) {
        setIsHistoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHistoryOpen, isMobile]);
  
  const startNewChat = () => {
    if (typeof onNewChat === 'function') {
      onNewChat();
    }
    // Close the sidebar on mobile after starting a new chat
    if (isMobile) {
      setIsHistoryOpen(false);
    }
  };

  // Handle history item click
  const handleHistoryItemClick = (chatId) => {
    if (typeof onHistoryItemClick === 'function') {
      onHistoryItemClick(chatId);
    }
    if (isMobile) {
      setIsHistoryOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out',
          isMobile ? (isHistoryOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
          'lg:static lg:z-0',
          isMobile || isHistoryOpen ? 'block' : 'hidden'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 flex-shrink-0">
            <button 
              onClick={startNewChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-md border border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiPlus className="h-4 w-4" />
              <span>New chat</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">Recent</h3>
              <div className="space-y-1">
                {React.cloneElement(historyComponent, {
                  ...(historyComponent.props.onItemClick ? {} : { onItemClick: handleHistoryItemClick })
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Takes full width */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* Fixed Header - positioned below navbar */}
        <header className="fixed top-14 left-0 right-0 h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center px-4 z-40">
          <div className="w-full max-w-7xl mx-auto flex items-center space-x-4">
            <button 
              onClick={toggleHistory}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isHistoryOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <FiMenu size={20} />
            </button>
            {!isHistoryOpen && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Click the menu icon to view history
              </span>
            )}
          </div>
        </header>
        
        {/* Spacer to push content below fixed header and navbar */}
        <div className="h-24 flex-shrink-0"></div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          {chatComponent}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
