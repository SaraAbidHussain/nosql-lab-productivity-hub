# Schema Design — Personal Productivity Hub

> Fill in every section below. Keep answers concise.

---

## 1. Collections Overview

Briefly describe each collection (1–2 sentences each):

- **users** — Stores registered user accounts with login credentials. Each user owns projects and notes.
- **projects** — Stores projects that belong to a user. Projects act as containers that group related tasks and notes together.
- **tasks** — Stores individual tasks that belong to a project. Each task embeds its subtasks and tags directly since they are always read together with the task.
- **notes** — Stores text notes that belong to a user. A note can optionally be linked to a project, or exist as a standalone note.

## 2. Document Shapes

For each collection, write the document shape (field name + type + required/optional):

### users
```
{
  _id: ObjectId,
  email: string (required, unique),
  passwordHash: string (required),
  name: string (required),
  createdAt: Date (required)
}
```

### projects
```
{
  _id: ObjectId,
  ownerId: ObjectId (required, → users._id),
  name: string (required),
  description: string (optional),
  archived: boolean (required, default false),
  createdAt: Date (required)
}
```

### tasks
```
{
  _id: ObjectId,
  ownerId: ObjectId (required, → users._id),
  projectId: ObjectId (required, → projects._id),
  title: string (required),
  status: string (required, enum: todo | in-progress | done),
  priority: number (required, 1-5),
  tags: string[] (required, may be empty),
  subtasks: [
    { title: string, done: boolean }
  ] (required, may be empty),
  description: string (optional),         // schema flexibility
  dueDate: Date (optional),               // schema flexibility
  createdAt: Date (required)
}
```

### notes
```
{
  _id: ObjectId,
  ownerId: ObjectId (required, → users._id),
  projectId: ObjectId (optional, → projects._id),
  title: string (required),
  body: string (required),
  tags: string[] (required, may be empty),
  pinned: boolean (optional),             // schema flexibility — only on some
  createdAt: Date (required)
}
```

---

## 3. Embed vs Reference — Decisions

| Relationship                  | Embed or Reference? | Why? |
|-------------------------------|---------------------|------|
| Subtasks inside a task        | **Embed**           | Subtasks are owned exclusively by one task, always read together with it, and never queried independently — one document fetch gets everything. |
| Tags on a task                | **Embed**           | Tags are a simple string array owned by the task; they are small, always read with the task, and need no separate collection. |
| Project → Task ownership      | **Reference**       | A project can have many tasks; storing `projectId` on each task avoids duplicating project data and allows tasks to be queried independently by project. |
| Note → optional Project link  | **Reference**       | A note may or may not belong to a project; storing an optional `projectId` field is cleaner than embedding the whole project, and the note is still useful without it. |

---

## 4. Schema Flexibility Example

Name one field that exists on **some** documents but not **all** in the same collection. Explain why this is acceptable (or even useful) in MongoDB.

> _Your answer here._

> The `dueDate` field exists on some task documents but not all. Tasks that have a deadline include `dueDate: Date`, while tasks with no deadline simply omit the field entirely. In MongoDB this is perfectly acceptable because documents in the same collection do not need identical fields, the application just checks whether the field is present before displaying it, and queries that filter by `dueDate` naturally skip documents where it is absent.