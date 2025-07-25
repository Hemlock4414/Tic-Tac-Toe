const circle = 'circle';
const cross = 'cross';

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Reihen
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Spalten
    [0, 4, 8], [2, 4, 6]             // Diagonalen
];

let fields = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
];

let currentShape = circle;

function init() {
    render();
}

function generateCircleSVG() {
    return `
        <svg width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
            <circle cx="35" cy="35" r="30" fill="none" stroke="#00B0EF" stroke-width="6" />
        </svg>
    `;
}

function generateCrossSVG() {
    return `
<svg width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
    <line x1="10" y1="10" x2="60" y2="60"
          stroke="#FFC000" stroke-width="6" stroke-linecap="round"/>
    <line x1="60" y1="10" x2="10" y2="60"
          stroke="#FFC000" stroke-width="6" stroke-linecap="round"/>
</svg>
    `.trim();
}

function handleClick(index) {
    if (fields[index] !== null) return;

    fields[index] = currentShape;

    const td = document.getElementById(`cell-${index}`);
    if (currentShape === circle) {
        td.innerHTML = generateCircleSVG();
        currentShape = cross;
    } else {
        td.innerHTML = generateCrossSVG();
        currentShape = circle;
    }

    td.removeAttribute('onclick');

    // 🧠 Gewinn prüfen
    checkForWin();
}

function render() {
    let html = '<table>';

    for (let row = 0; row < 3; row++) {
        html += '<tr>';
        for (let col = 0; col < 3; col++) {
            const index = row * 3 + col;
            let cellContent = '';
            if (fields[index] === circle) {
                cellContent = generateCircleSVG();
            } else if (fields[index] === cross) {
                cellContent = generateCrossSVG();
            }

            // onclick-Funktion nur setzen, wenn Feld leer
            const clickAttr = fields[index] === null
                ? `onclick="handleClick(${index})"`
                : '';

            html += `<td id="cell-${index}" ${clickAttr}>${cellContent}</td>`;
        }
        html += '</tr>';
    }

    html += '</table>';
    document.getElementById('content').innerHTML = html;
}

function checkForWin() {
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (fields[a] && fields[a] === fields[b] && fields[a] === fields[c]) {
            drawWinLine(combo);
            disableAllClicks();
            return true;
        }
    }
    return false;
}

function disableAllClicks() {
    for (let i = 0; i < 9; i++) {
        const td = document.getElementById(`cell-${i}`);
        if (td) td.removeAttribute('onclick');
    }
}

function drawWinLine(indices) {
    const startCell = document.getElementById(`cell-${indices[0]}`).getBoundingClientRect();
    const endCell   = document.getElementById(`cell-${indices[2]}`).getBoundingClientRect();
    const containerRect = document.getElementById('content').getBoundingClientRect();

    // Berechne die Koordinaten so, dass sie **vom Rand zu Rand** der äußeren Zellen gehen
    const cellWidth = startCell.width;
    const cellHeight = startCell.height;

    // Richtung ermitteln
    const isHorizontal = indices[0] + 1 === indices[1] && indices[1] + 1 === indices[2];
    const isVertical   = indices[0] + 3 === indices[1] && indices[1] + 3 === indices[2];
    const isDiagonalLR = indices.toString() === "0,4,8"; // links oben nach rechts unten
    const isDiagonalRL = indices.toString() === "2,4,6"; // rechts oben nach links unten

    let x1, y1, x2, y2;

    if (isHorizontal) {
        x1 = startCell.left - containerRect.left + 5;
        y1 = startCell.top + cellHeight / 2 - containerRect.top;
        x2 = endCell.right - containerRect.left - 5;
        y2 = y1;
    } else if (isVertical) {
        x1 = startCell.left + cellWidth / 2 - containerRect.left;
        y1 = startCell.top - containerRect.top + 5;
        x2 = x1;
        y2 = endCell.bottom - containerRect.top - 5;
    } else if (isDiagonalLR) {
        x1 = startCell.left - containerRect.left + 5;
        y1 = startCell.top - containerRect.top + 5;
        x2 = endCell.right - containerRect.left - 5;
        y2 = endCell.bottom - containerRect.top - 5;
    } else if (isDiagonalRL) {
    x1 = startCell.right - containerRect.left - 5;
    y1 = startCell.top - containerRect.top + 5;
    x2 = endCell.left - containerRect.left + 5;
    y2 = endCell.bottom - containerRect.top - 5;
}

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "white");
    line.setAttribute("stroke-width", "10");
    line.setAttribute("stroke-linecap", "round");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.setAttribute("width", containerRect.width);
    svg.setAttribute("height", containerRect.height);
    svg.style.pointerEvents = "none";
    svg.appendChild(line);

    document.getElementById('content').appendChild(svg);
}