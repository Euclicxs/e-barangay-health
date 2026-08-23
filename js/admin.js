document.addEventListener('DOMContentLoaded', () => {
  // ADMIN-ONLY PAGE GUARD
  const session = EBHStore.getSession();
  if (!session || session.role !== 'admin') {
    window.location.replace('login.html');
    return;
  }

  const adminName = document.getElementById('adminName');
  if (adminName) adminName.textContent = session.name || 'Administrator';

  const tableBody = document.getElementById('userTableBody');
  const logBody = document.getElementById('logTableBody');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchUser');
  const addUserModal = document.getElementById('addUserModal');
  const addUserForm = document.getElementById('addUserForm');
  const purokSelect = document.getElementById('newPurok');

  EBHStore.PUROKS.forEach((purok) => {
    const option = document.createElement('option');
    option.value = purok;
    option.textContent = `Purok ${purok}`;
    purokSelect.appendChild(option);
  });

  const escapeHtml = (value) =>
    String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, (char) => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return map[char];
    });

  const showMessage = (text, isError) => {
    const box = document.getElementById('addUserMessage');
    box.textContent = text || '';
    box.classList.toggle('is-error', !!isError);
  };

  function renderStats(users) {
    const active = users.filter((user) => user.status === 'active');
    document.getElementById('statTotal').textContent = users.length;
    document.getElementById('statActive').textContent = active.length;
    document.getElementById('statInactive').textContent = users.length - active.length;
    document.getElementById('statPuroks').textContent = new Set(
      active.map((user) => user.purok)
    ).size;
  }

  function renderLogs() {
    logBody.innerHTML = '';
    EBHStore.getLogs()
      .slice(0, 10)
      .forEach((log) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="mono-text cyan-text">${escapeHtml(log.time)}</td>
          <td><strong>${escapeHtml(log.actor)}</strong></td>
          <td>${escapeHtml(log.action)}</td>
        `;
        logBody.appendChild(row);
      });
  }

  function renderUsers() {
    const users = EBHStore.getUsers();
    const keyword = (searchInput.value || '').trim().toLowerCase();
    const visible = users.filter((user) =>
      [user.id, user.fullName, user.username, user.purok]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );

    tableBody.innerHTML = '';
    visible.forEach((user) => {
      const isActive = user.status === 'active';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="text-muted">${escapeHtml(user.id)}</td>
        <td><strong>${escapeHtml(user.fullName)}</strong></td>
        <td class="mono-text">${escapeHtml(user.username)}</td>
        <td>${escapeHtml(user.purok)}</td>
        <td><span class="badge-role cyan-role">${escapeHtml(user.role)}</span></td>
        <td><span class="status-pill ${isActive ? 'active-pill' : 'inactive-pill'}">${isActive ? 'Active' : 'Inactive'}</span></td>
        <td class="mono-text">${escapeHtml(user.lastLogin || '—')}</td>
        <td class="action-cell">
          <button class="btn-action-outline ${isActive ? 'deactivate-btn' : 'activate-btn'}"
                  data-action="toggle" data-id="${escapeHtml(user.id)}">
            ${isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button class="btn-action-outline reset-btn" data-action="reset" data-id="${escapeHtml(user.id)}">Reset PW</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    emptyState.hidden = visible.length > 0;
    renderStats(users);
    renderLogs();
  }

  // ACTIVATE / DEACTIVATE & RESET PASSWORD
  tableBody.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const users = EBHStore.getUsers();
    const user = users.find((item) => item.id === button.dataset.id);
    if (!user) return;

    if (button.dataset.action === 'toggle') {
      const nextStatus = user.status === 'active' ? 'inactive' : 'active';
      const verb = nextStatus === 'active' ? 'activate' : 'deactivate';
      if (!confirm(`Are you sure you want to ${verb} the system access of ${user.fullName}?`)) return;

      const result = EBHStore.setStatus(user.id, nextStatus, session.name);
      if (!result.ok) alert(result.message);
      renderUsers();
      return;
    }

    if (button.dataset.action === 'reset') {
      const newPassword = prompt(`Enter a new temporary password for ${user.fullName} (min. 8 characters):`);
      if (newPassword === null) return;

      const result = EBHStore.resetPassword(user.id, newPassword, session.name);
      if (!result.ok) alert(result.message);
      else alert(`Password for ${user.fullName} has been reset.`);
      renderUsers();
    }
  });

  // ADD BHW USER MODAL
  const closeAddUserModal = () => {
    addUserModal.style.display = 'none';
    addUserForm.reset();
    showMessage('');
  };

  document.getElementById('btnOpenAddUser').addEventListener('click', () => {
    addUserModal.style.display = 'flex';
    document.getElementById('newFullName').focus();
  });
  document.getElementById('btnCloseAddUser').addEventListener('click', closeAddUserModal);
  document.getElementById('btnCancelAddUser').addEventListener('click', closeAddUserModal);
  addUserModal.addEventListener('click', (e) => {
    if (e.target === addUserModal) closeAddUserModal();
  });

  addUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('newPassword').value;

    if (password !== document.getElementById('newConfirmPassword').value) {
      showMessage('Passwords do not match.', true);
      return;
    }

    const result = EBHStore.addUser({
      fullName: document.getElementById('newFullName').value,
      username: document.getElementById('newUsername').value,
      password: password,
      purok: document.getElementById('newPurok').value,
      contact: document.getElementById('newContact').value,
      actor: session.name
    });

    if (!result.ok) {
      showMessage(result.message, true);
      return;
    }

    closeAddUserModal();
    renderUsers();
    alert(`BHW account ${result.user.id} created for ${result.user.fullName}. The account is active.`);
  });

  searchInput.addEventListener('input', renderUsers);

  document.getElementById('btnLogout').addEventListener('click', () => {
    EBHStore.clearSession();
    window.location.href = 'login.html';
  });

  // REAL-TIME CLOCK
  function updateClock() {
    const now = new Date();
    document.getElementById('clock-time').textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  setInterval(updateClock, 1000);
  updateClock();

  renderUsers();
});
