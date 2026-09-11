document.addEventListener('DOMContentLoaded', () => {
  // Validate session - page is BHW-only now
  if (!validateSession('bhw')) {
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
      const muac = cells[14]?.textContent || '';
      
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
      if (muacInput) cells[14].innerHTML = `<strong>${muacInput.value}</strong>`;
      
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

  // ========== PUROK SCOPING (only assigned puroks) ==========
  function getAssignedPurokKeys() {
    if (typeof getCurrentUserAssignedPuroks === 'function') {
      const keys = getCurrentUserAssignedPuroks();
      if (keys) return keys;
    }
    return null; // no assignment info => show all
  }

  function assignedPurokKeysToNames(keys) {
    return keys.map(key => {
      if (typeof purokData !== 'undefined' && purokData[key]) {
        return purokData[key].name.toLowerCase();
      }
      return String(key).toLowerCase();
    });
  }

  function belongsToAssignedPurok(purokCell, assignedNames) {
    if (assignedNames === null) return true;
    return assignedNames.some(name => purokCell.includes(name));
  }

  function refillPurokSelect(select, selectedPurok, options) {
    const optionsConfig = options || {};
    const assignedKeys = getAssignedPurokKeys();
    if (!assignedKeys || typeof purokData === 'undefined') return;

    select.innerHTML = '';
    if (optionsConfig.placeholder) {
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = optionsConfig.placeholder;
      select.appendChild(ph);
    }
    if (optionsConfig.includeAll && assignedKeys.length > 1) {
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'All Puroks';
      select.appendChild(allOption);
    }
    assignedKeys.forEach(key => {
      const purok = purokData[key];
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `Purok ${purok ? purok.name : key}`;
      select.appendChild(option);
    });
    if (selectedPurok && assignedKeys.includes(selectedPurok)) {
      select.value = selectedPurok;
    }
  }

  function applyPurokScoping() {
    const assignedKeys = getAssignedPurokKeys();
    if (!assignedKeys) return;

    // Restrict the filter dropdown to assigned puroks
    const filterSelect = document.querySelector('.select-purok');
    if (filterSelect) {
      refillPurokSelect(filterSelect, filterSelect.value, { includeAll: true });
    }

    // Restrict the encode modal purok dropdown to assigned puroks
    const encodeSelect = document.getElementById('encodePurokSelect');
    if (encodeSelect) {
      refillPurokSelect(encodeSelect, encodeSelect.value, { placeholder: '— Select Purok —' });
    }
  }

  // ========== TABLE RENDERING (from shared purok data) ==========
  function getScopeKeys() {
    const assigned = getAssignedPurokKeys();
    if (assigned && assigned.length) return assigned;
    return typeof purokData !== 'undefined' ? Object.keys(purokData) : [];
  }

  function scopedChildren() {
    if (typeof purokData === 'undefined') return [];
    const records = [];
    getScopeKeys().forEach(key => {
      const purok = purokData[key];
      if (!purok || !purok.records) return;
      purok.records.forEach(rec => {
        if (rec.type === 'Child') {
          const status = computeStatus(rec.nextVisitDate, rec.lastVisitDate);
          records.push({ rec, purok: purok.name, status });
        }
      });
    });
    return records;
  }

  function computeAgeLabel(birthDate) {
    const now = new Date();
    const birth = new Date(birthDate);
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (now.getDate() < birth.getDate()) months -= 1;
    if (months < 12) {
      return `${months} mo${months === 1 ? '' : 's'}`;
    }
    const years = Math.floor(months / 12);
    const rem = months % 12;
    const yearLabel = `${years} yr${years === 1 ? '' : 's'}`;
    return rem > 0 ? `${yearLabel} ${rem} mo` : yearLabel;
  }

  const childStatusClass = { 'Completed': 'status-green', 'Due This Month': 'status-yellow', 'Overdue': 'status-red' };
  const childVaxColumnMap = { 'BCG': 7, 'OPV': 8, 'IPV': 9, 'PENTA': 10, 'PCV': 11, 'MCV1': 12, 'MCV2': 13 };

  function renderChildTable() {
    const tbody = document.getElementById('childTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    scopedChildren().forEach(item => {
      const { rec, purok, status } = item;
      const tr = document.createElement('tr');

      const nameCell = document.createElement('td');
      const nameStrong = document.createElement('strong');
      nameStrong.textContent = rec.name;
      nameCell.appendChild(nameStrong);
      nameCell.appendChild(document.createElement('br'));
      const nameCode = document.createElement('span');
      nameCode.className = 'text-muted';
      nameCode.textContent = rec.code;
      nameCell.appendChild(nameCode);

      const ageCell = document.createElement('td');
      ageCell.innerHTML = `${computeAgeLabel(rec.birthDate)}<br><span class="${rec.sex === 'Female' ? 'text-female' : 'text-male'}">${rec.sex}</span>`;

      const purokCell = document.createElement('td');
      purokCell.textContent = purok;

      const weightCell = document.createElement('td');
      weightCell.textContent = String(rec.weight);
      const heightCell = document.createElement('td');
      heightCell.textContent = String(rec.height);
      const tempCell = document.createElement('td');
      tempCell.textContent = String(rec.temp);
      const rrCell = document.createElement('td');
      rrCell.innerHTML = `<span class="text-cyan font-bold">${String(rec.rr)}</span>`;

      const vaxCodes = typeof VACCINES !== 'undefined' ? VACCINES : Object.keys(childVaxColumnMap);
      const vaxCells = vaxCodes.map(vCode => {
        const cell = document.createElement('td');
        const has = Array.isArray(rec.vaccines) && rec.vaccines.includes(vCode);
        cell.innerHTML = has ? '<span class="icon-check">&#10003;</span>' : '<span class="icon-cross">&#10007;</span>';
        return cell;
      });

      const muacCell = document.createElement('td');
      muacCell.innerHTML = `<strong>${String(rec.muac)}</strong>`;

      const statusCell = document.createElement('td');
      statusCell.innerHTML = `<span class="status-pill ${childStatusClass[status] || 'status-yellow'}">&bull; ${status}</span>`;

      const actionCell = document.createElement('td');
      actionCell.innerHTML = '<button class="btn-sm btn-outline update-btn">Update</button> <button class="btn-sm btn-subtle view-btn">View</button>';

      tr.appendChild(nameCell);
      tr.appendChild(ageCell);
      tr.appendChild(purokCell);
      tr.appendChild(weightCell);
      tr.appendChild(heightCell);
      tr.appendChild(tempCell);
      tr.appendChild(rrCell);
      vaxCells.forEach(c => tr.appendChild(c));
      tr.appendChild(muacCell);
      tr.appendChild(statusCell);
      tr.appendChild(actionCell);

      tbody.appendChild(tr);
    });
  }

  // Rendered rows are not present at initial binding time, so handle View clicks by delegation.
  document.addEventListener('click', function(e) {
    const btn = e.target.classList && (e.target.classList.contains('view-btn')
      ? e.target
      : e.target.closest ? e.target.closest('.view-btn') : null);
    if (btn && viewModal) {
      viewModal.style.display = 'flex';
      initGrowthChart();
    }
  });

  renderChildTable();
  applyPurokScoping();

  // Combined filter function
  function filterTable() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedPurok = purokSelect ? purokSelect.value.toLowerCase() : 'all';
    const assignedNames = getAssignedPurokKeys() ? assignedPurokKeysToNames(getAssignedPurokKeys()) : null;
    const rows = document.querySelectorAll('.data-table tbody tr');
    
    let visibleCount = 0;
    
    rows.forEach(row => {
      const childName = row.querySelector('td:first-child strong')?.textContent.toLowerCase() || '';
      const purokCell = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
      
      // Check search match
      const matchesSearch = !searchTerm || childName.includes(searchTerm);
      
      // Check purok match
      const matchesPurok = selectedPurok === 'all' || purokCell.includes(selectedPurok);

      // Check assignment match (only assigned puroks are visible)
      const matchesAssignment = belongsToAssignedPurok(purokCell, assignedNames);
      
      // Show row only if all conditions match
      if (matchesSearch && matchesPurok && matchesAssignment) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    console.log(`Filtered: ${visibleCount} records visible`);
  }
  // Hide rows from puroks outside the BHW's assignment on load
  filterTable();
  // Start clock
  setInterval(updateClock, 1000);
  updateClock();
});