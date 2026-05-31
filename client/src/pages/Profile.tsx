import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopicsManager from '../components/TopicsManager';
import { API_URL } from '../api';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ reads: 0, saves: 0 });
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.username);
      // Fetch stats
      const token = localStorage.getItem('token');
      fetch(`${API_URL}/users/${user.id}/stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then(res => res.json())
      .then(data => {
        if (data.reads !== undefined) setStats(data);
      })
      .catch(() => {}); // ignore errors, fall back to default
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ username: displayName })
      });
      if (res.ok) {
        setIsEditing(false);
        // Ideally we would update the user context here, but for simplicity we'll let them refresh or update local state
        const updatedUser = await res.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to update name", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
              {user.role}
            </span>
          </div>
          <p className="text-gray-600 mb-1">{user.email}</p>
          <p className="text-gray-500 text-sm mb-4">
            Member since {user.id > 1000 ? new Date(user.id).toLocaleDateString() : 'Jan 1, 2024'}
          </p>

          {isEditing ? (
            <form onSubmit={handleUpdateName} className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="border p-2 rounded"
                required
              />
              <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
            </form>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-green-600 hover:underline text-sm font-medium">
              Change display name
            </button>
          )}
        </div>

        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border w-full md:w-auto">
          <div className="text-center px-4 border-r border-gray-200">
            <span className="block text-3xl font-bold text-gray-800">{stats.reads}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Articles Read</span>
          </div>
          <div className="text-center px-4">
            <span className="block text-3xl font-bold text-green-600">{stats.saves}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Saved Items</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-bold mb-4">Topics of Interest</h3>
        <p className="text-gray-600 mb-6 text-sm">Select topics to personalize your "For You" feed on the home page.</p>
        <TopicsManager />
      </div>
    </div>
  );
};

export default Profile;
