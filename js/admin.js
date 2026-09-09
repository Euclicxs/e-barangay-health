document.addEventListener('DOMContentLoaded', () => {
  // Validate session - must be admin user
  if (!validateSession('admin')) {
    return; // Will redirect to appropriate page
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

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      
      // Update active states
      navLinks.forEach(l => l.parentElement.classList.remove('active'));
      link.parentElement.classList.add('active');
      
      // Show corresponding section
      contentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${sectionId}-section`) {
          section.classList.add('active');
        }
      });
    });
  });

  // Update stats
  function updateStats() {
    const totalUsers = bhwUsers.length;
    const activeUsers = bhwUsers.filter(user => user.status === 'active').length;
    const inactiveUsers = bhwUsers.filter(user => user.status === 'inactive').length;
    
    // Calculate recent logins (last 24 hours)
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
                           user.contact.includes(searchTerm);
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
    
    // Hide credentials section for new users
    const credentialsSection = document.getElementById('credentialsSection');
    if (credentialsSection) {
      credentialsSection.style.display = 'none';
    }
    
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

    // Show credentials for existing users
    const credentialsSection = document.getElementById('credentialsSection');
    if (credentialsSection) {
      credentialsSection.style.display = 'block';
      document.getElementById('displayBhwId').textContent = user.id;
      document.getElementById('displayPassword').textContent = user.password;
    }

    userModal.style.display = 'flex';
  };

  // Toggle user status
  window.toggleUserStatus = function(userId) {
    const user = bhwUsers.find(u => u.id === userId);
    if (!user) return;

    user.status = user.status === 'active' ? 'inactive' : 'active';
    
    // Add to login history
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

    if (editUserId) {
      // Update existing user
      const userIndex = bhwUsers.findIndex(u => u.id === editUserId);
      if (userIndex !== -1) {
        bhwUsers[userIndex] = {
          ...bhwUsers[userIndex],
          firstName,
          lastName,
          middleInitial,
          contact,
          dob
        };
      }
    } else {
      // Add new user with auto-generated password
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
        lastLogin: null,
        createdAt: new Date().toISOString()
      };
      
      bhwUsers.push(newUser);
      
      // Show the auto-generated credentials to the admin
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

  // Close modals when clicking outside
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

  // Initialize
  updateAdminProfile();
  updateStats();
  renderUsers();
  renderLoginHistory();
  updateClock();
  setInterval(updateClock, 1000);
});