/**
 * SpeechService - Wrapper para a Web Speech Synthesis API.
 */
class SpeechService {
  constructor() {
    this._synth = window.speechSynthesis;
    this._voice = null;
    this._ready = false;
    this._callbacks = { start: null, end: null };
    this._init();
  }

  _init() {
    if (!this._synth) {
      console.warn('[SpeechService] SpeechSynthesis não suportado neste navegador.');
      return;
    }
    const loadVoices = () => {
      const voices = this._synth.getVoices();
      // Preferir voz PT-BR
      this._voice =
        voices.find(v => v.lang === 'pt-BR') ||
        voices.find(v => v.lang.startsWith('pt')) ||
        voices[0] || null;
      this._ready = true;
    };
    loadVoices();
    this._synth.addEventListener('voiceschanged', loadVoices);
  }

  /**
   * Fala o texto fornecido.
   * @param {string} text
   * @param {{ rate?: number, pitch?: number }} options
   */
  speak(text, options = {}) {
    if (!this._synth) return;
    this._synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this._voice) utterance.voice = this._voice;
    utterance.lang = 'pt-BR';
    utterance.rate  = options.rate  ?? 0.85;
    utterance.pitch = options.pitch ?? 1.1;
    utterance.volume = 1;

    utterance.onstart = () => this._callbacks.start?.();
    utterance.onend   = () => this._callbacks.end?.();
    utterance.onerror = () => this._callbacks.end?.();

    this._synth.speak(utterance);
  }

  /** Para a fala atual */
  cancel() {
    this._synth?.cancel();
  }

  /** Registra callbacks de início/fim de fala */
  onStart(fn) { this._callbacks.start = fn; return this; }
  onEnd(fn)   { this._callbacks.end   = fn; return this; }

  /** Verifica se TTS está disponível */
  isSupported() {
    return !!this._synth;
  }
}
