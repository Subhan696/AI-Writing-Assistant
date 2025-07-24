import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiUser, FiMessageSquare, FiLoader, FiCopy, FiCheck, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: 'Hello! I\'m your AI writing assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
      feedback: null
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = React.useContext(AuthContext);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userInput = input.trim();
    if (!userInput || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: userInput,
      sender: 'user',
      timestamp: new Date(),
    };

    // Clear input and set loading state
    setInput('');
    setIsLoading(true);
    
    // Update messages with user message
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call AI API
      const response = await generateAPI.generateText(userInput);
      
      if (response && response.data && response.data.generatedText) {
        // Add AI response
        const aiMessage = {
          id: Date.now() + 1,
          content: response.data.generatedText,
          sender: 'ai',
          timestamp: new Date(),
        };
        
        // Update with AI response
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to get response from AI. Please try again.');
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
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

  const handleFeedback = (messageId, isPositive) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, feedback: isPositive ? 'positive' : 'negative' } : msg
    ));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length <= 1 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <FiMessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">How can I help you today?</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Ask me anything or share your thoughts. I'm here to assist you with any questions or tasks you have.
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {messages.slice(1).map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`group ${message.sender === 'user' ? 'flex justify-end' : ''}`}
                >
                  <div className={`max-w-3xl rounded-xl p-4 ${message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
                    {message.sender === 'ai' && (
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                            title="Copy to clipboard"
                          >
                            {copiedId === message.id ? <FiCheck size={16} /> : <FiCopy size={16} />}
                          </button>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleFeedback(message.id, true)}
                            className={`p-1.5 rounded-full ${message.feedback === 'positive' 
                              ? 'text-green-500' 
                              : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                            title="Good response"
                          >
                            <FiThumbsUp size={16} />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, false)}
                            className={`p-1.5 rounded-full ${message.feedback === 'negative' 
                              ? 'text-red-500' 
                              : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                            title="Bad response"
                          >
                            <FiThumbsDown size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {message.sender === 'ai' && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-4">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.sender === 'user' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="max-w-3xl rounded-xl p-4 bg-gray-100 dark:bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <FiLoader className="animate-spin h-5 w-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex space-x-2 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI Assistant..."
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <FiLoader className="animate-spin h-5 w-5" />
              ) : (
                <FiSend className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          AI Assistant may produce inaccurate information. Consider checking important information.
        </p>
      </div>
    </div>
  );
};

export default Chat;
