"use client"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import logo from '../assets/logo.png'
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "@studio-freight/lenis"
import {
  User,
  Search,
  ChevronDown,
  Star,
  ArrowRight,
  Users,
  Globe,
  BookOpen,
  Heart,
  TrendingUp,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Target,
  Award,
  Rocket,
  Zap,
  ShieldCheck,
  Code,
  Banknote,
  Wallet,
  PiggyBank,
  CreditCard,
  Pen,
  Paintbrush,
  Music,
  Languages,
  Brain,
  Icon,
  Play,
  Shield
} from "lucide-react"

const availabilities = ["All", "Mornings", "Evenings", "Weekends"]

const InteractiveGraphBackground = () => {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: undefined, y: undefined })
  const animationRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    let network = {}

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    const generateNetwork = () => {
      network = {
        nodes: [],
        color: { r: 255, g: 255, b: 255 },
        glowRadius: 100,
      }

      const nodeCount = 70;
      for (let i = 0; i < nodeCount; i++) {
        network.nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 5 + 1.5,
          baseOpacity: Math.random() * 0.3 + 0.2,
          currentOpacity: Math.random() * 0.3 + 0.2,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        })
      }
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseOut = () => {
      mouseRef.current = { x: undefined, y: undefined };
    }

    const animate = () => {
      if (!canvas || !network.nodes) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mouse = mouseRef.current
      const { nodes, color, glowRadius } = network
      const maxDistance = 140;
      nodes.forEach((node) => {
        node.x += node.vx
        node.y += node.vy

        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1

        node.x = Math.max(0, Math.min(canvas.width, node.x))
        node.y = Math.max(0, Math.min(canvas.height, node.y))

        let targetOpacity = node.baseOpacity;
        if (mouse.x !== undefined) {
          const distance = Math.sqrt(Math.pow(node.x - mouse.x, 2) + Math.pow(node.y - mouse.y, 2))
          if (distance < glowRadius) {
            const intensity = 2 - distance / glowRadius
            targetOpacity = Math.min(2, node.baseOpacity + intensity * 0.8)
          }
        }
        node.currentOpacity += (targetOpacity - node.currentOpacity) * 0.1;

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${node.currentOpacity})`
        ctx.fill()

        if (mouse.x !== undefined) {
          const distance = Math.sqrt(Math.pow(node.x - mouse.x, 2) + Math.pow(node.y - mouse.y, 2))
          if (distance < glowRadius) {
            const intensity = 2 - distance / glowRadius
            ctx.beginPath()
            ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.4})`
            ctx.fill()
          }
        }
      })
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];
          const distance = Math.sqrt(
            Math.pow(nodeA.x - nodeB.x, 2) +
            Math.pow(nodeA.y - nodeB.y, 2),
          )
          if (distance < maxDistance) {
            let baseOpacity = Math.max(0, (maxDistance - distance) / maxDistance) * 0.25;
            let currentOpacity = baseOpacity;
            if (mouse.x !== undefined) {
              const midX = (nodeA.x + nodeB.x) / 2;
              const midY = (nodeA.y + nodeB.y) / 2;
              const mouseDistance = Math.sqrt(Math.pow(midX - mouse.x, 2) + Math.pow(midY - mouse.y, 2));

              if (mouseDistance < glowRadius) {
                const intensity = 1 - mouseDistance / glowRadius;
                currentOpacity = Math.min(0.8, baseOpacity + intensity * 0.6);
              }
            }
            ctx.beginPath()
            ctx.moveTo(nodeA.x, nodeA.y)
            ctx.lineTo(nodeB.x, nodeB.y)
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${currentOpacity})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    generateNetwork()
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseout", handleMouseOut)
    window.addEventListener("resize", () => {
      resizeCanvas()
      generateNetwork()
    })
    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseout", handleMouseOut)
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ background: "transparent" }} />
}

