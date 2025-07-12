import React, { useState } from 'react';
import { User, Edit2, Save, X, Plus } from 'lucide-react';

const initialProfile = {
  name: 'Admin User',
  location: 'New York, USA',
  photo: '',
  skillsOffered: ['Guitar', 'Cooking'],
  skillsWanted: ['French', 'Yoga'],
};

const Profile = ({ onBack }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState(profile);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  const handleEdit = () => {
    setEditProfile(profile);
    setEditMode(true);
  };

  const handleSave = () => {
    setProfile(editProfile);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (type) => {
    if (type === 'offered' && newSkillOffered.trim()) {
      setEditProfile((prev) => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkillOffered.trim()],
      }));
      setNewSkillOffered('');
    }
    if (type === 'wanted' && newSkillWanted.trim()) {
      setEditProfile((prev) => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkillWanted.trim()],
      }));
      setNewSkillWanted('');
    }
  };

  const handleRemoveSkill = (type, idx) => {
    setEditProfile((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md border border-gray-200 p-8 relative">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
          {editMode ? (
            <div className="flex gap-2">
              <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-2 rounded-full" title="Save"><Save size={20} /></button>
              <button onClick={handleCancel} className="text-red-600 hover:bg-red-50 p-2 rounded-full" title="Cancel"><X size={20} /></button>
            </div>
          ) : (
            <button onClick={handleEdit} className="text-purple-600 hover:bg-purple-50 p-2 rounded-full" title="Edit"><Edit2 size={20} /></button>
          )}
        </div>
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-4xl font-bold text-purple-600 mb-2">
            {profile.photo ? (
              <img src={profile.photo} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              profile.name.split(' ').map(n => n[0]).join('')
            )}
          </div>
          {editMode && (
            <input
              type="text"
              name="photo"
              value={editProfile.photo}
              onChange={handleChange}
              placeholder="Profile photo URL"
              className="mt-1 px-3 py-2 border border-gray-300 rounded-lg w-60 text-sm"
            />
          )}
        </div>
        {/* Name & Location */}
        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">Name</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={editProfile.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
            />
          ) : (
            <div className="text-lg font-semibold text-gray-800 mb-2">{profile.name}</div>
          )}
          <label className="block text-xs text-gray-500 mb-1">Location</label>
          {editMode ? (
            <input
              type="text"
              name="location"
              value={editProfile.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          ) : (
            <div className="text-gray-700">{profile.location}</div>
          )}
        </div>
        {/* Skills Offered */}
        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">Skills Offered</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(editMode ? editProfile.skillsOffered : profile.skillsOffered).map((skill, idx) => (
              <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                {skill}
                {editMode && (
                  <button onClick={() => handleRemoveSkill('skillsOffered', idx)} className="ml-1 text-red-400 hover:text-red-600"><X size={14} /></button>
                )}
              </span>
            ))}
          </div>
          {editMode && (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newSkillOffered}
                onChange={e => setNewSkillOffered(e.target.value)}
                placeholder="Add skill"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button type="button" onClick={() => handleAddSkill('offered')} className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 flex items-center"><Plus size={16} className="mr-1" />Add</button>
            </div>
          )}
        </div>
        {/* Skills Wanted */}
        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">Skills Wanted</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(editMode ? editProfile.skillsWanted : profile.skillsWanted).map((skill, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                {skill}
                {editMode && (
                  <button onClick={() => handleRemoveSkill('skillsWanted', idx)} className="ml-1 text-red-400 hover:text-red-600"><X size={14} /></button>
                )}
              </span>
            ))}
          </div>
          {editMode && (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newSkillWanted}
                onChange={e => setNewSkillWanted(e.target.value)}
                placeholder="Add skill"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button type="button" onClick={() => handleAddSkill('wanted')} className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 flex items-center"><Plus size={16} className="mr-1" />Add</button>
            </div>
          )}
        </div>
        {/* Back Button */}
        {onBack && (
          <button onClick={onBack} className="absolute top-4 right-4 text-gray-400 hover:text-purple-600">Back</button>
        )}
      </div>
    </div>
  );
};

export default Profile; 