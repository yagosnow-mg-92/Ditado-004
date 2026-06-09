/**
 * VirtualKeyboard - Teclado virtual em português.
 *
 * Comportamento:
 *  - Toque rápido  → digita a letra normalmente
 *  - Pressão longa (400ms) → abre painel APENAS com as variantes acentuadas
 *  - Botão Á → abre painel com todos os caracteres especiais
 */
class VirtualKeyboard {
  constructor(container, { onConfirm, onChange }) {
    this._container = container;
    this._onConfirm = onConfirm;
    this._onChange  = onChange || (() => {});

    this._value   = '';
    this._shift   = false;
    this._enabled = true;

    // Apenas as variantes acentuadas (sem a letra base)
    this._accentMap = {
      a: ['á','â','ã','à'],
      e: ['é','ê','è'],
      i: ['í','î','ì'],
      o: ['ó','ô','õ','ò'],
      u: ['ú','û','ù'],
      c: ['ç'],
      n: ['ñ'],
    };
    this._accentFlat = Object.values(this._accentMap).flat();

    this._longPressDelay = 400;
    this._longPressTimer = null;
    this._didLongPress   = false;

    this._rows = [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l'],
      ['SHIFT','z','x','c','v','b','n','m','BACK'],
      ['ACCENT','HYPHEN','SPACE','CONFIRM'],
    ];

    this._render();
  }

  /* ─── Render ─────────────────────────────────────────────── */

  _render() {
    this._container.innerHTML = `
      <div class="vkb-root">

        <div class="vkb-display" id="vkb-display">
          <span class="vkb-display__inner" id="vkb-text"></span>
        </div>

        <!-- espaçador fixo para não deslocar o teclado -->
        <div class="vkb-hint-spacer"></div>

        <div class="vkb-board" id="vkb-board">
          ${this._rows.map(row => `
            <div class="vkb-row">
              ${row.map(k => this._renderKey(k)).join('')}
            </div>
          `).join('')}
        </div>

        <!-- Painel de variantes: position absolute, não empurra nada -->
        <div class="vkb-accent-panel" id="vkb-accent-panel" aria-hidden="true">
          <p class="vkb-accent-title" id="vkb-accent-title">Escolha o acento</p>
          <div class="vkb-accent-grid" id="vkb-accent-grid"></div>
          <button class="vkb-key vkb-key--cancel-accent" data-key="ACCENT_CLOSE">✕ Fechar</button>
        </div>

      </div>
    `;

    this._boardEl     = this._container.querySelector('#vkb-board');
    this._displayInner= this._container.querySelector('#vkb-text');
    this._accentPanel = this._container.querySelector('#vkb-accent-panel');
    this._accentGrid  = this._container.querySelector('#vkb-accent-grid');
    this._accentTitle = this._container.querySelector('#vkb-accent-title');

    this._bindEvents();
    this._updateDisplay();
  }

  _renderKey(key) {
    const hasAccent = this._accentMap[key] ? ' vkb-key--has-accent' : '';
    switch (key) {
      case 'SHIFT':
        return `<button class="vkb-key vkb-key--action" data-key="SHIFT" aria-label="Maiúsculas">⇧</button>`;
      case 'BACK':
        return `<button class="vkb-key vkb-key--action" data-key="BACK" aria-label="Apagar">⌫</button>`;
      case 'ACCENT':
        return `<button class="vkb-key vkb-key--accent-btn" data-key="ACCENT" aria-label="Acentos">Á</button>`;
      case 'HYPHEN':
        return `<button class="vkb-key vkb-key--hyphen" data-key="HYPHEN" aria-label="Hífen">-</button>`;
      case 'SPACE':
        return `<button class="vkb-key vkb-key--space" data-key="SPACE" aria-label="Espaço">espaço</button>`;
      case 'CONFIRM':
        return `<button class="vkb-key vkb-key--confirm" data-key="CONFIRM" aria-label="Confirmar">✔ OK</button>`;
      default:
        return `<button class="vkb-key${hasAccent}" data-key="${key}">${key}</button>`;
    }
  }

  /* ─── Events ─────────────────────────────────────────────── */

