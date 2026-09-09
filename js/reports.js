document.addEventListener('DOMContentLoaded', () => {
  // Validate session - allow both admin and BHW users
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }
  if (session.userType !== 'admin' && session.userType !== 'bhw') {
    window.location.href = 'login.html';
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
      console.log('? Avatar:', firstLetter);
    }

    if (userNameElement) {
      userNameElement.textContent = userName;
    }

    if (userRoleElement) {
      if (session.userType === 'admin') {
        userRoleElement.textContent = 'Admin Access';
      } else {
        userRoleElement.textContent = `BHW ? ID: ${userId}`;
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

  // 1. BAR CHART (Vaccination Rate per Purok)
  const ctxBar = document.getElementById('purokBarChart').getContext('2d');
  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Calachuchi', 'Bougainvillea', 'Walingwaling', 'Sampaguita', 'Santan', 'Rose', 'Daisy'],
      datasets: [{
        data: [75, 100, 30, 100, 0, 100, 50],
        backgroundColor: [
          '#eab308', // Calachuchi - 75% Yellow
          '#22c55e', // Bougainvillea - 100% Green
          '#ef4444', // Walingwaling - 30% Red
          '#22c55e', // Sampaguita - 100% Green
          '#334155', // Santan - 0% Dark Gray
          '#22c55e', // Rose - 100% Green
          '#eab308'  // Daisy - 50% Yellow
        ],
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

  // 2. DONUT CHART (Vaccine Distribution)
  const ctxDonut = document.getElementById('vaccineDonutChart').getContext('2d');
  new Chart(ctxDonut, {
    type: 'doughnut',
  data: {
    labels: ['BCG', 'OPV', 'IPV', 'PENTA', 'PCV', 'MCV1', 'MCV2'],
    datasets: [{
      data: [9, 7, 6, 8, 5, 4, 3], // 7 numbers dapat ito!
      backgroundColor: [
        '#06b6d4', // Cyan (BCG)
        '#22c55e', // Green (OPV)
        '#eab308', // Yellow (IPV)
        '#ef4444', // Red (PENTA)
        '#3b82f6', // Blue (PCV)
        '#ec4899', // Pink (MCV1)
        '#f97316'  // Orange (MCV2)
      ],
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


  // REPORTS & EXPORTS BUTTON FUNCTIONALITY - Export buttons
  const btnExportPDF = document.getElementById('btnExportPDF');
  const btnExportExcel = document.getElementById('btnExportExcel');
  const btnPrintReport = document.getElementById('btnPrintReport');

  if (btnExportPDF) {
    btnExportPDF.addEventListener('click', () => {
      const period = document.getElementById('filter-date-display')?.value || 'August 2026';
      alert(`?? Export to PDF\n\nGenerating PDF report for: ${period}\n\nThis would download:\n? Health Report - ${period}.pdf\n? Contains all vaccination data, statistics, and charts`);
    });
  }

  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', () => {
      const period = document.getElementById('filter-date-display')?.value || 'August 2026';
      alert(`?? Export to Excel\n\nGenerating Excel spreadsheet for: ${period}\n\nThis would download:\n? Health Data - ${period}.xlsx\n? Includes all patient records in tabular format`);
    });
  }

  if (btnPrintReport) {
    btnPrintReport.addEventListener('click', () => {
      alert(`??? Print Report\n\nOpening print preview...\n\nThis would open the browser print dialog with a formatted report.`);
      // window.print(); // Uncomment to actually print
    });
  }

  // Generate Custom Report button
  const btnGenerateCustom = document.getElementById('btnGenerateCustom');
  if (btnGenerateCustom) {
    btnGenerateCustom.addEventListener('click', () => {
      alert(`?? Generate Custom Report\n\nOpening custom report builder...\n\nThis would allow you to:\n? Select specific puroks\n? Choose date range\n? Pick data categories\n? Customize output format`);
    });
  }

  // Initialize - Update profile immediately
  updateUserProfile();
  
  // Force update profile again after DOM fully loaded
  setTimeout(() => {
    updateUserProfile();
  }, 100);

  // Add admin navigation section if user is admin
  if (session && session.userType === 'admin') {
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (sidebarFooter) {
      const adminSection = document.createElement('div');
      adminSection.className = 'menu-section';
      adminSection.style.marginTop = 'auto';
      adminSection.innerHTML = `
        <span class="menu-title">ADMIN PANEL</span>
        <ul class="menu-list">
          <li>
            <a href="admin.html">
              <i class="fa-solid fa-user-shield"></i>
              <span>Return to Admin</span>
            </a>
          </li>
        </ul>
      `;
      sidebarFooter.parentNode.insertBefore(adminSection, sidebarFooter);
    }
  }


  // ========== REPORTS & EXPORTS FUNCTIONALITY ==========
  
  // Date period filter buttons - consolidated implementation
  const quickDateBtns = document.querySelectorAll('.btn-quick-date');
  const dateDisplay = document.getElementById('filter-date-display');
  const periodTag = document.getElementById('active-period-tag');
  
  quickDateBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active from all buttons
      quickDateBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked button
      this.classList.add('active');
      
      // Update display
      const period = this.getAttribute('data-period');
      const fullMonth = period === 'Aug 2026' ? 'August 2026' : 
                       (period === 'Sep 2026' ? 'September 2026' : 'October 2026');
      
      if (dateDisplay) dateDisplay.value = fullMonth;
      if (periodTag) periodTag.textContent = `${fullMonth} Health Report`;
      
      console.log(`Switched to period: ${fullMonth}`);
    });
  });
  
  // Download PDF buttons
  const pdfButtons = document.querySelectorAll('.btn-report-action:not(.btn-outline)');
  pdfButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const reportCard = this.closest('.report-card');
      const reportTitle = reportCard.querySelector('h3')?.textContent || 'Report';
      const period = dateDisplay ? dateDisplay.value : 'October 2026';
      
      // Simulate PDF generation
      console.log(`Generating PDF: ${reportTitle} for ${period}`);
      
      // Show loading state
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...';
      this.disabled = true;
      
      // Simulate download after 2 seconds
      setTimeout(() => {
        this.innerHTML = originalText;
        this.disabled = false;
        
        // Create dummy PDF download
        const filename = `${reportTitle.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.pdf`;
        alert(`? PDF Generated!\n\nFile: ${filename}\n\nIn a real system, this would:\n� Generate actual PDF with report data\n� Include charts and statistics\n� Auto-download to your device`);
      }, 2000);
    });
  });
  
  // Export CSV buttons
  const csvButtons = document.querySelectorAll('.btn-report-action.btn-outline');
  csvButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const reportCard = this.closest('.report-card');
      const reportTitle = reportCard.querySelector('h3')?.textContent || 'Data';
      const period = dateDisplay ? dateDisplay.value : 'October 2026';
      
      console.log(`Exporting CSV: ${reportTitle} for ${period}`);
      
      // Show loading state
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Exporting...';
      this.disabled = true;
      
      // Simulate export after 1.5 seconds
      setTimeout(() => {
        this.innerHTML = originalText;
        this.disabled = false;
        
        // Create sample CSV data
        let csvData = '';
        const filename = `${reportTitle.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.csv`;
        
        if (reportTitle.includes('Vaccination')) {
          csvData = 'Vaccine,Coverage,Total_Children,Immunized\n';
          csvData += 'BCG,90%,10,9\n';
          csvData += 'OPV,70%,10,7\n';
          csvData += 'IPV,50%,10,5\n';
          csvData += 'PENTA,40%,10,4\n';
          csvData += 'PCV,50%,10,5\n';
          csvData += 'MCV1,30%,10,3\n';
          csvData += 'MCV2,30%,10,3\n';
        } else if (reportTitle.includes('Maternal')) {
          csvData = 'Mother_Name,Purok,BP,Weight,Status\n';
          csvData += 'Rosario Torres,Walingwaling,120/80,65kg,Completed\n';
          csvData += 'Cristina Navarro,Sampaguita,140/90,70kg,Overdue\n';
          csvData += 'Analiza Soriano,Santan,115/75,62kg,Due\n';
        } else {
          csvData = 'Category,Count,Percentage\n';
          csvData += 'Households,120,100%\n';
          csvData += 'Children Immunized,10,8.3%\n';
          csvData += 'Mothers Checked,8,6.7%\n';
        }
        
        // Create download
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert(`? CSV Exported!\n\nFile: ${filename}\n\nDownloaded to your Downloads folder!`);
      }, 1500);
    });
  });
  
  // Print buttons (if any)
  const printButtons = document.querySelectorAll('.btn-print');
  printButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const period = dateDisplay ? dateDisplay.value : 'October 2026';
      console.log(`Opening print dialog for ${period}`);
      
      alert(`? Print Preview\n\nOpening print dialog for ${period} report...\n\nIn a real system, this would:\n� Format the report for printing\n� Show print preview\n� Allow printer selection`);
      
      // window.print(); // Uncomment to actually print
    });
  });
  
  console.log('Reports & Exports functionality loaded');

  // ========== CHART EXPORT FUNCTIONALITY ==========
  
  // Define chart data (same as what's displayed in the charts)
  const purokChartData = {
    labels: ['Calachuchi', 'Bougainvillea', 'Walingwaling', 'Sampaguita', 'Santan', 'Rose', 'Daisy'],
    values: [75, 100, 30, 100, 0, 100, 50]
  };
  
  const vaccineChartData = {
    labels: ['BCG', 'OPV', 'IPV', 'PENTA', 'PCV', 'MCV1', 'MCV2'],
    values: [9, 7, 6, 8, 5, 4, 3]
  };
  
  // Export Vaccination Rate per Purok Chart
  const btnChartExport = document.querySelector('.btn-chart-export');
  if (btnChartExport) {
    btnChartExport.addEventListener('click', () => {
      const period = document.getElementById('filter-date-display')?.value || 'October 2026';
      
      console.log('Exporting Vaccination Rate per Purok chart data...');
      
      // Create CSV content
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
      
      // Add summary statistics
      csvContent += '\n';
      csvContent += 'SUMMARY STATISTICS\n';
      const average = (purokChartData.values.reduce((a, b) => a + b, 0) / purokChartData.values.length).toFixed(1);
      const highest = Math.max(...purokChartData.values);
      const lowest = Math.min(...purokChartData.values);
      csvContent += `Average_Rate,${average}%\n`;
      csvContent += `Highest_Rate,${highest}%\n`;
      csvContent += `Lowest_Rate,${lowest}%\n`;
      
      // Create download
      const filename = `Vaccination_Rate_per_Purok_${period.replace(/\s+/g, '_')}.csv`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✓ Exported: ${filename}`);
      alert(`✓ CSV Exported Successfully!\n\nFile: ${filename}\n\n${purokChartData.labels.length} Puroks exported\nAverage vaccination rate: ${average}%\n\nDownloaded to your Downloads folder!`);
    });
  }
  
  // Export Vaccine Distribution Chart
  const btnDonutExport = document.querySelector('.btn-donut-export');
  if (btnDonutExport) {
    btnDonutExport.addEventListener('click', () => {
      const period = document.getElementById('filter-date-display')?.value || 'October 2026';
      
      console.log('Exporting Vaccine Distribution chart data...');
      
      // Create CSV content
      let csvContent = 'Vaccine_Type,Doses_Administered,Percentage_of_Total\n';
      
      const totalDoses = vaccineChartData.values.reduce((a, b) => a + b, 0);
      
      vaccineChartData.labels.forEach((label, index) => {
        const doses = vaccineChartData.values[index];
        const percentage = ((doses / totalDoses) * 100).toFixed(1);
        csvContent += `${label},${doses},${percentage}%\n`;
      });
      
      // Add summary
      csvContent += '\n';
      csvContent += 'SUMMARY\n';
      csvContent += `Total_Doses_Administered,${totalDoses}\n`;
      csvContent += `Vaccine_Types,${vaccineChartData.labels.length}\n`;
      csvContent += `Period,${period}\n`;
      
      // Create download
      const filename = `Vaccine_Distribution_${period.replace(/\s+/g, '_')}.csv`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✓ Exported: ${filename}`);
      alert(`✓ CSV Exported Successfully!\n\nFile: ${filename}\n\n${vaccineChartData.labels.length} Vaccine types exported\nTotal doses: ${totalDoses}\n\nDownloaded to your Downloads folder!`);
    });
  }

  // Start clock
  setInterval(updateClock, 1000);
  updateClock();
});