import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiClock, FiFileText } from 'react-icons/fi';
import './History.css';

const History = () => {
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

  return (
    <div className="history-container">
      <div className="history-header">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Chat History</h2>
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
              <li key={item._id} className="history-item group">
                <div className="history-item-content">
                  <div className="history-message">
                    <div className="message-text">
                      {item.prompt && <p className="prompt-text">{item.prompt}</p>}
                      {item.response && <p className="response-text">{item.response}</p>}
                    </div>
                  </div>
                  <div className="history-meta">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <FiClock className="mr-1" size={12} />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
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
