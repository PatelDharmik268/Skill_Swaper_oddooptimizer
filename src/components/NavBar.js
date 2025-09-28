import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  ChevronDown,
  LogOut,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const NavBar = ({ children }) => {
  const [user, setUser] = useState(null);
  const isLoggedIn = true; // Replace with real auth logic
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/auth/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (res.ok && data.success !== false) {
          setUser(data.user || data);
        }
      } catch (err) {
        // handle error
      }
    };
    fetchUser();
  }, []);

  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-purple-700 sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          {/* Brand */}
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="flex justify-center mb-0">
                <img src={logo} alt="Logo" className="w-9 h-9 rounded-2xl object-cover" />
              </div>
            </div>
            <span className="text-xl font-bold text-purple-800 hidden sm:block">SkillXchange</span>
          </div>
          
          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-2 md:space-x-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 font-semibold transition-all duration-300 relative ${
                location.pathname === '/dashboard' 
                  ? "text-purple-800"
                  : "text-purple-700 hover:text-purple-800"
              }`}
            >
              Home
              {location.pathname === '/dashboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-800 rounded-full"></div>
              )}
            </button>
            <button 
              onClick={() => navigate('/swap-requests')}
              className={`px-4 py-2 font-semibold transition-all duration-300 relative ${
                location.pathname === '/swap-requests' 
                  ? "text-purple-800"
                  : "text-purple-700 hover:text-purple-800"
              }`}
            >
              Swap Requests
              {location.pathname === '/swap-requests' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-800 rounded-full"></div>
              )}
            </button>
            <Link 
              to="/messenger"
              className={`px-4 py-2 font-semibold transition-all duration-300 relative ${
                location.pathname === '/messenger' 
                  ? "text-purple-800"
                  : "text-purple-700 hover:text-purple-800"
              }`}
            >
              Chat
              {location.pathname === '/messenger' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-800 rounded-full"></div>
              )}
            </Link>
          </nav>
          
          {/* Profile & Logout */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full border-2 border-purple-400 flex items-center justify-center bg-white hover:border-purple-500 transition-all shadow-md hover:scale-105"
              title="Profile"
            >
              {user && user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <User size={24} className="text-purple-600" />
              )}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('userId');
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="px-2 py-2 rounded-3xl bg-purple-700 text-white font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              title="Logout"
            >
              <LogOut size={22} className="font-bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default NavBar;