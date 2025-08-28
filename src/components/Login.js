import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (
        formData.email === 'admin@example.com' &&
        formData.password === 'admin123'
      ) {
        // Redirect admin to admin dashboard
        navigate('/admindashboard');
        return;
      }
      if (response.ok && data.success) {
        // Store user ID and token in localStorage
        if (data.user && data.user._id) {
          localStorage.setItem('userId', data.user._id);
        }
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        console.log('✅ Login successful!', data);
        navigate('/dashboard');
      } else {
        console.error('❌ Login failed:', data);
        alert(`Login failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Login failed: Network error or server unavailable');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="w-16 h-16 rounded-2xl shadow-lg object-cover transition-transform duration-200 hover:scale-105" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 transition-opacity duration-300">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 transition-opacity duration-300">
            Sign in to your SkillXchange account
          </p>
        </div>
        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transition-shadow duration-200 hover:shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
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
                    className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                  />
                </div>
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
                    className="pl-10 pr-12 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors hover:scale-110"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {/* Forgot password */}
              <div className="flex items-center justify-end mt-4">
                <button
                  type="button"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors hover:scale-105"
                >
                  Forgot your password?
                </button>
              </div>
              {/* Submit button */}
              <button
                type="submit"
                className="w-full mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:scale-100"
              >
                <span>Sign In</span>
                <ArrowRight size={20} />
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
            {/* Link to Register */}
              <div className="mt-6 text-center">
              <a
                href="/register"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors hover:scale-105"
                >
                  Don't have an account? Sign up
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

export default Login;