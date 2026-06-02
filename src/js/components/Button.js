/**
 * Button - Componente de botão reutilizável.
 */
class Button {
  /**
   * @param {HTMLElement} el - Elemento button existente no DOM
   * @param {{ onClick: Function }} options
   */
  constructor(el, { onClick } = {}) {
    this._el = el;
    if (onClick) this._el.addEventListener('click', onClick);
  }

  setEnabled(enabled) {
    this._el.disabled = !enabled;
  }

  setText(text) {
    this._el.textContent = text;
  }

  setHTML(html) {
    this._el.innerHTML = html;
  }

  show() { this._el.style.display = ''; }
  hide() { this._el.style.display = 'none'; }
}
