/**
 * HIERO Bridge — Subtle Neural Constellation Particle Network
 * Exact Original Hiero Bridge Style: Deep black, subtle green animated dots, thin network connections, low-opacity ambient effects only.
 */

(function () {
  'use strict';

  function initNetworkCanvas() {
    const canvas = document.getElementById('network-canvas') || document.getElementById('antigravity-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let animationFrameId = null;

    // Detect touch-only / mobile devices
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 768);

    // Cursor tracking state
    const mouse = {
      x: -9999,
      y: -9999,
      radius: 140, // Repulsion influence radius
      isActive: false
    };

    if (!isTouchDevice) {
      window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.isActive = true;
      });

      window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
        mouse.isActive = false;
      });
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildParticles();
    }

    class NetworkParticle {
      constructor() {
        this.reset(true);
      }

      reset(randomizePos = false) {
        this.x = randomizePos ? Math.random() * canvas.width : (Math.random() < 0.5 ? 0 : canvas.width);
        this.y = randomizePos ? Math.random() * canvas.height : Math.random() * canvas.height;

        // Ambient drift: subtle, slow, natural float
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.15 + Math.random() * 0.25; // 0.15 - 0.40 px/frame
        this.ambientVx = Math.cos(angle) * speed;
        this.ambientVy = Math.sin(angle) * speed;

        this.vx = this.ambientVx;
        this.vy = this.ambientVy;

        // Subtle dot sizing (1.0 to 1.9 px)
        this.size = Math.random() < 0.1 ? 1.9 : (1.0 + Math.random() * 0.6);
        this.baseSize = this.size;

        // Low-opacity subtle alpha (0.20 to 0.45)
        this.baseAlpha = 0.20 + Math.random() * 0.25;
        this.alpha = this.baseAlpha;
        this.glow = 0;
        this.mass = 1.0 + Math.random() * 0.5;
      }

      update() {
        // 1. Cursor Repulsion Physics (smooth, subtle inverse-distance repulsion)
        if (!isTouchDevice && mouse.isActive) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0.1) {
            const norm = (mouse.radius - dist) / mouse.radius;
            const force = (norm * norm * 1.4) / this.mass;

            const dirX = dx / dist;
            const dirY = dy / dist;

            this.vx += dirX * force * 0.45;
            this.vy += dirY * force * 0.45;

            this.glow = Math.min(0.4, this.glow + norm * 0.25);
          }
        }

        // 2. Physics Damping (smooth decelerating drag)
        this.vx *= 0.95;
        this.vy *= 0.95;

        // 3. Smooth restoration to ambient drift
        this.vx += (this.ambientVx - this.vx) * 0.035;
        this.vy += (this.ambientVy - this.vy) * 0.035;

        // 4. Glow relaxation
        this.glow *= 0.94;

        // 5. Update position
        this.x += this.vx;
        this.y += this.vy;

        // 6. Smooth wrap-around screen boundaries
        const margin = 15;
        if (this.x < -margin) this.x = canvas.width + margin;
        if (this.x > canvas.width + margin) this.x = -margin;
        if (this.y < -margin) this.y = canvas.height + margin;
        if (this.y > canvas.height + margin) this.y = -margin;
      }

      draw() {
        // Crisp, subtle dot without any giant radial-gradient halos
        const currentAlpha = Math.min(0.65, this.baseAlpha + this.glow);
        ctx.fillStyle = `rgba(7, 226, 25, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function buildParticles() {
      particles = [];
      let count = Math.floor((canvas.width * canvas.height) / 14000);
      count = Math.min(130, Math.max(45, count));

      for (let i = 0; i < count; i++) {
        particles.push(new NetworkParticle());
      }
    }

    function drawConnections() {
      const maxDistance = 110;
      const maxDistSq = maxDistance * maxDistance;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const factor = 1 - dist / maxDistance;

            // Thin, low-opacity subtle lines
            let alpha = factor * 0.12;

            const combinedGlow = Math.max(p1.glow, p2.glow);
            if (combinedGlow > 0.05) {
              alpha = factor * (0.12 + combinedGlow * 0.18);
              ctx.strokeStyle = `rgba(7, 226, 25, ${alpha})`;
              ctx.lineWidth = 0.8;
            } else {
              ctx.strokeStyle = `rgba(7, 226, 25, ${alpha})`;
              ctx.lineWidth = 0.6;
            }

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw thin lines first
      drawConnections();

      // Update and draw subtle dots
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
      resize();
    });

    resize();
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetworkCanvas);
  } else {
    initNetworkCanvas();
  }
})();
