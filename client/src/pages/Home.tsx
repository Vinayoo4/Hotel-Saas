import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchGuides, fetchTopics } from '../api';
import TopicsManager from '../components/TopicsManager';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<number | null>(null);

  const { user } = useAuth();

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [issuesData, guidesData, topicsData] = await Promise.all([
        fetchIssues(),
        fetchGuides(),
        fetchTopics()
      ]);
      setIssues(issuesData);
      setGuides(guidesData);
      setTopics(topicsData);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTopicName = (topicId: number) => {
    const t = topics.find(t => t.id === topicId);
    return t ? t.name : '';
  };

  const filterContent = (items: any[]) => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = selectedTopicFilter ? item.topicIds?.includes(selectedTopicFilter) : true;
      return matchesSearch && matchesTopic;
    });
  };

  const filteredIssues = filterContent(issues);
  const filteredGuides = filterContent(guides);
  const featuredIssue = issues.find(i => i.featured) || issues[0];

  const forYouIssues = user?.interestedTopics?.length
    ? issues.filter(i => i.topicIds?.some((id: number) => user.interestedTopics?.includes(id)))
    : [];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-white rounded shadow">
        <h2 className="text-2xl text-red-600 mb-4">Connection Error</h2>
        <p className="mb-4">Unable to reach the server.</p>
        <button onClick={loadData} className="bg-green-600 text-white px-4 py-2 rounded">
          Load cached content
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-green-800 text-white rounded-lg p-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-2">EcoWise Wealth Digest</h1>
        <p className="text-xl mb-6 text-green-100">Your hub for sustainable investing education.</p>
        {featuredIssue && (
          <div className="bg-white text-gray-900 p-6 rounded-lg max-w-2xl">
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide">Featured</span>
            <h2 className="text-2xl font-bold mt-2 mb-2">{featuredIssue.title}</h2>
            <p className="text-gray-600 mb-4">{featuredIssue.content.substring(0, 150)}...</p>
            <Link to={`/article/issue/${featuredIssue.id}`} className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Read Issue</Link>
          </div>
        )}
      </section>

      {/* Filters and Search */}
      <section className="bg-white p-4 rounded shadow mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search articles..."
          className="w-full md:w-1/3 border p-2 rounded"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTopicFilter(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${!selectedTopicFilter ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All Topics
          </button>
          {topics.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTopicFilter(t.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTopicFilter === t.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </section>

      {/* For You Section */}
      {user && forYouIssues.length > 0 && !searchQuery && !selectedTopicFilter && (
        <section className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h2 className="text-2xl font-bold mb-4 text-green-800">For You</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forYouIssues.slice(0, 3).map(issue => (
              <div key={issue.id} className="p-4 border rounded shadow-sm bg-white flex flex-col">
                <div className="mb-2">
                  {issue.topicIds?.map((tId: number) => (
                    <span key={tId} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1">
                      {getTopicName(tId)}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">{issue.content.substring(0, 100)}...</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
                  <span>{issue.readTime} min read</span>
                  <Link to={`/article/issue/${issue.id}`} className="text-green-600 font-medium hover:underline">Read Issue</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Issues Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Latest Issues</h2>
        {filteredIssues.length === 0 ? <p className="text-gray-500">No issues found.</p> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIssues.map(issue => (
              <div key={issue.id} className="p-5 border rounded shadow-sm bg-white flex flex-col hover:shadow-md transition-shadow">
                <div className="mb-2">
                  {issue.topicIds?.map((tId: number) => (
                    <span key={tId} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1">
                      {getTopicName(tId)}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{issue.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{issue.content}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-auto border-t pt-3">
                  <span>{new Date(issue.publishedAt || issue.date).toLocaleDateString()} • {issue.readTime} min read</span>
                  <Link to={`/article/issue/${issue.id}`} className="text-green-600 font-semibold hover:text-green-800 uppercase tracking-wide">Read</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Guides Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Investment Guides</h2>
        {filteredGuides.length === 0 ? <p className="text-gray-500">No guides found.</p> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGuides.map(guide => (
              <div key={guide.id} className="p-5 border rounded shadow-sm bg-white flex flex-col hover:shadow-md transition-shadow border-l-4 border-l-green-600">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${guide.difficulty === 'beginner' ? 'bg-blue-100 text-blue-800' : guide.difficulty === 'advanced' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {guide.difficulty || 'intermediate'}
                  </span>
                  {guide.topicIds?.map((tId: number) => (
                    <span key={tId} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      {getTopicName(tId)}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold mb-2">{guide.title}</h3>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-3">
                  <span>{guide.readTime} min read</span>
                  <Link to={`/article/guide/${guide.id}`} className="text-green-600 font-semibold hover:underline">Read Guide</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {user && <TopicsManager />}
    </div>
  );
};

export default Home;
