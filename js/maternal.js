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

  // MATERNAL ENCODE BUTTON FUNCTIONALITY
  const btnEncodeMaternal = document.getElementById('btnEncodeMaternal');
  const maternalModal = document.getElementById('maternalModal');
  const closeMaternalModalBtn = document.getElementById('closeMaternalModalBtn');
  const cancelMaternalModalBtn = document.getElementById('cancelMaternalModalBtn');
  const maternalForm = document.getElementById('maternalForm');

  if (btnEncodeMaternal && maternalModal) {
    btnEncodeMaternal.addEventListener('click', () => {
      maternalModal.style.display = 'flex';
    });
  }

  function closeMaternalModal() {
    if (maternalModal) {
      maternalModal.style.display = 'none';
      if (maternalForm) maternalForm.reset();
    }
  }

  if (closeMaternalModalBtn) closeMaternalModalBtn.addEventListener('click', closeMaternalModal);
  if (cancelMaternalModalBtn) cancelMaternalModalBtn.addEventListener('click', closeMaternalModal);

  if (maternalForm) {
    maternalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Maternal visit record saved successfully!');
      closeMaternalModal();
    });
  }

  // ========== SEARCH AND FILTER FUNCTIONALITY ==========
  const searchInput = document.querySelector('.filter-bar input[type="text"]');
  const purokSelect = document.querySelector('.select-purok');

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

  applyPurokScoping();

  function filterTable() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedPurok = purokSelect ? purokSelect.value.toLowerCase() : 'all';
    const assignedNames = getAssignedPurokKeys() ? assignedPurokKeysToNames(getAssignedPurokKeys()) : null;
    const rows = document.querySelectorAll('.data-table tbody tr');
    
    let visibleCount = 0;
    
    rows.forEach(row => {
      const motherName = row.querySelector('td:first-child strong')?.textContent.toLowerCase() || '';
      const purokCell = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
      
      const matchesSearch = !searchTerm || motherName.includes(searchTerm);
      const matchesPurok = selectedPurok === 'all' || purokCell.includes(selectedPurok);
      const matchesAssignment = belongsToAssignedPurok(purokCell, assignedNames);
      
      if (matchesSearch && matchesPurok && matchesAssignment) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    console.log(`Filtered: ${visibleCount} records visible`);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterTable);
  }

  if (purokSelect) {
    purokSelect.addEventListener('change', filterTable);
  }

  // ========== TABLE RENDERING (from shared purok data) ==========
  function getScopeKeys() {
    const assigned = getAssignedPurokKeys();
    if (assigned && assigned.length) return assigned;
    return typeof purokData !== 'undefined' ? Object.keys(purokData) : [];
  }

  function scopedMothers() {
    if (typeof purokData === 'undefined') return [];
    const records = [];
    getScopeKeys().forEach(key => {
      const purok = purokData[key];
      if (!purok || !purok.records) return;
      purok.records.forEach(rec => {
        if (rec.type === 'Mother') {
          const status = computeStatus(rec.nextVisitDate, rec.lastVisitDate);
          records.push({ rec, purok: purok.name, status });
        }
      });
    });
    return records;
  }

  const maternalStatusClass = { 'Completed': 'status-green', 'Due This Month': 'status-yellow', 'Overdue': 'status-red' };

  function renderMaternalTable() {
    const tbody = document.getElementById('maternalTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    scopedMothers().forEach(item => {
      const { rec, purok, status } = item;
      const tr = document.createElement('tr');

      const nameCell = document.createElement('td');
      const nameStrong = document.createElement('strong');
      nameStrong.style.color = 'white';
      nameStrong.style.display = 'block';
      nameStrong.textContent = rec.name;
      const nameCode = document.createElement('span');
      nameCode.className = 'text-muted';
      nameCode.textContent = rec.code;
      nameCell.appendChild(nameStrong);
      nameCell.appendChild(nameCode);

      const purokCell = document.createElement('td');
      purokCell.textContent = purok;

      const weightCell = document.createElement('td');
      weightCell.textContent = String(rec.weight);

      const isHighBP = parseInt(String(rec.bp).split('/')[0], 10) >= 130;
      const bpCell = document.createElement('td');
      bpCell.className = isHighBP ? 'text-red' : 'text-green';
      bpCell.textContent = rec.bp;

      const prCell = document.createElement('td');
      prCell.textContent = String(rec.pr);

      const tempCell = document.createElement('td');
      tempCell.textContent = String(rec.temp);

      const ttCell = document.createElement('td');
      ttCell.innerHTML = `<span class="badge-tt">${rec.ttDose}</span>`;

      const ironCell = document.createElement('td');
      ironCell.innerHTML = rec.iron
        ? '<i class="fa-solid fa-square-check text-green" style="font-size: 14px;"></i>'
        : '<i class="fa-solid fa-square-xmark text-red" style="font-size: 14px;"></i>';

      const statusCell = document.createElement('td');
      statusCell.innerHTML = `<span class="status-pill ${maternalStatusClass[status] || 'status-yellow'}">&bull; ${status}</span>`;

      const actionCell = document.createElement('td');
      actionCell.style.textAlign = 'center';
      actionCell.innerHTML = '<button class="btn-sm btn-outline">Update</button> <button class="btn-sm btn-subtle">View</button>';

      tr.appendChild(nameCell);
      tr.appendChild(purokCell);
      tr.appendChild(weightCell);
      tr.appendChild(bpCell);
      tr.appendChild(prCell);
      tr.appendChild(tempCell);
      tr.appendChild(ttCell);
      tr.appendChild(ironCell);
      tr.appendChild(statusCell);
      tr.appendChild(actionCell);

      tbody.appendChild(tr);
    });
  }

  renderMaternalTable();
  filterTable();

  // ========== VIEW AND UPDATE MODAL HANDLERS ==========
  
  // View Modal Elements
  const viewMaternalModal = document.getElementById('viewMaternalModal');
  const closeViewMaternalBtn = document.getElementById('closeViewMaternalBtn');
  const cancelViewMaternalBtn = document.getElementById('cancelViewMaternalBtn');
  
  // Update Modal Elements
  const updateMaternalModal = document.getElementById('updateMaternalModal');
  const closeUpdateMaternalBtn = document.getElementById('closeUpdateMaternalBtn');
  const cancelUpdateMaternalBtn = document.getElementById('cancelUpdateMaternalBtn');
  const updateMaternalForm = document.getElementById('updateMaternalForm');
  
  // View button handler
  function openMaternalView(row) {
    // Extract data from table row
    const nameElement = row.querySelector('td:first-child strong');
    const codeElement = row.querySelector('td:first-child .text-muted');
    const name = nameElement?.textContent || '';
    const code = codeElement?.textContent || '';
    const purok = row.querySelector('td:nth-child(2)')?.textContent || '';
    const weight = row.querySelector('td:nth-child(3)')?.textContent || '';
    const bp = row.querySelector('td:nth-child(4)')?.textContent || '';
    const pr = row.querySelector('td:nth-child(5)')?.textContent || '';
    const temp = row.querySelector('td:nth-child(6)')?.textContent || '';
    const ttDose = row.querySelector('.badge-tt')?.textContent || '';
    const ironIcon = row.querySelector('td:nth-child(8) i');
    const ironSupp = ironIcon && ironIcon.classList.contains('fa-square-check') ? 'Yes ✓' : 'No ✗';
    const statusElement = row.querySelector('.status-pill');
    const status = statusElement?.textContent || '';

    // Populate view modal
    document.getElementById('viewMaternalTitle').textContent = 'Maternal Patient Profile';
    document.getElementById('viewMaternalSubtitle').textContent = `${name} ● ${code}`;
    document.getElementById('viewMaternalName').textContent = name;
    document.getElementById('viewMaternalCode').textContent = code;
    document.getElementById('viewMaternalPurok').textContent = purok;
    document.getElementById('viewMaternalStatus').textContent = status;
    document.getElementById('viewMaternalWeight').textContent = `${weight} kg`;
    document.getElementById('viewMaternalBP').textContent = `${bp} mmHg`;
    document.getElementById('viewMaternalPR').textContent = `${pr} bpm`;
    document.getElementById('viewMaternalTemp').textContent = `${temp} °C`;
    document.getElementById('viewMaternalTT').textContent = ttDose;
    document.getElementById('viewMaternalIron').textContent = ironSupp;

    // Show modal
    viewMaternalModal.style.display = 'flex';
    console.log(`Opening view modal for: ${name}`);
  }

  function bindViewButtons() {
    const viewBtns = document.querySelectorAll('.btn-subtle');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const row = this.closest('tr');
        if (row) openMaternalView(row);
      });
    });
  }

  bindViewButtons();

  // Rendered rows are not present at initial binding time, so handle View clicks by delegation too.
  document.addEventListener('click', function(e) {
    const btn = e.target.classList && (e.target.classList.contains('btn-subtle')
      ? e.target
      : e.target.closest ? e.target.closest('.btn-subtle') : null);
    if (!btn) return;
    const row = btn.closest('tr');
    if (row && row.closest('#maternalTbody')) {
      openMaternalView(row);
    }
  });
  
  // Update button handler
  function openMaternalUpdate(row) {
    // Extract data from table row
    const nameElement = row.querySelector('td:first-child strong');
    const codeElement = row.querySelector('td:first-child .text-muted');
    const name = nameElement?.textContent || '';
    const code = codeElement?.textContent || '';
    const purok = row.querySelector('td:nth-child(2)')?.textContent || '';
    const weight = row.querySelector('td:nth-child(3)')?.textContent || '';
    const bp = row.querySelector('td:nth-child(4)')?.textContent || '';
    const pr = row.querySelector('td:nth-child(5)')?.textContent || '';
    const temp = row.querySelector('td:nth-child(6)')?.textContent || '';
    const ttDose = row.querySelector('.badge-tt')?.textContent || '';
    const ironIcon = row.querySelector('td:nth-child(8) i');
    const ironSupp = ironIcon && ironIcon.classList.contains('fa-square-check') ? 'Yes' : 'No';
    const statusElement = row.querySelector('.status-pill');
    let status = 'Completed';
    if (statusElement) {
      if (statusElement.textContent.includes('Overdue')) status = 'Overdue';
      else if (statusElement.textContent.includes('Due This Month')) status = 'Due This Month';
    }

    // Populate update modal
    document.getElementById('updateMaternalSubtitle').textContent = `${name} ● ${code} ● ${purok}`;
    document.getElementById('updateMaternalName').value = name;
    document.getElementById('updateMaternalCode').value = code;
    document.getElementById('updateMaternalPurok').value = purok;
    document.getElementById('updateMaternalWeight').value = weight;
    document.getElementById('updateMaternalBP').value = bp;
    document.getElementById('updateMaternalPR').value = pr;
    document.getElementById('updateMaternalTemp').value = temp;
    document.getElementById('updateMaternalTT').value = ttDose;
    document.getElementById('updateMaternalIron').value = ironSupp;
    document.getElementById('updateMaternalStatus').value = status;

    // Show modal
    updateMaternalModal.style.display = 'flex';
    console.log(`Opening update modal for: ${name}`);
  }

  function bindUpdateButtons() {
    const updateBtns = document.querySelectorAll('.btn-outline');
    updateBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const row = this.closest('tr');
        if (row) openMaternalUpdate(row);
      });
    });
  }

  bindUpdateButtons();

  // Rendered rows are not present at initial binding time, so handle Update clicks by delegation too.
  document.addEventListener('click', function(e) {
    const btn = e.target.classList && (e.target.classList.contains('btn-outline')
      ? e.target
      : e.target.closest ? e.target.closest('.btn-outline') : null);
    if (!btn) return;
    const row = btn.closest('tr');
    if (row && row.closest('#maternalTbody') && !btn.classList.contains('btn-report-action')) {
      openMaternalUpdate(row);
    }
  });
  
  // Close view modal handlers
  if (closeViewMaternalBtn) {
    closeViewMaternalBtn.addEventListener('click', () => {
      viewMaternalModal.style.display = 'none';
    });
  }
  
  if (cancelViewMaternalBtn) {
    cancelViewMaternalBtn.addEventListener('click', () => {
      viewMaternalModal.style.display = 'none';
    });
  }
  
  // Close update modal handlers
  if (closeUpdateMaternalBtn) {
    closeUpdateMaternalBtn.addEventListener('click', () => {
      updateMaternalModal.style.display = 'none';
    });
  }
  
  if (cancelUpdateMaternalBtn) {
    cancelUpdateMaternalBtn.addEventListener('click', () => {
      updateMaternalModal.style.display = 'none';
    });
  }
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === maternalModal) {
      closeMaternalModal();
    }
    if (e.target === viewMaternalModal) {
      viewMaternalModal.style.display = 'none';
    }
    if (e.target === updateMaternalModal) {
      updateMaternalModal.style.display = 'none';
    }
  });
  
  // Handle update form submission
  if (updateMaternalForm) {
    updateMaternalForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('updateMaternalName').value;
      const code = document.getElementById('updateMaternalCode').value;
      const purok = document.getElementById('updateMaternalPurok').value;
      const weight = document.getElementById('updateMaternalWeight').value;
      const bp = document.getElementById('updateMaternalBP').value;
      const status = document.getElementById('updateMaternalStatus').value;
      
      console.log('Updating maternal record:', { name, code, purok, weight, bp, status });
      
      alert(`✓ Maternal Record Updated!\n\nPatient: ${name}\nCode: ${code}\nPurok: ${purok}\nWeight: ${weight} kg\nBP: ${bp}\nStatus: ${status}\n\nChanges have been saved successfully.`);
      
      // Close modal
      updateMaternalModal.style.display = 'none';
      
      // TODO: Update the actual table row with new data
    });
  }


  // Initialize
  updateUserProfile();
  setTimeout(() => {
    updateUserProfile();
  }, 100);

  // Start clock
  setInterval(updateClock, 1000);
  updateClock();
});