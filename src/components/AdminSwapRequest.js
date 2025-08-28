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

const AdminSwapRequest = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState('All');
  const [swapOffers, setSwapOffers] = useState([]);
  const profilesPerPage = 5;
  const isLoggedIn = true; // Replace with real auth logic
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSwapOffers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/swap-offers');
        const data = await res.json();
        if (res.ok && data.success) {
          setSwapOffers(data.swapOffers || []);
        }
      } catch (err) {
        setSwapOffers([]);
      }
    };
    fetchSwapOffers();
  }, []);

  // Filtered and paginated offers
  const filteredOffers = swapOffers.filter(
    (offer) =>
      (status === 'All' || offer.status === status) &&
      ((offer.requesterId?.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offer.requestedUserId?.username || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredOffers.length / profilesPerPage);
  const paginatedOffers = filteredOffers.slice(
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
            <button
              className="px-3 py-2 rounded-lg font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
              onClick={() => navigate('/admindashboard')}
            >
              Users
            </button>
            <button className="px-3 py-2 rounded-lg font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors">Swap request</button>
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
              placeholder="Search by user name..."
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

        {/* Swap Offers List */}
        <div className="flex-1 flex flex-col">
          <div className="space-y-8 flex-1">
            {paginatedOffers.length === 0 && (
              <div className="text-center text-gray-400 py-10">No swap offers found.</div>
            )}
            {paginatedOffers.map(offer => (
              <div key={offer._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col md:flex-row items-stretch p-6 gap-6 transition-transform hover:scale-[1.01]">
                {/* Requester Info */}
                <div className="flex-1 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
                  <div className="mb-3">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Requester</span>
                    <div className="flex flex-col items-center">
                      {offer.requesterId?.profilePhoto ? (
                        <img src={offer.requesterId.profilePhoto} alt="avatar" className="w-16 h-16 rounded-full object-cover shadow" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-2xl font-bold text-purple-600 shadow">
                          {offer.requesterId?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="mt-2 text-base font-bold text-purple-700">{offer.requesterId?.username}</span>
                      <span className="text-xs text-gray-400">{offer.requesterId?.firstName} {offer.requesterId?.lastName}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Skills Offered</span>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {offer.offeredSkills?.split(',').map(skill => (
                        <span key={skill} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Requested User Info */}
                <div className="flex-1 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
                  <div className="mb-3">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Requested User</span>
                    <div className="flex flex-col items-center">
                      {offer.requestedUserId?.profilePhoto ? (
                        <img src={offer.requestedUserId.profilePhoto} alt="avatar" className="w-16 h-16 rounded-full object-cover shadow" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shadow">
                          {offer.requestedUserId?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="mt-2 text-base font-bold text-indigo-700">{offer.requestedUserId?.username}</span>
                      <span className="text-xs text-gray-400">{offer.requestedUserId?.firstName} {offer.requestedUserId?.lastName}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Skills Wanted</span>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {offer.wantedSkills?.split(',').map(skill => (
                        <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Status & Details */}
                <div className="flex flex-col items-center justify-center min-w-[140px] px-2">
                  <span className={`px-5 py-2 rounded-lg font-semibold transition-colors shadow text-xs sm:text-sm mb-4 ${
                    offer.status === 'success'
                      ? 'bg-green-500 text-white'
                      : offer.status === 'reject'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-400 text-white'
                  }`}>
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </span>
                  <div className="text-xs text-gray-400 mb-2">Created: {new Date(offer.createdAt).toLocaleString()}</div>
                  {offer.message && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-700 max-w-[180px] break-words">
                      <span className="font-medium text-gray-500">Message:</span> {offer.message}
                    </div>
                  )}
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

export default AdminSwapRequest;