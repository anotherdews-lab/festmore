// public/js/main.js
// Frontend JavaScript for Festmore

// Mobile menu
document.addEventListener('DOMContentLoaded', () => {
  // Close mobile menu on outside click
  document.addEventListener('click', e => {
    const menu = document.querySelector('.nav-mobile');
    const burger = document.querySelector('.nav-burger');
    if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)) {
      menu.classList.remove('open');
    }
  });

  // Live search autocomplete
  const searchInput = document.querySelector('.nav-search input');
  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const q = searchInput.value.trim();
        if (q.length < 2) return;
        // Could add autocomplete dropdown here in future
      }, 300);
    });
  }

  // Animate cards on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.event-card, .article-card, .cat-card, .country-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(card);
  });
});

// Share function
function shareEvent(title, url) {
  if (navigator.share) {
    navigator.share({ title: title + ' — Festmore', url: url || window.location.href });
  } else {
    navigator.clipboard.writeText(url || window.location.href).then(() => {
      alert('Link copied to clipboard!');
    });
  }
}
