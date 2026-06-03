/**
 * VirtualKeyboard - Teclado virtual em português.
 * Substitui o teclado nativo do celular para evitar sugestões automáticas.
 *
 * Layout ABNT-simplificado com:
 *   - Letras minúsculas (padrão)
 *   - Letras maiúsculas (shift)
 *   - Acentos e caracteres especiais do português (via painel ç/á)
 *   - Backspace, espaço, apagar tudo
 */
class VirtualKeyboard {
  /**
   * @param {HTMLElement} container
   * @param {{
   *   onConfirm: Function,
   *   onChange:  Function
   * }} callbacks
   */
  constructor(container, { onConfirm, onChange }) {
    this._container  = container;
    this._onConfirm  = onConfirm;
    this._onChange   = onChange || (() => {});

    this._value      = '';
    this._shift      = false;
    this._accentMode = false;   // painel de acentos aberto?
    this._enabled    = true;

    this._rows = [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l'],
      ['SHIFT','z','x','c','v','b','n','m','BACK'],
      ['ACCENT','SPACE','CONFIRM'],
    ];

    // Mapa de acentos agrupados por letra base
    this._accentMap = {
      a: ['á','â','ã','à','ä'],
      e: ['é','ê','è','ë'],
      i: ['í','î','ì','ï'],
      o: ['ó','ô','õ','ò','ö'],
      u: ['ú','û','ù','ü'],
      c: ['ç'],
      n: ['ñ'],
    };
    this._accentFlat = Object.values(this._accentMap).flat();

    this._render();
  }

  /* ─── Render ───────────────────────────────────────────── */

  _render() {
    this._container.innerHTML = `
      <div class="vkb-wrapper">

        <!-- Display da palavra digitada -->
        <div class="vkb-display" id="vkb-display" aria-live="polite" aria-label="Palavra digitada">
          <span class="vkb-display__text" id="vkb-text">
            <span class="vkb-cursor"></span>
          </span>
        </div>

        <!-- Teclado principal -->
        <div class="vkb-board" id="vkb-board">
          ${this._rows.map(row => `
            <div class="vkb-row">
              ${row.map(k => this._renderKey(k)).join('')}
            </div>
          `).join('')}
        </div>

        <!-- Painel de acentos (oculto por padrão) -->
        <div class="vkb-accent-panel" id="vkb-accent-panel" aria-hidden="true">
          <div class="vkb-accent-title">Escolha o acento</div>
          <div class="vkb-accent-grid" id="vkb-accent-grid"></div>
          <button class="vkb-key vkb-key--wide vkb-key--cancel" data-key="ACCENT_CLOSE">
            ✕ Fechar
          </button>
        </div>

      </div>
    `;

    this._boardEl       = this._container.querySelector('#vkb-board');
    this._displayText   = this._container.querySelector('#vkb-text');
    this._accentPanel   = this._container.querySelector('#vkb-accent-panel');
    this._accentGrid    = this._container.querySelector('#vkb-accent-grid');

    this._bindEvents();
    this._updateDisplay();
  }

  _renderKey(key) {
    switch (key) {
      case 'SHIFT':
        return `<button class="vkb-key vkb-key--action" data-key="SHIFT" aria-label="Maiúsculas" title="Maiúsculas">⇧</button>`;
      case 'BACK':
        return `<button class="vkb-key vkb-key--action" data-key="BACK" aria-label="Apagar" title="Apagar">⌫</button>`;
      case 'ACCENT':
        return `<button class="vkb-key vkb-key--action vkb-key--accent-btn" data-key="ACCENT" aria-label="Acentos e ç" title="Acentos">Á</button>`;
      case 'SPACE':
        return `<button class="vkb-key vkb-key--space" data-key="SPACE" aria-label="Espaço">espaço</button>`;
      case 'CONFIRM':
        return `<button class="vkb-key vkb-key--confirm" data-key="CONFIRM" aria-label="Confirmar palavra">✔ OK</button>`;
      default:
        return `<button class="vkb-key" data-key="${key}" aria-label="${key}">${key}</button>`;
    }
  }

  /* ─── Events ───────────────────────────────────────────── */

  _bindEvents() {
    // Delegação de evento no container inteiro
    this._container.addEventListener('pointerdown', e => {
      const btn = e.target.closest('[data-key]');
      if (!btn || !this._enabled) return;
      e.preventDefault();   // impede abertura do teclado nativo
      this._handleKey(btn.dataset.key);
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
        this._openAccentPanel(null);
        break;

      case 'ACCENT_CLOSE':
        this._closeAccentPanel();
        break;

      case 'SPACE':
        this._append(' ');
        break;

      case 'CONFIRM':
        if (this._enabled) this._onConfirm(this._value);
        break;

      default:
        if (this._accentMap[key.toLowerCase()]) {
          // Tecla com acentos disponíveis → abre painel
          this._openAccentPanel(key.toLowerCase());
        } else if (this._accentFlat.includes(key)) {
          // Já é um caractere acentuado
          this._append(key);
          this._closeAccentPanel();
        } else {
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

  /* ─── Accent Panel ─────────────────────────────────────── */

  _openAccentPanel(letterBase) {
    let chars;
    if (letterBase) {
      chars = this._accentMap[letterBase] || [];
    } else {
      // Mostra todos os acentos
      chars = this._accentFlat;
    }

    this._accentGrid.innerHTML = chars.map(ch =>
      `<button class="vkb-key vkb-key--char" data-key="${ch}" aria-label="${ch}">${ch}</button>`
    ).join('');

    this._accentPanel.classList.add('open');
    this._accentPanel.setAttribute('aria-hidden', 'false');
  }

  _closeAccentPanel() {
    this._accentPanel.classList.remove('open');
    this._accentPanel.setAttribute('aria-hidden', 'true');
  }

  /* ─── Display ──────────────────────────────────────────── */

  _updateDisplay() {
    const txt = this._value || '';
    // Exibe texto + cursor piscante
    this._displayText.innerHTML =
      (txt ? `<span class="vkb-display__chars">${this._escapeHtml(txt)}</span>` : '') +
      '<span class="vkb-cursor"></span>';
  }

  _updateShift() {
    const keys = this._boardEl.querySelectorAll('.vkb-key:not([data-key="SHIFT"]):not([data-key="BACK"]):not([data-key="ACCENT"]):not([data-key="SPACE"]):not([data-key="CONFIRM"])');
    keys.forEach(btn => {
      const k = btn.dataset.key;
      if (k && k.length === 1) {
        btn.textContent = this._shift ? k.toUpperCase() : k.toLowerCase();
        btn.setAttribute('aria-label', this._shift ? k.toUpperCase() : k.toLowerCase());
      }
    });
    const shiftBtn = this._boardEl.querySelector('[data-key="SHIFT"]');
    if (shiftBtn) shiftBtn.classList.toggle('vkb-key--shift-active', this._shift);
  }

  _escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── Public API ───────────────────────────────────────── */

  getValue()  { return this._value; }

  reset() {
    this._value      = '';
    this._shift      = false;
    this._accentMode = false;
    this._closeAccentPanel();
    this._updateDisplay();
    this._updateShift();
  }

  setEnabled(enabled) {
    this._enabled = enabled;
    this._container.querySelectorAll('.vkb-key').forEach(btn => {
      btn.disabled = !enabled;
    });
  }

  // Compatibilidade com a interface anterior de WordInput
  focus() { /* teclado virtual não precisa de focus */ }
}
