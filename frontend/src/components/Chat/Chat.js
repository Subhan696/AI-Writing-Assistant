import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiUser, FiMessageSquare, FiLoader, FiCopy, FiCheck, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { generateAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Chat = ({ chatId, onNewConversation }) => {
  // State for the current conversation
  const [conversation, setConversation] = useState({
    id: null,
    title: 'New Chat',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Show welcome message on first load
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  
  // Show welcome message on first load
  useEffect(() => {
    if (!hasShownWelcome) {
      setConversation(prev => ({
        ...prev,
        messages: [
          {
            id: `welcome-${Date.now()}`,
            content: "Hello! I'm your AI writing assistant. How can I help you today?",
            sender: 'ai',
            timestamp: new Date(),
            feedback: null
          }
        ]
      }));
      setHasShownWelcome(true);
    }
  }, [hasShownWelcome]);
  
  // Load conversation when chatId changes
  useEffect(() => {
    const loadConversation = async () => {
      if (chatId) {
        try {
          // Load the conversation from the server
          const response = await axios.get(`/api/history/${chatId}`);
          if (response.data) {
            // Convert the server data to our conversation format
            const serverConversation = response.data;
            setConversation({
              id: serverConversation._id,
              title: serverConversation.title || 'Chat',
              messages: serverConversation.messages || [],
              createdAt: new Date(serverConversation.createdAt),
              updatedAt: new Date(serverConversation.updatedAt)
            });
            return; // Exit early if we loaded a conversation
          }
        } catch (error) {
          console.error('Error loading conversation:', error);
          toast.error('Failed to load conversation');
        }
      }
      
      // If no chatId or failed to load, start a new conversation
      // but only if we don't have any messages yet (to prevent clearing existing conversation)
      if (conversation.messages.length === 0) {
        setConversation({
          id: null,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    };
    
    loadConversation();
  }, [chatId]); // Only re-run when chatId changes
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = React.useContext(AuthContext);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      id: `msg-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date(),
      feedback: null
    };
    
    // Create a loading message
    const loadingMessage = {
      id: `loading-${Date.now()}`,
      content: 'AI is thinking...',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    };
    
    // Update conversation with user message and loading message
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage, loadingMessage],
      updatedAt: new Date()
    };
    
    // If this is a new conversation, set a title from the first message
    if (!conversation.id) {
      updatedConversation.title = input.slice(0, 30) + (input.length > 30 ? '...' : '');
    }
    
    setConversation(updatedConversation);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to the server using the generate endpoint
      const response = await axios.post('/api/generate', { 
        prompt: input
      });
      
      // Remove loading message and add AI response
      const aiMessage = {
        id: `ai-${Date.now()}`,
        content: response.data.generatedText || 'I apologize, but I encountered an error processing your request.',
        sender: 'ai',
        timestamp: new Date(),
        feedback: null
      };
      
      // Filter out the loading message and add AI response
      const messagesWithoutLoading = updatedConversation.messages.filter(
        msg => !msg.isLoading
      );
      
      // Update conversation with AI response
      const finalConversation = {
        ...updatedConversation,
        messages: [...messagesWithoutLoading, aiMessage],
        updatedAt: new Date()
      };
      
      setConversation(finalConversation);
      
      // TODO: Update conversation history when backend supports it
      /*
      if (!conversation.id && response.data.conversationId && onNewConversation) {
        onNewConversation({
          _id: response.data.conversationId,
          title: finalConversation.title,
          updatedAt: finalConversation.updatedAt
        });
      }
      */
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      
      // Update conversation with error message
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        updatedAt: new Date()
      }));
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

  const handleFeedback = (messageId, feedbackType) => {
    setConversation(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
      )
    }));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 mb-24">
        {conversation.messages.length === 0 ? (
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
              {conversation.messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl rounded-xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}>
                    <div className="prose dark:prose-invert">
                      {message.content}
                    </div>
                    {message.sender === 'ai' && !message.isError && (
                      <div className="mt-2 flex items-center space-x-2">
                        <button
                          onClick={() => handleFeedback(message.id, 'thumbsUp')}
                          className={`p-1 rounded-full ${
                            message.feedback === 'thumbsUp'
                              ? 'text-green-500 bg-green-100 dark:bg-green-900/30'
                              : 'text-gray-400 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title="Helpful"
                        >
                          <FiThumbsUp size={16} />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 'thumbsDown')}
                          className={`p-1 rounded-full ${
                            message.feedback === 'thumbsDown'
                              ? 'text-red-500 bg-red-100 dark:bg-red-900/30'
                              : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title="Not helpful"
                        >
                          <FiThumbsDown size={16} />
                        </button>
                      </div>
                    )}
                    <div className={`mt-1 text-xs ${
                      message.sender === 'user' 
                        ? 'text-blue-100 dark:text-blue-300' 
                        : message.isError 
                          ? 'text-red-400' 
                          : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* Loading state is now handled by the messages array */}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex space-x-2 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI Assistant..."
              className="w-full px-4 py-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="on"
              spellCheck="true"
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
