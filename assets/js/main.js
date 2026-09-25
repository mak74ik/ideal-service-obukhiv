/**
 * Комп'ютерний сервіс «Ідеал» (Обухів)
 * Інтерактивна логіка, калькулятор вартості, Web Audio haptics
 */

// 1. Web Audio Micro-Haptics (без зовнішніх mp3 файлів)
class MicroSound {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  tick() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.025);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.025);
    } catch(e) {}
  }
  thud() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch(e) {}
  }
}

const sound = new MicroSound();

document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.SITE_CONFIG || {};

  // Оновлення текстових контактів з конфігу
  updateConfigBindings(cfg);

  // Ініціалізація калькулятора
  initCalculator(cfg);

  // Модальне вікно запису
  initModal();

  // Додавання звукових ефектів на інтерактивні елементи
  initSoundEffects();

  // Плавний скрол
  initSmoothScroll();
});

function updateConfigBindings(cfg) {
  // Назва
  document.querySelectorAll('[data-bind="brandName"]').forEach(el => el.textContent = cfg.brandName || "Ідеал");
  document.querySelectorAll('[data-bind="city"]').forEach(el => el.textContent = cfg.city || "Обухів");
  document.querySelectorAll('[data-bind="address"]').forEach(el => el.textContent = cfg.address || "м. Обухів");
  
  // Телефони
  document.querySelectorAll('[data-bind="phoneDisplay"]').forEach(el => el.textContent = cfg.phoneDisplay || "+38 (000) 000-00-00");
  document.querySelectorAll('[data-bind-href="phoneRaw"]').forEach(el => {
    el.href = `tel:${cfg.phoneRaw || "+380000000000"}`;
  });

  // Telegram
  document.querySelectorAll('[data-bind-href="telegram"]').forEach(el => {
    el.href = `https://t.me/${cfg.telegramUsername || "ideal_obukhiv"}`;
  });

  // Viber
  document.querySelectorAll('[data-bind-href="viber"]').forEach(el => {
    const rawNumber = (cfg.viberNumber || "").replace(/[^0-9]/g, '');
    el.href = `viber://chat?number=%2B${rawNumber}`;
  });

  // Графік
  if (cfg.workingHours) {
    const wh = document.getElementById('workingHoursDisplay');
    if (wh) {
      wh.innerHTML = `<span>${cfg.workingHours.weekdays}</span><br><span>${cfg.workingHours.saturday}</span>`;
    }
  }

  // Ціни
  if (cfg.prices) {
    document.querySelectorAll('[data-price="cleaning"]').forEach(el => el.textContent = `${cfg.prices.cleaning} грн`);
    document.querySelectorAll('[data-price="windows"]').forEach(el => el.textContent = `${cfg.prices.windows} грн`);
    document.querySelectorAll('[data-price="upgradeSSD"]').forEach(el => el.textContent = `від ${cfg.prices.upgradeSSD} грн`);
  }
}

