import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import NavBar from './components/NavBar';
import SkillSwap from './components/SkillSwap';
import UserProfile from './components/UserProfile';
import SwapRequests from './components/SwapRequests';
import AdminSwapRequest from './components/AdminSwapRequest';
import AdminDashboard from './components/AdminDashboard';
import SkillXchangeLanding from './components/Landing';
import Index from './components/index';
import MessengerPage from './components/MessengerPage';

import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<SkillXchangeLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/adminswaprequest" element={<AdminSwapRequest />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<NavBar><Dashboard /></NavBar>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<NavBar><UserProfile /></NavBar>} />
          <Route path="/skill-swap" element={<SkillSwap />} />
          <Route path="/swap-requests" element={<SwapRequests />} />
          <Route path="/index" element={<Index />} />
          <Route path="/messenger" element={<MessengerPage />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default App;