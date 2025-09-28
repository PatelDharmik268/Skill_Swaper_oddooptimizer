import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  ChevronDown,
  LogOut,
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  Inbox,
  Check,
  X,
  Clock,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import NavBar from './NavBar';
import FeedbackForm from './FeedbackForm';

const statusOptions = ['All', 'pending', 'accepted', 'rejected', 'cancelled', 'completed'];
const typeOptions = ['All', 'sent', 'received'];

const SwapRequests = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [swapOffers, setSwapOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [user, setUser] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedSwapOffer, setSelectedSwapOffer] = useState(null);
  const navigate = useNavigate();
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSwapOffers();
    }
  }, [user, status, type, currentPage]);

  const fetchUser = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/auth/user/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setUser(data.user || data);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchSwapOffers = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });

      if (status !== 'All') params.append('status', status);
      if (type !== 'All') params.append('type', type);

      const res = await fetch(`http://localhost:5000/api/swap-offers/user/${user._id}?${params}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSwapOffers(data.swapOffers);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch swap offers');
      }
    } catch (err) {
      console.error('Error fetching swap offers:', err);
      setError('Failed to fetch swap offers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (offerId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/swap-offers/${offerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          userId: user._id
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Refresh the offers list
        fetchSwapOffers();
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this swap offer?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/swap-offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchSwapOffers();
      } else {
        setError(data.message || 'Failed to delete offer');
      }
    } catch (err) {
      console.error('Error deleting offer:', err);
      setError('Failed to delete offer');
    }
  };

  const handleMarkComplete = async (offerId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/swap-offers/${offerId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Swap marked as completed!');
        fetchSwapOffers();
      } else {
        toast.error(data.message || 'Failed to mark as completed');
      }
    } catch (err) {
      console.error('Error marking complete:', err);
      toast.error('Failed to mark as completed');
    }
  };

  const handleOpenFeedback = (swapOffer) => {
    setSelectedSwapOffer(swapOffer);
    setShowFeedbackForm(true);
  };

  const handleFeedbackSuccess = (updatedRating) => {
    // Refresh the swap offers to show updated status
    fetchSwapOffers();
  };

  // Helper to parse skills string to array
  const parseSkills = (skillsString) => {
    if (!skillsString || typeof skillsString !== 'string') return [];
    return skillsString
      .replace(/^\[?["']?/, '')
      .replace(/["']?\]?$/, '')
      .split(',')
      .map(s => s.replace(/["']/g, '').trim())
      .filter(Boolean);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'cancelled': return 'bg-gray-500 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      default: return 'bg-yellow-400 text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return 'Pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <Check size={16} />;
      case 'rejected': return <X size={16} />;
      case 'cancelled': return <X size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredOffers = swapOffers.filter(offer => {
    const otherUser = offer.otherUser;
    const searchMatch = otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherUser.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherUser.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    return searchMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading swap requests...</p>
        </div>
      </div>
    );
  }

  return (
    <NavBar>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div style={{maxWidth: '3020px', alignContent:'center', alignItems:'center', justifyContent:'center', justifyItems:'center', justifySelf:'center', padding:'50px 0px'}}>
        {/* Search and Filters */}
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
            <span className="text-gray-500 text-sm">Type:</span>
            <div className="relative">
              <select
                value={type}
                onChange={e => { setType(e.target.value); setCurrentPage(1); }}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              >
                {typeOptions.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
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
          <div className="space-y-5 flex-1">
            {filteredOffers.length === 0 && !loading && (
              <div className="text-center text-gray-400 py-10">
                {searchQuery ? 'No swap requests found matching your search.' : 'No swap requests found.'}
              </div>
            )}
            {filteredOffers.map(offer => {
              const otherUser = offer.otherUser;
              const isRequester = offer.userRole === 'requester';
              // Card click handler
              const handleCardClick = (e) => {
                // Prevent button clicks inside the card from triggering navigation
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
                navigate(`/user/${otherUser._id}?showSwapForm=true`);
              };
              return (
                <div
                  key={offer._id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col sm:flex-row items-center sm:items-stretch p-4 sm:p-6 gap-4 sm:gap-8 transition-transform hover:scale-[1.01] cursor-pointer group"
                  onClick={handleCardClick}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter') handleCardClick(e); }}
                  title="View Profile"
                >
                  {/* Profile Photo */}
                  <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full text-3xl font-bold text-purple-600">
                    {otherUser.profilePhoto ? (
                      <img src={otherUser.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <User size={48} className="text-purple-600" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        className="text-lg font-semibold text-purple-700 group-hover:underline focus:outline-none"
                        tabIndex={-1}
                        style={{ pointerEvents: 'none' }}
                      >
                        {otherUser.username}
                      </button>
                      <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${isRequester ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {isRequester ? <Send size={12} className="mr-1" /> : <Inbox size={12} className="mr-1" />}
                        {isRequester ? 'Sent' : 'Received'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-1">
                      <span className="text-xs text-gray-500 py-1">Skills Offered:</span>
                      {parseSkills(offer.offeredSkills).map(skill => (
                        <span key={skill} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">{skill}</span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-1">
                      <span className="text-xs text-gray-500 py-1">Skills Wanted:</span>
                      {parseSkills(offer.wantedSkills).map(skill => (
                        <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{skill}</span>
                      ))}
                    </div>

                    {offer.message && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Message:</span> {offer.message}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center items-center gap-2">
                    <div className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-colors shadow ${getStatusColor(offer.status)}`}>
                      {getStatusIcon(offer.status)}
                      {getStatusText(offer.status)}
                    </div>

                    {offer.status === 'completed' && (
                      <div className="text-xs text-green-600 font-medium">
                        Ready for Rating
                      </div>
                    )}

                    {offer.status === 'pending' && !isRequester && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(offer._id, 'accepted')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(offer._id, 'rejected')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {offer.status === 'pending' && isRequester && (
                      <button
                        onClick={() => handleStatusUpdate(offer._id, 'cancelled')}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {offer.status === 'accepted' && (
                      <button
                        onClick={() => handleMarkComplete(offer._id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}

                    {offer.status === 'completed' && (
                      <button
                        onClick={() => handleOpenFeedback(offer)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors flex items-center gap-1"
                      >
                        <MessageSquare size={14} />
                        Rate & Review
                      </button>
                    )}

                    {(offer.status === 'accepted' || offer.status === 'rejected' || offer.status === 'cancelled' || offer.status === 'completed') && (
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8 mb-2">
              <button
                className="p-2 rounded-full hover:bg-purple-100 disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(pagination.totalPages)].map((_, idx) => (
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
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Feedback Form */}
      {showFeedbackForm && selectedSwapOffer && (
        <FeedbackForm
          userId={selectedSwapOffer.otherUser._id}
          swapOfferId={selectedSwapOffer._id}
          fromUserId={user._id}
          onClose={() => setShowFeedbackForm(false)}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </NavBar>
  );
};

export default SwapRequests;