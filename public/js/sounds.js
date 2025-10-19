let sounds = {};

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

window.playSound = playSound;
window.initSounds = initSounds;

document.addEventListener('DOMContentLoaded', () => {
  initSounds();
});
