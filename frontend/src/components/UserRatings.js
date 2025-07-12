import React, { useState, useEffect } from 'react';
import { Star, User, MessageSquare, Calendar } from 'lucide-react';

const UserRatings = ({ userId }) => {
  const [ratings, setRatings] = useState([]);
  const [userStats, setUserStats] = useState({ averageRating: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (userId) {
      fetchRatings();
    }
  }, [userId, currentPage]);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/user/${userId}?page=${currentPage}&limit=5`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setRatings(data.feedback);
        setUserStats(data.userStats);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch ratings');
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError('Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-300 border-t-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Summary</h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {userStats.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {userStats.totalRatings}
            </div>
            <div className="text-sm text-gray-600">
              {userStats.totalRatings === 1 ? 'Rating' : 'Ratings'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderStars(userStats.averageRating)}
            <span className="text-sm text-gray-600">
              ({userStats.averageRating.toFixed(1)}/5)
            </span>
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Ratings</h3>
        
        {ratings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No ratings yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      {rating.fromUser?.profilePhoto ? (
                        <img 
                          src={rating.fromUser.profilePhoto} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover" 
                        />
                      ) : (
                        <User size={24} className="text-purple-600" />
                      )}
                    </div>
                  </div>

                  {/* Rating Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">
                        {rating.fromUser?.username || 'Unknown User'}
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(rating.rating)}
                        <span className="text-sm text-gray-500">
                          ({rating.rating}/5)
                        </span>
                      </div>
                    </div>

                    {rating.feedback && (
                      <p className="text-gray-700 mb-2">{rating.feedback}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(rating.createdAt)}
                      </div>
                      {rating.swapOffer && (
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Swap: {rating.swapOffer.offeredSkills} ↔ {rating.swapOffer.wantedSkills}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {pagination.totalPages}
            </span>
            
            <button
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRatings; 