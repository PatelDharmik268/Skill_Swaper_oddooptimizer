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
import { useNavigate } from 'react-router-dom';

const NavBar = ({ children }) => {
  const [user, setUser] = useState(null);
  const isLoggedIn = true; // Replace with real auth logic
  const navigate = useNavigate();

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

  

  // Responsive: mobile menu toggle (future)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-lg">SP</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">SkillXchange</span>
          </div>
          {/* Nav links */}
          <nav className="flex items-center space-x-2 md:space-x-6">
            <button className="px-3 py-2 rounded-lg font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors">Home</button>
            <button className="px-3 py-2 rounded-lg font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors">Swap request</button>
          </nav>
          {/* Profile & Logout */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-12 h-12 rounded-full border-4 border-purple-400 flex items-center justify-center bg-white hover:border-purple-600 transition-all shadow-md"
              title="Profile"
            >
              {user && user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <User size={32} className="text-purple-600" />
              )}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('userId');
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="text-gray-500 hover:text-purple-600 transition-colors"
              title="Logout"
            >
              <LogOut size={30} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-2 sm:px-4 py-6 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default NavBar;