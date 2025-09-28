import React, { useEffect, useState, useRef, useCallback, Suspense, lazy } from 'react';
import { User, Send } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import NavBar from './NavBar';

// Lazy load components
const LazyImage = lazy(() => import('./LazyImage'));
const ChatMessage = lazy(() => import('./ChatMessage'));

// Lazy loaded placeholder component
const LoadingPlaceholder = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);
// Main component definition
const MessengerPage = () => {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);          
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const typingTimeoutRef = useRef(null);
  const myId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const location = useLocation();

  // Memoized function to handle new messages
  const handleNewMessage = useCallback((message) => {
    console.log('Received new message:', message);

    setMessages(prev => {
      // Check if message already exists
      const messageExists = prev.some(msg =>
        msg._id === message._id ||
        (msg.isTemp && msg.from === message.from && msg.content === message.content)
      );

      if (!messageExists) {
        // If this message is for the current chat, add it
        if (activeUser && (message.from === activeUser._id || message.to === activeUser._id)) {
          console.log('Adding new message to chat');
          return [...prev, message];
        }
      }
      return prev;
    });

    // Update last messages for both sender and receiver
    const chatPartnerId = message.from === myId ? message.to : message.from;
    setLastMessages(prev => ({
      ...prev,
      [chatPartnerId]: message
    }));

    // Update unread counts for messages from others
    if (message.from !== myId) {
      setUnreadCounts(prev => ({
        ...prev,
        [message.from]: (prev[message.from] || 0) + 1
      }));
    }
  }, [activeUser, myId]);

  // Initialize socket connection
  useEffect(() => {
    if (!myId) return;

    console.log('Initializing socket connection');
    socketRef.current = io('http://localhost:5000', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Join user's room
    socketRef.current.emit('join', myId);
    console.log('Joined room for user:', myId);

    // Listen for connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current.emit('join', myId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Listen for new messages
    socketRef.current.on('newMessage', handleNewMessage);

    // Handle saved message confirmations
    socketRef.current.on('messageSaved', ({ tempId, savedMessage }) => {
      console.log('Message saved:', savedMessage);
      setMessages(prev =>
        prev.map(msg => msg._id === tempId ? savedMessage : msg)
      );
    });

    // Handle message errors
    socketRef.current.on('messageError', ({ tempId }) => {
      console.error('Message failed to save:', tempId);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
    });

    // Handle typing events
    socketRef.current.on('userTyping', ({ from }) => {
      console.log('User typing:', from);
      setTypingUsers(prev => ({ ...prev, [from]: true }));
    });

    socketRef.current.on('userStoppedTyping', ({ from }) => {
      console.log('User stopped typing:', from);
      setTypingUsers(prev => ({ ...prev, [from]: false }));
    });

    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.off('newMessage');
        socketRef.current.off('messageSaved');
        socketRef.current.off('messageError');
        socketRef.current.off('userTyping');
        socketRef.current.off('userStoppedTyping');
        socketRef.current.disconnect();
      }
    };
  }, [myId, handleNewMessage]);

  // Fetch current user profile for header
  useEffect(() => {
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
          setCurrentUser(data.user || data);
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchUser();
  }, []);

  // State to store last messages
  const [lastMessages, setLastMessages] = useState({});

  // Fetch chat contacts and unread counts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!myId) return;
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/chat-contacts/contacts/${myId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
          // Fetch last message for each user
          data.users.forEach(user => {
            fetchLastMessage(user._id);
          });
        }
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
    };

    const fetchLastMessage = async (userId) => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${myId}/${userId}?limit=1`);
        const data = await res.json();
        if (data.success && data.messages.length > 0) {
          setLastMessages(prev => ({
            ...prev,
            [userId]: data.messages[0]
          }));
        }
      } catch (err) {
        console.error("Failed to fetch last message:", err);
      }
    };

    const fetchUnreadCounts = async () => {
      if (!myId) return;
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/messages/unread-counts/${myId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        setUnreadCounts(data.success && data.counts ? data.counts : {});
      } catch {
        setUnreadCounts({});
      }
    };

    fetchContacts();
    fetchUnreadCounts();
    const intervalId = setInterval(fetchUnreadCounts, 10000); // Poll every 10 seconds instead of 5
    return () => clearInterval(intervalId);
  }, [myId]);

  // Update last messages when new message is received
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setLastMessages(prev => ({
        ...prev,
        [activeUser?._id]: lastMessage
      }));
    }
  }, [messages, activeUser]);

  // Fetch messages for the active chat
  useEffect(() => {
    if (!activeUser) return;

    console.log('Fetching messages for user:', activeUser.username);

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${myId}/${activeUser._id}`);
        const data = await res.json();
        if (data.success) {
          console.log('Fetched messages:', data.messages.length);
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    const markMessagesAsRead = async () => {
      try {
        await fetch(`http://localhost:5000/api/messages/mark-read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: myId, fromUserId: activeUser._id })
        });
        setUnreadCounts(prev => ({ ...prev, [activeUser._id]: 0 }));
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    };

    fetchMessages();
    markMessagesAsRead();
  }, [activeUser, myId]);

  // Scroll to the bottom of the messages list when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeUser || !newMessage.trim() || !socketRef.current || sending) return;

    const messageText = newMessage.trim();
    console.log('Sending message:', messageText);

    setSending(true);

    try {
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const messageData = {
        _id: tempId,
        from: myId,
        to: activeUser._id,
        content: messageText,
        timestamp: new Date().toISOString(),
        isTemp: true // Mark as temporary
      };

      // Clear the input immediately
      setNewMessage("");
      handleStopTyping();

      // Add message to UI immediately for instant feedback
      setMessages(prev => [...prev, messageData]);

      // Send through socket first
      socketRef.current.emit('sendMessage', {
        ...messageData,
        isTemp: false // Remove temp flag for socket
      });

      // Save to database
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: myId,
          to: activeUser._id,
          content: messageText,
          timestamp: messageData.timestamp
        })
      });

      const data = await res.json();

      if (data.success) {
        // Replace temporary message with the real one from database
        setMessages(prev => prev.map(msg =>
          msg._id === tempId ? { ...data.message, _id: data.message._id } : msg
        ));
        console.log('Message saved successfully');
      } else {
        console.error("Failed to save message:", data.message);
        // Remove the temporary message if save failed
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.isTemp && msg.content === messageText));
    } finally {
      setSending(false);
    }
  };

  // Handle typing status
  const handleTyping = () => {
    if (!activeUser || !socketRef.current) return;

    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', { from: myId, to: activeUser._id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (isTyping && activeUser && socketRef.current) {
      setIsTyping(false);
      socketRef.current.emit('stopTyping', { from: myId, to: activeUser._id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Main component render
  return (
    <NavBar>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Main chat interface */}
        <div className="flex w-full">
          {/* Sidebar with user list */}
          <aside className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col max-h-full">
            <div className="p-4 border-b border-gray-300">
              <h2 className="text-xl font-bold text-gray-800">Chats</h2>
            </div>
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center mt-8">No active chats.</p>
            ) : (
              users.map(user => (
                <div
                  key={user._id}
                  onClick={() => setActiveUser(user)}
                  className="relative"
                >
                  <div className={`flex items-center gap-3 p-3 cursor-pointer transition-colors relative ${
                    activeUser?._id === user._id
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}>
                    <div className="absolute left-[20%] right-[0%] bottom-0 border-b border-gray-300"></div>
                    <div className="relative">
                      <Suspense fallback={
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <User size={24} className="text-gray-500" />
                        </div>
                      }>
                        <LazyImage
                          src={user.profilePhoto}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                          fallbackSize={24}
                        />
                      </Suspense>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-left mb-0.5">{user.username}</p>
                      <p className="text-sm text-gray-500 truncate text-left">
                        {lastMessages[user._id] ? (
                          <>
                            {lastMessages[user._id].from === myId ? "You: " : ""}
                            {lastMessages[user._id].content}
                          </>
                        ) : (
                          "Click to start chatting..."
                        )}
                      </p>
                    </div>
                    {Number(unreadCounts[user._id]) > 0 && (
                      <span className="bg-teal-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCounts[user._id]}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 flex flex-col bg-gray-200 h-full" style={{ backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')" }}>
          {activeUser ? (
            <>
              {/* Chat Header */}
              <header className="flex items-center gap-4 p-3 bg-white border-b border-gray-200 shrink-0">
                <Suspense fallback={
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <User size={20} className="text-gray-500" />
                  </div>
                }>
                  <LazyImage
                    src={activeUser.profilePhoto}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                    fallbackSize={20}
                  />
                </Suspense>
                <div>
                  <p className="font-semibold text-gray-800">{activeUser.username}</p>
                  <p className="text-xs text-gray-500">
                    {typingUsers[activeUser._id] ? 'Typing...' : 'Online'}
                  </p>
                </div>
              </header>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                  </div>
                }>
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={`${msg._id}-${index}`}
                      message={msg}
                      isMe={myId === msg.from}
                      myId={myId}
                    />
                  ))}
                </Suspense>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <footer className="p-4 bg-white border-t border-gray-200 shrink-0">
                {typingUsers[activeUser?._id] && (
                  <div className="text-sm text-gray-500 italic mb-2">
                    {activeUser.username} is typing...
                  </div>
                )}
                <form className="flex items-center gap-4" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="flex-1 bg-gray-100 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    disabled={sending}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors disabled:bg-gray-300"
                    disabled={sending || !newMessage.trim()}
                  >
                    <Send size={24} />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-black">
              <div>
                <h2 className="text-2xl font-semibold">Welcome to SkillXchange Messenger</h2>
                <p>Select a chat to start sharing skills.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  </NavBar> 
  )};

export default MessengerPage;