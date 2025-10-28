document.addEventListener('DOMContentLoaded', () => {
  const projects = document.querySelector('.projects');
  const cards = document.querySelectorAll('.project-card');
  const footer = document.getElementById('mainFooter');
  const logoWrap = document.querySelector('.logo-metal');
  const body = document.body;
  const title = projects.querySelector('h1');

  // блокируем прокрутку
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // появление проектов
  setTimeout(() => projects.classList.add('visible'), 4600);

  // плавное появление карточек
  setTimeout(() => {
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('show'), i * 400);
    });
  }, 5100);

  // появление футера
  const footerDelay = 5100 + cards.length * 400 + 400;
  setTimeout(() => {
    footer.classList.add('visible');
    const totalHeight = document.body.scrollHeight;
    if (totalHeight > window.innerHeight + 10) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, footerDelay);

  // годы
  const yearSpan = document.getElementById('yearRange');
  if (yearSpan) {
    const start = 2024;
    const current = new Date().getFullYear();
    yearSpan.textContent = start === current ? `${current}` : `${start}–${current}`;
  }

  // 💫 ПОРТАЛ: схлопывание + исчезновение
cards.forEach(card => {
  card.addEventListener('click', e => {
    e.preventDefault();
    const href = card.getAttribute('href');

    // схлопываем содержимое
    projects.classList.add('collapse');
    cards.forEach(c => c.classList.add('collapse'));
    if (title) title.classList.add('collapse');

    // через 300 мс логотип слегка съезжает вниз
    setTimeout(() => {
      logoWrap.classList.add('portal-shift');
    }, 300);

    // через 800 мс — увеличение и растворение
    setTimeout(() => {
      logoWrap.classList.add('portal-zoom');
    }, 800);

    // переход
    setTimeout(() => {
      window.location.href = href;
    }, 1600);
  });
});

  // сброс при возврате
  window.addEventListener('pageshow', () => {
    projects.classList.remove('collapse');
    cards.forEach(c => c.classList.remove('collapse'));
    if (title) title.classList.remove('collapse');
    logoWrap.classList.remove('portal-zoom');
    body.classList.remove('warp-active');
  });
});
