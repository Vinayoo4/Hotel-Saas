export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const saveItem = async (userId: number, type: string, articleId: number, title: string) => {
  try {
    const res = await fetch(`${API_URL}/savedItems`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, type, articleId, title }),
    });
    return await res.json();
  } catch (err) {
    // If offline, just return success (cache is handled in ArticleView)
    if (!navigator.onLine) {
      return { id: Date.now(), userId, type, articleId, title };
    }
    throw err;
  }
};

export const fetchTopics = async () => {
  const res = await fetch(`${API_URL}/topics`);
  return res.json();
};

export const updateUserTopics = async (userId: number, topics: number[]) => {
  const res = await fetch(`${API_URL}/users/${userId}/topics`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ topics }),
  });
  return res.json();
};

export const logAuditAction = async (action: string, details: any) => {
  const res = await fetch(`${API_URL}/auditLogs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, details }),
  });
  return res.json();
};

export const loginUser = async (username: string, password?: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email: username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
};

export const registerUser = async (username: string, email: string, password?: string) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) throw new Error('Register failed');
  return res.json();
};

export const createIssue = async (data: any) => {
  const res = await fetch(`${API_URL}/issues`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateIssue = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/issues/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const createGuide = async (data: any) => {
  const res = await fetch(`${API_URL}/guides`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateGuide = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/guides/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};
