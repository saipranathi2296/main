/*const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schemas
const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  task: { type: String, required: true },
  date: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const JournalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true },
  feeling: { type: String, default: 'Good' },
  productivity: { type: Number, default: 5, min: 1, max: 10 },
  studyHours: { type: Number, default: 0, min: 0 },
  text: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', TaskSchema);
const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);

// Middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Routes
router.get('/tasks/:date', requireAuth, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.session.user._id,
      date: req.params.date
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/tasks', requireAuth, async (req, res) => {
  try {
    const task = new Task({
      userId: req.session.user._id,
      ...req.body
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/tasks/:id', requireAuth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.user._id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/tasks/:id', requireAuth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.user._id
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.get('/journal/:date', requireAuth, async (req, res) => {
  try {
    let entry = await JournalEntry.findOne({
      userId: req.session.user._id,
      date: req.params.date
    });
    
    if (!entry) {
      entry = {
        feeling: 'Good',
        productivity: 5,
        studyHours: 0,
        text: ''
      };
    }
    
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal' });
  }
});

router.post('/journal', requireAuth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndUpdate(
      { userId: req.session.user._id, date: req.body.date },
      { ...req.body, updatedAt: Date.now() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save journal' });
  }
});

module.exports = router;
*/// server.jsconst express = require("express");
const mongoose = require("mongoose");
const express=require('express');
const router = express.Router();

// =========================
// Schemas & Models
// =========================
const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  task: { type: String, required: true },
  date: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const JournalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true },
  feeling: { type: String, default: "Good" },
  productivity: { type: Number, default: 5, min: 1, max: 10 },
  studyHours: { type: Number, default: 0, min: 0 },
  text: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

const StreakSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  streakCount: { type: Number, default: 0 },
  lastUpdated: { type: String, required: true },
});

const Task = mongoose.model("Task", TaskSchema);
const Journal = mongoose.model("Journal", JournalEntrySchema);
const Streak = mongoose.model("Streak", StreakSchema);

// =========================
// Middleware
// =========================
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// =========================
// Task Routes
// =========================
router.get("/tasks/:date", requireAuth, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.session.user._id,
      date: req.params.date,
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/tasks", requireAuth, async (req, res) => {
  try {
    const { task, date } = req.body;
    const newTask = await Task.create({
      userId: req.session.user._id,
      task,
      date,
    });
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.put("/tasks/:id/complete", requireAuth, async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to complete task" });
  }
});

router.delete("/tasks/:id", requireAuth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// =========================
// Journal Routes
// =========================
router.get("/journal/:date", requireAuth, async (req, res) => {
  try {
    const entry = await Journal.findOne({
      userId: req.session.user._id,
      date: req.params.date,
    });
    res.json(entry || {
      feeling: "Good",
      productivity: 5,
      studyHours: 0,
      text: "",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch journal entry" });
  }
});

router.post("/journal", requireAuth, async (req, res) => {
  try {
    const { date, feeling, productivity, studyHours, text } = req.body;

    const entry = await Journal.findOneAndUpdate(
      { userId: req.session.user._id, date },
      {
        feeling,
        productivity,
        studyHours,
        text,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: "Failed to save journal entry" });
  }
});

// =========================
// Streak Route
// =========================
router.get("/streak", requireAuth, async (req, res) => {
  try {
    const streak = await Streak.findOne({ userId: req.session.user._id }) || {
      streakCount: 0,
    };
    res.json({ streak: streak.streakCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch streak" });
  }
});

module.exports = router;
