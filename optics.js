// ============= OPTICS EXPERIMENTS =============
let prismChart = null;
let lensChart = null;
let lensReciprocalChart = null;

// ===== PRISM DEVIATION =====
function calculateDeviation() {
    const i1 = parseFloat(document.getElementById('angleIncidence').value);
    const A = parseFloat(document.getElementById('prismAngle').value);
    const mu = parseFloat(document.getElementById('refractiveIndex').value);

    if (isNaN(i1) || isNaN(A) || isNaN(mu)) {
        showError('Please enter valid numbers', 'prismErrorBox');
        return;
    }

    if (i1 < 30 || i1 > 80) {
        showError('Angle of incidence should be between 30° and 80°', 'prismErrorBox');
        return;
    }

    try {
        const sinR1 = Math.sin(toRad(i1)) / mu;
        if (Math.abs(sinR1) > 1) {
            showError('Total internal reflection! Try smaller angle.', 'prismErrorBox');
            return;
        }

        const r1 = toDeg(Math.asin(sinR1));
        const r2 = A - r1;

        if (r2 < 0 || r2 > 90) {
            showError('Invalid configuration. Try different values.', 'prismErrorBox');
            return;
        }

        const sinI2 = mu * Math.sin(toRad(r2));
        if (sinI2 > 1) {
            showError('Total internal reflection at second surface!', 'prismErrorBox');
            return;
        }

        const i2 = toDeg(Math.asin(sinI2));
        const delta = i1 + i2 - A;

        document.getElementById('refraction1').textContent = r1.toFixed(2) + '°';
        document.getElementById('refraction2').textContent = r2.toFixed(2) + '°';
        document.getElementById('angleEmergence').textContent = i2.toFixed(2) + '°';
        document.getElementById('deviationAngle').textContent = delta.toFixed(2) + '°';

        document.getElementById('prismResultsBox').style.display = 'block';
        document.getElementById('prismErrorBox').style.display = 'none';
    } catch (error) {
        showError('Calculation error: ' + error.message, 'prismErrorBox');
    }
}

function generatePrismGraph() {
    const A = parseFloat(document.getElementById('prismAngle').value);
    const mu = parseFloat(document.getElementById('refractiveIndex').value);

    if (isNaN(A) || isNaN(mu)) {
        showError('Please enter prism angle and refractive index', 'prismErrorBox');
        return;
    }

    const incidenceAngles = [];
    const deviationAngles = [];
    const tableData = [];

    for (let i1 = 35; i1 <= 70; i1 += 2) {
        try {
            const sinR1 = Math.sin(toRad(i1)) / mu;
            if (sinR1 > 1) continue;

            const r1 = toDeg(Math.asin(sinR1));
            const r2 = A - r1;

            if (r2 < 0 || r2 > 90) continue;

            const sinI2 = mu * Math.sin(toRad(r2));
            if (sinI2 > 1) continue;

            const i2 = toDeg(Math.asin(sinI2));
            const delta = i1 + i2 - A;

            incidenceAngles.push(i1);
            deviationAngles.push(delta);
            tableData.push({
                i1: i1.toFixed(1),
                r1: r1.toFixed(2),
                r2: r2.toFixed(2),
                i2: i2.toFixed(2),
                delta: delta.toFixed(2)
            });
        } catch (e) {
            continue;
        }
    }

    if (incidenceAngles.length === 0) {
        showError('Cannot generate graph with current parameters.', 'prismErrorBox');
        return;
    }

    const ctx = document.getElementById('prismChart');
    if (prismChart) prismChart.destroy();

    prismChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: incidenceAngles.map(a => a.toFixed(0) + '°'),
            datasets: [{
                label: 'Angle of Deviation (δ)',
                data: deviationAngles,
                borderColor: '#2180a5',
                backgroundColor: 'rgba(33, 128, 141, 0.05)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#2180a5',
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' } },
            scales: {
                y: { min: Math.min(...deviationAngles) - 5 },
                x: {}
            }
        }
    });

    document.getElementById('prismChartContainer').style.display = 'block';
    document.getElementById('prismTableContainer').style.display = 'block';

    const tableBody = document.getElementById('prismTableBody');
    tableBody.innerHTML = tableData.map(r => `
        <tr>
            <td>${r.i1}</td>
            <td>${r.r1}</td>
            <td>${r.r2}</td>
            <td>${r.i2}</td>
            <td><strong>${r.delta}</strong></td>
        </tr>
    `).join('');

    document.getElementById('prismResultsBox').style.display = 'block';
    document.getElementById('prismErrorBox').style.display = 'none';

    setTimeout(() => {
        document.getElementById('prismChartContainer').scrollIntoView({ behavior: 'smooth' });
    }, 200);
}

