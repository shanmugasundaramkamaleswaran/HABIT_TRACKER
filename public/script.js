document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tracker-container');
    const analysisContainer = document.getElementById('analysis-container');

    // Fetch habits from the backend
    async function fetchHabits() {
        try {
            const response = await fetch('/api/habits');
            const data = await response.json();
            renderTracker(data);
            renderAnalysis(data);
        } catch (error) {
            console.error('Error fetching habits:', error);
            container.innerHTML = '<div class="error">System Offline.</div>';
        }
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
                                onclick="toggleHabit(${habit.id}, ${index}, ${status})"
                            ></button>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Render Analysis Chart (Pro Style)
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

    // Toggle habit status
    window.toggleHabit = async (habitId, dayIndex, currentStatus) => {
        try {
            const response = await fetch('/api/habits/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    habitId,
                    dayIndex,
                    status: !currentStatus
                })
            });

            if (response.ok) {
                fetchHabits(); 
            }
        } catch (error) {
            console.error('Error updating habit:', error);
        }
    };

    fetchHabits();
});
