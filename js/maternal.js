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

  // Pagination state
  const maternalPager = document.getElementById('maternalPager');
  const maternalPagerInfo = document.getElementById('maternalPagerInfo');
  const maternalPageSizeEl = document.getElementById('maternalPageSize');
  let maternalPageIndex = 0;
  let maternalPageSize = 10;

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

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      maternalPageIndex = 0;
      renderMaternalTable();
    });
  }

  if (purokSelect) {
    purokSelect.addEventListener('change', () => {
      maternalPageIndex = 0;
      renderMaternalTable();
    });
  }

  // Rows per page
  if (maternalPageSizeEl) {
    maternalPageSizeEl.addEventListener('change', function() {
      const val = this.value;
      maternalPageSize = val === 'all' ? 'all' : (Number(val) || 10);
      maternalPageIndex = 0;
      renderMaternalTable();
    });
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
          records.push({ rec, purok: purok.name, purokKey: key, status });
        }
      });
    });
    return records;
  }

  const maternalStatusClass = { 'Completed': 'status-green', 'Due This Month': 'status-yellow', 'Overdue': 'status-red' };

  function buildMotherRow(item) {
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

    return tr;
  }

  function renderMaternalTable() {
    const tbody = document.getElementById('maternalTbody');
    if (!tbody) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedPurok = purokSelect ? purokSelect.value.toLowerCase() : 'all';

    const filtered = scopedMothers().filter(item => {
      const name = (item.rec.name || '').toLowerCase();
      const purok = (item.purok || '').toLowerCase();
      const ttDose = String(item.rec.ttDose || '').toLowerCase();
      const matchesSearch = !searchTerm || name.includes(searchTerm) || purok.includes(searchTerm) || ttDose.includes(searchTerm);
      const matchesPurok = selectedPurok === 'all' || item.purokKey === selectedPurok;
      return matchesSearch && matchesPurok;
    });

    const pageSize = maternalPageSize === 'all' ? filtered.length : (Number(maternalPageSize) || 10);
    const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
    if (maternalPageIndex >= totalPages) maternalPageIndex = totalPages - 1;
    if (maternalPageIndex < 0) maternalPageIndex = 0;
    const start = maternalPageIndex * pageSize;
    const end = Math.min(start + pageSize, filtered.length);

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      const emptyTr = document.createElement('tr');
      emptyTr.innerHTML = '<td colspan="10" class="coverage-empty">No records match the current search &amp; filter.</td>';
      tbody.appendChild(emptyTr);
    }

    filtered.slice(start, end).forEach(item => tbody.appendChild(buildMotherRow(item)));

    updateMaternalPager(filtered.length, start, end);
  }

  function updateMaternalPager(total, start, end) {
    if (maternalPagerInfo) {
      maternalPagerInfo.textContent = total === 0
        ? 'Showing 0–0 of 0'
        : `Showing ${start + 1}–${end} of ${total}`;
    }
    if (!maternalPager) return;
    maternalPager.innerHTML = '';

    const pageSize = maternalPageSize === 'all' ? total : (Number(maternalPageSize) || 10);
    const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;

    const makeBtn = (label, page, active, disabled) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `pager-btn${active ? ' active' : ''}`;
      b.textContent = label;
      if (disabled) b.disabled = true;
      b.addEventListener('click', () => {
        maternalPageIndex = page;
        renderMaternalTable();
      });
      return b;
    };

    maternalPager.appendChild(makeBtn('‹ Prev', maternalPageIndex - 1, false, maternalPageIndex <= 0));

    const maxVisible = 7;
    let startPage = 0;
    let endPage = totalPages - 1;
    if (totalPages > maxVisible) {
      startPage = Math.max(0, maternalPageIndex - Math.floor(maxVisible / 2));
      endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    if (startPage > 0) maternalPager.appendChild(makeBtn('1', 0, false, false));
    if (startPage > 1) {
      const ell = document.createElement('span');
      ell.className = 'pager-ellipsis';
      ell.textContent = '…';
      maternalPager.appendChild(ell);
    }
    for (let i = startPage; i <= endPage; i++) {
      maternalPager.appendChild(makeBtn(String(i + 1), i, i === maternalPageIndex, false));
    }
    if (endPage < totalPages - 2) {
      const ell = document.createElement('span');
      ell.className = 'pager-ellipsis';
      ell.textContent = '…';
      maternalPager.appendChild(ell);
    }
    if (endPage < totalPages - 1) maternalPager.appendChild(makeBtn(String(totalPages), totalPages - 1, false, false));

    maternalPager.appendChild(makeBtn('Next ›', maternalPageIndex + 1, false, maternalPageIndex >= totalPages - 1));
  }

  // ========== MATERNAL CARE COVERAGE PANEL ==========
  function parseBp(bp) {
    const parts = String(bp || '').split('/');
    return {
      sys: parseInt(parts[0], 10) || 0,
      dia: parseInt(parts[1], 10) || 0
    };
  }

  function isHighBP(bp) {
    const { sys, dia } = parseBp(bp);
    return sys >= 130 || dia >= 80;
  }

  function maternalBarClass(pct) {
    if (pct >= 80) return 'green';
    if (pct >= 50) return 'yellow';
    return 'red';
  }

  function maternalCoverageCardHead(code, pct, alertLabel) {
    const barClass = alertLabel ? 'red' : maternalBarClass(pct);
    return `
      <div class="coverage-card-head">
        <span class="coverage-code">${code}</span>
        <span class="coverage-pct text-${alertLabel ? 'red' : barClass}">${pct}%</span>
      </div>
    `;
  }

  function renderMaternalStatusSummary() {
    const mothers = scopedMothers();
    const counts = { 'Overdue': 0, 'Due This Month': 0, 'Completed': 0 };
    mothers.forEach(item => {
      if (counts.hasOwnProperty(item.status)) counts[item.status] += 1;
    });
    const summary = document.querySelector('.filter-bar .status-summary');
    if (!summary) return;
    summary.querySelectorAll('strong').forEach((strong, idx) => {
      const label = ['Overdue', 'Due This Month', 'Completed'][idx];
      if (label) strong.textContent = counts[label];
    });
  }

  function renderMaternalCoverage() {
    const container = document.getElementById('maternalCoverageList');
    if (!container) return;

    const mothers = scopedMothers();
    const total = mothers.length;

    if (total === 0) {
      container.innerHTML = '<p class="coverage-empty">No maternal records for your assigned puroks.</p>';
      return;
    }

    const ttCards = [];
    for (let dose = 1; dose <= 5; dose++) {
      const reached = mothers.filter(item => (parseInt(String(item.rec.ttDose).replace(/\D/g, ''), 10) || 0) >= dose).length;
      const pct = Math.round((reached / total) * 100);
      const notYet = total - reached;
      ttCards.push(`
        <div class="coverage-card" data-cover="tt-${dose}" title="View who has reached TT ${dose}">
          ${maternalCoverageCardHead(`TT ${dose}`, pct)}
          <div class="coverage-stats">
            <span><strong>${reached}</strong>/<strong>${total}</strong> reached</span>
            <span class="${notYet > 0 ? 'text-red' : 'text-green'}">${notYet} not yet</span>
          </div>
          <div class="progress-bg"><div class="progress-bar ${maternalBarClass(pct)}" style="width: ${pct}%;"></div></div>
        </div>
      `);
    }

    const ironCount = mothers.filter(item => !!item.rec.iron).length;
    const ironPct = Math.round((ironCount / total) * 100);
    const ironCard = `
      <div class="coverage-card" data-cover="iron" title="View who is taking iron">
        ${maternalCoverageCardHead('IRON', ironPct)}
        <div class="coverage-stats">
          <span><strong>${ironCount}</strong>/<strong>${total}</strong> on iron</span>
          <span class="${(total - ironCount) > 0 ? 'text-red' : 'text-green'}">${total - ironCount} not taking</span>
        </div>
        <div class="progress-bg"><div class="progress-bar ${maternalBarClass(ironPct)}" style="width: ${ironPct}%;"></div></div>
      </div>
    `;

    const bpCount = mothers.filter(item => isHighBP(item.rec.bp)).length;
    const bpPct = Math.round((bpCount / total) * 100);
    const bpCard = `
      <div class="coverage-card" data-cover="bp" title="View who has elevated blood pressure">
        ${maternalCoverageCardHead('HIGH BP', bpPct, bpCount > 0)}
        <div class="coverage-stats">
          <span><strong>${bpCount}</strong>/<strong>${total}</strong> elevated</span>
          <span class="${bpCount > 0 ? 'text-red' : 'text-green'}">${bpCount === 0 ? 'none' : 'monitor closely'}</span>
        </div>
        <div class="progress-bg"><div class="progress-bar red" style="width: ${bpPct}%;"></div></div>
      </div>
    `;

    container.innerHTML = ttCards.join('') + ironCard + bpCard;
  }

  // ========== COVERAGE DETAILS MODAL (who is covered vs not) ==========
  function buildCoverageNameList(items) {
    if (!items.length) return '<li class="coverage-list-empty">No one in this group</li>';
    return items.map(item =>
      `<li><i class="fa-solid fa-circle"></i><strong title="${item.rec.name}">${item.rec.name}</strong><span>Purok ${item.purok}</span></li>`
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

  const maternalCoverageContainer = document.getElementById('maternalCoverageList');
  if (maternalCoverageContainer) {
    maternalCoverageContainer.addEventListener('click', function(e) {
      const card = e.target.closest ? e.target.closest('.coverage-card') : null;
      if (!card) return;
      const key = card.getAttribute('data-cover');
      if (!key) return;
      const mothers = scopedMothers();
      let covered = [];
      let pending = [];
      let title = 'Coverage Details';
      let coveredHeading = 'Covered';
      let pendingHeading = 'Not covered';
      if (key.indexOf('tt-') === 0) {
        const dose = parseInt(key.split('-')[1], 10) || 1;
        title = `TT ${dose} — Immunization Coverage`;
        covered = mothers.filter(item => (parseInt(String(item.rec.ttDose).replace(/\D/g, ''), 10) || 0) >= dose);
        pending = mothers.filter(item => !((parseInt(String(item.rec.ttDose).replace(/\D/g, ''), 10) || 0) >= dose));
        coveredHeading = `Reached TT ${dose} (${covered.length})`;
        pendingHeading = `Not yet reached (${pending.length})`;
      } else if (key === 'iron') {
        title = 'IRON — Iron Supplementation';
        covered = mothers.filter(item => !!item.rec.iron);
        pending = mothers.filter(item => !item.rec.iron);
        coveredHeading = `Taking iron (${covered.length})`;
        pendingHeading = `Not taking (${pending.length})`;
      } else if (key === 'bp') {
        title = 'HIGH BP — Blood Pressure Monitoring';
        covered = mothers.filter(item => isHighBP(item.rec.bp));
        pending = mothers.filter(item => !isHighBP(item.rec.bp));
        coveredHeading = `Elevated BP (${covered.length})`;
        pendingHeading = `Normal BP (${pending.length})`;
      }
      openCoverageList(title, covered, pending, coveredHeading, pendingHeading);
    });
  }

  renderMaternalTable();
  renderMaternalCoverage();
  renderMaternalStatusSummary();

  // Print button — expands to all filtered rows before printing
  const btnPrintMaternal = document.getElementById('btnPrintMaternal');
  if (btnPrintMaternal) {
    btnPrintMaternal.addEventListener('click', () => {
      const dateEl = document.querySelector('.print-date-text');
      if (dateEl) dateEl.textContent = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
      const prevState = { page: maternalPageIndex, size: maternalPageSize };
      maternalPageIndex = 0;
      maternalPageSize = 'all';
      renderMaternalTable();
      setTimeout(() => {
        window.print();
        maternalPageIndex = prevState.page;
        maternalPageSize = prevState.size;
        renderMaternalTable();
      }, 60);
    });
  }

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