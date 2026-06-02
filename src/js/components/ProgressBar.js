/**
 * ProgressBar - Componente de barra de progresso.
 */
class ProgressBar {
  /**
   * @param {HTMLElement} container - Elemento que receberá o componente
   */
  constructor(container) {
    this._container = container;
    this._render();
  }

  _render() {
    this._container.innerHTML = `
      <div class="progress-section">
        <div class="progress-label">
          <span class="progress-word-count" id="prog-word-count">Palavra 1 de 10</span>
          <span class="progress-pct" id="prog-pct">0%</span>
        </div>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="progress-fill" id="prog-fill" style="width:0%"></div>
        </div>
      </div>
    `;
    this._wordCount = this._container.querySelector('#prog-word-count');
    this._pctEl     = this._container.querySelector('#prog-pct');
    this._fill      = this._container.querySelector('#prog-fill');
    this._track     = this._container.querySelector('[role="progressbar"]');
  }

  /**
   * Atualiza o progresso.
   * @param {number} current - Índice atual (1-based)
   * @param {number} total
   */
  update(current, total) {
    const pct = Math.round((current / total) * 100);
    this._wordCount.textContent = `Palavra ${current} de ${total}`;
    this._pctEl.textContent = `${pct}%`;
    this._fill.style.width = `${pct}%`;
    this._track.setAttribute('aria-valuenow', pct);
  }
}
