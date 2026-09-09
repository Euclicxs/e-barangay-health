// DATABASE PER PUROK
const purokData = {
  calachuchi: {
    name: "Calachuchi",
    households: 4,
    dueCount: 2,
    bhws: "Prelin L. Veriño · Flora L. Tangoan",
    bhwCount: 2,
    records: [
      { code: "NKT-C-001", name: "Amara Grace Dela Cruz", type: "Child", address: "Blk 1 Lot 3, Purok Calachuchi", status: "Due This Month" },
      { code: "NKT-C-008", name: "Lucas Antonio Bautista", type: "Child", address: "Blk 2 Lot 7, Purok Calachuchi", status: "Due This Month" },
      { code: "NKT-M-001", name: "Maria Luisa Aquino", type: "Mother", address: "Blk 1 Lot 5, Purok Calachuchi", status: "Completed" },
      { code: "NKT-M-008", name: "Sheila Mae Bernardo", type: "Mother", address: "Blk 3 Lot 2, Purok Calachuchi", status: "Due This Month" }
    ]
  },
  bougainvillea: {
    name: "Bougainvillea",
    households: 3,
    dueCount: 0,
    bhws: "Virginia A. Escorial",
    bhwCount: 1,
    records: [
      { code: "NKT-C-002", name: "Liam Gabriel Santos", type: "Child", address: "Phase 1 Lot 4, Purok Bougainvillea", status: "Completed" },
      { code: "NKT-C-009", name: "Camille Faith Garcia", type: "Child", address: "Phase 2 Lot 1, Purok Bougainvillea", status: "Completed" },
      { code: "NKT-M-002", name: "Jennifer Anne Pascual", type: "Mother", address: "Phase 1 Lot 8, Purok Bougainvillea", status: "Overdue" }
    ]
  },
  walingwaling: {
    name: "Walingwaling",
    households: 3,
    dueCount: 2,
    bhws: "Rosalie E. Villarin · Jessie A. Pia",
    bhwCount: 2,
    records: [
      { code: "NKT-C-003", name: "Sofia Marie Reyes", type: "Child", address: "Sitio 1 Blk A, Purok Walingwaling", status: "Overdue" },
      { code: "NKT-C-010", name: "Rafael Cruz Mendoza", type: "Child", address: "Sitio 2 Blk B, Purok Walingwaling", status: "Overdue" },
      { code: "NKT-M-003", name: "Rosario Blanca Torres", type: "Mother", address: "Sitio 1 Blk C, Purok Walingwaling", status: "Completed" }
    ]
  },
  sampaguita: {
    name: "Sampaguita",
    households: 2,
    dueCount: 0,
    bhws: "Rosevilla A. Siarez",
    bhwCount: 1,
    records: [
      { code: "NKT-C-004", name: "Ethan James Fernandez", type: "Child", address: "Lot 9 Blk 3, Purok Sampaguita", status: "Completed" },
      { code: "NKT-M-004", name: "Cristina Mae Navarro", type: "Mother", address: "Lot 12 Blk 1, Purok Sampaguita", status: "Overdue" }
    ]
  },
  santan: {
    name: "Santan",
    households: 2,
    dueCount: 1,
    bhws: "Margarita G. Millan",
    bhwCount: 1,
    records: [
      { code: "NKT-C-005", name: "Isabella Rose Villanueva", type: "Child", address: "Blk 5 Lot 2, Purok Santan", status: "Overdue" },
      { code: "NKT-M-005", name: "Analiza Joy Soriano", type: "Mother", address: "Blk 5 Lot 6, Purok Santan", status: "Due This Month" }
    ]
  },
  rose: {
    name: "Rose",
    households: 2,
    dueCount: 0,
    bhws: "Bernardita T. Caduada",
    bhwCount: 1,
    records: [
      { code: "NKT-C-006", name: "Noah David Ramos", type: "Child", address: "Lot 3 Blk 2, Purok Rose", status: "Completed" },
      { code: "NKT-M-006", name: "Lorelai Dawn Magno", type: "Mother", address: "Lot 7 Blk 1, Purok Rose", status: "Completed" }
    ]
  },
  daisy: {
    name: "Daisy",
    households: 2,
    dueCount: 1,
    bhws: "Prelin L. Veriño · Flora L. Tangoan",
    bhwCount: 2,
    records: [
      { code: "NKT-C-007", name: "Mia Joy Castillo", type: "Child", address: "Phase A Lot 5, Purok Daisy", status: "Due This Month" },
      { code: "NKT-M-007", name: "Patricia Grace Ocampo", type: "Mother", address: "Phase A Lot 9, Purok Daisy", status: "Due This Month" }
    ]
  }
};

