// ======== Проверить мобильное устройство ========
function isMobileDevice() {
  const isMobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  console.log('isMobileDevice:', isMobile, 'width:', window.innerWidth, 'userAgent:', navigator.userAgent);
  return isMobile;
}

// ======== Настроить мобильный интерфейс ========
function setupMobileInterface() {
  const isMobile = isMobileDevice();
  if (!isMobile) return;
  
  createMobileElements();
  setupSidebarToggle();
  setupKeyboardHandling();
  addOrientationHandling();
  enhanceMobileLogin();
  disableBodyScroll();
}

// ======== Создать мобильные элементы ========
function createMobileElements() {
  const isMobile = isMobileDevice();
  if (!isMobile) return;
  
  if (!document.querySelector('.mobile-users-button')) {
    const chatArea = document.querySelector('.chatArea');
    if (chatArea) {
      const usersButton = document.createElement('button');
      usersButton.className = 'mobile-users-button';
      usersButton.innerHTML = `<img src="public/Images/user.png" alt="Users" class="mobile-users-icon">`;
      chatArea.appendChild(usersButton);
    }
  }
  
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && sidebar.parentElement !== document.body) {
    if (!sidebar.dataset.originalParent) {
      sidebar.dataset.originalParent = sidebar.parentElement.className || 'mainLayout';
    }
    document.body.appendChild(sidebar);
  }
  
  if (!document.querySelector('.sidebar-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }
  
}

// ======== Настроить переключение боковой панели ========
function setupSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const usersButton = document.querySelector('.mobile-users-button');
  
  if (!sidebar || !usersButton) return;
  
  sidebar.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  usersButton.addEventListener('click', function() {
    sidebar.classList.add('expanded');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  
  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('expanded');
      overlay.classList.remove('active');
    });
  }
}

// ======== Обработать изменение размера ========
function handleResize() {
  const isMobile = isMobileDevice();
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (!isMobile) {
    if (sidebar) sidebar.classList.remove('expanded');
    if (overlay) overlay.classList.remove('active');
    
    const mobileButton = document.querySelector('.mobile-users-button');
    if (mobileButton) mobileButton.remove();
    
    if (overlay) overlay.remove();
    
    if (sidebar && sidebar.parentElement === document.body) {
      const mainLayout = document.querySelector('.mainLayout');
      if (mainLayout) {
        mainLayout.insertBefore(sidebar, mainLayout.firstChild);
      }
    }
    
  } else {
    if (!document.querySelector('.mobile-users-button')) {
      createMobileElements();
      setupSidebarToggle();
    }
  }
}

// ======== Отключить прокрутку тела ========
function disableBodyScroll() {
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
  
  const mainLayout = document.querySelector('.mainLayout');
  if (mainLayout) {
    mainLayout.style.overflow = 'hidden';
    mainLayout.style.height = '100vh';
  }
  
  const chatArea = document.querySelector('.chatArea');
  if (chatArea) {
    chatArea.style.overflow = 'hidden';
    chatArea.style.height = '100%';
  }
  
  const messagesContainer = document.querySelector('.messagesContainer');
  if (messagesContainer) {
    messagesContainer.style.overflowY = 'auto';
    messagesContainer.style.height = 'calc(100vh - 120px)';
  }
}

// ======== Предотвратить прокрутку тела ========
function preventBodyScroll(e) {
  const messagesContainer = document.querySelector('.messagesContainer');
  const chatArea = document.querySelector('.chatArea');
  const inputArea = document.querySelector('.inputArea');
  const messageInput = document.getElementById('message-input');
  
  if (messagesContainer && (
    e.target === messagesContainer || 
    messagesContainer.contains(e.target) ||
    e.target.closest('.messagesContainer')
  )) {
    return;
  }
  
  if (chatArea && (
    e.target === chatArea || 
    chatArea.contains(e.target) ||
    e.target.closest('.chatArea')
  )) {
    return;
  }
  
  if (inputArea && (
    e.target === inputArea || 
    inputArea.contains(e.target) ||
    e.target.closest('.inputArea')
  )) {
    return;
  }
  
  if (messageInput && (
    e.target === messageInput || 
    messageInput.contains(e.target)
  )) {
    return;
  }
  
  e.preventDefault();
}

