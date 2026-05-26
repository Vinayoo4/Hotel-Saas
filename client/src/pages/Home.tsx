import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchGuides } from '../api';
import TopicsManager from '../components/TopicsManager';

const Home = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);

  useEffect(() => {
    fetchIssues().then(setIssues).catch(console.error);
    fetchGuides().then(setGuides).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <TopicsManager />
      <section>
        <h2 className="text-2xl font-bold mb-4 text-green-800">Latest Issues</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {issues.map(issue => (
            <div key={issue.id} className="p-4 border rounded shadow bg-white">
              <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
              <p className="text-gray-600 mb-4">{issue.content.substring(0, 100)}...</p>
              <Link to={`/article/issue/${issue.id}`} className="text-green-600 hover:underline">Read More</Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-green-800">Educational Guides</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {guides.map(guide => (
            <div key={guide.id} className="p-4 border rounded shadow bg-white">
              <h3 className="text-xl font-semibold mb-2">{guide.title}</h3>
              <p className="text-gray-600 mb-4">{guide.content.substring(0, 100)}...</p>
              <Link to={`/article/guide/${guide.id}`} className="text-green-600 hover:underline">Read More</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
