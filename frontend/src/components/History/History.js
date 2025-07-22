import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      <h2>Writing History</h2>
      {history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        <ul className="history-list">
          {history.map((item) => (
            <li key={item._id} className="history-item">
              <div className="history-item-content">
                <strong>Prompt:</strong>
                <p>{item.prompt}</p>
                <strong>Response:</strong>
                <p>{item.response}</p>
              </div>
              <span className="history-date">
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;
