// ======== Применение темы ========
function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  
  const singleColorThemes = [
    'ruby-fire', 'orange-sunset', 'golden-sun', 'emerald-forest', 
    'azure-sky', 'royal-indigo', 'violet-amethyst'
  ];
  const multiColorThemes = [
    'aurora-borealis', 'ocean-depths', 'tropical-sunset', 'lavender-fields',
    'spring-garden', 'copper-antique', 'arctic-aurora', 'cherry-blossom',
    'lunar-symphony', 'desert-mirage', 'neon-dreams', 'crimson-sunset'
  ];
  
  if (singleColorThemes.includes(themeName)) {
    localStorage.setItem('savedSingleColorTheme', themeName);
    localStorage.setItem('activeThemeCategory', 'single');
  } else if (multiColorThemes.includes(themeName)) {
    localStorage.setItem('savedMultiColorTheme', themeName);
    localStorage.setItem('activeThemeCategory', 'multi');
  }
  
  localStorage.setItem('savedTheme', themeName);
  
  const customSelectTrigger = document.getElementById('custom-select-trigger');
  if (customSelectTrigger) {
    const selectedOption = document.querySelector(`.custom-option[data-value="${themeName}"]`);
    if (selectedOption) {
      customSelectTrigger.querySelector('span').textContent = selectedOption.textContent;
      
      document.querySelectorAll('.custom-option.selected').forEach(el => el.classList.remove('selected'));
      selectedOption.classList.add('selected');
    }
  }
}

// ======== Сохранение имени пользователя и темы ========
function saveUsernameAndTheme(username, theme) {
  localStorage.setItem('savedUsername', username);
  localStorage.setItem('savedTheme', theme);
}

// ======== Инициализация приложения ========
function initApp() {
  const activeCategory = localStorage.getItem('activeThemeCategory');
  let savedTheme = null;
  
  if (activeCategory === 'single') {
    savedTheme = localStorage.getItem('savedSingleColorTheme');
  } else if (activeCategory === 'multi') {
    savedTheme = localStorage.getItem('savedMultiColorTheme');
  }
  
  if (!savedTheme) {
    savedTheme = localStorage.getItem('savedTheme');
  }
  
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme('violet-amethyst');
  }
}

// ======== Показать модальное окно с оверлеем ========
function showModalWithOverlay(modal) {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'block';
  modal.style.display = 'block';
}

// ======== Скрыть модальное окно с оверлеем ========
function hideModalWithOverlay(modal) {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'none';
  modal.style.display = 'none';
}

// ======== Настройка селектора тем ========
function setupThemeSelector() {
}

// ======== Настройка модальных окон ========
function setupModals() {
  const overlay = document.getElementById('modal-overlay');
  const confirmModal = document.getElementById('confirm-action-modal');
  const settingsModal = document.getElementById('settings-modal');
  const settingsButton = document.getElementById('settings-button');
  const settingsCloseButton = document.getElementById('settings-close-button');

  window.showModalWithOverlay = showModalWithOverlay;
  window.hideModalWithOverlay = hideModalWithOverlay;
  
  document.getElementById('confirm-action').addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  document.getElementById('cancel-action').addEventListener('click', function(e) {
    e.stopPropagation();
    hideModalWithOverlay(confirmModal);
  });
  
  confirmModal.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  if (settingsButton) {
    settingsButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.showSettingsModal) {
        window.showSettingsModal();
      } else {
        showModalWithOverlay(settingsModal);
      }
    });
  }

  if (settingsCloseButton) {
    settingsCloseButton.addEventListener('click', () => {
      hideModalWithOverlay(settingsModal);
    });
  }
  
  if (settingsModal) {
    settingsModal.addEventListener('click', e => e.stopPropagation());
  }
  
  overlay.addEventListener('click', function() {
    hideModalWithOverlay(confirmModal);
    if (settingsModal) {
      hideModalWithOverlay(settingsModal);
    }
  });
}


