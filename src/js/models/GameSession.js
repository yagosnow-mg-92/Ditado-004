/**
 * GameSession - Estado de uma sessão de ditado.
 */
class GameSession {
  /**
   * @param {Word[]} words - Lista de palavras da sessão
   */
  constructor(words) {
    this.words = words;
    this.currentIndex = 0;
    this.startedAt = Date.now();
    this.finishedAt = null;
  }

  /** Retorna a palavra atual */
  currentWord() {
    return this.words[this.currentIndex] || null;
  }

  /** Avança para a próxima palavra */
  advance() {
    this.currentIndex++;
  }

  /** Verifica se o ditado terminou */
  isFinished() {
    return this.currentIndex >= this.words.length;
  }

  /** Quantidade total de palavras */
  totalWords() {
    return this.words.length;
  }

  /** Quantidade de acertos */
  correctCount() {
    return this.words.filter(w => w.isCorrect()).length;
  }

  /** Quantidade de erros */
  errorCount() {
    return this.words.filter(w => w.answered && !w.isCorrect()).length;
  }

  /** Percentual de acertos (0-100) */
  percentage() {
    if (!this.totalWords()) return 0;
    return Math.round((this.correctCount() / this.totalWords()) * 100);
  }

  /** Lista de palavras com erros */
  errorWords() {
    return this.words.filter(w => w.answered && !w.isCorrect());
  }

  /** Marca a sessão como concluída */
  finish() {
    this.finishedAt = Date.now();
  }

  /** Progresso atual (0-100) */
  progressPercentage() {
    return Math.round((this.currentIndex / this.totalWords()) * 100);
  }
}
