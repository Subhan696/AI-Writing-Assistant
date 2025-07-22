import React, { useState } from 'react';
import axios from 'axios';
import './Editor.css';

const Editor = () => {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneration = async (type) => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const res = await axios.post('/api/generate', { text, type });
      setSuggestions(res.data.suggestions);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="editor-container">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="editor-textarea"
        placeholder="Start writing..."
      />
      <div className="editor-buttons">
        <button onClick={() => handleGeneration('generate')} disabled={isLoading}>
          Generate Next Line
        </button>
        <button onClick={() => handleGeneration('rephrase')} disabled={isLoading}>
          Rephrase
        </button>
      </div>
      {isLoading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="suggestions-container">
          <h3>Suggestions</h3>
          <ul>
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Editor;
