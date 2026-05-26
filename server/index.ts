import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

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

app.post('/api/issues', (req, res) => {
  const db = readDB();
  const newIssue = { id: Date.now(), ...req.body, date: new Date().toISOString() };
  db.issues.push(newIssue);
  writeDB(db);
  res.json(newIssue);
});

app.get('/api/guides', (req, res) => {
  const db = readDB();
  res.json(db.guides);
});

app.post('/api/guides', (req, res) => {
  const db = readDB();
  const newGuide = { id: Date.now(), ...req.body };
  db.guides.push(newGuide);
  writeDB(db);
  res.json(newGuide);
});

app.get('/api/topics', (req, res) => {
  const db = readDB();
  res.json(db.topics);
});

app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

app.post('/api/users/login', (req, res) => {
  const db = readDB();
  const { username, email } = req.body;
  const user = db.users.find((u: any) => u.username === username || u.email === email);
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'User not found' });
  }
});

app.post('/api/users', (req, res) => {
  const db = readDB();
  const newUser = { id: Date.now(), ...req.body, role: 'subscriber', interestedTopics: [] };
  db.users.push(newUser);
  writeDB(db);
  res.json(newUser);
});

app.put('/api/users/:id/topics', (req, res) => {
  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === parseInt(req.params.id, 10));
  if (userIndex !== -1) {
    db.users[userIndex].interestedTopics = req.body.topics || [];
    writeDB(db);
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.get('/api/savedItems/:userId', (req, res) => {
  const db = readDB();
  const userSavedItems = db.savedItems.filter((item: any) => item.userId === parseInt(req.params.userId, 10));
  res.json(userSavedItems);
});

app.post('/api/savedItems', (req, res) => {
  const db = readDB();
  const newItem = { id: Date.now(), ...req.body };
  db.savedItems.push(newItem);
  writeDB(db);
  res.json(newItem);
});

app.post('/api/auditLogs', (req, res) => {
  const db = readDB();
  const log = { id: Date.now(), ...req.body, date: new Date().toISOString() };
  db.auditLogs.push(log);
  writeDB(db);
  res.json(log);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
