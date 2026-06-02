/**
 * ValidationService - Comparação e highlight de diferenças entre palavras.
 */
class ValidationService {
  /**
   * Compara a resposta do usuário com o texto correto,
   * retornando HTML com as diferenças destacadas.
   *
   * @param {string} userText
   * @param {string} correctText
   * @returns {{ userHtml: string, correctHtml: string }}
   */
  diffHtml(userText, correctText) {
    return {
      userHtml:    this._buildUserHtml(userText, correctText),
      correctHtml: this._buildCorrectHtml(userText, correctText),
    };
  }

  /**
   * Gera HTML do texto do usuário com letras erradas em vermelho.
   */
  _buildUserHtml(user, correct) {
    let html = '';
    const len = Math.max(user.length, correct.length);
    for (let i = 0; i < user.length; i++) {
      const cls = i < correct.length && user[i] === correct[i]
        ? 'char-neutral'
        : 'char-wrong';
      html += `<span class="${cls}">${this._esc(user[i])}</span>`;
    }
    return html || `<span class="char-wrong">—</span>`;
  }

  /**
   * Gera HTML do texto correto com letras que o usuário acertou em verde
   * e letras faltantes sublinhadas.
   */
  _buildCorrectHtml(user, correct) {
    let html = '';
    for (let i = 0; i < correct.length; i++) {
      if (i < user.length && user[i] === correct[i]) {
        html += `<span class="char-correct">${this._esc(correct[i])}</span>`;
      } else {
        html += `<span class="char-missing">${this._esc(correct[i])}</span>`;
      }
    }
    return html;
  }

  /** Escapa caracteres HTML especiais */
  _esc(ch) {
    return ch
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
