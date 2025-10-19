let isPageVisible = true;

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

function checkPageVisibility() {
  isPageVisible = !document.hidden;
}

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

function initNotificationSystem() {
  document.addEventListener('visibilitychange', checkPageVisibility);
  
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => {
      requestNotificationPermission();
    }, 1000);
  }
}

window.createNotificationToast = createNotificationToast;
window.createUserActivityToast = createUserActivityToast;
window.showNewMessageNotification = showNewMessageNotification;
window.initNotificationSystem = initNotificationSystem;
