function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  
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

function saveUsernameAndTheme(username, theme) {
  localStorage.setItem('savedUsername', username);
  localStorage.setItem('savedTheme', theme);
}

function initApp() {
  const savedTheme = localStorage.getItem('savedTheme');
  
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme('violet-amethyst');
  }
}

function showModalWithOverlay(modal) {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'block';
  modal.style.display = 'block';
}

function hideModalWithOverlay(modal) {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'none';
  modal.style.display = 'none';
}

function setupThemeSelector() {
}

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

const cube = document.querySelector('.spinner');
let rotX = 0, rotY = 0;
let autoRotX = Math.random() * 360, autoRotY = Math.random() * 360;
let isInteracting = false;
let interactTimeout;
let lastX, lastY;

let startRotX = 0, startRotY = 0;
let startMouseX = 0, startMouseY = 0;

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
    
    startRotX = rotX;
    startRotY = rotY;
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    
    e.preventDefault();
  }
});

document.addEventListener('mousemove', (e) => {
  if (!isInteracting) return;
  
  const totalDeltaX = e.clientX - startMouseX;
  const totalDeltaY = e.clientY - startMouseY;
  
  rotX = startRotX - totalDeltaY * 0.5;
  rotY = startRotY + totalDeltaX * 0.5;
  
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
  
  startRotX = rotX;
  startRotY = rotY;
  startMouseX = e.touches[0].clientX;
  startMouseY = e.touches[0].clientY;
  
  e.preventDefault(); 
}, { passive: false });

cube.addEventListener('touchmove', (e) => {
  if (!isInteracting) return;
  
  const totalDeltaX = e.touches[0].clientX - startMouseX;
  const totalDeltaY = e.touches[0].clientY - startMouseY;
  
  rotX = startRotX - totalDeltaY * 0.5;
  rotY = startRotY + totalDeltaX * 0.5;
  
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
  
  e.preventDefault();
  updateCube();
}, { passive: false });

cube.addEventListener('touchend', () => {
  isInteracting = false;
}, { passive: false });

updateCube();
startAutoRotate();

function setupEasterEgg() {
  const formTitle = document.querySelector('.formTitle');
  if (formTitle) {
    formTitle.style.cursor = 'pointer';
    let clickCount = 0;
    let resetTimeout = null;
    
    formTitle.addEventListener('click', () => {
      clickCount++;
      
      if (resetTimeout) {
        clearTimeout(resetTimeout);
      }
      
      if (clickCount === 5) {
        const easterEggFound = localStorage.getItem('easterEggFound');
        if (easterEggFound) {
          if (window.createInfoCard) {
            window.createInfoCard(
              '🎉 Пасхалка найдена!',
              'Вы уже находили эту пасхалку ранее!',
              '<div style="text-align: center; margin: 20px 0;">' +
              '<p>🌟 Аватар уже был добавлен в вашу коллекцию!</p>' +
              '<p>💎 Проверьте свои специальные аватары после входа в чат!</p>' +
              '<div style="font-size: 2em; margin: 15px 0;">🎊 🎈 🎁</div>' +
              '</div>'
            );
          }
          clickCount = 0;
          return;
        }
        
        localStorage.setItem('easterEggFound', 'true');
        localStorage.setItem('easterEggReward', 'Images/Avatars/Special/35.png');
        
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
          window.socket.send(JSON.stringify({
            event: 'easterEggFound',
            data: {}
          }));
        }
        
        if (window.createInfoCard) {
          window.createInfoCard(
            '🎉 Пасхалка найдена!',
            'Поздравляем! Вы нашли скрытую пасхалку в WebChat!',
            '<div style="text-align: center; margin: 20px 0;">' +
            '<p>🌟 Это секретная функция, которую мы спрятали для любопытных пользователей!</p>' +
            '<p>💡 Вы кликнули ровно 5 раз подряд - это и есть секрет!</p>' +
            '<p>🎯 Проверьте свои аватары - возможно, вы получили награду!</p>' +
            '<div style="font-size: 2em; margin: 15px 0;">🎊 🎈 🎁</div>' +
            '</div>'
          );
        }
        clickCount = 0;
      } else {
        resetTimeout = setTimeout(() => {
          clickCount = 0;
        }, 1000);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupModals();
  setupThemeSelector();
  loadSavedData();
  setupLoginForm();
  setupEasterEgg();
  
  if (window.initNotificationSystem) {
    window.initNotificationSystem();
  }
  
  if (window.initThemeSwitcher) {
    window.initThemeSwitcher();
  }
  
  window.applyTheme = applyTheme;
}); 