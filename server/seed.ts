import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const dbPath = path.join(__dirname, 'db.json');

const seedData = async () => {
  const adminPassword = await bcrypt.hash('adminpass', 10);
  const subPassword = await bcrypt.hash('subpass', 10);

  const data = {
    users: [
      {
        id: 1,
        email: "admin@ecowise.com",
        username: "admin",
        password: adminPassword,
        role: "admin",
        interestedTopics: []
      },
      {
        id: 2,
        email: "reader@ecowise.com",
        username: "subscriber",
        password: subPassword,
        role: "subscriber",
        interestedTopics: [1, 2]
      }
    ],
    topics: [
      { id: 1, name: "Green Bonds" },
      { id: 2, name: "ESG" },
      { id: 3, name: "Solar" },
      { id: 4, name: "Carbon Credits" },
      { id: 5, name: "Impact Investing" },
      { id: 6, name: "Circular Economy" },
      { id: 7, name: "Water" },
      { id: 8, name: "Biodiversity" }
    ],
    issues: [
      {
        id: 1, title: "Issue #1: Intro to Green Bonds", content: "Green bonds are a great way to fund projects that have positive environmental benefits...".repeat(10),
        topicIds: [1], publishedAt: "2024-01-01T12:00:00Z", authorName: "Admin", readTime: 5, featured: true, tags: ["Bonds", "Green"]
      },
      {
        id: 2, title: "Issue #2: ESG Scoring", content: "ESG scoring helps evaluate a company's collective conscientiousness...".repeat(10),
        topicIds: [2], publishedAt: "2024-01-15T12:00:00Z", authorName: "Admin", readTime: 4, featured: false, tags: ["ESG", "Scoring"]
      },
      {
        id: 3, title: "Issue #3: Solar Energy Trends", content: "Solar energy is rapidly becoming the cheapest form of electricity...".repeat(10),
        topicIds: [3], publishedAt: "2024-02-01T12:00:00Z", authorName: "Admin", readTime: 6, featured: false, tags: ["Solar", "Renewable"]
      },
      {
        id: 4, title: "Issue #4: Carbon Markets", content: "Carbon markets aim to reduce greenhouse gas emissions by setting limits...".repeat(10),
        topicIds: [4], publishedAt: "2024-02-15T12:00:00Z", authorName: "Admin", readTime: 7, featured: false, tags: ["Carbon", "Markets"]
      },
      {
        id: 5, title: "Issue #5: Impact Investing", content: "Impact investing refers to investments made with the intention to generate...".repeat(10),
        topicIds: [5], publishedAt: "2024-03-01T12:00:00Z", authorName: "Admin", readTime: 5, featured: false, tags: ["Impact", "Investing"]
      },
      {
        id: 6, title: "Issue #6: Circular Economy", content: "A circular economy is an economic system aimed at eliminating waste...".repeat(10),
        topicIds: [6], publishedAt: "2024-03-15T12:00:00Z", authorName: "Admin", readTime: 6, featured: false, tags: ["Circular", "Economy"]
      }
    ],
    guides: [
      {
        id: 1, title: "Beginner's Guide to Green Bonds", content: "## Introduction\nGreen bonds are fixed-income instruments...".repeat(10),
        topicIds: [1], difficulty: "beginner", readTime: 8, publishedAt: "2024-01-05T12:00:00Z", authorName: "Admin", tags: ["Bonds"]
      },
      {
        id: 2, title: "Understanding ESG Metrics", content: "## Metrics\nESG metrics are vital for assessing...".repeat(10),
        topicIds: [2], difficulty: "intermediate", readTime: 10, publishedAt: "2024-01-20T12:00:00Z", authorName: "Admin", tags: ["ESG"]
      },
      {
        id: 3, title: "Investing in Solar Startups", content: "## Startups\nSolar startups present unique opportunities...".repeat(10),
        topicIds: [3], difficulty: "advanced", readTime: 12, publishedAt: "2024-02-05T12:00:00Z", authorName: "Admin", tags: ["Solar"]
      },
      {
        id: 4, title: "How Carbon Credits Work", content: "## Credits\nA carbon credit represents...".repeat(10),
        topicIds: [4], difficulty: "intermediate", readTime: 9, publishedAt: "2024-02-20T12:00:00Z", authorName: "Admin", tags: ["Carbon"]
      },
      {
        id: 5, title: "Impact Measurement", content: "## Measurement\nMeasuring impact is crucial...".repeat(10),
        topicIds: [5], difficulty: "advanced", readTime: 15, publishedAt: "2024-03-05T12:00:00Z", authorName: "Admin", tags: ["Impact"]
      },
      {
        id: 6, title: "Circular Business Models", content: "## Models\nBusinesses are adopting circular models...".repeat(10),
        topicIds: [6], difficulty: "beginner", readTime: 7, publishedAt: "2024-03-20T12:00:00Z", authorName: "Admin", tags: ["Circular"]
      }
    ],
    savedItems: [
      { id: 1, userId: 2, type: "issue", articleId: 1, title: "Issue #1: Intro to Green Bonds" },
      { id: 2, userId: 2, type: "guide", articleId: 1, title: "Beginner's Guide to Green Bonds" },
      { id: 3, userId: 2, type: "issue", articleId: 2, title: "Issue #2: ESG Scoring" }
    ],
    auditLogs: [
      { id: 1, action: "USER_REGISTER", details: { userId: 1 }, date: "2024-01-01T10:00:00Z" },
      { id: 2, action: "USER_REGISTER", details: { userId: 2 }, date: "2024-01-01T10:05:00Z" },
      { id: 3, action: "PUBLISH_ISSUE", details: { issueId: 1 }, date: "2024-01-01T12:00:00Z" },
      { id: 4, action: "PUBLISH_GUIDE", details: { guideId: 1 }, date: "2024-01-05T12:00:00Z" },
      { id: 5, action: "SAVE_ARTICLE", details: { userId: 2, articleId: 1 }, date: "2024-01-06T15:00:00Z" }
    ]
  };

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  console.log("Database seeded successfully.");
};

seedData().catch(console.error);
