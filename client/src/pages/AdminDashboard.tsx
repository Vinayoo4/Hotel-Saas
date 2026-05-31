import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createIssue, updateIssue, createGuide, updateGuide, logAuditAction, fetchIssues, fetchGuides, fetchTopics, API_URL } from '../api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'issues' | 'guides' | 'subscribers' | 'audit'>('issues');
  const [issues, setIssues] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  // Issue form state
  const [issueId, setIssueId] = useState<number | null>(null);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueContent, setIssueContent] = useState('');
  const [issueSummary, setIssueSummary] = useState('');
  const [issueTopic, setIssueTopic] = useState('');
  const [issueTags, setIssueTags] = useState('');
  const [issueReadTime, setIssueReadTime] = useState(5);
  const [issueFeatured, setIssueFeatured] = useState(false);
  const [issuePublishedAt, setIssuePublishedAt] = useState(new Date().toISOString().split('T')[0]);

  // Guide form state
  const [guideId, setGuideId] = useState<number | null>(null);
  const [guideTitle, setGuideTitle] = useState('');
  const [guideContent, setGuideContent] = useState('');
  const [guideTopic, setGuideTopic] = useState('');
  const [guideTags, setGuideTags] = useState('');
  const [guideReadTime, setGuideReadTime] = useState(5);
  const [guideDifficulty, setGuideDifficulty] = useState('beginner');
  const [guidePublishedAt, setGuidePublishedAt] = useState(new Date().toISOString().split('T')[0]);

  // Audit filter state
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  const loadData = async () => {
    try {
      const [issuesData, guidesData, topicsData] = await Promise.all([fetchIssues(), fetchGuides(), fetchTopics()]);
      setIssues(issuesData);
      setGuides(guidesData);
      setTopics(topicsData);

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      const usersRes = await fetch(`${API_URL}/users`, { headers });
      if (usersRes.ok) setUsers(await usersRes.json());

      const auditRes = await fetch(`${API_URL}/auditLogs`, { headers });
      if (auditRes.ok) setAuditLogs(await auditRes.json());

    } catch (err) {
      console.error("Failed to load admin data", err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const parseTags = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

  const resetIssueForm = () => {
    setIssueId(null); setIssueTitle(''); setIssueContent(''); setIssueSummary(''); setIssueTopic(''); setIssueTags(''); setIssueReadTime(5); setIssueFeatured(false); setIssuePublishedAt(new Date().toISOString().split('T')[0]);
  };

  const resetGuideForm = () => {
    setGuideId(null); setGuideTitle(''); setGuideContent(''); setGuideTopic(''); setGuideTags(''); setGuideReadTime(5); setGuideDifficulty('beginner'); setGuidePublishedAt(new Date().toISOString().split('T')[0]);
  };

  const handleEditIssue = (i: any) => {
    setIssueId(i.id); setIssueTitle(i.title); setIssueContent(i.content); setIssueSummary(i.summary || ''); setIssueTopic(i.topicIds?.[0]?.toString() || ''); setIssueTags(i.tags?.join(', ') || ''); setIssueReadTime(i.readTime || 5); setIssueFeatured(i.featured || false); setIssuePublishedAt(i.publishedAt?.split('T')[0] || new Date().toISOString().split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditGuide = (g: any) => {
    setGuideId(g.id); setGuideTitle(g.title); setGuideContent(g.content); setGuideTopic(g.topicIds?.[0]?.toString() || ''); setGuideTags(g.tags?.join(', ') || ''); setGuideReadTime(g.readTime || 5); setGuideDifficulty(g.difficulty || 'beginner'); setGuidePublishedAt(g.publishedAt?.split('T')[0] || new Date().toISOString().split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { title: issueTitle, content: issueContent, summary: issueSummary, topicIds: issueTopic ? [parseInt(issueTopic)] : [], tags: parseTags(issueTags), readTime: issueReadTime, featured: issueFeatured, publishedAt: new Date(issuePublishedAt).toISOString(), authorName: user.username };
      if (issueId) {
        await updateIssue(issueId, data);
        await logAuditAction('UPDATE_ISSUE', { adminId: user.id, issueId });
        showMessage('Issue updated successfully!');
      } else {
        const issue = await createIssue(data);
        await logAuditAction('PUBLISH_ISSUE', { adminId: user.id, issueId: issue.id });
        showMessage('Issue created successfully!');
      }
      resetIssueForm();
      loadData();
    } catch (err) {
      showMessage('Failed to save issue.');
    }
  };

  const handleSubmitGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { title: guideTitle, content: guideContent, topicIds: guideTopic ? [parseInt(guideTopic)] : [], tags: parseTags(guideTags), readTime: guideReadTime, difficulty: guideDifficulty, publishedAt: new Date(guidePublishedAt).toISOString(), authorName: user.username };
      if (guideId) {
        await updateGuide(guideId, data);
        await logAuditAction('UPDATE_GUIDE', { adminId: user.id, guideId });
        showMessage('Guide updated successfully!');
      } else {
        const guide = await createGuide(data);
        await logAuditAction('PUBLISH_GUIDE', { adminId: user.id, guideId: guide.id });
        showMessage('Guide created successfully!');
      }
      resetGuideForm();
      loadData();
    } catch (err) {
      showMessage('Failed to save guide.');
    }
  };

  const handleDeleteIssue = async (id: number) => {
    if (window.confirm('Delete this issue?')) {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/issues/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      await logAuditAction('DELETE_ISSUE', { adminId: user.id, issueId: id });
      loadData();
      showMessage('Issue deleted');
    }
  };

  const handleDeleteGuide = async (id: number) => {
    if (window.confirm('Delete this guide?')) {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/guides/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      await logAuditAction('DELETE_GUIDE', { adminId: user.id, guideId: id });
      loadData();
      showMessage('Guide deleted');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/users/${userId}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role: newRole }) });
    loadData();
    showMessage(`Role updated to ${newRole}`);
  };

  const filteredAuditLogs = auditFilter === 'ALL' ? auditLogs : auditLogs.filter(log => log.action === auditFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow-sm border text-center"><span className="block text-3xl font-bold text-green-600">{issues.length}</span><span className="text-xs uppercase tracking-wider text-gray-500">Issues</span></div>
        <div className="bg-white p-4 rounded shadow-sm border text-center"><span className="block text-3xl font-bold text-purple-600">{guides.length}</span><span className="text-xs uppercase tracking-wider text-gray-500">Guides</span></div>
        <div className="bg-white p-4 rounded shadow-sm border text-center"><span className="block text-3xl font-bold text-blue-600">{users.length}</span><span className="text-xs uppercase tracking-wider text-gray-500">Subscribers</span></div>
        <div className="bg-white p-4 rounded shadow-sm border text-center"><span className="block text-3xl font-bold text-orange-600">{auditLogs.length}</span><span className="text-xs uppercase tracking-wider text-gray-500">Audit Events</span></div>
      </div>

      {message && <div className="bg-green-100 text-green-800 p-3 rounded font-medium text-center">{message}</div>}

      <div className="flex border-b mb-6">
        {['issues', 'guides', 'subscribers', 'audit'].map(tab => (
          <button key={tab} className={`px-4 py-2 font-medium capitalize ${activeTab === tab ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab(tab as any)}>{tab}</button>
        ))}
      </div>

      {activeTab === 'issues' && (
        <div className="space-y-8">
          <section className="bg-white p-6 rounded shadow-sm border">
            <h2 className="text-xl font-bold mb-4">{issueId ? 'Edit Issue' : 'Create Issue'}</h2>
            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <input className="w-full border p-2 rounded" placeholder="Title" value={issueTitle} onChange={e => setIssueTitle(e.target.value)} required />
              <textarea className="w-full border p-2 rounded" placeholder="Summary excerpt" rows={2} value={issueSummary} onChange={e => setIssueSummary(e.target.value)} required />
              <textarea className="w-full border p-2 rounded" placeholder="Content" rows={5} value={issueContent} onChange={e => setIssueContent(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full border p-2 rounded" value={issueTopic} onChange={e => setIssueTopic(e.target.value)} required>
                  <option value="">Select Topic...</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input className="w-full border p-2 rounded" placeholder="Tags (comma separated)" value={issueTags} onChange={e => setIssueTags(e.target.value)} />
                <input type="number" className="w-full border p-2 rounded" placeholder="Read Time (min)" value={issueReadTime} onChange={e => setIssueReadTime(Number(e.target.value))} required />
                <input type="date" className="w-full border p-2 rounded" value={issuePublishedAt} onChange={e => setIssuePublishedAt(e.target.value)} required />
                <label className="flex items-center gap-2"><input type="checkbox" checked={issueFeatured} onChange={e => setIssueFeatured(e.target.checked)} /> Featured Issue</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium">{issueId ? 'Update Issue' : 'Publish Issue'}</button>
                {issueId && <button type="button" onClick={resetIssueForm} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 font-medium">Cancel</button>}
              </div>
            </form>
          </section>

          <section className="bg-white p-6 rounded shadow-sm border">
            <h2 className="text-xl font-bold mb-4">Manage Issues</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b"><th className="pb-2">Title</th><th className="pb-2">Date</th><th className="pb-2">Featured</th><th className="pb-2 text-right">Actions</th></tr></thead>
                <tbody>
                  {issues.map(i => (
                    <tr key={i.id} className="border-b">
                      <td className="py-2">{i.title}</td>
                      <td className="py-2 text-sm text-gray-500">{new Date(i.publishedAt || i.date).toLocaleDateString()}</td>
                      <td className="py-2 text-sm text-gray-500">{i.featured ? 'Yes' : 'No'}</td>
                      <td className="py-2 text-right">
                        <button onClick={() => handleEditIssue(i)} className="text-blue-600 hover:underline text-sm font-medium mr-3">Edit</button>
                        <button onClick={() => handleDeleteIssue(i.id)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'guides' && (
        <div className="space-y-8">
          <section className="bg-white p-6 rounded shadow-sm border">
            <h2 className="text-xl font-bold mb-4">{guideId ? 'Edit Guide' : 'Create Guide'}</h2>
            <form onSubmit={handleSubmitGuide} className="space-y-4">
              <input className="w-full border p-2 rounded" placeholder="Title" value={guideTitle} onChange={e => setGuideTitle(e.target.value)} required />
              <textarea className="w-full border p-2 rounded" placeholder="Content" rows={5} value={guideContent} onChange={e => setGuideContent(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full border p-2 rounded" value={guideTopic} onChange={e => setGuideTopic(e.target.value)} required>
                  <option value="">Select Topic...</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select className="w-full border p-2 rounded" value={guideDifficulty} onChange={e => setGuideDifficulty(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <input className="w-full border p-2 rounded" placeholder="Tags (comma separated)" value={guideTags} onChange={e => setGuideTags(e.target.value)} />
                <input type="number" className="w-full border p-2 rounded" placeholder="Read Time (min)" value={guideReadTime} onChange={e => setGuideReadTime(Number(e.target.value))} required />
                <input type="date" className="w-full border p-2 rounded" value={guidePublishedAt} onChange={e => setGuidePublishedAt(e.target.value)} required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium">{guideId ? 'Update Guide' : 'Publish Guide'}</button>
                {guideId && <button type="button" onClick={resetGuideForm} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 font-medium">Cancel</button>}
              </div>
            </form>
          </section>

          <section className="bg-white p-6 rounded shadow-sm border">
            <h2 className="text-xl font-bold mb-4">Manage Guides</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b"><th className="pb-2">Title</th><th className="pb-2">Difficulty</th><th className="pb-2 text-right">Actions</th></tr></thead>
                <tbody>
                  {guides.map(g => (
                    <tr key={g.id} className="border-b">
                      <td className="py-2">{g.title}</td>
                      <td className="py-2"><span className="text-xs uppercase px-2 py-1 bg-gray-100 rounded">{g.difficulty}</span></td>
                      <td className="py-2 text-right">
                        <button onClick={() => handleEditGuide(g)} className="text-blue-600 hover:underline text-sm font-medium mr-3">Edit</button>
                        <button onClick={() => handleDeleteGuide(g.id)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'subscribers' && (
        <section className="bg-white p-6 rounded shadow-sm border">
          <h2 className="text-xl font-bold mb-4">Manage Subscribers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b"><th className="pb-2">Email</th><th className="pb-2">Role</th><th className="pb-2">Change Role</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b">
                    <td className="py-3">{u.email}</td>
                    <td className="py-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span></td>
                    <td className="py-3">
                      {u.id !== user.id && (
                        <select className="border rounded px-2 py-1 text-sm bg-white" value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                          <option value="subscriber">Subscriber</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'audit' && (
        <section className="bg-white p-6 rounded shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Audit Log</h2>
            <select className="border rounded p-1" value={auditFilter} onChange={e => setAuditFilter(e.target.value)}>
              <option value="ALL">All Actions</option>
              {Array.from(new Set(auditLogs.map(l => l.action))).map(a => <option key={a as string} value={a as string}>{a as string}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b"><th className="pb-2">Date</th><th className="pb-2">Action</th><th className="pb-2">Details</th></tr></thead>
              <tbody>
                {filteredAuditLogs.slice().reverse().map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 text-gray-500 whitespace-nowrap">{new Date(log.date).toLocaleString()}</td>
                    <td className="py-2 font-medium">{log.action}</td>
                    <td className="py-2 font-mono text-xs text-gray-600">{JSON.stringify(log.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
