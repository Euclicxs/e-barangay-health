document.addEventListener('DOMContentLoaded', () => {
  // Real-time Clock
  function updateClock() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    
    const timeElem = document.getElementById('clock-time');
    const dateElem = document.getElementById('clock-date');
    
    if (timeElem) timeElem.textContent = now.toLocaleTimeString('en-US', timeOptions);
    if (dateElem) dateElem.textContent = now.toLocaleDateString('en-US', dateOptions);
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Modal Functionality
  const maternalModal = document.getElementById('maternalModal');
  const btnEncodeMaternal = document.getElementById('btnEncodeMaternal');
  const closeMaternalModalBtn = document.getElementById('closeMaternalModalBtn');
  const cancelMaternalModalBtn = document.getElementById('cancelMaternalModalBtn');

  if (btnEncodeMaternal) {
    btnEncodeMaternal.addEventListener('click', () => {
      maternalModal.style.display = 'flex';
    });
  }

  function closeModal() {
    if (maternalModal) maternalModal.style.display = 'none';
  }

  if (closeMaternalModalBtn) closeMaternalModalBtn.addEventListener('click', closeModal);
  if (cancelMaternalModalBtn) cancelMaternalModalBtn.addEventListener('click', closeModal);

  window.addEventListener('click', (e) => {
    if (e.target === maternalModal) closeModal();
  });
});