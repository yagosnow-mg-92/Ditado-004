/**
 * ConfettiService - Animação de confetes no canvas.
 */
class ConfettiService {
  constructor() {
    this._canvas = document.getElementById('confetti-canvas');
    this._ctx    = this._canvas?.getContext('2d');
    this._particles = [];
    this._animId = null;
  }

  /** Inicia os confetes por `duration` ms */
  fire(duration = 3500) {
    if (!this._canvas) return;
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;

    this._particles = Array.from({ length: 120 }, () => this._createParticle());

    const end = Date.now() + duration;
    const tick = () => {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._particles.forEach(p => this._updateDraw(p));
      this._particles = this._particles.filter(p => p.y < this._canvas.height + 30);

      if (Date.now() < end && this._particles.length > 0) {
        if (this._particles.length < 60) {
          this._particles.push(...Array.from({ length: 10 }, () => this._createParticle()));
        }
        this._animId = requestAnimationFrame(tick);
      } else {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      }
    };
    cancelAnimationFrame(this._animId);
    tick();
  }

  _createParticle() {
    const colors = ['#4A90D9','#5DBB63','#FFD740','#FF8C42','#E05252','#7BB8F0','#8DD492'];
    return {
      x:    Math.random() * window.innerWidth,
      y:    -20 - Math.random() * 100,
      vx:   (Math.random() - 0.5) * 4,
      vy:   3 + Math.random() * 4,
      w:    8 + Math.random() * 10,
      h:    4 + Math.random() * 6,
      rot:  Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  _updateDraw(p) {
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.rotV;
    p.vy  += 0.08;

    const ctx = this._ctx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
}
