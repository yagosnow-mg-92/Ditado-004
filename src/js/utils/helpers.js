/**
 * Utilitários gerais do sistema.
 */
const Helpers = {
  /**
   * Retorna o emoji da medalha baseado no percentual.
   * @param {number} pct
   * @returns {{ emoji: string, label: string, color: string }}
   */
  getMedal(pct) {
    if (pct >= 90) return { emoji: '🥇', label: 'Ouro',   color: 'var(--color-gold)'   };
    if (pct >= 70) return { emoji: '🥈', label: 'Prata',  color: 'var(--color-silver)' };
    if (pct >= 50) return { emoji: '🥉', label: 'Bronze', color: 'var(--color-bronze)' };
    return           { emoji: '📝', label: 'Treino', color: 'var(--color-blue)'   };
  },

  /**
   * Retorna número de estrelas (0-3) baseado no percentual.
   * @param {number} pct
   * @returns {number}
   */
  getStars(pct) {
    if (pct >= 90) return 3;
    if (pct >= 70) return 2;
    if (pct >= 50) return 1;
    return 0;
  },

  /**
   * Aguarda N milissegundos.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Clamp: garante que value está entre min e max.
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
};
