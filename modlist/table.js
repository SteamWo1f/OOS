const ICON_CACHE_KEY = 'modrinth_icon_cache_v1';
const ICON_CACHE_TTL = 24 * 60 * 60 * 1000;

function loadIconCache() {
    try {
        const raw = localStorage.getItem(ICON_CACHE_KEY);
        if (!raw) return {};
        const { data, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp > ICON_CACHE_TTL) {
            localStorage.removeItem(ICON_CACHE_KEY);
            return {};
        }
        return data || {};
    } catch {
        return {};
    }
}

function saveIconCache(cache) {
    localStorage.setItem(ICON_CACHE_KEY, JSON.stringify({
        data: cache,
        timestamp: Date.now()
    }));
}

async function fetchCSVData(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    let data = csvText.split('\n').filter(Boolean).map(row => row.split(','));

    data.sort((a, b) => a[1].localeCompare(b[1]));

    return data;
}

function extractModrinthIds(data) {
    const ids = new Set();
    data.forEach(row => {
        const url = row[2];
        if (!url) return;
        const match = url.match(/modrinth\.com\/mod\/([^\/\s]+)/);
        if (match) ids.add(match[1]);
    });
    return Array.from(ids);
}

async function fetchModrinthIcons(ids, cache) {
    const iconMap = { ...cache };
    const uncachedIds = ids.filter(id => !cache[id]);
    const batchSize = 100;
    for (let i = 0; i < uncachedIds.length; i += batchSize) {
        const batch = uncachedIds.slice(i, i + batchSize);
        const res = await fetch(
            `https://api.modrinth.com/v2/projects?ids=${encodeURIComponent(JSON.stringify(batch))}`,
            {
                headers: {
                    'User-Agent': 'SteamWo1f/OOS/4.0 (optimized.oasis.modpack.help@gmail.com)'
                }
            }
        );
        if (!res.ok) continue;
        const projects = await res.json();
        projects.forEach(proj => {
            iconMap[proj.slug] = proj.icon_url;
            iconMap[proj.id] = proj.icon_url;
        });
    }
    return iconMap;
}

async function prepareDataWithIcons(data) {
    const ids = extractModrinthIds(data);
    let cache = loadIconCache();
    const iconMap = await fetchModrinthIcons(ids, cache);
    saveIconCache(iconMap);
    data.forEach(row => {
        const url = row[2];
        if (!url) return;
        const match = url.match(/modrinth\.com\/mod\/([^\/\s]+)/);
        if (match) {
            const id = match[1];
            row[0] = iconMap[id] || '';
        }
    });
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
        const tableIndex = i % 3;
        const tbody = tables[tableIndex].querySelector('tbody');

        const tr = document.createElement('tr');
        const tdIcon = document.createElement('td');
        tdIcon.className = 'icon-cell';
        const img = document.createElement('img');
        img.src = row[0] || '/assets/fallback.png';
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
    let csvData = await fetchCSVData(csvUrl);
    csvData = await prepareDataWithIcons(csvData);
    const tables = createTableFromCSV(csvData);
    const container = document.getElementById('csvTableContainer');
    tables.forEach(table => container.appendChild(table));
}

document.addEventListener('DOMContentLoaded', init);