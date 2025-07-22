import React, { useState } from 'react';
import axios from 'axios';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import './Editor.css';

const Editor = () => {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [shareableLink, setShareableLink] = useState('');

  const handleGeneration = async (type) => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const prompt = type === 'rephrase' 
        ? `Rephrase the following text: "${text}"` 
        : text;

      const res = await axios.post('/api/generate', { prompt });
      // The backend returns a single string, so we wrap it in an array
      setSuggestions([res.data.generatedText]);
    } catch (err) {
      console.error('Error generating text:', err);
    }
    setIsLoading(false);
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
    try {
      const res = await axios.post('/api/share', { content: text });
      const { shareId } = res.data;
      const link = `${window.location.origin}/share/${shareId}`;
      setShareableLink(link);
    } catch (err) {
      console.error('Error creating shareable link:', err);
    }
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
