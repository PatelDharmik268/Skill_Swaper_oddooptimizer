import React, { memo } from 'react';
import LazyImage from './LazyImage';
import { User } from 'lucide-react';

const ChatListItem = memo(({ user, isActive, lastMessage, unreadCount, myId, onClick }) => {
  return (
    <div onClick={onClick} className="relative">
      <div className={`flex items-center gap-3 p-3 cursor-pointer transition-colors relative ${
        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
      }`}>
        <div className="absolute left-[10%] right-[10%] bottom-0 h-[1px] bg-gray-200"></div>
        <div className="relative">
          <LazyImage
            src={user.profilePhoto}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
            fallbackSize={24}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-left mb-0.5">{user.username}</p>
          <p className="text-sm text-gray-500 truncate text-left">
            {lastMessage ? (
              <>
                {lastMessage.from === myId ? "You: " : ""}
                {lastMessage.content}
              </>
            ) : (
              "Click to start chatting..."
            )}
          </p>
        </div>
        {Number(unreadCount) > 0 && (
          <span className="bg-teal-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
});

export default ChatListItem;
