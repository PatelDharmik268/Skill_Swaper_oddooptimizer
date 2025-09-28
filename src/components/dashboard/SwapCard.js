import React from 'react';
import { ChevronRight } from 'lucide-react';

const SwapCard = ({ swap, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between border-b border-gray-100 pb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <img 
          src={swap.partner.profilePhoto || '/default-avatar.png'}
          alt="" 
          className="w-10 h-10 rounded-full object-cover"
          loading="lazy"
        />
        <div>
          <p className="font-medium text-gray-900">
            {swap.partner.username}
          </p>
          <p className="text-sm text-gray-500">
            Teaching: {swap.skillOffered}
          </p>
        </div>
      </div>
      <ChevronRight className="text-gray-400" />
    </div>
  );
};

export default SwapCard;
