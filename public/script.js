document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tracker-container');
    const analysisContainer = document.getElementById('analysis-container');

    const DEFAULT_HABITS = [
        { id: 1, name: "Wake up at 5", history: [false, false, false, false, false, false, false, false] },
        { id: 2, name: "Yoga", history: [false, false, false, false, false, false, false, false] },
        { id: 3, name: "News reading", history: [false, false, false, false, false, false, false, false] },
        { id: 4, name: "Diet", history: [false, false, false, false, false, false, false, false] },
        { id: 5, name: "No Porn", history: [false, false, false, false, false, false, false, false] },
        { id: 6, name: "No Junk Food", history: [false, false, false, false, false, false, false, false] },
        { id: 7, name: "Skill Learning", history: [false, false, false, false, false, false, false, false] },
        { id: 8, name: "Defence Knowledge", history: [false, false, false, false, false, false, false, false] },
        { id: 9, name: "Control My Words", history: [false, false, false, false, false, false, false, false] },
        { id: 10, name: "Phone < 1 Hour", history: [false, false, false, false, false, false, false, false] }
    ];

    const DAYS = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const STORAGE_KEY = 'habit_tracker_data';

    // Load from localStorage or use defaults
    function loadData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return { 
            habits: JSON.parse(JSON.stringify(DEFAULT_HABITS)), 
            days: DAYS,
            notes: "" 
        };
    }

    // Save to localStorage
    function saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // Render the habit tracker grid
    function renderTracker(data) {
        let html = `
            <div class="habit-header">
                <div>CORE DISCIPLINE</div>
                ${data.days.map(day => `<div class="day-cell">D${day}</div>`).join('')}
            </div>
        `;

        data.habits.forEach(habit => {
            html += `
                <div class="habit-row">
                    <div class="habit-name">${habit.name}</div>
                    ${habit.history.map((status, index) => `
                        <div class="day-cell">
                            <button 
                                class="status-btn ${status ? 'checked' : 'unchecked'}" 
                                onclick="toggleHabit(${habit.id}, ${index})"
                            ></button>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Render Analysis Chart
    function renderAnalysis(data) {
        let totalCells = 0;
        let checkedCells = 0;

        data.habits.forEach(habit => {
            habit.history.forEach(status => {
                totalCells++;
                if (status) checkedCells++;
            });
        });

        const percentage = totalCells > 0 ? Math.round((checkedCells / totalCells) * 100) : 0;

        analysisContainer.innerHTML = `
            <div class="chart-container">
                <svg viewBox="0 0 36 36" class="circular-chart">
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:var(--saffron);stop-opacity:1" />
                            <stop offset="50%" style="stop-color:var(--blue);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:var(--green);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path class="circle-bg"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path class="circle"
                        stroke-dasharray="${percentage}, 100"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" class="percentage">${percentage}%</text>
                </svg>
            </div>
            <div class="chart-label">Performance Efficiency</div>
        `;
    }

    function render() {
        const data = loadData();
        renderTracker(data);
        renderAnalysis(data);
        
        // Sync notes box
        const notesBox = document.getElementById('notes-box');
        if (notesBox) {
            notesBox.value = data.notes || "";
        }
    }

    // Toggle habit status — pure localStorage, no server needed
    window.toggleHabit = (habitId, dayIndex) => {
        const data = loadData();
        const habit = data.habits.find(h => h.id === habitId);
        if (habit) {
            habit.history[dayIndex] = !habit.history[dayIndex];
            saveData(data);
            render();
        }
    };

    // Save notes to localStorage
    window.saveNotes = () => {
        const notesBox = document.getElementById('notes-box');
        const data = loadData();
        data.notes = notesBox.value;
        saveData(data);
    };

    // Reset all data
    window.resetAll = () => {
        if (confirm("Are you sure you want to clear all progress and notes? This action cannot be undone.")) {
            localStorage.removeItem(STORAGE_KEY);
            render();
        }
    };

    render();
});
