document.addEventListener('DOMContentLoaded', () => {
  // REAL-TIME CLOCK LOGIC
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
});