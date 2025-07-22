import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Editor from './components/Editor/Editor';
import History from './components/History/History';
import PrivateRoute from './components/routing/PrivateRoute';
import Navbar from './components/Navbar/Navbar';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={<PrivateRoute><Editor /></PrivateRoute>}
            />
            <Route
              path="/history"
              element={<PrivateRoute><History /></PrivateRoute>}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;




