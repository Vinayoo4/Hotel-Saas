import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { fetchSavedItems } from '../api';
import { useAuth } from '../context/AuthContext';

const SavedItems = () => {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'issue' | 'guide'>('issue');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSavedItems(user.id)
        .then(data => {
          setSavedItems(data);
          localStorage.setItem(`saved_items_${user.id}`, JSON.stringify(data));
        })
        .catch(err => {
          console.error('Failed to fetch from API, falling back to cache', err);
          const cached = localStorage.getItem(`saved_items_${user.id}`);
          if (cached) {
            setSavedItems(JSON.parse(cached));
          }
        });
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const handleUnsave = (id: number) => {
    // Mock unsave for UI
    const newItems = savedItems.filter(i => i.id !== id);
    setSavedItems(newItems);
    localStorage.setItem(`saved_items_${user.id}`, JSON.stringify(newItems));
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to remove all saved articles?")) {
      setSavedItems([]);
      localStorage.setItem(`saved_items_${user.id}`, JSON.stringify([]));
    }
  };

  const filteredItems = savedItems.filter(item => item.type === activeTab);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Your Saved Articles</h2>
        {savedItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-800 text-sm font-semibold px-3 py-1 rounded border border-red-200 hover:bg-red-50"
          >
            Clear All Saved
          </button>
        )}
      </div>

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'issue' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('issue')}
        >
          Saved Issues
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'guide' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('guide')}
        >
          Saved Guides
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No saved {activeTab}s yet.</p>
          <Link to="/" className="text-green-600 hover:underline mt-2 inline-block">Explore content</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="p-4 border rounded shadow-sm bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium uppercase tracking-wide">
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    Saved on {new Date(item.id).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleUnsave(item.id)}
                  className="text-gray-500 hover:text-red-600 text-sm font-medium px-3 py-2"
                >
                  Unsave
                </button>
                <Link
                  to={`/article/${item.type}/${item.articleId}`}
                  className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 text-center flex-1 md:flex-none"
                >
                  Read
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
