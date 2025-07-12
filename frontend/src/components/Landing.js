import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  ChevronDown,
  LogOut,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  Zap,
  Globe,
  BookOpen,
  Heart,
  TrendingUp,
  Shield,
  MessageCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const availabilities = ['All', 'Mornings', 'Evenings', 'Weekends'];

const SkillXchangeLanding = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availability, setAvailability] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllProfiles, setShowAllProfiles] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const navigate = useNavigate();
  
  const profilesPerPage = 5;

  useEffect(() => {
    // Simulate API call
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/users');
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Helper to parse skills string to array
  const parseSkills = (skillsString) => {
    if (!skillsString || typeof skillsString !== 'string') return [];
    return skillsString
      .replace(/^\[?["']?/, '')
      .replace(/["']?\]?$/, '')
      .split(',')
      .map(s => s.replace(/["']/g, '').trim())
      .filter(Boolean);
  };

  // Filtered and paginated profiles
  const filteredProfiles = users.filter(
    (p) =>
      p.public !== false &&
      (availability === 'All' || (p.availability || '').includes(availability)) &&
      ((p.username || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const displayProfiles = filteredProfiles.slice(0, 3);
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * profilesPerPage,
    currentPage * profilesPerPage
  );

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Update active navigation
    if (sectionId === 'about') {
      setActiveNav('about');
    } else if (sectionId === 'contact') {
      setActiveNav('contact');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-6 md:px-8">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
            <span className="text-xl font-bold text-gray-800 hidden sm:block">SkillXchange</span>
          </div>
          {/* Nav links */}
          <nav className="flex items-center space-x-2 md:space-x-6">
            <button 
              onClick={() => setActiveNav('home')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${activeNav === 'home' ? 'text-purple-700 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${activeNav === 'about' ? 'text-purple-700 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${activeNav === 'contact' ? 'text-purple-700 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
            >
              Contact
            </button>
          </nav>
          {/* Auth buttons */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-purple-600 font-medium hover:text-purple-700 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-3xl"></div>
        <div className="relative max-w-6xl mx-auto">
          <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            SkillXchange
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect, Learn, and Grow Together. Exchange skills with talented people from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">Why Choose SkillXchange?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Global Community</h3>
              <p className="text-gray-600">Connect with skilled professionals from around the world and expand your network.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Instant Matching</h3>
              <p className="text-gray-600">Our smart algorithm matches you with the perfect skill exchange partners.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Secure & Safe</h3>
              <p className="text-gray-600">Verified profiles and secure communication channels for your peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Skills Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Discover Amazing Skills</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse through our community of skilled professionals ready to share their expertise
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm max-w-md">
              <Search className="text-gray-400 mr-3" size={20} />
              <input
                type="text"
                placeholder="Search skills or names..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 font-medium">Availability:</span>
              <div className="relative">
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm font-medium"
                >
                  {availabilities.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {/* Profile Cards */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 border-t-purple-600"></div>
              </div>
            ) : displayProfiles.length === 0 ? (
              <div className="text-center text-gray-500 py-16">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-xl">No profiles found matching your criteria</p>
              </div>
            ) : (
              displayProfiles.map(profile => (
                <div key={profile._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex flex-col lg:flex-row items-center lg:items-stretch p-6 lg:p-8 gap-6">
                    {/* Profile Photo */}
                    <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl">
                      {profile.profilePhoto ? (
                        <img src={profile.profilePhoto} alt="Profile" className="w-24 h-24 rounded-2xl object-cover" />
                      ) : (
                        <User size={48} className="text-purple-600" />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 text-center lg:text-left">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                        <h3 className="text-2xl font-bold text-gray-800">{profile.username}</h3>
                        <div className="flex items-center justify-center lg:justify-start text-yellow-500">
                          <Star size={18} className="mr-1 fill-current" />
                          <span className="font-semibold">{typeof profile.rating === 'number' ? profile.rating.toFixed(1) : 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Skills Offered:</span>
                          <div className="flex flex-wrap gap-2 mt-2 justify-center lg:justify-start">
                            {parseSkills(profile.skillsOffered).map(skill => (
                              <span key={skill} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Looking For:</span>
                          <div className="flex flex-wrap gap-2 mt-2 justify-center lg:justify-start">
                            {parseSkills(profile.skillsWanted).map(skill => (
                              <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-500">
                        <span className="text-sm font-medium">Available:</span>
                        <span className="text-sm font-semibold text-gray-700">{profile.availability}</span>
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="flex flex-col justify-center items-center gap-3">
                      <button 
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      >
                        <MessageCircle size={18} />
                        Connect
                      </button>
                      <p className="text-xs text-gray-500">Join to connect</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Show More/Less Button */}
          {filteredProfiles.length > 3 && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllProfiles(!showAllProfiles)}
                className="px-8 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                {showAllProfiles ? 'Show Less' : `View All ${filteredProfiles.length} Profiles`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">About SkillXchange</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing how people learn and grow by creating meaningful connections through skill exchange.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-gray-800">Our Mission</h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At SkillXchange, we believe that everyone has something valuable to teach and something new to learn. 
                Our platform connects passionate individuals who want to share their expertise while gaining new skills 
                from others in our community.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you're looking to learn a new skill or share your expertise, SkillXchange makes it easy to 
                find the perfect learning partner and create meaningful connections through knowledge sharing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Heart className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Community First</h4>
                <p className="text-gray-600">Building meaningful connections through shared learning experiences.</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Continuous Growth</h4>
                <p className="text-gray-600">Empowering individuals to evolve their skills and advance their careers.</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
                  <Globe className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Global Reach</h4>
                <p className="text-gray-600">Connecting learners and experts from around the world.</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Quality Learning</h4>
                <p className="text-gray-600">Ensuring high-quality skill exchanges through verified profiles.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Skill Exchange Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community of learners and experts who are growing their skills together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Sign Up Free
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">SkillXchange</h3>
              <p className="text-gray-400 mb-4">Connecting minds, sharing knowledge, building futures.</p>
              <p className="text-gray-400 text-sm">
                A platform where learning meets teaching, and skills are shared across boundaries.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">About Us</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">How It Works</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-400 text-sm">skillxchange@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-400 text-sm">+91 75740 96368</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500">&copy; 2025 SkillXchange. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SkillXchangeLanding;