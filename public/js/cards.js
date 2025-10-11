let cardOverlay = null;
let cardContainer = null;

function initCardSystem() {
  if (!cardOverlay) {
    cardOverlay = document.createElement('div');
    cardOverlay.id = 'card-overlay';
    cardOverlay.className = 'card-overlay';
    document.body.appendChild(cardOverlay);
  }

  if (!cardContainer) {
    cardContainer = document.createElement('div');
    cardContainer.id = 'card-container';
    cardContainer.className = 'card-container';
    document.body.appendChild(cardContainer);
  }

  cardOverlay.addEventListener('click', closeAllCards);
  document.addEventListener('keydown', handleCardKeydown);
}

function showCard(cardData) {
  if (!cardContainer) {
    initCardSystem();
  }

  closeAllCards();

  setTimeout(() => {
    const card = createCard(cardData);
    
    cardContainer.appendChild(card);
    
    cardOverlay.style.display = 'block';
    cardContainer.style.display = 'flex';
    
    setTimeout(() => {
      card.classList.add('visible');
    }, 10);
    
    return card;
  }, 250); 
}

function createCard(cardData) {
  const card = document.createElement('div');
  card.className = 'card';
  
  if (cardData.id) {
    card.id = cardData.id;
  }

  if (cardData.title) {
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = cardData.title;
    card.appendChild(title);
  }

  if (cardData.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'card-subtitle';
    subtitle.textContent = cardData.subtitle;
    card.appendChild(subtitle);
  }

  if (cardData.content) {
    const content = document.createElement('div');
    content.className = 'card-content';
    
    if (typeof cardData.content === 'string') {
      content.innerHTML = cardData.content;
    } else if (cardData.content instanceof HTMLElement) {
      content.appendChild(cardData.content);
    }
    
    card.appendChild(content);
  }

  if (cardData.buttons && cardData.buttons.length > 0) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'card-buttons';
    
    cardData.buttons.forEach(buttonData => {
      const button = document.createElement('button');
      button.className = `card-button ${buttonData.type || 'secondary'}`;
      button.textContent = buttonData.text;
      
      if (buttonData.onClick) {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          buttonData.onClick();
        });
      }
      
      buttonContainer.appendChild(button);
    });
    
    card.appendChild(buttonContainer);
  }

  card.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  return card;
}


function closeAllCards() {
  if (cardOverlay) {
    cardOverlay.style.display = 'none';
  }
  
  if (cardContainer) {
    const cards = cardContainer.querySelectorAll('.card');
    cards.forEach(card => {
      card.classList.remove('visible');
      setTimeout(() => {
        if (card.parentNode) {
          card.remove();
        }
      }, 200);
    });
    
    setTimeout(() => {
      cardContainer.style.display = 'none';
    }, 200);
  }
}

function closeCard(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.remove('visible');
    setTimeout(() => {
      if (card.parentNode) {
        card.remove();
      }
      
      const remainingCards = cardContainer.querySelectorAll('.card');
      if (remainingCards.length === 0) {
        cardOverlay.style.display = 'none';
        cardContainer.style.display = 'none';
      }
    }, 200);
  }
}

function handleCardKeydown(e) {
  if (e.key === 'Escape') {
    closeAllCards();
  }
}

function createDefaultCard() {
  const cardData = {
    id: 'default-card',
    title: 'Добро пожаловать!',
    subtitle: 'Это пример дефолтной карточки с заголовком и субтекстом',
    buttons: [
      {
        text: 'Понятно',
        type: 'primary',
        onClick: () => closeCard('default-card')
      }
    ]
  };
  
  return showCard(cardData);
}

function createInfoCard(title, subtitle, content = null) {
  const cardData = {
    title: title,
    subtitle: subtitle,
    content: content,
    buttons: [
      {
        text: 'Закрыть',
        type: 'secondary',
        onClick: () => closeAllCards()
      }
    ]
  };
  
  return showCard(cardData);
}

function createConfirmCard(title, subtitle, onConfirm, onCancel = null) {
  const cardData = {
    title: title,
    subtitle: subtitle,
    buttons: [
      {
        text: 'Отмена',
        type: 'secondary',
        onClick: () => {
          if (onCancel) onCancel();
          closeAllCards();
        }
      },
      {
        text: 'Подтвердить',
        type: 'primary',
        onClick: () => {
          if (onConfirm) onConfirm();
          closeAllCards();
        }
      }
    ]
  };
  
  return showCard(cardData);
}

function addBadgeToCardElement(elementId, badgeType) {
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (element && typeof window[`add${badgeType}Badge`] === 'function') {
      window[`add${badgeType}Badge`](element);
    }
  }, 350); 
}

document.addEventListener('DOMContentLoaded', () => {
  initCardSystem();
  
  const demoButton = document.getElementById('demo-card-button');
  if (demoButton) {
    demoButton.addEventListener('click', () => {
      createDefaultCard();
    });
  }
});

window.showCard = showCard;
window.closeAllCards = closeAllCards;
window.closeCard = closeCard;
window.createDefaultCard = createDefaultCard;
window.createInfoCard = createInfoCard;
window.createConfirmCard = createConfirmCard;
window.addBadgeToCardElement = addBadgeToCardElement;
window.initCardSystem = initCardSystem;
