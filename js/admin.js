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
    const searchTerm = searchUsers.value.toLowerCase();
    const statusFilter = filterStatus.value;

    let filteredUsers = bhwUsers.filter(user => {
      const fullName = user.middleInitial 
        ? `${user.firstName} ${user.middleInitial} ${user.lastName}`.toLowerCase()
        : `${user.firstName} ${user.lastName}`.toLowerCase();
      
      const matchesSearch = fullName.includes(searchTerm) || 
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

  searchUsers.addEventListener('input', filterUsers);
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

  function renderPurok(purokKey) {
    const data = purokData[purokKey];
    const statHouseholds = document.getElementById('stat-households');
    if (!data || !statHouseholds) return;

    // Compute statuses from dates for each record
    data.records.forEach(rec => {
      rec.status = computeStatus(rec.nextVisitDate, rec.lastVisitDate);
    });

    const childRecords = data.records.filter(r => r.type === 'Child');
    const motherRecords = data.records.filter(r => r.type === 'Mother');
    const totalPopulation = data.records.length;
    const overdueCount = data.records.filter(r => r.status === 'Overdue').length;
    const dueThisMonthCount = data.records.filter(r => r.status === 'Due This Month').length;

    // Update stats
    document.getElementById('stat-households').innerText = data.households;
    document.getElementById('stat-households-sub').innerText = `Registered in ${data.name}`;

    document.getElementById('stat-population').innerText = totalPopulation;
    document.getElementById('stat-population-sub').innerText = `${childRecords.length} children · ${motherRecords.length} mothers`;

    document.getElementById('stat-due').innerText = overdueCount + dueThisMonthCount;
    document.getElementById('stat-due-sub').innerText = `${overdueCount} overdue · ${dueThisMonthCount} due this month`;

    // Derive BHW assignments from live credentials when available
    const assignedBhwNames = typeof getPurokBhwNames === 'function' ? getPurokBhwNames(purokKey) : null;
    const assignedBhwCount = typeof getUsersByPurokKey === 'function' ? getUsersByPurokKey(purokKey).length : 0;
    const bhwNames = assignedBhwNames || data.bhws;
    const bhwCountDisplay = assignedBhwCount || data.bhwCount;

    document.getElementById('stat-bhws').innerText = String(bhwCountDisplay);
    document.getElementById('stat-bhws-sub').innerText = bhwNames;

    // Update table title & count
    document.getElementById('table-title').innerText = `Purok ${data.name} — Health Records`;
    document.getElementById('entries-count').innerText = `${totalPopulation} entries (${childRecords.length} children, ${motherRecords.length} mothers)`;

    // Render table rows
    const tbody = document.getElementById('purok-table-body');
    tbody.innerHTML = '';

    data.records.forEach(rec => {
      const typeTag = rec.type === 'Child'
        ? `<span class="type-pill type-child"><i class="fa-solid fa-child"></i> Child</span>`
        : `<span class="type-pill type-mother"><i class="fa-solid fa-person-pregnant"></i> Mother</span>`;

      let statusPill = '';
      if (rec.status === 'Overdue') {
        const days = getOverdueDays(rec.nextVisitDate);
        statusPill = `<span class="status-pill status-red">• Overdue (${days}d)</span>`;
      } else if (rec.status === 'Due This Month') {
        statusPill = `<span class="status-pill status-yellow">• Due This Month</span>`;
      } else {
        statusPill = `<span class="status-pill status-green">• Completed</span>`;
      }

      const nextDate = rec.nextVisitDate ? new Date(rec.nextVisitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="person-name">${rec.name}</td>
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
  }

  // Purok filter tabs
  purokTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      purokTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      renderPurok(this.getAttribute('data-purok'));
    });
  });

  // Print field visit sheet
  const btnPrintPurok = document.getElementById('btnPrintPurok');
  if (btnPrintPurok) {
    btnPrintPurok.addEventListener('click', () => {
      window.print();
    });
  }

  // ============================================================
  // DATA ANALYTICS MODULE
  // ============================================================

  let purokBarChartInstance = null;
  let statusDonutChartInstance = null;
  let currentAnalyticsRange = 'month';

  // Vaccine type coverage data (derived from records)
  const vaccineTypes = [
    { name: 'BCG', total: 10, covered: 9 },
    { name: 'OPV', total: 10, covered: 7 },
    { name: 'IPV', total: 10, covered: 5 },
    { name: 'PENTA', total: 10, covered: 4 },
    { name: 'PCV', total: 10, covered: 5 },
    { name: 'MCV1', total: 10, covered: 3 },
    { name: 'MCV2', total: 10, covered: 3 }
  ];

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

  // Render vaccination coverage
  function renderVaccineCoverage() {
    const container = document.getElementById('vaccCoverageList');
    if (!container) return;

    container.innerHTML = '';
    vaccineTypes.forEach(vax => {
      const pct = Math.round((vax.covered / vax.total) * 100);
      let barColor = 'cyan';
      if (pct >= 80) barColor = 'green';
      else if (pct >= 50) barColor = 'yellow';
      else if (pct >= 30) barColor = 'orange';
      else barColor = 'red';

      container.innerHTML += `
        <div class="coverage-item">
          <div class="item-info">
            <span>${vax.name}</span>
            <span class="text-${barColor}">${pct}%</span>
          </div>
          <div class="progress-bg"><div class="progress-bar ${barColor}" style="width: ${pct}%;"></div></div>
        </div>
      `;
    });
  }

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
    renderVaccineCoverage();

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
  renderPurok('calachuchi');
  renderAnalytics();
  updateClock();
  setInterval(updateClock, 1000);
});
