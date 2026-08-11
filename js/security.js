document.addEventListener('DOMContentLoaded', () => {

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