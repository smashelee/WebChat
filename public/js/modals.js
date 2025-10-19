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

function updateProgressConfirmModal(percent = 0, text = '') {
  const bar = document.getElementById('confirm-progress-bar');
  const label = document.getElementById('confirm-progress-label');
  const safe = Math.max(0, Math.min(100, Math.round(percent)));
  if (bar) bar.style.width = safe + '%';
  if (label) label.textContent = text ? text : safe + '%';
}

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
      if (password && password.length > 0) {
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
      if (password && password.length > 0) {
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

function showSettingsModal() {
  if (typeof window.initThemeSwitcher === 'function') {
    window.initThemeSwitcher();
  }
  
  if (typeof window.setupBackgroundParticlesSwitch === 'function') {
    window.setupBackgroundParticlesSwitch();
  }
  
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

window.showSettingsModal = showSettingsModal;
window.showConfirmModal = showConfirmModal;
window.showAdminConfirmModal = showAdminConfirmModal;
window.showModeratorConfirmModal = showModeratorConfirmModal;
window.showAttachModal = showAttachModal;