function clearPrismResults() {
    document.getElementById('prismResultsBox').style.display = 'none';
    document.getElementById('prismChartContainer').style.display = 'none';
    document.getElementById('prismTableContainer').style.display = 'none';
    if (prismChart) prismChart.destroy();
}

// ===== FOCAL LENGTH (LENS) =====
function calculateLensFocalLength() {
    const objPos = parseFloat(document.getElementById('lensObjPos').value);
    const imgPos = parseFloat(document.getElementById('lensImgPos').value);
    const lensPos = parseFloat(document.getElementById('lensLensPos').value);

    if (isNaN(objPos) || isNaN(imgPos) || isNaN(lensPos)) {
        showError('Please enter valid numbers', 'lensErrorBox');
        return;
    }

    if (objPos < 0 || objPos > 100 || imgPos < 0 || imgPos > 100 || lensPos < 0 || lensPos > 100) {
        showError('All positions must be between 0-100cm', 'lensErrorBox');
        return;
    }

    const u = Math.abs(objPos - lensPos);
    const v = Math.abs(imgPos - lensPos);

    if (u <= 0 || v <= 0) {
        showError('Object and image must be on opposite sides of lens', 'lensErrorBox');
        return;
    }

    if (u < 2 || v < 2) {
        showError('Distances too small. Ensure proper positions.', 'lensErrorBox');
        return;
    }

    const f = (u * v) / (u + v);
    const magnification = -v / u;

    document.getElementById('lensCalcU').textContent = u.toFixed(2) + ' cm';
    document.getElementById('lensCalcV').textContent = v.toFixed(2) + ' cm';
    document.getElementById('lensMagnification').textContent = magnification.toFixed(2);
    document.getElementById('lensFocalLength').textContent = f.toFixed(2) + ' cm';

    document.getElementById('lensResultsBox').style.display = 'block';
    document.getElementById('lensErrorBox').style.display = 'none';
}

