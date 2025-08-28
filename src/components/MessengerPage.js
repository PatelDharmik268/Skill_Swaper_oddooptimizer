import React, { useEffect, useState, useRef } from 'react';
import { User, LogOut, Send, Search, Check, CheckCheck } from 'lucide-react';
import logo from '../assets/logo.png';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const MessengerPage = () => {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const myId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const location = useLocation();

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
        }
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
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
    const intervalId = setInterval(fetchUnreadCounts, 5000); // Poll for new messages
    return () => clearInterval(intervalId);
  }, [myId]);

  // Fetch messages for the active chat
  useEffect(() => {
    if (!activeUser) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${myId}/${activeUser._id}`);
        const data = await res.json();
        if (data.success) {
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeUser || !newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: myId, to: activeUser._id, content: newMessage.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage("");
      } else {
        // Handle message sending error
        console.error("Failed to send message:", data.message);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
    setSending(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Main component render
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Main Header */}
      <header className="bg-white shadow-sm border-b border-purple-700 sticky top-0 z-50 transition-all duration-300">
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="flex justify-center mb-0">
                  <img src={logo} alt="Logo" className="w-11 h-11 rounded-2xl object-cover" />
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-800 hidden sm:block">SkillXchange</span>
            </div>
            <nav className="hidden md:flex items-center space-x-2 md:space-x-6">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${location.pathname === '/dashboard'
                    ? 'bg-purple-100 text-purple-900 shadow-md'
                    : 'text-purple-900 hover:bg-purple-50'
                  }`}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/swap-requests')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${location.pathname === '/swap-requests'
                    ? 'bg-purple-100 text-purple-900 shadow-md'
                    : 'text-purple-900 hover:bg-purple-50'
                  }`}
              >
                Swap Requests
              </button>
              <Link
                to="/messenger"
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${location.pathname === '/messenger'
                    ? 'bg-purple-100 text-purple-900 shadow-md'
                    : 'text-purple-900 hover:bg-purple-50'
                  }`}
              >
                Chat
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-12 h-12 rounded-full border-2 border-purple-400 flex items-center justify-center bg-white hover:border-purple-500 transition-all shadow-md hover:scale-105"
                title="Profile"
              >
                {currentUser && currentUser.profilePhoto ? (
                  <img src={currentUser.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User size={32} className="text-purple-600" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-purple-800 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                title="Logout"
              >
                <LogOut size={20} className="mr-2 inline" />
                Logout
              </button>
            </div>
          </div>
        </header>

      {/* Main chat interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with user list */}
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center mt-8">No active chats.</p>
            ) : (
              users.map(user => (
                <div
                  key={user._id}
                  onClick={() => setActiveUser(user)}
                  className={`flex items-center gap-3 p-3 cursor-pointer border-l-4 ${
                    activeUser?._id === user._id
                      ? 'bg-gray-100 border-teal-500'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                     {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                     ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <User size={24} className="text-gray-500" />
                        </div>
                     )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{user.username}</p>
                    {/* Placeholder for last message */}
                    <p className="text-sm text-gray-500 truncate">Last message...</p>
                  </div>
                  {Number(unreadCounts[user._id]) > 0 && (
                    <span className="bg-teal-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCounts[user._id]}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 flex flex-col bg-gray-200" style={{backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')"}}>
          {activeUser ? (
            <>
              {/* Chat Header */}
              <header className="flex items-center gap-4 p-3 bg-white border-b border-gray-200">
                 {activeUser.profilePhoto ? (
                    <img src={activeUser.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                    </div>
                 )}
                <div>
                  <p className="font-semibold text-gray-800">{activeUser.username}</p>
                  <p className="text-xs text-gray-500">Online</p> {/* Placeholder */}
                </div>
              </header>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(msg => {
                  const isMe = myId === msg.from;
                  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow ${isMe ? 'bg-teal-500 text-white' : 'bg-white text-gray-800'}`}>
                        <p>{msg.content}</p>
                        <div className={`text-xs mt-1 ${isMe ? 'text-teal-100' : 'text-gray-400'} text-right`}>
                          {time}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <footer className="p-4 bg-white border-t border-gray-200">
                <form className="flex items-center gap-4" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="flex-1 bg-gray-100 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    disabled={sending}
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
  );
};

export default MessengerPage;
