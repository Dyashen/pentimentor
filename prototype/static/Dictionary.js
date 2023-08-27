const table = document.createElement('table');
const tbody = document.createElement('tbody');
table.appendChild(tbody);

const sortedKeys = Object.keys(localStorage).sort();
for (let i = 0; i < sortedKeys.length; i++) {
    const tr = document.createElement('tr');
    const key = sortedKeys[i];
    const value = localStorage.getItem(key);
    const td1 = document.createElement('td');
    td1.textContent = key;
    tr.appendChild(td1);
    const td2 = document.createElement('td');
    td2.textContent = value;
    tr.appendChild(td2);
    tbody.appendChild(tr);
}

document.body.appendChild(table);

function emptyDictionary(){
    localStorage.clear();
    const table = document.body.querySelector('table');
    table.clear();
}