/* ===========================================================
   KADEM TECHNOLOGIES — ai.js
   Kadem AI chat widget. Talks only to the same-origin
   /api/ai endpoint. The Groq API key never appears here —
   it is stored as a Cloudflare Worker secret (see worker/index.js).
   =========================================================== */
(function () {
  'use strict';

  var MAX_INPUT_LENGTH = 600;
  var STORAGE_KEY = 'kadem-ai-history';

  var panel = document.querySelector('[data-ai-panel]');
  var openBtn = document.querySelector('[data-ai-open]');
  var closeBtn = document.querySelector('[data-ai-close]');
  var minimizeBtn = document.querySelector('[data-ai-minimize]');
  var header = document.querySelector('.k-ai-panel__header');
  var body = document.querySelector('[data-ai-body]');
  var form = document.querySelector('[data-ai-form]');
  var textarea = document.querySelector('[data-ai-input]');
  var sendBtn = document.querySelector('[data-ai-send]');
  var clearBtn = document.querySelector('[data-ai-clear]');
  var suggestionsBox = document.querySelector('[data-ai-suggestions]');
  var notifyDot = document.querySelector('[data-ai-dot]');

  if (!panel || !openBtn) return;

  /* ---------- Sound (tiny synthesized pop, no audio file needed) ---------- */
  var audioCtx = null;
  function playPop(freq, delay) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      var t = audioCtx.currentTime + (delay || 0);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch (e) { /* audio unavailable — fail silently */ }
  }
  function playOpenSound() { playPop(720); }
  function playReplySound() { playPop(880); }

  /* ---------- Attention dot on the floating button ---------- */
  if (notifyDot && !sessionStorage.getItem('kadem-ai-dot-seen')) {
    setTimeout(function () { notifyDot.classList.add('is-visible'); }, 1800);
  }
  function dismissDot() {
    if (!notifyDot) return;
    notifyDot.classList.remove('is-visible');
    try { sessionStorage.setItem('kadem-ai-dot-seen', '1'); } catch (e) { /* ignore */ }
  }

  var SUGGESTIONS = [
    'What services do you offer?',
    'Do you provide web hosting?',
    'I need a website.',
    'I need a business system.',
    'Tell me about your projects.',
    'How can I contact Kadem Technologies?'
  ];

  var history = [];

  function loadHistory() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      history = raw ? JSON.parse(raw) : [];
    } catch (e) {
      history = [];
    }
  }

  function saveHistory() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch (e) { /* ignore */ }
  }

  function renderMessage(role, text, isError) {
    var el = document.createElement('div');
    el.className = 'k-ai-msg ' + (isError ? 'k-ai-msg--error' : role === 'user' ? 'k-ai-msg--user' : 'k-ai-msg--bot');
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function renderSuggestions() {
    if (!suggestionsBox) return;
    if (history.length) {
      // Conversation already has messages — don't show starter prompts,
      // they were sitting below the chat log and hiding replies.
      suggestionsBox.hidden = true;
      suggestionsBox.innerHTML = '';
      return;
    }
    suggestionsBox.hidden = false;
    suggestionsBox.innerHTML = SUGGESTIONS.map(function (s) {
      return '<button type="button" class="k-ai-suggestion">' + s + '</button>';
    }).join('');
  }

  function hideSuggestions() {
    if (!suggestionsBox) return;
    suggestionsBox.hidden = true;
    suggestionsBox.innerHTML = '';
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'k-ai-typing';
    el.setAttribute('data-typing-indicator', '');
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function renderAll() {
    body.innerHTML = '';
    if (!history.length) {
      renderMessage('assistant', "Hello. I'm Kadem AI. How can I help you today?");
    } else {
      history.forEach(function (m) { renderMessage(m.role, m.content); });
    }
  }

  function openPanel() {
    panel.classList.add('is-open');
    panel.classList.remove('is-minimized');
    panel.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    textarea.focus();
    playOpenSound();
    dismissDot();
  }
  function closePanel() {
    panel.classList.remove('is-open');
    panel.classList.remove('is-minimized');
    panel.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
  }
  function minimizePanel() {
    panel.classList.add('is-minimized');
  }
  function restorePanel() {
    panel.classList.remove('is-minimized');
    textarea.focus();
  }

  openBtn.addEventListener('click', function () {
    panel.classList.contains('is-open') ? closePanel() : openPanel();
  });
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      minimizePanel();
    });
  }
  if (header) {
    header.addEventListener('click', function () {
      if (panel.classList.contains('is-minimized')) restorePanel();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !panel.classList.contains('is-open')) return;
    if (panel.classList.contains('is-minimized')) closePanel();
    else minimizePanel();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      history = [];
      saveHistory();
      renderAll();
    });
  }

  if (suggestionsBox) {
    suggestionsBox.addEventListener('click', function (e) {
      var btn = e.target.closest('.k-ai-suggestion');
      if (!btn) return;
      textarea.value = btn.textContent;
      hideSuggestions();
      form.requestSubmit ? form.requestSubmit() : sendMessage();
    });
  }

  function setSending(sending) {
    sendBtn.disabled = sending;
    textarea.disabled = sending;
  }

  function sendMessage() {
    var text = textarea.value.trim();
    if (!text) return;
    if (text.length > MAX_INPUT_LENGTH) {
      renderMessage('assistant', 'That message is a little long — please keep it under ' + MAX_INPUT_LENGTH + ' characters.', true);
      return;
    }

    hideSuggestions();
    history.push({ role: 'user', content: text });
    renderMessage('user', text);
    saveHistory();
    textarea.value = '';
    setSending(true);
    var typingEl = showTyping();

    fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12) })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('ai_request_failed');
        return res.json();
      })
      .then(function (data) {
        var reply = (data && data.reply) || 'The AI assistant is temporarily unavailable. Please contact ZetuBiz on WhatsApp at +254 701 059 192 or email support@christech.co.ke.';
        history.push({ role: 'assistant', content: reply });
        saveHistory();
        typingEl.remove();
        renderMessage('assistant', reply);
        playReplySound();
      })
      .catch(function () {
        typingEl.remove();
        renderMessage('assistant', 'The AI assistant is temporarily unavailable. Please contact ZetuBiz on WhatsApp at +254 701 059 192 or email support@christech.co.ke.', true);
        playReplySound();
      })
      .finally(function () {
        setSending(false);
        textarea.focus();
      });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sendMessage();
    });
  }
  if (textarea) {
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  loadHistory();
  renderAll();
  renderSuggestions();
})();
