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

    const currentWeek = getWeekNumber(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    allData.forEach(entry => {
        const entryDate = new Date(entry.date);
        const workHours = parseFloat(entry.workHours);

        if (isNaN(workHours)) return;

        if (getWeekNumber(entryDate) === currentWeek && entryDate.getFullYear() === currentYear) {
            weeklySum += workHours;
       
