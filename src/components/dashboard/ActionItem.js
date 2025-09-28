import React from 'react';

const ActionItem = ({ request, onAccept, onDecline }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
      <div className="flex items-center gap-3">
        <img 
          src={request.sender.profilePhoto || '/default-avatar.png'} 
          alt="" 
          className="w-10 h-10 rounded-full object-cover"
          loading="lazy"
        />
        <div>
          <p className="font-medium text-gray-900">
            New swap request from {request.sender.username}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(request.createdAt).toLocaleString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
              day: 'numeric',
              month: 'short'
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDecline(request._id)}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Decline
        </button>
        <button
          onClick={() => onAccept(request._id)}
          className="px-3 py-1 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default ActionItem;
