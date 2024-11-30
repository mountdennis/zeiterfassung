// Deine Google Apps Script Web-App-URL
const apiUrl = "https://script.google.com/macros/s/AKfycbxaLTJcJQJI2Ys_9Cq-qQGb5F2aTalInfjiS90mq1SZ8GCMSmnRLe9jZganBG6Ev0YP/exec";

// Daten speichern
function saveDataToGoogleSheet(data) {
    fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.text())
    .then(result => {
        console.log("Erfolgreich gespeichert:", result);
        loadDataFromGoogleSheet(); // Daten neu laden
    })
    .catch(error => console.error("Fehler beim Speichern:", error));
}

// Daten laden
function loadDataFromGoogleSheet() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log("Geladene Daten:", data);
            updateTableFromData(data);
            updateSummaryFromData(data);
        })
        .catch(error => console.error("Fehler beim Laden der Daten:", error));
}

// Tabelle aktualisieren
function updateTableFromData(data) {
    const tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = "";

    data.forEach(entry => {
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

// Salden aktualisieren
function updateSummaryFromData(data) {
    const now = new Date();
    let weeklySum = 0, monthlySum = 0, yearlySum = 0;
    const currentWeek = getWeekNumber(now), currentMonth = now.getMonth(), currentYear = now.getFullYear();

    data.forEach(entry => {
        const entryDate = new Date(entry.date);
        const workHours = parseFloat(entry.workHours);

        if (getWeekNumber(entryDate) === currentWeek && entryDate.getFullYear() === currentYear) weeklySum += workHours;
        if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) monthlySum += workHours;
        if (entryDate.getFullYear() === currentYear) yearlySum += workHours;
    });

    document.getElementById("weekly-sum").textContent = weeklySum.toFixed(2);
    document.getElementById("monthly-sum").textContent = monthlySum.toFixed(2);
    document.getElementById("yearly-sum").textContent = yearlySum.toFixed(2);
}

// Kalenderwoche berechnen
function getWeekNumber(d) {
    const oneJan = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - oneJan) / (24 * 60 * 60 * 1000) + oneJan.getDay() + 1) / 7);
}

// Event Listener für Speichern
document.getElementById("save").addEventListener("click", () => {
    const date = document.getElementById("date").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const pause = parseInt(document.getElementById("pause").value) || 0;
    const homeoffice = document.getElementById("homeoffice").checked;
    const notes = document.getElementById("notes").value;

    if (!date || !start || !end) return alert("Bitte alle Pflichtfelder ausfüllen!");

    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    const workHours = ((endTime - startTime) / (1000 * 60 * 60)) - pause / 60;

    if (workHours < 0) return alert("Arbeitsende muss nach Arbeitsbeginn liegen!");

    saveDataToGoogleSheet({ date, start, end, pause, homeoffice, workHours: workHours.toFixed(2), notes });
});

// Daten beim Laden der Seite abrufen
loadDataFromGoogleSheet();
