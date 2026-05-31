
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ArticleView from './pages/ArticleView';
import SavedItems from './pages/SavedItems';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import InstallPrompt from './components/pwa/InstallPrompt';
import UpdateBanner from './components/pwa/UpdateBanner';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const savedCount = user ? JSON.parse(localStorage.getItem(`saved_items_${user.id}`) || '[]').length : 0;

  return (
    <nav className="bg-green-700 text-white p-4 relative">
      {!isOnline && (
        <div className="absolute top-0 left-0 w-full bg-yellow-500 text-yellow-900 text-xs font-bold text-center py-1 z-50">
          You are offline. Showing cached content.
        </div>
      )}
      <div className={`flex justify-between items-center ${!isOnline ? 'mt-4' : ''}`}>
        <div className="flex gap-4 items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} title={isOnline ? 'Online' : 'Offline'}></span>
            EcoWise Wealth Digest
          </Link>
          <div className="hidden md:flex gap-4 items-center ml-4">
            <Link to="/" className="hover:underline font-medium">Home</Link>
            {user && (
              <Link to="/saved" className="hover:underline flex items-center gap-1 font-medium">
                Saved
                {savedCount > 0 && <span className="bg-green-900 text-xs px-1.5 py-0.5 rounded-full">{savedCount}</span>}
              </Link>
            )}
            {user?.role === 'admin' && <Link to="/admin" className="hover:underline font-medium">Admin</Link>}
          </div>
        </div>

        <div className="hidden md:flex gap-4 items-center">
          {user ? (
            <div className="flex gap-4 items-center">
              <Link to="/profile" className="hover:underline font-medium text-sm">Hi, {user.username}</Link>
              <button onClick={handleLogout} className="bg-green-800 px-3 py-1.5 rounded text-sm font-semibold hover:bg-green-900 transition-colors">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="bg-green-800 px-4 py-1.5 rounded text-sm font-semibold hover:bg-green-900 transition-colors">Login / Sign Up</Link>
          )}
        </div>

        <button className="md:hidden text-2xl focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-green-800 rounded-lg overflow-hidden flex flex-col">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 hover:bg-green-900 border-b border-green-700">Home</Link>
          {user && (
            <Link to="/saved" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 hover:bg-green-900 border-b border-green-700 flex justify-between">
              Saved {savedCount > 0 && <span className="bg-green-600 px-2 py-0.5 rounded-full text-xs">{savedCount}</span>}
            </Link>
          )}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 hover:bg-green-900 border-b border-green-700">Admin</Link>}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 hover:bg-green-900 border-b border-green-700">Profile</Link>
              <button onClick={handleLogout} className="px-4 py-3 hover:bg-green-900 text-left w-full text-red-200">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 hover:bg-green-900">Login / Sign Up</Link>
          )}
        </div>
      )}
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <UpdateBanner />
          <Navigation />
          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/article/:type/:id" element={<ArticleView />} />
              <Route path="/saved" element={<SavedItems />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <InstallPrompt />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
