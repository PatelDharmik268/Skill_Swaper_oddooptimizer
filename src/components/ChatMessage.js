import React, { memo } from 'react';
import LazyImage from './LazyImage';

const ChatMessage = memo(({ message, isMe, myId }) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow transition-all ${
        isMe ? 'bg-teal-500 text-white' : 'bg-white text-gray-800'
      } ${message.isTemp ? 'opacity-70' : 'opacity-100'}`}>
        <p>{message.content}</p>
        <div className={`text-xs mt-1 ${isMe ? 'text-teal-100' : 'text-gray-400'} text-right`}>
          {time}
          {message.isTemp && <span className="ml-1">⏳</span>}
        </div>
      </div>
    </div>
  );
});

export default ChatMessage;
