const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const bcrypt = require("bcrypt");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "productivityhub";

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // Clear existing data
  await db.collection("users").deleteMany({});
  await db.collection("projects").deleteMany({});
  await db.collection("tasks").deleteMany({});
  await db.collection("notes").deleteMany({});

  // --- USERS ---
  const password1 = await bcrypt.hash("password123", 10);
  const password2 = await bcrypt.hash("securepass", 10);

  const alice = new ObjectId();
  const bob   = new ObjectId();

  await db.collection("users").insertMany([
    {
      _id: alice,
      name: "Alice Khan",
      email: "alice@example.com",
      passwordHash: password1,
      createdAt: new Date(),
      theme: "dark",        // schema flexibility: not all users have this
    },
    {
      _id: bob,
      name: "Bob Malik",
      email: "bob@example.com",
      passwordHash: password2,
      createdAt: new Date(),
      // no theme field — demonstrates schema flexibility
    },
  ]);

  // --- PROJECTS ---
  const websiteProject = new ObjectId();
  const mobileProject  = new ObjectId();
  const dataProject    = new ObjectId();
  const blogProject    = new ObjectId();

  await db.collection("projects").insertMany([
    {
      _id: websiteProject,
      ownerId: alice,
      name: "Website Redesign",
      description: "Redesign the company website",
      color: "#4f46e5",
      archived: false,
      createdAt: new Date(),
    },
    {
      _id: mobileProject,
      ownerId: alice,
      name: "Mobile App",
      description: "Build the Android app",
      color: "#10b981",
      archived: false,
      createdAt: new Date(),
    },
    {
      _id: dataProject,
      ownerId: bob,
      name: "Data Pipeline",
      description: "ETL pipeline for analytics",
      color: "#f59e0b",
      archived: false,
      createdAt: new Date(),
    },
    {
      _id: blogProject,
      ownerId: bob,
      name: "Old Blog",
      description: "Archived old blog project",
      color: "#6b7280",
      archived: true,
      createdAt: new Date(),
    },
  ]);

  // --- TASKS ---
  // Every task has ownerId so queries 14 & 15 can $match on it directly
  await db.collection("tasks").insertMany([
    {
      _id: new ObjectId(),
      ownerId: alice,
      projectId: websiteProject,
      title: "Design homepage mockup",
      status: "done",
      priority: 3,
      tags: ["design", "ui"],
      subtasks: [
        { title: "Sketch wireframes",  done: true },
        { title: "Pick color palette", done: true },
      ],
      dueDate: new Date("2025-06-01"),
      createdAt: new Date("2025-05-01"),
    },
    {
      _id: new ObjectId(),
      ownerId: alice,
      projectId: websiteProject,
      title: "Implement navbar",
      status: "in-progress",
      priority: 2,
      tags: ["frontend"],
      subtasks: [
        { title: "Write HTML structure", done: true  },
        { title: "Add responsive CSS",   done: false },
      ],
      dueDate: new Date("2025-06-15"),
      createdAt: new Date("2025-05-10"),
    },
    {
      _id: new ObjectId(),
      ownerId: alice,
      projectId: mobileProject,
      title: "Set up Android project",
      status: "done",
      priority: 3,
      tags: ["android", "setup"],
      subtasks: [
        { title: "Init Gradle config", done: true },
      ],
      // no dueDate — demonstrates schema flexibility
      createdAt: new Date("2025-05-12"),
    },
    {
      _id: new ObjectId(),
      ownerId: bob,
      projectId: dataProject,
      title: "Write ETL script",
      status: "todo",
      priority: 2,
      tags: ["python", "etl"],
      subtasks: [
        { title: "Extract from source DB", done: false },
        { title: "Transform schema",       done: false },
        { title: "Load into warehouse",    done: false },
      ],
      dueDate: new Date("2025-07-01"),
      createdAt: new Date("2025-05-15"),
    },
    {
      _id: new ObjectId(),
      ownerId: alice,
      projectId: mobileProject,
      title: "Design login screen",
      status: "todo",
      priority: 1,
      tags: ["design", "android"],
      subtasks: [
        { title: "Create Figma mockup", done: false },
      ],
      createdAt: new Date("2025-05-20"),
    },
  ]);

  // --- NOTES ---
  // Every note has ownerId so searchNotes can filter by owner
  await db.collection("notes").insertMany([
    {
      _id: new ObjectId(),
      ownerId: alice,
      projectId: websiteProject,
      title: "Brand guidelines",
      content: "Use Inter font. Primary color #4f46e5.",
      tags: ["design", "brand"],
      createdAt: new Date("2025-05-02"),
    },
    {
      _id: new ObjectId(),
      ownerId: alice,
      projectId: mobileProject,
      title: "API endpoints list",
      content: "GET /users, POST /auth/login",
      tags: ["api", "backend"],
      createdAt: new Date("2025-05-11"),
    },
    {
      _id: new ObjectId(),
      ownerId: alice,
      // no projectId — standalone note, demonstrates schema flexibility
      title: "Learning resources",
      content: "MongoDB docs, Node.js best practices",
      tags: ["learning"],
      createdAt: new Date("2025-05-13"),
    },
    {
      _id: new ObjectId(),
      ownerId: bob,
      projectId: dataProject,
      title: "Data sources",
      content: "PostgreSQL prod DB, S3 bucket for CSVs",
      tags: ["etl", "data"],
      createdAt: new Date("2025-05-16"),
    },
    {
      _id: new ObjectId(),
      ownerId: bob,
      // no projectId — standalone note
      title: "Meeting notes",
      content: "Sprint review on Friday.",
      tags: ["meeting"],
      createdAt: new Date("2025-05-18"),
    },
  ]);

  console.log("Database seeded successfully!");
  await client.close();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});