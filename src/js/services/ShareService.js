/**
 * ShareService - Gera e compartilha o resultado do ditado.
 *
 * Estratégia:
 *  1. Gera um arquivo HTML completo e bonito com o resultado
 *  2. Tenta compartilhar via Web Share API (abre WhatsApp nativo no celular)
 *  3. Se não suportado, faz download do arquivo HTML
 */
class ShareService {

  /**
   * @param {GameSession} session
   * @param {string} nivel - 'facil' | 'medio' | 'dificil'
   * @param {ValidationService} validationService
   */
  async share(session, nivel, validationService) {
    const html = this._buildHtml(session, nivel, validationService);
    const blob = new Blob([html], { type: 'text/html' });
    const file = new File([blob], 'meu-resultado-ditado.html', { type: 'text/html' });

    // Tenta Web Share API com arquivo (funciona no Android/iOS com WhatsApp)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Meu resultado no Ditado Inteligente!',
          files: [file],
        });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return; // usuário cancelou
      }
    }

    // Fallback: Web Share sem arquivo (só texto + link)
    const texto = this._buildTexto(session, nivel);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ditado Inteligente', text: texto });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }

    // Fallback final: download do HTML
    this._download(blob, 'meu-resultado-ditado.html');
  }

  // ─── Texto resumido (fallback) ────────────────────────────────
  _buildTexto(session, nivel) {
    const nivelLabel = { facil: '🟢 Fácil', medio: '🟡 Médio', dificil: '🔴 Difícil' }[nivel] || nivel;
    const pct    = session.percentage();
    const medal  = Helpers.getMedal(pct);
    const erros  = session.errorWords();
    const certas = session.words.filter(w => w.isCorrect());

    let txt = `📖 *Ditado Inteligente*\n`;
    txt += `${nivelLabel} | ${medal.emoji} ${medal.label}\n`;
    txt += `✅ ${session.correctCount()} de ${session.totalWords()} palavras corretas (${pct}%)\n\n`;

    if (certas.length) {
      txt += `✅ *Acertei:* ${certas.map(w => w.text).join(', ')}\n\n`;
    }
    if (erros.length) {
      txt += `❌ *Errei:*\n`;
      erros.forEach(w => { txt += `  • ${w.text} (escrevi: ${w.userAnswer || '—'})\n`; });
    }
    return txt;
  }

  // ─── Download forçado ─────────────────────────────────────────
  _download(blob, nome) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nome; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  // ─── Geração do HTML completo ─────────────────────────────────
  _buildHtml(session, nivel, validationService) {
    const pct    = session.percentage();
    const medal  = Helpers.getMedal(pct);
    const stars  = Helpers.getStars(pct);
    const nivelLabel = { facil: '🟢 Fácil', medio: '🟡 Médio', dificil: '🔴 Difícil' }[nivel] || nivel;
    const nivelCor   = { facil: '#2E7D32', medio: '#E65100', dificil: '#B71C1C' }[nivel] || '#333';
    const nivelBg    = { facil: '#E8F5E9', medio: '#FFF9C4', dificil: '#FFEBEE' }[nivel] || '#fff';

    const data = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    // Construir linhas de cada palavra
    const linhasPalavras = session.words.map(w => {
      const ok = w.isCorrect();
      if (ok) {
        return `
          <div class="word-row word-row--ok">
            <span class="word-num-badge ok">✓</span>
            <div class="word-pair">
              <span class="word-typed ok-text">${this._esc(w.text)}</span>
              <span class="word-arrow">→</span>
              <span class="word-correct ok-text">${this._esc(w.text)}</span>
            </div>
            <span class="word-status ok">CERTO</span>
          </div>`;
      } else {
        const { userHtml, correctHtml } = validationService.diffHtml(
          w.userAnswer || '', w.text
        );
        return `
          <div class="word-row word-row--err">
            <span class="word-num-badge err">✗</span>
            <div class="word-pair">
              <span class="word-typed">${userHtml || '<em class="vazio">—</em>'}</span>
              <span class="word-arrow">→</span>
              <span class="word-correct">${correctHtml}</span>
            </div>
            <span class="word-status err">ERRADO</span>
          </div>`;
      }
    }).join('');

    const starHtml = [0,1,2].map(i =>
      `<span class="star ${i < stars ? 'on' : ''}">${i < stars ? '⭐' : '☆'}</span>`
    ).join('');

    const scoreBar = `<div class="score-bar"><div class="score-fill" style="width:${pct}%"></div></div>`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Resultado — Ditado Inteligente</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
    background: linear-gradient(160deg, #EEF6FF 0%, #F0FAF0 50%, #FFFBEA 100%);
    min-height: 100vh;
    padding: 20px 16px 40px;
    color: #1a2a3a;
  }
  .card {
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 4px 32px rgba(74,144,217,.15);
    max-width: 600px;
    margin: 0 auto;
    overflow: hidden;
  }
  /* Header */
  .header {
    background: linear-gradient(135deg, #4A90D9 0%, #7BB8F0 100%);
    padding: 28px 24px 20px;
    text-align: center;
    color: #fff;
  }
  .header-app { font-size: 13px; opacity: .8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .header-title { font-size: 26px; font-weight: 900; }
  .header-date  { font-size: 12px; opacity: .7; margin-top: 4px; }
  /* Level badge */
  .nivel-badge {
    display: inline-block;
    padding: 5px 16px;
    border-radius: 99px;
    font-size: 13px;
    font-weight: 800;
    background: ${nivelBg};
    color: ${nivelCor};
    margin: 16px auto 0;
    border: 2px solid ${nivelCor}40;
  }
  /* Score section */
  .score-section {
    padding: 24px 24px 16px;
    text-align: center;
    border-bottom: 2px dashed #e8eef5;
  }
  .medal { font-size: 52px; }
  .score-pct { font-size: 48px; font-weight: 900; color: #4A90D9; line-height: 1; margin: 8px 0 4px; }
  .score-sub { font-size: 15px; color: #666; }
  .score-bar { background: #e8eef5; border-radius: 99px; height: 12px; margin: 14px 0 4px; overflow: hidden; }
  .score-fill { height: 100%; background: linear-gradient(90deg, #5DBB63, #8DD492); border-radius: 99px; transition: width 1s; }
  .score-counts { font-size: 13px; color: #888; }
  .stars { font-size: 28px; margin-top: 10px; letter-spacing: 4px; }
  .star.on { filter: none; }
  .star:not(.on) { opacity: .25; }
  /* Summary chips */
  .chips { display: flex; gap: 10px; justify-content: center; padding: 16px 24px; flex-wrap: wrap; }
  .chip { border-radius: 99px; padding: 6px 16px; font-size: 13px; font-weight: 800; }
  .chip-ok  { background: #E8F5E9; color: #2E7D32; }
  .chip-err { background: #FFEBEE; color: #B71C1C; }
  /* Words list */
  .words-header {
    padding: 12px 24px 8px;
    font-size: 13px; font-weight: 800; color: #888;
    text-transform: uppercase; letter-spacing: .5px;
    border-top: 2px dashed #e8eef5;
    display: flex; justify-content: space-between;
  }
  .word-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 20px;
    border-bottom: 1px solid #f0f4f8;
    font-size: 14px;
  }
  .word-row:last-child { border-bottom: none; }
  .word-row--ok  { background: #F9FFF9; }
  .word-row--err { background: #FFFAFA; }
  .word-num-badge {
    width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900; flex-shrink: 0;
  }
  .word-num-badge.ok  { background: #E8F5E9; color: #2E7D32; }
  .word-num-badge.err { background: #FFEBEE; color: #B71C1C; }
  .word-pair { display: flex; align-items: center; gap: 6px; flex: 1; flex-wrap: wrap; }
  .word-typed   { font-weight: 700; }
  .word-correct { font-weight: 700; }
  .word-arrow   { color: #aaa; font-size: 12px; }
  .ok-text   { color: #2E7D32; }
  .word-status {
    font-size: 10px; font-weight: 900; letter-spacing: .5px;
    padding: 2px 8px; border-radius: 99px; flex-shrink: 0;
    text-transform: uppercase;
  }
  .word-status.ok  { background: #E8F5E9; color: #2E7D32; }
  .word-status.err { background: #FFEBEE; color: #B71C1C; }
  .vazio { font-style: italic; color: #ccc; }
  /* Diff colors (matches game) */
  .char-correct { color: #3A9B41; font-weight: 800; }
  .char-wrong   { color: #E05252; font-weight: 800; background: rgba(224,82,82,.1); border-radius: 2px; padding: 0 1px; }
  .char-missing { color: #E05252; font-weight: 800; text-decoration: underline; }
  .char-neutral { color: #1a2a3a; }
  /* Footer */
  .footer {
    padding: 20px 24px;
    text-align: center;
    font-size: 12px; color: #aaa;
    background: #f7f9fc;
    border-top: 1px solid #e8eef5;
  }
  .footer strong { color: #4A90D9; }
</style>
</head>
<body>
<div class="card">

  <div class="header">
    <div class="header-app">📖 Ditado Inteligente</div>
    <div class="header-title">Meu Resultado</div>
    <div class="header-date">${data}</div>
    <div class="nivel-badge">${nivelLabel}</div>
  </div>

  <div class="score-section">
    <div class="medal">${medal.emoji}</div>
    <div class="score-pct">${pct}%</div>
    <div class="score-sub">${medal.label} — ${session.correctCount()} de ${session.totalWords()} palavras corretas</div>
    ${scoreBar}
    <div class="score-counts">${session.correctCount()} acertos · ${session.errorCount()} erros</div>
    <div class="stars">${starHtml}</div>
  </div>

  <div class="chips">
    <span class="chip chip-ok">✅ ${session.correctCount()} corretas</span>
    <span class="chip chip-err">❌ ${session.errorCount()} erradas</span>
  </div>

  <div class="words-header">
    <span>Palavra</span>
    <span>O que escrevi → Correto</span>
  </div>
  ${linhasPalavras}

  <div class="footer">
    Gerado pelo <strong>Ditado Inteligente</strong> · Treine sua escrita todo dia!
  </div>

</div>
</body>
</html>`;
  }

  _esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
}