// ======== Включить запрет прокрутки ========
function enableNoScroll() {
  document.body.addEventListener('touchmove', function(e) {
    if (!e.target.closest('.chatArea') && !e.target.closest('.messagesContainer')) {
      e.preventDefault();
    }
  }, { passive: false });
}

// ======== Отключить запрет прокрутки ========
function disableNoScroll() {
  document.body.removeEventListener('touchmove', function(e) {
    if (!e.target.closest('.chatArea') && !e.target.closest('.messagesContainer')) {
      e.preventDefault();
    }
  }, { passive: false });
}

// ======== Улучшить мобильный вход ========
function enhanceMobileLogin() {
  const loginForm = document.querySelector('.loginForm');
  if (!loginForm) return;
  
  loginForm.addEventListener('click', function() {
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        activeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  });
  
  enhanceMobileAvatarSelection();
}

// ======== Улучшить выбор аватара на мобильных ========
function enhanceMobileAvatarSelection() {
  const showMoreBtn = document.getElementById('show-more-avatars');
  if (!showMoreBtn) return;
  
  showMoreBtn.addEventListener('touchstart', function() {
    this.style.opacity = '0.7';
  });
  
  showMoreBtn.addEventListener('touchend', function() {
    this.style.opacity = '0.9';
    setTimeout(() => this.style.opacity = '', 200);
  });
  
  const avatarOptions = document.querySelectorAll('.avatarOption');
  avatarOptions.forEach(option => {
    option.addEventListener('touchstart', function(e) {
      e.preventDefault();
      this.style.transform = 'scale(1.1)';
      this.style.opacity = '0.9';
    });
    
    option.addEventListener('touchend', function(e) {
      e.preventDefault();
      this.style.transform = '';
      this.style.opacity = '';
      
      this.click();
    });
  });
}

// ======== Добавить обработку ориентации ========
function addOrientationHandling() { 
  const main = document.querySelector('.mainLayout');
  if (!main) return;
  
  window.addEventListener('orientationchange', function() {
    setTimeout(() => {
      main.style.display = 'none';
      void main.offsetHeight;
      main.style.display = 'flex';
    }, 200);
  });
}

// ======== Настроить адаптацию под клавиатуру ========
function setupKeyboardHandling() {
  const messageInput = document.getElementById('message-input');

  messageInput.addEventListener('blur', () => {
    setTimeout(() => {
      if (document.activeElement !== messageInput) {
        const messagesContainer = document.querySelector('.messagesContainer');
        if (messagesContainer) {
          messagesContainer.classList.remove('input-focused');
          document.body.classList.remove('input-focused');
        }
        
        if (messageInput._preventPageScroll) {
          document.removeEventListener('touchmove', messageInput._preventPageScroll);
          document.removeEventListener('scroll', messageInput._preventPageScroll);
          delete messageInput._preventPageScroll;
        }
        
        resetLayout();
      }
    }, 100);
  });

  messageInput.addEventListener('focus', () => {
    console.log('Message input focused');
    if (isMobileDevice()) {
      const messagesContainer = document.querySelector('.messagesContainer');
      if (messagesContainer) {
        messagesContainer.classList.add('input-focused');
        document.body.classList.add('input-focused');
        
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
      
      const preventPageScroll = (e) => {
        if (document.body.classList.contains('keyboard-open')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };
      
      document.addEventListener('touchmove', preventPageScroll, { passive: false });
      document.addEventListener('scroll', preventPageScroll, { passive: false });
      
      messageInput._preventPageScroll = preventPageScroll;
    }
  });
  
  messageInput.addEventListener('click', () => {
    if (isMobileDevice()) {
      const messagesContainer = document.querySelector('.messagesContainer');
      if (messagesContainer) {
        setTimeout(() => {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
          });
        }, 200);
      }
    }
  });
}