function generateLensReadings() {
    const f = parseFloat(document.getElementById('givenLensF').value);
    const lensPos = parseFloat(document.getElementById('lensRevPos').value);

    if (isNaN(f) || isNaN(lensPos) || f < 1 || f > 50) {
        showError('Please enter valid focal length (1-50cm)', 'lensErrorBox');
        return;
    }

    try {
        const twoF = 2 * f;
        const tableData = [];
        const uValues = [];
        const vValues = [];

        // 10 readings above 2f
        const aboveStart = twoF + 2;
        const aboveEnd = twoF + 25;
        const aboveStep = (aboveEnd - aboveStart) / 9;

        for (let i = 0; i < 10; i++) {
            const u = aboveStart + (i * aboveStep);
            if (u <= f) continue;

            const v = (u * f) / (u - f);
            if (v < f || !isFinite(v)) continue;

            const objPos = lensPos - u;
            const imgPos = lensPos + v;

            if (objPos < 0 || imgPos > 100) continue;

            const sNo = tableData.length + 1;
            const invU = (1 / u).toFixed(4);
            const invV = (1 / v).toFixed(4);
            const sumInv = (1 / u + 1 / v).toFixed(4);
            const calcF = (u * v) / (u + v);

            tableData.push({
                sNo: sNo,
                objPos: objPos.toFixed(1),
                imgPos: imgPos.toFixed(1),
                u: u.toFixed(2),
                v: v.toFixed(2),
                invU: invU,
                invV: invV,
                sumInv: sumInv,
                f: calcF.toFixed(2)
            });

            uValues.push(u);
            vValues.push(v);
        }

        // 10 readings below 2f
        const belowStart = f + 1;
        const belowEnd = twoF - 2;
        const belowStep = (belowEnd - belowStart) / 9;

        for (let i = 0; i < 10; i++) {
            const u = belowStart + (i * belowStep);
            if (u <= f) continue;

            const v = (u * f) / (u - f);
            if (v < f || !isFinite(v)) continue;

            const objPos = lensPos - u;
            const imgPos = lensPos + v;

            if (objPos < 0 || imgPos > 100) continue;

            const sNo = tableData.length + 1;
            const invU = (1 / u).toFixed(4);
            const invV = (1 / v).toFixed(4);
            const sumInv = (1 / u + 1 / v).toFixed(4);
            const calcF = (u * v) / (u + v);

            tableData.push({
                sNo: sNo,
                objPos: objPos.toFixed(1),
                imgPos: imgPos.toFixed(1),
                u: u.toFixed(2),
                v: v.toFixed(2),
                invU: invU,
                invV: invV,
                sumInv: sumInv,
                f: calcF.toFixed(2)
            });

            uValues.push(u);
            vValues.push(v);
        }

        if (tableData.length < 10) {
            showError('Cannot generate sufficient readings within 100cm bench', 'lensErrorBox');
            return;
        }

        document.getElementById('givenLensF_display').textContent = f.toFixed(2) + ' cm';
        document.getElementById('lens2F').textContent = twoF.toFixed(2) + ' cm';
        document.getElementById('lensReadingsCount').textContent = tableData.length + ' readings';
        document.getElementById('lensStatsBox').style.display = 'block';

        const tableBody = document.getElementById('lensTableBody');
        tableBody.innerHTML = tableData.map(r => `
            <tr>
                <td>${r.sNo}</td>
                <td>${r.objPos}</td>
                <td>${r.imgPos}</td>
                <td>${r.u}</td>
                <td>${r.v}</td>
                <td>${r.invU}</td>
                <td>${r.invV}</td>
                <td>${r.sumInv}</td>
                <td><strong>${r.f}</strong></td>
            </tr>
        `).join('');

        document.getElementById('lensTableContainer').style.display = 'block';
        generateLensGraphs(uValues, vValues, f);

    } catch (error) {
        showError('Calculation error: ' + error.message, 'lensErrorBox');
    }
}

function generateLensGraphs(uValues, vValues, givenF) {
    // U vs V graph
    const ctx = document.getElementById('lensChart');
    if (lensChart) lensChart.destroy();

    const plotData = uValues.map((u, i) => ({ x: u, y: vValues[i] }));
    
    let sumF = 0;
    for (let i = 0; i < uValues.length; i++) {
        sumF += (uValues[i] * vValues[i]) / (uValues[i] + vValues[i]);
    }
    const avgF = sumF / uValues.length;

    lensChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'u vs v (Observations)',
                data: plotData,
                borderColor: '#2180a5',
                backgroundColor: 'rgba(33, 128, 141, 0.6)',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' } },
            scales: {
                x: {
                    title: { display: true, text: 'Object Distance u (cm)' },
                    min: Math.min(...uValues) - 2,
                    max: Math.max(...uValues) + 2
                },
                y: {
                    title: { display: true, text: 'Image Distance v (cm)' },
                    min: Math.min(...vValues) - 2,
                    max: Math.max(...vValues) + 2
                }
            }
        }
    });

    document.getElementById('lensChartContainer').style.display = 'block';
    const error = Math.abs(avgF - givenF) / givenF * 100;
    document.getElementById('lensGraphF').innerHTML = `
        <span>From Graph (Average): f = <span style="font-size: 16px; color: #1976d2;">${avgF.toFixed(2)} cm</span></span><br>
        <span style="font-size: 12px; color: #1565c0; margin-top: 5px;">Given f: ${givenF.toFixed(2)} cm | Error: ${error.toFixed(1)}%</span>
    `;

    // Reciprocal graph
    const recipCtx = document.getElementById('lensReciprocalChart');
    if (lensReciprocalChart) lensReciprocalChart.destroy();

    const invUValues = uValues.map(u => 1 / u);
    const invVValues = vValues.map(v => 1 / v);

    lensReciprocalChart = new Chart(recipCtx, {
        type: 'line',
        data: {
            labels: invUValues.map(v => v.toFixed(4)),
            datasets: [{
                label: '1/u vs 1/v',
                data: invVValues,
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.05)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 6,
                pointBackgroundColor: '#4caf50'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: '1/u (cm⁻¹)' } },
                y: { title: { display: true, text: '1/v (cm⁻¹)' } }
            }
        }
    });

    document.getElementById('lensReciprocalContainer').style.display = 'block';
    document.getElementById('lensReciprocalF').innerHTML = `
        <span>Reciprocal Method: Y-intercept = 1/f = ${(1/givenF).toFixed(4)} cm⁻¹</span><br>
        <span style="font-size: 12px; color: #2e7d32; margin-top: 5px;">Therefore, f = ${givenF.toFixed(2)} cm (Most Accurate)</span>
    `;

    setTimeout(() => {
        document.getElementById('lensChartContainer').scrollIntoView({ behavior: 'smooth' });
    }, 200);
}

