import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiUser, FiBot, FiLoader, FiCopy, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: 'Hello! I\'m your AI writing assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate API call to AI
      const response = await generateAPI.generateText(input);
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        content: response.data.generatedText,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to get response from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, messageId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    toast.success('Copied to clipboard!');
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`message ${message.sender}`}
            >
              <div className="message-avatar">
                {message.sender === 'user' ? (
                  <div className="user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || <FiUser />}
                  </div>
                ) : (
                  <div className="ai-avatar">
                    <FiBot />
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">
                    {message.sender === 'user' ? user?.name || 'You' : 'AI Assistant'}
                  </span>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                  {message.sender === 'ai' && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="copy-button"
                      aria-label="Copy to clipboard"
                    >
                      {copiedId === message.id ? <FiCheck /> : <FiCopy />}
                    </button>
                  )}
                </div>
                <div className="message-text">{message.content}</div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="message ai"
            >
              <div className="message-avatar">
                <div className="ai-avatar">
                  <FiLoader className="animate-spin" />
                </div>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message AI Assistant..."
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={isLoading || !input.trim()}
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
