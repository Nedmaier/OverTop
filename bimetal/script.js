function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  if (!grid || !window.products) return;

  grid.innerHTML = window.products.map(prod => `
    <section class="product-section" id="product-${prod.id}">
      <h2 class="prod-title">${prod.name}</h2>
      <div class="prod-desc">${prod.description}</div>

      <h3>${prod.apply_title}</h3>
      <div class="prod-apply">${prod.apply_description}</div>

      <h3>${prod.parameters_title}</h3>
      <ul class="prod-params">
        ${prod.parameters.map(p => `<li>${p}</li>`).join('')}
      </ul>

      <div class="sub-grid limited" data-prod-id="${prod.id}">
        ${prod.products_list.map((sub, idx) => `
          <article class="sub-card">
            <div class="slider" data-index="${prod.id}-${idx}">
              ${sub.product_photo.map((img, i) => `
                <img src="${img}" alt="${sub.product_name}" class="slide ${i === 0 ? 'active' : ''}">
              `).join('')}

              ${sub.product_photo.length > 1
                ? `
                  <div class="slider-dots">
                    ${sub.product_photo.map((_, i) => `
                      <span class="dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></span>
                    `).join('')}
                  </div>
                `
                : `
                  <div class="slider-dots">
                    <span class="dot-placeholder"></span>
                  </div>
                `}
            </div>

            <h4 class="prod_title">${sub.product_name}</h4>
            <div class="sub-desc">${sub.product_description}</div>

            <button class="toggle-details" data-index="${prod.id}-${idx}">Характеристики <span class="arrow">▼</span></button>
            <div class="sub-details hidden">
              <ul class="sub-params">
                ${sub.product_parameters.map(param => `<li>${param}</li>`).join('')}
              </ul>
            </div>
          </article>
        `).join('')}
      </div>

     ${prod.products_list.length > 3 ? `
  <div class="show-more-wrap">
    <button class="show-more" data-target="${prod.id}" data-state="collapsed">
      Показать ещё продукцию
    </button>
  </div>
` : ''}
    </section>
  `).join('');
}

function renderSubmenu() {
  const submenu = document.getElementById('submenuProducts');
  if (!submenu || !window.products) return;

  submenu.innerHTML = window.products.map(p => `
    <a href="#product-${p.id}" data-target="product-${p.id}">${p.name}</a>
  `).join('');
}


menuToggle.addEventListener('click', () => {
  const submenuParent = document.querySelector('.has-submenu');
  if (window.innerWidth <= 860 && submenuParent) {
    if (menu.classList.contains('open')) {
      submenuParent.classList.add('open');
    } else {
      submenuParent.classList.remove('open');
    }
  }
});


// обработка кликов по пунктам подменю (плавный скролл)
document.addEventListener('click', e => {
  const link = e.target.closest('.submenu a');
  if (link) {
    e.preventDefault();
    const id = link.dataset.target;
    const section = document.getElementById(id);
    if (section) {
      smoothScrollTo(section, 1400); // ← заменили scrollIntoView
    }

    // закрываем меню на мобильных
    const submenuWrap = link.closest('.has-submenu');
    if (submenuWrap) submenuWrap.classList.remove('open');
  }
});

// обработка для мобильных (раскрытие при клике)
document.addEventListener('click', e => {
  const catalogBtn = e.target.closest('#menuCatalog');
  if (catalogBtn) {
    e.preventDefault();
    const parent = catalogBtn.closest('.has-submenu');
    parent.classList.toggle('open');
  }
});

document.addEventListener('click', e => {
  // --- Раскрытие описаний ---
 if (e.target.classList.contains('toggle-details')) {
  const btn = e.target;
  const detail = btn.parentElement.querySelector('.sub-details');
  const isOpen = detail.classList.toggle('show');

  // меняем текст и стрелку
	btn.innerHTML = `
  Характеристики
  <span class="arrow ${isOpen ? 'rotated' : ''}">▼</span>
`;

  return;
}

  // --- Точки слайдера ---
  if (e.target.classList.contains('dot')) {
    const dot = e.target;
    const slider = dot.closest('.slider');
    const dots = slider.querySelectorAll('.dot');
    const slides = slider.querySelectorAll('.slide');
    const index = parseInt(dot.dataset.slide);

    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    return;
  }

  // --- Показать / скрыть продукцию ---
  if (e.target.classList.contains('show-more')) {
    const btn = e.target;
    const targetId = btn.dataset.target;
    const grid = document.querySelector(`.sub-grid[data-prod-id="${targetId}"]`);
    if (!grid) return;

    const isCollapsed = btn.dataset.state === 'collapsed';

    if (isCollapsed) {
      // раскрыть
      grid.classList.remove('limited');
      btn.dataset.state = 'expanded';
      btn.textContent = 'Скрыть продукцию';
    } else {
      // свернуть обратно
      grid.classList.add('limited');
      btn.dataset.state = 'collapsed';
      btn.textContent = 'Показать ещё продукцию';
      // плавная прокрутка вверх к заголовку секции
      const section = btn.closest('.product-section');
      if (section) smoothScrollTo(section, 1400); // ← исправили время
    }
    return;
  }
});



