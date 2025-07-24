import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiClock, FiFileText, FiMessageSquare } from 'react-icons/fi';
import './History.css';

const History = ({ onNewChat, onItemClick }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Error fetching history', err);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div>Loading history...</div>;
  }

  // Handle clicking on a history item
  const handleHistoryItemClick = (item) => {
    console.log('History item clicked:', item);
    if (typeof onItemClick === 'function') {
      console.log('Calling onItemClick with id:', item._id);
      onItemClick(item._id);
    } else if (typeof onNewChat === 'function') {
      // Fallback to new chat if onItemClick is not provided
      console.log('No onItemClick handler, falling back to new chat');
      onNewChat();
    } else {
      console.error('No click handler provided for history item');
    }
  };

  return (
    <div className="history-container">
      <div className="history-header px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <FiMessageSquare className="mr-2" />
          Chat History
        </h2>
      </div>
      
      {history.length === 0 ? (
        <div className="empty-state">
          <FiFileText className="empty-icon" />
          <p className="empty-text">No chat history yet</p>
          <p className="empty-subtext">Your conversation history will appear here</p>
        </div>
      ) : (
        <div className="history-list-container">
          <ul className="history-list">
            {history.map((item) => (
              <li 
                key={item._id} 
                className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                onClick={() => handleHistoryItemClick(item)}
              >
                <div className="flex flex-col">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.prompt || 'New Chat'}
                    </p>
                    {item.response && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {item.response}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <FiClock className="mr-1 flex-shrink-0" size={12} />
                    <span className="truncate">
                      {new Date(item.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default History;
