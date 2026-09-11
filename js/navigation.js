// Navigation Active State Handler
// This script automatically sets the active menu item based on current page
(function() {
  // Get current page filename
  const currentPage = window.location.pathname.split('/').pop();
  
  // Remove all active classes first
  document.querySelectorAll('.menu-list li').forEach(item => {
    item.classList.remove('active');
  });
  
  // Map of pages to their menu links
  const pageMap = {
    'dashboard.html': 'dashboard.html',
    'child.html': 'child.html',
'maternal.html': 'maternal.html',
    'reports.html': 'reports.html',
    'security.html': 'security.html'
  };
  
  // Find and set active state
  if (pageMap[currentPage]) {
    const links = document.querySelectorAll('.menu-list a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.closest('li').classList.add('active');
      }
    });
  }
})();
