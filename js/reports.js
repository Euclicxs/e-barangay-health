document.addEventListener('DOMContentLoaded', () => {
  // Validate session - page is BHW-only now
  if (!validateSession('bhw')) {
    return;
  }

  // Update user profile information
  function updateUserProfile() {
    console.log('=== updateUserProfile called ===');
    const session = getSession();
    if (!session) return;

    const userName = getCurrentUserName();
    const userId = getCurrentUserId();

    // Update user profile in sidebar
    const userAvatar = document.querySelector('.user-profile .avatar');
    const userNameElement = document.getElementById('userNameDisplay') || document.querySelector('.user-info h4');
    const userRoleElement = document.getElementById('userRoleDisplay') || document.querySelector('.user-info p');

    if (userAvatar) {
      const firstLetter = userName.charAt(0).toUpperCase();
      userAvatar.textContent = firstLetter;
      userAvatar.style.display = 'flex';
      userAvatar.style.alignItems = 'center';
      userAvatar.style.justifyContent = 'center';
      userAvatar.style.visibility = 'visible';
      console.log('✓ Avatar:', firstLetter);
    }

    if (userNameElement) {
      userNameElement.textContent = userName;
    }

    if (userRoleElement) {
      if (session.userType === 'admin') {
        userRoleElement.textContent = 'Admin Access';
      } else {
        userRoleElement.textContent = `BHW ● ID: ${userId}`;
      }
    }
  }

  // Real-time Clock
  function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('clock-time');
    const dateElement = document.getElementById('clock-date');
    
    if (timeElement && dateElement) {
      timeElement.textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      dateElement.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  }
  // Logout functionality
  const logoutBtn = document.querySelector('.btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        clearSession();
        window.location.href = 'login.html';
      }
    });
  }

  // ========== DATA LAYER (scoped to the logged-in BHW's assigned puroks) ==========
  const VACCINE_ORDER = ['BCG', 'OPV', 'IPV', 'PENTA', 'PCV', 'MCV1', 'MCV2'];
  const VACCINE_DONUT_COLORS = ['#06b6d4', '#22c55e', '#eab308', '#ef4444', '#3b82f6', '#ec4899', '#f97316'];
  const VACCINE_LEGEND_CLASSES = ['bg-cyan', 'bg-green', 'bg-yellow', 'bg-red', 'bg-blue', 'bg-pink', 'bg-orange'];

  function getAssignedPurokKeys() {
    if (typeof getCurrentUserAssignedPuroks === 'function') {
      const keys = getCurrentUserAssignedPuroks();
      if (keys && keys.length) return keys;
    }
    return null; // no assignment info => show all
  }

  function getScopeKeys() {
    const assigned = getAssignedPurokKeys();
    if (assigned) return assigned;
    return typeof purokData !== 'undefined' ? Object.keys(purokData) : [];
  }

  function getPurokKeyName(key) {
    if (typeof purokData !== 'undefined' && purokData[key]) return purokData[key].name;
    return String(key);
  }

  function scopedRecords() {
    const records = [];
    getScopeKeys().forEach(key => {
      if (typeof purokData === 'undefined') return;
      const purok = purokData[key];
      if (!purok || !purok.records) return;
      purok.records.forEach(rec => {
        const status = computeStatus(rec.nextVisitDate, rec.lastVisitDate);
        records.push({ rec, purok: purok.name, purokKey: key, status });
      });
    });
    return records;
  }

  function scopedChildren() {
    return scopedRecords().filter(item => item.rec.type === 'Child');
  }

  function scopedMothers() {
    return scopedRecords().filter(item => item.rec.type === 'Mother');
  }

  function rangeStatusClass(rate) {
    if (rate >= 80) return 'green-dot';
    if (rate >= 50) return 'yellow-dot';
    return 'red-dot';
  }

  function rangeTextClass(rate) {
    if (rate >= 80) return 'text-green';
    if (rate >= 50) return 'text-yellow';
    return 'text-red';
  }

  const scopeKeys = getScopeKeys();
  const allRecords = scopedRecords();
  const children = scopedChildren();
  const mothers = scopedMothers();
  const totalChildren = children.length;
  const totalMothers = mothers.length;

  const childrenCompleted = children.filter(item => item.status === 'Completed').length;
  const mothersCompleted = mothers.filter(item => item.status === 'Completed').length;
  const totalVisits = allRecords.length;
  const completedTotal = allRecords.filter(item => item.status === 'Completed').length;

  const totalHouseholds = scopeKeys.reduce((sum, key) => {
    return sum + (typeof purokData !== 'undefined' && purokData[key] ? (Number(purokData[key].households) || 0) : 0);
  }, 0);

  // Per-vaccine coverage across scoped children
  const vaccineCounts = {};
  VACCINE_ORDER.forEach(v => vaccineCounts[v] = 0);
  children.forEach(item => {
    (item.rec.vaccines || []).forEach(v => {
      if (vaccineCounts.hasOwnProperty(v)) vaccineCounts[v] += 1;
    });
  });

  const vaccineCoverage = {};
  VACCINE_ORDER.forEach(v => {
    vaccineCoverage[v] = totalChildren ? Math.round((vaccineCounts[v] / totalChildren) * 100) : 0;
  });

  const totalDoses = VACCINE_ORDER.reduce((sum, v) => sum + vaccineCounts[v], 0);

  // Maternal care coverage (TT ladder, iron supplementation, high-BP monitoring)
  function parseBpForReports(bp) {
    const parts = String(bp || '').split('/');
    return { sys: parseInt(parts[0], 10) || 0, dia: parseInt(parts[1], 10) || 0 };
  }
  function isHighBpForReports(bp) {
    const { sys, dia } = parseBpForReports(bp);
    return sys >= 130 || dia >= 80;
  }
  const ttReach = [0, 0, 0, 0, 0, 0];
  mothers.forEach(item => {
    const dose = parseInt(String(item.rec.ttDose).replace(/\D/g, ''), 10) || 0;
    for (let d = 1; d <= Math.min(dose, 5); d++) ttReach[d] += 1;
  });
  const ironCount = mothers.filter(item => !!item.rec.iron).length;
  const highBpCount = mothers.filter(item => isHighBpForReports(item.rec.bp)).length;

  // Active BHWs across scoped puroks (distinct)
  const activeBhwIds = new Set();
  if (typeof getUsersByPurokKey === 'function') {
    scopeKeys.forEach(key => {
      const users = getUsersByPurokKey(key);
      (users || []).forEach(u => activeBhwIds.add(u.id || u.code || u.name));
    });
  }
  const activeBhwCount = activeBhwIds.size > 0 ? activeBhwIds.size : (allRecords.length ? 1 : 0);

  // Vaccination rate per purok (% of children with the full primary series)
  const purokRateMap = {};
  scopeKeys.forEach(key => {
    const ch = allRecords.filter(item => item.purokKey === key && item.rec.type === 'Child');
    if (!ch.length) {
      purokRateMap[key] = 0;
      return;
    }
    const fully = ch.filter(item => (item.rec.vaccines || []).length >= VACCINE_ORDER.length).length;
    purokRateMap[key] = Math.round((fully / ch.length) * 100);
  });

  const purokChartData = {
    labels: scopeKeys.map(getPurokKeyName),
    values: scopeKeys.map(key => purokRateMap[key]),
    colors: scopeKeys.map(key => {
      const rate = purokRateMap[key];
      if (rate >= 80) return '#22c55e';
      if (rate >= 50) return '#eab308';
      if (rate > 0) return '#ef4444';
      return '#334155';
    })
  };

  const vaccineChartData = {
    labels: VACCINE_ORDER,
    values: VACCINE_ORDER.map(v => vaccineCounts[v])
  };

  // Coverage % for BHW log
  const coveragePct = allRecords.length ? Math.round((completedTotal / allRecords.length) * 100) : 0;

  // Update the page subtitle with the scope being displayed
  const subtitleEl = document.querySelector('.page-title-section p');
  if (subtitleEl) {
    const base = 'Generate and download health reports for Brgy. New Katipunan, Matanao';
    const names = scopeKeys.map(getPurokKeyName);
    subtitleEl.textContent = assignedKeysPresent()
      ? `${base} — Showing assigned puroks: ${names.join(' · ')}`
      : base;
  }

  function assignedKeysPresent() {
    const assigned = getAssignedPurokKeys();
    return assigned !== null && assigned.length > 0;
  }

  // Populate top report cards with computed values
  const reportCards = document.querySelectorAll('.reports-three-col .report-card');
  if (reportCards.length >= 1) {
    const strongEls = reportCards[0].querySelectorAll('.report-stats-list strong');
    if (strongEls[0]) strongEls[0].textContent = String(totalHouseholds);
    if (strongEls[1]) strongEls[1].textContent = String(childrenCompleted);
    if (strongEls[2]) strongEls[2].textContent = String(mothersCompleted);
    console.log(`Monthly: households=${totalHouseholds}, children=${childrenCompleted}, mothers=${mothersCompleted}`);
  }
  if (reportCards.length >= 2) {
    const listEl = reportCards[1].querySelector('.report-stats-list');
    if (listEl) {
      listEl.innerHTML = VACCINE_ORDER.map(v => {
        const pct = vaccineCoverage[v];
        return `<p><span class="dot ${rangeStatusClass(pct)}"></span> ${v}: <strong class="${rangeTextClass(pct)}">${pct}%</strong> <span class="text-cyan" style="font-size:11px; font-weight:400;">(${vaccineCounts[v]}/${totalChildren})</span></p>`;
      }).join('');
      console.log('Vaccination coverage updated', vaccineCoverage);
    }
  }
  if (reportCards.length >= 3) {
    const strongEls = reportCards[2].querySelectorAll('.report-stats-list strong');
    if (strongEls[0]) strongEls[0].textContent = String(totalVisits);
    if (strongEls[1]) strongEls[1].textContent = String(activeBhwCount);
    if (strongEls[2]) strongEls[2].textContent = `${coveragePct}%`;
    console.log(`BHW log: visits=${totalVisits}, active=${activeBhwCount}, coverage=${coveragePct}%`);
  }
  if (reportCards.length >= 4) {
    const listEl = reportCards[3].querySelector('.report-stats-list');
    if (listEl) {
      const rows = [];
      for (let d = 1; d <= 5; d++) {
        const pct = totalMothers ? Math.round((ttReach[d] / totalMothers) * 100) : 0;
        rows.push(`<p><span class="dot ${rangeStatusClass(pct)}"></span> TT ${d} Reached: <strong class="${rangeTextClass(pct)}">${pct}%</strong> <span class="text-cyan" style="font-size:11px; font-weight:400;">(${ttReach[d]}/${totalMothers})</span></p>`);
      }
      const ironPct = totalMothers ? Math.round((ironCount / totalMothers) * 100) : 0;
      rows.push(`<p><span class="dot ${rangeStatusClass(ironPct)}"></span> Iron Supp.: <strong class="${rangeTextClass(ironPct)}">${ironPct}%</strong> <span class="text-cyan" style="font-size:11px; font-weight:400;">(${ironCount}/${totalMothers})</span></p>`);
      const bpPct = totalMothers ? Math.round((highBpCount / totalMothers) * 100) : 0;
      const bpDot = bpPct > 0 ? 'red-dot' : 'green-dot';
      const bpText = bpPct > 0 ? 'text-red' : 'text-green';
      rows.push(`<p><span class="dot ${bpDot}"></span> High BP: <strong class="${bpText}">${bpPct}%</strong> <span class="text-cyan" style="font-size:11px; font-weight:400;">(${highBpCount}/${totalMothers})</span></p>`);
      listEl.innerHTML = rows.join('');
      console.log(`Maternal coverage: iron=${ironCount}, highBP=${highBpCount}, ttReach=${ttReach.slice(1).join(',')}`);
    }
  }

  // ========== CHARTS ==========
  const barReady = typeof Chart !== 'undefined' && document.getElementById('purokBarChart');
  const donutReady = typeof Chart !== 'undefined' && document.getElementById('vaccineDonutChart');

  if (barReady) {
    const ctxBar = document.getElementById('purokBarChart').getContext('2d');
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: purokChartData.labels,
        datasets: [{
          data: purokChartData.values,
          backgroundColor: purokChartData.colors,
          borderRadius: 4,
          barThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 25,
              callback: value => value + '%',
              color: '#64748b',
              font: { size: 10 }
            },
            grid: { color: '#1e293b' }
          },
          x: {
            ticks: {
              color: '#94a3b8',
              font: { size: 10 }
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  if (donutReady) {
    const ctxDonut = document.getElementById('vaccineDonutChart').getContext('2d');
    new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: vaccineChartData.labels,
        datasets: [{
          data: vaccineChartData.values,
          backgroundColor: VACCINE_DONUT_COLORS,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // Refresh the donut legend numbers from computed distribution
  const donutLegendEl = document.querySelector('.donut-legend');
  if (donutLegendEl) {
    donutLegendEl.innerHTML = VACCINE_ORDER.map((v, idx) => {
      return `<span><span class="legend-box ${VACCINE_LEGEND_CLASSES[idx]}"></span> ${v} <strong>${vaccineCounts[v]}</strong></span>`;
    }).join('');
  }

  // ========== REPORTS & EXPORTS BUTTONS ==========
  const btnExportPDF = document.getElementById('btnExportPDF');
  const btnExportExcel = document.getElementById('btnExportExcel');
  const btnPrintReport = document.getElementById('btnPrintReport');

  if (btnExportPDF) {
    btnExportPDF.addEventListener('click', () => {
      const period = document.getElementById('filter-date-display')?.value || 'October 2026';
      alert(`✅ Export to PDF\n\nGenerating PDF report for: ${period}\n\nThis would download:\n📄 Health Report - ${period}.pdf\n📊 Contains all vaccination data, statistics, and charts`);
    });
  }

  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', () => {
      const period = document.getElementById('filter-date-display')?.value || 'October 2026';
      alert(`✅ Export to Excel\n\nGenerating Excel spreadsheet for: ${period}\n\nThis would download:\n📄 Health Data - ${period}.xlsx\n📋 Includes all patient records in tabular format`);
    });
  }

  if (btnPrintReport) {
    btnPrintReport.addEventListener('click', () => {
      alert(`🖨️ Print Report\n\nOpening print preview...\n\nThis would open the browser print dialog with a formatted report.`);
    });
  }

  const btnGenerateCustom = document.getElementById('btnGenerateCustom');
  if (btnGenerateCustom) {
    btnGenerateCustom.addEventListener('click', () => {
      alert(`📊 Generate Custom Report\n\nOpening custom report builder...\n\nThis would allow you to:\n📌 Select specific puroks\n📅 Choose date range\n🗂️ Pick data categories\n📤 Customize output format`);
    });
  }

  // Initialize - Update profile immediately
  updateUserProfile();

  // ========== DATE PERIOD FILTER BUTTONS ==========
  const quickDateBtns = document.querySelectorAll('.btn-quick-date');
  const dateDisplay = document.getElementById('filter-date-display');
  const periodTag = document.getElementById('active-period-tag');

  quickDateBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      quickDateBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const period = this.getAttribute('data-period');
      const fullMonth = period === 'Aug 2026' ? 'August 2026' : 
                       (period === 'Sep 2026' ? 'September 2026' : 'October 2026');

      if (dateDisplay) dateDisplay.value = fullMonth;
      if (periodTag) periodTag.textContent = `${fullMonth} Health Report`;

      console.log(`Switched to period: ${fullMonth}`);
    });
  });

  // CSV builders
  function buildVaccinationCsv() {
    let csv = 'Vaccine,Coverage,Total_Children,Immunized\n';
    VACCINE_ORDER.forEach(v => {
      csv += `${v},${vaccineCoverage[v]}%,${totalChildren},${vaccineCounts[v]}\n`;
    });
    return csv;
  }

  function buildMonthlyCsv() {
    let csv = 'Category,Count,Percentage\n';
    const base = totalHouseholds || 1;
    csv += `Households,${totalHouseholds},100%\n`;
    csv += `Children Immunized,${childrenCompleted},${totalHouseholds ? Math.round((childrenCompleted / base) * 100) : 0}%\n`;
    csv += `Mothers Checked,${mothersCompleted},${totalHouseholds ? Math.round((mothersCompleted / base) * 100) : 0}%\n`;
    return csv;
  }

  function buildBhwCsv() {
    let csv = 'Category,Count,Value\n';
    csv += `Total Visits,${totalVisits},-\n`;
    csv += `Active BHWs,${activeBhwCount},-\n`;
    csv += `Coverage,${coveragePct}%,${coveragePct}%\n`;
    return csv;
  }

  function buildMaternalCsv() {
    let csv = 'Indicator,Reached,Total_Mothers,Percentage\n';
    for (let d = 1; d <= 5; d++) {
      const pct = totalMothers ? Math.round((ttReach[d] / totalMothers) * 100) : 0;
      csv += `TT ${d} Reached,${ttReach[d]},${totalMothers},${pct}%\n`;
    }
    const ironPct = totalMothers ? Math.round((ironCount / totalMothers) * 100) : 0;
    csv += `Iron Supplementation,${ironCount},${totalMothers},${ironPct}%\n`;
    const bpPct = totalMothers ? Math.round((highBpCount / totalMothers) * 100) : 0;
    csv += `High BP (>= 130/80),${highBpCount},${totalMothers},${bpPct}%\n`;
    return csv;
  }

  function triggerDownload(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  function matchingCsvFor(title) {
    if (totalChildren === 0 && totalMothers === 0) return buildMonthlyCsv();
    if (title.includes('Vaccination')) return buildVaccinationCsv();
    if (title.includes('Accomplishment')) return buildMonthlyCsv();
    if (title.includes('Maternal') || title.includes('Prenatal')) return buildMaternalCsv();
    if (title.includes('BHW')) return buildBhwCsv();
    return buildMonthlyCsv();
  }

  // Download PDF buttons — open the print dialog scoped to that report card
  const pdfButtons = document.querySelectorAll('.btn-report-action:not(.btn-outline)');
  pdfButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const reportCard = this.closest('.report-card');
      const reportTitle = reportCard && reportCard.querySelector('h3') ? reportCard.querySelector('h3').textContent : 'Report';
      const period = dateDisplay ? dateDisplay.value : 'October 2026';

      console.log(`Generating PDF: ${reportTitle} for ${period}`);

      const dateEl = document.querySelector('.print-date-text');
      if (dateEl) dateEl.textContent = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

      if (reportCard) reportCard.classList.add('print-this');
      window.print();
      if (reportCard) reportCard.classList.remove('print-this');
    });
  });

  // Export CSV buttons (report cards)
  const csvButtons = document.querySelectorAll('.btn-report-action.btn-outline');
  csvButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const reportCard = this.closest('.report-card');
      const reportTitle = reportCard.querySelector('h3')?.textContent || 'Data';
      const period = dateDisplay ? dateDisplay.value : 'October 2026';

      console.log(`Exporting CSV: ${reportTitle} for ${period}`);

      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Exporting...';
      this.disabled = true;

      setTimeout(() => {
        this.innerHTML = originalText;
        this.disabled = false;

        const csvData = matchingCsvFor(reportTitle);
        const filename = `${reportTitle.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.csv`;
        triggerDownload(csvData, filename);
        alert(`✅ CSV Exported!\n\nFile: ${filename}\n\nDownloaded to your Downloads folder!`);
      }, 1500);
    });
  });

  // Print buttons (if any) — open the print dialog for the current report view
  const printButtons = document.querySelectorAll('.btn-print');
  printButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const dateEl = document.querySelector('.print-date-text');
      if (dateEl) dateEl.textContent = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
      window.print();
    });
  });

  console.log('Reports & Exports functionality loaded');

  // ========== CHART EXPORT FUNCTIONALITY ==========
  // Export Vaccination Rate per Purok Chart
  const btnChartExport = document.querySelector('.btn-chart-export');
  if (btnChartExport) {
    btnChartExport.addEventListener('click', () => {
      const period = document.getElementById('filter-date-display')?.value || 'October 2026';

      let csvContent = 'Purok,Vaccination_Rate_(%),Status\n';

      purokChartData.labels.forEach((label, index) => {
        const rate = purokChartData.values[index];
        let status = '';
        if (rate >= 80) status = 'Complete';
        else if (rate >= 50) status = 'Moderate';
        else if (rate > 0) status = 'Concern';
        else status = 'No Data';

        csvContent += `${label},${rate},${status}\n`;
      });

      csvContent += '\n';
      csvContent += 'SUMMARY STATISTICS\n';
      const average = (purokChartData.values.reduce((a, b) => a + b, 0) / (purokChartData.values.length || 1) || 0).toFixed(1);
      const highest = purokChartData.values.length ? Math.max(...purokChartData.values) : 0;
      const lowest = purokChartData.values.length ? Math.min(...purokChartData.values) : 0;
      csvContent += `Average_Rate,${average}%\n`;
      csvContent += `Highest_Rate,${highest}%\n`;
      csvContent += `Lowest_Rate,${lowest}%\n`;

      const filename = `Vaccination_Rate_per_Purok_${period.replace(/\s+/g, '_')}.csv`;
      triggerDownload(csvContent, filename);

      console.log(`✓ Exported: ${filename}`);
      alert(`✓ CSV Exported Successfully!\n\nFile: ${filename}\n\n${purokChartData.labels.length} Puroks exported\nAverage vaccination rate: ${average}%`);
    });
  }

  // Export Vaccine Distribution Chart
  const btnDonutExport = document.querySelector('.btn-donut-export');
  if (btnDonutExport) {
    btnDonutExport.addEventListener('click', () => {
      const period = document.getElementById('filter-date-display')?.value || 'October 2026';

      let csvContent = 'Vaccine_Type,Doses_Administered,Percentage_of_Total\n';

      const dosesTotal = vaccineChartData.values.reduce((a, b) => a + b, 0);

      vaccineChartData.labels.forEach((label, index) => {
        const doses = vaccineChartData.values[index];
        const percentage = dosesTotal ? ((doses / dosesTotal) * 100).toFixed(1) : '0.0';
        csvContent += `${label},${doses},${percentage}%\n`;
      });

      csvContent += '\n';
      csvContent += 'SUMMARY\n';
      csvContent += `Total_Doses_Administered,${dosesTotal}\n`;
      csvContent += `Vaccine_Types,${vaccineChartData.labels.length}\n`;
      csvContent += `Period,${period}\n`;

      const filename = `Vaccine_Distribution_${period.replace(/\s+/g, '_')}.csv`;
      triggerDownload(csvContent, filename);

      console.log(`✓ Exported: ${filename}`);
      alert(`✓ CSV Exported Successfully!\n\nFile: ${filename}\n\n${vaccineChartData.labels.length} Vaccine types exported\nTotal doses: ${dosesTotal}`);
    });
  }

  // Start clock
  setInterval(updateClock, 1000);
  updateClock();
});