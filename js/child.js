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
    const session = getSession();
    if (!session) return;

    const userName = getCurrentUserName();

    const userAvatar = document.getElementById('userAvatar') || document.querySelector('.user-profile .avatar');
    const userNameElement = document.getElementById('userNameDisplay');

    if (userAvatar) {
      userAvatar.textContent = userName.charAt(0).toUpperCase();
    }
    if (userNameElement) {
      userNameElement.textContent = userName;
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

  // 1. LIVE CLOCK LOGIC
  function updateClock() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };

    const timeElement = document.getElementById('clock-time');
    const dateElement = document.getElementById('clock-date');

    if (timeElement) timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
    if (dateElement) dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
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

  // 2. ENCODE NEW IMMUNIZATION VISIT MODAL LOGIC
  const encodeModal = document.getElementById('encodeModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const encodeVisitForm = document.getElementById('encodeVisitForm');
  const btnEncodeVisit = document.getElementById('btnEncodeVisit');

  if (btnEncodeVisit) {
    btnEncodeVisit.addEventListener('click', () => {
      if (encodeModal) encodeModal.style.display = 'flex';
    });
  }

  const closeEncodeModal = () => {
    if (encodeModal) encodeModal.style.display = 'none';
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeEncodeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeEncodeModal);

  if (encodeVisitForm) {
    encodeVisitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('New immunization visit record successfully saved!');
      closeEncodeModal();
      encodeVisitForm.reset();
    });
  }

  // 3. UPDATE PATIENT VISIT MODAL LOGIC
  const updateModal = document.getElementById('updateModal');
  const closeUpdateModalBtn = document.getElementById('closeUpdateModalBtn');
  const cancelUpdateModalBtn = document.getElementById('cancelUpdateModalBtn');
  const updateRecordForm = document.getElementById('updateRecordForm');
  const updateBtns = document.querySelectorAll('.update-btn');

  updateBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (updateModal) updateModal.style.display = 'flex';
    });
  });

  const closeUpdateModal = () => {
    if (updateModal) updateModal.style.display = 'none';
  };

  if (closeUpdateModalBtn) closeUpdateModalBtn.addEventListener('click', closeUpdateModal);
  if (cancelUpdateModalBtn) cancelUpdateModalBtn.addEventListener('click', closeUpdateModal);

  if (updateRecordForm) {
    updateRecordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Patient visit record successfully updated!');
      closeUpdateModal();
    });
  }

  // 4. VIEW CHILD PATIENT PROFILE MODAL & CHART LOGIC
  const viewModal = document.getElementById('viewModal');
  const closeViewModalBtn = document.getElementById('closeViewModalBtn');
  const cancelViewModalBtn = document.getElementById('cancelViewModalBtn');
  const viewBtns = document.querySelectorAll('.view-btn');
  let growthChartInstance = null;

  const initGrowthChart = () => {
    const canvas = document.getElementById('growthChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Destroy previous chart instance if existing to prevent canvas re-render glitch
    if (growthChartInstance) {
      growthChartInstance.destroy();
    }

    growthChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['At Birth', '1 Mo', '2 Mos', '3 Mos', '4 Mos'],
        datasets: [
          {
            label: 'Weight (kg)',
            data: [3.2, 4.1, 4.9, 5.5, 6.2],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Height (cm)',
            data: [50, 53, 56, 59, 62],
            borderColor: '#3b82f6',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { size: 10 } }
          }
        },
        scales: {
          x: {
            ticks: { color: '#64748b', font: { size: 10 } },
            grid: { color: '#1e293b' }
          },
          y: {
            ticks: { color: '#64748b', font: { size: 10 } },
            grid: { color: '#1e293b' }
          }
        }
      }
    });
  };

  viewBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (viewModal) {
        viewModal.style.display = 'flex';
        initGrowthChart();
      }
    });
  });

  const closeViewModal = () => {
    if (viewModal) viewModal.style.display = 'none';
  };

  if (closeViewModalBtn) closeViewModalBtn.addEventListener('click', closeViewModal);
  if (cancelViewModalBtn) cancelViewModalBtn.addEventListener('click', closeViewModal);

  // 5. GLOBAL OUTSIDE MODAL CLICK CLOSING HANDLER
  window.addEventListener('click', (event) => {
    if (event.target === encodeModal) closeEncodeModal();
    if (event.target === updateModal) closeUpdateModal();
    if (event.target === viewModal) closeViewModal();
  });



  // ========== DYNAMIC UPDATE FUNCTIONALITY ==========
  
  // Store current patient data being edited
  let currentPatientRow = null;
  
  // Enhanced update button handler
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('update-btn') || e.target.closest('.update-btn')) {
      const btn = e.target.classList.contains('update-btn') ? e.target : e.target.closest('.update-btn');
      currentPatientRow = btn.closest('tr');
      
      // Get current data from row
      const cells = currentPatientRow.querySelectorAll('td');
      const name = cells[0].querySelector('strong')?.textContent || '';
      const weight = cells[3]?.textContent || '';
      const height = cells[4]?.textContent || '';
      const temp = cells[5]?.textContent || '';
      const rr = cells[6]?.textContent || '';
      const muac = cells[13]?.textContent || '';
      
      // Populate update modal with current data
      const modal = document.getElementById('updateModal');
      if (modal) {
        // Set patient name in modal title
        const modalTitle = modal.querySelector('.modal-header p');
        if (modalTitle) {
          modalTitle.innerHTML = `<strong>${name}</strong>`;
        }
        
        // Populate form fields
        const weightInput = modal.querySelector('input[type="number"][value="6.2"]');
        const heightInput = modal.querySelector('input[type="number"][value="62"]');
        const tempInput = modal.querySelector('input[type="number"][value="36.5"]');
        const rrInput = modal.querySelector('input[type="number"][value="32"]');
        const muacInput = modal.querySelector('input[type="number"][value="14.2"]');
        
        if (weightInput) weightInput.value = weight;
        if (heightInput) heightInput.value = height;
        if (tempInput) tempInput.value = temp;
        if (rrInput) rrInput.value = rr.replace(/[^0-9.]/g, '');
        if (muacInput) muacInput.value = muac.replace(/[^0-9.]/g, '');
        
        modal.style.display = 'flex';
      }
    }
  });
  
  // Handle update form submission
  const updateForm = document.getElementById('updateRecordForm');
  if (updateForm) {
    updateForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!currentPatientRow) {
        alert('Error: No patient selected');
        return;
      }
      
      // Get updated values from form
      const modal = document.getElementById('updateModal');
      const weightInput = modal.querySelector('input[type="number"][value]');
      const heightInput = modal.querySelectorAll('input[type="number"]')[1];
      const tempInput = modal.querySelectorAll('input[type="number"]')[2];
      const rrInput = modal.querySelectorAll('input[type="number"]')[3];
      const muacInput = modal.querySelectorAll('input[type="number"]')[4];
      
      // Update the row with new values
      const cells = currentPatientRow.querySelectorAll('td');
      if (weightInput) cells[3].textContent = weightInput.value;
      if (heightInput) cells[4].textContent = heightInput.value;
      if (tempInput) cells[5].textContent = tempInput.value;
      if (rrInput) cells[6].innerHTML = `<span class="text-cyan font-bold">${rrInput.value}</span>`;
      if (muacInput) cells[13].innerHTML = `<strong>${muacInput.value}</strong>`;
      
      // Get vaccine checkboxes
      const checkboxes = modal.querySelectorAll('.vaccine-list input[type="checkbox"]');
      const vaccineColumns = [7, 8, 9, 10, 11, 12, 13]; // BCG, OPV, IPV, PENTA, PCV, MCV1, MCV2
      
      checkboxes.forEach((checkbox, index) => {
        if (vaccineColumns[index]) {
          const cell = cells[vaccineColumns[index]];
          if (checkbox.checked) {
            cell.innerHTML = '<span class="icon-check">&#10003;</span>';
          } else {
            cell.innerHTML = '<span class="icon-cross">&#10007;</span>';
          }
        }
      });
      
      // Close modal
      closeUpdateModal();
      
      // Show success message
      alert('? Patient record updated successfully!');
      
      // Reset current patient
      currentPatientRow = null;
    });
  }
  // ========== SEARCH AND FILTER FUNCTIONALITY ==========
  
  // Search by child name
  const searchInput = document.querySelector('.input-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      filterTable();
    });
  }

  // Filter by purok
  const purokSelect = document.querySelector('.select-purok');
  if (purokSelect) {
    purokSelect.addEventListener('change', function() {
      filterTable();
    });
  }

  // Combined filter function
  function filterTable() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedPurok = purokSelect ? purokSelect.value.toLowerCase() : 'all';
    const rows = document.querySelectorAll('.data-table tbody tr');
    
    let visibleCount = 0;
    
    rows.forEach(row => {
      const childName = row.querySelector('td:first-child strong')?.textContent.toLowerCase() || '';
      const purokCell = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
      
      // Check search match
      const matchesSearch = !searchTerm || childName.includes(searchTerm);
      
      // Check purok match
      const matchesPurok = selectedPurok === 'all' || purokCell.includes(selectedPurok);
      
      // Show row only if both conditions match
      if (matchesSearch && matchesPurok) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    console.log(`Filtered: ${visibleCount} records visible`);
  }
  // Start clock
  setInterval(updateClock, 1000);
  updateClock();
});