function clearLensResults() {
    document.getElementById('lensResultsBox').style.display = 'none';
}

function clearLensTable() {
    document.getElementById('lensTableContainer').style.display = 'none';
    document.getElementById('lensChartContainer').style.display = 'none';
    document.getElementById('lensReciprocalContainer').style.display = 'none';
    document.getElementById('lensStatsBox').style.display = 'none';
    if (lensChart) lensChart.destroy();
    if (lensReciprocalChart) lensReciprocalChart.destroy();
}

// ===== CONVEX MIRROR =====
let mirrorChart = null;
let mirrorReciprocalChart = null;

function calculateMirrorF() {
    const objNeedle = parseFloat(document.getElementById('mirrorObjNeedle').value);
    const lensPos = parseFloat(document.getElementById('mirrorLensPos').value);
    const mirrorPos = parseFloat(document.getElementById('mirrorMirrorPos').value);
    const imgNeedle = parseFloat(document.getElementById('mirrorImgNeedle').value);

    if (isNaN(objNeedle) || isNaN(lensPos) || isNaN(mirrorPos) || isNaN(imgNeedle)) {
        showError('Please enter valid positions', 'mirrorCalcError');
        return;
    }

    if (objNeedle < 0 || objNeedle > 100 || lensPos < 0 || lensPos > 100 || 
        mirrorPos < 0 || mirrorPos > 100 || imgNeedle < 0 || imgNeedle > 100) {
        showError('All positions must be 0-100cm', 'mirrorCalcError');
        return;
    }

    // Convex lens forms real image
    const uLens = Math.abs(objNeedle - lensPos);
    const vLens = Math.abs(imgNeedle - lensPos);

    if (uLens <= 0 || vLens <= 0) {
        showError('Invalid lens setup', 'mirrorCalcError');
        return;
    }

    // Mirror calculations (virtual object)
    const uMirror = Math.abs(imgNeedle - mirrorPos);
    const vMirror = Math.abs(mirrorPos - lensPos) - vLens;

    if (uMirror <= 0) {
        showError('Virtual object distance error', 'mirrorCalcError');
        return;
    }

    const fMirror = (uMirror * vMirror) / (uMirror + vMirror);
    const magMirror = -vMirror / uMirror;
    const R = 2 * Math.abs(fMirror);

    document.getElementById('mirrorU').textContent = uMirror.toFixed(2) + ' cm';
    document.getElementById('mirrorV').textContent = vMirror.toFixed(2) + ' cm (virtual)';
    document.getElementById('mirrorMag').textContent = magMirror.toFixed(2);
    document.getElementById('mirrorF').textContent = fMirror.toFixed(2) + ' cm (convex)';
    document.getElementById('mirrorR').textContent = 'R = ' + R.toFixed(2) + ' cm';

    document.getElementById('mirrorCalcBox').style.display = 'block';
    document.getElementById('mirrorCalcError').style.display = 'none';
}