let activePurok = 'calachuchi';

// RENDER PUROK DATA
function renderPurok(purokKey) {
  const data = purokData[purokKey];
  if (!data) return;

  activePurok = purokKey;

  // Calculate enhanced statistics
  const childRecords = data.records.filter(r => r.type === 'Child');
  const motherRecords = data.records.filter(r => r.type === 'Mother');
  const totalPopulation = data.records.length;
  const overdueCount = data.records.filter(r => r.status === 'Overdue').length;
  const dueThisMonthCount = data.records.filter(r => r.status === 'Due This Month').length;

  // Update Stats Header
  document.getElementById('stat-households').innerText = data.households;
  document.getElementById('stat-households-sub').innerText = `Registered in ${data.name}`;
  
  
  document.getElementById('stat-population').innerText = totalPopulation;
  document.getElementById('stat-population-sub').innerText = `${childRecords.length} children · ${motherRecords.length} mothers`;
  
  document.getElementById('stat-due').innerText = overdueCount + dueThisMonthCount;
  document.getElementById('stat-due-sub').innerText = `${overdueCount} overdue · ${dueThisMonthCount} due this month`;
  
  document.getElementById('stat-bhws').innerText = data.bhwCount;
  document.getElementById('stat-bhws-sub').innerText = data.bhws;

  // Update Table Title & Count
  document.getElementById('table-title').innerText = `Purok ${data.name} — Health Records`;
  document.getElementById('entries-count').innerText = `${totalPopulation} entries (${childRecords.length} children, ${motherRecords.length} mothers)`;

  // Render Table Rows
  const tbody = document.getElementById('purok-table-body');
  tbody.innerHTML = '';

  data.records.forEach(rec => {
    let typeTag = rec.type === 'Child' 
      ? `<span class="type-pill type-child"><i class="fa-solid fa-child"></i> Child</span>`
      : `<span class="type-pill type-mother"><i class="fa-solid fa-person-pregnant"></i> Mother</span>`;

    let statusPill = '';
    if (rec.status === 'Overdue') {
      statusPill = `<span class="status-pill status-red">• Overdue</span>`;
    } else if (rec.status === 'Due This Month') {
      statusPill = `<span class="status-pill status-yellow">• Due This Month</span>`;
    } else {
      statusPill = `<span class="status-pill status-green">• Completed</span>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="person-name">${rec.name}</td>
      <td>${typeTag}</td>
      <td>${rec.address}</td>
      <td>${statusPill}</td>
      <td>
        <div class="actions-cell">
          <button class="btn-tbl-action"><i class="fa-solid fa-id-card"></i> Print Card</button>
          <button class="btn-tbl-action btn-tbl-edit"><i class="fa-solid fa-pen"></i> Edit</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
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
// TAB SWITCHING EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  // Validate session
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  // Update sidebar user profile - show only the logged-in user's name
  function updateUserProfile() {
    const session = getSession();
    if (!session) return;

    const userName = getCurrentUserName();

    const userAvatar = document.getElementById('userAvatar') || document.querySelector('.user-profile .avatar');
    const userNameEl = document.getElementById('userNameDisplay');

    if (userAvatar) {
      userAvatar.textContent = userName.charAt(0).toUpperCase();
    }
    if (userNameEl) {
      userNameEl.textContent = userName;
    }
  }

  const tabs = document.querySelectorAll('.purok-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const purokKey = this.getAttribute('data-purok');
      renderPurok(purokKey);
    });
  });

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

  // Initial Load
  renderPurok('calachuchi');
  updateUserProfile();

  // Start clock
  setInterval(updateClock, 1000);
  updateClock();
});
