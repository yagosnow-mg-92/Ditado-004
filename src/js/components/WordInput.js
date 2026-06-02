/**
 * WordInput - Campo de digitação da resposta.
 */
class WordInput {
  /**
   * @param {HTMLElement} container
   * @param {{ onConfirm: Function }} callbacks
   */
  constructor(container, { onConfirm }) {
    this._container = container;
    this._onConfirm = onConfirm;
    this._render();
    this._bindEvents();
  }

  _render() {
    this._container.innerHTML = `
      <div class="word-input-wrapper">
        <input
          type="text"
          class="word-input"
          id="word-input"
          placeholder="Digite a palavra..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          aria-label="Digite a palavra que você ouviu"
        />
      </div>
    `;
    this._input = this._container.querySelector('#word-input');
  }

  _bindEvents() {
    this._input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._onConfirm(this.getValue());
      }
    });
  }

  /** Retorna o valor atual do input */
  getValue() {
    return this._input.value;
  }

  /** Limpa e foca o campo */
  reset() {
    this._input.value = '';
    setTimeout(() => this._input.focus(), 100);
  }

  /** Foca o campo */
  focus() {
    this._input.focus();
  }

  /** Habilita ou desabilita o input */
  setEnabled(enabled) {
    this._input.disabled = !enabled;
  }
}
