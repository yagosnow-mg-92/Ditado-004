/**
 * DictationScreen - Tela de ditado.
 * Usa VirtualKeyboard (sem teclado nativo) e dois botões de áudio:
 *   🔊 Ouvir  — repete a palavra isolada
 *   💬 Na frase — fala uma frase contextualizando a palavra
 */
class DictationScreen {
  constructor(el, speechService, sentenceService, { onFinish }) {
    this._el              = el;
    this._speech          = speechService;
    this._sentences       = sentenceService;
    this._onFinish        = onFinish;
    this._session         = null;
    this._nivel           = 'facil';
    this._progressBar     = null;
    this._keyboard        = null;
    this._isSpeaking      = false;
  }

  startSession(session, nivel = 'facil') {
    this._session = session;
    this._nivel   = nivel;
    this._render();
    this._bindEvents();
    this._loadWord();
  }

  _render() {
    this._el.innerHTML = `
      <div class="screen-content screen-content--dictation">

        <!-- Badge de nível + Barra de progresso -->
        <div style="width:100%;display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
          <div id="progress-container" style="flex:1;"></div>
          <span class="nivel-badge nivel-badge--{{this._nivel}}" id="nivel-badge"></span>
        </div>

        <!-- Card de ditado -->
        <div class="dictation-card">

          <!-- Badge de nível -->
          <div class="nivel-badge-row" id="nivel-badge-row"></div>

          <!-- Ondas de áudio -->
          <div class="audio-wave idle" id="audio-wave">
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
          </div>

          <!-- Dois botões de áudio lado a lado -->
          <div class="audio-btn-row">
            <button class="btn btn--secondary btn--audio-half" id="btn-repeat"
              aria-label="Ouvir a palavra novamente">
              <span class="btn__icon">🔊</span>
              Ouvir
            </button>
            <button class="btn btn--orange btn--audio-half" id="btn-sentence"
              aria-label="Ouvir a palavra em uma frase">
              <span class="btn__icon">💬</span>
              Na frase
            </button>
          </div>

          <!-- Teclado virtual -->
          <div id="keyboard-container" style="width:100%;"></div>

        </div>
      </div>
    `;

    const progressContainer = this._el.querySelector('#progress-container');
    this._progressBar = new ProgressBar(progressContainer);

    const keyboardContainer = this._el.querySelector('#keyboard-container');
    this._keyboard = new VirtualKeyboard(keyboardContainer, {
      onConfirm: () => this._handleConfirm(),
      onChange:  () => {},
    });

    this._audioWave = this._el.querySelector('#audio-wave');

    // Badge de nível
    const nivelLabels = { facil: '🟢 Fácil', medio: '🟡 Médio', dificil: '🔴 Difícil' };
    const badgeRow = this._el.querySelector('#nivel-badge-row');
    if (badgeRow) {
      badgeRow.innerHTML = `<span class="nivel-badge nivel-badge--${this._nivel}">${nivelLabels[this._nivel] || ''}</span>`;
    }
  }

  _bindEvents() {
    this._el.querySelector('#btn-repeat').addEventListener('click', () => {
      if (!this._isSpeaking) this._speakCurrentWord();
    });

    this._el.querySelector('#btn-sentence').addEventListener('click', () => {
      if (!this._isSpeaking) this._speakInSentence();
    });

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
    const word = this._session.currentWord();
    if (!word) return;
    this._progressBar.update(this._session.currentIndex + 1, this._session.totalWords());
    this._keyboard.reset();
    this._keyboard.setEnabled(false);
    this._speakCurrentWord();
  }

  _speakCurrentWord() {
    const word = this._session.currentWord();
    if (word) this._speech.speak(word.text);
  }

  _speakInSentence() {
    const word = this._session.currentWord();
    if (!word) return;
    const sentence = this._sentences.getSentence(word.text);
    this._speech.speak(sentence, { rate: 0.82 });
  }

  _handleConfirm() {
    if (this._isSpeaking) return;
    const session = this._session;
    const word    = session.currentWord();
    if (!word) return;

    word.setAnswer(this._keyboard.getValue());
    session.advance();

    if (session.isFinished()) {
      session.finish();
      this._speech.cancel();
      this._onFinish(session);
    } else {
      this._loadWord();
    }
  }

  show() { this._el.classList.add('active'); }
  hide() { this._speech.cancel(); this._el.classList.remove('active'); }
}
