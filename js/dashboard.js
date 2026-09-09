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

  // Notification bell
  const notificationBtn = document.querySelector('.icon-btn');
  if (notificationBtn) {
    notificationBtn.style.cursor = 'pointer';
    notificationBtn.addEventListener('click', function() {
      alert('Notifications:\n● 3 children due for immunization\n● 2 maternal checkups overdue\n● System backup completed');
    });
  }

  // STAT CARD MODAL FUNCTIONALITY
  const statCardModals = {
    'total-records': 'totalRecordsModal',
    'overdue': 'overdueModal',
    'due-this-month': 'dueThisMonthModal',
    'completed': 'completedModal'
  };

  // Sample data
  const sampleData = {
    totalRecords: [
      { name: 'KLINT KERVIN PANERIO', age: '4 mos', sex: 'Male', purok: 'Calachuchi', status: 'Due This Month' },
      { name: 'LIAM JAMES TAMAY', age: '6 mos', sex: 'Male', purok: 'Bougainvillea', status: 'Completed' },
      { name: 'AMARAH BASTATAS', age: '2 mos', sex: 'Female', purok: 'Walingwaling', status: 'Overdue' },
      { name: 'LUKA BENAVENTE', age: '2 mos', sex: 'Male', purok: 'Walingwaling', status: 'Overdue' },
      { name: 'ANNEZA BATAWAN', age: '2 mos', sex: 'Female', purok: 'Walingwaling', status: 'Due This Month' },
      { name: 'GINO GULLES', age: '2 mos', sex: 'Male', purok: 'Walingwaling', status: 'Due This Month' },
      { name: 'ARZHEL WAYNE REPOLIDON', age: '2 mos', sex: 'Male', purok: 'Walingwaling', status: 'Completed' },
      { name: 'SHAYLEE ELOISE DIAMADA', age: '2 mos', sex: 'Female', purok: 'Walingwaling', status: 'Completed' },
      { name: 'ASHIRA ELISE ROBLE', age: '2 mos', sex: 'Female', purok: 'Walingwaling', status: 'Completed' },
      { name: 'RAIDEN BRYCE MACAY', age: '2 mos', sex: 'Male', purok: 'Walingwaling', status: 'Completed' }
    ],
    overdue: [
      { name: 'AMARAH BASTATAS', type: 'Child', age: '2 mos', sex: 'Female', purok: 'Walingwaling', overdue: '7 days' },
      { name: 'LUKA BENAVENTE', type: 'Child', age: '2 mos', sex: 'Male', purok: 'Walingwaling', overdue: '5 days' },
      { name: 'GINO GULLES', type: 'Child', age: '2 mos', sex: 'Male', purok: 'Walingwaling', overdue: '4 days' },
      { name: 'Cristina Mae Navarro', type: 'Maternal', age: '28 yrs', sex: 'Female', purok: 'Sampaguita', overdue: '3 days' },
      { name: 'Analiza Joy Soriano', type: 'Maternal', age: '25 yrs', sex: 'Female', purok: 'Santan', overdue: '2 days' }
    ],
    dueThisMonth: [
      { name: 'KLINT KERVIN PANERIO', age: '4 mos', sex: 'Male', purok: 'Calachuchi', dueDate: 'Aug 25, 2026' },
      { name: 'ANNEZA BATAWAN', age: '2 mos', sex: 'Female', purok: 'Walingwaling', dueDate: 'Aug 28, 2026' },
      { name: 'GINO GULLES', age: '2 mos', sex: 'Male', purok: 'Walingwaling', dueDate: 'Aug 30, 2026' }
    ],
    completed: [
      { name: 'LIAM JAMES TAMAY', age: '6 mos', sex: 'Male', purok: 'Bougainvillea', visitDate: 'Aug 15, 2026' },
      { name: 'ARZHEL WAYNE REPOLIDON', age: '2 mos', sex: 'Male', purok: 'Walingwaling', visitDate: 'Aug 18, 2026' },
      { name: 'SHAYLEE ELOISE DIAMADA', age: '2 mos', sex: 'Female', purok: 'Walingwaling', visitDate: 'Aug 20, 2026' },
      { name: 'ASHIRA ELISE ROBLE', age: '2 mos', sex: 'Female', purok: 'Walingwaling', visitDate: 'Aug 21, 2026' }
    ]
  };

  // Populate modal tables
  function populateModal(modalType) {
    if (modalType === 'total-records') {
      const tbody = document.getElementById('totalRecordsTable');
      if (tbody) {
        tbody.innerHTML = sampleData.totalRecords.map(record => `
          <tr>
            <td><strong>${record.name}</strong></td>
            <td>${record.age} ● ${record.sex}</td>
            <td>${record.purok}</td>
            <td><span class="status-pill status-${record.status === 'Overdue' ? 'red' : record.status === 'Due This Month' ? 'yellow' : 'green'}">${record.status}</span></td>
          </tr>
        `).join('');
      }
    } else if (modalType === 'overdue') {
      const tbody = document.getElementById('overdueTable');
      if (tbody) {
        tbody.innerHTML = sampleData.overdue.map(record => `
          <tr>
            <td><strong>${record.name}</strong></td>
            <td><span class="badge badge-${record.type === 'Child' ? 'cyan' : 'red'}">${record.type}</span></td>
            <td>${record.age} ● ${record.sex}</td>
            <td>${record.purok}</td>
            <td class="text-red">${record.overdue}</td>
          </tr>
        `).join('');
      }
    } else if (modalType === 'due-this-month') {
      const tbody = document.getElementById('dueThisMonthTable');
      if (tbody) {
        tbody.innerHTML = sampleData.dueThisMonth.map(record => `
          <tr>
            <td><strong>${record.name}</strong></td>
            <td>${record.age} ● ${record.sex}</td>
            <td>${record.purok}</td>
            <td>${record.dueDate}</td>
          </tr>
        `).join('');
      }
    } else if (modalType === 'completed') {
      const tbody = document.getElementById('completedTable');
      if (tbody) {
        tbody.innerHTML = sampleData.completed.map(record => `
          <tr>
            <td><strong>${record.name}</strong></td>
            <td>${record.age} ● ${record.sex}</td>
            <td>${record.purok}</td>
            <td>${record.visitDate}</td>
          </tr>
        `).join('');
      }
    }
  }


  // Attach click handlers to stat cards with data-modal attributes
  const statCards = document.querySelectorAll('.stat-card[data-modal]');
  
  statCards.forEach((card) => {
    // Set cursor style for visual feedback
    card.style.cursor = 'pointer';
    
    // Use addEventListener for more reliable event handling
    card.addEventListener('click', function(event) {
      // Prevent any event bubbling issues
      event.stopPropagation();
      
      // Get the modal type from data-modal attribute
      const modalType = this.getAttribute('data-modal');
      
      // Get the corresponding modal ID from the mapping
      const modalId = statCardModals[modalType];
      
      // Find the modal element
      const modal = document.getElementById(modalId);
      
      if (modal) {
        // Populate the modal with data before showing it
        populateModal(modalType);
        
        // Display the modal
        modal.style.display = 'flex';
      }
    });
  });

  // Close modal handlers
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', function() {
      const modalId = this.getAttribute('data-close');
      const modal = document.getElementById(modalId);
      if (modal) modal.style.display = 'none';
    });
  });

  // Close modal on outside click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // Add admin navigation section if user is admin
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