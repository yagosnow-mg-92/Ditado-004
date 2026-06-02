/**
 * StorageService - Persistência de dados com localStorage.
 */
class StorageService {
  constructor() {
    this._KEY = 'ditado_inteligente_data';
    this._defaults = {
      bestScore:   0,
      totalGames:  0,
      totalPct:    0,
    };
  }

  /** Retorna todos os dados salvos */
  load() {
    try {
      const raw = localStorage.getItem(this._KEY);
      return raw ? { ...this._defaults, ...JSON.parse(raw) } : { ...this._defaults };
    } catch {
      return { ...this._defaults };
    }
  }

  /** Salva todos os dados */
  save(data) {
    try {
      localStorage.setItem(this._KEY, JSON.stringify(data));
    } catch {
      console.warn('[StorageService] Não foi possível salvar os dados.');
    }
  }

  /**
   * Atualiza os dados com o resultado de uma sessão.
   * @param {number} percentage - percentual de acertos (0-100)
   */
  updateWithResult(percentage) {
    const data = this.load();
    data.totalGames += 1;
    data.totalPct   += percentage;
    if (percentage > data.bestScore) {
      data.bestScore = percentage;
    }
    this.save(data);
  }

  /** Retorna percentual médio */
  averagePercentage() {
    const data = this.load();
    if (!data.totalGames) return 0;
    return Math.round(data.totalPct / data.totalGames);
  }

  /** Retorna o melhor score */
  bestScore() {
    return this.load().bestScore;
  }

  /** Retorna total de jogos */
  totalGames() {
    return this.load().totalGames;
  }
}
