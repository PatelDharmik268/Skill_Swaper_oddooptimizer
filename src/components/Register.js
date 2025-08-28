import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, MapPin, Upload, Check, X } from 'lucide-react';
import { staticSkills } from './skillsList';
import logo from '../assets/logo.png';

const avatarImages = [
  { id: 1, src: require('../assets/boy.png'), alt: 'Boy Avatar' },
  { id: 2, src: require('../assets/boy (1).png'), alt: 'Boy Avatar 2' },
  { id: 3, src: require('../assets/girl.png'), alt: 'Girl Avatar' },
  { id: 4, src: require('../assets/woman.png'), alt: 'Woman Avatar' },
  { id: 5, src: require('../assets/gamer.png'), alt: 'Gamer Avatar' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    profileIcon: '',
    profileFile: null,
    skillsHave: [],
    skillsWant: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [skillHaveInput, setSkillHaveInput] = useState('');
  const [skillWantInput, setSkillWantInput] = useState('');
  
  // Validation states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateUsername = (username) => {
    if (!username.trim()) {
      return 'Username is required';
    }
    if (username.includes(' ')) {
      return 'Username cannot contain spaces';
    }
    if (/^\d/.test(username)) {
      return 'Username cannot start with a number';
    }
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const validateLocation = (location) => {
    if (!location.trim()) {
      return 'Location is required';
    }
    return '';
  };

  const validateSkills = () => {
    if (formData.skillsHave.length === 0) {
      return 'Please select at least one skill you have';
    }
    if (formData.skillsWant.length === 0) {
      return 'Please select at least one skill you want to learn';
    }
    return '';
  };

  const validateAvatar = () => {
    if (!selectedAvatar && !formData.profileFile) {
      return 'Please select an avatar or upload a custom image';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateField = (fieldName, value) => {
    let error = '';
    switch (fieldName) {
      case 'name':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'location':
        error = validateLocation(value);
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    // Remove SweetAlert2 toast for field errors here
  };

  // Inline error message component
  const ErrorMessage = ({ error }) => {
    return (
      <div className="flex items-center gap-1 mt-1 text-red-400 text-xs" style={{ minHeight: '20px' }}>
        {error ? <span>{error}</span> : null}
      </div>
    );
  };

  const handleAvatarSelect = (id) => {
    setSelectedAvatar(id);
    setFormData(prev => ({ ...prev, profileIcon: id, profileFile: null }));
    setAvatarPreview('');
    // Clear avatar error
    if (errors.avatar) {
      setErrors(prev => ({
        ...prev,
        avatar: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileFile: file, profileIcon: '' }));
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target.result);
      reader.readAsDataURL(file);
      setSelectedAvatar(null);
      // Clear avatar error
      if (errors.avatar) {
        setErrors(prev => ({
          ...prev,
          avatar: ''
        }));
      }
    }
  };

  const handleSkillAdd = (type, skill) => {
    if (!formData[type].includes(skill)) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], skill]
      }));
      // Clear skills error
      if (errors.skills) {
        setErrors(prev => ({
          ...prev,
          skills: ''
        }));
      }
    }
  };

  const handleSkillRemove = (type, skill) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(s => s !== skill)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    newErrors.name = validateUsername(formData.name);
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.location = validateLocation(formData.location);
    newErrors.skills = validateSkills();
    newErrors.avatar = validateAvatar();
    
    setErrors(newErrors);
    
    // Return only errors that are not empty
    const errorList = Object.values(newErrors).filter(error => error !== '');
    return errorList;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    let errorList = validateForm();
    if (errorList.length > 0) {
      errorList = errorList.sort();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Attempting to register user...');
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.name.split(' ')[0] || '');
      formDataToSend.append('lastName', formData.name.split(' ').slice(1).join(' ') || '');
      formDataToSend.append('location', formData.location);
      formDataToSend.append('skillsOffered', formData.skillsHave.join(', '));
      formDataToSend.append('skillsWanted', formData.skillsWant.join(', '));
      if (formData.profileFile) {
        formDataToSend.append('profilePhoto', formData.profileFile);
      }
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        window.location.href = '/login';
      } else {
        let serverError = 'Registration failed: ' + (data.message || 'Unknown error');
        if (data.message && data.message.includes('username')) {
          serverError = 'Username already exists';
        } else if (data.message && data.message.includes('email')) {
          serverError = 'Email already exists';
        }
        setErrors(prev => ({
          ...prev,
          server: serverError
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        server: 'Network error or server unavailable'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* SweetAlert2 Test Button */}
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="w-16 h-16 rounded-2xl shadow-lg object-cover transition-transform duration-200 hover:scale-105" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 transition-opacity duration-300">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 transition-opacity duration-300">
            Join the SkillXchange community
          </p>
        </div>
        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transition-shadow duration-200 hover:shadow-2xl">
          <form onSubmit={handleSubmit}>
            {errors.server && (
              <div className="mb-4 text-center text-red-600 font-semibold">{errors.server}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left column - Username, Location, Skills I Have */}
              <div className="space-y-6">
                {/* Name field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`pl-10 pr-4 py-3 w-full border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.name 
                          ? 'border-red-300 bg-red-50 focus:bg-red-50' 
                          : 'border-gray-200 bg-gray-50 focus:bg-white'
                      }`}
                      placeholder="Enter your username"
                    />
                  </div>
                  <ErrorMessage error={errors.name} />
                </div>
                {/* Location field */}
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="location"
                      name="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`pl-10 pr-4 py-3 w-full border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.location 
                          ? 'border-red-300 bg-red-50 focus:bg-red-50' 
                          : 'border-gray-200 bg-gray-50 focus:bg-white'
                      }`}
                      placeholder="Enter your location"
                    />
                  </div>
                  <ErrorMessage error={errors.location} />
                </div>
                {/* Skills I Have */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skills I Have</label>
                  <select
                    className={`w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2 ${
                      errors.skills 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    value={skillHaveInput}
                    onChange={e => {
                      setSkillHaveInput('');
                      handleSkillAdd('skillsHave', e.target.value);
                    }}
                  >
                    <option value="">Select a skill</option>
                    {staticSkills.filter(skill => !formData.skillsHave.includes(skill)).map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skillsHave.map(skill => (
                      <span key={skill} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={() => handleSkillRemove('skillsHave', skill)} className="ml-1 text-purple-400 hover:text-purple-600"><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                  <ErrorMessage error={errors.skills} />
                </div>
              </div>
              {/* Right column - Email, Password, Skills I Want */}
              <div className="space-y-6">
                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`pl-10 pr-4 py-3 w-full border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.email 
                          ? 'border-red-300 bg-red-50 focus:bg-red-50' 
                          : 'border-gray-200 bg-gray-50 focus:bg-white'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  <ErrorMessage error={errors.email} />
                </div>
                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`pl-10 pr-12 py-3 w-full border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.password 
                          ? 'border-red-300 bg-red-50 focus:bg-red-50' 
                          : 'border-gray-200 bg-gray-50 focus:bg-white'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors hover:scale-105"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <ErrorMessage error={errors.password} />
                </div>
                {/* Skills I Want */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skills I Want</label>
                  <select
                    className={`w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2 ${
                      errors.skills 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    value={skillWantInput}
                    onChange={e => {
                      setSkillWantInput('');
                      handleSkillAdd('skillsWant', e.target.value);
                    }}
                  >
                    <option value="">Select a skill</option>
                    {staticSkills.filter(skill => !formData.skillsWant.includes(skill)).map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skillsWant.map(skill => (
                      <span key={skill} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={() => handleSkillRemove('skillsWant', skill)} className="ml-1 text-gray-400 hover:text-gray-600"><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                  <ErrorMessage error={errors.skills} />
                </div>
              </div>
            </div>
            
            {/* Skills error message */}
            
            {/* Avatar selection at the end */}
            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose Your Avatar
              </label>
              <div className="flex items-center justify-center gap-5 mb-4">
                {avatarImages.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`relative rounded-full border-2 p-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:scale-105 ${
                      selectedAvatar === avatar.id 
                        ? 'border-purple-500 scale-105 shadow-lg' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => handleAvatarSelect(avatar.id)}
                    aria-label={avatar.alt}
                  >
                    <img src={avatar.src} alt={avatar.alt} className="w-16 h-16 rounded-full object-cover" />
                    {selectedAvatar === avatar.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="text-white" size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {/* Custom avatar upload */}
              <div className="flex items-center justify-center">
                <label htmlFor="profileFile" className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors hover:scale-105">
                  <Upload size={16} />
                  Upload Custom Avatar
                </label>
                <input
                  id="profileFile"
                  name="profileFile"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {/* Preview uploaded avatar */}
              {avatarPreview && (
                <div className="mt-3 flex justify-center">
                  <div className="rounded-full border-2 border-purple-500 p-1 shadow-lg">
                    <img src={avatarPreview} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover" />
                  </div>
                </div>
              )}
              <ErrorMessage error={errors.avatar} />
            </div>
            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-8 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:scale-100'
              }`}
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
              {!isSubmitting && <ArrowRight size={20} />}
            </button>
            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-medium">Or</span>
                </div>
              </div>
            </div>
            {/* Toggle mode */}
            <div className="mt-6 text-center">
              <a
                href="/login"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors hover:scale-105"
              >
                Already have an account? Sign in
              </a>
            </div>
          </form>
        </div>
        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <span className="text-purple-600 hover:underline cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-purple-600 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 