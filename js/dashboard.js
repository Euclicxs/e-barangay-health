document.addEventListener('DOMContentLoaded', () => {
  // Validate session - page is BHW-only now
  if (!validateSession('bhw')) {
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

  // Sample fallback data (used when shared purok data is not available, e.g. tests)
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

  // ============================================================
  // DATA LAYER - derived from shared purok-data.js when available
  // ============================================================

  const sharedDataAvailable = typeof purokData !== 'undefined' && typeof computeStatus === 'function';

  function formatDateLabel(dateStr) {
    if (!dateStr) return 'N/A';
    const parts = String(dateStr).split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const y = parseInt(parts[0], 10);
    if (!m || !d || !y) return dateStr;
    return `${months[m - 1]} ${d}, ${y}`;
  }

  function computeAgeLabel(birthDate) {
    if (!birthDate) return '';
    const parts = String(birthDate).split('-');
    const birth = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    if (isNaN(birth.getTime())) return '';
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (now.getDate() < birth.getDate()) months--;
    if (months < 0) months = 0;
    if (months < 12) return `${months} mo${months === 1 ? '' : 's'}`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years} yr ${rem} mo` : `${years} yr${years === 1 ? '' : 's'}`;
  }

  // Purok keys visible to the logged-in BHW (null => show all)
  function getScopedPuroks() {
    if (sharedDataAvailable && typeof getCurrentUserAssignedPuroks === 'function') {
      const keys = getCurrentUserAssignedPuroks();
      if (keys) return keys;
    }
    if (sharedDataAvailable) {
      return Object.keys(purokData);
    }
    return null;
  }

  // All records visible to the BHW (already scoped + decorated)
  function getScopedRecords() {
    if (!sharedDataAvailable) return [];

    const keys = getScopedPuroks() || Object.keys(purokData);
    const records = [];

    keys.forEach(key => {
      const purok = purokData[key];
      if (!purok) return;
      (purok.records || []).forEach(rec => {
        records.push({
          ...rec,
          purok: purok.name,
          purokKey: key,
          status: computeStatus(rec.nextVisitDate, rec.lastVisitDate),
          ageLabel: computeAgeLabel(rec.birthDate)
        });
      });
    });

    return records;
  }

  function statusPillClass(status) {
    if (status === 'Overdue') return 'red';
    if (status === 'Due This Month') return 'yellow';
    return 'green';
  }

  // Populate modal tables from live scoped data
  function populateModalFromLiveData(modalType, records) {
    if (modalType === 'total-records') {
      const tbody = document.getElementById('totalRecordsTable');
      if (!tbody) return;
      tbody.innerHTML = records
        .filter(r => r.type === 'Child')
        .map(r => `
          <tr>
            <td><strong>${r.name}</strong></td>
            <td>${r.ageLabel || '—'}</td>
            <td>${r.purok}</td>
            <td><span class="status-pill status-${statusPillClass(r.status)}">• ${r.status}</span></td>
          </tr>
        `).join('') || '<tr><td colspan="4" style="color:#64748b;">No records for your assigned puroks.</td></tr>';
    } else if (modalType === 'overdue') {
      const tbody = document.getElementById('overdueTable');
      if (!tbody) return;
      tbody.innerHTML = records
        .filter(r => r.status === 'Overdue')
        .map(r => {
          const days = typeof getOverdueDays === 'function' ? getOverdueDays(r.nextVisitDate) : 0;
          const type = r.type === 'Child' ? 'Child' : 'Maternal';
          return `
            <tr>
              <td><strong>${r.name}</strong></td>
              <td><span class="badge badge-${type === 'Child' ? 'cyan' : 'red'}">${type}</span></td>
              <td>${r.purok}</td>
              <td class="text-red">${days} day${days === 1 ? '' : 's'}</td>
            </tr>
          `;
        }).join('') || '<tr><td colspan="4" style="color:#64748b;">Nothing overdue for your assigned puroks. Great job!</td></tr>';
    } else if (modalType === 'due-this-month') {
      const tbody = document.getElementById('dueThisMonthTable');
      if (!tbody) return;
      tbody.innerHTML = records
        .filter(r => r.type === 'Child' && r.status === 'Due This Month')
        .map(r => `
          <tr>
            <td><strong>${r.name}</strong></td>
            <td>${r.ageLabel || '—'}</td>
            <td>${r.purok}</td>
            <td>${formatDateLabel(r.nextVisitDate)}</td>
          </tr>
        `).join('') || '<tr><td colspan="4" style="color:#64748b;">No due visits this month for your assigned puroks.</td></tr>';
    } else if (modalType === 'completed') {
      const tbody = document.getElementById('completedTable');
      if (!tbody) return;
      tbody.innerHTML = records
        .filter(r => r.type === 'Child' && r.status === 'Completed')
        .map(r => `
          <tr>
            <td><strong>${r.name}</strong></td>
            <td>${r.ageLabel || '—'}</td>
            <td>${r.purok}</td>
            <td>${formatDateLabel(r.lastVisitDate)}</td>
          </tr>
        `).join('') || '<tr><td colspan="4" style="color:#64748b;">No completed visits yet for your assigned puroks.</td></tr>';
    }
  }

  // Render the dashboard widgets from live scoped data
  function renderLiveDashboard(records) {
    const childRecords = records.filter(r => r.type === 'Child');
    const motherRecords = records.filter(r => r.type === 'Mother');
    const overdueRecords = records.filter(r => r.status === 'Overdue');
    const dueChildRecords = childRecords.filter(r => r.status === 'Due This Month');
    const completedChildRecords = childRecords.filter(r => r.status === 'Completed');

    const overdueChildren = overdueRecords.filter(r => r.type === 'Child').length;
    const overdueMothers = overdueRecords.length - overdueChildren;

    const totalCountEl = document.getElementById('totalCountStat');
    const overdueCountEl = document.getElementById('overdueCountStat');
    const overdueSubEl = document.getElementById('overdueSubText');
    const dueCountEl = document.getElementById('dueThisMonthCountStat');
    const completedCountEl = document.getElementById('completedCountStat');

    if (totalCountEl) totalCountEl.textContent = childRecords.length;
    if (overdueCountEl) overdueCountEl.textContent = overdueRecords.length;
    if (overdueSubEl) {
      overdueSubEl.textContent = `${overdueChildren} child · ${overdueMothers} maternal`;
    }
    if (dueCountEl) dueCountEl.textContent = dueChildRecords.length;
    if (completedCountEl) completedCountEl.textContent = completedChildRecords.length;

    // Child Immunization Summary (first 3 children)
    const childList = document.getElementById('childSummaryList');
    if (childList) {
      childList.innerHTML = childRecords.slice(0, 3).map(r => `
        <li>
          <div>
            <strong>${r.name}</strong>
            <span>Purok ${r.purok} · ${r.ageLabel || ''}</span>
          </div>
          <span class="status-pill status-${statusPillClass(r.status)}">• ${r.status}</span>
        </li>
      `).join('') || '<li><div><strong>No child records</strong><span>No children in your assigned puroks.</span></div></li>';
    }

    // Maternal / Prenatal Summary (first 3 mothers)
    const maternalList = document.getElementById('maternalSummaryList');
    if (maternalList) {
      maternalList.innerHTML = motherRecords.slice(0, 3).map(r => `
        <li>
          <div>
            <strong>${r.name}</strong>
            <span>Purok ${r.purok} · ${r.ageLabel || ''}</span>
          </div>
          <span class="status-pill status-${statusPillClass(r.status)}">• ${r.status}</span>
        </li>
      `).join('') || '<li><div><strong>No maternal records</strong><span>No mothers in your assigned puroks.</span></div></li>';
    }

    // Purok Breakdown (children per assigned purok)
    const breakdownEl = document.getElementById('purokBreakdownList');
    if (breakdownEl) {
      const keys = getScopedPuroks() || Object.keys(purokData);
      const counts = keys.map(key => {
        const purok = purokData[key];
        if (!purok) return null;
        const children = (purok.records || []).filter(r => r.type === 'Child').length;
        return { name: purok.name, count: children };
      }).filter(Boolean);

      const maxCount = Math.max(1, ...counts.map(c => c.count));

      breakdownEl.innerHTML = counts.map((c, idx) => `
        <div class="breakdown-item">
          <div class="item-info">
            <span>${c.name}</span>
            <span>${c.count}</span>
          </div>
          <div class="progress-bg"><div class="progress-bar ${idx % 2 === 0 ? 'cyan' : 'blue'}" style="width: ${(c.count / maxCount) * 100}%;"></div></div>
        </div>
      `).join('');
    }

    // Subtitle + sidebar assigned puroks
    const assignedKeys = getScopedPuroks();
    const subtitle = document.getElementById('dashboardSubtitle');
    if (subtitle) {
      if (assignedKeys && assignedKeys.length > 0) {
        const names = assignedKeys.map(k => purokData[k] ? purokData[k].name : k);
        subtitle.textContent = `Summary of health records for ${names.map(n => `Purok ${n}`).join(' & ')}`;
      } else {
        subtitle.textContent = 'Summary of health records for Brgy. New Katipunan, Matanao';
      }
    }
    const assignedPuroksEl = document.getElementById('userAssignedPuroks');
    if (assignedPuroksEl) {
      assignedPuroksEl.textContent = '';
      if (assignedKeys && assignedKeys.length > 0) {
        assignedPuroksEl.textContent = assignedKeys.map(k => purokData[k] ? purokData[k].name : k).join(' · ');
      }
    }
  }

  // Populate modal tables
  function populateModal(modalType) {
    if (sharedDataAvailable) {
      populateModalFromLiveData(modalType, getScopedRecords());
      return;
    }

    // ----- Fallback to sample data (tests / shared data unavailable) -----
    if (modalType === 'total-records') {
      const tbody = document.getElementById('totalRecordsTable');
      if (tbody) {
        tbody.innerHTML = sampleData.totalRecords.map(record => `
          <tr>
            <td><strong>${record.name}</strong></td>
            <td>${record.age}</td>
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
            <td>${record.age}</td>
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
            <td>${record.age}</td>
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

  // Initialize
  updateUserProfile();
  setTimeout(() => {
    updateUserProfile();
  }, 100);

  if (sharedDataAvailable) {
    renderLiveDashboard(getScopedRecords());
  }

  // Start clock
  setInterval(updateClock, 1000);
  updateClock();
});