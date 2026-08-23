document.addEventListener('DOMContentLoaded', () => {
  const registerModal = document.getElementById('registerModal');
  const adminModal = document.getElementById('adminModal');
  const btnOpenRegister = document.getElementById('btnOpenRegister');
  const btnCancelRegister = document.getElementById('btnCancelRegister');
  const btnOpenAdmin = document.getElementById('btnOpenAdmin');
  const btnCancelAdmin = document.getElementById('btnCancelAdmin');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const adminForm = document.getElementById('adminForm');

  const showMessage = (id, text, isError) => {
    const box = document.getElementById(id);
    if (!box) return;
    box.textContent = text || '';
    box.classList.toggle('is-error', !!isError);
    box.classList.toggle('is-success', !!text && !isError);
  };

  // Ipakita ang isa at nag-iisang admin credential ng sistema
  const adminHintUser = document.getElementById('adminHintUser');
  const adminHintPass = document.getElementById('adminHintPass');
  if (adminHintUser) adminHintUser.textContent = EBHStore.ADMIN_CREDENTIAL.username;
  if (adminHintPass) adminHintPass.textContent = EBHStore.ADMIN_CREDENTIAL.password;

  // Buksan ang Registration Modal
  if (btnOpenRegister && registerModal) {
    btnOpenRegister.addEventListener('click', (e) => {
      e.preventDefault();
      registerModal.style.display = 'flex';
    });
  }

  // Isara ang Registration Modal
  const closeRegisterModal = () => {
    if (registerModal) registerModal.style.display = 'none';
    showMessage('registerMessage', '');
  };

  if (btnCancelRegister) btnCancelRegister.addEventListener('click', closeRegisterModal);

  // Buksan / isara ang Admin Log In Modal
  const closeAdminModal = () => {
    if (adminModal) adminModal.style.display = 'none';
    showMessage('adminMessage', '');
  };

  if (btnOpenAdmin && adminModal) {
    btnOpenAdmin.addEventListener('click', () => {
      adminModal.style.display = 'flex';
      document.getElementById('adminUsername').focus();
    });
  }

  if (btnCancelAdmin) btnCancelAdmin.addEventListener('click', closeAdminModal);

  // Isara rin kapag nag-click sa labas ng modal box
  window.addEventListener('click', (e) => {
    if (e.target === registerModal) closeRegisterModal();
    if (e.target === adminModal) closeAdminModal();
  });

  // BHW Login Handler — deactivated accounts ay hindi makaka-access
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = EBHStore.loginBhw(
        document.getElementById('bhwUsername').value,
        document.getElementById('bhwPassword').value
      );

      if (!result.ok) {
        showMessage('loginMessage', result.message, true);
        return;
      }
      window.location.href = 'dashboard.html';
    });
  }

  // Admin Login Handler
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = EBHStore.loginAdmin(
        document.getElementById('adminUsername').value,
        document.getElementById('adminPassword').value
      );

      if (!result.ok) {
        showMessage('adminMessage', result.message, true);
        return;
      }
      window.location.href = 'admin.html';
    });
  }

  // Register Submit Handler — bagong account ay naka-pending hangga't hindi inaaktibo ng admin
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;

      if (password !== confirmPassword) {
        showMessage('registerMessage', 'Passwords do not match.', true);
        return;
      }

      const result = EBHStore.addUser({
        fullName: document.getElementById('regFullName').value,
        username: document.getElementById('regUsername').value,
        password: password,
        purok: document.getElementById('regPurok').value,
        contact: document.getElementById('regContact').value,
        status: 'inactive'
      });

      if (!result.ok) {
        showMessage('registerMessage', result.message, true);
        return;
      }

      alert(
        `Account ${result.user.id} created for ${result.user.fullName}. ` +
          'It is deactivated until the administrator activates it.'
      );
      closeRegisterModal();
      registerForm.reset();
    });
  }
});