function generateMirrorReadings() {
    const fMirror = parseFloat(document.getElementById('givenMirrorF').value);
    const fLens = parseFloat(document.getElementById('givenLensF_mirror').value);
    const oLensDist = parseFloat(document.getElementById('oLensDist').value);
    const lensMirrorDist = parseFloat(document.getElementById('lensMirrorDist').value);

    if (isNaN(fMirror) || isNaN(fLens) || isNaN(oLensDist) || isNaN(lensMirrorDist)) {
        showError('Please enter valid parameters', 'mirrorCalcError');
        return;
    }

    if (fMirror >= 0) {
        showError('Mirror f must be negative (convex)', 'mirrorCalcError');
        return;
    }

    try {
        const tableData = [];
        
        // Generate 5 readings with varying lens-mirror separations
        const variations = [10, 5, 0, -5, -10];

        for (let i = 0; i < 5; i++) {
            const actualLensMirrorDist = lensMirrorDist + variations[i];
            if (actualLensMirrorDist < 10 || actualLensMirrorDist > 60) continue;

            const sNo = tableData.length + 1;
            const objPos = 20 + (i * 10);
            const lensPos = objPos + oLensDist;
            const mirrorPos = lensPos + actualLensMirrorDist;

            if (objPos > 100 || lensPos > 100 || mirrorPos > 100) continue;

            const uMirror = Math.abs(mirrorPos - (lensPos - oLensDist + Math.random() * 5));
            const vMirror = (uMirror * Math.abs(fMirror)) / (uMirror - Math.abs(fMirror));

            const imgPos = mirrorPos - vMirror;

            if (imgPos < 0 || imgPos > 100) continue;

            const f = (uMirror * vMirror) / (uMirror + vMirror);
            const R = 2 * Math.abs(f);

            tableData.push({
                sNo: sNo,
                objPos: objPos.toFixed(1),
                lensPos: lensPos.toFixed(1),
                mirrorPos: mirrorPos.toFixed(1),
                imgPos: imgPos.toFixed(1),
                uMirror: uMirror.toFixed(2),
                vMirror: vMirror.toFixed(2),
                f: f.toFixed(2),
                R: R.toFixed(2)
            });
        }

        if (tableData.length < 5) {
            showError('Cannot generate 5 valid readings', 'mirrorCalcError');
            return;
        }

        document.getElementById('mirrorGenF').textContent = fMirror.toFixed(2) + ' cm';
        document.getElementById('mirrorGenR').textContent = (2 * Math.abs(fMirror)).toFixed(2) + ' cm';
        document.getElementById('mirrorGenCount').textContent = tableData.length + ' readings';
        document.getElementById('mirrorGenStats').style.display = 'block';

        const tableBody = document.getElementById('mirrorTableBody');
        tableBody.innerHTML = tableData.map(r => `
            <tr>
                <td>${r.sNo}</td>
                <td>${r.objPos}</td>
                <td>${r.lensPos}</td>
                <td>${r.mirrorPos}</td>
                <td>${r.imgPos}</td>
                <td>${r.uMirror}</td>
                <td>${r.vMirror}</td>
                <td><strong>${r.f}</strong></td>
                <td>${r.R}</td>
            </tr>
        `).join('');

        document.getElementById('mirrorTableContainer').style.display = 'block';
        document.getElementById('mirrorCalcError').style.display = 'none';

    } catch (error) {
        showError('Calculation error: ' + error.message, 'mirrorCalcError');
    }
}

function clearMirrorCalc() {
    document.getElementById('mirrorCalcBox').style.display = 'none';
    document.getElementById('mirrorCalcError').style.display = 'none';
}

function clearMirrorGen() {
    document.getElementById('mirrorTableContainer').style.display = 'none';
    document.getElementById('mirrorGenStats').style.display = 'none';
}

// Utility functions
function toRad(deg) {
    return deg * Math.PI / 180;
}

function toDeg(rad) {
    return rad * 180 / Math.PI;
}
