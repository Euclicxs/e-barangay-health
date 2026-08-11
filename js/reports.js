document.addEventListener('DOMContentLoaded', () => {

  // 1. FILTER PERIOD QUICK BUTTONS
  const quickBtns = document.querySelectorAll('.btn-quick-date');
  const dateDisplay = document.getElementById('filter-date-display');
  const reportTag = document.getElementById('active-period-tag');

  quickBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      quickBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const period = this.getAttribute('data-period');
      const fullMonth = period === 'Aug 2026' ? 'August 2026' : (period === 'Sep 2026' ? 'September 2026' : 'October 2026');

      dateDisplay.value = fullMonth;
      reportTag.innerText = `${fullMonth} Health Report`;
    });
  });

  // 2. BAR CHART (Vaccination Rate per Purok)
  const ctxBar = document.getElementById('purokBarChart').getContext('2d');
  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Calachuchi', 'Bougainvillea', 'Walingwaling', 'Sampaguita', 'Santan', 'Rose', 'Daisy'],
      datasets: [{
        data: [75, 100, 30, 100, 0, 100, 50],
        backgroundColor: [
          '#eab308', // Calachuchi - 75% Yellow
          '#22c55e', // Bougainvillea - 100% Green
          '#ef4444', // Walingwaling - 30% Red
          '#22c55e', // Sampaguita - 100% Green
          '#334155', // Santan - 0% Dark Gray
          '#22c55e', // Rose - 100% Green
          '#eab308'  // Daisy - 50% Yellow
        ],
        borderRadius: 4,
        barThickness: 28
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            callback: value => value + '%',
            color: '#64748b',
            font: { size: 10 }
          },
          grid: { color: '#1e293b' }
        },
        x: {
          ticks: {
            color: '#94a3b8',
            font: { size: 10 }
          },
          grid: { display: false }
        }
      }
    }
  });

  // 3. DONUT CHART (Vaccine Distribution)
  const ctxDonut = document.getElementById('vaccineDonutChart').getContext('2d');
  new Chart(ctxDonut, {
    type: 'doughnut',
  data: {
    labels: ['BCG', 'OPV', 'IPV', 'PENTA', 'PCV', 'MCV1', 'MCV2'],
    datasets: [{
      data: [9, 7, 6, 8, 5, 4, 3], // 7 numbers dapat ito!
      backgroundColor: [
        '#06b6d4', // Cyan (BCG)
        '#22c55e', // Green (OPV)
        '#eab308', // Yellow (IPV)
        '#ef4444', // Red (PENTA)
        '#3b82f6', // Blue (PCV)
        '#ec4899', // Pink (MCV1)
        '#f97316'  // Orange (MCV2)
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false }
      }
    }
  });

});