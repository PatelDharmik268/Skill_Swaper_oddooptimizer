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

const statusOptions = ['All', 'pending', 'success', 'reject'];

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState('All');
  const [users, setUsers] = useState([]);
  const profilesPerPage = 5;
  const isLoggedIn = true; // Replace with real auth logic
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/users');
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } catch (err) {
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Filtered and paginated users
  const filteredUsers = users.filter(
    (u) =>
      (status === 'All' || u.status === status) &&
      ((u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredUsers.length / profilesPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * profilesPerPage,
    currentPage * profilesPerPage
  );

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
            <button className="px-3 py-2 rounded-lg font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors">Users</button>
            <button
              className="px-3 py-2 rounded-lg font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              onClick={() => navigate('/adminswaprequest')}
            >
              Swap request
            </button>
          </nav>
          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-purple-600" />
            </div>
            <span className="text-gray-700 font-medium hidden sm:block">Admin</span>
            <button onClick={() => {
              localStorage.removeItem('userId');
              localStorage.removeItem('token');
              navigate('/login');
            }} className="text-gray-400 hover:text-purple-600 transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-2 sm:px-4 py-6 flex flex-col">
        {/* Search and Status Dropdown */}
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
            <span className="text-gray-500 text-sm">Status:</span>
            <div className="relative">
              <select
                value={status}
                onChange={e => { setStatus(e.target.value); setCurrentPage(1); }}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        {/* User Cards and Pagination Wrapper */}
        <div className="flex-1 flex flex-col">
          <div className="space-y-5 flex-1">
            {paginatedUsers.length === 0 && (
              <div className="text-center text-gray-400 py-10">No users found.</div>
            )}
            {paginatedUsers.map(user => (
              <div key={user._id} className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col sm:flex-row items-center sm:items-stretch p-4 sm:p-6 gap-4 sm:gap-8 transition-transform hover:scale-[1.01]">
                {/* Profile Photo */}
                <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <User size={48} className="text-purple-600" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold text-gray-800">{user.username}</span>
                    <span className="flex items-center text-yellow-500 ml-2">
                      <Star size={16} className="mr-1" />
                      <span className="text-sm font-medium">N/A</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    <span className="text-xs text-gray-500 py-1">Skills Offered:</span>
                    {user.skillsOffered?.split(',').map(skill => (
                      <span key={skill} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">{skill.trim()}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    <span className="text-xs text-gray-500 py-1">Skills Wanted:</span>
                    {user.skillsWanted?.split(',').map(skill => (
                      <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{skill.trim()}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">Availability:</span>
                    <span className="text-xs text-gray-700 font-medium">{user.availability}</span>
                  </div>
                </div>
                {/* Reject Button on the right */}
                <div className="flex items-center justify-end w-full sm:w-auto sm:ml-auto mt-4 sm:mt-0">
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow"
                    onClick={() => alert(`Reject action for user: ${user.username}`)}
                  >
                    Reject
                  </button>
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
    </div>
  );
};

export default AdminDashboard;