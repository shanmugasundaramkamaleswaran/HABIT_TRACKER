const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not defined in environment variables!');
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Habit Schema
const habitSchema = new mongoose.Schema({
    id: Number,
    name: String,
    history: [Boolean]
});

const Habit = mongoose.model('Habit', habitSchema);

// Initial Seed Data (if DB is empty)
const seedHabits = [
    { id: 1, name: "Wake up at 5", history: [true, false, false, false, false, false, false, false] },
    { id: 2, name: "Yoga", history: [true, false, false, false, false, false, false, false] },
    { id: 3, name: "News reading", history: [true, false, false, false, false, false, false, false] },
    { id: 4, name: "Diet", history: [true, false, false, false, false, false, false, false] },
    { id: 5, name: "No Porn", history: [false, false, false, false, false, false, false, false] },
    { id: 6, name: "No Junk Food", history: [false, false, false, false, false, false, false, false] },
    { id: 7, name: "Skill Learning", history: [false, false, false, false, false, false, false, false] },
    { id: 8, name: "Defence Knowledge", history: [false, false, false, false, false, false, false, false] },
    { id: 9, name: "Control My Words", history: [false, false, false, false, false, false, false, false] },
    { id: 10, name: "Phone < 1 Hour", history: [false, false, false, false, false, false, false, false] }
];

async function initDB() {
    const count = await Habit.countDocuments();
    if (count === 0) {
        await Habit.insertMany(seedHabits);
        console.log('Database seeded with initial habits');
    }
}
initDB();

// API Endpoints
app.get('/health', (req, res) => res.send('System Active'));

app.get('/api/habits', async (req, res) => {
    try {
        const habits = await Habit.find().sort({ id: 1 });
        res.json({
            habits: habits,
            days: ["1", "2", "3", "4", "5", "6", "7", "8"]
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

app.post('/api/habits/update', async (req, res) => {
    const { habitId, dayIndex, status } = req.body;
    try {
        const habit = await Habit.findOne({ id: habitId });
        if (habit) {
            habit.history[dayIndex] = status;
            habit.markModified('history'); // Necessary for updating arrays in Mongoose
            await habit.save();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Habit not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update habit' });
    }
});

// Serve index.html for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
