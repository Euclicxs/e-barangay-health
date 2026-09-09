document.addEventListener('DOMContentLoaded', () => {
  // Validate session - allow both admin and BHW users
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }
  if (session.userType !== 'admin' && session.userType !== 'bhw') {
    window.location.href = 'login.html';
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

  function filterTable() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedPurok = purokSelect ? purokSelect.value.toLowerCase() : 'all';
    const rows = document.querySelectorAll('.data-table tbody tr');
    
    let visibleCount = 0;
    
    rows.forEach(row => {
      const motherName = row.querySelector('td:first-child strong')?.textContent.toLowerCase() || '';
      const purokCell = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
      
      const matchesSearch = !searchTerm || motherName.includes(searchTerm);
      const matchesPurok = selectedPurok === 'all' || purokCell.includes(selectedPurok);
      
      if (matchesSearch && matchesPurok) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    console.log(`Filtered: ${visibleCount} records visible`);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterTable);
  }

  if (purokSelect) {
    purokSelect.addEventListener('change', filterTable);
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
  const viewBtns = document.querySelectorAll('.btn-subtle');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      
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
    });
  });
  
  // Update button handler
  const updateBtns = document.querySelectorAll('.btn-outline');
  updateBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.closest('tr');
      
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
    });
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


  // Add admin navigation if admin
  if (session && session.userType === 'admin') {
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (sidebarFooter) {
      const adminSection = document.createElement('div');
      adminSection.className = 'menu-section';
      adminSection.style.marginTop = 'auto';
      adminSection.innerHTML = `
        <span class="menu-title">ADMIN PANEL</span>
        <ul class="menu-list">
          <li>
            <a href="admin.html">
              <i class="fa-solid fa-user-shield"></i>
              <span>Return to Admin</span>
            </a>
          </li>
        </ul>
      `;
      sidebarFooter.parentNode.insertBefore(adminSection, sidebarFooter);
    }
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