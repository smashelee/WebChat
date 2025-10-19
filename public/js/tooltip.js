let customTooltip = null;

function showCustomTooltip(e, text) {
  if (!customTooltip) {
    customTooltip = document.createElement('div');
    customTooltip.className = 'custom-tooltip';
    document.body.appendChild(customTooltip);
  }
  
  const mouseX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const mouseY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
  
  customTooltip.textContent = text;
  customTooltip.style.left = `${mouseX}px`;
  customTooltip.style.top = `${mouseY}px`;
  customTooltip.classList.add('visible');
  
  requestAnimationFrame(() => {
    const tooltipRect = customTooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const padding = 10;
    
    let left = mouseX;
    let top = mouseY;
    
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;
    
    const rightEdge = left + tooltipWidth / 2;
    const leftEdge = left - tooltipWidth / 2;
    
    if (rightEdge > viewportWidth - padding) {
      left = viewportWidth - tooltipWidth / 2 - padding;
    } else if (leftEdge < padding) {
      left = tooltipWidth / 2 + padding;
    }
    
    const topEdge = top - tooltipHeight * 1.1;
    
    if (topEdge < padding) {
      customTooltip.style.transform = 'translate(-50%, 10%)';
      top = mouseY;
    } else {
      customTooltip.style.transform = 'translate(-50%, -110%)';
    }
    
    const bottomEdge = top + tooltipHeight * 1.1;
    if (bottomEdge > viewportHeight - padding && topEdge >= padding) {
      customTooltip.style.transform = 'translate(-50%, -110%)';
    }
    
    customTooltip.style.left = `${left}px`;
    customTooltip.style.top = `${top}px`;
  });
}

function hideCustomTooltip() {
  if (customTooltip) {
    customTooltip.classList.remove('visible');
    customTooltip.style.transform = 'translate(-50%, -110%)';
  }
}

window.showCustomTooltip = showCustomTooltip;
window.hideCustomTooltip = hideCustomTooltip;