// === Плавный скролл для всех ссылок меню ===
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]'); // все якорные ссылки
  if (!link) return;

  const href = link.getAttribute('href');
  if (href.length <= 1) return; // пропускаем пустые (#)

  const target = document.querySelector(href);
  if (!target) return;

  // отменяем стандартное поведение
  e.preventDefault();

  // вызываем кастомный плавный скролл
  smoothScrollTo(target, 1400);

  // если было открыто подменю — закрываем его
  const submenuWrap = link.closest('.has-submenu');
  if (submenuWrap) submenuWrap.classList.remove('open');
});


// === Разбор файлов на документы ===
async function renderDocuments() {
  const container = document.getElementById('docList');
  if (!container) return;

  const supportedExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  const folder = 'documents/';
  let files = [];

  try {
    // === 1️⃣ Пытаемся загрузить list.json ===
    const res = await fetch(folder + 'list.json');
    if (!res.ok) throw new Error('list.json not found');
    files = await res.json();
    console.log('✅ Файлы получены через list.json:', files);
  } catch (err) {
    console.warn('⚠️ fetch недоступен, переходим в офлайн-режим', err);

    // === 2️⃣ Офлайн fallback ===
    // Список возможных файлов, которые могут быть в папке
    const guesses = [
      'price.pdf', 'price2025.pdf', 'catalog.pdf', 'catalog.xlsx', 'price.docx',
      'pricelist.xlsx', 'pricelist.pdf', 'прайс.xlsx', 'прайс.pdf'
    ];

    // Проверяем, какие реально существуют (через картинки-заглушки)
    const checkExistence = await Promise.all(
      guesses.map(name =>
        new Promise(resolve => {
          const test = new Image();
          test.src = folder + name + '?_=' + Date.now();
          test.onload = () => resolve(name);
          test.onerror = () => resolve(null);
        })
      )
    );

    files = checkExistence
      .filter(Boolean)
      .map(name => ({ name, path: folder + name }));
  }

  // === 3️⃣ Если ничего не найдено ===
  if (!files || !files.length) {
    container.innerHTML = `<div class="no-docs">Прайс-лист предоставляется по запросу</div>`;
    return;
  }

  // === 4️⃣ Отображаем найденные документы ===
  container.innerHTML = files.map(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    let type = '';
    switch (ext) {
      case 'pdf': type = 'pdf'; break;
      case 'doc': case 'docx': type = 'doc'; break;
      case 'xls': case 'xlsx': type = 'xls'; break;
      case 'ppt': case 'pptx': type = 'ppt'; break;
      default: type = 'file';
    }
	console.log('🧩 file:', file.name, '→ ext:', ext);
    return `
      <a href="${file.path}" class="doc-item" data-type="${type}" download>
        <span class="doc-name">${file.name}</span>
      </a>
    `;
  }).join('');
}


document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  renderSubmenu();
  renderDocuments();
});

// === LIGHTBOX с навигацией ===
let lightboxData = { images: [], current: 0 };

document.addEventListener('click', e => {
  // --- Клик по изображению ---
  if (e.target.matches('.slide, .sub-photo, .sub-photo-small')) {
    const allImgs = [...e.target.closest('.slider, .sub-card')?.querySelectorAll('.slide, .sub-photo, .sub-photo-small') || []];
    const srcList = allImgs.map(img => img.src);
    const currentIndex = srcList.indexOf(e.target.src);

    lightboxData = { images: srcList, current: currentIndex };

   const lightbox = document.getElementById('lightbox');
const img = document.getElementById('lightbox-img');
const navPrev = lightbox.querySelector('.lightbox-nav.prev');
const navNext = lightbox.querySelector('.lightbox-nav.next');

img.src = e.target.src;
lightbox.classList.add('show');

// 👇 скрываем стрелки, если фото одно
if (srcList.length <= 1) {
  navPrev.style.display = 'none';
  navNext.style.display = 'none';
} else {
  navPrev.style.display = '';
  navNext.style.display = '';
}

  }

  // --- Закрытие lightbox ---
  if (e.target.matches('.lightbox-close') || e.target.id === 'lightbox') {
    document.getElementById('lightbox').classList.remove('show');
  }

  // --- Навигация стрелками внутри lightbox ---
  if (e.target.matches('.lightbox-nav')) {
    navigateLightbox(e.target.classList.contains('next') ? 1 : -1);
  }
});

