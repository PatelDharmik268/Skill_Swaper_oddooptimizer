import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  ChevronDown,
  LogOut,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sample data for demonstration
// Remove the static 'profiles' array and any references to it.
// In the profile card, replace:
//   <span className="text-lg font-semibold text-gray-800">{profile.name}</span>
// with:
//   <span className="text-lg font-semibold text-gray-800">{profile.username}</span>
// Also update the initials/avatar fallback if needed (but you already use profilePhoto or icon).

const availabilities = [
  'All',
  'Early Mornings',
  'Mornings',
  'Afternoons',
  'Evenings',
  'Late Nights',
  'Weekdays',
  'Weekends',
  'Flexible',
  // 'Custom',
];
const sortOptions = [
  { value: 'none', label: 'No Sort' },
  { value: 'rating-high', label: 'Rating: High to Low' },
  { value: 'rating-low', label: 'Rating: Low to High' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' }
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillsOfferedQuery, setSkillsOfferedQuery] = useState('');
  const [skillsWantedQuery, setSkillsWantedQuery] = useState('');
  const [availability, setAvailability] = useState('All');
  const [sortBy, setSortBy] = useState('none');
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // fetched users
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const profilesPerPage = 5;
  const isLoggedIn = true; // Replace with real auth logic
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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

  // Enhanced filtering logic
  const filteredProfiles = users.filter((p) => {
    if (p.public === false) return false;
    
    const loggedInUserId = user && user._id ? user._id : localStorage.getItem('userId');
    if (p._id === loggedInUserId) return false;

    // Name search
    const nameMatch = !searchQuery || (p.username || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Availability filter
    const availabilityMatch = availability === 'All' || (p.availability || '').includes(availability);
    
    // Skills offered search
    const skillsOffered = parseSkills(p.skillsOffered);
    const skillsOfferedMatch = !skillsOfferedQuery || 
      skillsOffered.some(skill => 
        skill.toLowerCase().includes(skillsOfferedQuery.toLowerCase())
      );
    
    // Skills wanted search
    const skillsWanted = parseSkills(p.skillsWanted);
    const skillsWantedMatch = !skillsWantedQuery || 
      skillsWanted.some(skill => 
        skill.toLowerCase().includes(skillsWantedQuery.toLowerCase())
      );
    
    return nameMatch && availabilityMatch && skillsOfferedMatch && skillsWantedMatch;
  });

  // Sorting logic
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    switch (sortBy) {
      case 'rating-high':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'rating-low':
        return (a.averageRating || 0) - (b.averageRating || 0);
      case 'name-asc':
        return (a.username || '').localeCompare(b.username || '');
      case 'name-desc':
        return (b.username || '').localeCompare(a.username || '');
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedProfiles.length / profilesPerPage);
  const paginatedProfiles = sortedProfiles.slice(
    (currentPage - 1) * profilesPerPage,
    currentPage * profilesPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, skillsOfferedQuery, skillsWantedQuery, availability, sortBy]);

  // Responsive: mobile menu toggle (future)

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-2 sm:px-4 py-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Skills</h1>
        <p className="text-gray-600">Connect with peers and exchange knowledge</p>
      </div>
      
      {/* Enhanced Search and Filter */}
      <div className="mb-8">
        <div className="bg-white/90 shadow-lg rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 mb-1" htmlFor="searchName">Search by Name</label>
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                <Search className="text-gray-400 mr-2" size={20} />
                <input
                  id="searchName"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full outline-none bg-transparent text-gray-700"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-sm font-semibold text-gray-700 mb-1" htmlFor="availability">Availability</label>
              <div className="relative">
                <select
                  id="availability"
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm w-full"
                >
                  {availabilities.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-sm font-semibold text-gray-700 mb-1" htmlFor="sortBy">Sort by</label>
              <div className="relative">
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm w-full text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition-colors text-sm shadow border border-purple-100"
            >
              <Filter size={16} />
              {showAdvancedSearch ? 'Hide' : 'Show'} Advanced Search
            </button>
            <div className="text-xs text-gray-500">
              Showing {paginatedProfiles.length} of {sortedProfiles.length} profiles
              {(searchQuery || skillsOfferedQuery || skillsWantedQuery || availability !== 'All') && (
                <span className="ml-2">
                  (filtered from {users.length} total)
                </span>
              )}
            </div>
          </div>
          {showAdvancedSearch && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 mb-1" htmlFor="skillsOffered">Skills Offered</label>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                  <Search className="text-gray-400 mr-2" size={18} />
                  <input
                    id="skillsOffered"
                    type="text"
                    placeholder="e.g. Python, Design"
                    value={skillsOfferedQuery}
                    onChange={e => setSkillsOfferedQuery(e.target.value)}
                    className="w-full outline-none bg-transparent text-gray-700 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 mb-1" htmlFor="skillsWanted">Skills Wanted</label>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                  <Search className="text-gray-400 mr-2" size={18} />
                  <input
                    id="skillsWanted"
                    type="text"
                    placeholder="e.g. Marketing, JavaScript"
                    value={skillsWantedQuery}
                    onChange={e => setSkillsWantedQuery(e.target.value)}
                    className="w-full outline-none bg-transparent text-gray-700 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Cards and Pagination Wrapper */}
      <div className="flex-1 flex flex-col">
        <div className="space-y-5 flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-300 border-t-purple-600"></div>
            </div>
          ) : paginatedProfiles.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No profiles found.</div>
          ) : null}
          {paginatedProfiles.map(profile => (
            <div key={profile._id || profile.id} className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col sm:flex-row items-center sm:items-stretch p-4 sm:p-6 gap-4 sm:gap-8 transition-transform hover:scale-[1.01]">
              {/* Profile Photo */}
              <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <User size={48} className="text-purple-600" />
                )}
              </div>
              {/* Info */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col items-start mb-1">
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-base font-bold text-gray-800">
                      {typeof profile.averageRating === 'number' ? profile.averageRating.toFixed(1) : 'N/A'}
                    </span>
                    {profile.totalRatings > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({profile.totalRatings} {profile.totalRatings === 1 ? 'rating' : 'ratings'})
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-gray-800">{profile.username}</span>
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
                  onClick={() => navigate(`/user/${profile._id}`)}
                >
                  Request
                </button>
                <span className="text-xs text-gray-400">{!isLoggedIn ? 'Login to request' : ''}</span>
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