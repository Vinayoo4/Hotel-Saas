import { useEffect, useState } from 'react';
import { fetchTopics, updateUserTopics } from '../api';

const TopicsManager = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [userTopics, setUserTopics] = useState<number[]>([]);
  const [message, setMessage] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchTopics().then(setTopics).catch(console.error);
    if (user && user.interestedTopics) {
      setUserTopics(user.interestedTopics);
    }
  }, []);

  const handleToggle = (topicId: number) => {
    setUserTopics(prev =>
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const updatedUser = await updateUserTopics(user.id, userTopics);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Preferences saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save preferences.');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white p-6 rounded shadow mb-8">
      <h2 className="text-xl font-bold mb-4">Your Interests</h2>
      <div className="flex gap-4 flex-wrap mb-4">
        {topics.map(topic => (
          <label key={topic.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={userTopics.includes(topic.id)}
              onChange={() => handleToggle(topic.id)}
            />
            {topic.name}
          </label>
        ))}
      </div>
      <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Save Preferences
      </button>
      {message && <span className="ml-4 text-green-700">{message}</span>}
    </div>
  );
};

export default TopicsManager;
