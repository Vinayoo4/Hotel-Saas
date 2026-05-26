"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeDB = exports.readDB = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const dbPath = path_1.default.join(__dirname, 'db.json');
const readDB = () => {
    const data = fs_1.default.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
};
exports.readDB = readDB;
const writeDB = (data) => {
    fs_1.default.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
};
exports.writeDB = writeDB;
app.get('/api/issues', (req, res) => {
    const db = (0, exports.readDB)();
    res.json(db.issues);
});
app.post('/api/issues', (req, res) => {
    const db = (0, exports.readDB)();
    const newIssue = { id: Date.now(), ...req.body, date: new Date().toISOString() };
    db.issues.push(newIssue);
    (0, exports.writeDB)(db);
    res.json(newIssue);
});
app.get('/api/guides', (req, res) => {
    const db = (0, exports.readDB)();
    res.json(db.guides);
});
app.post('/api/guides', (req, res) => {
    const db = (0, exports.readDB)();
    const newGuide = { id: Date.now(), ...req.body };
    db.guides.push(newGuide);
    (0, exports.writeDB)(db);
    res.json(newGuide);
});
app.get('/api/users', (req, res) => {
    const db = (0, exports.readDB)();
    res.json(db.users);
});
app.post('/api/users/login', (req, res) => {
    const db = (0, exports.readDB)();
    const { username, email } = req.body;
    const user = db.users.find((u) => u.username === username || u.email === email);
    if (user) {
        res.json(user);
    }
    else {
        res.status(401).json({ error: 'User not found' });
    }
});
app.post('/api/users', (req, res) => {
    const db = (0, exports.readDB)();
    const newUser = { id: Date.now(), ...req.body, role: 'subscriber' };
    db.users.push(newUser);
    (0, exports.writeDB)(db);
    res.json(newUser);
});
app.get('/api/savedItems/:userId', (req, res) => {
    const db = (0, exports.readDB)();
    const userSavedItems = db.savedItems.filter((item) => item.userId === parseInt(req.params.userId, 10));
    res.json(userSavedItems);
});
app.post('/api/savedItems', (req, res) => {
    const db = (0, exports.readDB)();
    const newItem = { id: Date.now(), ...req.body };
    db.savedItems.push(newItem);
    (0, exports.writeDB)(db);
    res.json(newItem);
});
app.post('/api/auditLogs', (req, res) => {
    const db = (0, exports.readDB)();
    const log = { id: Date.now(), ...req.body, date: new Date().toISOString() };
    db.auditLogs.push(log);
    (0, exports.writeDB)(db);
    res.json(log);
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
//# sourceMappingURL=index.js.map