const HowItWorksCard = ({ icon: Icon, title, description, index, className }) => {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const { left, top, width, height } = card.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setMousePosition({ x, y });

    const rotateX = (y / height - 0.5) * -25;
    const rotateY = (x / width - 0.5) * 25;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className={`group relative p-8 text-center bg-gradient-to-br from-purple-700 to-purple-900 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden ${className || ''}`}
      style={{
        transition: 'transform 0.1s',
        background: isHovered
          ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 0, 0, 0.), rgba(75, 0, 130, 0.9), rgba(0, 0, 0, 0.6))`
          : 'linear-gradient(135deg, rgb(126 34 206) 0%, rgb(88 28 135) 100%)'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
            width: '300px',
            height: '300px',
            background: `radial-gradient(circle, rgba(0, 0, 0, 0.3) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 60%)`,
            borderRadius: '50%',
            transform: 'translate(0, 0)',
          }}
        />
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Icon size={36} className="text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-200">{description}</p>
      </div>
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
          filter: 'blur(1px)'
        }}
      />
    </div>
  );
};

const SkillXchangeLanding = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [availability, setAvailability] = useState("All")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAllProfiles, setShowAllProfiles] = useState(false)
  const [activeNav, setActiveNav] = useState("home")
  const [scrollY, setScrollY] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".scroll-reveal")
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    }
  }, [])

  // ===== GSAP PIN & SCRUB ANIMATION HOOK =====
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.how-it-works-card');
      const section = document.querySelector('#how-it-works-section');

      gsap.set(cards, { yPercent: +90, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=2500",
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card) => {
        tl.to(card, {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
        }, '<0.9');
      });
    });

    return () => ctx.revert();

  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setUsers([]);

      try {
        const res = await fetch("http://localhost:5000/api/auth/users");

        if (!res.ok) {
          console.error("Failed to fetch from API:", res.status, res.statusText);
          throw new Error(`API request failed with status ${res.status}`);
        }

        const data = await res.json();

        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("API Error: Data format is incorrect.", data);
        }
      } catch (err) {
        console.error("An error occurred while fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const parseSkills = (skillsString) => {
    if (!skillsString || typeof skillsString !== "string") return []
    return skillsString
      .replace(/^\[?["']?/, "")
      .replace(/["']?\]?$/, "")
      .split(",")
      .map((s) => s.replace(/["']/g, "").trim())
      .filter(Boolean)
  }

  const filteredProfiles = users.filter(
    (p) =>
      p.public !== false &&
      (availability === "All" || (p.availability || "").includes(availability)) &&
      (p.username || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const displayProfiles = showAllProfiles ? filteredProfiles : filteredProfiles.slice(0, 3)

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setActiveNav(sectionId);
  }

  const handleNavigation = (path) => {
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== NAVBAR ===== */}
      <header className="bg-white shadow-sm border-b border-purple-700 sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="flex justify-center mb-0">
                <img src={logo} alt="Logo" className="w-9 h-9 rounded-2xl object-cover" />
              </div>
            </div>
            <span className="text-xl font-bold text-purple-800 hidden sm:block">
              SkillXchange
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-2 md:space-x-6">
            <button
              onClick={() => scrollToSection("home")}
              className={`px-4 py-2 font-semibold transition-all duration-300 relative ${activeNav === "home"
                  ? "text-purple-800"
                  : "text-purple-700 hover:text-purple-800"
                }`}
            >
              Home
              {activeNav === "home" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-800 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className={`px-4 py-2 font-semibold transition-all duration-300 relative ${activeNav === "about"
                  ? "text-purple-800"
                  : "text-purple-700 hover:text-purple-800"
                }`}
            >
              About
              {activeNav === "about" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-800 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`px-4 py-2 font-semibold transition-all duration-300 relative ${activeNav === "contact"
                  ? "text-purple-800"
                  : "text-purple-700 hover:text-purple-800"
                }`}
            >
              Contact
              {activeNav === "contact" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-800 rounded-full"></div>
              )}
            </button>
          </nav>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNavigation("/login")}
              className="px-4 py-2 font-semibold text-purple-800 hover:text-black transition-all duration-300 hover:scale-105"
            >
              Login
            </button>
            <button
              onClick={() => handleNavigation("/register")}
              className="px-4 py-2 bg-purple-800 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section id="home" className="relative px-4 py-20 sm:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-gray-900 to-purple-700"></div>
        <InteractiveGraphBackground />
        <div className="relative max-w-6xl mx-auto z-10" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
          <div className="scroll-reveal">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-2 rounded-full text-sm font-semibold mb-8 border border-white/20 backdrop-blur-sm">
              Learn. Teach. Exchange.
            </div>
          </div>
          <div className="scroll-reveal">
            <h1 className="text-6xl sm:text-8xl font-black text-white mb-8 leading-tight">SkillXchange</h1>
          </div>
          <div className="scroll-reveal">
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect with passionate learners and expert teachers from around the world.
              <span className="text-white font-semibold"> Exchange skills, build relationships, grow together.</span>
            </p>
          </div>
          <div className="scroll-reveal flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              onClick={() => handleNavigation("/register")}
              className="group px-10 py-5 bg-white text-purple-900 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 flex items-center gap-3"
            >
              <Rocket size={24} />
              Start Your Journey
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button
              onClick={() => window.open('https://youtu.be/itsgfDBPqRg?si=oY4uvj9b-ExTp_qq', '_blank')}
              className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-purple-900 transition-all duration-500 transform hover:scale-105 flex items-center gap-3"
            >
              <Play size={24} />
              Watch Demo
            </button>
          </div>
          <div className="scroll-reveal grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">100%</div>
              <div className="text-gray-400 font-medium">Free to Start</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">20+</div>
              <div className="text-gray-400 font-medium">Skills Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2 flex items-center justify-center">
                <Wallet size={35} className="text-white" />
              </div>
              <div className="text-gray-400 font-medium">Learn by Sharing</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section id="how-it-works-section" className="py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 text-black">How SkillXchange Works</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Unlock a world of knowledge in four simple steps. Your journey to mastery starts here.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <HowItWorksCard
              icon={User}
              title="1. Create Profile"
              description="Showcase the skills you can teach and list what you're eager to learn."
              index={0}
              className="how-it-works-card"
            />
            <HowItWorksCard
              icon={Search}
              title="2. Find Your Match"
              description="Browse profiles or use our smart search to find members whose skills align with yours."
              index={1}
              className="how-it-works-card"
            />
            <HowItWorksCard
              icon={MessageCircle}
              title="3. Connect & Plan"
              description="Use our secure messaging to connect, discuss goals, and schedule your skill swap sessions."
              index={2}
              className="how-it-works-card"
            />
            <HowItWorksCard
              icon={TrendingUp}
              title="4. Learn & Grow"
              description="Teach what you know, learn what you don't. Rate your experience and watch your expertise expand."
              index={3}
              className="how-it-works-card"
            />
          </div>
        </div>
      </section>

      {/* ===== BROWSE SKILLS SECTION (REPLACED DISCOVER SECTION) ===== */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-8 text-foreground">Discover Amazing Skills</h2>
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
                          <span className="font-semibold">
                            {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "New"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Skills Offered:</span>
                          <div className="flex flex-wrap gap-2 mt-2 justify-center lg:justify-start">
                            {parseSkills(profile.skillsOffered).length > 0 ? parseSkills(profile.skillsOffered).map(skill => (
                              <span key={skill} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                                {skill}
                              </span>
                            )) : <span className="text-sm text-gray-500">No skills listed</span>}
                          </div>
                        </div>

                        <div>
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Looking For:</span>
                          <div className="flex flex-wrap gap-2 mt-2 justify-center lg:justify-start">
                            {parseSkills(profile.skillsWanted).length > 0 ? parseSkills(profile.skillsWanted).map(skill => (
                              <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                {skill}
                              </span>
                            )) : <span className="text-sm text-gray-500">No skills listed</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-500">
                        <span className="text-sm font-medium">Available:</span>
                        <span className="text-sm font-semibold text-gray-700">{profile.availability || 'Not specified'}</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex flex-col justify-center items-center gap-3">
                      <button
                        onClick={() => handleNavigation('/login')}
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

      {/* ===== FEATURES SECTION ===== */}

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="scroll-reveal text-center mb-20">
            <h2 className="text-5xl font-black mb-8 text-foreground">The Future of Peer-to-Peer Learning</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              SkillXchange is more than a platform; it's a movement. We empower individuals to unlock their potential through the simple power of sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 scroll-reveal">
              <img
                src="https://placehold.co/600x800/111827/FFFFFF?text=Collaboration"
                alt="Two people collaborating on a project"
                className="rounded-3xl object-cover w-full h-full shadow-2xl"
              />
            </div>
            <div className="lg:col-span-2 scroll-reveal grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="group p-8 bg-card rounded-3xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-border">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="text-white" size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4 text-foreground">Smart Matching</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Our algorithm connects you with the most compatible partners based on the skills you offer and seek.
                </p>
              </div>
              <div className="group p-8 bg-card rounded-3xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-border">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="text-white" size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4 text-foreground">Verified & Safe</h4>
                <p className="text-muted-foreground leading-relaxed">
                  With profile verification and a secure messaging system, you can connect and learn with confidence.
                </p>
              </div>
              <div className="group p-8 bg-card rounded-3xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-border">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="text-white" size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4 text-foreground">Community Focused</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Join a supportive community that values mutual growth, feedback, and building lasting connections.
                </p>
              </div>
              <div className="group p-8 bg-card rounded-3xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-border">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="text-white" size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4 text-foreground">Track Your Growth</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Earn badges, get reviews, and build a reputation that showcases your journey as both a teacher and a learner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 px-4 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-purple-800/90"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-xl float-animation"></div>
          <div
            className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl float-animation"
            style={{ animationDelay: "3s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full blur-xl float-animation"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="scroll-reveal">
            <h2 className="text-5xl sm:text-6xl font-black mb-8 leading-tight">
              Ready to Teach What You Know & Learn What You Don't?
            </h2>
            <p className="text-xl sm:text-2xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of others who are leveling up their skills in the most collaborative way possible. Your perfect learning partner is just a click away.
            </p>
          </div>

          <div className="scroll-reveal flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => handleNavigation("/register")}
              className="group px-12 py-5 bg-white text-purple-700 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-500 flex items-center gap-3"
            >
              <Rocket size={24} />
              Join Free Today
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button
              onClick={() => window.open('https://youtu.be/itsgfDBPqRg?si=oY4uvj9b-ExTp_qq', '_blank')}
              className="px-12 py-5 bg-transparent border-2 border-white text-white rounded-2xl font-black text-xl hover:bg-white hover:text-purple-700 transition-all duration-500 transform hover:scale-105 flex items-center gap-3"
            >
              <Play size={24} />
              Watch Demo
            </button>
          </div>

          <div className="scroll-reveal mt-12 text-center">
            <p className="text-white/80 text-lg">
              ✨ No credit card required • Join 10,000+ active learners • Start exchanging skills today
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer id="contact" className="py-14 px-4 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 lg:col-span-2">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Our Mission
                  </h3>
                </div>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed max-w-md mx-auto">
                  Connecting minds, sharing knowledge, building futures. A platform where learning meets teaching, and
                  skills are shared across boundaries.
                </p>
                <div className="flex space-x-4">
                  <a href="#" aria-label="Facebook" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all duration-300 cursor-pointer text-gray-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="#" aria-label="Twitter" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all duration-300 cursor-pointer text-gray-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                  </a>
                  <a href="#" aria-label="LinkedIn" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer text-gray-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6 text-white">Quick Links</h4>
              <div className="space-y-3">
                <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about') }} className="block text-gray-300 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all duration-300 font-medium hover:text-white">About Us</a>
                <a href="#" className="block text-gray-300 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all duration-300 font-medium hover:text-white">How It Works</a>
                <a href="#" className="block text-gray-300 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all duration-300 font-medium hover:text-white">Success Stories</a>
                <a href="#" className="block text-gray-300 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all duration-300 font-medium hover:text-white">Privacy Policy</a>
                <a href="#" className="block text-gray-300 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all duration-300 font-medium hover:text-white">Terms of Service</a>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6 text-white">Get In Touch</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Mail size={16} className="text-gray-300" />
                  </div>
                  <a href="skillxchange@gmail.com">
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                      skillxchange@gmail.com
                    </span>
                  </a>
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Phone size={16} className="text-gray-300" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    +91 75740 96368
                  </span>
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MapPin size={16} className="text-gray-300" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    Global Community
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-white text-lg">
              &copy; {new Date().getFullYear()} SkillXchange. All rights reserved.</p>
            <p>
              <span className="text-gray-400 font-semibold"> Made with ❤️ for learners worldwide</span>
            </p>
          </div>
        </div>
      </footer>
      <style jsx global>{`
        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .float-animation {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(-20px) translateX(10px) rotate(180deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default SkillXchangeLanding