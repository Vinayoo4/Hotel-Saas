
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ArticleView from './pages/ArticleView';
import SavedItems from './pages/SavedItems';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const Navigation = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-green-700 text-white p-4 flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <Link to="/" className="text-xl font-bold">EcoWise Wealth Digest</Link>
        <Link to="/" className="hover:underline">Home</Link>
        {user && <Link to="/saved" className="hover:underline">Saved</Link>}
        {user?.role === 'admin' && <Link to="/admin" className="hover:underline">Admin</Link>}
      </div>
      <div>
        {user ? (
          <div className="flex gap-4 items-center">
            <span>Hi, {user.username}</span>
            <button onClick={handleLogout} className="bg-green-800 px-3 py-1 rounded">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="bg-green-800 px-3 py-1 rounded">Login / Sign Up</Link>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/article/:type/:id" element={<ArticleView />} />
            <Route path="/saved" element={<SavedItems />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
