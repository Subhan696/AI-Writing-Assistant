import React, { useState } from 'react';
import { FiMenu, FiX, FiMessageSquare, FiEdit3, FiClock } from 'react-icons/fi';
import { cn } from '../../lib/utils';
import './MainLayout.css';

const MainLayout = ({ children, historyComponent, editorComponent, chatComponent }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [activeView, setActiveView] = useState('editor'); // 'editor' or 'chat'

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  return (
    <div className="main-layout">
      {/* Sidebar Toggle Button */}
      <button 
        onClick={toggleHistory}
        className="fixed left-4 top-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg lg:hidden"
        aria-label={isHistoryOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isHistoryOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out transform',
          isHistoryOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:flex-shrink-0'
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">History</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-65px)]">
          {historyComponent}
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        'flex-1 transition-all duration-300',
        isHistoryOpen ? 'lg:ml-64' : 'lg:ml-0'
      )}>
        {/* View Toggle */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <button
                onClick={() => setActiveView('editor')}
                className={cn(
                  'px-4 py-3 text-sm font-medium flex items-center',
                  activeView === 'editor' 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                )}
              >
                <FiEdit3 className="mr-2" /> Editor
              </button>
              <button
                onClick={() => setActiveView('chat')}
                className={cn(
                  'px-4 py-3 text-sm font-medium flex items-center',
                  activeView === 'chat' 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                )}
              >
                <FiMessageSquare className="mr-2" /> AI Assistant
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeView === 'editor' ? editorComponent : chatComponent}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
