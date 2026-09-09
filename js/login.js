document.addEventListener('DOMContentLoaded', () => {
  const adminModal = document.getElementById('adminModal');
  const btnOpenAdmin = document.getElementById('btnOpenAdmin');
  const btnCancelAdmin = document.getElementById('btnCancelAdmin');
  const loginForm = document.getElementById('loginForm');
  const adminLoginForm = document.getElementById('adminLoginForm');

  // Open Admin Modal
  if (btnOpenAdmin && adminModal) {
    btnOpenAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      adminModal.style.display = 'flex';
    });
  }

  // Close Admin Modal
  const closeAdminModal = () => {
    if (adminModal) adminModal.style.display = 'none';
  };

  if (btnCancelAdmin) btnCancelAdmin.addEventListener('click', closeAdminModal);

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === adminModal) {
      closeAdminModal();
    }
  });

  // BHW Login Submit Handler (Validate against credential storage)
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const usernameInput = loginForm.querySelector('input[type="text"]');
      const passwordInput = loginForm.querySelector('input[type="password"]');
      
      const username = usernameInput.value;
      const password = passwordInput.value;
      
      // Validate BHW credentials using the credential storage
      const user = validateBHWLogin(username, password);
      
      if (user) {
        // Successful BHW login
        // Update last login time
        user.lastLogin = new Date().toISOString();
        
        // Create session
        createSession({
          userType: 'bhw',
          userId: user.id,
          userName: `${user.firstName} ${user.middleInitial ? user.middleInitial + '. ' : ''}${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          middleInitial: user.middleInitial,
          contact: user.contact
        });
        
        window.location.href = 'dashboard.html';
      } else {
        // Failed login
        alert('Invalid credentials or account is inactive. Please try again.');
        loginForm.reset();
      }
    });
  }

  // Admin Login Submit Handler
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const adminUsername = document.getElementById('adminUsername').value;
      const adminPassword = document.getElementById('adminPassword').value;

      // Validate admin credentials
      if (adminUsername === ADMIN_CREDENTIALS.username && 
          adminPassword === ADMIN_CREDENTIALS.password) {
        // Successful admin login
        closeAdminModal();
        adminLoginForm.reset();
        
        // Create admin session
        createSession({
          userType: 'admin',
          userId: 'ADMIN',
          userName: 'System Administrator',
          adminUsername: adminUsername
        });
        
        window.location.href = 'admin.html';
      } else {
        // Failed admin login
        alert('Invalid admin credentials. Please try again.');
        adminLoginForm.reset();
      }
    });
  }
});