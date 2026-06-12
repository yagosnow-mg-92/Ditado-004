/**
 * HomeScreen - Tela de configuração do ditado.
 * Permite escolher quantidade de palavras E nível de dificuldade.
 */
class HomeScreen {
  constructor(el, storageService, { onStart }) {
    this._el             = el;
    this._storage        = storageService;
    this._onStart        = onStart;
    this._selectedCount  = 10;
    this._selectedNivel  = 'facil';
    this._render();
    this._bindEvents();
  }

  _render() {
    const data      = this._storage.load();
    const hasRecord = data.totalGames > 0;

    this._el.innerHTML = `
      <div class="screen-content">

        <!-- Logo -->
        <div class="app-logo">
          <span class="logo-icon">📖</span>
          <h1 class="app-title">Ditado<br>Inteligente</h1>
          <p class="app-subtitle">Vamos treinar sua escrita!</p>
        </div>

        <!-- Recorde -->
        ${hasRecord ? `
        <div class="record-banner">
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

        <!-- Seleção de nível -->
        <div class="word-count-section">
          <h2 class="section-title">Nível de dificuldade</h2>
          <p class="section-subtitle">Escolha o desafio que você quer enfrentar</p>

          <div class="nivel-grid" id="nivel-grid" role="group" aria-label="Nível de dificuldade">

            <button class="nivel-btn nivel-btn--facil selected" data-nivel="facil"
              aria-pressed="true" aria-label="Nível Fácil">
              <span class="nivel-btn__icon">🟢</span>
              <span class="nivel-btn__label">Fácil</span>
              <span class="nivel-btn__desc">palavras simples<br>do dia a dia</span>
            </button>

            <button class="nivel-btn nivel-btn--medio" data-nivel="medio"
              aria-pressed="false" aria-label="Nível Médio">
              <span class="nivel-btn__icon">🟡</span>
              <span class="nivel-btn__label">Médio</span>
              <span class="nivel-btn__desc">acentos e<br>dígrafos</span>
            </button>

            <button class="nivel-btn nivel-btn--dificil" data-nivel="dificil"
              aria-pressed="false" aria-label="Nível Difícil">
              <span class="nivel-btn__icon">🔴</span>
              <span class="nivel-btn__label">Difícil</span>
              <span class="nivel-btn__desc">palavras longas<br>e complexas</span>
            </button>

          </div>
        </div>

        <!-- Seleção de quantidade -->
        <div class="word-count-section">
          <h2 class="section-title">Quantas palavras?</h2>
          <p class="section-subtitle">Escolha a quantidade para praticar</p>

          <div class="word-count-grid" id="word-count-grid"
            role="group" aria-label="Quantidade de palavras">
            ${[10, 20, 30, 40, 50].map(n => `
              <button class="word-count-btn ${n === 10 ? 'selected' : ''}"
                data-count="${n}" aria-label="${n} palavras" aria-pressed="${n === 10}">
                <span class="word-count-btn__number">${n}</span>
                <span class="word-count-btn__label">palavras</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Botão iniciar -->
        <button class="btn btn--primary btn--lg" id="btn-start"
          aria-label="Iniciar ditado nível fácil com 10 palavras">
          <span class="btn__icon">✏️</span>
          Iniciar Ditado
        </button>

      </div>
    `;
  }

  _bindEvents() {
    // Seleção de nível
    const nivelGrid = this._el.querySelector('#nivel-grid');
    nivelGrid.addEventListener('click', e => {
      const btn = e.target.closest('.nivel-btn');
      if (!btn) return;
      this._selectedNivel = btn.dataset.nivel;
      nivelGrid.querySelectorAll('.nivel-btn').forEach(b => {
        b.classList.toggle('selected', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      this._updateStartButton();
    });

    // Seleção de quantidade
    const countGrid = this._el.querySelector('#word-count-grid');
    countGrid.addEventListener('click', e => {
      const btn = e.target.closest('.word-count-btn');
      if (!btn) return;
      this._selectedCount = parseInt(btn.dataset.count, 10);
      countGrid.querySelectorAll('.word-count-btn').forEach(b => {
        b.classList.toggle('selected', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      this._updateStartButton();
    });

    // Iniciar
    this._el.querySelector('#btn-start').addEventListener('click', () => {
      this._onStart(this._selectedCount, this._selectedNivel);
    });
  }

  _updateStartButton() {
    const labels = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
    const btn = this._el.querySelector('#btn-start');
    if (btn) {
      btn.setAttribute('aria-label',
        `Iniciar ditado nível ${labels[this._selectedNivel]} com ${this._selectedCount} palavras`);
    }
  }

  show() {
    this._render();
    this._bindEvents();
    this._el.classList.add('active');
  }

  hide() {
    this._el.classList.remove('active');
  }
}
