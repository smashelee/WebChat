const ADMIN_PASSWORD = 'cul6768adm';
const MODERATOR_PASSWORD = 'cul7686mod';

let customTooltip = null;
let sounds = {};
let isPageVisible = true;
let bgParticlesEnabled = true;

// ======== Показать кастомную подсказку ========
function showCustomTooltip(e, text) {
  if (!customTooltip) {
    customTooltip = document.createElement('div');
    customTooltip.className = 'custom-tooltip';
    document.body.appendChild(customTooltip);
  }
  
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  
  customTooltip.textContent = text;
  customTooltip.style.left = `${mouseX}px`;
  customTooltip.style.top = `${mouseY}px`;
  customTooltip.classList.add('visible');
}

// ======== Скрыть кастомную подсказку ========
function hideCustomTooltip() {
  if (customTooltip) {
    customTooltip.classList.remove('visible');
  }
}

// ======== Закрыть все модальные окна ========
function closeAllModals() {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'none';
  const modals = [
    document.getElementById('confirm-action-modal'),
    document.getElementById('admin-confirm-modal'),
    document.getElementById('moderator-confirm-modal'),
    document.getElementById('attach-modal')
  ];
  modals.forEach(modal => {
    if (modal) modal.style.display = 'none';
  });
  const confirmModal = document.getElementById('confirm-action-modal');
  const progress = document.getElementById('confirm-progress-container');
  if (confirmModal && progress && progress.parentNode === confirmModal) {
    progress.remove();
  }
}

// ======== Показать модальное окно подтверждения ========
function showConfirmModal(title, message, showCancel = true, confirmCallback = null, keepOtherModals = false) {
  if (!keepOtherModals) {
    closeAllModals();
  }
  setTimeout(() => {
    const modal = document.getElementById('confirm-action-modal');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('cancel-action');
    const confirmBtn = document.getElementById('confirm-action');
    const overlay = document.getElementById('modal-overlay');
    const existingProgress = document.getElementById('confirm-progress-container');
    if (existingProgress && existingProgress.parentNode === modal) {
      existingProgress.remove();
    }
    
    if (!keepOtherModals) {
      overlay.style.display = 'block';
    }
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    cancelBtn.style.display = showCancel ? 'block' : 'none';
    confirmBtn.style.display = 'block';
    
    const closeModal = () => {
       modal.style.display = 'none';
       if (!keepOtherModals) {
         overlay.style.display = 'none';
       }
       cancelBtn.removeEventListener('click', closeModal);
       confirmBtn.removeEventListener('click', handleConfirm);
       overlay.removeEventListener('click', closeModal);
     };
    
    const handleConfirm = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (confirmCallback) {
        confirmCallback();
      }
      closeModal();
    };
    
    modal.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    cancelBtn.removeEventListener('click', closeModal);
    confirmBtn.removeEventListener('click', handleConfirm);
    overlay.removeEventListener('click', closeModal);
    
    overlay.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', handleConfirm);
    
    if (!keepOtherModals) {
      overlay.style.display = 'block';
    }
    modal.style.display = 'block';
  }, 0);
}

