import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore, collection, getDocs, query, where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCeX1P32dBLxF038NTZZAM-j4XMhij-HPw",
    authDomain: "sales-tracker-9c535.firebaseapp.com",
    projectId: "sales-tracker-9c535",
    storageBucket: "sales-tracker-9c535.firebasestorage.app",
    messagingSenderId: "829925343272",
    appId: "1:829925343272:web:6db6cc055f2e9f684eb51d",
    measurementId: "G-P1SSFVYDYJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility – strip Firebase timestamp → JS date
function toDate(entry) {
    return entry.timestamp ? entry.timestamp.toDate() : null;
}

// Get all leads
async function fetchLeads() {
    const snap = await getDocs(collection(db, "leads"));
    return snap.docs.map(d => ({ id: d.id, ...d.data(), date: toDate(d.data()) }));
}

// Get current filters
function todayMatch(date) {
    const d = new Date();
    return date.toDateString() === d.toDateString();
}

function weekMatch(date) {
    const now = new Date();
    const diff = now - date;
    return diff <= 7 * 24 * 60 * 60 * 1000;
}

function monthMatch(date) {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

// Main update function
async function updateDashboard() {
    const leads = await fetchLeads();

    let dailyP = 0, dailyB = 0;
    let weeklyP = 0, weeklyB = 0;
    let mtdP = 0, mtdB = 0;

    const repStats = {
        Carl: { p:0, b:0 },
        Luca: { p:0, b:0 },
        Camila: { p:0, b:0 },
        Jonathan: { p:0, b:0 },
        Edward: { p:0, b:0 },
        Greg: { p:0, b:0 },
        Martin: { p:0, b:0 },
        Brandon: { p:0, b:0 }
    };

    // Process each lead
    for (let entry of leads) {
        if (!entry.date) continue;
        const d = entry.date;
        const pitched = true;
        const bought = entry.outcome === "Bought";
        const rep = entry.rep;

        // DAILY
        if (todayMatch(d)) {
            dailyP++;
            if (bought) dailyB++;
        }

        // WEEKLY
        if (weekMatch(d)) {
            weeklyP++;
            if (bought) weeklyB++;
        }

        // MONTHLY
        if (monthMatch(d)) {
            mtdP++;
            if (bought) mtdB++;
        }

        // REP STATS (all-time)
        if (repStats[rep]) {
            repStats[rep].p++;
            if (bought) repStats[rep].b++;
        }
    }

    // Update KPI cards
    document.getElementById("dailyPitches").innerText = dailyP;
    document.getElementById("dailyBought").innerText = dailyB;
    document.getElementById("dailyConv").innerText = dailyP ? Math.round((dailyB/dailyP)*100)+"%" : "0%";

    document.getElementById("weeklyPitches").innerText = weeklyP;
    document.getElementById("weeklyBought").innerText = weeklyB;
    document.getElementById("weeklyConv").innerText = weeklyP ? Math.round((weeklyB/weeklyP)*100)+"%" : "0%";

    document.getElementById("mtdPitches").innerText = mtdP;
    document.getElementById("mtdBought").innerText = mtdB;
    document.getElementById("mtdConv").innerText = mtdP ? Math.round((mtdB/mtdP)*100)+"%" : "0%";

    // Update rep table
    const body = document.getElementById("repTableBody");
    body.innerHTML = "";

    for (let rep in repStats) {
        const stats = repStats[rep];
        const conv = stats.p ? Math.round((stats.b / stats.p) * 100) : 0;
        body.innerHTML += `
            <tr>
                <td>${rep}</td>
                <td>${stats.p}</td>
                <td>${stats.b}</td>
                <td>${conv}%</td>
            </tr>
        `;
    }

    // Update charts
    updateCharts(dailyP, dailyB, repStats);
}

// Chart.js setup
let dailyChart, repChart;

function updateCharts(dailyP, dailyB, repStats) {
    // Destroy existing charts (prevents duplicates)
    if (dailyChart) dailyChart.destroy();
    if (repChart) repChart.destroy();

    // DAILY TREND
    const ctx1 = document.getElementById("dailyTrendChart");
    dailyChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ["Today"],
            datasets: [
                { label: "Pitched", data: [dailyP], backgroundColor: "#1a73e8" },
                { label: "Bought", data: [dailyB], backgroundColor: "#34a853" }
            ]
        }
    });

    // PER REP
    const reps = Object.keys(repStats);
    const pitches = reps.map(r => repStats[r].p);
    const buys = reps.map(r => repStats[r].b);

    const ctx2 = document.getElementById("repChart");
    repChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: reps,
            datasets: [
                { label: "Pitched", data: pitches, backgroundColor: "#1a73e8" },
                { label: "Bought", data: buys, backgroundColor: "#34a853" }
            ]
        },
        options: { responsive: true }
    });
}

// Auto-update every 5 seconds
setInterval(updateDashboard, 5000);
updateDashboard();
