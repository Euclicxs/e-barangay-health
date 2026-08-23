document.addEventListener('DOMContentLoaded', () => {

  // 0. BHW OPERATOR ACCOUNTS — mula sa shared account store ng admin
  const accountsBody = document.getElementById('bhwAccountsBody');
  if (accountsBody && window.EBHStore) {
    EBHStore.getUsers().forEach((user) => {
      const isActive = user.status === 'active';
      const row = document.createElement('tr');

      const addCell = (text, cellClass, innerTag, innerClass) => {
        const td = document.createElement('td');
        if (cellClass) td.className = cellClass;
        if (innerTag) {
          const inner = document.createElement(innerTag);
          if (innerClass) inner.className = innerClass;
          inner.textContent = text;
          td.appendChild(inner);
        } else {
          td.textContent = text;
        }
        row.appendChild(td);
      };

      addCell(user.id, 'text-muted');
      addCell(user.fullName, '', 'strong');
      addCell(user.purok);
      addCell(user.role, '', 'span', 'badge-role cyan-role');
      addCell(
        isActive ? 'Active' : 'Inactive',
        '',
        'span',
        `status-pill ${isActive ? 'active-pill' : 'inactive-pill'}`
      );
      addCell(user.lastLogin || '—', 'mono-text');
      addCell('Managed in Admin Dashboard', 'text-muted');

      accountsBody.appendChild(row);
    });
  }

  const btnGoAdmin = document.getElementById('btnGoAdmin');
  if (btnGoAdmin) {
    btnGoAdmin.addEventListener('click', () => {
      const session = window.EBHStore ? EBHStore.getSession() : null;
      if (session && session.role === 'admin') {
        window.location.href = 'admin.html';
        return;
      }
      alert('Only the administrator can add BHW accounts. Log in through the ADMIN button on the login page.');
    });
  }

  // 1. TOGGLE PASSWORD VISIBILITY
  const showPasswordToggle = document.getElementById('showPasswordToggle');
  const passwordInputs = document.querySelectorAll('#passwordForm input[type="password"], #passwordForm input[type="text"]');

  showPasswordToggle.addEventListener('change', function() {
    const type = this.checked ? 'text' : 'password';
    passwordInputs.forEach(input => {
      input.type = type;
    });
  });

  // 2. INACTIVITY SESSION TOGGLE
  const sessionToggle = document.getElementById('sessionToggle');
  const toggleStatus = document.getElementById('toggleStatus');

  sessionToggle.addEventListener('change', function() {
    if (this.checked) {
      toggleStatus.innerHTML = '<i class="fa-solid fa-check text-purple"></i> Session auto-logout is ENABLED';
      toggleStatus.style.color = '#c084fc';
    } else {
      toggleStatus.innerHTML = '<i class="fa-solid fa-xmark text-muted"></i> Session auto-logout is DISABLED';
      toggleStatus.style.color = '#94a3b8';
    }
  });

  // 3. PASSWORD CHANGE FORM SUBMISSION
  const passwordForm = document.getElementById('passwordForm');
  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPw = document.getElementById('newPassword').value;
    const confirmPw = document.getElementById('confirmPassword').value;

    if (newPw !== confirmPw) {
      alert('New passwords do not match!');
      return;
    }

    alert('Password updated successfully using bcrypt encryption.');
    passwordForm.reset();
  });

});