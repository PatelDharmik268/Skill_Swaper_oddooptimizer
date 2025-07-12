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

// Sample data for demonstration
// Remove the static 'profiles' array and any references to it.
// In the profile card, replace:
//   <span className="text-lg font-semibold text-gray-800">{profile.name}</span>
// with:
//   <span className="text-lg font-semibold text-gray-800">{profile.username}</span>
// Also update the initials/avatar fallback if needed (but you already use profilePhoto or icon).

const availabilities = ['All', 'Mornings', 'Evenings', 'Weekends'];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availability, setAvailability] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // fetched users
  const profilesPerPage = 5;
  const isLoggedIn = true; // Replace with real auth logic
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user for avatar
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
      } catch (err) {}
    };
    fetchUser();
    // Fetch all users for dashboard
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/users');
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } catch (err) {}
    };
    fetchUsers();
  }, []);

  // Helper to parse skills string to array
  const parseSkills = (skillsString) => {
    if (!skillsString || typeof skillsString !== 'string') return [];
    // Remove leading/trailing quotes and brackets, then split by comma
    return skillsString
      .replace(/^\[?["']?/, '')   // Remove leading [ or quote
      .replace(/["']?\]?$/, '')   // Remove trailing ] or quote
      .split(',')
      .map(s => s.replace(/["']/g, '').trim()) // Remove all quotes and trim
      .filter(Boolean);
  };

  // Filtered and paginated profiles
  // Get logged-in userId from localStorage (or user state)
  const loggedInUserId = user && user._id ? user._id : localStorage.getItem('userId');
  const filteredProfiles = users.filter(
    (p) =>
      p.public !== false &&
      (availability === 'All' || (p.availability || '').includes(availability)) &&
      ((p.username || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
      p._id !== loggedInUserId // Exclude the logged-in user
  );
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * profilesPerPage,
    currentPage * profilesPerPage
  );

  // Responsive: mobile menu toggle (future)

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-2 sm:px-4 py-6 flex flex-col">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center w-full sm:w-auto bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <Search className="text-gray-400 mr-2" size={20} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full outline-none bg-transparent text-gray-700"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-sm">Availability:</span>
          <div className="relative">
            <select
              value={availability}
              onChange={e => setAvailability(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            >
              {availabilities.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      {/* Profile Cards and Pagination Wrapper */}
      <div className="flex-1 flex flex-col">
        <div className="space-y-5 flex-1">
          {paginatedProfiles.length === 0 && (
            <div className="text-center text-gray-400 py-10">No profiles found.</div>
          )}
          {paginatedProfiles.map(profile => (
            <div key={profile.id} className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col sm:flex-row items-center sm:items-stretch p-4 sm:p-6 gap-4 sm:gap-8 transition-transform hover:scale-[1.01]">
              {/* Profile Photo */}
              <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full text-3xl font-bold text-purple-600">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <User size={48} className="text-purple-600" />
                )}
              </div>
              {/* Info */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold text-gray-800">{profile.username}</span>
                  <span className="flex items-center text-yellow-500 ml-2">
                    <Star size={16} className="mr-1" />
                    <span className="text-sm font-medium">{typeof profile.rating === 'number' ? profile.rating.toFixed(1) : 'N/A'}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-1">
                  <span className="text-xs text-gray-500 py-1">Skills Offered:</span>
                  {parseSkills(profile.skillsOffered).map(skill => (
                    <span key={skill} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">{skill}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-1">
                  <span className="text-xs text-gray-500 py-1">Skills Wanted:</span>
                  {parseSkills(profile.skillsWanted).map(skill => (
                    <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{skill}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">Availability:</span>
                  <span className="text-xs text-gray-700 font-medium">{profile.availability}</span>
                </div>
              </div>
              {/* Request Button */}
              <div className="flex flex-col justify-center items-center gap-2">
                <button
                  className={`px-5 py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isLoggedIn}
                >
                  Request
                </button>
                <span className="text-xs text-gray-400">{isLoggedIn ? '' : 'Login to request'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8 mb-2">
            <button
              className="p-2 rounded-full hover:bg-purple-100 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                className={`w-8 h-8 rounded-full font-medium text-sm ${currentPage === idx + 1 ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-purple-100'}`}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className="p-2 rounded-full hover:bg-purple-100 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;