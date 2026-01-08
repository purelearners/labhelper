// ============= ELECTRICITY EXPERIMENTS =============
let ohmsChart = null;
let ohmsGenChart = null;

// ===== OHM'S LAW =====
function generateOhmsInputs() {
    const numReadings = parseInt(document.getElementById('ohmsNumReadings').value);
    if (isNaN(numReadings) || numReadings < 2 || numReadings > 10) {
        showError('Number of readings should be 2-10', 'ohmsErrorBox');
        return;
    }

    let html = '';
    for (let i = 1; i <= numReadings; i++) {
        html += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div>
                    <label>Reading ${i} - Voltage (V)</label>
                    <input type="number" id="ohmsV${i}" value="${i}" min="0" max="20" step="0.1">
                </div>
                <div>
                    <label>Current (A)</label>
                    <input type="number" id="ohmsI${i}" value="${i * 0.2}" min="0" max="5" step="0.01">
                </div>
            </div>
        `;
    }
    
    html += `
        <button onclick="verifyOhmsLaw(${numReadings})">Plot V-I Graph & Calculate R</button>
        <button class="secondary" onclick="clearOhmsResults()" style="margin-left: 10px;">Clear</button>
    `;
    
    document.getElementById('ohmsInputs').innerHTML = html;
}

function verifyOhmsLaw(numReadings) {
    const voltages = [];
    const currents = [];

    for (let i = 1; i <= numReadings; i++) {
        const v = parseFloat(document.getElementById(`ohmsV${i}`).value);
        const c = parseFloat(document.getElementById(`ohmsI${i}`).value);
        
        if (isNaN(v) || isNaN(c) || v < 0 || c < 0) {
            showError('Please enter valid V and I values', 'ohmsErrorBox');
            return;
        }
        
        voltages.push(v);
        currents.push(c);
    }

    // Calculate R from each reading and average
    let rValues = [];
    for (let i = 0; i < voltages.length; i++) {
        if (currents[i] > 0) {
            rValues.push(voltages[i] / currents[i]);
        }
    }

    const avgR = rValues.reduce((a, b) => a + b) / rValues.length;

    // Calculate correlation coefficient
    const meanV = voltages.reduce((a, b) => a + b) / voltages.length;
    const meanI = currents.reduce((a, b) => a + b) / currents.length;

    let sumNum = 0, sumDenV = 0, sumDenI = 0;
    for (let i = 0; i < voltages.length; i++) {
        sumNum += (voltages[i] - meanV) * (currents[i] - meanI);
        sumDenV += (voltages[i] - meanV) ** 2;
        sumDenI += (currents[i] - meanI) ** 2;
    }

    const correlation = Math.abs(sumNum / Math.sqrt(sumDenV * sumDenI));

    document.getElementById('ohmsR').textContent = avgR.toFixed(2) + ' Ω';
    document.getElementById('ohmsCorr').textContent = correlation.toFixed(4);
    document.getElementById('ohmsLinear').textContent = correlation > 0.98 ? 'YES ✓' : 'NO';

    document.getElementById('ohmsResultBox').style.display = 'block';

    // Generate graph
    const ctx = document.getElementById('ohmsChart');
    if (ohmsChart) ohmsChart.destroy();

    const plotData = voltages.map((v, i) => ({ x: currents[i], y: v }));

    ohmsChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'V vs I (Ohm\'s Law)',
                data: plotData,
                borderColor: '#2180a5',
                backgroundColor: 'rgba(33, 128, 141, 0.6)',
                borderWidth: 2,
                pointRadius: 6,
                showLine: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: {
                x: {
                    title: { display: true, text: 'Current I (A)' },
                    beginAtZero: true
                },
                y: {
                    title: { display: true, text: 'Voltage V (V)' },
                    beginAtZero: true
                }
            }
        }
    });

    document.getElementById('ohmsChartContainer').style.display = 'block';

    setTimeout(() => {
        document.getElementById('ohmsChartContainer').scrollIntoView({ behavior: 'smooth' });
    }, 200);
}

function generateOhmsReadings() {
    const R = parseFloat(document.getElementById('ohmsGivenR').value);
    const maxV = parseFloat(document.getElementById('ohmsMaxV').value);
    const numReadings = parseInt(document.getElementById('ohmsGenReadings').value);

    if (isNaN(R) || isNaN(maxV) || isNaN(numReadings) || R <= 0 || maxV <= 0) {
        showError('Please enter valid values', 'ohmsErrorBox');
        return;
    }

    try {
        const tableData = [];
        const vValues = [];
        const iValues = [];

        for (let i = 1; i <= numReadings; i++) {
            const v = (maxV / numReadings) * i;
            const c = v / R;

            tableData.push({
                sNo: i,
                v: v.toFixed(2),
                i: c.toFixed(3),
                r: R.toFixed(2)
            });

            vValues.push(v);
            iValues.push(c);
        }

        document.getElementById('ohmsGenR').textContent = R.toFixed(2) + ' Ω';
        document.getElementById('ohmsGenCount').textContent = tableData.length + ' readings';
        document.getElementById('ohmsGenStats').style.display = 'block';

        const tableBody = document.getElementById('ohmsTableBody');
        tableBody.innerHTML = tableData.map(r => `
            <tr>
                <td>${r.sNo}</td>
                <td>${r.v}</td>
                <td>${r.i}</td>
                <td>${r.r}</td>
            </tr>
        `).join('');

        document.getElementById('ohmsTableContainer').style.display = 'block';

        // Generate graph
        const ctx = document.getElementById('ohmsGenChart');
        if (ohmsGenChart) ohmsGenChart.destroy();

        const plotData = vValues.map((v, i) => ({ x: iValues[i], y: v }));

        ohmsGenChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'V vs I (Generated)',
                    data: plotData,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.6)',
                    borderWidth: 2,
                    pointRadius: 6,
                    showLine: true,
                    tension: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Current I (A)' },
                        beginAtZero: true
                    },
                    y: {
                        title: { display: true, text: 'Voltage V (V)' },
                        beginAtZero: true
                    }
                }
            }
        });

        document.getElementById('ohmsGenChartContainer').style.display = 'block';

        setTimeout(() => {
            document.getElementById('ohmsTableContainer').scrollIntoView({ behavior: 'smooth' });
        }, 200);

    } catch (error) {
        showError('Calculation error: ' + error.message, 'ohmsErrorBox');
    }
}

function clearOhmsResults() {
    document.getElementById('ohmsResultBox').style.display = 'none';
    document.getElementById('ohmsChartContainer').style.display = 'none';
    if (ohmsChart) ohmsChart.destroy();
}

function clearOhmsGen() {
    document.getElementById('ohmsTableContainer').style.display = 'none';
    document.getElementById('ohmsGenChartContainer').style.display = 'none';
    document.getElementById('ohmsGenStats').style.display = 'none';
    if (ohmsGenChart) ohmsGenChart.destroy();
}

// ===== RESISTIVITY =====
function calculateResistivity() {
    const R = parseFloat(document.getElementById('resR').value);
    const L = parseFloat(document.getElementById('resL').value);
    const d = parseFloat(document.getElementById('resD').value);

    if (isNaN(R) || isNaN(L) || isNaN(d) || R <= 0 || L <= 0 || d <= 0) {
        showError('Please enter valid values', 'resErrorBox');
        return;
    }

    try {
        // A = π(d/2)^2 where d in mm, A in mm^2
        const radius = d / 2;
        const A = Math.PI * radius * radius;

        // ρ = R × A / L (ρ in Ω⋅cm if L in cm and A in mm^2, need conversion)
        // A_cm^2 = A_mm^2 / 100
        const A_cm2 = A / 100;
        const rho = (R * A_cm2) / L;

        // Identify material
        let material = '';
        if (rho < 2) material = 'Copper or Silver';
        else if (rho < 10) material = 'Nickel or Iron';
        else if (rho < 50) material = 'Constantan';
        else if (rho < 120) material = 'Nichrome';
        else material = 'Unknown material';

        document.getElementById('resA').textContent = A.toFixed(4) + ' mm² = ' + A_cm2.toFixed(6) + ' cm²';
        document.getElementById('resRho').textContent = rho.toFixed(2) + ' Ω⋅cm';
        document.getElementById('resMaterial').textContent = material;

        document.getElementById('resResultBox').style.display = 'block';
        document.getElementById('resErrorBox').style.display = 'none';

    } catch (error) {
        showError('Calculation error: ' + error.message, 'resErrorBox');
    }
}

function generateResistivityReadings() {
    const rho = parseFloat(document.getElementById('resGivenRho').value);
    const L = parseFloat(document.getElementById('resGenL').value);
    const d = parseFloat(document.getElementById('resGenD').value);
    const numReadings = parseInt(document.getElementById('resGenReadings').value);

    if (isNaN(rho) || isNaN(L) || isNaN(d) || isNaN(numReadings) || rho <= 0 || L <= 0 || d <= 0) {
        showError('Please enter valid parameters', 'resErrorBox');
        return;
    }

    try {
        const radius = d / 2;
        const A_mm2 = Math.PI * radius * radius;
        const A_cm2 = A_mm2 / 100;

        const tableData = [];

        for (let i = 1; i <= numReadings; i++) {
            const length = L * (i / numReadings);
            const R = (rho * A_cm2) / length;
            const calcRho = (R * A_cm2) / length;

            tableData.push({
                sNo: i,
                length: length.toFixed(1),
                R: R.toFixed(3),
                rho: calcRho.toFixed(2)
            });
        }

        document.getElementById('resGenRho').textContent = rho.toFixed(2) + ' Ω⋅cm';
        document.getElementById('resGenArea').textContent = A_cm2.toFixed(6) + ' cm²';
        document.getElementById('resGenCount').textContent = tableData.length + ' readings';
        document.getElementById('resGenStats').style.display = 'block';

        const tableBody = document.getElementById('resTableBody');
        tableBody.innerHTML = tableData.map(r => `
            <tr>
                <td>${r.sNo}</td>
                <td>${r.length}</td>
                <td>${r.R}</td>
                <td>${r.rho}</td>
            </tr>
        `).join('');

        document.getElementById('resTableContainer').style.display = 'block';
        document.getElementById('resErrorBox').style.display = 'none';

    } catch (error) {
        showError('Calculation error: ' + error.message, 'resErrorBox');
    }
}

function clearResCalc() {
    document.getElementById('resResultBox').style.display = 'none';
    document.getElementById('resErrorBox').style.display = 'none';
}

function clearResGen() {
    document.getElementById('resTableContainer').style.display = 'none';
    document.getElementById('resGenStats').style.display = 'none';
}

// ===== METRE BRIDGE =====
function calculateMBUnknown() {
    const Rknown = parseFloat(document.getElementById('mbKnownR').value);
    const L = parseFloat(document.getElementById('mbBalanceL').value);

    if (isNaN(Rknown) || isNaN(L) || Rknown <= 0 || L <= 0 || L >= 100) {
        showError('Please enter valid values', 'mbErrorBox');
        return;
    }

    try {
        // R_unknown = R_known × L / (100 - L)
        const Runknown = Rknown * L / (100 - L);
        const ratio = L / (100 - L);

        document.getElementById('mbKnown').textContent = Rknown.toFixed(2) + ' Ω';
        document.getElementById('mbL').textContent = L.toFixed(1) + ' cm';
        document.getElementById('mbRatio').textContent = ratio.toFixed(4);
        document.getElementById('mbUnknownR').textContent = Runknown.toFixed(2) + ' Ω';

        document.getElementById('mbResultBox').style.display = 'block';
        document.getElementById('mbErrorBox').style.display = 'none';

    } catch (error) {
        showError('Calculation error: ' + error.message, 'mbErrorBox');
    }
}

function generateMBReadings() {
    const Rx = parseFloat(document.getElementById('mbUnknownGiven').value);

    if (isNaN(Rx) || Rx <= 0) {
        showError('Please enter unknown resistance', 'mbErrorBox');
        return;
    }

    try {
        const tableData = [];

        // For each known resistance 1-12 Ω
        for (let Rs = 1; Rs <= 12; Rs++) {
            // L / (100-L) = Rx / Rs
            // L = 100 × Rx / (Rx + Rs)
            const L = (100 * Rx) / (Rx + Rs);

            if (L > 1 && L < 99) {
                const verifyRx = Rs * L / (100 - L);

                tableData.push({
                    sNo: Rs,
                    Rs: Rs.toFixed(1),
                    L: L.toFixed(2),
                    remaining: (100 - L).toFixed(2),
                    ratio: (L / (100 - L)).toFixed(4),
                    verifyRx: verifyRx.toFixed(2)
                });
            }
        }

        if (tableData.length === 0) {
            showError('Cannot generate valid readings', 'mbErrorBox');
            return;
        }

        document.getElementById('mbGenRx').textContent = Rx.toFixed(2) + ' Ω';
        document.getElementById('mbGenCount').textContent = tableData.length + ' readings';
        document.getElementById('mbGenStats').style.display = 'block';

        const tableBody = document.getElementById('mbTableBody');
        tableBody.innerHTML = tableData.map(r => `
            <tr>
                <td>${r.sNo}</td>
                <td>${r.Rs}</td>
                <td>${r.L}</td>
                <td>${r.remaining}</td>
                <td>${r.ratio}</td>
                <td><strong>${r.verifyRx}</strong></td>
            </tr>
        `).join('');

        document.getElementById('mbTableContainer').style.display = 'block';
        document.getElementById('mbErrorBox').style.display = 'none';

    } catch (error) {
        showError('Calculation error: ' + error.message, 'mbErrorBox');
    }
}

function clearMBCalc() {
    document.getElementById('mbResultBox').style.display = 'none';
    document.getElementById('mbErrorBox').style.display = 'none';
}

function clearMBGen() {
    document.getElementById('mbTableContainer').style.display = 'none';
    document.getElementById('mbGenStats').style.display = 'none';
}

function showError(msg, boxId) {
    const box = document.getElementById(boxId);
    if (box) {
        box.innerHTML = `<div class="error-message">${msg}</div>`;
        box.style.display = 'block';
    }
}
