/**
 * GameEngine - Orquestra o fluxo do jogo.
 */
class GameEngine {
  /**
   * @param {{
   *   wordService:    WordService,
   *   speechService:  SpeechService,
   *   storageService: StorageService,
   * }} services
   * @param {{
   *   homeScreen:      HomeScreen,
   *   dictationScreen: DictationScreen,
   *   resultScreen:    ResultScreen,
   * }} screens
   */
  constructor(services, screens) {
    this._wordService    = services.wordService;
    this._speechService  = services.speechService;
    this._storageService = services.storageService;

    this._homeScreen      = screens.homeScreen;
    this._dictationScreen = screens.dictationScreen;
    this._resultScreen    = screens.resultScreen;

    this._currentSession = null;
  }

  /** Inicia o fluxo na tela inicial */
  start() {
    this._showHome();
  }

  _showHome() {
    this._resultScreen.hide();
    this._dictationScreen.hide();
    this._homeScreen.show();
  }

  /**
   * Inicia um ditado com N palavras.
   * @param {number} wordCount
   */
  startDictation(wordCount, nivel = 'facil') {
    const words   = this._wordService.createSessionWords(wordCount, nivel);
    const session = new GameSession(words);
    this._currentSession = session;

    this._currentNivel = nivel;
    this._homeScreen.hide();
    this._dictationScreen.show();
    this._dictationScreen.startSession(session, nivel);
  }

  /**
   * Finaliza o ditado e exibe o resultado.
   * @param {GameSession} session
   */
  finishDictation(session) {
    this._storageService.updateWithResult(session.percentage());

    this._dictationScreen.hide();
    this._resultScreen.show();
    this._resultScreen.showResult(session, this._currentNivel || 'facil');
  }

  /** Reinicia para a tela inicial */
  restart() {
    this._currentSession = null;
    this._showHome();
  }
}