// ======== Адаптировать макет под клавиатуру ========
let layoutAdjustmentTimeout = null;
let isLayoutAdjusted = false;

function adjustLayoutForKeyboard(event) {
  console.log('adjustLayoutForKeyboard called');
  
  if (!isMobileDevice() || !('visualViewport' in window)) {
    console.log('Not mobile or no visualViewport');
    return;
  }

  const viewport = event.target;
  const inputArea = document.querySelector('.inputArea');
  const chatContainer = document.getElementById('chat-container');
  const chatArea = document.querySelector('.chatArea');
  
  if (!inputArea || !chatContainer || !chatArea) {
    console.log('Missing elements:', { inputArea: !!inputArea, chatContainer: !!chatContainer, chatArea: !!chatArea });
    return;
  }

  const keyboardHeight = window.innerHeight - viewport.height;
  console.log('Keyboard height:', keyboardHeight);

  if (layoutAdjustmentTimeout) {
    clearTimeout(layoutAdjustmentTimeout);
  }

  layoutAdjustmentTimeout = setTimeout(() => {
    if (Math.abs(keyboardHeight) > 50 && !isLayoutAdjusted) {
      isLayoutAdjusted = true;
    inputArea.classList.add('mobile-fixed');
    chatArea.classList.add('keyboard-open');
    
    document.body.classList.add('keyboard-open');
    document.documentElement.classList.add('keyboard-open');
    
    inputArea.style.position = 'fixed';
    inputArea.style.bottom = '0px';
    inputArea.style.left = '0px';
    inputArea.style.right = '0px';
    inputArea.style.zIndex = '1000';
    inputArea.style.backgroundColor = 'var(--card-background)';
    inputArea.style.borderTop = '1px solid var(--border-color)';
    
    const headerHeight = document.querySelector('.chatHeader')?.offsetHeight || 60;
    const inputHeight = inputArea.offsetHeight;
    const availableHeight = Math.max(100, viewport.height - headerHeight - inputHeight);
    
    chatContainer.style.height = `${viewport.height}px`;
    chatArea.style.height = `${viewport.height}px`;
    
    const chatHeader = document.querySelector('.chatHeader');
    if (chatHeader) {
      chatHeader.style.position = 'sticky';
      chatHeader.style.top = '0';
      chatHeader.style.zIndex = '100';
      chatHeader.style.backgroundColor = 'var(--border-color)';
    }
    
    const messagesContainer = document.querySelector('.messagesContainer');
    if (messagesContainer) {
      messagesContainer.classList.add('keyboard-open'); 
      messagesContainer.classList.add('input-focused');
      messagesContainer.style.height = `${availableHeight}px`;
      messagesContainer.style.maxHeight = `${availableHeight}px`;
      
      setTimeout(() => {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 500);
      
      setTimeout(() => {
        messagesContainer.style.overflowY = 'hidden';
        messagesContainer.style.touchAction = 'none';
        messagesContainer.style.pointerEvents = 'none';
      }, 300);
    }, 150);
    }
    
    setTimeout(() => {
      inputArea.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 200);
    
    enableNoScroll();

    const replyIndicator = document.querySelector('.replyIndicator');
    if (replyIndicator) {
      replyIndicator.classList.add('mobile-fixed');
      replyIndicator.style.bottom = `${inputHeight}px`;
    }
  } else if (Math.abs(keyboardHeight) <= 50 && isLayoutAdjusted) {
    isLayoutAdjusted = false;
    resetLayout();
  }
  }, 100);
}

