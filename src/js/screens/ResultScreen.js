/**
 * ResultScreen - Tela de resultado do ditado.
 */
class ResultScreen {
  /**
   * @param {HTMLElement} el
   * @param {ValidationService} validationService
   * @param {ConfettiService} confettiService
   * @param {{ onRestart: Function }} callbacks
   */
  constructor(el, validationService, confettiService, { onRestart }) {
    this._el = el;
    this._validation = validationService;
    this._confetti   = confettiService;
    this._onRestart  = onRestart;
    this._resultGrid = null;
  }

  /**
   * Exibe o resultado de uma sessão.
   * @param {GameSession} session
   */
  showResult(session) {
    const pct    = session.percentage();
    const medal  = Helpers.getMedal(pct);
    const stars  = Helpers.getStars(pct);
    const errors = session.errorWords();

    this._render(session, pct, medal, stars);
    this._renderErrors(errors);

    if (pct >= 70) {
      setTimeout(() => this._confetti.fire(), 400);
    }
  }

  _render(session, pct, medal, stars) {
    const starIcons = [0, 1, 2].map(i =>
      `<span class="star ${i < stars ? 'active' : ''}" aria-hidden="true">⭐</span>`
    ).join('');

    this._el.innerHTML = `
      <div class="screen-content screen-content--wide">
        <div class="result-hero">
          <span class="result-medal">${medal.emoji}</span>
          <h2 class="result-congrats">
            ${pct >= 90 ? 'Perfeito! 🎉' : pct >= 70 ? 'Muito bem! 👏' : pct >= 50 ? 'Continue assim! 💪' : 'Vamos praticar mais! 📚'}
          </h2>
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

        <div class="action-buttons" style="margin-top: var(--space-md);">
          <button
            class="btn btn--primary btn--lg"
            id="btn-restart"
            aria-label="Jogar novamente"
          >
            <span class="btn__icon">🔄</span>
            Jogar Novamente
          </button>
        </div>
      </div>
    `;

    this._el.querySelector('#btn-restart').addEventListener('click', () => {
      this._onRestart();
    });
  }

  _renderErrors(errors) {
    const container = this._el.querySelector('#result-grid-container');
    this._resultGrid = new ResultGrid(container, this._validation);
    this._resultGrid.render(errors);
  }

  /** Mostra a tela */
  show() {
    this._el.classList.add('active');
    // Rola para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Esconde a tela */
  hide() {
    this._el.classList.remove('active');
  }
}
