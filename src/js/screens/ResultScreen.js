/**
 * ResultScreen - Tela de resultado do ditado.
 */
class ResultScreen {
  constructor(el, validationService, confettiService, shareService, { onRestart }) {
    this._el             = el;
    this._validation     = validationService;
    this._confetti       = confettiService;
    this._shareService   = shareService;
    this._onRestart      = onRestart;
    this._session        = null;
    this._nivel          = 'facil';
  }

  showResult(session, nivel = 'facil') {
    this._session = session;
    this._nivel   = nivel;
    const pct    = session.percentage();
    const medal  = Helpers.getMedal(pct);
    const stars  = Helpers.getStars(pct);
    const errors = session.errorWords();

    this._render(session, pct, medal, stars, nivel);
    this._renderErrors(errors);

    if (pct >= 70) setTimeout(() => this._confetti.fire(), 400);
  }

  _render(session, pct, medal, stars, nivel) {
    const nivelLabel = { facil: '🟢 Fácil', medio: '🟡 Médio', dificil: '🔴 Difícil' }[nivel] || nivel;
    const nivelClass = `nivel-badge nivel-badge--${nivel}`;

    const starIcons = [0,1,2].map(i =>
      `<span class="star ${i < stars ? 'active' : ''}" aria-hidden="true">⭐</span>`
    ).join('');

    this._el.innerHTML = `
      <div class="screen-content screen-content--wide">

        <div class="result-hero">
          <span class="result-medal">${medal.emoji}</span>
          <h2 class="result-congrats">
            ${pct >= 90 ? 'Perfeito! 🎉' : pct >= 70 ? 'Muito bem! 👏' : pct >= 50 ? 'Continue assim! 💪' : 'Vamos praticar mais! 📚'}
          </h2>
          <span class="${nivelClass}">${nivelLabel}</span>
        </div>

        <div class="result-score-card">
          <div class="score-circle">
            <span class="score-circle__pct">${pct}%</span>
            <span class="score-circle__label">acertos</span>
          </div>
          <div class="score-details">
            <div class="score-details__main">
              <span>${session.correctCount()}</span> de ${session.totalWords()} palavras corretas
            </div>
            <div class="score-details__sub">Medalha: ${medal.label}</div>
          </div>
        </div>

        <div class="star-row" aria-label="${stars} estrelas de 3">
          ${starIcons}
        </div>

        <div id="result-grid-container" style="width:100%;"></div>

        <!-- Botões de ação -->
        <div class="result-action-buttons">

          <button class="btn btn--share" id="btn-share"
            aria-label="Compartilhar resultado no WhatsApp">
            <span class="btn__icon">📤</span>
            Compartilhar resultado
          </button>

          <button class="btn btn--primary btn--lg" id="btn-restart"
            aria-label="Jogar novamente">
            <span class="btn__icon">🔄</span>
            Jogar Novamente
          </button>

        </div>
      </div>
    `;

    this._el.querySelector('#btn-restart').addEventListener('click', () => this._onRestart());

    this._el.querySelector('#btn-share').addEventListener('click', () => this._handleShare());
  }

  async _handleShare() {
    const btn = this._el.querySelector('#btn-share');
    const original = btn.innerHTML;
    btn.innerHTML = '<span class="btn__icon">⏳</span> Preparando...';
    btn.disabled = true;

    try {
      await this._shareService.share(this._session, this._nivel, this._validation);
    } catch(e) {
      console.error('Share error:', e);
    }

    btn.innerHTML = original;
    btn.disabled = false;
  }

  _renderErrors(errors) {
    const container = this._el.querySelector('#result-grid-container');
    const grid = new ResultGrid(container, this._validation);
    grid.render(errors);
  }

  show() {
    this._el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  hide() {
    this._el.classList.remove('active');
  }
}
