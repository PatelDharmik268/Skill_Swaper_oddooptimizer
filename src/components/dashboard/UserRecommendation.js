import React from 'react';
import { Star, ChevronRight } from 'lucide-react';

const UserRecommendation = ({ user, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between border-b border-gray-100 pb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <img 
          src={user.profilePhoto || '/default-avatar.png'}
          alt="" 
          className="w-12 h-12 rounded-full object-cover"
          loading="lazy"
        />
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{user.username}</p>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                {user.averageRating?.toFixed(1) || 'N/A'}
              </span>
            </div>
          </div>
          <p className="text-sm text-purple-600">
            Offers: {Array.isArray(user.skillsOffered) 
              ? user.skillsOffered[0] 
              : user.skillsOffered?.split(',')[0] || 'Not specified'}
          </p>
        </div>
      </div>
      <ChevronRight className="text-gray-400" />
    </div>
  );
};

export default UserRecommendation;
