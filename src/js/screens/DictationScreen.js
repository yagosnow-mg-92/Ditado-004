/**
 * DictationScreen - Tela de ditado palavra por palavra.
 */
class DictationScreen {
  /**
   * @param {HTMLElement} el
   * @param {SpeechService} speechService
   * @param {{ onFinish: Function }} callbacks
   */
  constructor(el, speechService, { onFinish }) {
    this._el = el;
    this._speech = speechService;
    this._onFinish = onFinish;
    this._session = null;
    this._progressBar = null;
    this._wordInput = null;
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
      <div class="screen-content">
        <div id="progress-container" style="width:100%;"></div>

        <div class="dictation-card">
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
              class="btn btn--secondary"
              id="btn-repeat"
              aria-label="Ouvir a palavra novamente"
            >
              <span class="btn__icon">🔊</span>
              Ouvir Novamente
            </button>
          </div>

          <div id="input-container" style="width:100%;"></div>

          <div class="action-buttons">
            <button
              class="btn btn--primary"
              id="btn-confirm"

              aria-label="Confirmar palavra e avançar"
            >
              <span class="btn__icon">✔</span>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    `;

    // Instanciar subcomponentes
    const progressContainer = this._el.querySelector('#progress-container');
    this._progressBar = new ProgressBar(progressContainer);

    const inputContainer = this._el.querySelector('#input-container');
    this._wordInput = new WordInput(inputContainer, {
      onConfirm: () => this._handleConfirm(),
    });

    this._audioWave   = this._el.querySelector('#audio-wave');
  }

  _bindEvents() {
    this._el.querySelector('#btn-repeat').addEventListener('click', () => {
      this._speakCurrentWord();
    });

    this._el.querySelector('#btn-confirm').addEventListener('click', () => {
      this._handleConfirm();
    });

    // Callbacks de fala
    this._speech
      .onStart(() => {
        this._isSpeaking = true;
        this._audioWave.classList.remove('idle');
        this._audioWave.classList.add('speaking');
        this._wordInput.setEnabled(false);
      })
      .onEnd(() => {
        this._isSpeaking = false;
        this._audioWave.classList.remove('speaking');
        this._audioWave.classList.add('idle');
        this._wordInput.setEnabled(true);
        this._wordInput.focus();
      });
  }

  _loadWord() {
    const session = this._session;
    const word    = session.currentWord();
    if (!word) return;

    // Atualiza progresso (1-based)
    this._progressBar.update(session.currentIndex + 1, session.totalWords());

    // Limpa campo
    this._wordInput.reset();
    this._wordInput.setEnabled(false);

    // Fala a palavra automaticamente
    this._speakCurrentWord();
  }

  _speakCurrentWord() {
    const word = this._session.currentWord();
    if (!word) return;
    this._speech.speak(word.text);
  }

  _handleConfirm() {
    if (this._isSpeaking) return;

    const session  = this._session;
    const word     = session.currentWord();
    if (!word) return;

    const answer = this._wordInput.getValue();
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
