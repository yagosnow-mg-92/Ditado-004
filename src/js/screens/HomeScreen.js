/**
 * HomeScreen - Tela de configuração do ditado.
 */
class HomeScreen {
  /**
   * @param {HTMLElement} el - Container da tela
   * @param {StorageService} storageService
   * @param {{ onStart: Function }} callbacks
   */
  constructor(el, storageService, { onStart }) {
    this._el = el;
    this._storage = storageService;
    this._onStart = onStart;
    this._selectedCount = 10;
    this._render();
    this._bindEvents();
  }

  _render() {
    const data = this._storage.load();
    const hasRecord = data.totalGames > 0;

    this._el.innerHTML = `
      <div class="screen-content">
        <div class="app-logo">
          <span class="logo-icon">📖</span>
          <h1 class="app-title">Ditado<br>Inteligente</h1>
          <p class="app-subtitle">Vamos treinar sua escrita!</p>
        </div>

        ${hasRecord ? `
        <div class="record-banner" id="record-banner">
          <span class="record-banner__icon">🏆</span>
          <div class="record-banner__info">
            <div class="record-banner__label">Meu Recorde</div>
            <div class="record-banner__value">${data.bestScore}% de acertos</div>
          </div>
          <div class="record-banner__stats">
            <span class="record-stat">${data.totalGames} ${data.totalGames === 1 ? 'jogo' : 'jogos'}</span>
            <span class="record-stat">Média: ${this._storage.averagePercentage()}%</span>
          </div>
        </div>
        ` : ''}

        <div class="word-count-section">
          <h2 class="section-title">Quantas palavras?</h2>
          <p class="section-subtitle">Escolha a quantidade para praticar</p>
          <div class="word-count-grid" id="word-count-grid" role="group" aria-label="Escolha a quantidade de palavras">
          ${[10, 20, 30, 40, 50].map(n => `
            <button
              class="word-count-btn ${n === this._selectedCount ? 'selected' : ''}"
              data-count="${n}"
              aria-label="${n} palavras"
              aria-pressed="${n === this._selectedCount}"
            >
              <span class="word-count-btn__number">${n}</span>
              <span class="word-count-btn__label">palavras</span>
            </button>
          `).join('')}
          </div>
        </div>

        <button
          class="btn btn--primary btn--lg"
          id="btn-start"
          aria-label="Iniciar ditado com ${this._selectedCount} palavras"
        >
          <span class="btn__icon">✏️</span>
          Iniciar Ditado
        </button>
      </div>
    `;
  }

  _bindEvents() {
    const grid = this._el.querySelector('#word-count-grid');
    grid.addEventListener('click', e => {
      const btn = e.target.closest('.word-count-btn');
      if (!btn) return;
      this._selectedCount = parseInt(btn.dataset.count, 10);
      grid.querySelectorAll('.word-count-btn').forEach(b => {
        b.classList.toggle('selected', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      const startBtn = this._el.querySelector('#btn-start');
      startBtn.setAttribute('aria-label', `Iniciar ditado com ${this._selectedCount} palavras`);
    });

    this._el.querySelector('#btn-start').addEventListener('click', () => {
      this._onStart(this._selectedCount);
    });
  }

  /** Mostra a tela */
  show() {
    this._render();
    this._bindEvents();
    this._el.classList.add('active');
  }

  /** Esconde a tela */
  hide() {
    this._el.classList.remove('active');
  }
}
