import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Profile = lazy(() => import('./components/Profile'));
const SkillSwap = lazy(() => import('./components/SkillSwap'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const SwapRequests = lazy(() => import('./components/SwapRequests'));
const AdminSwapRequest = lazy(() => import('./components/AdminSwapRequest'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SkillXchangeLanding = lazy(() => import('./components/Landing'));
const Index = lazy(() => import('./components/index'));
const MessengerPage = lazy(() => import('./components/MessengerPage'));
const AllUsers = lazy(() => import('./components/AllUsers'));

function App() {
  return (
    <div className="App">
      <Router>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-800"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<SkillXchangeLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/adminswaprequest" element={<AdminSwapRequest />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<NavBar><Dashboard /></NavBar>} />
            <Route path="/all-users" element={<NavBar><AllUsers /></NavBar>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:id" element={<NavBar><UserProfile /></NavBar>} />
            <Route path="/skill-swap" element={<SkillSwap />} />
            <Route path="/swap-requests" element={<SwapRequests />} />
            <Route path="/index" element={<Index />} />
            <Route path="/messenger" element={<MessengerPage />} />
          </Routes>
        </Suspense>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default App;