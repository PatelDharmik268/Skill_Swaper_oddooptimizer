import React, { useState, useEffect } from 'react';
import { User, Edit2, Save, X, Plus, ChevronLeft, Upload, Check, MapPin, Clock, Eye, Shield, Star, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const avatarImages = [
  { id: 1, src: require('../assets/boy.png'), alt: 'Boy Avatar' },
  { id: 2, src: require('../assets/boy (1).png'), alt: 'Boy Avatar 2' },
  { id: 3, src: require('../assets/girl.png'), alt: 'Girl Avatar' },
  { id: 4, src: require('../assets/woman.png'), alt: 'Woman Avatar' },
  { id: 5, src: require('../assets/gamer.png'), alt: 'Gamer Avatar' },
];

const SkillSwap = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/auth/user/${userId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await res.json();
        if (res.ok && data.success !== false) {
          setProfile(data.user || data);
          setEditProfile(data.user || data);
          setAvatarPreview((data.user && data.user.profilePhoto) || '');
        }
      } catch (err) {
        setMessage('Failed to load profile.');
      }
    };
    fetchUser();
  }, []);

  // Convert image to base64
  const toBase64 = (url) => {
    return fetch(url)
      .then((response) => response.blob())
      .then((blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));
  };

  const handleEdit = () => {
    setEditProfile(profile);
    setEditMode(true);
    setAvatarPreview(profile.profilePhoto || '');
    setAvatarBase64('');
    setSelectedAvatar(null);
    setMessage('');
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setEditMode(false);
    setAvatarPreview(profile.profilePhoto || '');
    setAvatarBase64('');
    setSelectedAvatar(null);
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = async (id) => {
    setSelectedAvatar(id);
    setEditProfile((prev) => ({ ...prev, profilePhoto: '' }));
    setAvatarBase64('');
    // Convert static avatar to base64
    const avatarObj = avatarImages.find(a => a.id === id);
    if (avatarObj) {
      const src = avatarObj.src.default || avatarObj.src;
      const base64 = await toBase64(src);
      setAvatarBase64(base64);
      setAvatarPreview(base64);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarPreview(ev.target.result);
        setAvatarBase64(ev.target.result);
        setSelectedAvatar(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('firstName', editProfile.firstName || '');
      formData.append('lastName', editProfile.lastName || '');
      formData.append('username', editProfile.username || '');
      formData.append('email', editProfile.email || '');
      formData.append('location', editProfile.location || '');
      formData.append('skillsOffered', editProfile.skillsOffered || '');
      formData.append('skillsWanted', editProfile.skillsWanted || '');
      formData.append('availability', editProfile.availability || '');
      formData.append('profileVisibility', editProfile.profileVisibility || 'public');
      // Attach avatar: prefer new base64, else keep old
      if (avatarBase64) {
        formData.append('profilePhoto', avatarBase64);
      }
      // PATCH or PUT request
      const fetchOptions = {
        method: 'PATCH',
        body: formData,
      };
      if (token) {
        fetchOptions.headers = { Authorization: `Bearer ${token}` };
      }
      const res = await fetch(`http://localhost:5000/api/auth/user/${userId}`, fetchOptions);
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.user || data);
        setEditProfile(data.user || data);
        setEditMode(false);
        setAvatarPreview((data.user && data.user.profilePhoto) || '');
        setAvatarBase64('');
        setSelectedAvatar(null);
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setMessage('Failed to update profile.');
    }
    setLoading(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-300 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Helper for display
  const display = (val, fallback = 'Not set') => (val && val.trim() ? val : fallback);

  // Parse skills for display
  const parseSkills = (skillsString) => {
    if (!skillsString || skillsString.trim() === '') return [];
    return skillsString.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90"
          >
            <ChevronLeft size={20} className="text-purple-600 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold text-gray-700">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20">
              <div className={`w-3 h-3 rounded-full ${profile.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-6 py-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              {/* Edit Controls */}
              <div className="flex justify-end mb-4">
                {editMode ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSave} 
                      disabled={loading} 
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Save size={20} />
                      )}
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={handleCancel} 
                      disabled={loading} 
                      className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <X size={20} />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleEdit} 
                    className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
                  >
                    <Edit2 size={20} />
                    Reqest
                  </button>
                )}
              </div>

              {/* Profile Photo Section */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        {(profile.firstName || profile.username || 'U')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                
                </div>

                {/* Name and Title */}
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {display((profile.firstName + ' ' + (profile.lastName || '')).trim() || profile.username)}
                  </h1>
                  <p className="text-white/80 text-base">
                    @{profile.username || 'username'}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mx-8 mt-6 p-4 rounded-xl border-l-4 ${
              message.includes('success') 
                ? 'bg-green-50 border-green-400 text-green-800' 
                : 'bg-red-50 border-red-400 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {message.includes('success') ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <X size={20} className="text-red-600" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Profile Information */}
          <div className="p-6 space-y-6">

            {/* Skills Section */}
            <div className="space-y-6">
              {/* Skills Offered */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award size={20} className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Skills I Offer</h3>
                </div>
                
                
                  <div className="flex flex-wrap gap-2">
                    {parseSkills(profile.skillsOffered).length > 0 ? (
                      parseSkills(profile.skillsOffered).map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors duration-300"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No skills offered yet</p>
                    )}
                  </div>
                
              </div>

              {/* Skills Wanted */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Star size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Skills I Want</h3>
                </div>
                
                
                  <div className="flex flex-wrap gap-2">
                    {parseSkills(profile.skillsWanted).length > 0 ? (
                      parseSkills(profile.skillsWanted).map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors duration-300"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No skills wanted yet</p>
                    )}
                  </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillSwap;