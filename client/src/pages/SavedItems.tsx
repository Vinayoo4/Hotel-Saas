import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSavedItems } from '../api';

const SavedItems = () => {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (user) {
      fetchSavedItems(user.id).then(setSavedItems).catch(console.error);
    }
  }, [user]);

  if (!user) return <div className="p-4">Please login to view saved items.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Your Saved Articles</h2>
      {savedItems.length === 0 ? (
        <p>No saved articles yet.</p>
      ) : (
        <div className="space-y-4">
          {savedItems.map(item => (
            <div key={item.id} className="p-4 border rounded shadow bg-white flex justify-between items-center">
              <span className="text-xl font-semibold">{item.title}</span>
              <Link
                to={`/article/${item.type}/${item.articleId}`}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Read
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
