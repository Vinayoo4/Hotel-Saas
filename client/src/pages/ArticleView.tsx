import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchIssues, fetchGuides, saveItem, logAuditAction, fetchTopics, fetchSavedItems } from '../api';
import { useAuth } from '../context/AuthContext';

const ArticleView = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [toc, setToc] = useState<{ id: string, text: string }[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [related, setRelated] = useState<any[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollTop;
      const heightWin = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${(scrollTotal / heightWin) * 100}`;
      setProgress(parseFloat(scroll));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [issues, guides, topicsData] = await Promise.all([
          fetchIssues(),
          fetchGuides(),
          fetchTopics()
        ]);
        setTopics(topicsData);

        let currentArticle: any = null;
        let relatedItems: any[] = [];

        if (type === 'issue') {
          currentArticle = issues.find((i: any) => i.id === parseInt(id || '0', 10));
          if (currentArticle?.topicIds) {
            relatedItems = issues.filter((i: any) => i.id !== currentArticle.id && i.topicIds?.some((tId: number) => currentArticle.topicIds.includes(tId))).slice(0, 2);
          }
        } else if (type === 'guide') {
          currentArticle = guides.find((g: any) => g.id === parseInt(id || '0', 10));
          if (currentArticle?.topicIds) {
            relatedItems = guides.filter((g: any) => g.id !== currentArticle.id && g.topicIds?.some((tId: number) => currentArticle.topicIds.includes(tId))).slice(0, 2);
          }
        }

        setArticle(currentArticle);
        setRelated(relatedItems);

        if (currentArticle && currentArticle.content) {
          const headings = [...currentArticle.content.matchAll(/^##\s+(.*)$/gm)];
          setToc(headings.map((h, i) => ({ id: `heading-${i}`, text: h[1] })));
        }

        if (user) {
          try {
            const savedItems = await fetchSavedItems(user.id);
            const saved = savedItems.some((item: any) => item.articleId === currentArticle?.id && item.type === type);
            setIsSaved(saved);
          } catch (e) {
             // fallback to local storage
             const localSaved = JSON.parse(localStorage.getItem(`saved_items_${user.id}`) || '[]');
             setIsSaved(localSaved.some((item: any) => item.articleId === currentArticle?.id && item.type === type));
          }
        }
      } catch (err) {
        console.error("Failed to load article data");
      }
    };
    loadData();
  }, [type, id, user]);

  const handleSaveToggle = async () => {
    if (!user) {
      setMessage('Please login to save articles.');
      return;
    }
    try {
      if (isSaved) {
         // Mock unsave for now, ideally call DELETE /api/savedItems/:id
         setMessage('Unsave feature coming soon!');
      } else {
        await saveItem(user.id, type!, article.id, article.title);
        await logAuditAction('SAVE_ARTICLE', { userId: user.id, articleType: type, articleId: article.id });
        setIsSaved(true);
        setMessage('Article saved successfully!');

        // Update local cache
        const localSaved = JSON.parse(localStorage.getItem(`saved_items_${user.id}`) || '[]');
        localSaved.push({ id: Date.now(), userId: user.id, type, articleId: article.id, title: article.title });
        localStorage.setItem(`saved_items_${user.id}`, JSON.stringify(localSaved));
      }
    } catch (err) {
      setMessage('Failed to save article.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setMessage('Link copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  const getTopicName = (topicId: number) => {
    const t = topics.find(t => t.id === topicId);
    return t ? t.name : '';
  };

  const renderContentWithIds = (content: string) => {
    let headingIndex = 0;
    const parts = content.split(/(^##\s+.*$)/m);
    return parts.map((part, index) => {
      if (part.startsWith('## ')) {
        const id = `heading-${headingIndex++}`;
        return <h2 key={index} id={id} className="text-2xl font-bold mt-8 mb-4">{part.replace('## ', '')}</h2>;
      }
      return <p key={index} className="mb-4 text-gray-700 leading-relaxed whitespace-pre-wrap">{part}</p>;
    });
  };

  if (!article) return <div className="p-8 text-center">Loading article...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div className="h-full bg-green-600" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="mb-6 mt-4 flex justify-between items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-green-600 flex items-center gap-1">
          <span>&larr;</span> Back to Home
        </Link>
        {isOffline && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">Offline (Cached)</span>}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-white p-6 md:p-10 rounded-lg shadow-sm border">
          <div className="flex flex-wrap gap-2 mb-4">
             {article.topicIds?.map((tId: number) => (
                <span key={tId} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium uppercase tracking-wide">
                  {getTopicName(tId)}
                </span>
             ))}
             {type === 'guide' && article.difficulty && (
                <span className={`text-xs px-2 py-1 rounded font-medium uppercase tracking-wide ${article.difficulty === 'beginner' ? 'bg-blue-100 text-blue-800' : article.difficulty === 'advanced' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {article.difficulty}
                </span>
             )}
          </div>

          <h1 className="text-4xl font-bold mb-4 text-gray-900">{article.title}</h1>

          <div className="flex items-center text-gray-500 text-sm mb-8 pb-6 border-b">
            {article.authorName && <span className="mr-4">By <span className="font-semibold text-gray-700">{article.authorName}</span></span>}
            <span className="mr-4">{new Date(article.publishedAt || article.date).toLocaleDateString()}</span>
            <span>{article.readTime} min read</span>
          </div>

          <div className="prose max-w-none">
            {renderContentWithIds(article.content)}
          </div>
        </div>

        <div className="w-full md:w-64 shrink-0">
          <div className="sticky top-6 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
               <h3 className="font-bold text-gray-800 mb-4">Actions</h3>
               <div className="space-y-3">
                 <button
                  onClick={handleSaveToggle}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors ${isSaved ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
                 >
                   {isSaved ? '★ Saved' : '☆ Save for Offline'}
                 </button>
                 <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                 >
                   Share Link
                 </button>
                 {message && <p className="text-center text-sm font-medium text-green-600 mt-2">{message}</p>}
               </div>
            </div>

            {toc.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border hidden md:block">
                <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Table of Contents</h3>
                <ul className="space-y-2 text-sm">
                  {toc.map(item => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="text-gray-600 hover:text-green-600">{item.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Related Content</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {related.map(item => (
              <div key={item.id} className="p-4 border rounded shadow-sm bg-white flex flex-col hover:shadow-md transition-shadow">
                <div className="mb-2">
                  {item.topicIds?.map((tId: number) => (
                    <span key={tId} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mr-1">
                      {getTopicName(tId)}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <Link to={`/article/${type}/${item.id}`} className="text-green-600 hover:underline text-sm font-medium mt-auto pt-2">
                  Read more &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleView;
