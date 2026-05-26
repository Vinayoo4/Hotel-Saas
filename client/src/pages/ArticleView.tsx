import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchIssues, fetchGuides, saveItem, logAuditAction } from '../api';

const ArticleView = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [message, setMessage] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const loadData = async () => {
      if (type === 'issue') {
        const issues = await fetchIssues();
        setArticle(issues.find((i: any) => i.id === parseInt(id || '0', 10)));
      } else if (type === 'guide') {
        const guides = await fetchGuides();
        setArticle(guides.find((g: any) => g.id === parseInt(id || '0', 10)));
      }
    };
    loadData();
  }, [type, id]);

  const handleSave = async () => {
    if (!user) {
      setMessage('Please login to save articles.');
      return;
    }
    try {
      await saveItem(user.id, type!, article.id, article.title);
      await logAuditAction('SAVE_ARTICLE', { userId: user.id, articleType: type, articleId: article.id });
      setMessage('Article saved successfully!');
    } catch (err) {
      setMessage('Failed to save article.');
    }
  };

  if (!article) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      {article.date && <p className="text-gray-500 mb-4">{new Date(article.date).toLocaleDateString()}</p>}
      <div className="prose mb-6">
        {article.content}
      </div>
      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save for Offline Reading
      </button>
      {message && <p className="mt-4 text-green-700">{message}</p>}
    </div>
  );
};

export default ArticleView;
