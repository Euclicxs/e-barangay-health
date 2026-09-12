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
    if (event.target === document.getElementById('recordDetailModal')) closeRecordDetail();
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

  // Pagination state
  const childPager = document.getElementById('childPager');
  const childPagerInfo = document.getElementById('childPagerInfo');
  const childPageSizeEl = document.getElementById('childPageSize');
  let childPageIndex = 0;
  let childPageSize = 10;

  // Search by child name or purok (filters then re-renders the table)
  const searchInput = document.querySelector('.input-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      childPageIndex = 0;
      renderChildTable();
    });
  }

  // Filter by purok
  const purokSelect = document.querySelector('.select-purok');
  if (purokSelect) {
    purokSelect.addEventListener('change', function() {
      childPageIndex = 0;
      renderChildTable();
    });
  }

  // Rows per page
  if (childPageSizeEl) {
    childPageSizeEl.addEventListener('change', function() {
      const val = this.value;
      childPageSize = val === 'all' ? 'all' : (Number(val) || 10);
      childPageIndex = 0;
      renderChildTable();
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
          records.push({ rec, purok: purok.name, purokKey: key, status });
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

  function buildChildRow(item) {
    const { rec, purok, status } = item;
    const tr = document.createElement('tr');

    const nameCell = document.createElement('td');
    const nameStrong = document.createElement('strong');
    nameStrong.className = 'clickable-name';
    nameStrong.setAttribute('data-code', rec.code);
    nameStrong.title = 'View remaining vaccines/injections';
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

    return tr;
  }

  function renderChildTable() {
    const tbody = document.getElementById('childTbody');
    if (!tbody) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedPurok = purokSelect ? purokSelect.value.toLowerCase() : 'all';

    const filtered = scopedChildren().filter(item => {
      const name = (item.rec.name || '').toLowerCase();
      const purok = (item.purok || '').toLowerCase();
      const matchesSearch = !searchTerm || name.includes(searchTerm) || purok.includes(searchTerm);
      const matchesPurok = selectedPurok === 'all' || item.purokKey === selectedPurok;
      return matchesSearch && matchesPurok;
    });

    const pageSize = childPageSize === 'all' ? filtered.length : (Number(childPageSize) || 10);
    const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
    if (childPageIndex >= totalPages) childPageIndex = totalPages - 1;
    if (childPageIndex < 0) childPageIndex = 0;
    const start = childPageIndex * pageSize;
    const end = Math.min(start + pageSize, filtered.length);

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      const emptyTr = document.createElement('tr');
      emptyTr.innerHTML = '<td colspan="17" class="coverage-empty">No records match the current search &amp; filter.</td>';
      tbody.appendChild(emptyTr);
    }

    filtered.slice(start, end).forEach(item => tbody.appendChild(buildChildRow(item)));

    updateChildPager(filtered.length, start, end);
  }

  function updateChildPager(total, start, end) {
    if (childPagerInfo) {
      childPagerInfo.textContent = total === 0
        ? 'Showing 0–0 of 0'
        : `Showing ${start + 1}–${end} of ${total}`;
    }
    if (!childPager) return;
    childPager.innerHTML = '';

    const pageSize = childPageSize === 'all' ? total : (Number(childPageSize) || 10);
    const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;

    const makeBtn = (label, page, active, disabled) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `pager-btn${active ? ' active' : ''}`;
      b.textContent = label;
      if (disabled) b.disabled = true;
      b.addEventListener('click', () => {
        childPageIndex = page;
        renderChildTable();
      });
      return b;
    };

    childPager.appendChild(makeBtn('‹ Prev', childPageIndex - 1, false, childPageIndex <= 0));

    const maxVisible = 7;
    let startPage = 0;
    let endPage = totalPages - 1;
    if (totalPages > maxVisible) {
      startPage = Math.max(0, childPageIndex - Math.floor(maxVisible / 2));
      endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    if (startPage > 0) childPager.appendChild(makeBtn('1', 0, false, false));
    if (startPage > 1) {
      const ell = document.createElement('span');
      ell.className = 'pager-ellipsis';
      ell.textContent = '…';
      childPager.appendChild(ell);
    }
    for (let i = startPage; i <= endPage; i++) {
      childPager.appendChild(makeBtn(String(i + 1), i, i === childPageIndex, false));
    }
    if (endPage < totalPages - 2) {
      const ell = document.createElement('span');
      ell.className = 'pager-ellipsis';
      ell.textContent = '…';
      childPager.appendChild(ell);
    }
    if (endPage < totalPages - 1) childPager.appendChild(makeBtn(String(totalPages), totalPages - 1, false, false));

    childPager.appendChild(makeBtn('Next ›', childPageIndex + 1, false, childPageIndex >= totalPages - 1));
  }

  // ========== VACCINATION COVERAGE PANEL ==========
  function coverageBarClass(pct) {
    if (pct >= 80) return 'green';
    if (pct >= 50) return 'yellow';
    return 'red';
  }

  function renderChildStatusSummary() {
    const children = scopedChildren();
    const counts = { 'Overdue': 0, 'Due This Month': 0, 'Completed': 0 };
    children.forEach(item => {
      if (counts.hasOwnProperty(item.status)) counts[item.status] += 1;
    });
    const summary = document.querySelector('.filter-bar .status-summary');
    if (!summary) return;
    const statusLabels = { 'Overdue': 'Overdue', 'Due This Month': 'Due This Month', 'Completed': 'Completed' };
    summary.querySelectorAll('.status-count').forEach((el, idx) => {
      const label = ['Overdue', 'Due This Month', 'Completed'][idx];
      const strong = el.querySelector('strong');
      if (strong && label) strong.textContent = counts[label];
    });
  }

  function renderChildCoverage() {
    const container = document.getElementById('childVaccineCoverage');
    if (!container) return;

    const children = scopedChildren();
    const total = children.length;
    const codes = typeof VACCINES !== 'undefined' ? VACCINES : ['BCG', 'OPV', 'IPV', 'PENTA', 'PCV', 'MCV1', 'MCV2'];

    if (total === 0) {
      container.innerHTML = '<p class="coverage-empty">No child records for your assigned puroks.</p>';
      return;
    }

    container.innerHTML = codes.map(code => {
      const covered = children.filter(item => Array.isArray(item.rec.vaccines) && item.rec.vaccines.includes(code)).length;
      const notYet = total - covered;
      const pct = Math.round((covered / total) * 100);
      return `
        <div class="coverage-card" data-cover="${code}" title="View who is vaccinated for ${code}">
          <div class="coverage-card-head">
            <span class="coverage-code">${code}</span>
            <span class="coverage-pct text-${coverageBarClass(pct)}">${pct}%</span>
          </div>
          <div class="coverage-stats">
            <span><strong>${covered}</strong>/<strong>${total}</strong> vaccinated</span>
            <span class="${notYet > 0 ? 'text-red' : 'text-green'}">${notYet} not yet</span>
          </div>
          <div class="progress-bg">
            <div class="progress-bar ${coverageBarClass(pct)}" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ========== COVERAGE DETAILS MODAL (who is vaccinated vs pending) ==========
  function buildCoverageNameList(items) {
    if (!items.length) return '<li class="coverage-list-empty">No one in this group</li>';
    return items.map(item =>
      `<li data-code="${item.rec.code || ''}"><i class="fa-solid fa-circle"></i><strong class="clickable-name" data-code="${item.rec.code || ''}" title="View remaining vaccines/injections">${item.rec.name}</strong><span>Purok ${item.purok}</span></li>`
    ).join('');
  }

  function openCoverageList(title, coveredItems, pendingItems, coveredHeading, pendingHeading) {
    const modal = document.getElementById('coverageListModal');
    if (!modal) return;
    const titleEl = document.getElementById('coverageListTitle');
    const coveredEl = document.getElementById('coverageListCovered');
    const pendingEl = document.getElementById('coverageListPending');
    const coveredTitleEl = document.getElementById('coverageListCoveredTitle');
    const pendingTitleEl = document.getElementById('coverageListPendingTitle');
    if (titleEl) titleEl.textContent = title;
    if (coveredTitleEl) coveredTitleEl.textContent = coveredHeading;
    if (pendingTitleEl) pendingTitleEl.textContent = pendingHeading;
    if (coveredEl) coveredEl.innerHTML = buildCoverageNameList(coveredItems);
    if (pendingEl) pendingEl.innerHTML = buildCoverageNameList(pendingItems);
    modal.style.display = 'flex';
  }

  function closeCoverageList() {
    const modal = document.getElementById('coverageListModal');
    if (modal) modal.style.display = 'none';
  }

  const coverageListBtn = document.getElementById('closeCoverageListBtn');
  if (coverageListBtn) coverageListBtn.addEventListener('click', closeCoverageList);
  const coverageListModal = document.getElementById('coverageListModal');
  if (coverageListModal) {
    coverageListModal.addEventListener('click', function(e) {
      if (e.target === coverageListModal) closeCoverageList();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeCoverageList();
  });

  const childCoverageContainer = document.getElementById('childVaccineCoverage');
  if (childCoverageContainer) {
    childCoverageContainer.addEventListener('click', function(e) {
      const card = e.target.closest ? e.target.closest('.coverage-card') : null;
      if (!card) return;
      const code = card.getAttribute('data-cover');
      if (!code) return;
      const all = scopedChildren();
      const covered = all.filter(item => Array.isArray(item.rec.vaccines) && item.rec.vaccines.includes(code));
      const pending = all.filter(item => !(Array.isArray(item.rec.vaccines) && item.rec.vaccines.includes(code)));
      openCoverageList(
        `${code} — Vaccination Coverage`,
        covered,
        pending,
        `Vaccinated (${covered.length})`,
        `Not yet vaccinated (${pending.length})`
      );
    });
  }

  // ========== RECORD DETAIL MODAL (remaining vaccines / injections per person) ==========
  function buildChildRecordMap() {
    const map = {};
    const all = (typeof getAllPurokRecords === 'function') ? getAllPurokRecords() : [];
    all.forEach(rec => { if (rec && rec.code) map[rec.code] = rec; });
    return map;
  }

  function isRecordDetailOpen() {
    const m = document.getElementById('recordDetailModal');
    return !!(m && m.style.display === 'flex');
  }

  function renderRecordDetail(code) {
    const rec = buildChildRecordMap()[code];
    if (!rec) return;

    const isChild = rec.type === 'Child';
    const iconEl = document.getElementById('recordDetailIcon');
    if (iconEl) iconEl.innerHTML = isChild
      ? '<i class="fa-solid fa-child"></i>'
      : '<i class="fa-solid fa-person-pregnant"></i>';
    const nameEl = document.getElementById('recordDetailName');
    if (nameEl) nameEl.textContent = rec.name;
    const metaEl = document.getElementById('recordDetailMeta');
    if (metaEl) metaEl.textContent = `${rec.type} · ${rec.code} · Purok ${rec.purok} · ${rec.address || 'No address'}`;

    const body = document.getElementById('recordDetailBody');
    if (!body) return;

    const vaxCodes = typeof VACCINES !== 'undefined' ? VACCINES : ['BCG', 'OPV', 'IPV', 'PENTA', 'PCV', 'MCV1', 'MCV2'];
    const parseBp = (bp) => {
      const parts = String(bp || '').split('/');
      return { sys: parseInt(parts[0], 10) || 0, dia: parseInt(parts[1], 10) || 0 };
    };
    const isHighBp = (bp) => {
      const { sys, dia } = parseBp(bp);
      return sys >= 130 || dia >= 80;
    };

    let html = '';
    if (isChild) {
      const had = Array.isArray(rec.vaccines) ? rec.vaccines : [];
      const missingNames = vaxCodes.filter(v => !had.includes(v));

      html = `
        <div class="detail-banner ${missingNames.length === 0 ? 'success' : 'warn'}">
          <i class="fa-solid ${missingNames.length === 0 ? 'fa-shield-halved' : 'fa-triangle-exclamation'}"></i>
          <span>${missingNames.length === 0
            ? 'Fully vaccinated — all routine vaccine doses received.'
            : `${missingNames.length} of ${vaxCodes.length} routine vaccine(s) still missing.`}</span>
        </div>
        <div class="detail-summary">${had.length}/${vaxCodes.length} vaccines received</div>
        <div class="detail-grid">
          ${vaxCodes.map(v => {
            const has = had.includes(v);
            return `
              <div class="detail-row ${has ? 'ok' : 'miss'}">
                <i class="fa-solid ${has ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                <span class="detail-label">${v}</span>
                <span class="detail-status">${has ? 'Received' : 'Missing'}</span>
              </div>`;
          }).join('')}
        </div>
        ${missingNames.length ? `
          <div class="chips-label">Not yet vaccinated:</div>
          <div class="chip-row">${missingNames.map(n => `<span class="chip-missing">${n}</span>`).join('')}</div>
        ` : ''}
      `;
    } else {
      const level = parseInt(String(rec.ttDose).replace(/\D/g, ''), 10) || 0;
      const missingTt = 5 - level;
      const missingIron = rec.iron ? 0 : 1;
      const missingTotal = missingTt + missingIron;
      const bpReading = rec.bp ? String(rec.bp) : '';
      const bpHigh = isHighBp(rec.bp);
      const bpStatus = !bpReading ? 'No reading' : (bpHigh ? 'Elevated' : 'Normal');
      const bpClass = !bpReading ? 'na' : (bpHigh ? 'miss' : 'ok');
      const ttRows = [];
      for (let dose = 1; dose <= 5; dose++) {
        const has = level >= dose;
        ttRows.push(`
          <div class="detail-row ${has ? 'ok' : 'miss'}">
            <i class="fa-solid ${has ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
            <span class="detail-label">TT ${dose}</span>
            <span class="detail-status">${has ? 'Received' : 'Missing'}</span>
          </div>`);
      }

      html = `
        <div class="detail-banner ${missingTotal === 0 ? 'success' : 'warn'}">
          <i class="fa-solid ${missingTotal === 0 ? 'fa-shield-halved' : 'fa-triangle-exclamation'}"></i>
          <span>${missingTotal === 0
            ? 'All routine maternal injections are up to date.'
            : `${missingTotal} injection item(s) still missing${missingIron ? ' (including iron supplementation)' : ''}.`}</span>
        </div>
        <div class="detail-summary">Current TT level: <strong>${level > 0 ? `TT ${level}` : 'None yet'}</strong></div>
        <div class="detail-grid">
          ${ttRows.join('')}
          <div class="detail-row ${rec.iron ? 'ok' : 'miss'}">
            <i class="fa-solid ${rec.iron ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
            <span class="detail-label">Iron Supplementation</span>
            <span class="detail-status">${rec.iron ? 'Received' : 'Missing'}</span>
          </div>
          <div class="detail-row ${bpClass}">
            <i class="fa-solid ${!bpReading ? 'fa-circle-info' : (bpHigh ? 'fa-circle-exclamation' : 'fa-circle-check')}"></i>
            <span class="detail-label">Blood Pressure</span>
            <span class="detail-status">${bpReading ? `${bpReading} — ${bpStatus}` : bpStatus}</span>
          </div>
        </div>
        ${missingTt > 0 ? `
          <div class="chips-label">Remaining tetanus toxoid doses:</div>
          <div class="chip-row">${Array.from({ length: missingTt }, (_, i) => `<span class="chip-missing">TT ${level + 1 + i}</span>`).join('')}</div>
        ` : ''}
      `;
    }

    body.innerHTML = html;
    const modal = document.getElementById('recordDetailModal');
    if (modal) modal.style.display = 'flex';
  }

  function closeRecordDetail() {
    const modal = document.getElementById('recordDetailModal');
    if (modal) modal.style.display = 'none';
    const body = document.getElementById('recordDetailBody');
    if (body) body.innerHTML = '';
  }

  const closeRecordDetailBtn = document.getElementById('closeRecordDetailBtn');
  if (closeRecordDetailBtn) closeRecordDetailBtn.addEventListener('click', closeRecordDetail);

  // Capture-phase fallback so name clicks always open the detail modal even if another
  // handler ever calls stopPropagation() (covers table names + coverage list names).
  document.addEventListener('click', function(e) {
    const el = e.target && e.target.closest ? e.target.closest('[data-code]') : null;
    if (!el) return;
    const code = el.getAttribute('data-code');
    if (!code) return;
    renderRecordDetail(code);
  }, true);

  // Escape closes the detail modal first (then falls through to the coverage-modal handler).
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (isRecordDetailOpen()) {
      closeRecordDetail();
      e.stopPropagation();
    }
  }, true);

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
  renderChildCoverage();
  renderChildStatusSummary();
  applyPurokScoping();

  // Print button — expands to all filtered rows before printing
  const btnPrintChild = document.getElementById('btnPrintChild');
  if (btnPrintChild) {
    btnPrintChild.addEventListener('click', () => {
      const dateEl = document.querySelector('.print-date-text');
      if (dateEl) dateEl.textContent = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
      const prevState = { page: childPageIndex, size: childPageSize };
      childPageIndex = 0;
      childPageSize = 'all';
      renderChildTable();
      setTimeout(() => {
        window.print();
        childPageIndex = prevState.page;
        childPageSize = prevState.size;
        renderChildTable();
      }, 60);
    });
  }

  // Start clock
  setInterval(updateClock, 1000);
  updateClock();
});