// Калькулятор
function initCalculator(cfg) {
  const calcItems = document.querySelectorAll('.calc-checkbox');
  const totalDisplay = document.getElementById('calcTotal');
  const selectedList = document.getElementById('calcSelectedServices');
  const sendTelegramBtn = document.getElementById('calcSendTelegram');
  const sendViberBtn = document.getElementById('calcSendViber');
  const deviceRadios = document.querySelectorAll('input[name="calcDevice"]');

  function calculate() {
    let total = 0;
    const chosen = [];
    let deviceName = "ПК / Ноутбук";

    deviceRadios.forEach(r => {
      if (r.checked) deviceName = r.dataset.name || r.value;
    });

    calcItems.forEach(item => {
      if (item.checked) {
        const price = parseInt(item.dataset.price, 10) || 0;
        const title = item.dataset.title || item.parentElement.textContent.trim();
        total += price;
        chosen.push({ title, price });
      }
    });

    if (totalDisplay) {
      totalDisplay.textContent = `${total} грн`;
    }

    if (selectedList) {
      if (chosen.length === 0) {
        selectedList.innerHTML = `<span class="text-slate-500 text-xs">Оберіть потрібні послуги зі списку вище</span>`;
      } else {
        selectedList.innerHTML = chosen.map(c => `
          <div class="flex items-center justify-between py-1 border-b border-blue-100 text-xs">
            <span class="text-slate-700 font-medium">${c.title}</span>
            <span class="font-bold text-blue-700">${c.price} грн</span>
          </div>
        `).join('');
      }
    }

    // Формування тексту для месенджерів
    const serviceListText = chosen.length > 0 
      ? chosen.map(c => `• ${c.title} (${c.price} грн)`).join('%0A')
      : "• Консультація / Діагностика";

    const msg = `Вітаю! Хочу записатись на сервіс у «Ідеал» (м. Обухів):%0AПристрій: ${encodeURIComponent(deviceName)}%0AПослуги:%0A${serviceListText}%0AОрієнтовна сума: ${total} грн.`;

    if (sendTelegramBtn) {
      sendTelegramBtn.href = `https://t.me/${cfg.telegramUsername || 'ideal_obukhiv'}?text=${msg}`;
    }

    if (sendViberBtn) {
      const rawNumber = (cfg.viberNumber || "").replace(/[^0-9]/g, '');
      sendViberBtn.href = `viber://chat?number=%2B${rawNumber}&draft=${msg}`;
    }
  }

  calcItems.forEach(item => {
    item.addEventListener('change', () => {
      sound.tick();
      calculate();
    });
  });

  deviceRadios.forEach(r => {
    r.addEventListener('change', () => {
      sound.tick();
      calculate();
    });
  });

  calculate();
}

// Модальне вікно
function initModal() {
  const modal = document.getElementById('bookingModal');
  const openBtns = document.querySelectorAll('.open-booking-modal');
  const closeBtn = document.getElementById('closeModalBtn');
  const modalForm = document.getElementById('modalForm');
  const pageForm = document.getElementById('bookingForm');
  const successState = document.getElementById('bookingSuccess');

  if (!modal) return;

  function open(servicePreset = '') {
    sound.thud();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    if (servicePreset && modalForm) {
      const serviceInput = modalForm.querySelector('[name="service"]');
      if (serviceInput) serviceInput.value = servicePreset;
    }
  }

  function close() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const preset = btn.dataset.service || '';
      open(preset);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', close);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Обробка форми на сторінці
  if (pageForm) {
    pageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.tick();
      const name = pageForm.querySelector('[name="name"]').value;
      const phone = pageForm.querySelector('[name="phone"]').value;
      const service = pageForm.querySelector('[name="service"]').value;
      
      try {
        const leads = JSON.parse(localStorage.getItem('ideal_leads') || '[]');
        leads.push({ name, phone, service, time: new Date().toISOString() });
        localStorage.setItem('ideal_leads', JSON.stringify(leads));
      } catch(err) {}

      pageForm.classList.add('hidden');
      if (successState) successState.classList.remove('hidden');

      setTimeout(() => {
        pageForm.classList.remove('hidden');
        pageForm.reset();
        if (successState) successState.classList.add('hidden');
      }, 5000);
    });
  }

  // Обробка форми у спливаючому модальному вікні
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.tick();
      const name = modalForm.querySelector('input[type="text"]').value;
      const phone = modalForm.querySelector('input[type="tel"]').value;
      const service = modalForm.querySelector('[name="service"]').value;

      try {
        const leads = JSON.parse(localStorage.getItem('ideal_leads') || '[]');
        leads.push({ name, phone, service, time: new Date().toISOString() });
        localStorage.setItem('ideal_leads', JSON.stringify(leads));
      } catch(err) {}

      modalForm.innerHTML = `
        <div class="py-6 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-xl font-bold">✓</div>
          <h4 class="text-base font-bold text-white">Заявку прийнято!</h4>
          <p class="text-xs text-slate-300">Дякуємо, ${name}. Майстер сервісу «Ідеал» зв'яжеться з вами за номером ${phone}.</p>
        </div>
      `;

      setTimeout(() => {
        close();
      }, 3000);
    });
  }
}

function initSoundEffects() {
  document.querySelectorAll('button, a.btn, input[type="radio"], input[type="checkbox"]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      // ледь чутний клік при наведенні для преміум відчуття
    });
    el.addEventListener('click', () => {
      sound.tick();
    });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
