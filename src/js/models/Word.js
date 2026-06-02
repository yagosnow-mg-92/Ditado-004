/**
 * Word - Modelo de uma palavra do ditado.
 */
class Word {
  /**
   * @param {string} text - Palavra correta
   */
  constructor(text) {
    this.text = text.trim().toLowerCase();
    this.userAnswer = '';
    this.answered = false;
  }

  /** Marca a resposta do usuário */
  setAnswer(answer) {
    this.userAnswer = answer.trim().toLowerCase();
    this.answered = true;
  }

  /** Retorna true se a resposta do usuário está correta */
  isCorrect() {
    return this.answered && this.userAnswer === this.text;
  }

  /** Retorna true se a palavra ainda não foi respondida */
  isPending() {
    return !this.answered;
  }
}