// ======== Сбросить макет ========
function resetLayout() {
  if (!isMobileDevice()) return;
  
  isLayoutAdjusted = false;
  
  const inputArea = document.querySelector('.inputArea');
  const chatContainer = document.getElementById('chat-container');
  const chatArea = document.querySelector('.chatArea');
  const messagesContainer = document.querySelector('.messagesContainer');
  const chatHeader = document.querySelector('.chatHeader');
  
  document.body.classList.remove('keyboard-open');
  document.documentElement.classList.remove('keyboard-open');
  
  if (inputArea) {
    inputArea.classList.remove('mobile-fixed');
    inputArea.style.position = '';
    inputArea.style.bottom = '';
    inputArea.style.left = '';
    inputArea.style.right = '';
    inputArea.style.zIndex = '';
    inputArea.style.backgroundColor = '';
    inputArea.style.borderTop = '';
  }
  
  if (chatContainer) {
    chatContainer.style.height = '100dvh';
  }
  
  if (chatArea) {
    chatArea.classList.remove('keyboard-open');
    chatArea.style.height = '100vh';
  }
  
  if (chatHeader) {
    chatHeader.style.position = '';
    chatHeader.style.top = '';
    chatHeader.style.zIndex = '';
    chatHeader.style.backgroundColor = '';
  }
  
  if (messagesContainer) {
    messagesContainer.classList.remove('keyboard-open');
    messagesContainer.classList.remove('input-focused');
    messagesContainer.style.height = '';
    messagesContainer.style.maxHeight = '';
    messagesContainer.style.overflowY = 'auto';
    messagesContainer.style.touchAction = '';
    messagesContainer.style.pointerEvents = '';
  }
  
  document.body.classList.remove('input-focused');
  
  const replyIndicator = document.querySelector('.replyIndicator');
  if (replyIndicator) {
    replyIndicator.classList.remove('mobile-fixed');
    replyIndicator.style.bottom = '';
  }
  
  disableNoScroll();
}

// ======== Настроить динамические элементы пользователей ========
function setupDynamicUserItems() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        const newUserItems = document.querySelectorAll('.userItem:not([data-mobile-setup])');
        newUserItems.forEach(item => {
          item.setAttribute('data-mobile-setup', 'true');
        });
      }
    });
  });
  
  const usersList = document.querySelector('.usersList');
  if (usersList) {
    observer.observe(usersList, { childList: true });
  }
  
  const messagesContainer = document.querySelector('.messagesContainer');
  if (messagesContainer && isMobileDevice()) {
    messagesContainer.addEventListener('touchstart', function(e) {
      e.stopPropagation();
    }, { passive: true });
    
    messagesContainer.addEventListener('touchmove', function(e) {
      e.stopPropagation();
    }, { passive: true });
  }
}

// ======== Настроить наблюдение за контейнером чата ========
function setupChatContainerObserver() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'style') {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer && chatContainer.style.display === 'flex') {
          setTimeout(() => {
            setupMobileInterface();
            setupDynamicUserItems();
          }, 100);
        }
      }
    });
  });
  
  const chatContainer = document.getElementById('chat-container');
  if (chatContainer) {
    observer.observe(chatContainer, { attributes: true });
  }
}

// ======== Инициализация при загрузке DOM ========
document.addEventListener('DOMContentLoaded', function() {
  setupMobileInterface();
  setupDynamicUserItems();
  setupChatContainerObserver();
  setupKeyboardHandling();
  
  window.addEventListener('resize', handleResize);
  
  window.addEventListener('resize', () => {
    if (isMobileDevice() && document.activeElement === messageInput) {
      console.log('Resize event detected');
      setTimeout(() => {
        const currentHeight = window.innerHeight;
        const keyboardHeight = window.screen.height - currentHeight;
        console.log('Resize event - keyboard height:', keyboardHeight);
        if (keyboardHeight > 150) {
          adjustLayoutForKeyboard({ target: { height: currentHeight } });
        } else {
          resetLayout();
        }
      }, 100);
    }
  });
});