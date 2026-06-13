/**
 * App - Ponto de entrada da aplicação.
 * Instancia serviços, telas e o motor do jogo.
 */
class App {
  constructor() {
    this._init();
  }

  _init() {
    // ── Serviços ──────────────────────────────────────────
    const wordService    = new WordService();
    const speechService  = new SpeechService();
    const storageService = new StorageService();
    const validationService = new ValidationService();
    const confettiService   = new ConfettiService();
    const sentenceService   = new SentenceService();
    const shareService      = new ShareService();

    // ── Elementos DOM das telas ───────────────────────────
    const homeEl      = document.getElementById('screen-home');
    const dictationEl = document.getElementById('screen-dictation');
    const resultEl    = document.getElementById('screen-result');

    // ── Criar engine para referencias de callback ─────────
    // (forward reference: engine é criado após os screens)
    let engine;

    // ── Telas ─────────────────────────────────────────────
    const homeScreen = new HomeScreen(homeEl, storageService, {
      onStart: (count, nivel) => engine.startDictation(count, nivel),
    });

    const dictationScreen = new DictationScreen(dictationEl, speechService, sentenceService, {
      onFinish: (session) => engine.finishDictation(session),
    });

    const resultScreen = new ResultScreen(resultEl, validationService, confettiService, shareService, {
      onRestart: () => engine.restart(),
    });

    // ── Motor do jogo ─────────────────────────────────────
    engine = new GameEngine(
      { wordService, speechService, storageService },
      { homeScreen, dictationScreen, resultScreen }
    );

    engine.start();
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => new App());