// ======== Показать модалку с прогресс-баром (без кнопок) ========
function showProgressConfirmModal(title = 'Отправка', message = 'Подготовка файлов...') {
  closeAllModals();
  setTimeout(() => {
    const modal = document.getElementById('confirm-action-modal');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('cancel-action');
    const confirmBtn = document.getElementById('confirm-action');
    const overlay = document.getElementById('modal-overlay');

    titleEl.textContent = title;
    messageEl.textContent = message;

    cancelBtn.style.display = 'none';
    confirmBtn.style.display = 'none';

    const cleanupOverlay = (e) => e.stopPropagation();
    overlay.addEventListener('click', cleanupOverlay, { once: true });

    let progressContainer = document.getElementById('confirm-progress-container');
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.id = 'confirm-progress-container';
      progressContainer.style.cssText = 'margin: 14px 0 4px 0; width: 100%;';

      const barBg = document.createElement('div');
      barBg.id = 'confirm-progress-bg';
      barBg.style.cssText = 'width: 100%; height: 8px; background: rgba(255,255,255,0.15); border-radius: 6px; overflow: hidden;';

      const bar = document.createElement('div');
      bar.id = 'confirm-progress-bar';
      bar.style.cssText = 'width: 0%; height: 100%; background: var(--accent-color); transition: width 0.2s ease;';
      barBg.appendChild(bar);

      const label = document.createElement('div');
      label.id = 'confirm-progress-label';
      label.style.cssText = 'margin-top: 6px; font-size: 12px; color: var(--text-secondary); text-align: right;';
      label.textContent = '0%';

      progressContainer.appendChild(barBg);
      progressContainer.appendChild(label);

      const actions = modal.querySelector('.confirm-actions');
      modal.insertBefore(progressContainer, actions);
    } else {
      const bar = document.getElementById('confirm-progress-bar');
      const label = document.getElementById('confirm-progress-label');
      if (bar) bar.style.width = '0%';
      if (label) label.textContent = '0%';
    }

    overlay.style.display = 'block';
    modal.style.display = 'block';
  }, 0);
}

// ======== Обновить прогресс в модалке ========
function updateProgressConfirmModal(percent = 0, text = '') {
  const bar = document.getElementById('confirm-progress-bar');
  const label = document.getElementById('confirm-progress-label');
  const safe = Math.max(0, Math.min(100, Math.round(percent)));
  if (bar) bar.style.width = safe + '%';
  if (label) label.textContent = text ? text : safe + '%';
}

// ======== Закрыть модалку прогресса ========
function closeProgressConfirmModal() {
  const modal = document.getElementById('confirm-action-modal');
  const overlay = document.getElementById('modal-overlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
  const existingProgress = document.getElementById('confirm-progress-container');
  if (existingProgress && existingProgress.parentNode === modal) {
    existingProgress.remove();
  }
}

window.showProgressConfirmModal = showProgressConfirmModal;
window.updateProgressConfirmModal = updateProgressConfirmModal;
window.closeProgressConfirmModal = closeProgressConfirmModal;

// ======== Показать модальное окно прикрепления файлов ========
function showAttachModal(title = "Прикрепить файл", message = "Выберите действие для прикрепления файлов", showCancel = true, confirmCallback = null, keepOtherModals = false) {
  if (!keepOtherModals) {
    closeAllModals();
  }
  const confirmModal = document.getElementById('confirm-action-modal');
  const progress = document.getElementById('confirm-progress-container');
  if (confirmModal && progress && progress.parentNode === confirmModal) {
    progress.remove();
  }
  setTimeout(() => {
    const modal = document.getElementById('attach-modal');
    const titleEl = document.getElementById('attach-title');
    const messageEl = document.getElementById('attach-message');
    const cancelBtn = document.getElementById('attach-cancel-button');
    const confirmBtn = document.getElementById('attach-file-button');
    const overlay = document.getElementById('modal-overlay');
    
    if (!keepOtherModals) {
      overlay.style.display = 'block';
    }
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    cancelBtn.style.display = showCancel ? 'block' : 'none';
    
    const closeModal = () => {
      modal.style.display = 'none';
      if (!keepOtherModals) {
        overlay.style.display = 'none';
      }
      cancelBtn.removeEventListener('click', closeModal);
      confirmBtn.removeEventListener('click', handleConfirm);
      overlay.removeEventListener('click', closeModal);
    };
    
    const handleConfirm = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (confirmCallback) {
        confirmCallback();
      } else {
        attachFile();
      }
      closeModal();
    };
    
    modal.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    cancelBtn.removeEventListener('click', closeModal);
    confirmBtn.removeEventListener('click', handleConfirm);
    overlay.removeEventListener('click', closeModal);
    
    overlay.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', handleConfirm);
    
    if (!keepOtherModals) {
      overlay.style.display = 'block';
    }
    modal.style.display = 'block';
  }, 0);
}

