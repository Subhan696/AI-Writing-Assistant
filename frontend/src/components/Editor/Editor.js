import React, { useState, useContext } from 'react';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import { AuthContext } from '../../context/AuthContext';
import { handleSuccess } from '../../utils/errorHandler';
import { generateAPI, shareAPI } from '../../services/api';
import { useUsage } from '../../hooks/useUsage';
import './Editor.css';

const Editor = () => {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  const [error, setError] = useState(null);
  const { user, refreshUser } = useContext(AuthContext);
  const { currentUsage, maxUsage, isPro, usagePercentage, remaining, usageBarClass } = useUsage();

const handleGeneration = async (type) => {
  if (!text.trim()) {
    setError('Please enter some text first');
    return;
  }

  setIsLoading(true);
  setError(null);
  setSuggestions([]);

  try {
    const prompt = type === 'rephrase' 
      ? `Rephrase the following text: "${text}"` 
      : text;

    const response = await generateAPI.generateText(prompt);
    setSuggestions([response.data.generatedText]);
    handleSuccess('Text generated successfully!');
    
    // Refresh user data to update usage count
    await refreshUser();
  } catch (err) {
    const errorMsg = err.response?.data?.msg || 'Error generating text. Please try again.';
    setError(errorMsg);
    console.error('Error generating text:', err);
  } finally {
    setIsLoading(false);
  }
};

  const handleSuggestionClick = (suggestion) => {
    setText(prevText => `${prevText} ${suggestion}`.trim());
    setSuggestions([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleExportTxt = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportDocx = () => {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph(text),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'document.docx');
    });
  };

  const handleShare = async () => {
    if (!text.trim()) {
      setError('Please enter some text to share');
      return;
    }

    try {
      setIsLoading(true);
      const response = await shareAPI.createShare(text);
      const { shareId } = response.data;
      const link = `${window.location.origin}/share/${shareId}`;
      setShareableLink(link);
      handleSuccess('Shareable link created!');
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      console.error('Error creating shareable link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <div className="editor-container">
      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError} className="close-error">×</button>
        </div>
      )}
      {!isPro && (
        <div className="usage-info">
          <div className="usage-bar">
            <div 
              className={`usage-bar-fill ${usageBarClass}`} 
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          <div className="usage-text">
            <span>Usage: {currentUsage}/{maxUsage}</span>
            <span>{remaining} {remaining === 1 ? 'use' : 'uses'} remaining</span>
          </div>
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="editor-textarea"
        placeholder="Start writing..."
      />
      <div className="editor-buttons">
        <button onClick={() => handleGeneration('generate')} disabled={isLoading || !text}>
          Generate Next Line
        </button>
        <button onClick={() => handleGeneration('rephrase')} disabled={isLoading || !text}>
          Rephrase
        </button>
        <button onClick={handleCopy} disabled={!text}>
          Copy to Clipboard
        </button>
        <button onClick={handleExportTxt} disabled={!text}>
          Export to .txt
        </button>
        <button onClick={handleExportDocx} disabled={!text}>
          Export to .docx
        </button>
        <button onClick={handleShare} disabled={!text}>
          Share
        </button>
        {copySuccess && <span className="copy-success">{copySuccess}</span>}
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
              <li key={i} onClick={() => handleSuggestionClick(s)}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {shareableLink && (
        <div className="shareable-link-container">
          <p>Shareable Link:</p>
          <div className="share-link-input">
            <input type="text" value={shareableLink} readOnly />
            <button onClick={() => navigator.clipboard.writeText(shareableLink)}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
