import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const readDB = () => {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

export const writeDB = (data: any) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
};

app.get('/api/issues', (req, res) => {
  const db = readDB();
  res.json(db.issues);
});

// Auth middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  authenticateToken(req, res, () => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    next();
  });
};

app.post('/api/issues', requireAdmin, (req, res) => {
  const db = readDB();
  const newIssue = { id: Date.now(), ...req.body, date: new Date().toISOString() };
  db.issues.push(newIssue);
  writeDB(db);
  res.json(newIssue);
});

app.delete('/api/issues/:id', requireAdmin, (req, res) => {
  const db = readDB();
  db.issues = db.issues.filter((i: any) => i.id !== parseInt(req.params.id as string, 10));
  writeDB(db);
  res.json({ success: true });
});

app.patch('/api/issues/:id', requireAdmin, (req, res) => {
  const db = readDB();
  const index = db.issues.findIndex((i: any) => i.id === parseInt(req.params.id as string, 10));
  if (index !== -1) {
    db.issues[index] = { ...db.issues[index], ...req.body };
    writeDB(db);
    res.json(db.issues[index]);
  } else {
    res.status(404).json({ error: 'Issue not found' });
  }
});

app.get('/api/guides', (req, res) => {
  const db = readDB();
  res.json(db.guides);
});

app.post('/api/guides', requireAdmin, (req, res) => {
  const db = readDB();
  const newGuide = { id: Date.now(), ...req.body };
  db.guides.push(newGuide);
  writeDB(db);
  res.json(newGuide);
});

app.delete('/api/guides/:id', requireAdmin, (req, res) => {
  const db = readDB();
  db.guides = db.guides.filter((g: any) => g.id !== parseInt(req.params.id as string, 10));
  writeDB(db);
  res.json({ success: true });
});

app.patch('/api/guides/:id', requireAdmin, (req, res) => {
  const db = readDB();
  const index = db.guides.findIndex((g: any) => g.id === parseInt(req.params.id as string, 10));
  if (index !== -1) {
    db.guides[index] = { ...db.guides[index], ...req.body };
    writeDB(db);
    res.json(db.guides[index]);
  } else {
    res.status(404).json({ error: 'Guide not found' });
  }
});

app.get('/api/topics', (req, res) => {
  const db = readDB();
  res.json(db.topics);
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

app.get('/api/users/:id/stats', authenticateToken, (req, res) => {
  const db = readDB();
  const userId = parseInt(req.params.id as string, 10);
  const userSavedItems = db.savedItems.filter((item: any) => item.userId === userId);
  // Mocking read count
  res.json({ reads: Math.floor(Math.random() * 20), saves: userSavedItems.length });
});

app.patch('/api/users/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === parseInt(req.params.id as string, 10));
  if (userIndex !== -1) {
    db.users[userIndex].username = req.body.username;
    writeDB(db);
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const db = readDB();
  const { username, email, password } = req.body;
  const user = db.users.find((u: any) => u.username === username || u.email === email || u.email === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

app.post('/api/auth/register', async (req, res) => {
  const db = readDB();
  const { username, email, password, role } = req.body;

  if (db.users.find((u: any) => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    username,
    email,
    password: hashedPassword,
    role: role || 'subscriber',
    interestedTopics: []
  };

  db.users.push(newUser);
  writeDB(db);

  const token = jwt.sign({ id: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = newUser;

  res.json({ user: userWithoutPassword, token });
});

app.post('/api/users/login', (req, res) => {
  res.status(410).json({ error: 'Use /api/auth/login instead' });
});

app.post('/api/users', (req, res) => {
  res.status(410).json({ error: 'Use /api/auth/register instead' });
});

app.put('/api/users/:id/topics', authenticateToken, (req, res) => {
  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === parseInt(req.params.id as string, 10));
  if (userIndex !== -1) {
    db.users[userIndex].interestedTopics = req.body.topics || [];
    writeDB(db);
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.patch('/api/users/:id/role', requireAdmin, (req, res) => {
  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === parseInt(req.params.id as string, 10));
  if (userIndex !== -1) {
    db.users[userIndex].role = req.body.role;
    writeDB(db);
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.get('/api/savedItems/:userId', authenticateToken, (req, res) => {
  const db = readDB();
  const userSavedItems = db.savedItems.filter((item: any) => item.userId === parseInt(req.params.userId as string, 10));
  res.json(userSavedItems);
});

app.post('/api/savedItems', authenticateToken, (req, res) => {
  const db = readDB();
  const newItem = { id: Date.now(), ...req.body };
  db.savedItems.push(newItem);
  writeDB(db);
  res.json(newItem);
});

app.get('/api/auditLogs', requireAdmin, (req, res) => {
  const db = readDB();
  res.json(db.auditLogs);
});

app.post('/api/auditLogs', authenticateToken, (req, res) => {
  const db = readDB();
  const log = { id: Date.now(), ...req.body, date: new Date().toISOString() };
  db.auditLogs.push(log);
  writeDB(db);
  res.json(log);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
