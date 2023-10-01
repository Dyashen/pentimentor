window.onload = function(){
    const table             = document.createElement('table');
    table.className         = "dictionary";
    table.style.position    = "relative";
    const tbody             = document.createElement('tbody');
    table.appendChild(tbody);

    /* Header */
    const th = document.createElement('th');
    const thD1 = document.createElement('td');
    thD1.textContent = 'Begrip';
    const thD2 = document.createElement('td');
    thD2.textContent = 'Definities';
    th.appendChild(thD1);
    th.appendChild(thD2);
    tbody.appendChild(th);


    /* Content for table */
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
    
    const container = document.querySelector('.container');
    container.appendChild(table);
}

function emptyDictionary(){
    localStorage.clear();
    const table = document.body.querySelector('table');
    if (table){table.remove();}
}