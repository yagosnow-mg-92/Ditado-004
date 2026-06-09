/**
 * VirtualKeyboard - Teclado virtual em português.
 *
 * Comportamento das teclas com variante:
 *  - UM toque simples → abre painel de variantes imediatamente
 *  - No painel a primeira opção é sempre a letra SEM acento
 *
 * Tecla hífen incluída na última linha.
 */
class VirtualKeyboard {
  constructor(container, { onConfirm, onChange }) {
    this._container = container;
    this._onConfirm = onConfirm;
    this._onChange  = onChange || (() => {});

    this._value   = '';
    this._shift   = false;
    this._enabled = true;

    // Teclas que abrem painel de variantes ao toque
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

        <!-- Espaçador fixo: garante que o teclado não pule ao esconder a dica -->
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
          <p class="vkb-accent-title" id="vkb-accent-title">Escolha a variante</p>
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
        return `<button class="vkb-key vkb-key--accent-btn" data-key="ACCENT" aria-label="Todos os acentos">Á</button>`;
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

    // Um único listener em pointerup — toque simples ativa tudo
    root.addEventListener('pointerdown', e => {
      const btn = e.target.closest('[data-key]');
      if (btn) e.preventDefault();
    });

    root.addEventListener('pointerup', e => {
      const btn = e.target.closest('[data-key]');
      if (!btn) return;
      e.preventDefault();

      const key = btn.dataset.key;
      if (!this._enabled && key !== 'ACCENT_CLOSE') return;

      this._handleKey(key);
    });
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
        // Botão Á → todos os acentos
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
          // Caractere vindo do painel
          this._append(key);
          this._closeAccentPanel();
        } else if (this._accentMap[key]) {
          // Tecla com variantes → abre painel imediatamente (toque simples)
          this._openAccentPanel(key);
        } else {
          // Letra normal
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
      // Letra SEM acento SEMPRE em primeiro
      chars = [letterBase, ...this._accentMap[letterBase]];
      this._accentTitle.textContent = `"${letterBase.toUpperCase()}" — escolha:`;
    } else {
      chars = this._accentFlat;
      this._accentTitle.textContent = 'Caracteres especiais:';
    }

    this._accentGrid.innerHTML = chars.map(ch => {
      const isBase = ch === letterBase;
      return `<button class="vkb-key vkb-key--char${isBase ? ' vkb-key--char-base' : ''}"
        data-key="${ch}" title="${isBase ? ch + ' (sem acento)' : ch}">${ch}</button>`;
    }).join('');

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
    this._boardEl.querySelectorAll('.vkb-key:not([data-key="SHIFT"]):not([data-key="BACK"]):not([data-key="ACCENT"]):not([data-key="HYPHEN"]):not([data-key="SPACE"]):not([data-key="CONFIRM"])').forEach(btn => {
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
