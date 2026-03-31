import { db, isConfigured } from './firebase.js';
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const ewasteCount = document.getElementById('ewaste-count');
const drywasteCount = document.getElementById('drywaste-count');
const wetwasteCount = document.getElementById('wetwaste-count');

function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

if (isConfigured) {
    const todayDocName = getTodayDateString();
    const todayStatsRef = doc(db, 'segregatorStats', todayDocName);

    onSnapshot(todayStatsRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if(ewasteCount) ewasteCount.textContent = data.eWaste || 0;
            if(drywasteCount) drywasteCount.textContent = data.dryWaste || 0;
            if(wetwasteCount) wetwasteCount.textContent = data.wetWaste || 0;
        } else {
            if(ewasteCount) ewasteCount.textContent = 0;
            if(drywasteCount) drywasteCount.textContent = 0;
            if(wetwasteCount) wetwasteCount.textContent = 0;
        }
    });
} else {
    console.warn("Using mock segregator data because Firebase API keys are not supplied yet.");
}

async function renderChart() {
    const canvas = document.getElementById('wasteChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Mocking 7 days data to show chart works visually as originally designed
    // A future implementation could fetch from the last 7 docs in segregatorStats
    const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const data = [120, 180, 150, 220, 190, 240, 160];

    const gradient = ctx.createLinearGradient(0, 400, 0, 0);
    gradient.addColorStop(0, '#89F7FE');
    gradient.addColorStop(1, '#66A6FF');

    // Chart.js is loaded from CDN in stats.html
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Volume of items',
                data: data,
                backgroundColor: gradient,
                borderRadius: 20,
                barPercentage: 0.5,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    display: false,
                    beginAtZero: true
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            family: 'JetBrains Mono',
                            size: 12
                        },
                        color: '#A0AEC0'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#2D3748',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { family: 'Plus Jakarta Sans', size: 14 },
                    bodyFont: { family: 'JetBrains Mono', size: 14 }
                }
            }
        }
    });
}

// Render the graphical chart upon load
window.addEventListener('DOMContentLoaded', renderChart);