/**
 * HIERO Antigravity Neural Particle Canvas Engine
 * Interactive bioluminescent constellation background
 */

(function () {
  function initParticleCanvas() {
    const canvas = document.getElementById('antigravity-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const mouse = { x: -1000, y: -1000, radius: 200 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    class Particle {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.baseSize = this.size;
        this.density = Math.random() * 25 + 10;
        this.opacity = Math.random() * 0.45 + 0.25;
        this.velocity = (Math.random() - 0.5) * 0.4;
      }

      draw() {
        ctx.fillStyle = `rgba(7, 226, 25, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        this.baseX += this.velocity;
        this.baseY += this.velocity;

        if (this.baseX > canvas.width) this.baseX = 0;
        if (this.baseX < 0) this.baseX = canvas.width;
        if (this.baseY > canvas.height) this.baseY = 0;
        if (this.baseY < 0) this.baseY = canvas.height;

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          let dirX = dx / distance;
          let dirY = dy / distance;

          this.x -= dirX * force * this.density;
          this.y -= dirY * force * this.density;
          this.size = this.baseSize * (1 + force * 1.6);
        } else {
          this.x += (this.baseX - this.x) * 0.05;
          this.y += (this.baseY - this.y) * 0.05;
          this.size = this.baseSize;
        }
      }
    }

    function initParticles() {
      particles = [];
      let count = Math.floor((canvas.width * canvas.height) / 9500);
      count = Math.min(180, Math.max(60, count));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function connect() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distSq = dx * dx + dy * dy;

          if (distSq < 13000) {
            let distance = Math.sqrt(distSq);
            let opacity = 1 - distance / 114;

            let mDx = mouse.x - (particles[a].x + particles[b].x) / 2;
            let mDy = mouse.y - (particles[a].y + particles[b].y) / 2;
            let mDist = Math.sqrt(mDx * mDx + mDy * mDy);

            ctx.beginPath();
            if (mDist < 120) {
              let mForce = 1 - mDist / 120;
              ctx.strokeStyle = `rgba(120, 255, 140, ${opacity * (0.3 + mForce * 0.7)})`;
            } else {
              ctx.strokeStyle = `rgba(7, 226, 25, ${opacity * 0.16})`;
            }
            ctx.lineWidth = 1;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connect();
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticleCanvas);
  } else {
    initParticleCanvas();
  }
})();
