import React, { useState } from 'react';
import { createIssue, createGuide, logAuditAction } from '../api';

const AdminDashboard = () => {
  const [issueTitle, setIssueTitle] = useState('');
  const [issueContent, setIssueContent] = useState('');
  const [guideTitle, setGuideTitle] = useState('');
  const [guideContent, setGuideContent] = useState('');
  const [message, setMessage] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || user.role !== 'admin') {
    return <div className="p-4 text-red-600">Access Denied. Admins only.</div>;
  }

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const issue = await createIssue(issueTitle, issueContent);
      await logAuditAction('PUBLISH_ISSUE', { adminId: user.id, issueId: issue.id });
      setMessage('Issue created successfully!');
      setIssueTitle('');
      setIssueContent('');
    } catch (err) {
      setMessage('Failed to create issue.');
    }
  };

  const handleCreateGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const guide = await createGuide(guideTitle, guideContent);
      await logAuditAction('PUBLISH_GUIDE', { adminId: user.id, guideId: guide.id });
      setMessage('Guide created successfully!');
      setGuideTitle('');
      setGuideContent('');
    } catch (err) {
      setMessage('Failed to create guide.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {message && <p className="text-green-700 bg-green-100 p-2 rounded">{message}</p>}

      <section className="bg-white p-6 rounded shadow border">
        <h2 className="text-2xl font-bold mb-4">Publish New Issue</h2>
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              className="w-full border p-2 rounded"
              value={issueTitle}
              onChange={e => setIssueTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Content</label>
            <textarea
              className="w-full border p-2 rounded"
              rows={5}
              value={issueContent}
              onChange={e => setIssueContent(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Publish Issue
          </button>
        </form>
      </section>

      <section className="bg-white p-6 rounded shadow border">
        <h2 className="text-2xl font-bold mb-4">Publish New Guide</h2>
        <form onSubmit={handleCreateGuide} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              className="w-full border p-2 rounded"
              value={guideTitle}
              onChange={e => setGuideTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Content</label>
            <textarea
              className="w-full border p-2 rounded"
              rows={5}
              value={guideContent}
              onChange={e => setGuideContent(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Publish Guide
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminDashboard;
