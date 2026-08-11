document.addEventListener('DOMContentLoaded', () => {
  const registerModal = document.getElementById('registerModal');
  const btnOpenRegister = document.getElementById('btnOpenRegister');
  const btnCancelRegister = document.getElementById('btnCancelRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

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
  };

  if (btnCancelRegister) btnCancelRegister.addEventListener('click', closeRegisterModal);

  // Isara rin kapag nag-click sa labas ng modal box
  window.addEventListener('click', (e) => {
    if (e.target === registerModal) {
      closeRegisterModal();
    }
  });

  // Login Submit Handler (Diretso papuntang dashboard.html)
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = 'dashboard.html';
    });
  }

  // Register Submit Handler
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Registration submitted! Account created and pending for head review.');
      closeRegisterModal();
      registerForm.reset();
    });
  }
});