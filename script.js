// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyASBbff8ynu8QZqBnUXEUm2fwP0EuQC6xk",
    authDomain: "zeiterfassung-cadf1.firebaseapp.com",
    databaseURL: "https://zeiterfassung-cadf1-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "zeiterfassung-cadf1",
    storageBucket: "zeiterfassung-cadf1.appspot.com",
    messagingSenderId: "250175428731",
    appId: "1:250175428731:web:be0060330ea7114cfc2ade",
    measurementId: "G-0MFXY3S6WW"
};

// Firebase initialisieren
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Daten in Firebase speichern
function saveDataToFirebase(data) {
    const dbRef = database.ref("timeData");
    const newEntryRef = dbRef.push(); // Neuen Eintrag erstellen
    newEntryRef.set(data)
        .then(() => console.log("Daten erfolgreich in Firebase gespeichert"))
        .catch(error => console.error("Fehler beim Speichern:", error));
}

// Daten aus Firebase abrufen
function loadDataFromFirebase() {
    const dbRef = database.ref("timeData");
    dbRef.on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const allData = Object.values(data); // Objekt in Array umwandeln
            updateTableFromData(allData); // Tabelle aktualisieren
            updateSummaryFromData(allData); // Salden aktualisieren
        }
    });
}

// Tabelle mit Daten aktualisieren
function updateTableFromData(data) {
    const tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = ""; // Tabelle leeren

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
    let weeklySum = 0;
    let monthlySum = 0;
    let yearlySum = 0;

    const currentWeek = getWeekNumber(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    data.forEach(entry => {
        const entryDate = new Date(entry.date);
        const workHours = parseFloat(entry.workHours);

        if (isNaN(workHours)) return;

        if (getWeekNumber(entryDate) === currentWeek && entryDate.getFullYear() === currentYear) {
            weeklySum += workHours;
        }

        if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
            monthlySum += workHours;
        }

        if (entryDate.getFullYear() === currentYear) {
            yearlySum += workHours;
        }
    });

    document.getElementById("weekly-sum").textContent = weeklySum.toFixed(2);
    document.getElementById("monthly-sum").textContent = monthlySum.toFixed(2);
    document.getElementById("yearly-sum").textContent = yearlySum.toFixed(2);
}

// Funktion, um die aktuelle Kalenderwoche zu berechnen
function getWeekNumber(d) {
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}

// Speichern-Button: Daten erfassen und speichern
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
    saveDataToFirebase(data); // Daten in Firebase speichern
});

// Firebase-Daten beim Laden der Seite abrufen
loadDataFromFirebase();
