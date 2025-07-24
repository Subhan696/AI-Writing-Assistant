import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

import Chat from './components/Chat/Chat';
import History from './components/History/History';
import SharePage from './components/SharePage/SharePage';
import PrivateRoute from './components/routing/PrivateRoute';
import Navbar from './components/Navbar/Navbar';
import MainLayout from './components/Layout/MainLayout';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import './App.css';

// Wrapper component to use the useRealtimeSync hook
const AppContent = () => {
  useRealtimeSync();
  const [chatKey, setChatKey] = React.useState(0);
  const [currentChatId, setCurrentChatId] = React.useState(null);
  
  // Handle new chat creation
  const handleNewChat = () => {
    setCurrentChatId(null);
    // Force remount the Chat component with a new key
    setChatKey(prevKey => prevKey + 1);
  };
  
  // Handle clicking on a chat history item
  const handleHistoryItemClick = (chatId) => {
    setCurrentChatId(chatId);
    // Force remount the Chat component with the selected chat
    setChatKey(prevKey => prevKey + 1);
  };
  
  // Main chat interface with history sidebar
  const MainApp = () => (
    <MainLayout
      key={chatKey}
      chatComponent={<Chat key={chatKey} chatId={currentChatId} />}
      historyComponent={
        <History 
          onNewChat={handleNewChat} 
          onItemClick={handleHistoryItemClick}
        />
      }
      onNewChat={handleNewChat}
    />
  );

  return (
    <>
      <Navbar />
      <div className="flex-1 flex flex-col w-full">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/share/:id" element={<SharePage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainApp />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <AppContent />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;




