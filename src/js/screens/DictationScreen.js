/**
 * DictationScreen - Tela de ditado palavra por palavra.
 * Usa VirtualKeyboard para evitar sugestões do teclado nativo do celular.
 */
class DictationScreen {
  /**
   * @param {HTMLElement} el
   * @param {SpeechService} speechService
   * @param {{ onFinish: Function }} callbacks
   */
  constructor(el, speechService, { onFinish }) {
    this._el         = el;
    this._speech     = speechService;
    this._onFinish   = onFinish;
    this._session    = null;
    this._progressBar = null;
    this._keyboard   = null;
    this._isSpeaking = false;
  }

  /**
   * Inicializa a tela com uma sessão.
   * @param {GameSession} session
   */
  startSession(session) {
    this._session = session;
    this._render();
    this._bindEvents();
    this._loadWord();
  }

  _render() {
    this._el.innerHTML = `
      <div class="screen-content screen-content--dictation">

        <!-- Barra de progresso -->
        <div id="progress-container" style="width:100%;"></div>

        <!-- Card principal -->
        <div class="dictation-card">

          <!-- Zona de áudio: ondas + botão ouvir -->
          <div class="audio-zone">
            <div class="audio-wave idle" id="audio-wave">
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
            </div>
            <button
              class="btn btn--secondary btn--listen"
              id="btn-repeat"
              aria-label="Ouvir a palavra novamente"
            >
              <span class="btn__icon">🔊</span>
              Ouvir Novamente
            </button>
          </div>

          <!-- Teclado virtual (inclui display + teclas + botão OK) -->
          <div id="keyboard-container" style="width:100%;"></div>

        </div>
      </div>
    `;

    // Progress bar
    const progressContainer = this._el.querySelector('#progress-container');
    this._progressBar = new ProgressBar(progressContainer);

    // Teclado virtual
    const keyboardContainer = this._el.querySelector('#keyboard-container');
    this._keyboard = new VirtualKeyboard(keyboardContainer, {
      onConfirm: () => this._handleConfirm(),
      onChange:  () => {},
    });

    this._audioWave = this._el.querySelector('#audio-wave');
  }

  _bindEvents() {
    this._el.querySelector('#btn-repeat').addEventListener('click', () => {
      this._speakCurrentWord();
    });

    // Callbacks de fala
    this._speech
      .onStart(() => {
        this._isSpeaking = true;
        this._audioWave.classList.remove('idle');
        this._audioWave.classList.add('speaking');
        this._keyboard.setEnabled(false);
      })
      .onEnd(() => {
        this._isSpeaking = false;
        this._audioWave.classList.remove('speaking');
        this._audioWave.classList.add('idle');
        this._keyboard.setEnabled(true);
      });
  }

  _loadWord() {
    const session = this._session;
    const word    = session.currentWord();
    if (!word) return;

    this._progressBar.update(session.currentIndex + 1, session.totalWords());
    this._keyboard.reset();
    this._keyboard.setEnabled(false);
    this._speakCurrentWord();
  }

  _speakCurrentWord() {
    const word = this._session.currentWord();
    if (!word) return;
    this._speech.speak(word.text);
  }

  _handleConfirm() {
    if (this._isSpeaking) return;

    const session = this._session;
    const word    = session.currentWord();
    if (!word) return;

    const answer = this._keyboard.getValue();
    word.setAnswer(answer);
    session.advance();

    if (session.isFinished()) {
      session.finish();
      this._speech.cancel();
      this._onFinish(session);
    } else {
      this._loadWord();
    }
  }

  /** Mostra a tela */
  show() {
    this._el.classList.add('active');
  }

  /** Esconde a tela */
  hide() {
    this._speech.cancel();
    this._el.classList.remove('active');
  }
}