  _bindEvents() {
    const root = this._container;

    root.addEventListener('pointerdown', e => {
      const btn = e.target.closest('[data-key]');
      if (!btn) return;
      e.preventDefault();

      const key = btn.dataset.key;
      if (!this._enabled && key !== 'ACCENT_CLOSE') return;

      // Inicia long-press apenas para teclas com variantes
      if (this._accentMap[key]) {
        this._didLongPress = false;
        btn.classList.add('vkb-key--pressing');
        this._longPressTimer = setTimeout(() => {
          this._didLongPress = true;
          btn.classList.remove('vkb-key--pressing');
          this._openAccentPanel(key);
        }, this._longPressDelay);
      }
    });

    root.addEventListener('pointerup', e => {
      const btn = e.target.closest('[data-key]');
      clearTimeout(this._longPressTimer);
      if (!btn) return;
      e.preventDefault();

      btn.classList.remove('vkb-key--pressing');
      const key = btn.dataset.key;
      if (!this._enabled && key !== 'ACCENT_CLOSE') { this._didLongPress = false; return; }

      if (!this._didLongPress) this._handleKey(key);
      this._didLongPress = false;
    });

    root.addEventListener('pointercancel', () => {
      clearTimeout(this._longPressTimer);
      this._didLongPress = false;
      root.querySelectorAll('.vkb-key--pressing').forEach(b => b.classList.remove('vkb-key--pressing'));
    });

    root.addEventListener('pointerleave', e => {
      if (e.target.closest && e.target.closest('[data-key]')) {
        clearTimeout(this._longPressTimer);
        this._didLongPress = false;
        root.querySelectorAll('.vkb-key--pressing').forEach(b => b.classList.remove('vkb-key--pressing'));
      }
    }, true);
  }

  _handleKey(key) {
    switch (key) {
      case 'SHIFT':
        this._shift = !this._shift;
        this._updateShift();
        break;

      case 'BACK':
        this._value = this._value.slice(0, -1);
        this._onChange(this._value);
        this._updateDisplay();
        break;

      case 'ACCENT':
        this._openAccentPanel(null);
        break;

      case 'ACCENT_CLOSE':
        this._closeAccentPanel();
        break;

      case 'HYPHEN':
        this._append('-');
        break;

      case 'SPACE':
        this._append(' ');
        break;

      case 'CONFIRM':
        this._onConfirm(this._value);
        break;

      default:
        if (this._accentFlat.includes(key)) {
          // Veio do painel de variantes
          this._append(key);
          this._closeAccentPanel();
        } else {
          // Letra normal (toque rápido)
          const ch = this._shift ? key.toUpperCase() : key.toLowerCase();
          this._append(ch);
          if (this._shift) { this._shift = false; this._updateShift(); }
        }
    }
  }

  _append(ch) {
    this._value += ch;
    this._onChange(this._value);
    this._updateDisplay();
  }

  /* ─── Accent Panel ──────────────────────────────────────── */

  _openAccentPanel(letterBase) {
    let chars;
    if (letterBase) {
      // Somente as variantes acentuadas — sem a letra base
      chars = this._accentMap[letterBase];
      this._accentTitle.textContent = `Variantes de "${letterBase.toUpperCase()}":`;
    } else {
      chars = this._accentFlat;
      this._accentTitle.textContent = 'Caracteres especiais:';
    }

    this._accentGrid.innerHTML = chars.map(ch =>
      `<button class="vkb-key vkb-key--char" data-key="${ch}">${ch}</button>`
    ).join('');

    this._accentPanel.classList.add('open');
    this._accentPanel.setAttribute('aria-hidden', 'false');
  }

  _closeAccentPanel() {
    this._accentPanel.classList.remove('open');
    this._accentPanel.setAttribute('aria-hidden', 'true');
  }

  /* ─── Display ───────────────────────────────────────────── */

  _updateDisplay() {
    const txt = this._value;
    this._displayInner.innerHTML = txt
      ? `<span class="vkb-display__chars">${this._esc(txt)}</span><span class="vkb-cursor"></span>`
      : `<span class="vkb-placeholder">Digite aqui...</span><span class="vkb-cursor"></span>`;
  }

  _updateShift() {
    this._boardEl.querySelectorAll(
      '.vkb-key:not([data-key="SHIFT"]):not([data-key="BACK"]):not([data-key="ACCENT"]):not([data-key="HYPHEN"]):not([data-key="SPACE"]):not([data-key="CONFIRM"])'
    ).forEach(btn => {
      const k = btn.dataset.key;
      if (k && k.length === 1 && !this._accentFlat.includes(k)) {
        btn.textContent = this._shift ? k.toUpperCase() : k.toLowerCase();
      }
    });
    const shiftBtn = this._boardEl.querySelector('[data-key="SHIFT"]');
    if (shiftBtn) shiftBtn.classList.toggle('vkb-key--shift-on', this._shift);
  }

  _esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── Public API ────────────────────────────────────────── */

  getValue() { return this._value; }

  reset() {
    this._value = '';
    this._shift = false;
    this._closeAccentPanel();
    this._updateDisplay();
    this._updateShift();
  }

  setEnabled(enabled) {
    this._enabled = enabled;
    const board = this._container.querySelector('.vkb-board');
    if (board) {
      board.style.opacity       = enabled ? '1'  : '0.45';
      board.style.pointerEvents = enabled ? ''   : 'none';
    }
    const display = this._container.querySelector('.vkb-display');
    if (display) display.style.opacity = enabled ? '1' : '0.7';
  }

  focus() {}
}
