(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animationFrameId = null;
  let isRunning = false;
  let canvas, ctx;
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  let lastTimestamp = 0;
  let globalAlphaTarget = 1;
  let globalAlphaCurrent = 0;
  const FADE_IN_PER_MS = 1 / 600;

  function createCanvasIfNeeded() {
      if (canvas && ctx) return;
      canvas = document.createElement('canvas');
      canvas.id = 'bg-canvas';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '0';
      document.body.insertBefore(canvas, document.body.firstChild);
      ctx = canvas.getContext('2d');
      resizeCanvas();
  }

  function resizeCanvas() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function isMobileDevice() {
      return window.innerWidth <= 768 || 
             /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             ('ontouchstart' in window) ||
             (navigator.maxTouchPoints > 0);
  }

  function computeParticleCount() {
      const area = window.innerWidth * window.innerHeight;
      const isMobile = isMobileDevice();
      const target = isMobile ? 60 : 150;
      const densityFactor = isMobile ? 0.00006 : 0.0001;
      return Math.min(target, Math.max(40, Math.floor(area * densityFactor)));
  }

  function createParticles() {
      particles = [];
      const count = computeParticleCount();
      for (let i = 0; i < count; i++) {
          particles.push(createParticle());
      }
  }

  function createParticle() {
      return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.5
      };
  }

  function step(deltaMs) {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (globalAlphaCurrent < globalAlphaTarget) {
          globalAlphaCurrent = Math.min(globalAlphaTarget, globalAlphaCurrent + (deltaMs * FADE_IN_PER_MS));
      }

      ctx.save();
      ctx.globalAlpha = globalAlphaCurrent;

      for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          
          p.x += p.vx * (deltaMs / 16.6667);
          p.y += p.vy * (deltaMs / 16.6667);

          if (p.x < 0 || p.x > window.innerWidth) p.vx = -p.vx;
          if (p.y < 0 || p.y > window.innerHeight) p.vy = -p.vy;

          if (p.x < -50) p.x = window.innerWidth + 50;
          if (p.x > window.innerWidth + 50) p.x = -50;
          if (p.y < -50) p.y = window.innerHeight + 50;
          if (p.y > window.innerHeight + 50) p.y = -50;
      }

      const maxDistance = 120;
      const maxMouseDistance = mouse.radius;

      for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < maxDistance) {
                  const opacity = (1 - distance / maxDistance) * 0.4;
                  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * globalAlphaCurrent})`;
                  ctx.lineWidth = 0.5;
                  ctx.beginPath();
                  ctx.moveTo(particles[i].x, particles[i].y);
                  ctx.lineTo(particles[j].x, particles[j].y);
                  ctx.stroke();
              }
          }

          if (mouse.x !== null && mouse.y !== null) {
              const dx = particles[i].x - mouse.x;
              const dy = particles[i].y - mouse.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < maxMouseDistance) {
                  const opacity = (1 - distance / maxMouseDistance) * 0.6;
                  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color-rgb');
                  const [r, g, b] = accentColor.split(',').map(c => parseInt(c.trim()));
                  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * globalAlphaCurrent})`;
                  ctx.lineWidth = 0.8;
                  ctx.beginPath();
                  ctx.moveTo(particles[i].x, particles[i].y);
                  ctx.lineTo(mouse.x, mouse.y);
                  ctx.stroke();
              }
          }
      }

      for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * globalAlphaCurrent})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.3 * globalAlphaCurrent})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + 2, 0, Math.PI * 2);
          ctx.stroke();
      }

      ctx.restore();
  }

  function animate(timestamp) {
      if (!isRunning) return;
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = Math.min(48, timestamp - lastTimestamp);
      lastTimestamp = timestamp;
      step(delta);
      animationFrameId = requestAnimationFrame(animate);
  }

  function isUserDisabled() {
      try {
          const v = localStorage.getItem('bgParticlesEnabled');
          return v === 'false';
      } catch (_) {
          return false;
      }
  }

  function start() {
      if (isRunning || prefersReducedMotion || isUserDisabled()) return;
      createCanvasIfNeeded();
      resizeCanvas();
      createParticles();
      isRunning = true;
      lastTimestamp = 0;
      globalAlphaCurrent = 0;
      animationFrameId = requestAnimationFrame(animate);
  }

  function stop() {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      globalAlphaTarget = 1;
      globalAlphaCurrent = 0;
  }

  function pauseForVisibility() {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
  }

  function redrawStatic() {
      createCanvasIfNeeded();
      resizeCanvas();
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const count = Math.floor(computeParticleCount() * 0.7);
      const staticParticles = [];
      
      for (let i = 0; i < count; i++) {
          staticParticles.push({
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              size: Math.random() * 1.5 + 0.5,
              opacity: Math.random() * 0.5 + 0.5
          });
      }

      const maxDistance = 100;
      for (let i = 0; i < staticParticles.length; i++) {
          for (let j = i + 1; j < staticParticles.length; j++) {
              const dx = staticParticles[i].x - staticParticles[j].x;
              const dy = staticParticles[i].y - staticParticles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < maxDistance) {
                  const opacity = (1 - distance / maxDistance) * 0.3;
                  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                  ctx.lineWidth = 0.5;
                  ctx.beginPath();
                  ctx.moveTo(staticParticles[i].x, staticParticles[i].y);
                  ctx.lineTo(staticParticles[j].x, staticParticles[j].y);
                  ctx.stroke();
              }
          }
      }

      for (let i = 0; i < staticParticles.length; i++) {
          const p = staticParticles[i];
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
      }
  }

  function handleResize() {
      resizeCanvas();
      if (prefersReducedMotion || isUserDisabled()) {
          redrawStatic();
      } else {
          createParticles();
      }
  }

  function handleMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
  }

  function handleMouseLeave() {
      mouse.x = null;
      mouse.y = null;
  }

  document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
          pauseForVisibility();
      } else {
          if (prefersReducedMotion || isUserDisabled()) {
              redrawStatic();
          } else {
              start();
          }
      }
  });

  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseleave', handleMouseLeave);

  document.addEventListener('DOMContentLoaded', () => {
      createCanvasIfNeeded();

      const saved = localStorage.getItem('bgParticlesEnabled');
      const particlesEnabled = saved === null ? true : saved === 'true';
      
      if (prefersReducedMotion || isUserDisabled() || !particlesEnabled) {
          redrawStatic();
      } else {
          start();
      }
  });

  window.ParticlesBackground = {
      start,
      stop,
      redrawStatic,
      isMobileDevice
  };
})();