// --- Навигация клавишами клавиатуры ---
document.addEventListener('keydown', e => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox.classList.contains('show')) return;

  if (e.key === 'Escape') {
    lightbox.classList.remove('show');
  } else if (e.key === 'ArrowRight') {
    navigateLightbox(1);
  } else if (e.key === 'ArrowLeft') {
    navigateLightbox(-1);
  }
});

// --- Функция перелистывания ---
function navigateLightbox(direction) {
  if (!lightboxData.images.length) return;

  lightboxData.current =
    (lightboxData.current + direction + lightboxData.images.length) %
    lightboxData.images.length;

  const img = document.getElementById('lightbox-img');
  img.src = lightboxData.images[lightboxData.current];
}


// === Включаем / перезапускаем анимацию футера ===
document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('footer');
  if (!footer) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Сбрасываем анимации, если уже активированы
        footer.classList.remove('visible');
        void footer.offsetWidth; // перезапуск анимации
        footer.classList.add('visible');
      } else {
        // Можно убирать класс при выходе, чтобы снова включилось при возврате
        footer.classList.remove('visible');
      }
    });
  }, { threshold: 0.4 }); // срабатывает, когда футер виден примерно на 40%

  observer.observe(footer);
});
// === Динамический год в футере ===
document.addEventListener('DOMContentLoaded', () => {
  const copyright = document.querySelector('footer .copyright');
  if (!copyright) return;

  const startYear = 2024; // первый год, фиксируем вручную
  const currentYear = new Date().getFullYear();

  if (currentYear === startYear) {
    copyright.textContent = `© ОверТоп, ${startYear}`;
  } else {
    copyright.textContent = `© ОверТоп, ${startYear}–${currentYear}`;
  }
});

// === Глобальная плавная прокрутка с контролем скорости ===
function smoothScrollTo(element, duration = 1400) {
  const targetPosition = element.getBoundingClientRect().top + window.scrollY - 80; // отступ от шапки
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  }

  requestAnimationFrame(animation);
}
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.menu');
  const toggle = document.querySelector('.menu-toggle'); // бургер
  const submenuParents = document.querySelectorAll('.has-submenu');

  if (!menu || !toggle) return; // на случай отсутствия в DOM

  // === Клик по бургеру ===
 toggle.addEventListener('click', () => {
  const isOpening = !menu.classList.contains('open');

  toggle.classList.toggle('open', isOpening);
  menu.classList.toggle('open', isOpening);

  // при открытии на мобильных — гарантируем, что подменю "Продукция" снова видно
  if (window.innerWidth <= 860) {
    const submenuParent = document.querySelector('.has-submenu');
    if (submenuParent) {
      if (isOpening) {
        submenuParent.classList.add('open');
      } else {
        submenuParent.classList.remove('open');
      }
    }
  }
});

  // === Клик по пунктам меню (включая подменю) ===
  document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', e => {
      const parent = link.closest('.has-submenu');

      // Если это "Продукция" — просто раскрываем/закрываем подменю
      if (parent && link.id === 'menuCatalog') {
        e.preventDefault();
        parent.classList.toggle('open');
        return;
      }

      // Иначе — закрываем всё меню полностью
      menu.classList.remove('open');
      toggle.classList.remove('open');
      submenuParents.forEach(p => p.classList.remove('open'));
    });
  });
});
// === СВАЙП-ПЕРЕКЛЮЧЕНИЕ ДЛЯ МОБИЛЬНЫХ СЛАЙДЕРОВ ===
document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.slider');

  sliders.forEach(slider => {
    let startX = 0;
    let endX = 0;

    slider.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchmove', e => {
      endX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', () => {
      const diff = endX - startX;
      if (Math.abs(diff) < 40) return; // минимальный порог движения

      const slides = slider.querySelectorAll('.slide');
      const dots = slider.querySelectorAll('.dot');
      let activeIndex = [...slides].findIndex(s => s.classList.contains('active'));

      // свайп влево → следующая
      if (diff < 0) activeIndex++;
      // свайп вправо → предыдущая
      else activeIndex--;

      if (activeIndex < 0) activeIndex = slides.length - 1;
      if (activeIndex >= slides.length) activeIndex = 0;

      // переключаем слайды и точки
      slides.forEach((s, i) => s.classList.toggle('active', i === activeIndex));
      dots.forEach((d, i) => d.classList.toggle('active', i === activeIndex));
    });
  });
});


