/**
 * SpeechService - Wrapper para a Web Speech Synthesis API.
 */
class SpeechService {
  constructor() {
    this._synth     = window.speechSynthesis;
    this._voice     = null;
    this._ready     = false;
    this._callbacks = { start: null, end: null };
    this._spelling  = false;
    this._init();
  }

  _init() {
    if (!this._synth) {
      console.warn('[SpeechService] SpeechSynthesis não suportado.');
      return;
    }
    const loadVoices = () => {
      const voices = this._synth.getVoices();
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
   * Fala o texto em voz natural.
   * @param {string} text
   * @param {{ rate?: number, pitch?: number }} options
   */
  speak(text, options = {}) {
    if (!this._synth) return;
    this._spelling = false;
    this._synth.cancel();

    const utt = this._buildUtterance(text, {
      rate:  options.rate  ?? 0.85,
      pitch: options.pitch ?? 1.1,
    });
    utt.onstart = () => this._callbacks.start?.();
    utt.onend   = () => { if (!this._spelling) this._callbacks.end?.(); };
    utt.onerror = () => { if (!this._spelling) this._callbacks.end?.(); };

    this._synth.speak(utt);
  }

  /**
   * Soletra a palavra: fala cada letra com uma pequena pausa.
   * Ex: "casa" → "c... a... s... a"
   * @param {string} word
   */
  spellWord(word) {
    if (!this._synth) return;
    this._spelling = true;
    this._synth.cancel();

    this._callbacks.start?.();

    // Normaliza: remove hífens para soletrar só as letras
    const letters = word.replace(/-/g, ' ').split('');
    const queue   = [...letters];

    const speakNext = () => {
      if (!queue.length) {
        this._spelling = false;
        this._callbacks.end?.();
        return;
      }
      const ch  = queue.shift();
      const txt = ch === ' ' ? '' : ch; // pula hífens virados em espaço
      if (!txt) { speakNext(); return; }

      const utt   = this._buildUtterance(txt, { rate: 0.7, pitch: 1.1 });
      utt.onend   = () => setTimeout(speakNext, 180);
      utt.onerror = () => setTimeout(speakNext, 180);
      this._synth.speak(utt);
    };

    speakNext();
  }

  /** Cancela qualquer fala em andamento */
  cancel() {
    this._spelling = false;
    this._synth?.cancel();
  }

  /** Registra callbacks */
  onStart(fn) { this._callbacks.start = fn; return this; }
  onEnd(fn)   { this._callbacks.end   = fn; return this; }

  isSupported() { return !!this._synth; }

  /* ─── Privado ── */
  _buildUtterance(text, { rate, pitch }) {
    const utt   = new SpeechSynthesisUtterance(text);
    if (this._voice) utt.voice = this._voice;
    utt.lang   = 'pt-BR';
    utt.rate   = rate;
    utt.pitch  = pitch;
    utt.volume = 1;
    return utt;
  }
}
