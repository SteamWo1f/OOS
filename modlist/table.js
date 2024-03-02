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
    const table = document.createElement('table');
    table.className = 'mod-table';
    const tbody = document.createElement('tbody');

    data.forEach((row, i) => {
        const tr = document.createElement('tr');
        const tdIcon = document.createElement('td');
        tdIcon.className = 'icon-cell';
        const img = document.createElement('img');
        img.src = row[0];
        img.alt = 'Mod Icon';
        tdIcon.appendChild(img);
        tr.appendChild(tdIcon);

        const tdName = document.createElement('td');
        const btn = document.createElement('button'); // Create a button element
        btn.className = 'mod-link-btn'; // Add a class to style the button
        btn.innerHTML = `<a href="${row[2]}" target="_blank" rel="noopener noreferrer">${row[1]}</a>`; // Wrap the anchor tag within the button
        tdName.appendChild(btn); // Append the button to the td element
        tr.appendChild(tdName);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
}

async function init() {
    const csvUrl = 'modlist.csv';
    const csvData = await fetchCSVData(csvUrl);
    const table = createTableFromCSV(csvData);
    document.getElementById('csvTableContainer').appendChild(table);
}

document.addEventListener('DOMContentLoaded', init);