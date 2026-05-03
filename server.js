const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions for JSON storage
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Default data if file doesn't exist
            return {
                habits: [],
                days: ["1", "2", "3", "4", "5", "6", "7", "8"]
            };
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading data file:', err);
        return { habits: [], days: ["1", "2", "3", "4", "5", "6", "7", "8"] };
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing data file:', err);
    }
}

// API Endpoints
app.get('/health', (req, res) => res.send('System Active (Local Storage)'));

app.get('/api/habits', (req, res) => {
    const data = readData();
    res.json(data);
});

app.post('/api/habits/update', (req, res) => {
    const { habitId, dayIndex, status } = req.body;
    const data = readData();
    
    const habitIndex = data.habits.findIndex(h => h.id === habitId);
    if (habitIndex !== -1) {
        data.habits[habitIndex].history[dayIndex] = status;
        writeData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Habit not found' });
    }
});

// Serve index.html for any other requests
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
