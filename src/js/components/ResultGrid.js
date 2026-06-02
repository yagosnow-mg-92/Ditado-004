/**
 * ResultGrid - Tabela/cards de erros na tela de resultado.
 */
class ResultGrid {
  /**
   * @param {HTMLElement} container
   * @param {ValidationService} validationService
   */
  constructor(container, validationService) {
    this._container = container;
    this._validation = validationService;
  }

  /**
   * Renderiza a lista de erros.
   * @param {Word[]} errorWords
   */
  render(errorWords) {
    if (!errorWords.length) {
      this._container.innerHTML = `
        <div class="all-correct-msg">
          <span class="all-correct-msg__icon">🎉</span>
          <span class="all-correct-msg__text">Você não errou nenhuma palavra! Incrível!</span>
        </div>
      `;
      return;
    }

    const tableRows = errorWords.map(w => {
      const { userHtml, correctHtml } = this._validation.diffHtml(w.userAnswer, w.text);
      return `
        <tr>
          <td>${userHtml}</td>
          <td>${correctHtml}</td>
        </tr>
      `;
    }).join('');

    const cardItems = errorWords.map(w => {
      const { userHtml, correctHtml } = this._validation.diffHtml(w.userAnswer, w.text);
      return `
        <div class="error-card">
          <div class="error-card__row">
            <div class="error-card__col">
              <div class="error-card__label">Você escreveu</div>
              <div class="error-card__word">${userHtml}</div>
            </div>
            <div class="error-card__divider"></div>
            <div class="error-card__col">
              <div class="error-card__label">Correto</div>
              <div class="error-card__word">${correctHtml}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this._container.innerHTML = `
      <div class="error-section">
        <h3 class="error-section__title">
          📋 Palavras para revisar
          <span class="error-count-badge">${errorWords.length}</span>
        </h3>

        <table class="error-table" aria-label="Tabela de erros">
          <thead>
            <tr>
              <th>Você escreveu</th>
              <th>Correto</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>

        <div class="error-cards">${cardItems}</div>
      </div>
    `;
  }
}
