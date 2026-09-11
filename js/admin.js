document.addEventListener('DOMContentLoaded', () => {
  // Validate session - must be admin user
  if (!validateSession('admin')) {
    return;
  }

  // Update admin profile information
  function updateAdminProfile() {
    const session = getSession();
    if (!session) return;

    const userName = getCurrentUserName();
    const adminUserNameElement = document.getElementById('adminUserName');
    const adminUserRoleElement = document.getElementById('adminUserRole');

    if (adminUserNameElement) {
      adminUserNameElement.textContent = userName;
    }

    if (adminUserRoleElement) {
      adminUserRoleElement.textContent = 'System Administrator';
    }
  }

  // Load credentials from the temporary storage
  let bhwUsers = BHW_CREDENTIALS;

  let loginHistory = [
    {
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: 'BHW001',
      userName: 'Prelin L. Veriño',
      status: 'success'
    },
    {
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      userId: 'BHW002',
      userName: 'Flora L. Tangoan',
      status: 'success'
    },
    {
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      userId: 'BHW003',
      userName: 'Ana Reyes',
      status: 'failed'
    },
    {
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      userId: 'BHW004',
      userName: 'Carlos Mendoza',
      status: 'success'
    },
    {
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      userId: 'BHW001',
      userName: 'Prelin L. Veriño',
      status: 'success'
    }
  ];

  // DOM Elements
  const usersTableBody = document.getElementById('usersTableBody');
  const historyTableBody = document.getElementById('historyTableBody');
  const userModal = document.getElementById('userModal');
  const deleteModal = document.getElementById('deleteModal');
  const userForm = document.getElementById('userForm');
  const searchUsers = document.getElementById('searchUsers');
  const filterStatus = document.getElementById('filterStatus');
  const historyFilter = document.getElementById('historyFilter');
  const btnAddUser = document.getElementById('btnAddUser');
  const btnCloseUserModal = document.getElementById('btnCloseUserModal');
  const btnCancelUserModal = document.getElementById('btnCancelUserModal');
  const btnCloseDeleteModal = document.getElementById('btnCloseDeleteModal');
  const btnCancelDeleteModal = document.getElementById('btnCancelDeleteModal');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  const logoutBtn = document.querySelector('.btn-logout');

  let currentDeleteUserId = null;

  // Navigation
  const navLinks = document.querySelectorAll('.nav-link');
  const contentSections = document.querySelectorAll('.content-section');

  // Show a section by nav data-section id
  function showSection(sectionId) {
    const sectionName = `${sectionId}-section`;
    
    navLinks.forEach(l => {
      l.parentElement.classList.toggle('active', l.getAttribute('data-section') === sectionId);
    });
    
    const userMgmtLink = document.querySelector('a[href="admin.html"]');
    if (userMgmtLink) userMgmtLink.parentElement.classList.remove('active');

    contentSections.forEach(section => {
      section.classList.toggle('active', section.id === sectionName);
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      showSection(sectionId);
    });
  });

  // Support deep-linking: admin.html#data-analytics-section
  if (window.location.hash && window.location.hash.indexOf('#') === 0) {
    const targetSectionId = window.location.hash.replace('#', '');
    const matchedLink = Array.from(navLinks).find(l => l.getAttribute('data-section') && `${l.getAttribute('data-section')}-section` === targetSectionId);
    if (matchedLink) {
      showSection(matchedLink.getAttribute('data-section'));
    }
  }

  // Update stats
  function updateStats() {
    const totalUsers = bhwUsers.length;
    const activeUsers = bhwUsers.filter(user => user.status === 'active').length;
    const inactiveUsers = bhwUsers.filter(user => user.status === 'inactive').length;
    
    const twentyFourHoursAgo = new Date(Date.now() - 86400000);
    const recentLogins = loginHistory.filter(login => 
      new Date(login.timestamp) > twentyFourHoursAgo && login.status === 'success'
    ).length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('inactiveUsers').textContent = inactiveUsers;
    document.getElementById('recentLogins').textContent = recentLogins;
  }

  // Render users table
  function purokKeyToName(key) {
    const data = purokData && purokData[key] ? purokData[key] : null;
    return data ? data.name : key;
  }

  function purokAssignmentsCell(user) {
    let purokCount = Object.keys(purokData).length;
    let hasAnyData = typeof purokData !== 'undefined' && purokCount > 0;
    const keys = Array.isArray(user.assignedPuroks) ? user.assignedPuroks : (hasAnyData ? [] : []);
    const names = keys.map(purokKeyToName);

    if (names.length === 0) {
      return '<td class="assigned-puroks-cell"><span class="purok-tag-empty">—</span></td>';
    }
    return `<td class="assigned-puroks-cell">${names.map(n => `<span class="purok-tag">${n}</span>`).join('')}</td>`;
  }

  // Populate the purok checkbox chips inside the Add/Edit user modal
  function renderAssignedPurokCheckboxes() {
    const group = document.getElementById('assignedPuroksGroup');
    if (!group) return;
    if (typeof purokData === 'undefined') return;

    group.innerHTML = '';
    Object.keys(purokData).forEach(key => {
      const name = purokData[key].name;
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" name="assignedPurok" value="${key}"> Purok ${name}`;
      group.appendChild(label);
    });
  }

  function renderUsers(users = bhwUsers) {
    usersTableBody.innerHTML = '';
    
    users.forEach(user => {
      const row = document.createElement('tr');
      const lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : null;
      const lastLoginText = lastLoginDate ? formatDate(lastLoginDate) : 'Never';
      const fullName = user.middleInitial 
        ? `${user.firstName} ${user.middleInitial}. ${user.lastName}`
        : `${user.firstName} ${user.lastName}`;
      const dobText = user.dob ? formatDate(new Date(user.dob)) : 'N/A';
      
      row.innerHTML = `
        <td><strong>${user.id}</strong></td>
        <td>${fullName}</td>
        <td>${user.contact}</td>
        <td>${dobText}</td>
        ${purokAssignmentsCell(user)}
        <td><span class="status-badge status-${user.status}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
        <td>${lastLoginText}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-action btn-edit" onclick="editUser('${user.id}')">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button class="btn-action btn-${user.status === 'active' ? 'deactivate' : 'activate'}" 
                    onclick="toggleUserStatus('${user.id}')">
              <i class="fa-solid fa-${user.status === 'active' ? 'ban' : 'check'}"></i> 
              ${user.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
            <button class="btn-action btn-delete" onclick="confirmDeleteUser('${user.id}')">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </td>
      `;
      usersTableBody.appendChild(row);
    });
  }

  // Render login history
  function renderLoginHistory(history = loginHistory) {
    historyTableBody.innerHTML = '';
    
    history.forEach(login => {
      const row = document.createElement('tr');
      const timestamp = new Date(login.timestamp);
      
      row.innerHTML = `
        <td>${formatDateTime(timestamp)}</td>
        <td><strong>${login.userName}</strong></td>
        <td>${login.userId}</td>
        <td><span class="status-badge status-${login.status}">${login.status.charAt(0).toUpperCase() + login.status.slice(1)}</span></td>
      `;
      historyTableBody.appendChild(row);
    });
  }

  // Format date helper
  function formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  // Format datetime helper
  function formatDateTime(date) {
    const options = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleString('en-US', options);
  }

  // Filter users
  function filterUsers() {
    const searchTerm = searchUsers ? searchUsers.value.toLowerCase() : '';
    const statusFilter = filterStatus.value;

    let filteredUsers = bhwUsers.filter(user => {
      const fullName = user.middleInitial 
        ? `${user.firstName} ${user.middleInitial} ${user.lastName}`.toLowerCase()
        : `${user.firstName} ${user.lastName}`.toLowerCase();
      
      const matchesSearch = !searchTerm || fullName.includes(searchTerm) || 
                         user.id.toLowerCase().includes(searchTerm) ||
                         user.contact.includes(searchTerm) ||
                         (Array.isArray(user.assignedPuroks) && user.assignedPuroks.some(k => purokKeyToName(k).toLowerCase().includes(searchTerm)));
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    renderUsers(filteredUsers);
  }

  // Filter login history
  function filterHistory() {
    const filterValue = historyFilter.value;
    const now = new Date();
    let filteredHistory = loginHistory;

    switch(filterValue) {
      case 'today':
        filteredHistory = loginHistory.filter(login => {
          const loginDate = new Date(login.timestamp);
          return loginDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredHistory = loginHistory.filter(login => new Date(login.timestamp) > weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredHistory = loginHistory.filter(login => new Date(login.timestamp) > monthAgo);
        break;
      case 'all':
      default:
        filteredHistory = loginHistory;
        break;
    }

    renderLoginHistory(filteredHistory);
  }

  // Open user modal for adding
  function openAddUserModal() {
    document.getElementById('userModalTitle').textContent = 'Add New BHW Account';
    document.getElementById('editUserId').value = '';
    userForm.reset();
    
    const credentialsSection = document.getElementById('credentialsSection');
    if (credentialsSection) {
      credentialsSection.style.display = 'none';
    }

    // Clear purok checkbox selection
    document.querySelectorAll('#assignedPuroksGroup input[name="assignedPurok"]').forEach(cb => {
      cb.checked = false;
    });
    
    userModal.style.display = 'flex';
  }

  // Open user modal for editing
  window.editUser = function(userId) {
    const user = bhwUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('userModalTitle').textContent = 'Edit BHW Account';
    document.getElementById('editUserId').value = userId;
    document.getElementById('userFirstName').value = user.firstName;
    document.getElementById('userLastName').value = user.lastName;
    document.getElementById('userMiddleInitial').value = user.middleInitial || '';
    document.getElementById('userContact').value = user.contact;
    document.getElementById('userDob').value = user.dob;

    const credentialsSection = document.getElementById('credentialsSection');
    if (credentialsSection) {
      credentialsSection.style.display = 'block';
      document.getElementById('displayBhwId').textContent = user.id;
      document.getElementById('displayPassword').textContent = user.password;
    }

    // Check the puroks assigned to this user
    document.querySelectorAll('#assignedPuroksGroup input[name="assignedPurok"]').forEach(cb => {
      cb.checked = Array.isArray(user.assignedPuroks) && user.assignedPuroks.includes(cb.value);
    });

    userModal.style.display = 'flex';
  };

  // Toggle user status
  window.toggleUserStatus = function(userId) {
    const user = bhwUsers.find(u => u.id === userId);
    if (!user) return;

    user.status = user.status === 'active' ? 'inactive' : 'active';
    
    const fullName = user.middleInitial 
      ? `${user.firstName} ${user.middleInitial}. ${user.lastName}`
      : `${user.firstName} ${user.lastName}`;
    
    loginHistory.unshift({
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: fullName,
      status: 'success'
    });

    updateStats();
    filterUsers();
  };

  // Confirm delete user
  window.confirmDeleteUser = function(userId) {
    const user = bhwUsers.find(u => u.id === userId);
    if (!user) return;

    currentDeleteUserId = userId;
    const fullName = user.middleInitial 
      ? `${user.firstName} ${user.middleInitial}. ${user.lastName}`
      : `${user.firstName} ${user.lastName}`;
    document.getElementById('deleteUserName').textContent = fullName;
    deleteModal.style.display = 'flex';
  };

  // Delete user
  function deleteUser() {
    if (!currentDeleteUserId) return;

    const userIndex = bhwUsers.findIndex(u => u.id === currentDeleteUserId);
    if (userIndex !== -1) {
      bhwUsers.splice(userIndex, 1);
    }
    
    currentDeleteUserId = null;
    deleteModal.style.display = 'none';
    updateStats();
    filterUsers();
  }

  // Close modals
  function closeUserModal() {
    userModal.style.display = 'none';
    userForm.reset();
  }

  function closeDeleteModal() {
    deleteModal.style.display = 'none';
    currentDeleteUserId = null;
  }

  // Form submission
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const editUserId = document.getElementById('editUserId').value;
    const firstName = document.getElementById('userFirstName').value;
    const lastName = document.getElementById('userLastName').value;
    const middleInitial = document.getElementById('userMiddleInitial').value;
    const contact = document.getElementById('userContact').value;
    const dob = document.getElementById('userDob').value;
    const assignedPuroks = Array.from(document.querySelectorAll('#assignedPuroksGroup input[name="assignedPurok"]:checked'))
      .map(cb => cb.value);

    if (editUserId) {
      const userIndex = bhwUsers.findIndex(u => u.id === editUserId);
      if (userIndex !== -1) {
        bhwUsers[userIndex] = {
          ...bhwUsers[userIndex],
          firstName,
          lastName,
          middleInitial,
          contact,
          dob,
          assignedPuroks
        };
      }
    } else {
      const newId = generateBHWId();
      const autoPassword = generatePassword(firstName, lastName);
      
      const newUser = {
        id: newId,
        firstName,
        lastName,
        middleInitial,
        contact,
        dob,
        password: autoPassword,
        status: 'active',
        assignedPuroks,
        lastLogin: null,
        createdAt: new Date().toISOString()
      };
      
      bhwUsers.push(newUser);
      
      const fullName = middleInitial 
        ? `${firstName} ${middleInitial}. ${lastName}`
        : `${firstName} ${lastName}`;
      
      alert(`New BHW Account Created Successfully!\n\nBHW ID: ${newId}\nPassword: ${autoPassword}\n\nPlease provide these credentials to ${fullName}.`);
    }

    closeUserModal();
    updateStats();
    filterUsers();
  });

  // Event listeners
  btnAddUser.addEventListener('click', openAddUserModal);
  btnCloseUserModal.addEventListener('click', closeUserModal);
  btnCancelUserModal.addEventListener('click', closeUserModal);
  btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
  btnCancelDeleteModal.addEventListener('click', closeDeleteModal);
  btnConfirmDelete.addEventListener('click', deleteUser);

  if (searchUsers) searchUsers.addEventListener('input', filterUsers);
  filterStatus.addEventListener('change', filterUsers);
  historyFilter.addEventListener('change', filterHistory);

  window.addEventListener('click', (e) => {
    if (e.target === userModal) closeUserModal();
    if (e.target === deleteModal) closeDeleteModal();
  });

  // Logout functionality
  logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      clearSession();
      window.location.href = 'login.html';
    }
  });

  // Update clock
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

  // ============================================================
  // PUROK MASTERLISTS MODULE
  // ============================================================

  const purokTabs = document.querySelectorAll('.purok-tab');
  const purokMasterFilter = document.getElementById('purokMasterFilter');

  let currentPurokKey = 'all';
  let masterlistRows = [];
  let masterlistPageIndex = 0;
  let masterlistPageSize = 10;
  const masterlistSearchEl = document.getElementById('masterlistSearch');
  const masterlistPager = document.getElementById('masterlistPager');
  const masterlistPagerInfo = document.getElementById('masterlistPagerInfo');
  const masterlistPageSizeEl = document.getElementById('masterlistPageSize');

  function renderPurok(purokKey) {
    const statHouseholds = document.getElementById('stat-households');
    if (statHouseholds === null) return;

    currentPurokKey = purokKey || 'all';
    const isAll = currentPurokKey === 'all';
    const keys = isAll ? Object.keys(purokData) : [currentPurokKey];

    const searchTerm = masterlistSearchEl ? masterlistSearchEl.value.trim().toLowerCase() : '';

    const allRows = [];
    let households = 0;
    const bhwNamesSet = new Set();

    keys.forEach(key => {
      const data = purokData[key];
      if (!data) return;
      households += Number(data.households) || 0;
      (data.records || []).forEach(rec => {
        allRows.push({
          rec,
          purokName: data.name,
          status: computeStatus(rec.nextVisitDate, rec.lastVisitDate)
        });
      });
      if (typeof getPurokBhwNames === 'function') {
        const names = getPurokBhwNames(key);
        if (Array.isArray(names)) names.forEach(n => n && bhwNamesSet.add(n));
        else if (names) bhwNamesSet.add(names);
      } else if (Array.isArray(data.bhws)) {
        data.bhws.forEach(n => n && bhwNamesSet.add(n));
      } else if (data.bhws) {
        bhwNamesSet.add(data.bhws);
      }
    });

    // Apply masterlist search (name, address, or purok name)
    const rows = !searchTerm ? allRows : allRows.filter(r =>
      (r.rec.name && r.rec.name.toLowerCase().includes(searchTerm)) ||
      (r.rec.address && r.rec.address.toLowerCase().includes(searchTerm)) ||
      (r.purokName && r.purokName.toLowerCase().includes(searchTerm))
    );
    masterlistRows = rows;

    const childRecords = rows.filter(r => r.rec.type === 'Child');
    const motherRecords = rows.filter(r => r.rec.type === 'Mother');
    const totalPopulation = rows.length;
    const overdueCount = rows.filter(r => r.status === 'Overdue').length;
    const dueThisMonthCount = rows.filter(r => r.status === 'Due This Month').length;

    // Update stats
    document.getElementById('stat-households').innerText = String(households);
    document.getElementById('stat-households-sub').innerText = isAll
      ? 'Registered across all puroks'
      : `Registered in ${purokData[currentPurokKey].name}`;

    document.getElementById('stat-population').innerText = String(totalPopulation);
    document.getElementById('stat-population-sub').innerText = `${childRecords.length} children · ${motherRecords.length} mothers`;

    document.getElementById('stat-due').innerText = String(overdueCount + dueThisMonthCount);
    document.getElementById('stat-due-sub').innerText = `${overdueCount} overdue · ${dueThisMonthCount} due this month`;

    // Derive BHW assignments from live credentials when available
    let bhwCountDisplay;
    if (typeof getUsersByPurokKey === 'function') {
      const userIds = new Set();
      keys.forEach(key => {
        const users = getUsersByPurokKey(key);
        (users || []).forEach(u => userIds.add(u.id || u.code || u.name));
      });
      bhwCountDisplay = userIds.size;
    } else {
      bhwCountDisplay = keys.reduce((sum, key) => sum + (Number(purokData[key].bhwCount) || 0), 0);
    }
    const bhwNames = Array.from(bhwNamesSet).filter(Boolean);
    document.getElementById('stat-bhws').innerText = String(bhwCountDisplay);
    document.getElementById('stat-bhws-sub').innerText = bhwNames.length
      ? bhwNames.join(', ')
      : (isAll ? `${bhwCountDisplay} active BHWs` : ((purokData[currentPurokKey] || {}).bhws || '—'));

    // Update table title & count
    document.getElementById('table-title').innerText = isAll
      ? 'All Puroks — Health Records'
      : `Purok ${purokData[currentPurokKey].name} — Health Records`;
    document.getElementById('entries-count').innerText = `${totalPopulation} entries (${childRecords.length} children, ${motherRecords.length} mothers)`;

    // Show/hide the Purok column
    const purokColTh = document.getElementById('masterlistPurokCol');
    if (purokColTh) purokColTh.classList.toggle('show', isAll);

    // Pagination math
    const pageSize = masterlistPageSize === 'all' ? rows.length : (Number(masterlistPageSize) || 10);
    const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
    if (masterlistPageIndex >= totalPages) masterlistPageIndex = totalPages - 1;
    if (masterlistPageIndex < 0) masterlistPageIndex = 0;
    const start = masterlistPageIndex * pageSize;
    const end = Math.min(start + pageSize, rows.length);
    const pageRows = rows.slice(start, end);

    // Render table rows
    const tbody = document.getElementById('purok-table-body');
    tbody.innerHTML = '';

    if (pageRows.length === 0) {
      const emptyTr = document.createElement('tr');
      emptyTr.innerHTML = `<td colspan="7" class="purok-empty">No matching records for the current search &amp; filter.</td>`;
      tbody.appendChild(emptyTr);
    }

    pageRows.forEach(({ rec, purokName, status }) => {
      const typeTag = rec.type === 'Child'
        ? `<span class="type-pill type-child"><i class="fa-solid fa-child"></i> Child</span>`
        : `<span class="type-pill type-mother"><i class="fa-solid fa-person-pregnant"></i> Mother</span>`;

      let statusPill = '';
      if (status === 'Overdue') {
        const days = getOverdueDays(rec.nextVisitDate);
        statusPill = `<span class="status-pill status-red">• Overdue (${days}d)</span>`;
      } else if (status === 'Due This Month') {
        statusPill = `<span class="status-pill status-yellow">• Due This Month</span>`;
      } else {
        statusPill = `<span class="status-pill status-green">• Completed</span>`;
      }

      const nextDate = rec.nextVisitDate ? new Date(rec.nextVisitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="person-name">${rec.name}</td>
        ${isAll ? `<td class="masterlist-purok-col">${purokName}</td>` : ''}
        <td>${typeTag}</td>
        <td>${rec.address}</td>
        <td>${statusPill}</td>
        <td style="font-size: 12px; color: #64748b;">${nextDate}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-tbl-action"><i class="fa-solid fa-id-card"></i> Print Card</button>
            <button class="btn-tbl-action btn-tbl-edit"><i class="fa-solid fa-pen"></i> Edit</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    updateMasterlistPager(rows.length, start, end);
  }

  function updateMasterlistPager(total, start, end) {
    if (masterlistPagerInfo) {
      masterlistPagerInfo.textContent = total === 0
        ? 'Showing 0–0 of 0'
        : `Showing ${start + 1}–${end} of ${total}`;
    }
    if (!masterlistPager) return;
    masterlistPager.innerHTML = '';

    const pageSize = masterlistPageSize === 'all' ? total : (Number(masterlistPageSize) || 10);
    const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;

    const makeBtn = (label, page, active, disabled) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `pager-btn${active ? ' active' : ''}`;
      b.textContent = label;
      if (disabled) b.disabled = true;
      b.addEventListener('click', () => {
        masterlistPageIndex = page;
        renderPurok(currentPurokKey);
      });
      return b;
    };

    masterlistPager.appendChild(makeBtn('‹ Prev', masterlistPageIndex - 1, false, masterlistPageIndex <= 0));

    const maxVisible = 7;
    let startPage = 0;
    let endPage = totalPages - 1;
    if (totalPages > maxVisible) {
      startPage = Math.max(0, masterlistPageIndex - Math.floor(maxVisible / 2));
      endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    if (startPage > 0) masterlistPager.appendChild(makeBtn('1', 0, false, false));
    if (startPage > 1) {
      const ell = document.createElement('span');
      ell.className = 'pager-ellipsis';
      ell.textContent = '…';
      masterlistPager.appendChild(ell);
    }
    for (let i = startPage; i <= endPage; i++) {
      masterlistPager.appendChild(makeBtn(String(i + 1), i, i === masterlistPageIndex, false));
    }
    if (endPage < totalPages - 2) {
      const ell = document.createElement('span');
      ell.className = 'pager-ellipsis';
      ell.textContent = '…';
      masterlistPager.appendChild(ell);
    }
    if (endPage < totalPages - 1) masterlistPager.appendChild(makeBtn(String(totalPages), totalPages - 1, false, false));

    masterlistPager.appendChild(makeBtn('Next ›', masterlistPageIndex + 1, false, masterlistPageIndex >= totalPages - 1));
  }

  // Purok filter tabs
  purokTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      purokTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      if (purokMasterFilter) purokMasterFilter.value = this.getAttribute('data-purok');
      masterlistPageIndex = 0;
      renderPurok(this.getAttribute('data-purok'));
    });
  });

  // All-Puroks dropdown filter (synced with the tabs)
  if (purokMasterFilter) {
    purokMasterFilter.addEventListener('change', function() {
      const value = this.value;
      if (value === 'all') {
        purokTabs.forEach(t => t.classList.remove('active'));
      } else {
        purokTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-purok') === value));
      }
      masterlistPageIndex = 0;
      renderPurok(value);
    });
  }

  // Masterlist search
  if (masterlistSearchEl) {
    masterlistSearchEl.addEventListener('input', () => {
      masterlistPageIndex = 0;
      renderPurok(currentPurokKey);
    });
  }

  // Masterlist rows-per-page
  if (masterlistPageSizeEl) {
    masterlistPageSizeEl.addEventListener('change', function() {
      const val = this.value;
      masterlistPageSize = val === 'all' ? 'all' : (Number(val) || 10);
      masterlistPageIndex = 0;
      renderPurok(currentPurokKey);
    });
  }

  // Print field visit sheet — expands to all matching rows before printing
  const btnPrintPurok = document.getElementById('btnPrintPurok');
  if (btnPrintPurok) {
    btnPrintPurok.addEventListener('click', () => {
      const dateEl = document.querySelector('.print-date-text');
      if (dateEl) dateEl.textContent = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
      const prevState = { page: masterlistPageIndex, size: masterlistPageSize };
      masterlistPageIndex = 0;
      masterlistPageSize = 'all';
      renderPurok(currentPurokKey);
      setTimeout(() => {
        window.print();
        masterlistPageIndex = prevState.page;
        masterlistPageSize = prevState.size;
        renderPurok(currentPurokKey);
      }, 60);
    });
  }

  // ============================================================
  // DATA ANALYTICS MODULE
  // ============================================================

  let purokBarChartInstance = null;
  let statusDonutChartInstance = null;
  let vaccineGapChartInstance = null;
  let currentAnalyticsRange = 'month';

  // Vaccine type coverage data (derived from live records)
  const vaccineTypes = (function () {
    if (typeof getAllPurokRecords !== 'function' || typeof VACCINES === 'undefined') {
      return [
        { name: 'BCG', total: 0, covered: 0 },
        { name: 'OPV', total: 0, covered: 0 },
        { name: 'IPV', total: 0, covered: 0 },
        { name: 'PENTA', total: 0, covered: 0 },
        { name: 'PCV', total: 0, covered: 0 },
        { name: 'MCV1', total: 0, covered: 0 },
        { name: 'MCV2', total: 0, covered: 0 }
      ];
    }
    const allChildren = getAllPurokRecords().filter(r => r.type === 'Child');
    const total = allChildren.length;
    return VACCINES.map(v => ({
      name: v,
      total,
      covered: allChildren.filter(rec => Array.isArray(rec.vaccines) && rec.vaccines.includes(v)).length
    }));
  })();

  // Filter records by date range
  function filterRecordsByRange(records, range) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return records.filter(rec => {
      const nextDate = rec.nextVisitDate ? new Date(rec.nextVisitDate) : null;
      const lastDate = rec.lastVisitDate ? new Date(rec.lastVisitDate) : null;
      const refDate = nextDate || lastDate;
      if (!refDate) return true;

      switch (range) {
        case 'month':
          return refDate.getMonth() === today.getMonth() && refDate.getFullYear() === today.getFullYear()
            || (lastDate && lastDate.getMonth() === today.getMonth() && lastDate.getFullYear() === today.getFullYear());
        case 'quarter': {
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return refDate >= threeMonthsAgo || (lastDate && lastDate >= threeMonthsAgo);
        }
        case 'year':
          return refDate.getFullYear() === today.getFullYear()
            || (lastDate && lastDate.getFullYear() === today.getFullYear());
        case 'all':
        default:
          return true;
      }
    });
  }

  // Compute descriptive analytics
  function computeDescriptiveAnalytics() {
    const allRecords = getAllPurokRecords();
    const filtered = filterRecordsByRange(allRecords, currentAnalyticsRange);

    const total = filtered.length;
    const overdue = filtered.filter(r => r.status === 'Overdue').length;
    const dueMonth = filtered.filter(r => r.status === 'Due This Month').length;
    const completed = filtered.filter(r => r.status === 'Completed').length;

    // Update stat cards
    document.getElementById('analyticsTotalRecords').textContent = total;
    document.getElementById('analyticsOverdue').textContent = overdue;
    document.getElementById('analyticsDueMonth').textContent = dueMonth;
    document.getElementById('analyticsCompleted').textContent = completed;

    return { allRecords, filtered, total, overdue, dueMonth, completed };
  }

  // Render bar chart: Records per Purok
  function renderBarChart(data) {
    const purokCounts = {};
    const purokOverdue = {};
    const purokDue = {};
    const purokCompleted = {};

    data.filtered.forEach(rec => {
      if (!purokCounts[rec.purok]) {
        purokCounts[rec.purok] = 0;
        purokOverdue[rec.purok] = 0;
        purokDue[rec.purok] = 0;
        purokCompleted[rec.purok] = 0;
      }
      purokCounts[rec.purok]++;
      if (rec.status === 'Overdue') purokOverdue[rec.purok]++;
      else if (rec.status === 'Due This Month') purokDue[rec.purok]++;
      else purokCompleted[rec.purok]++;
    });

    const labels = Object.keys(purokCounts);
    const ctx = document.getElementById('purokBarChart');
    if (!ctx) return;

    if (purokBarChartInstance) purokBarChartInstance.destroy();

    purokBarChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Overdue',
            data: labels.map(l => purokOverdue[l] || 0),
            backgroundColor: '#ef4444',
            borderRadius: 4
          },
          {
            label: 'Due This Month',
            data: labels.map(l => purokDue[l] || 0),
            backgroundColor: '#f59e0b',
            borderRadius: 4
          },
          {
            label: 'Completed',
            data: labels.map(l => purokCompleted[l] || 0),
            backgroundColor: '#22c55e',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  // Render donut chart: Status Distribution
  function renderDonutChart(data) {
    const ctx = document.getElementById('statusDonutChart');
    if (!ctx) return;

    if (statusDonutChartInstance) statusDonutChartInstance.destroy();

    statusDonutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Overdue', 'Due This Month', 'Completed'],
        datasets: [{
          data: [data.overdue, data.dueMonth, data.completed],
          backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Shared analytics helpers
  function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function coverageBarClass(pct) {
    if (pct >= 80) return 'green';
    if (pct >= 50) return 'yellow';
    if (pct >= 30) return 'orange';
    return 'red';
  }

  function rangeRateClass(rate) {
    if (rate >= 80) return 'text-green';
    if (rate >= 50) return 'text-yellow';
    return 'text-red';
  }

  function ttDoseLevel(rec) {
    return parseInt(String(rec.ttDose).replace(/\D/g, ''), 10) || 0;
  }

  function isHighBP(bp) {
    if (!bp) return false;
    const match = String(bp).match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return false;
    return parseInt(match[1], 10) >= 130 || parseInt(match[2], 10) >= 80;
  }

  // Render vaccination coverage (clickable cards)
  function renderVaccineCoverage() {
    const container = document.getElementById('vaccCoverageList');
    if (!container) return;

    const children = getAllPurokRecords().filter(r => r.type === 'Child');
    const total = children.length;
    if (total === 0) {
      container.innerHTML = '<p class="coverage-empty">No child records available.</p>';
      return;
    }

    container.innerHTML = vaccineTypes.map(vax => {
      const pct = Math.round((vax.covered / vax.total) * 100);
      const pending = vax.total - vax.covered;
      const barColor = coverageBarClass(pct);
      return `
        <div class="coverage-card" data-cover="${vax.name}" title="View who received ${vax.name}">
          <div class="coverage-card-head">
            <span class="coverage-code">${vax.name}</span>
            <span class="coverage-pct text-${barColor}">${pct}%</span>
          </div>
          <div class="coverage-stats">
            <span><strong>${vax.covered}</strong>/<strong>${vax.total}</strong> covered</span>
            <span class="${pending > 0 ? 'text-red' : 'text-green'}">${pending} pending</span>
          </div>
          <div class="progress-bg"><div class="progress-bar ${barColor}" style="width: ${pct}%;"></div></div>
        </div>
      `;
    }).join('');
  }

  // Render maternal / prenatal coverage (clickable cards)
  function renderMaternalCoverage() {
    const container = document.getElementById('maternalCoverageList');
    if (!container) return;

    const mothers = getAllPurokRecords().filter(r => r.type === 'Mother');
    const total = mothers.length;
    if (total === 0) {
      container.innerHTML = '<p class="coverage-empty">No maternal records available.</p>';
      return;
    }

    const cards = [];
    for (let dose = 1; dose <= 5; dose++) {
      const reached = mothers.filter(m => ttDoseLevel(m) >= dose).length;
      const pct = Math.round((reached / total) * 100);
      const notYet = total - reached;
      const barColor = coverageBarClass(pct);
      cards.push(`
        <div class="coverage-card" data-cover="tt-${dose}" title="View who reached TT ${dose}">
          <div class="coverage-card-head">
            <span class="coverage-code">TT ${dose}</span>
            <span class="coverage-pct text-${barColor}">${pct}%</span>
          </div>
          <div class="coverage-stats">
            <span><strong>${reached}</strong>/<strong>${total}</strong> reached</span>
            <span class="${notYet > 0 ? 'text-red' : 'text-green'}">${notYet} not yet</span>
          </div>
          <div class="progress-bg"><div class="progress-bar ${barColor}" style="width: ${pct}%;"></div></div>
        </div>
      `);
    }

    const ironCount = mothers.filter(m => !!m.iron).length;
    const ironPct = Math.round((ironCount / total) * 100);
    const ironBar = coverageBarClass(ironPct);
    cards.push(`
      <div class="coverage-card" data-cover="iron" title="View mothers on iron supplementation">
        <div class="coverage-card-head">
          <span class="coverage-code">IRON</span>
          <span class="coverage-pct text-${ironBar}">${ironPct}%</span>
        </div>
        <div class="coverage-stats">
          <span><strong>${ironCount}</strong>/<strong>${total}</strong> on iron</span>
          <span class="${(total - ironCount) > 0 ? 'text-red' : 'text-green'}">${total - ironCount} not taking</span>
        </div>
        <div class="progress-bg"><div class="progress-bar ${ironBar}" style="width: ${ironPct}%;"></div></div>
      </div>
    `);

    const bpCount = mothers.filter(m => isHighBP(m.bp)).length;
    const bpPct = Math.round((bpCount / total) * 100);
    cards.push(`
      <div class="coverage-card" data-cover="bp" title="View mothers with elevated blood pressure">
        <div class="coverage-card-head">
          <span class="coverage-code">HIGH BP</span>
          <span class="coverage-pct text-${bpCount > 0 ? 'red' : 'green'}">${bpPct}%</span>
        </div>
        <div class="coverage-stats">
          <span><strong>${bpCount}</strong>/<strong>${total}</strong> elevated</span>
          <span class="${bpCount > 0 ? 'text-red' : 'text-green'}">${bpCount === 0 ? 'none' : 'monitor closely'}</span>
        </div>
        <div class="progress-bg"><div class="progress-bar red" style="width: ${bpPct}%;"></div></div>
      </div>
    `);

    container.innerHTML = cards.join('');
  }

  // Render coverage stat cards
  function renderCoverageStatCards() {
    const allRecords = getAllPurokRecords();
    const children = allRecords.filter(r => r.type === 'Child');
    const mothers = allRecords.filter(r => r.type === 'Mother');

    const totalVax = vaccineTypes.reduce((s, v) => s + v.total, 0);
    const coveredVax = vaccineTypes.reduce((s, v) => s + v.covered, 0);
    const avgVaccinePct = totalVax ? Math.round((coveredVax / totalVax) * 100) : 0;

    const fullyProtected = children.filter(c => Array.isArray(c.vaccines) && VACCINES.every(v => c.vaccines.includes(v))).length;
    const tt5Reached = mothers.filter(m => ttDoseLevel(m) >= 5).length;
    const tt5Pct = mothers.length ? Math.round((tt5Reached / mothers.length) * 100) : 0;
    const bpCount = mothers.filter(m => isHighBP(m.bp)).length;

    setElText('analyticsVaccineCoverage', `${avgVaccinePct}%`);
    setElText('analyticsFullyProtected', String(fullyProtected));
    setElText('analyticsTt5Coverage', `${tt5Pct}%`);
    setElText('analyticsHighBpMothers', String(bpCount));
  }

  // Render top vaccine gaps chart (lowest coverage first)
  function renderVaccineGapChart() {
    const ctx = document.getElementById('vaccineGapChart');
    if (!ctx) return;

    const sorted = vaccineTypes.slice().sort((a, b) => {
      const aPct = a.total ? a.covered / a.total : 0;
      const bPct = b.total ? b.covered / b.total : 0;
      return aPct - bPct;
    });

    const labels = sorted.map(v => v.name);
    const data = sorted.map(v => v.total ? Math.round((v.covered / v.total) * 100) : 0);

    if (vaccineGapChartInstance) vaccineGapChartInstance.destroy();

    vaccineGapChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Coverage %',
          data: data,
          backgroundColor: data.map(p => p >= 80 ? '#22c55e' : p >= 50 ? '#f59e0b' : '#ef4444'),
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, max: 100, grid: { display: false } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // Render per-purok coverage table
  function renderPerPurokCoverage() {
    const tbody = document.getElementById('perPurokCoverageBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const allRecords = getAllPurokRecords();

    Object.keys(purokData).forEach(key => {
      const recs = allRecords.filter(r => r.purokKey === key);
      const children = recs.filter(r => r.type === 'Child');
      const mothers = recs.filter(r => r.type === 'Mother');

      const fullyPct = children.length
        ? Math.round((children.filter(c => Array.isArray(c.vaccines) && VACCINES.every(v => c.vaccines.includes(v))).length / children.length) * 100)
        : 0;
      const tt5Pct = mothers.length
        ? Math.round((mothers.filter(m => ttDoseLevel(m) >= 5).length / mothers.length) * 100)
        : 0;
      const ironPct = mothers.length
        ? Math.round((mothers.filter(m => !!m.iron).length / mothers.length) * 100)
        : 0;
      const bpCount = mothers.filter(m => isHighBP(m.bp)).length;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${purokData[key].name}</strong></td>
        <td>${children.length}</td>
        <td>${mothers.length}</td>
        <td class="${rangeRateClass(fullyPct)}"><strong>${fullyPct}%</strong></td>
        <td class="${rangeRateClass(tt5Pct)}">${tt5Pct}%</td>
        <td class="${rangeRateClass(ironPct)}">${ironPct}%</td>
        <td><span class="status-pill status-${bpCount > 0 ? 'red' : 'green'}">${bpCount}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ========== COVERAGE DETAILS MODAL (who is covered vs not) ==========
  function buildCoverageNameList(items) {
    if (!items.length) return '<li class="coverage-list-empty">No one in this group</li>';
    return items.map(item =>
      `<li><i class="fa-solid fa-circle"></i><strong title="${item.name}">${item.name}</strong><span>Purok ${item.purok}</span></li>`
    ).join('');
  }

  function openCoverageList(title, covered, pending, coveredHeading, pendingHeading) {
    const modal = document.getElementById('coverageListModal');
    if (!modal) return;
    setElText('coverageListTitle', title);
    setElText('coverageListCoveredTitle', coveredHeading);
    setElText('coverageListPendingTitle', pendingHeading);
    const coveredEl = document.getElementById('coverageListCovered');
    const pendingEl = document.getElementById('coverageListPending');
    if (coveredEl) coveredEl.innerHTML = buildCoverageNameList(covered);
    if (pendingEl) pendingEl.innerHTML = buildCoverageNameList(pending);
    modal.style.display = 'flex';
  }

  function closeCoverageList() {
    const modal = document.getElementById('coverageListModal');
    if (modal) modal.style.display = 'none';
  }

  function handleCoverageCardClick(card) {
    const key = card.getAttribute('data-cover');
    if (!key) return;

    const allRecords = getAllPurokRecords();
    const children = allRecords.filter(r => r.type === 'Child');
    const mothers = allRecords.filter(r => r.type === 'Mother');

    if (VACCINES.indexOf(key) !== -1) {
      const covered = children.filter(c => Array.isArray(c.vaccines) && c.vaccines.includes(key));
      const pending = children.filter(c => !(Array.isArray(c.vaccines) && c.vaccines.includes(key)));
      openCoverageList(`${key} — Vaccination Coverage`, covered, pending,
        `Vaccinated (${covered.length})`, `Not yet vaccinated (${pending.length})`);
    } else if (key.indexOf('tt-') === 0) {
      const dose = parseInt(key.split('-')[1], 10) || 1;
      const covered = mothers.filter(m => ttDoseLevel(m) >= dose);
      const pending = mothers.filter(m => !(ttDoseLevel(m) >= dose));
      openCoverageList(`TT ${dose} — Immunization Coverage`, covered, pending,
        `Reached TT ${dose} (${covered.length})`, `Not yet reached (${pending.length})`);
    } else if (key === 'iron') {
      const covered = mothers.filter(m => !!m.iron);
      const pending = mothers.filter(m => !m.iron);
      openCoverageList('IRON — Iron Supplementation', covered, pending,
        `Taking iron (${covered.length})`, `Not taking (${pending.length})`);
    } else if (key === 'bp') {
      const covered = mothers.filter(m => isHighBP(m.bp));
      const pending = mothers.filter(m => !isHighBP(m.bp));
      openCoverageList('HIGH BP — Blood Pressure Monitoring', covered, pending,
        `Elevated BP (${covered.length})`, `Normal BP (${pending.length})`);
    }
  }

  // ========== CSV EXPORTS ==========
  function downloadCsv(filename, rows) {
    const csv = rows.map(row => row.map(value => {
      const s = String(value == null ? '' : value);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',')).join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportVaccineCsv() {
    const children = getAllPurokRecords().filter(r => r.type === 'Child');
    const rows = [['Name', 'Purok', 'Address', 'Vaccines Received', 'Missing Vaccines']];
    children.forEach(c => {
      const had = Array.isArray(c.vaccines) ? c.vaccines : [];
      const missing = VACCINES.filter(v => !had.includes(v)).join(', ') || 'None';
      rows.push([c.name, c.purok, c.address, had.join(', ') || 'None', missing]);
    });
    downloadCsv('vaccination-coverage-report.csv', rows);
  }

  function exportMaternalCsv() {
    const mothers = getAllPurokRecords().filter(r => r.type === 'Mother');
    const rows = [['Name', 'Purok', 'Address', 'TT Dose', 'Iron Supplement', 'Blood Pressure']];
    mothers.forEach(m => {
      rows.push([m.name, m.purok, m.address, m.ttDose || 'None', m.iron ? 'Yes' : 'No', m.bp || 'N/A']);
    });
    downloadCsv('maternal-prenatal-coverage-report.csv', rows);
  }

  // Coverage card delegation (vaccine + maternal)
  ['vaccCoverageList', 'maternalCoverageList'].forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.addEventListener('click', function(e) {
        const card = e.target.closest ? e.target.closest('.coverage-card') : null;
        if (card) handleCoverageCardClick(card);
      });
    }
  });

  // Modal + export bindings
  const closeCoverageBtn = document.getElementById('closeCoverageListBtn');
  if (closeCoverageBtn) closeCoverageBtn.addEventListener('click', closeCoverageList);
  const coverageModal = document.getElementById('coverageListModal');
  if (coverageModal) {
    coverageModal.addEventListener('click', function(e) {
      if (e.target === coverageModal) closeCoverageList();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeCoverageList();
  });
  const btnExportVaccine = document.getElementById('btnExportVaccineCsv');
  if (btnExportVaccine) btnExportVaccine.addEventListener('click', exportVaccineCsv);
  const btnExportMaternal = document.getElementById('btnExportMaternalCsv');
  if (btnExportMaternal) btnExportMaternal.addEventListener('click', exportMaternalCsv);

  // ============================================================
  // PRESCRIPTIVE ANALYTICS
  // ============================================================

  // Compute prescriptive analytics
  function computePrescriptiveAnalytics(data) {
    // Purok priority ranking (by overdue count descending)
    const purokStats = {};
    data.allRecords.forEach(rec => {
      if (!purokStats[rec.purok]) {
        purokStats[rec.purok] = { name: rec.purok, total: 0, overdue: 0, due: 0, completed: 0, bhws: '' };
      }
      purokStats[rec.purok].total++;
      if (rec.status === 'Overdue') purokStats[rec.purok].overdue++;
      else if (rec.status === 'Due This Month') purokStats[rec.purok].due++;
      else purokStats[rec.purok].completed++;
    });

    // Get BHW assignments from live credentials (fallback to purokData strings)
    Object.keys(purokData).forEach(key => {
      const purok = purokData[key];
      if (purokStats[purok.name]) {
        purokStats[purok.name].bhws = (typeof getPurokBhwNames === 'function' && getPurokBhwNames(key)) || purok.bhws;
      }
    });

    const ranked = Object.values(purokStats).sort((a, b) => b.overdue - a.overdue);

    // Generate recommendations
    const recommendations = [];
    const highOverdue = ranked.filter(p => p.overdue > 0);
    const lowCompleted = ranked.filter(p => p.completed === 0 && p.total > 0);
    const dueRecords = data.filtered.filter(r => r.status === 'Due This Month');

    if (highOverdue.length > 0) {
      const names = highOverdue.map(p => p.name).join(', ');
      recommendations.push({
        type: 'urgent',
        icon: 'fa-triangle-exclamation',
        text: `${highOverdue.length} purok(s) have overdue visits: ${names}. Increase BHW visit frequency in these areas.`
      });
    }

    if (lowCompleted.length > 0) {
      const names = lowCompleted.map(p => p.name).join(', ');
      recommendations.push({
        type: 'warning',
        icon: 'fa-circle-exclamation',
        text: `${names} have zero completed visits. Conduct community health outreach to improve coverage.`
      });
    }

    if (dueRecords.length > 0) {
      recommendations.push({
        type: 'info',
        icon: 'fa-calendar-check',
        text: `${dueRecords.length} record(s) are due this month. Schedule follow-up visits to prevent them from becoming overdue.`
      });
    }

    // Coverage-based recommendations
    const allChildren = data.allRecords.filter(r => r.type === 'Child');
    const allMothers = data.allRecords.filter(r => r.type === 'Mother');

    if (allChildren.length > 0) {
      const lowVax = vaccineTypes.filter(v => v.total > 0 && (v.covered / v.total) < 0.7);
      if (lowVax.length > 0) {
        const names = lowVax.map(v => `${v.name} (${Math.round((v.covered / v.total) * 100)}%)`).join(', ');
        recommendations.push({
          type: lowVax.length >= 2 ? 'urgent' : 'warning',
          icon: 'fa-syringe',
          text: `Low vaccination coverage in ${names}. Organize an immunization catch-up drive for children still missing these vaccines.`
        });
      }

      const fullyProtected = allChildren.filter(c => Array.isArray(c.vaccines) && VACCINES.every(v => c.vaccines.includes(v))).length;
      const fullyPct = Math.round((fullyProtected / allChildren.length) * 100);
      if (fullyPct < 70) {
        recommendations.push({
          type: 'warning',
          icon: 'fa-shield-halved',
          text: `Only ${fullyPct}% of children are fully protected (all routine vaccines). Prioritize follow-up for the ${allChildren.length - fullyProtected} incomplete children.`
        });
      }
    }

    if (allMothers.length > 0) {
      const tt5Reached = allMothers.filter(m => ttDoseLevel(m) >= 5).length;
      const tt5Pct = Math.round((tt5Reached / allMothers.length) * 100);
      if (tt5Pct < 70) {
        recommendations.push({
          type: 'warning',
          icon: 'fa-person-pregnant',
          text: `Only ${tt5Pct}% of mothers have completed TT5. Schedule tetanus toxoid catch-up doses for the ${allMothers.length - tt5Reached} mothers below the protective level.`
        });
      }

      const elevatedBp = allMothers.filter(m => isHighBP(m.bp));
      if (elevatedBp.length > 0) {
        recommendations.push({
          type: elevatedBp.length >= 2 ? 'urgent' : 'warning',
          icon: 'fa-heart-pulse',
          text: `${elevatedBp.length} mother(s) have elevated blood pressure. Prioritize BP re-checks and referral for close monitoring.`
        });
      }
    }

    // Puroks with low full-immunization coverage feed into priority actions
    const purokCoverageStats = {};
    data.allRecords.forEach(rec => {
      if (!purokCoverageStats[rec.purok]) {
        purokCoverageStats[rec.purok] = { name: rec.purok, children: [], mothers: [], overdue: 0 };
      }
      if (rec.type === 'Child') purokCoverageStats[rec.purok].children.push(rec);
      else if (rec.type === 'Mother') purokCoverageStats[rec.purok].mothers.push(rec);
      if (rec.status === 'Overdue') purokCoverageStats[rec.purok].overdue++;
    });
    const purokEntries = Object.values(purokCoverageStats);
    const lowCoveragePuroks = purokEntries.filter(p => p.children.length > 0 &&
      p.children.filter(c => Array.isArray(c.vaccines) && VACCINES.every(v => c.vaccines.includes(v))).length / p.children.length < 0.5);
    if (lowCoveragePuroks.length > 0 && lowCoveragePuroks.length < purokEntries.length) {
      const names = lowCoveragePuroks.map(p => p.name).join(', ');
      recommendations.push({
        type: 'warning',
        icon: 'fa-location-dot',
        text: `Puroks ${names} have below 50% full immunization. These areas need focused outreach and additional BHW visits.`
      });
    }

    // BHW workload recommendations (derived from live purok assignments)
    const bhwWorkload = {};
    (typeof BHW_CREDENTIALS !== 'undefined' ? BHW_CREDENTIALS : []).forEach(user => {
      if (user.status !== 'active' || !Array.isArray(user.assignedPuroks) || user.assignedPuroks.length === 0) return;

      const name = user.middleInitial
        ? `${user.firstName} ${user.middleInitial}. ${user.lastName}`
        : `${user.firstName} ${user.lastName}`;

      const workload = { puroks: new Set(), total: 0, overdue: 0, due: 0 };
      user.assignedPuroks.forEach(key => {
        const purokName = purokData[key] ? purokData[key].name : key;
        data.allRecords.filter(r => r.purokKey === key).forEach(rec => {
          workload.puroks.add(purokName);
          workload.total++;
          if (rec.status === 'Overdue') workload.overdue++;
          else if (rec.status === 'Due This Month') workload.due++;
        });
      });

      bhwWorkload[name] = workload;
    });

    const overloaded = Object.entries(bhwWorkload).filter(([, w]) => w.overdue >= 2);
    if (overloaded.length > 0) {
      const names = overloaded.map(([name]) => name).join(', ');
      recommendations.push({
        type: 'urgent',
        icon: 'fa-user-clock',
        text: `BHW(s) ${names} have 2+ overdue records. Consider redistributing workload or providing additional support.`
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        icon: 'fa-circle-check',
        text: 'All records are on track. No immediate action required.'
      });
    }

    return { ranked, recommendations, bhwWorkload };
  }

  // Render priority ranking
  function renderPriorityRanking(ranked) {
    const container = document.getElementById('priorityRanking');
    if (!container) return;

    container.innerHTML = '';
    ranked.forEach((purok, idx) => {
      const priorityLevel = purok.overdue >= 2 ? 'High' : purok.overdue >= 1 ? 'Medium' : 'Low';
      const priorityColor = purok.overdue >= 2 ? 'red' : purok.overdue >= 1 ? 'yellow' : 'green';

      container.innerHTML += `
        <div class="priority-item">
          <div class="priority-rank">${idx + 1}</div>
          <div class="priority-info">
            <strong>Purok ${purok.name}</strong>
            <span>${purok.total} records — ${purok.overdue} overdue, ${purok.due} due, ${purok.completed} completed</span>
          </div>
          <span class="status-pill status-${priorityColor}">${priorityLevel} Priority</span>
        </div>
      `;
    });
  }

  // Render recommendations
  function renderRecommendations(recommendations) {
    const container = document.getElementById('recommendationsPanel');
    if (!container) return;

    container.innerHTML = '';
    recommendations.forEach(rec => {
      let bgColor = 'rgba(6, 182, 212, 0.08)';
      let borderColor = 'rgba(6, 182, 212, 0.3)';
      let iconColor = '#06b6d4';

      if (rec.type === 'urgent') {
        bgColor = 'rgba(239, 68, 68, 0.08)';
        borderColor = 'rgba(239, 68, 68, 0.3)';
        iconColor = '#ef4444';
      } else if (rec.type === 'warning') {
        bgColor = 'rgba(245, 158, 11, 0.08)';
        borderColor = 'rgba(245, 158, 11, 0.3)';
        iconColor = '#f59e0b';
      } else if (rec.type === 'success') {
        bgColor = 'rgba(34, 197, 94, 0.08)';
        borderColor = 'rgba(34, 197, 94, 0.3)';
        iconColor = '#22c55e';
      }

      container.innerHTML += `
        <div class="recommendation-item" style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <i class="fa-solid ${rec.icon}" style="color: ${iconColor}; font-size: 18px; margin-top: 2px;"></i>
            <p style="font-size: 14px; line-height: 1.5; margin: 0;">${rec.text}</p>
          </div>
        </div>
      `;
    });
  }

  // Render BHW workload table
  function renderBhwWorkload(bhwWorkload) {
    const tbody = document.getElementById('bhwWorkloadTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    const entries = Object.entries(bhwWorkload).sort((a, b) => b[1].overdue - a[1].overdue);

    entries.forEach(([name, w]) => {
      const puroks = Array.from(w.puroks).join(', ');
      let workloadStatus = 'Normal';
      let statusClass = 'green';
      if (w.overdue >= 2) {
        workloadStatus = 'Overloaded';
        statusClass = 'red';
      } else if (w.overdue >= 1 || w.due >= 3) {
        workloadStatus = 'Busy';
        statusClass = 'yellow';
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${name}</strong></td>
        <td>${puroks}</td>
        <td>${w.total}</td>
        <td><span class="status-pill status-${w.overdue > 0 ? 'red' : 'green'}">${w.overdue}</span></td>
        <td><span class="status-pill status-${w.due > 0 ? 'yellow' : 'green'}">${w.due}</span></td>
        <td><span class="status-pill status-${statusClass}">${workloadStatus}</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  // Master render function for analytics
  function renderAnalytics() {
    const data = computeDescriptiveAnalytics();
    renderBarChart(data);
    renderDonutChart(data);
    renderCoverageStatCards();
    renderVaccineCoverage();
    renderMaternalCoverage();
    renderVaccineGapChart();
    renderPerPurokCoverage();

    const prescriptive = computePrescriptiveAnalytics(data);
    renderPriorityRanking(prescriptive.ranked);
    renderRecommendations(prescriptive.recommendations);
    renderBhwWorkload(prescriptive.bhwWorkload);
  }

  // Date range filter buttons
  const dateFilterBtns = document.querySelectorAll('.analytics-date-filter .btn-quick-date');
  dateFilterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      dateFilterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentAnalyticsRange = this.getAttribute('data-range');
      renderAnalytics();
    });
  });

  // ============================================================
  // INITIALIZE
  // ============================================================

  updateAdminProfile();
  updateStats();
  renderAssignedPurokCheckboxes();
  renderUsers();
  renderLoginHistory();
  // Default the masterlist to the combined All-Puroks view
  purokTabs.forEach(t => t.classList.remove('active'));
  if (purokMasterFilter) purokMasterFilter.value = 'all';
  renderPurok('all');
  renderAnalytics();
  updateClock();
  setInterval(updateClock, 1000);
});
