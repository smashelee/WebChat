let themeSwitcherInitialized = false;
let bgParticlesEnabled = true;

function initThemeSwitcher() {
  const customOptions = document.getElementById('custom-options');
  const customSelectTrigger = document.getElementById('custom-select-trigger');
  const customSelect = document.getElementById('custom-select');
  
  if (!customOptions || !customSelectTrigger || !customSelect) {
    return;
  }
  
  if (themeSwitcherInitialized) {
    return;
  }
  
  const themes = [
    { value: 'crimson-night', text: '🌹 Малиновая ночь' },
    { value: 'ruby-fire', text: '🔴 Рубиновый огонь' },
    
    { value: 'orange-sunset', text: '🟠 Оранжевый закат' },
    { value: 'copper-bronze', text: '🥉 Медная бронза' },
    
    { value: 'golden-sun', text: '🟡 Золотое солнце' },
    
    { value: 'lime-zest', text: '🍋 Лаймовый цитрус' },
    { value: 'moss-earth', text: '🌿 Моховая земля' },
    
    { value: 'jade-valley', text: '🟢 Эфирная долина' },
    { value: 'emerald-forest', text: '🌲 Изумрудный лес' },
    { value: 'malachite-depths', text: '🟩 Малахитовые глубины' },
    
    { value: 'cyan-ocean', text: '🌊 Голубой океан' },
    { value: 'azure-sky', text: '🔵 Лазурное небо' },
    
    { value: 'sapphire-deep', text: '💎 Глубокий сапфир' },
    { value: 'cobalt-storm', text: '⚡ Кобальтовая буря' },
    { value: 'royal-indigo', text: '🟣 Королевский индиго' },
    
    { value: 'violet-amethyst', text: '💜 Аметистовый фиолет' },
    { value: 'plum-shadow', text: '🍇 Сливовая тень' },
    
    { value: 'fuchsia-dream', text: '💖 Фуксиевая мечта' },
    { value: 'rose-quartz', text: '🌸 Розовый кварц' },
    
    { value: 'slate-graphite', text: '⚙️ Сланцевый графит' },
    { value: 'dark', text: '🌙 Пустой космос' },
  ];
  
  function updateThemeList() {
    customOptions.innerHTML = '';
    themes.forEach(theme => {
      const option = document.createElement('div');
      option.className = 'custom-option';
      option.setAttribute('data-value', theme.value);
      option.setAttribute('data-theme-preview', theme.value);
      option.textContent = theme.text;
      customOptions.appendChild(option);
    });
    
    const savedTheme = localStorage.getItem('savedTheme');
    const currentTheme = themes.find(theme => theme.value === savedTheme);
    
    if (currentTheme) {
      customSelectTrigger.querySelector('span').textContent = currentTheme.text;
      applyTheme(currentTheme.value);
      updateSelectedOption(currentTheme.value);
    } else {
      customSelectTrigger.querySelector('span').textContent = themes[0].text;
      applyTheme(themes[0].value);
      updateSelectedOption(themes[0].value);
    }
  }
  
  function applyTheme(themeValue) {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', themeValue);
    
    localStorage.setItem('savedTheme', themeValue);
    
    updateThemeColor();
    
    const customSelectTrigger = document.getElementById('custom-select-trigger');
    if (customSelectTrigger) {
      const selectedOption = document.querySelector(`.custom-option[data-value="${themeValue}"]`);
      if (selectedOption) {
        customSelectTrigger.querySelector('span').textContent = selectedOption.textContent;
        updateSelectedOption(themeValue);
      }
    }
  }
  
  function updateThemeColor() {
    const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();
    const metaThemeColor = document.getElementById('theme-color-meta');
    if (metaThemeColor && backgroundColor) {
      metaThemeColor.setAttribute('content', backgroundColor);
    }
  }
  
  function updateSelectedOption(themeValue) {
    const allOptions = document.querySelectorAll('.custom-option');
    allOptions.forEach(option => {
      option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`.custom-option[data-value="${themeValue}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
  }
  
  function loadSavedTheme() {
    const savedTheme = localStorage.getItem('savedTheme');
    if (savedTheme) {
      const themeIndex = themes.findIndex(theme => theme.value === savedTheme);
      if (themeIndex !== -1) {
        customSelectTrigger.querySelector('span').textContent = themes[themeIndex].text;
        applyTheme(savedTheme);
        updateSelectedOption(savedTheme);
        return true;
      }
    }
    return false;
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
      updateSelectedOption(themeValue);
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
  
  customSelectTrigger.addEventListener('click', toggleDropdown);
  customOptions.addEventListener('click', handleOptionClick);
  document.addEventListener('click', handleOutsideClick);
  
  customOptions.addEventListener('touchstart', preventScrollBlocking, { passive: true });
  customOptions.addEventListener('touchmove', preventScrollBlocking, { passive: true });
  customOptions.addEventListener('touchend', preventScrollBlocking, { passive: true });
  
  if (!loadSavedTheme()) {
    updateThemeList();
    const amethystIndex = themes.findIndex(theme => theme.value === 'violet-amethyst');
    if (amethystIndex !== -1) {
      customSelectTrigger.querySelector('span').textContent = themes[amethystIndex].text;
      applyTheme('violet-amethyst');
      updateSelectedOption('violet-amethyst');
    }
  } else {
    updateThemeList();
  }
  
  themeSwitcherInitialized = true;

  setupBackgroundParticlesSwitch();
}

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

  applyState();

  checkbox.addEventListener('change', () => {
    bgParticlesEnabled = checkbox.checked;
    localStorage.setItem('bgParticlesEnabled', String(bgParticlesEnabled));
    applyState();
  });
}

window.initThemeSwitcher = initThemeSwitcher;
window.setupBackgroundParticlesSwitch = setupBackgroundParticlesSwitch;

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  setupBackgroundParticlesSwitch();
});