// ======== Управление локальным хранилищем ========
function loadSavedData() {
  const savedUser = localStorage.getItem('savedUser');
  if (savedUser) {
    const userInput = document.getElementById('user-input');
    if (userInput) userInput.value = savedUser;
  }
  
  const savedUsername = localStorage.getItem('savedUsername');
  if (savedUsername) {
    const usernameInput = document.getElementById('username-input');
    if (usernameInput) usernameInput.value = savedUsername;
  }
  
  const savedDisplayName = localStorage.getItem('savedDisplayName');
  if (savedDisplayName) {
    const displayNameInput = document.getElementById('display-name-input');
    if (displayNameInput) displayNameInput.value = savedDisplayName;
  }
  
  const savedServerUrl = localStorage.getItem('savedServerUrl');
  if (savedServerUrl) {
    const tunnelUrlInput = document.getElementById('tunnel-url');
    if (tunnelUrlInput) tunnelUrlInput.value = savedServerUrl;
  }
  
  const savedTheme = localStorage.getItem('savedTheme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) themeSelector.value = savedTheme;
  }
}

// ======== Настройка формы входа ========
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username-input');
  
  if (!loginForm) return;

  if (usernameInput) {
    usernameInput.addEventListener('input', function(e) {
      const value = this.value;
      const englishOnlyRegex = /^[a-zA-Z0-9_-]*$/;
      
      if (!englishOnlyRegex.test(value)) {
        this.value = value.replace(/[^a-zA-Z0-9_-]/g, '');
      }
    });
  }

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const tunnelUrl = document.getElementById('tunnel-url').value.trim();
    
    if (!username) {
      showConfirmModal("Поле не заполнено", "Пожалуйста, введите ваше имя", false);
      return;
    }
    
    if (username.length < 3 || username.length > 10) {
      showConfirmModal("Некорректное имя", "Имя должно содержать от 3 до 10 символов", false);
      return;
    }
    
    const englishOnlyRegex = /^[a-zA-Z0-9_-]+$/;
    if (!englishOnlyRegex.test(username)) {
      showConfirmModal("Некорректное имя", "Имя может содержать только английские буквы, цифры, дефис и подчеркивание", false);
      return;
    }
    
    if (!tunnelUrl) {
      showConfirmModal("Поле не заполнено", "Пожалуйста, введите URL сервера", false);
      return;
    }

    localStorage.setItem('savedUsername', username);
    localStorage.setItem('savedServerUrl', tunnelUrl);
    
    const displayNameInput = document.getElementById('display-name-input');
    if (displayNameInput) {
      localStorage.setItem('savedDisplayName', displayNameInput.value.trim());
    }

    if (typeof checkUserRights === 'function') {
      checkUserRights(username, tunnelUrl);
    }
  });
}

// ======== Интерактивный куб ========
const cube = document.querySelector('.spinner');
let rotX = 0, rotY = 0;
let autoRotX = Math.random() * 360, autoRotY = Math.random() * 360;
let isInteracting = false;
let interactTimeout;
let lastX, lastY;

function updateCube() {
  cube.style.transform = `rotateX(${rotX + autoRotX}deg) rotateY(${rotY + autoRotY}deg)`;
}

function startAutoRotate() {
  setInterval(() => {
    if (!isInteracting) {
      autoRotX += 0.5;
      autoRotY += 0.3;
      updateCube();
    }
  }, 50);
}

document.addEventListener('mousedown', (e) => {
  if (cube.parentElement.contains(e.target)) {
    isInteracting = true;
    lastX = e.clientX;
    lastY = e.clientY;
  }
});

document.addEventListener('mousemove', (e) => {
  if (!isInteracting) return;
  
  const deltaX = e.clientY - lastY;
  const deltaY = e.clientX - lastX;
  
  rotX -= deltaX * 0.5;
  rotY -= deltaY * 0.5;
  
  lastX = e.clientX;
  lastY = e.clientY;
  
  updateCube();
});

document.addEventListener('mouseup', () => {
  isInteracting = false;
});

cube.addEventListener('touchstart', (e) => {
  isInteracting = true;
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
});

cube.addEventListener('touchmove', (e) => {
  if (!isInteracting) return;
  
  const deltaX = e.touches[0].clientY - lastY;
  const deltaY = e.touches[0].clientX - lastX;
  
  rotX -= deltaX * 0.5;
  rotY -= deltaY * 0.5;
  
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
  
  updateCube();
});

cube.addEventListener('touchend', () => {
  isInteracting = false;
});

updateCube();
startAutoRotate();

// ======== Инициализация при загрузке DOM ========
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupModals();
  setupThemeSelector();
  loadSavedData();
  setupLoginForm();
  setupInteractiveCube();
  
  if (window.initNotificationSystem) {
    window.initNotificationSystem();
  }
  
  if (window.initThemeSwitcher) {
    window.initThemeSwitcher();
  }
  
  window.applyTheme = applyTheme;
}); 