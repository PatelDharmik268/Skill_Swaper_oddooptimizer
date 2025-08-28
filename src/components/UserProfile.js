import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { User, MapPin, Star, Clock, X, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import UserRatings from './UserRatings';

const UserProfile = () => {
  // Messenger state
  const [showMessenger, setShowMessenger] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = React.useRef(null);

  // Handler to open Messenger
  const handleOpenMessenger = async () => {
    setShowMessenger(true);
    await fetchMessages();
  };

  // Handler to close Messenger
  const handleCloseMessenger = () => {
    setShowMessenger(false);
    setMessages([]);
    setNewMessage("");
  };

  // Fetch messages between logged-in user and profile user
  const fetchMessages = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || !profile?._id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${userId}/${profile._id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setTimeout(() => {
          if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {}
  };

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId || !profile?._id || !newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: userId, to: profile._id, content: newMessage.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage("");
        setTimeout(() => {
          if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        if (data.message) toast.error(data.message);
        else toast.error('Failed to send message.');
      }
    } catch (err) {
      toast.error('Failed to send message.');
    }
    setSending(false);
  };
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMySkill, setSelectedMySkill] = useState('');
  const [selectedTheirSkill, setSelectedTheirSkill] = useState('');
  const [messageText, setMessageText] = useState('');
  const [myProfile, setMyProfile] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/auth/user/${id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProfile(data.user || data);
        } else {
          setMessage(data.message || 'Failed to load user profile.');
        }
      } catch (err) {
        setMessage('Failed to load user profile.');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  // Fetch logged-in user's profile when modal opens
  useEffect(() => {
    if (showRequestModal) {
      const fetchMyProfile = async () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId) return;
        try {
          const res = await fetch(`http://localhost:5000/api/auth/user/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          if (res.ok && data.success !== false) {
            setMyProfile(data.user || data);
          }
        } catch (err) {}
      };
      fetchMyProfile();
    }
  }, [showRequestModal]);

  // Check for showSwapForm param on mount
  // Only change button state, do not open modal if showSwapForm is true
  // (No-op here)

  const parseSkills = (skillsString) => {
    if (!skillsString || typeof skillsString !== 'string') return [];
    return skillsString
      .split(',')
      .map(s => s.replace(/["]+/g, '').trim().toLowerCase())
      .filter(Boolean);
  };

  const handleSkillExchange = () => {
    setShowRequestModal(true);
  };

  const closeModal = () => {
    setShowRequestModal(false);
    setSelectedMySkill('');
    setSelectedTheirSkill('');
    setMessageText('');
    setFormError('');
  };

  const handleBackToDashboard = () => {
    console.log('Back to dashboard');
  };

  // --- Skill swap dropdown logic ---
  // For 'Choose one of your offered skills': intersection of myProfile.skillsOffered & profile.skillsWanted
  const validMyOfferedSkills = myProfile && profile
    ? parseSkills(myProfile.skillsOfferedOrig).filter(skill =>
        parseSkills(profile.skillsWantedOrig).includes(skill)
      )
    : [];
  // For 'Choose one of their offered skills you want': intersection of profile.skillsOffered & myProfile.skillsWanted
  const validTheirOfferedSkills = myProfile && profile
    ? parseSkills(profile.skillsOfferedOrig).filter(skill =>
        parseSkills(myProfile.skillsWantedOrig).includes(skill)
      )
    : [];

  // For display, use original case (not lowercased)
  const getOriginalSkills = (skillsString) => {
    if (!skillsString || typeof skillsString !== 'string') return [];
    return skillsString.split(',').map(s => s.replace(/["]+/g, '').trim()).filter(Boolean);
  };
  // Store original skills for display
  if (myProfile && !myProfile.skillsOfferedOrig) myProfile.skillsOfferedOrig = myProfile.skillsOffered;
  if (myProfile && !myProfile.skillsWantedOrig) myProfile.skillsWantedOrig = myProfile.skillsWanted;
  if (profile && !profile.skillsOfferedOrig) profile.skillsOfferedOrig = profile.skillsOffered;
  if (profile && !profile.skillsWantedOrig) profile.skillsWantedOrig = profile.skillsWanted;

  // For dropdown display, get the original-cased skill
  const validMyOfferedSkillsDisplay = myProfile && profile
    ? getOriginalSkills(myProfile.skillsOfferedOrig).filter(skill =>
        parseSkills(profile.skillsWantedOrig).includes(skill.trim().toLowerCase())
      )
    : [];
  const validTheirOfferedSkillsDisplay = myProfile && profile
    ? getOriginalSkills(profile.skillsOfferedOrig).filter(skill =>
        parseSkills(myProfile.skillsWantedOrig).includes(skill.trim().toLowerCase())
      )
    : [];

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!myProfile || !profile) return;
    if (!selectedMySkill) {
      toast.error('Please select one of your valid offered skills.');
      return;
    }
    if (!selectedTheirSkill) {
      toast.error('Please select a skill you want that the user actually offers.');
      return;
    }
    // No further validation needed as dropdowns only show valid options
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/swap-offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          requesterId: userId,
          requestedUserId: profile._id,
          offeredSkills: selectedMySkill,
          wantedSkills: selectedTheirSkill,
          message: messageText
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Request sent successfully!');
        closeModal();
      } else {
        toast.error(data.message || 'Failed to send request.');
      }
    } catch (err) {
      toast.error('Failed to send request.');
    }
  };

  // Determine where to go back
  const showSwapForm = new URLSearchParams(location.search).get('showSwapForm') === 'true';
  const handleBack = () => {
    if (showSwapForm) {
      navigate('/swap-requests');
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 shadow-lg border max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-300 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-center">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 shadow-lg border text-center max-w-md w-full mx-4">
          <X size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-4">
            {message || 'User not found.'}
          </p>
          <button 
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main content area (left) */}
      <div className="flex-1">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <button
            onClick={handleBack}
            className="group flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90 mb-6"
          >
            <ChevronLeft size={20} className="text-purple-600 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold text-gray-700">{showSwapForm ? 'Back to Swap Requests' : 'Back to Dashboard'}</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg bg-white flex items-center justify-center">
                    {profile.profilePhoto ? (
                      <img 
                        src={profile.profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User size={40} className="text-purple-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center mb-1">
                      <Star size={20} className="text-yellow-500" />
                      <span className="text-lg font-bold text-gray-800 ml-1">
                        {typeof profile.averageRating === 'number' ? profile.averageRating.toFixed(1) : 'N/A'}
                      </span>
                      {profile.totalRatings > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({profile.totalRatings} {profile.totalRatings === 1 ? 'rating' : 'ratings'})
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile.username}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={new URLSearchParams(location.search).get('showSwapForm') === 'true' ? undefined : handleSkillExchange}
                    className={`px-6 py-3 rounded-xl font-semibold transition-colors shadow-md ${new URLSearchParams(location.search).get('showSwapForm') === 'true' ? 'bg-gray-400 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                    disabled={new URLSearchParams(location.search).get('showSwapForm') === 'true'}
                  >
                    {new URLSearchParams(location.search).get('showSwapForm') === 'true' ? 'Requested' : 'Request'}
                  </button>
                  {/* Messenger Button */}
                  <button
                    onClick={handleOpenMessenger}
                    className="px-6 py-3 rounded-xl font-semibold transition-colors shadow-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Message
                  </button>
                </div>
              </div>
            </div>

          {/* Skills Section */}
          <div className="px-8 py-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Skills Offered */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Skills Offered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {parseSkills(profile.skillsOffered).length > 0 ? (
                    parseSkills(profile.skillsOffered).map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium border border-purple-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No skills listed</span>
                  )}
                </div>
              </div>

              {/* Skills Wanted */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Skills Wanted
                </h3>
                <div className="flex flex-wrap gap-2">
                  {parseSkills(profile.skillsWanted).length > 0 ? (
                    parseSkills(profile.skillsWanted).map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No skills listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location & Availability Section */}
          <div className="px-8 py-6 border-t border-gray-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Location</h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={18} className="text-purple-500" />
                  <span>{profile.location || 'Not set'}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Availability</h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={18} className="text-blue-500" />
                  <span>{profile.availability || 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {typeof profile.averageRating === 'number' ? profile.averageRating.toFixed(1) : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {parseSkills(profile.skillsOffered).length + parseSkills(profile.skillsWanted).length}
                </div>
                <div className="text-sm text-gray-600">Total Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {profile.profileVisibility === 'public' ? 'Public' : 'Private'}
                </div>
                <div className="text-sm text-gray-600">Profile Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Ratings Section */}
        <div className="mt-8">
          <UserRatings userId={id} />
        </div>
      </div>
      {showRequestModal && (
        <div id="skillSwapFormModal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            <h2 className="text-xl font-bold mb-6 text-center">Send Skill Swap Request</h2>
            <form className="space-y-6" onSubmit={handleSubmitRequest}>
              {/* ...existing code... */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">Choose one of your offered skills</label>
                {(!myProfile || !profile) ? (
                  <div className="text-gray-400 italic">Loading...</div>
                ) : validMyOfferedSkillsDisplay.length === 0 ? (
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2" disabled>
                    <option>No matching skills found for swap</option>
                  </select>
                ) : (
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                    value={selectedMySkill}
                    onChange={e => setSelectedMySkill(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a skill</option>
                    {validMyOfferedSkillsDisplay.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Choose one of their offered skills you want</label>
                {(!myProfile || !profile) ? (
                  <div className="text-gray-400 italic">Loading...</div>
                ) : validTheirOfferedSkillsDisplay.length === 0 ? (
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2" disabled>
                    <option>No matching skills found for swap</option>
                  </select>
                ) : (
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                    value={selectedTheirSkill}
                    onChange={e => setSelectedTheirSkill(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a skill</option>
                    {validTheirOfferedSkillsDisplay.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Message</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px] focus:ring-2 focus:ring-purple-500"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Write a message..."
                />
              </div>
              {formError && <div className="text-red-500 text-sm font-medium text-center">{formError}</div>}
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg shadow">Submit</button>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Messenger Sidebar */}
      {showMessenger && (
        <div
          className="fixed top-0 right-0 h-full bg-gradient-to-br from-purple-100 via-blue-50 to-white shadow-2xl border-l border-purple-200 z-50 flex flex-col transition-all duration-300"
          style={{
            width: 'clamp(320px, 30vw, 500px)',
            borderTopLeftRadius: '2rem',
            borderBottomLeftRadius: '2rem',
            borderTopRightRadius: '2rem',
            borderBottomRightRadius: '2rem',
            overflow: 'hidden',
          }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-200 bg-gradient-to-r from-purple-200/60 to-blue-100/60" style={{borderTopLeftRadius: '2rem', borderTopRightRadius: '2rem'}}>
            <div className="font-bold text-xl text-purple-800 tracking-wide">Messenger</div>
            <button onClick={handleCloseMessenger} className="text-purple-400 hover:text-purple-700 text-3xl font-bold transition-colors">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex flex-col gap-2">
              {messages.length === 0 && (
                <div className="text-gray-400 text-center mt-8 text-lg">Start chatting with <span className="font-semibold text-purple-700">{profile.username}</span></div>
              )}
              {messages.map((msg, idx) => {
                const isMe = localStorage.getItem('userId') === msg.from;
                const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={msg._id || idx} className={isMe ? 'self-end max-w-[80%]' : 'self-start max-w-[80%]'}>
                    <div className={
                      (isMe
                        ? 'bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-2xl rounded-br-sm'
                        : 'bg-white border border-purple-100 text-gray-700 rounded-2xl rounded-bl-sm')
                      + ' px-5 py-3 shadow'
                    }>
                      {msg.content}
                    </div>
                    <div className={
                      (isMe ? 'text-xs text-right text-purple-300 mt-1 pr-1' : 'text-xs text-left text-purple-300 mt-1 pl-1')
                    }>{time}</div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}></div>
            </div>
          </div>
          <div className="p-6 border-t border-purple-200 bg-white/80" style={{borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem'}}>
            <form className="flex gap-3" onSubmit={handleSendMessage} autoComplete="off">
              <input
                type="text"
                className="flex-1 border border-purple-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-400 bg-purple-50 placeholder:text-purple-300 text-gray-700 shadow-sm"
                placeholder="Type your message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                disabled={sending}
                autoFocus
              />
              <button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow transition-all duration-200" disabled={sending || !newMessage.trim()}>Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;