// ======== Показать модальное окно подтверждения администратора ========
function showAdminConfirmModal(confirmCallback) {
  closeAllModals();
  const confirmModal = document.getElementById('confirm-action-modal');
  const progress = document.getElementById('confirm-progress-container');
  if (confirmModal && progress && progress.parentNode === confirmModal) {
    progress.remove();
  }
  setTimeout(() => {
    const modal = document.getElementById('admin-confirm-modal');
    const passwordInput = document.getElementById('admin-password-input');
    const cancelBtn = document.getElementById('admin-cancel-action');
    const confirmBtn = document.getElementById('admin-confirm-action');
    const overlay = document.getElementById('modal-overlay');

    overlay.style.display = 'block';

    passwordInput.value = '';

    const closeModal = () => {
      modal.style.display = 'none';
      overlay.style.display = 'none';
      cancelBtn.removeEventListener('click', closeModal);
      confirmBtn.removeEventListener('click', handleConfirm);
      passwordInput.removeEventListener('keydown', keydownHandler);
      overlay.removeEventListener('click', closeModal);
    };

    const handleConfirm = () => {
      const password = passwordInput.value;
      if (password === ADMIN_PASSWORD) {
        if (confirmCallback) {
          confirmCallback(password);
        }
        closeModal();
      } else {
        closeModal();
        showConfirmModal("Неверный пароль", "Вы ввели неверный пароль администратора.", false);
      }
    };
    
    const keydownHandler = (e) => {
      if (e.key === 'Enter') {
        handleConfirm();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    cancelBtn.removeEventListener('click', closeModal);
    confirmBtn.removeEventListener('click', handleConfirm);
    passwordInput.removeEventListener('keydown', keydownHandler);
    overlay.removeEventListener('click', closeModal);

    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', handleConfirm);
    passwordInput.addEventListener('keydown', keydownHandler);
    overlay.addEventListener('click', closeModal);

    overlay.style.display = 'block';
    modal.style.display = 'block';
    passwordInput.focus();
  }, 0);
}

// ======== Показать модальное окно подтверждения модератора ========
function showModeratorConfirmModal(confirmCallback) {
  closeAllModals();
  const confirmModal = document.getElementById('confirm-action-modal');
  const progress = document.getElementById('confirm-progress-container');
  if (confirmModal && progress && progress.parentNode === confirmModal) {
    progress.remove();
  }
  setTimeout(() => {
    const modal = document.getElementById('moderator-confirm-modal');
    const passwordInput = document.getElementById('moderator-password-input');
    const cancelBtn = document.getElementById('moderator-cancel-action');
    const confirmBtn = document.getElementById('moderator-confirm-action');
    const overlay = document.getElementById('modal-overlay');

    overlay.style.display = 'block';

    passwordInput.value = '';

    const closeModal = () => {
      modal.style.display = 'none';
      overlay.style.display = 'none';
      cancelBtn.removeEventListener('click', closeModal);
      confirmBtn.removeEventListener('click', handleConfirm);
      passwordInput.removeEventListener('keydown', keydownHandler);
      overlay.removeEventListener('click', closeModal);
    };

    const handleConfirm = () => {
      const password = passwordInput.value;
      if (password === MODERATOR_PASSWORD) {
        if (confirmCallback) {
          confirmCallback(password);
        }
        closeModal();
      } else {
        closeModal();
        showConfirmModal("Неверный пароль", "Вы ввели неверный пароль модератора.", false);
      }
    };
    
    const keydownHandler = (e) => {
      if (e.key === 'Enter') {
        handleConfirm();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    cancelBtn.removeEventListener('click', closeModal);
    confirmBtn.removeEventListener('click', handleConfirm);
    passwordInput.removeEventListener('keydown', keydownHandler);
    overlay.removeEventListener('click', closeModal);

    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', handleConfirm);
    passwordInput.addEventListener('keydown', keydownHandler);
    overlay.addEventListener('click', closeModal);

    overlay.style.display = 'block';
    modal.style.display = 'block';
    passwordInput.focus();
  }, 0);
}

// ======== Создать уведомление-тост ========
function createNotificationToast(message) {
  if (document.getElementById('login-form') && document.getElementById('login-form').style.display !== 'none') {
    return;
  }
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .notification-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 300px;
        background-color: var(--card-background);
        border-left: 3px solid var(--accent-color);
        padding: 12px 15px;
        border-radius: 6px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        z-index: 1000;
        color: var(--text-color);
        opacity: 0.9;
        transition: opacity 0.3s ease;
      }
      .notification-toast.mobile {
        right: auto;
        left: 50%;
        transform: translateX(-50%);
      }
    `;
    document.head.appendChild(style);
  }

  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.zIndex = '1000';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    document.body.appendChild(toastContainer);
  }

  const existingToasts = document.querySelectorAll('.notification-toast');
  existingToasts.forEach(t => {
    if (t.textContent === message) t.remove();
  });

  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.textContent = message;

  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    toast.classList.add('mobile');
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
  } else {
    const countToasts = document.querySelectorAll('.notification-toast:not(.mobile)').length;
    toast.style.position = 'fixed';
    toast.style.top = `${20 + countToasts * 70}px`;
    toast.style.right = '20px';
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);

  return toast;
}

// ======== Создать тост активности пользователя ========
function createUserActivityToast(user, action) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'notification-toast user-activity';

    const avatar = document.createElement('img');
    avatar.src = 'public/' + (user && user.avatar ? user.avatar : 'Images/user.png');
    avatar.className = 'toast-avatar';
    avatar.onerror = function() {
      this.src = 'public/Images/user.png';
    };
    toast.appendChild(avatar);

    const text = document.createElement('span');
    text.style.display = 'inline-flex';
    text.style.alignItems = 'center';
    text.style.gap = '6px';
    text.style.flexWrap = 'wrap';

    const nameWrapper = document.createElement('span');
    nameWrapper.textContent = user && (user.displayName || user.username) ? (user.displayName || user.username) : 'Пользователь';
    nameWrapper.classList.add('toast-name');
    nameWrapper.style.display = 'inline-flex';
    nameWrapper.style.alignItems = 'center';
    nameWrapper.style.gap = '4px';
    nameWrapper.style.whiteSpace = 'nowrap';

    try {
      if (user && user.isAdmin && typeof addAdminBadge === 'function') {
        addAdminBadge(nameWrapper);
      } else if (user && user.isModerator && typeof addModeratorBadge === 'function') {
        addModeratorBadge(nameWrapper);
      } else if (user && user.isPremium && typeof addPremiumBadge === 'function') {
        addPremiumBadge(nameWrapper);
      }
    } catch (_) {}

    const actionSpan = document.createElement('span');
    actionSpan.className = 'toast-action';
    if (action === 'joined') {
      actionSpan.textContent = ' присоединился к чату';
    } else if (action === 'left') {
      actionSpan.textContent = ' покинул чат';
    } else if (typeof action === 'string' && action.trim()) {
      actionSpan.textContent = ' ' + action.trim();
    } else {
      actionSpan.textContent = '';
    }

    text.appendChild(nameWrapper);
    text.appendChild(actionSpan);
    toast.appendChild(text);

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ======== Переключение категорий тем ========
let themeSwitcherInitialized = false;

function initThemeSwitcher() {
  const singleColorBtn = document.getElementById('single-color-btn');
  const multiColorBtn = document.getElementById('multi-color-btn');
  const customOptions = document.getElementById('custom-options');
  const customSelectTrigger = document.getElementById('custom-select-trigger');
  const customSelect = document.getElementById('custom-select');
  
  if (!singleColorBtn || !multiColorBtn || !customOptions || !customSelectTrigger || !customSelect) {
    return;
  }
  
  if (themeSwitcherInitialized) {
    return;
  }
  
  const singleColorThemes = [
    { value: 'ruby-fire', text: '🔴 Рубиновый огонь' },
    { value: 'orange-sunset', text: '🟠 Оранжевый закат' },
    { value: 'golden-sun', text: '🟡 Золотое солнце' },
    { value: 'jade-valley', text: '🟢 Эфирная долина' },
    { value: 'malachite-depths', text: '🟩 Малахитовые глубины' },
    { value: 'azure-sky', text: '🔵 Лазурное небо' },
    { value: 'royal-indigo', text: '🟣 Королевский индиго' },
    { value: 'violet-amethyst', text: '💜 Аметистовый фиолет' },
  ];
  
  const multiColorThemes = [
    { value: 'aurora-borealis', text: '🦄 Северное сияние' },
    { value: 'ocean-depths', text: '🌊 Глубины океана' },
    { value: 'tropical-sunset', text: '🌺 Тропический закат' },
    { value: 'lavender-fields', text: '🌸 Лавандовые поля' },
    { value: 'spring-garden', text: '🌱 Весенний сад' },
    { value: 'copper-antique', text: '🥉 Медная старина' },
    { value: 'arctic-aurora', text: '❄️ Арктическое сияние' },
    { value: 'cherry-blossom', text: '🌸 Цветущая сакура' },
    { value: 'lunar-symphony', text: '🌙 Лунная симфония' },
    { value: 'desert-mirage', text: '🏜️ Пустынная мираж' },
    { value: 'neon-dreams', text: '💭 Неоновые сны' },
    { value: 'crimson-sunset', text: '💋 Малиновый закат' },
  ];
  
  function updateThemeList(themes, category) {
    customOptions.innerHTML = '';
    themes.forEach(theme => {
      const option = document.createElement('div');
      option.className = 'custom-option';
      option.setAttribute('data-value', theme.value);
      option.textContent = theme.text;
      customOptions.appendChild(option);
    });
    
    if (themes.length > 0) {
      const savedThemeKey = category === 'single' ? 'savedSingleColorTheme' : 'savedMultiColorTheme';
      const savedTheme = localStorage.getItem(savedThemeKey);
      const currentTheme = themes.find(theme => theme.value === savedTheme);
      
      if (currentTheme) {
        customSelectTrigger.querySelector('span').textContent = currentTheme.text;
        applyTheme(currentTheme.value);
      } else {
        customSelectTrigger.querySelector('span').textContent = themes[0].text;
        applyTheme(themes[0].value);
      }
    }
  }
  
  function applyTheme(themeValue) {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', themeValue);
    
    const isSingleColor = singleColorThemes.some(theme => theme.value === themeValue);
    const isMultiColor = multiColorThemes.some(theme => theme.value === themeValue);
    
    if (isSingleColor) {
      localStorage.setItem('savedSingleColorTheme', themeValue);
    } else if (isMultiColor) {
      localStorage.setItem('savedMultiColorTheme', themeValue);
    }
    
    localStorage.setItem('savedTheme', themeValue);
    
    const customSelectTrigger = document.getElementById('custom-select-trigger');
    if (customSelectTrigger) {
      const selectedOption = document.querySelector(`.custom-option[data-value="${themeValue}"]`);
      if (selectedOption) {
        customSelectTrigger.querySelector('span').textContent = selectedOption.textContent;
      }
    }
  }
  
  function switchToSingleColor() {
    singleColorBtn.classList.add('active');
    multiColorBtn.classList.remove('active');
    localStorage.setItem('activeThemeCategory', 'single');
    updateThemeList(singleColorThemes, 'single');
  }
  
  function switchToMultiColor() {
    multiColorBtn.classList.add('active');
    singleColorBtn.classList.remove('active');
    localStorage.setItem('activeThemeCategory', 'multi');
    updateThemeList(multiColorThemes, 'multi');
  }
  
  function loadSavedTheme() {
    const activeCategory = localStorage.getItem('activeThemeCategory');
    
    if (activeCategory === 'single') {
      switchToSingleColor();
      return true;
    } else if (activeCategory === 'multi') {
      switchToMultiColor();
      return true;
    }
    
    const savedTheme = localStorage.getItem('savedTheme');
    if (savedTheme) {
      const singleColorIndex = singleColorThemes.findIndex(theme => theme.value === savedTheme);
      if (singleColorIndex !== -1) {
        switchToSingleColor();
        customSelectTrigger.querySelector('span').textContent = singleColorThemes[singleColorIndex].text;
        applyTheme(savedTheme);
        return true;
      }
      
      const multiColorIndex = multiColorThemes.findIndex(theme => theme.value === savedTheme);
      if (multiColorIndex !== -1) {
        switchToMultiColor();
        customSelectTrigger.querySelector('span').textContent = multiColorThemes[multiColorIndex].text;
        applyTheme(savedTheme);
        return true;
      }
    }
    return false;
  }
  
  function setActiveCategoryButtons() {
    const activeCategory = localStorage.getItem('activeThemeCategory');
    if (activeCategory === 'multi') {
      singleColorBtn.classList.remove('active');
      multiColorBtn.classList.add('active');
    } else {
      singleColorBtn.classList.add('active');
      multiColorBtn.classList.remove('active');
    }
  }
  
  function toggleDropdown() {
    customSelect.classList.toggle('open');
  }
  
  function handleOptionClick(e) {
    if (e.target.classList.contains('custom-option')) {
      const themeValue = e.target.getAttribute('data-value');
      const themeText = e.target.textContent;
      
      customSelectTrigger.querySelector('span').textContent = themeText;
      applyTheme(themeValue);
      customSelect.classList.remove('open');
    }
  }
  
  function preventScrollBlocking(e) {
    if (e.target.closest('.custom-options')) {
      e.stopPropagation();
    }
  }
  
  function handleOutsideClick(e) {
    if (!customSelect.contains(e.target)) {
      customSelect.classList.remove('open');
    }
  }
  
  singleColorBtn.addEventListener('click', switchToSingleColor);
  multiColorBtn.addEventListener('click', switchToMultiColor);
  customSelectTrigger.addEventListener('click', toggleDropdown);
  customOptions.addEventListener('click', handleOptionClick);
  document.addEventListener('click', handleOutsideClick);
  
  customOptions.addEventListener('touchstart', preventScrollBlocking, { passive: true });
  customOptions.addEventListener('touchmove', preventScrollBlocking, { passive: true });
  customOptions.addEventListener('touchend', preventScrollBlocking, { passive: true });
  
  if (!loadSavedTheme()) {
    switchToSingleColor();
    const amethystIndex = singleColorThemes.findIndex(theme => theme.value === 'violet-amethyst');
    if (amethystIndex !== -1) {
      customSelectTrigger.querySelector('span').textContent = singleColorThemes[amethystIndex].text;
      applyTheme('violet-amethyst');
    }
  }
  
  setActiveCategoryButtons();
  
  themeSwitcherInitialized = true;

  setupBackgroundParticlesSwitch();
}

// ======== Переключатель фоновых частиц (чекбокс) ========
function setupBackgroundParticlesSwitch() {
  const checkbox = document.getElementById('uv-checkbox');
  if (!checkbox) return;

  const saved = localStorage.getItem('bgParticlesEnabled');
  bgParticlesEnabled = saved === null ? true : saved === 'true';

  const applyState = () => {
    checkbox.checked = bgParticlesEnabled;
    checkbox.disabled = false;
    
    const existingHint = checkbox.closest('label')?.querySelector('.mobile-disabled-hint');
    if (existingHint) {
      existingHint.remove();
    }

    if (window.ParticlesBackground) {
      if (bgParticlesEnabled) {
        window.ParticlesBackground.start?.();
      } else {
        window.ParticlesBackground.stop?.();
        window.ParticlesBackground.redrawStatic?.();
        const canvas = document.getElementById('bg-canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  };

  const syncWithActualState = () => {
    const saved = localStorage.getItem('bgParticlesEnabled');
    bgParticlesEnabled = saved === null ? true : saved === 'true';
    applyState();
  };

  applyState();

  checkbox.addEventListener('change', () => {
    bgParticlesEnabled = checkbox.checked;
    localStorage.setItem('bgParticlesEnabled', String(bgParticlesEnabled));
    applyState();
  });
}


document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  setupBackgroundParticlesSwitch();
});

function showSettingsModal() {
  initThemeSwitcher();
  
  const checkbox = document.getElementById('uv-checkbox');
  if (checkbox) {
    const saved = localStorage.getItem('bgParticlesEnabled');
    const particlesEnabled = saved === null ? true : saved === 'true';
    checkbox.checked = particlesEnabled;
  }
  
  const settingsModal = document.getElementById('settings-modal');
  const overlay = document.getElementById('modal-overlay');
  const confirmModal = document.getElementById('confirm-action-modal');
  const progress = document.getElementById('confirm-progress-container');
  if (confirmModal && progress && progress.parentNode === confirmModal) {
    progress.remove();
  }
  
  if (settingsModal && overlay) {
    overlay.style.display = 'block';
    settingsModal.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.addEventListener('click', function() {
      showSettingsModal();  
    });
  }
  
  const settingsCloseButton = document.getElementById('settings-close-button');
  if (settingsCloseButton) {
    settingsCloseButton.addEventListener('click', function() {
      const settingsModal = document.getElementById('settings-modal');
      const overlay = document.getElementById('modal-overlay');
      
      if (settingsModal && overlay) {
        settingsModal.style.display = 'none';
        overlay.style.display = 'none';
      }
    });
  }
  
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', function() {
      const settingsModal = document.getElementById('settings-modal');
      if (settingsModal) {
        settingsModal.style.display = 'none';
        overlay.style.display = 'none';
      }
    });
  }
}); 

// ======== Инициализация звуков ========
function initSounds() {
  try {
    sounds.elegant = new Audio('public/sounds/elegant.ogg');
    sounds.times = new Audio('public/sounds/times.ogg');
    sounds.cheer = new Audio('public/sounds/cheer.ogg');
    sounds.light = new Audio('public/sounds/light.ogg');
    sounds.nowhere = new Audio('public/sounds/nowhere.ogg');
    sounds.swift = new Audio('public/sounds/swift.ogg');
    
    Object.values(sounds).forEach(sound => {
      sound.load();
      sound.volume = 0.5;
    });
  } catch (error) {
    console.warn('Не удалось загрузить звуки:', error);
  }
}

// ======== Универсальная функция проигрывания звука ========
function playSound(soundName) {
  const sound = sounds[soundName];
  if (!sound) {
    console.warn(`Звук "${soundName}" не найден`);
    return;
  }
  
  try {
    sound.currentTime = 0;
    sound.play().catch(error => {
      console.warn(`Не удалось проиграть звук ${soundName}:`, error);
    });
  } catch (error) {
    console.warn(`Ошибка при воспроизведении звука ${soundName}:`, error);
  }
}

// ======== Проверить видимость страницы ========
function checkPageVisibility() {
  isPageVisible = !document.hidden;
}

// ======== Показать уведомление о новом сообщении ========
function showNewMessageNotification(message, username) {
  if (document.hidden) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Новое сообщение в YoGo', {
        body: `${username}: ${message}`,
        icon: 'public/Images/frame.png',
        badge: 'public/Images/frame.png',
        tag: 'yogo-message',
        requireInteraction: false,
        silent: false
      });
      
      setTimeout(() => {
        notification.close();
      }, 5000);
      
      notification.onclick = function() {
        window.focus();
        notification.close();
      };
    }
  }
}

// ======== Запросить разрешение на уведомления ========
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        createNotificationToast('Уведомления включены');
      } else {
        createNotificationToast('Уведомления отключены');
      }
    });
  }
}

// ======== Инициализация системы уведомлений ========
function initNotificationSystem() {
  initSounds();
  
  document.addEventListener('visibilitychange', checkPageVisibility);
  
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => {
      requestNotificationPermission();
    }, 1000);
  }
}

// ======== Экспорт функций для использования в других файлах ========
window.playSound = playSound;
window.showNewMessageNotification = showNewMessageNotification;
window.initNotificationSystem = initNotificationSystem;
window.initThemeSwitcher = initThemeSwitcher;
window.showSettingsModal = showSettingsModal;
window.showLoadingModal = showLoadingModal;
window.hideLoadingModal = hideLoadingModal; 