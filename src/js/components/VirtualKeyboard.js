/**
 * VirtualKeyboard - Teclado virtual em português.
 *
 * Comportamento:
 *   - Toque rápido  → digita a letra (a, e, i, o, u, c, n sem acento)
 *   - Pressão longa → abre painel de variantes acentuadas
 *   - Botão Á       → abre painel com TODOS os caracteres especiais
 */
class VirtualKeyboard {
  constructor(container, { onConfirm, onChange }) {
    this._container = container;
    this._onConfirm = onConfirm;
    this._onChange  = onChange || (() => {});

    this._value      = '';
    this._shift      = false;
    this._enabled    = true;

    // Teclas com variantes acentuadas (pressão longa)
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

    // Controle de pressão longa
    this._longPressTimer  = null;
    this._longPressDelay  = 400; // ms
    this._didLongPress    = false;

    this._rows = [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l'],
      ['SHIFT','z','x','c','v','b','n','m','BACK'],
      ['ACCENT','SPACE','CONFIRM'],
    ];

    this._render();
  }

  /* ─── Render ────────────────────────────────────────────── */

  _render() {
    this._container.innerHTML = `
      <div class="vkb-wrapper">

        <!-- Display -->
        <div class="vkb-display" id="vkb-display" aria-live="polite">
          <span class="vkb-display__text" id="vkb-text">
            <span class="vkb-cursor"></span>
          </span>
        </div>

        <!-- Dica de pressão longa -->
        <p class="vkb-hint" id="vkb-hint">
          💡 Segure uma vogal para ver acentos
        </p>

        <!-- Teclado -->
        <div class="vkb-board" id="vkb-board">
          ${this._rows.map(row => `
            <div class="vkb-row">
              ${row.map(k => this._renderKey(k)).join('')}
            </div>
          `).join('')}
        </div>

        <!-- Painel de acentos -->
        <div class="vkb-accent-panel" id="vkb-accent-panel" aria-hidden="true">
          <div class="vkb-accent-title" id="vkb-accent-title">Escolha o acento</div>
          <div class="vkb-accent-grid" id="vkb-accent-grid"></div>
          <button class="vkb-key vkb-key--wide vkb-key--cancel" data-key="ACCENT_CLOSE">
            ✕ Fechar
          </button>
        </div>

      </div>
    `;

    this._boardEl     = this._container.querySelector('#vkb-board');
    this._displayText = this._container.querySelector('#vkb-text');
    this._accentPanel = this._container.querySelector('#vkb-accent-panel');
    this._accentGrid  = this._container.querySelector('#vkb-accent-grid');
    this._accentTitle = this._container.querySelector('#vkb-accent-title');
    this._hintEl      = this._container.querySelector('#vkb-hint');

    this._bindEvents();
    this._updateDisplay();
  }

  _renderKey(key) {
    const hasAccents = this._accentMap[key] ? ' vkb-key--has-accent' : '';
    switch (key) {
      case 'SHIFT':
        return `<button class="vkb-key vkb-key--action" data-key="SHIFT" aria-label="Maiúsculas">⇧</button>`;
      case 'BACK':
        return `<button class="vkb-key vkb-key--action" data-key="BACK" aria-label="Apagar">⌫</button>`;
      case 'ACCENT':
        return `<button class="vkb-key vkb-key--action vkb-key--accent-btn" data-key="ACCENT" aria-label="Todos os acentos">Á</button>`;
      case 'SPACE':
        return `<button class="vkb-key vkb-key--space" data-key="SPACE" aria-label="Espaço">espaço</button>`;
      case 'CONFIRM':
        return `<button class="vkb-key vkb-key--confirm" data-key="CONFIRM" aria-label="Confirmar">✔ OK</button>`;
      default:
        return `<button class="vkb-key${hasAccents}" data-key="${key}" aria-label="${key}">${key}</button>`;
    }
  }

  /* ─── Events ────────────────────────────────────────────── */

