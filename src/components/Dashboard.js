import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, CheckCircle, Clock, Star, ArrowRight } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

// Lazy load components
const StatCard = lazy(() => import('./dashboard/StatCard'));
const ActionItem = lazy(() => import('./dashboard/ActionItem'));
const SwapCard = lazy(() => import('./dashboard/SwapCard'));
const UserRecommendation = lazy(() => import('./dashboard/UserRecommendation'));


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ pendingRequests: 0, activeSwaps: 0, completedSwaps: 0, rating: 0 });
  const [actionItems, setActionItems] = useState([]);
  const [ongoingSwaps, setOngoingSwaps] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- Simple localStorage cache with TTL ---
  const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
  const getCache = (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (Date.now() - (parsed.timestamp || 0) > CACHE_MAX_AGE_MS) return null;
      return parsed.value;
    } catch { return null; }
  };
  const setCache = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), value }));
    } catch {}
  };

  const parseSkills = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(s => String(s).trim().toLowerCase()).filter(Boolean);
    return String(value)
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
  };

  const fetchJson = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
    return data;
  };

  useEffect(() => {
    const load = async (preferCache = true) => {
      const hasWarmCache = Boolean(getCache('dashboard:snapshot'));
      if (preferCache && hasWarmCache) {
        const snap = getCache('dashboard:snapshot');
        if (snap) {
          setUser(snap.user);
          setStats(snap.stats);
          setActionItems(snap.actionItems || []);
          setOngoingSwaps(snap.ongoingSwaps || []);
          setRecommendedUsers(snap.recommendedUsers || []);
          setIsLoading(false);
        }
      } else {
        setIsLoading(true);
      }
      setError(null);
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId || !token) {
        navigate('/login');
        return;
      }

      try {
        // Current user
        const cachedUser = getCache('dashboard:user');
        const userResp = cachedUser || await fetchJson(`http://localhost:5000/api/auth/user/${userId}`);
        const currentUser = (userResp.user || userResp);
        setUser(currentUser);
        setCache('dashboard:user', currentUser);

        // Parallel data loads
        const cachedPending = getCache('dashboard:pending');
        const cachedActive = getCache('dashboard:active');
        const cachedCompleted = getCache('dashboard:completed');
        const cachedAllUsers = getCache('dashboard:allUsers');
        const [pendingResp, activeResp, completedResp, allUsersResp] = await Promise.all([
          cachedPending || fetchJson(`http://localhost:5000/api/swap-offers/user/${userId}/pending`),
          cachedActive || fetchJson(`http://localhost:5000/api/swap-offers/user/${userId}?status=accepted`),
          cachedCompleted || fetchJson(`http://localhost:5000/api/swap-offers/user/${userId}?status=completed`),
          cachedAllUsers || fetchJson(`http://localhost:5000/api/auth/users`),
        ]);
        if (!cachedPending) setCache('dashboard:pending', pendingResp);
        if (!cachedActive) setCache('dashboard:active', activeResp);
        if (!cachedCompleted) setCache('dashboard:completed', completedResp);
        if (!cachedAllUsers) setCache('dashboard:allUsers', allUsersResp);

        const pendingOffers = pendingResp.pendingOffers || [];
        setActionItems(
          pendingOffers.map(o => ({
            _id: o._id,
            sender: {
              username: o.requesterId?.username || 'Unknown',
              profilePhoto: o.requesterId?.profilePhoto || null,
            },
            createdAt: o.createdAt,
          }))
        );

        const activeOffers = (activeResp.swapOffers || []).map(o => ({
          partner: {
            username: (o.otherUser?.username) || (o.requesterId?.username) || (o.requestedUserId?.username) || 'Partner',
            profilePhoto: (o.otherUser?.profilePhoto) || (o.requesterId?.profilePhoto) || (o.requestedUserId?.profilePhoto) || null,
          },
          skillOffered: (o.offeredSkills || '').split(',')[0] || 'Skill',
        }));
        setOngoingSwaps(activeOffers);

        const completedOffers = completedResp.swapOffers || [];

        setStats({
          pendingRequests: pendingOffers.length,
          activeSwaps: activeOffers.length,
          completedSwaps: completedOffers.length,
          rating: Number(currentUser.averageRating || 0),
        });

        // Recommendations: users who offer any skill I want
        const myWanted = parseSkills(currentUser.skillsWanted);
        const allUsers = allUsersResp.users || [];
         const recs = allUsers
           .filter(u => String(u._id) !== String(currentUser._id))
           .filter(u => {
             const offers = parseSkills(u.skillsOffered);
             return offers.some(s => myWanted.includes(s));
           })
           .slice(0, 3);
        setRecommendedUsers(recs);

        // Snapshot cache for instant subsequent loads
        setCache('dashboard:snapshot', {
          user: currentUser,
          stats: {
            pendingRequests: pendingOffers.length,
            activeSwaps: activeOffers.length,
            completedSwaps: completedOffers.length,
            rating: Number(currentUser.averageRating || 0),
          },
          actionItems: pendingOffers.map(o => ({
            _id: o._id,
            sender: {
              username: o.requesterId?.username || 'Unknown',
              profilePhoto: o.requesterId?.profilePhoto || null,
            },
            createdAt: o.createdAt,
          })),
          ongoingSwaps: activeOffers,
          recommendedUsers: recs,
        });

      } catch (e) {
        console.error('Dashboard load failed:', e);
        setError(e.message);
        if (/401|403/.test(String(e.message))) navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    load(true);

    // Expose a refresh method on window for quick updates (optional, local scope alternative below)
    // window.__refreshDashboard = () => load(false);
  }, [navigate]);

  const updateOfferStatus = async (offerId, status) => {
    try {
      const userId = localStorage.getItem('userId');
      await fetchJson(`http://localhost:5000/api/swap-offers/${offerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, userId }),
      });
      // Optimistic UI: remove from action items immediately
      setActionItems(prev => prev.filter(i => i._id !== offerId));
      // Invalidate caches
      setCache('dashboard:pending', null);
      setCache('dashboard:snapshot', null);
      // Trigger a background refresh without blocking UI
      (async () => {
        try {
          const userIdLocal = localStorage.getItem('userId');
          await fetch(`http://localhost:5000/api/swap-offers/user/${userIdLocal}/pending`).then(() => {});
        } catch {}
      })();
    } catch (e) {
      console.error('Failed to update offer status:', e);
      alert(e.message || 'Failed to update offer');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-300 border-t-purple-600"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section 1: Header and Quick Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your skill swaps today.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <ErrorBoundary>
            <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-24"></div>}>
              <StatCard title="Pending Requests" value={stats.pendingRequests} icon={MessageSquare} bgColor="bg-orange-100" iconColor="text-orange-600" />
              <StatCard title="Active Swaps" value={stats.activeSwaps} icon={Clock} bgColor="bg-blue-100" iconColor="text-blue-600" />
              <StatCard title="Completed Swaps" value={stats.completedSwaps} icon={CheckCircle} bgColor="bg-green-100" iconColor="text-green-600" />
              <StatCard title="Your Rating" value={stats.rating.toFixed(1)} icon={Star} bgColor="bg-yellow-100" iconColor="text-yellow-600" />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Section 2: Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Action Items & Ongoing Swaps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Action Items */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Action Items</h2>
              <div className="space-y-3">
                <ErrorBoundary>
                  <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-24"></div>}>
                    {actionItems.length > 0 ? (
                      actionItems.map((item) => (
                        <ActionItem 
                          key={item._id}
                          request={item}
                          onAccept={(id) => updateOfferStatus(id, 'accepted')}
                          onDecline={(id) => updateOfferStatus(id, 'rejected')}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500 bg-white p-4 rounded-lg border">No pending actions. Great job!</p>
                    )}
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>

            {/* Ongoing Swaps */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">My Ongoing Swaps</h2>
              <div className="space-y-3">
                <ErrorBoundary>
                  <Suspense fallback={<div className="animate-pulse space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>)}</div>}>
                    {ongoingSwaps.map((swap, index) => (
                      <SwapCard 
                        key={index}
                        swap={swap}
                        onClick={() => navigate('/messenger')}
                      />
                    ))}
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          </div>
          
          {/* Right Column: Recommendations & Quick Links */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended For You</h2>
              <div className="space-y-4">
                <ErrorBoundary>
                  <Suspense fallback={<div className="animate-pulse space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>)}</div>}>
                    {recommendedUsers.map(user => (
                      <UserRecommendation 
                        key={user._id}
                        user={{
                          username: user.username,
                          profilePhoto: user.profilePhoto,
                          skillsOffered: user.skillsOffered,
                          averageRating: user.averageRating || 0
                        }}
                        onClick={() => navigate(`/user/${user._id}`)}
                      />
                    ))}
                    <button onClick={() => navigate('/all-users')} className="w-full mt-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                      Browse All Users
                    </button>
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;