document.getElementById("save").addEventListener("click", () => {
    const date = document.getElementById("date").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const pause = parseInt(document.getElementById("pause").value) || 0;
    const homeoffice = document.getElementById("homeoffice").checked;
    const notes = document.getElementById("notes").value;

    if (!date || !start || !end) {
        alert("Bitte alle Pflichtfelder ausfüllen!");
        return;
    }

    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    const workHours = ((endTime - startTime) / (1000 * 60 * 60)) - pause / 60;

    if (workHours < 0) {
        alert("Arbeitsende muss nach Arbeitsbeginn liegen!");
        return;
    }

    const data = { date, start, end, pause, homeoffice, workHours: workHours.toFixed(2), notes };
    saveData(data);
    updateTable();
    updateSummary();
});

function saveData(data) {
    const allData = JSON.parse(localStorage.getItem("timeData")) || [];
    allData.push(data);
    localStorage.setItem("timeData", JSON.stringify(allData));
}

function updateTable() {
    const allData = JSON.parse(localStorage.getItem("timeData")) || [];
    const tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = "";

    allData.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.start}</td>
            <td>${entry.end}</td>
            <td>${entry.pause} min</td>
            <td>${entry.homeoffice ? "Ja" : "Nein"}</td>
            <td>${entry.workHours} h</td>
            <td>${entry.notes}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateSummary() {
    const allData = JSON.parse(localStorage.getItem("timeData")) || [];
    const now = new Date();

    let weeklySum = 0;
    let monthlySum = 0;
    let yearlySum = 0;

    // Aktuelle Woche, Monat und Jahr berechnen
    const currentWeek = getWeekNumber(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    allData.forEach(entry => {
        const entryDate = new Date(entry.date);
        const workHours = parseFloat(entry.workHours);

        // Debugging: Zeige die aktuellen Werte in der Konsole
        console.log(`Eintrag: ${entry.date}, Stunden: ${workHours}`);

        if (isNaN(workHours)) {
            console.warn(`Ungültige Arbeitsstunden für Datum ${entry.date}: ${entry.workHours}`);
            return; // Fehlerhafte Daten überspringen
        }

        // Wochensaldo berechnen
        if (getWeekNumber(entryDate) === currentWeek && entryDate.getFullYear() === currentYear) {
            weeklySum += workHours;
        }

        // Monatssaldo berechnen
        if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
            monthlySum += workHours;
        }

        // Jahressaldo berechnen
        if (entryDate.getFullYear() === currentYear) {
            yearlySum += workHours;
        }
    });

    // Debugging: Zeige die berechneten Summen
    console.log(`Wochensaldo: ${weeklySum}, Monatssaldo: ${monthlySum}, Jahressaldo: ${yearlySum}`);

    // Werte in das HTML einfügen
    document.getElementById("weekly-sum").textContent = weeklySum.toFixed(2);
    document.getElementById("monthly-sum").textContent = monthlySum.toFixed(2);
    document.getElementById("yearly-sum").textContent = yearlySum.toFixed(2);
}

// Funktion, um die Kalenderwoche zu berechnen
function getWeekNumber(d) {
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}

// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyASBbff8ynu8QZqBnUXEUm2fwP0EuQC6xk",
  authDomain: "zeiterfassung-cadf1.firebaseapp.com",
  databaseURL: "https://zeiterfassung-cadf1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zeiterfassung-cadf1",
  storageBucket: "zeiterfassung-cadf1.firebasestorage.app",
  messagingSenderId: "250175428731",
  appId: "1:250175428731:web:be0060330ea7114cfc2ade",
  measurementId: "G-0MFXY3S6WW"
};

// Firebase initialisieren
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


       
document.getElementById("export-pdf").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Titel und Überschrift
    doc.setFont("Arial", "bold");
    doc.setFontSize(18);
    doc.text("Monatsreport - Zeiterfassung", 10, 20);

    doc.setFontSize(12);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString()}`, 10, 30);

    // Tabellenkopf definieren
    const tableColumn = [
        "Datum",
        "Arbeitsbeginn",
        "Arbeitsende",
        "Pause (min)",
        "Homeoffice",
        "Arbeitsstunden",
        "Notizen",
    ];

    // Daten aus der Tabelle holen
    const allData = JSON.parse(localStorage.getItem("timeData")) || [];
    const tableRows = [];

    allData.forEach((entry) => {
        tableRows.push([
            entry.date,
            entry.start,
            entry.end,
            entry.pause,
            entry.homeoffice ? "Ja" : "Nein",
            entry.workHours,
            entry.notes || "",
        ]);
    });

    // Tabelleninhalt hinzufügen
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: "striped",
    });

    // PDF speichern
    doc.save(`Monatsreport_${new Date().toLocaleDateString()}.pdf`);
});
