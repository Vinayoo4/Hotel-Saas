export const API_URL = 'http://localhost:3001/api';

export const fetchIssues = async () => {
  const res = await fetch(`${API_URL}/issues`);
  return res.json();
};

export const fetchGuides = async () => {
  const res = await fetch(`${API_URL}/guides`);
  return res.json();
};

export const fetchSavedItems = async (userId: number) => {
  const res = await fetch(`${API_URL}/savedItems/${userId}`);
  return res.json();
};

export const saveItem = async (userId: number, type: string, articleId: number, title: string) => {
  const res = await fetch(`${API_URL}/savedItems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, type, articleId, title }),
  });
  return res.json();
};

export const fetchTopics = async () => {
  const res = await fetch(`${API_URL}/topics`);
  return res.json();
};

export const updateUserTopics = async (userId: number, topics: number[]) => {
  const res = await fetch(`${API_URL}/users/${userId}/topics`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topics }),
  });
  return res.json();
};

export const logAuditAction = async (action: string, details: any) => {
  const res = await fetch(`${API_URL}/auditLogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, details }),
  });
  return res.json();
};

export const loginUser = async (username: string) => {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email: username }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
};

export const registerUser = async (username: string, email: string) => {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email }),
  });
  return res.json();
};

export const createIssue = async (title: string, content: string) => {
  const res = await fetch(`${API_URL}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, published: true }),
  });
  return res.json();
};

export const createGuide = async (title: string, content: string) => {
  const res = await fetch(`${API_URL}/guides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, topicIds: [] }),
  });
  return res.json();
};