  _bindEvents() {
    const el = this._container;

    // Início do toque/clique
    el.addEventListener('pointerdown', e => {
      const btn = e.target.closest('[data-key]');
      if (!btn) return;
      e.preventDefault();

      const key = btn.dataset.key;

      // Para teclas com acento: inicia timer de pressão longa
      if (this._accentMap[key.toLowerCase()] && key.length === 1) {
        this._didLongPress = false;
        btn.classList.add('pressing');
        this._longPressTimer = setTimeout(() => {
          this._didLongPress = true;
          btn.classList.remove('pressing');
          if (this._enabled) this._openAccentPanel(key.toLowerCase());
        }, this._longPressDelay);
      }
    });

    // Fim do toque/clique
    el.addEventListener('pointerup', e => {
      const btn = e.target.closest('[data-key]');
      if (!btn) return;
      e.preventDefault();

      const key = btn.dataset.key;
      btn.classList.remove('pressing');
      clearTimeout(this._longPressTimer);

      // Só executa ação se não foi pressão longa
      if (!this._didLongPress && this._enabled) {
        this._handleKey(key);
      }
      this._didLongPress = false;
    });

    // Cancelar pressão longa se o dedo saiu da tecla
    el.addEventListener('pointerleave', e => {
      clearTimeout(this._longPressTimer);
      this._didLongPress = false;
      el.querySelectorAll('.pressing').forEach(b => b.classList.remove('pressing'));
    }, true);

    el.addEventListener('pointercancel', () => {
      clearTimeout(this._longPressTimer);
      this._didLongPress = false;
      el.querySelectorAll('.pressing').forEach(b => b.classList.remove('pressing'));
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
        // Botão Á → abre painel com todos os acentos
        this._openAccentPanel(null);
        break;

      case 'ACCENT_CLOSE':
        this._closeAccentPanel();
        break;

      case 'SPACE':
        this._append(' ');
        break;

      case 'CONFIRM':
        this._onConfirm(this._value);
        break;

      default:
        if (this._accentFlat.includes(key)) {
          // Caractere acentuado vindo do painel
          this._append(key);
          this._closeAccentPanel();
        } else {
          // Letra normal (toque rápido, SEM abrir painel)
          const ch = this._shift ? key.toUpperCase() : key.toLowerCase();
          this._append(ch);
          if (this._shift) { this._shift = false; this._updateShift(); }
          // Esconde dica após primeira digitação
          if (this._hintEl) {
            this._hintEl.style.opacity = '0';
            setTimeout(() => { if (this._hintEl) this._hintEl.style.display = 'none'; }, 400);
          }
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
      chars = [letterBase, ...this._accentMap[letterBase]]; // letra normal PRIMEIRO
      this._accentTitle.textContent = `"${letterBase.toUpperCase()}" — escolha a variante`;
    } else {
      chars = this._accentFlat;
      this._accentTitle.textContent = 'Escolha o caractere especial';
    }

    this._accentGrid.innerHTML = chars.map(ch => {
      const label = ch === letterBase ? `${ch} (sem acento)` : ch;
      return `<button class="vkb-key vkb-key--char ${ch === letterBase ? 'vkb-key--char-base' : ''}"
                data-key="${ch}" aria-label="${label}">${ch}</button>`;
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
    this._displayText.innerHTML =
      (txt ? `<span class="vkb-display__chars">${this._escapeHtml(txt)}</span>` : '') +
      '<span class="vkb-cursor"></span>';
  }

  _updateShift() {
    this._boardEl.querySelectorAll('.vkb-key:not([data-key="SHIFT"]):not([data-key="BACK"]):not([data-key="ACCENT"]):not([data-key="SPACE"]):not([data-key="CONFIRM"])').forEach(btn => {
      const k = btn.dataset.key;
      if (k && k.length === 1 && !this._accentFlat.includes(k)) {
        btn.textContent = this._shift ? k.toUpperCase() : k.toLowerCase();
      }
    });
    const shiftBtn = this._boardEl.querySelector('[data-key="SHIFT"]');
    if (shiftBtn) shiftBtn.classList.toggle('vkb-key--shift-active', this._shift);
  }

  _escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── Public API ────────────────────────────────────────── */

  getValue()  { return this._value; }

  reset() {
    this._value = '';
    this._shift = false;
    this._closeAccentPanel();
    this._updateDisplay();
    this._updateShift();
    if (this._hintEl) { this._hintEl.style.display = ''; this._hintEl.style.opacity = '1'; }
  }

  setEnabled(enabled) {
    this._enabled = enabled;
    this._container.querySelectorAll('.vkb-key').forEach(b => b.disabled = !enabled);
    const display = this._container.querySelector('#vkb-display');
    if (display) display.classList.toggle('disabled', !enabled);
  }

  focus() { /* teclado virtual não precisa de focus nativo */ }
}
