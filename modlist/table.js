// Function to fetch the CSV file and convert it to an array of arrays
async function fetchCSVData(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    let data = csvText.split('\n').filter(Boolean).map(row => row.split(','));

    // Sort the data array by the second column (names) alphabetically
    data.sort((a, b) => a[1].localeCompare(b[1]));

    return data;
}

function createTableFromCSV(data) {
    const tables = [document.createElement('table'), document.createElement('table'), document.createElement('table')];
    tables.forEach(table => {
        table.className = 'mod-table';
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
    });

    data.forEach((row, i) => {
        const tableIndex = i % 3; // This line ensures distribution across 3 tables
        const tbody = tables[tableIndex].querySelector('tbody');

        const tr = document.createElement('tr');
        const tdIcon = document.createElement('td');
        tdIcon.className = 'icon-cell';
        const img = document.createElement('img');
        img.src = row[0];
        img.alt = 'Mod Icon';
        tdIcon.appendChild(img);
        tr.appendChild(tdIcon);

        const tdName = document.createElement('td');
        const btn = document.createElement('button');
        btn.className = 'mod-link-btn';
        btn.innerHTML = `<a href="${row[2]}" target="_blank" rel="noopener noreferrer">${row[1]}</a>`;
        tdName.appendChild(btn);
        tr.appendChild(tdName);

        tbody.appendChild(tr);
    });

    return tables;
}

async function init() {
    const csvUrl = 'modlist.csv';
    const csvData = await fetchCSVData(csvUrl);
    const tables = createTableFromCSV(csvData); // This now returns an array of tables
    const container = document.getElementById('csvTableContainer');
    tables.forEach(table => {
        container.appendChild(table); // Append each table to the container
    });
}

document.addEventListener('DOMContentLoaded', init);