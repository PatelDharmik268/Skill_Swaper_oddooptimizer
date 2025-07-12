import React, { useState } from 'react';
import {
  User,
  Search,
  ChevronDown,
  LogOut,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Sample data for demonstration
const profiles = [
  {
    id: 1,
    name: 'Marc Demo',
    photo: '',
    skillsOffered: ['Guitar', 'Cooking'],
    skillsWanted: ['French', 'Yoga'],
    rating: 3.8,
    public: true,
    status: 'pending',
  },
  {
    id: 2,
    name: 'Michell',
    photo: '',
    skillsOffered: ['Painting'],
    skillsWanted: ['Coding'],
    rating: 2.5,
    public: true,
    status: 'success',
  },
  {
    id: 3,
    name: 'Joe Vills',
    photo: '',
    skillsOffered: ['Yoga'],
    skillsWanted: ['Guitar'],
    rating: 4.0,
    public: true,
    status: 'reject',
  },
  {
    id: 4,
    name: 'Sara Lee',
    photo: '',
    skillsOffered: ['Coding', 'Public Speaking'],
    skillsWanted: ['Painting'],
    rating: 4.7,
    public: true,
    status: 'pending',
  },
  {
    id: 5,
    name: 'Alex Kim',
    photo: '',
    skillsOffered: ['French', 'Yoga'],
    skillsWanted: ['Cooking'],
    rating: 3.2,
    public: true,
    status: 'success',
  },
  {
    id: 6,
    name: 'Priya Singh',
    photo: '',
    skillsOffered: ['Cooking', 'Painting'],
    skillsWanted: ['Public Speaking'],
    rating: 4.9,
    public: true,
    status: 'reject',
  },
  {
    id: 7,
    name: 'John Doe',
    photo: '',
    skillsOffered: ['Coding', 'Yoga'],
    skillsWanted: ['Guitar', 'French'],
    rating: 4.3,
    public: true,
    status: 'pending',
  },
  {
    id: 8,
    name: 'Emily Carter',
    photo: '',
    skillsOffered: ['Public Speaking'],
    skillsWanted: ['Painting', 'Yoga'],
    rating: 3.6,
    public: true,
    status: 'success',
  },
];

const statusOptions = ['All', 'pending', 'success', 'reject'];

const SwapRequests = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState('All');
  const profilesPerPage = 5;
  const isLoggedIn = true; // Replace with real auth logic

  // Filtered and paginated profiles
  const filteredProfiles = profiles.filter(
    (p) =>
      p.public &&
      (status === 'All' || p.status === status) &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const paginatedProfiles = filteredProfiles.slice(
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
            <button className="px-3 py-2 rounded-lg font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors">Home</button>
            <button className="px-3 py-2 rounded-lg font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors">Swap request</button>
          </nav>
          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-purple-600" />
            </div>
            <span className="text-gray-700 font-medium hidden sm:block">Admin</span>
            <button onClick={() => window.location.reload()} className="text-gray-400 hover:text-purple-600 transition-colors" title="Logout">
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
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                {/* Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold text-gray-800">{profile.name}</span>
                    <span className="flex items-center text-yellow-500 ml-2">
                      <Star size={16} className="mr-1" />
                      <span className="text-sm font-medium">{profile.rating.toFixed(1)}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    <span className="text-xs text-gray-500 py-1">Skills Offered:</span>
                    {profile.skillsOffered.map(skill => (
                      <span key={skill} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    <span className="text-xs text-gray-500 py-1">Skills Wanted:</span>
                    {profile.skillsWanted.map(skill => (
                      <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
                {/* Status Button */}
                <div className="flex flex-col justify-center items-center gap-2">
                  <button
                    disabled
                    className={`px-5 py-2 rounded-lg font-semibold transition-colors shadow
                      ${
                        profile.status === 'success'
                          ? 'bg-green-500 text-white'
                          : profile.status === 'reject'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-400 text-white'
                      }
                      opacity-70 cursor-not-allowed
                    `}
                  >
                    {profile.status === 'success'
                      ? 'Accepted'
                      : profile.status === 'reject'
                      ? 'Rejected'
                      : 'Pending'}
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

export default SwapRequests;