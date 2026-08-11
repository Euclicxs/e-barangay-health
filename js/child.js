document.addEventListener('DOMContentLoaded', () => {
  // 1. LIVE CLOCK LOGIC
  function updateClock() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };

    const timeElement = document.getElementById('clock-time');
    const dateElement = document.getElementById('clock-date');

    if (timeElement) timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
    if (dateElement) dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
  }

  setInterval(updateClock, 1000);
  updateClock();

  // 2. ENCODE VISIT MODAL LOGIC
  const encodeModal = document.getElementById('encodeModal');
  const btnEncodeVisit = document.getElementById('btnEncodeVisit');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const encodeVisitForm = document.getElementById('encodeVisitForm');

  if (btnEncodeVisit && encodeModal) {
    btnEncodeVisit.addEventListener('click', () => {
      encodeModal.style.display = 'flex';
    });
  }

  const closeEncodeModal = () => {
    if (encodeModal) encodeModal.style.display = 'none';
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeEncodeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeEncodeModal);

  if (encodeVisitForm) {
    encodeVisitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('New immunization visit record successfully saved!');
      closeEncodeModal();
      encodeVisitForm.reset();
    });
  }

  // 3. UPDATE PATIENT VISIT MODAL LOGIC
  const updateModal = document.getElementById('updateModal');
  const closeUpdateModalBtn = document.getElementById('closeUpdateModalBtn');
  const cancelUpdateModalBtn = document.getElementById('cancelUpdateModalBtn');
  const updateRecordForm = document.getElementById('updateRecordForm');
  const updateBtns = document.querySelectorAll('.update-btn');

  updateBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (updateModal) updateModal.style.display = 'flex';
    });
  });

  const closeUpdateModal = () => {
    if (updateModal) updateModal.style.display = 'none';
  };

  if (closeUpdateModalBtn) closeUpdateModalBtn.addEventListener('click', closeUpdateModal);
  if (cancelUpdateModalBtn) cancelUpdateModalBtn.addEventListener('click', closeUpdateModal);

  if (updateRecordForm) {
    updateRecordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Patient visit record successfully updated!');
      closeUpdateModal();
    });
  }

  // 4. VIEW CHILD PATIENT PROFILE MODAL & CHART LOGIC
  const viewModal = document.getElementById('viewModal');
  const closeViewModalBtn = document.getElementById('closeViewModalBtn');
  const cancelViewModalBtn = document.getElementById('cancelViewModalBtn');
  const viewBtns = document.querySelectorAll('.view-btn');
  let growthChartInstance = null;

  const initGrowthChart = () => {
    const canvas = document.getElementById('growthChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Destroy previous chart instance if existing to prevent canvas re-render glitch
    if (growthChartInstance) {
      growthChartInstance.destroy();
    }

    growthChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['At Birth', '1 Mo', '2 Mos', '3 Mos', '4 Mos'],
        datasets: [
          {
            label: 'Weight (kg)',
            data: [3.2, 4.1, 4.9, 5.5, 6.2],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Height (cm)',
            data: [50, 53, 56, 59, 62],
            borderColor: '#3b82f6',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { size: 10 } }
          }
        },
        scales: {
          x: {
            ticks: { color: '#64748b', font: { size: 10 } },
            grid: { color: '#1e293b' }
          },
          y: {
            ticks: { color: '#64748b', font: { size: 10 } },
            grid: { color: '#1e293b' }
          }
        }
      }
    });
  };

  viewBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (viewModal) {
        viewModal.style.display = 'flex';
        initGrowthChart();
      }
    });
  });

  const closeViewModal = () => {
    if (viewModal) viewModal.style.display = 'none';
  };

  if (closeViewModalBtn) closeViewModalBtn.addEventListener('click', closeViewModal);
  if (cancelViewModalBtn) cancelViewModalBtn.addEventListener('click', closeViewModal);

  // 5. GLOBAL OUTSIDE MODAL CLICK CLOSING HANDLER
  window.addEventListener('click', (event) => {
    if (event.target === encodeModal) closeEncodeModal();
    if (event.target === updateModal) closeUpdateModal();
    if (event.target === viewModal) closeViewModal();
  });
});