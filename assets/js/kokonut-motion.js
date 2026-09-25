/**
 * Рушій 3-рівневої біжучої стрічки відгуків (120 FPS) та анімації теми у вигляді розтікання краплі
 * «Ідеал» ремонт комп'ютерної техніки (м. Обухів)
 * ЗВУКИ ПОВНІСТЮ ВИМКНЕНО. БЕЗ ЕМОДЗІ.
 */

document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.SITE_CONFIG || {};
  bindConfig(cfg);
  renderThreeLineMarquee();
  initThemeToggle();
});

function initThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');
  const iconMoon = document.getElementById('themeIconMoon');
  const iconSun = document.getElementById('themeIconSun');
  const textLabel = document.getElementById('themeToggleText');
  
  if (!btn) return;

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      if (iconMoon) iconMoon.classList.add('hidden');
      if (iconSun) iconSun.classList.remove('hidden');
      if (textLabel) textLabel.textContent = 'Світла тема';
      try { localStorage.setItem('ideal_theme', 'dark'); } catch(e) {}
    } else {
      document.documentElement.classList.remove('dark');
      if (iconMoon) iconMoon.classList.remove('hidden');
      if (iconSun) iconSun.classList.add('hidden');
      if (textLabel) textLabel.textContent = 'Темна тема';
      try { localStorage.setItem('ideal_theme', 'light'); } catch(e) {}
    }
  }

  // Ініціалізація теми при завантаженні (без анімації)
  let saved = null;
  try { saved = localStorage.getItem('ideal_theme'); } catch(e) {}
  
  if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    applyTheme(true);
  } else {
    applyTheme(false);
  }

  // Клік з плавною 120 FPS анімацією краплі, що розтікається по сайту
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    const isDark = document.documentElement.classList.contains('dark');
    const targetDark = !isDark;

    if (!document.startViewTransition) {
      applyTheme(targetDark);
      return;
    }

    const rect = btn.getBoundingClientRect();
    const x = event.clientX || (rect.left + rect.width / 2);
    const y = event.clientY || (rect.top + rect.height / 2);

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      applyTheme(targetDark);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 650,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  });
}

function bindConfig(cfg) {
  document.querySelectorAll('[data-bind="brandName"]').forEach(el => el.textContent = cfg.brandName || "Ідеал");
  document.querySelectorAll('[data-bind="city"]').forEach(el => el.textContent = cfg.city || "Обухів");
  document.querySelectorAll('[data-bind="address"]').forEach(el => el.textContent = cfg.address || "Київська область, м. Обухів, вул. Київська, 113/3");
  document.querySelectorAll('[data-bind="phoneDisplay"]').forEach(el => el.textContent = cfg.phoneDisplay || "098-552-05-00");
  document.querySelectorAll('[data-bind="rating"]').forEach(el => el.textContent = cfg.rating || "4.7");

  document.querySelectorAll('[data-bind-href="phoneRaw"]').forEach(el => el.href = `tel:${cfg.phoneRaw || "+380985520500"}`);
  document.querySelectorAll('[data-bind-href="viber"]').forEach(el => {
    const num = (cfg.viberNumber || "+380985520500").replace(/[^0-9]/g, '');
    el.href = `viber://chat?number=%2B${num}`;
  });
  document.querySelectorAll('[data-bind-href="telegram"]').forEach(el => {
    el.href = `https://t.me/${cfg.telegramUsername || "ideal_obukhiv"}`;
  });
}

// Рендеринг 3 ліній відгуків (без зникнень, безперервний цикл)
function renderThreeLineMarquee() {
  const reviews = window.REVIEWS_DATA || [];
  if (reviews.length === 0) return;

  const row1El = document.getElementById('marqueeRow1');
  const row2El = document.getElementById('marqueeRow2');
  const row3El = document.getElementById('marqueeRow3');

  if (!row1El || !row2El || !row3El) return;

  const part1 = reviews.slice(0, 17);
  const part2 = reviews.slice(17, 34);
  const part3 = reviews.slice(34);

  function getStarsString(r) {
    if (r === 5) return '★★★★★';
    if (r === 4) return '★★★★☆';
    if (r === 3) return '★★★☆☆';
    return '★★★★★';
  }

  function createCardHTML(r) {
    const avatarHTML = r.avatar
      ? `<img src="${r.avatar}" alt="${r.name}" class="w-9 h-9 rounded-full object-cover border border-amber-200 dark:border-slate-700 shrink-0">`
      : `<div class="w-9 h-9 rounded-full ${r.color || 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'} font-bold flex items-center justify-center text-xs shrink-0 border border-amber-200 dark:border-slate-700">${r.initials || 'К'}</div>`;

    const bodyText = r.text && r.text.trim().length > 0
      ? `<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">${r.text}</p>`
      : `<p class="text-xs text-slate-400 italic">Оцінка без письмового коментаря</p>`;

    return `
      <div class="review-card shrink-0 w-[290px] sm:w-[320px] p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              ${avatarHTML}
              <div>
                <div class="text-xs font-bold text-slate-900 dark:text-white leading-tight">${r.name}</div>
                <div class="text-[10px] text-amber-800 dark:text-amber-400 font-medium">${r.tag}</div>
              </div>
            </div>
            <div class="text-amber-500 text-xs font-semibold tracking-tighter">
              ${getStarsString(r.rating)}
            </div>
          </div>
          ${bodyText}
        </div>
        <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>Google відгук</span>
          <span>${r.time}</span>
        </div>
      </div>
    `;
  }

  function fillRow(container, list) {
    const htmlCards = list.map(createCardHTML).join('');
    // Повторюємо 4 рази для безшовного 120 FPS скролу без пробілів
    container.innerHTML = htmlCards + htmlCards + htmlCards + htmlCards;
  }

  fillRow(row1El, part1);
  fillRow(row2El, part2);
  fillRow(row3El, part3);
}
