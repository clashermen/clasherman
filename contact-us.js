(function () {

  // ── Wait for Firebase ──────────────────────────────────────────────────────
  function waitForFirebase(cb) {
    if (window._db && window._auth) { cb(); return; }
    document.addEventListener('authStateChanged', function h() {
      document.removeEventListener('authStateChanged', h);
      cb();
    });
  }

  // ── CSS ────────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
  /* ── Contact overlay ── */
  .con-overlay {
    display:none; position:fixed; inset:0;
    background:rgba(0,0,0,0.78); z-index:10000;
    justify-content:center; align-items:flex-start;
    overflow-y:auto; padding:40px 16px;
  }
  .con-overlay.open { display:flex; }
  .con-box {
    background:#0f172a; border:1px solid #1e293b;
    border-radius:18px; padding:30px 28px;
    width:500px; max-width:100%; position:relative;
    font-family:'Poppins',sans-serif; margin:auto;
    box-shadow:0 20px 60px rgba(0,0,0,0.6);
  }
  .con-close {
    position:absolute; top:14px; right:16px;
    background:none; border:none; color:#475569;
    font-size:20px; cursor:pointer; line-height:1;
    transition:color 0.15s;
  }
  .con-close:hover { color:white; }

  /* ── Form view ── */
  .con-title { font-size:19px; font-weight:700; color:white; margin:0 0 6px; }
  .con-subtitle {
    font-size:12px; color:#64748b; margin:0 0 20px; line-height:1.5;
  }
  .con-label {
    display:block; font-size:12px; color:#64748b;
    margin:14px 0 5px; font-weight:500; letter-spacing:0.3px;
  }
  .con-input {
    width:100%; padding:10px 14px; border-radius:9px;
    border:1px solid #1e293b; background:#1e293b; color:white;
    font-family:'Poppins',sans-serif; font-size:13px;
    outline:none; box-sizing:border-box; transition:border-color 0.15s;
  }
  .con-input:focus { border-color:#4ade80; }
  .con-input::placeholder { color:#334155; }
  textarea.con-input { min-height:88px; resize:vertical; }
  .con-btn {
    width:100%; padding:12px; border-radius:9px; border:none;
    background:linear-gradient(90deg,#4ade80,#10b981);
    color:#0f172a; font-family:'Poppins',sans-serif;
    font-size:14px; font-weight:700; cursor:pointer;
    transition:opacity 0.2s; margin-top:20px;
  }
  .con-btn:hover { opacity:0.85; }
  .con-btn:disabled { opacity:0.45; cursor:not-allowed; }
  .con-err { color:#f87171; font-size:12px; margin-top:8px; min-height:16px; }

  /* ── Chats list view ── */
  .con-list { display:flex; flex-direction:column; gap:10px; max-height:360px; overflow-y:auto; padding-right:2px; }
  .con-list::-webkit-scrollbar { width:4px; }
  .con-list::-webkit-scrollbar-thumb { background:#334155; border-radius:4px; }
  .con-list-item {
    background:#1e293b; border:1px solid #334155; border-radius:11px;
    padding:14px 16px; cursor:pointer; transition:border-color 0.15s;
    display:flex; align-items:center; justify-content:space-between; gap:10px;
  }
  .con-list-item:hover { border-color:#4ade80; }
  .con-list-left { flex:1; min-width:0; }
  .con-list-subject { font-size:14px; font-weight:600; color:white; margin:0 0 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .con-list-preview { font-size:12px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .con-list-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }
  .con-new-btn {
    display:block; width:100%; padding:11px; border-radius:9px; border:none;
    background:rgba(74,222,128,0.1); color:#4ade80;
    font-family:'Poppins',sans-serif; font-size:13px; font-weight:600;
    cursor:pointer; transition:background 0.15s; margin-top:14px;
    border:1px solid rgba(74,222,128,0.2);
  }
  .con-new-btn:hover { background:rgba(74,222,128,0.18); }
  .con-empty { text-align:center; color:#475569; font-size:13px; padding:30px 0; }

  /* ── Contact status badges ── */
  .cs-badge {
    font-size:10px; font-weight:600; padding:2px 9px;
    border-radius:20px; white-space:nowrap;
  }
  .cs-open     { background:rgba(74,222,128,0.15);  color:#4ade80; }
  .cs-resolved { background:rgba(148,163,184,0.15); color:#94a3b8; }
  .con-unread-dot {
    width:8px; height:8px; border-radius:50%;
    background:#4ade80; flex-shrink:0;
  }

  /* ── Chat view ── */
  .con-chat-top {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:4px; flex-wrap:wrap; gap:8px;
  }
  .con-chat-back {
    background:none; border:none; color:#64748b; font-family:'Poppins',sans-serif;
    font-size:12px; cursor:pointer; padding:0; transition:color 0.15s;
  }
  .con-chat-back:hover { color:#4ade80; }
  .con-chat-id { font-size:11px; color:#334155; font-family:monospace; margin:0 0 12px; }
  .con-chat-msgs {
    height:260px; overflow-y:auto; display:flex;
    flex-direction:column; gap:10px; padding:2px 0;
    margin-bottom:12px;
  }
  .con-chat-msgs::-webkit-scrollbar { width:4px; }
  .con-chat-msgs::-webkit-scrollbar-thumb { background:#334155; border-radius:4px; }
  .con-msg {
    max-width:82%; padding:10px 14px; border-radius:13px;
    font-size:13px; line-height:1.55; word-break:break-word;
  }
  .con-msg.customer {
    background:linear-gradient(135deg,#1a3a2a,#1e293b);
    border:1px solid #16a34a33; color:#e2e8f0;
    align-self:flex-end; border-bottom-right-radius:4px;
  }
  .con-msg.admin {
    background:linear-gradient(135deg,#1a2744,#0f172a);
    border:1px solid #4ade8033; color:#e2e8f0;
    align-self:flex-start; border-bottom-left-radius:4px;
  }
  .con-msg-meta { font-size:10px; color:#475569; margin-top:4px; }
  .con-msg.customer .con-msg-meta { text-align:right; }
  .con-chat-input-row { display:flex; gap:8px; }
  .con-chat-input {
    flex:1; padding:10px 14px; border-radius:9px;
    border:1px solid #1e293b; background:#1e293b; color:white;
    font-family:'Poppins',sans-serif; font-size:13px; outline:none;
    transition:border-color 0.15s;
  }
  .con-chat-input:focus { border-color:#4ade80; }
  .con-chat-input::placeholder { color:#334155; }
  .con-chat-send {
    padding:10px 18px; border-radius:9px; border:none;
    background:#4ade80; color:#0f172a;
    font-family:'Poppins',sans-serif; font-weight:700;
    font-size:13px; cursor:pointer; transition:opacity 0.2s;
  }
  .con-chat-send:hover { opacity:0.85; }
  .con-chat-empty { text-align:center; color:#334155; font-size:13px; margin:auto; padding:20px; }
  .con-chat-closed-note {
    text-align:center; color:#64748b; font-size:12px;
    padding:10px; background:#1e293b; border-radius:8px; margin-top:4px;
  }

  /* ── Float button ── */
  #conFloatBtn {
    position:fixed; bottom:80px; right:24px;
    background:linear-gradient(135deg,#4ade80,#10b981);
    border:none; border-radius:50px; padding:13px 20px;
    color:#0f172a; font-family:'Poppins',sans-serif;
    font-size:14px; font-weight:700; cursor:pointer;
    box-shadow:0 4px 22px rgba(74,222,128,0.4);
    display:none; align-items:center; gap:8px;
    z-index:9000; transition:transform 0.2s, box-shadow 0.2s;
  }
  #conFloatBtn:hover { transform:translateY(-2px); box-shadow:0 6px 28px rgba(74,222,128,0.5); }
  #conFloatBadge {
    background:#f87171; color:white; border-radius:50%;
    min-width:20px; height:20px; font-size:11px; font-weight:700;
    display:none; align-items:center; justify-content:center;
    padding:0 4px;
  }
  `;
  document.head.appendChild(style);

  // ── HTML ───────────────────────────────────────────────────────────────────
  const wrap = document.createElement('div');
  wrap.innerHTML = `
  <div id="conModal" class="con-overlay">
    <div class="con-box">
      <button class="con-close" onclick="closeConModal()">✕</button>

      <!-- VIEW: Form -->
      <div id="conViewForm">
        <p class="con-title">Contact Us</p>
        <p class="con-subtitle">Send us a message and our support team will get back to you in the chat.</p>
        <label class="con-label">Subject</label>
        <input id="conSubject" class="con-input" type="text" placeholder="e.g. Question about my order, Account issue…">
        <label class="con-label">Message</label>
        <textarea id="conMessage" class="con-input" placeholder="Describe your issue or question in detail…"></textarea>
        <p id="conErr" class="con-err"></p>
        <button class="con-btn" onclick="submitContact()">Send Message →</button>
      </div>

      <!-- VIEW: Chats list -->
      <div id="conViewList" style="display:none">
        <p class="con-title" style="margin-bottom:16px">My Messages</p>
        <div id="conListItems" class="con-list"></div>
        <button class="con-new-btn" onclick="conShowForm()">+ New Message</button>
      </div>

      <!-- VIEW: Chat -->
      <div id="conViewChat" style="display:none">
        <div class="con-chat-top">
          <button class="con-chat-back" onclick="conShowList()">← My Messages</button>
          <span id="conStatusBadge" class="cs-badge cs-open">Open</span>
        </div>
        <p class="con-title" style="margin:2px 0 2px" id="conChatSubjectTitle"></p>
        <p class="con-chat-id">ID: <span id="conChatIdSpan"></span></p>
        <div class="con-chat-msgs" id="conChatMsgs"></div>
        <div id="conChatInputArea" class="con-chat-input-row">
          <input id="conChatInput" class="con-chat-input" placeholder="Type a message…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendConMsg();}">
          <button class="con-chat-send" onclick="sendConMsg()">Send</button>
        </div>
        <div id="conChatClosedNote" class="con-chat-closed-note" style="display:none">This conversation is resolved. <a href="#" onclick="conShowForm();return false;" style="color:#4ade80">Start a new message</a></div>
      </div>

    </div>
  </div>

  <button id="conFloatBtn" onclick="openMyMessages()">
    <img src="images/support.png" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;"> Contact Us
    <span id="conFloatBadge"></span>
  </button>
  `;
  document.body.appendChild(wrap);

  // ── State ──────────────────────────────────────────────────────────────────
  let _activeConId  = null;
  let _conMsgsUnsub = null;
  let _conListUnsub = null;
  let _myContacts   = [];

  // ── Utilities ──────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  function fmtTime(ts) {
    if (!ts) return '';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    } catch(e) { return ''; }
  }

  function conStatusLabel(s) {
    return { open:'Open', resolved:'Resolved' }[s] || s;
  }

  function conSwitchView(name) {
    ['conViewForm','conViewList','conViewChat'].forEach(id => {
      document.getElementById(id).style.display = id === 'conView' + name ? '' : 'none';
    });
  }

  function conScrollBottom() {
    const el = document.getElementById('conChatMsgs');
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }

  // ── Open / close modal ─────────────────────────────────────────────────────
  window.openContact = function() {
    const user = window._auth && window._auth.currentUser;
    if (!user) { window.openAuth(); return; }
    conShowForm();
    document.getElementById('conModal').classList.add('open');
  };

  window.closeConModal = function() {
    document.getElementById('conModal').classList.remove('open');
    if (_conMsgsUnsub) { _conMsgsUnsub(); _conMsgsUnsub = null; }
  };

  window.openMyMessages = function() {
    const user = window._auth && window._auth.currentUser;
    if (!user) { window.openAuth(); return; }
    conShowList();
    document.getElementById('conModal').classList.add('open');
  };

  document.addEventListener('click', e => {
    const m = document.getElementById('conModal');
    if (m && e.target === m) window.closeConModal();
  });

  // ── View helpers ───────────────────────────────────────────────────────────
  window.conShowForm = function() {
    document.getElementById('conSubject').value = '';
    document.getElementById('conMessage').value = '';
    document.getElementById('conErr').textContent = '';
    const btn = document.querySelector('#conViewForm .con-btn');
    if (btn) { btn.disabled = false; btn.textContent = 'Send Message →'; }
    conSwitchView('Form');
  };

  window.conShowList = function() {
    if (_conMsgsUnsub) { _conMsgsUnsub(); _conMsgsUnsub = null; }
    renderConList(_myContacts);
    conSwitchView('List');
  };

  function conShowChat(conId, data) {
    _activeConId = conId;
    document.getElementById('conChatSubjectTitle').textContent = data.subject || '';
    document.getElementById('conChatIdSpan').textContent = conId;
    const badge = document.getElementById('conStatusBadge');
    badge.textContent = conStatusLabel(data.status);
    badge.className = `cs-badge cs-${data.status}`;
    const closed = data.status === 'resolved';
    document.getElementById('conChatInputArea').style.display = closed ? 'none' : 'flex';
    document.getElementById('conChatClosedNote').style.display = closed ? '' : 'none';
    document.getElementById('conChatMsgs').innerHTML = '<p class="con-chat-empty">Loading…</p>';
    conSwitchView('Chat');
    listenConMsgs(conId);
    window._db.collection('contacts').doc(conId).update({ unreadCustomer: 0 }).catch(()=>{});
  }

  // ── Render chats list ──────────────────────────────────────────────────────
  function renderConList(items) {
    const container = document.getElementById('conListItems');
    if (!items.length) {
      container.innerHTML = '<p class="con-empty">No messages yet.</p>';
      return;
    }
    container.innerHTML = items.map(c => `
      <div class="con-list-item" onclick="openConChat('${esc(c.id)}')">
        <div class="con-list-left">
          <p class="con-list-subject">${esc(c.subject)}</p>
          <p class="con-list-preview">${esc(c.lastMsg || c.message || '')}</p>
        </div>
        <div class="con-list-right">
          <span class="cs-badge cs-${esc(c.status)}">${esc(conStatusLabel(c.status))}</span>
          ${c.unreadCustomer > 0 ? `<span class="con-unread-dot" title="${c.unreadCustomer} new message(s)"></span>` : ''}
        </div>
      </div>
    `).join('');
  }

  window.openConChat = async function(conId) {
    const snap = await window._db.collection('contacts').doc(conId).get();
    if (!snap.exists) return;
    conShowChat(conId, snap.data());
  };

  // ── Submit new contact message ─────────────────────────────────────────────
  window.submitContact = async function() {
    const user = window._auth && window._auth.currentUser;
    if (!user) return;

    const subject = document.getElementById('conSubject').value.trim();
    const message = document.getElementById('conMessage').value.trim();
    const errEl   = document.getElementById('conErr');
    const btn     = document.querySelector('#conViewForm .con-btn');

    if (!subject) { errEl.textContent = 'Please enter a subject.'; return; }
    if (!message) { errEl.textContent = 'Please enter your message.'; return; }

    btn.disabled = true; btn.textContent = 'Sending…';
    errEl.textContent = '';

    try {
      const ref = await window._db.collection('contacts').add({
        subject,
        message,
        userId:     user.uid,
        userName:   user.displayName || user.email,
        userEmail:  user.email,
        userAvatar: user.photoURL || '',
        status:     'open',
        createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:  firebase.firestore.FieldValue.serverTimestamp(),
        lastMsg:    '',
        unreadAdmin:    1,
        unreadCustomer: 0,
      });

      // First message from the user
      await window._db.collection('contacts').doc(ref.id)
        .collection('messages').add({
          text:       message,
          sender:     'customer',
          senderName: user.displayName || user.email,
          createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
        });

      // Automated reply
      const autoReply = `Hi! 👋 Thanks for reaching out. We've received your message and a support agent will get back to you shortly.`;
      await window._db.collection('contacts').doc(ref.id)
        .collection('messages').add({
          text:       autoReply,
          sender:     'admin',
          senderName: 'Clasherman Support',
          createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
        });

      await window._db.collection('contacts').doc(ref.id)
        .update({ lastMsg: message.slice(0, 60), unreadCustomer: 1 });

      conShowChat(ref.id, { subject, status: 'open' });
      showConFloatBtn();

    } catch(err) {
      errEl.textContent = 'Failed to send — please try again.';
      console.error('[contact-us]', err);
      btn.disabled = false; btn.textContent = 'Send Message →';
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  window.sendConMsg = async function() {
    const user = window._auth && window._auth.currentUser;
    if (!user || !_activeConId) return;
    const input = document.getElementById('conChatInput');
    const text  = input.value.trim();
    if (!text) return;
    input.value = '';

    const batch = window._db.batch();
    const msgRef = window._db
      .collection('contacts').doc(_activeConId)
      .collection('messages').doc();
    batch.set(msgRef, {
      text,
      sender:     'customer',
      senderName: user.displayName || user.email,
      createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
    });
    const conRef = window._db.collection('contacts').doc(_activeConId);
    batch.update(conRef, {
      lastMsg:    text.slice(0, 60),
      updatedAt:  firebase.firestore.FieldValue.serverTimestamp(),
      unreadAdmin: firebase.firestore.FieldValue.increment(1),
    });
    await batch.commit().catch(err => console.error('[contact-us] send', err));
  };

  // ── Messages real-time listener ────────────────────────────────────────────
  function listenConMsgs(conId) {
    if (_conMsgsUnsub) { _conMsgsUnsub(); _conMsgsUnsub = null; }
    _conMsgsUnsub = window._db
      .collection('contacts').doc(conId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snap => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const container = document.getElementById('conChatMsgs');
        if (!container) return;
        if (!msgs.length) {
          container.innerHTML = '<p class="con-chat-empty">No messages yet.</p>';
          return;
        }
        container.innerHTML = msgs.map(m => `
          <div class="con-msg ${esc(m.sender)}">
            ${esc(m.text).replace(/\n/g,'<br>')}
            <div class="con-msg-meta">${esc(m.senderName)} · ${fmtTime(m.createdAt)}</div>
          </div>
        `).join('');
        conScrollBottom();
      }, err => console.error('[contact-us] msgs listener', err));

    // Listen for status changes
    window._db.collection('contacts').doc(conId).onSnapshot(snap => {
      if (!snap.exists) return;
      const d = snap.data();
      const badge = document.getElementById('conStatusBadge');
      if (badge) {
        badge.textContent = conStatusLabel(d.status);
        badge.className = `cs-badge cs-${d.status}`;
      }
      const closed = d.status === 'resolved';
      const ia = document.getElementById('conChatInputArea');
      const cn = document.getElementById('conChatClosedNote');
      if (ia) ia.style.display = closed ? 'none' : 'flex';
      if (cn) cn.style.display = closed ? '' : 'none';
    });
  }

  // ── Float button ───────────────────────────────────────────────────────────
  function showConFloatBtn() {
    const btn = document.getElementById('conFloatBtn');
    if (btn) btn.style.display = 'flex';
  }

  function refreshConFloatBtn(user) {
    const btn = document.getElementById('conFloatBtn');
    if (btn) btn.style.display = 'flex';
    if (!user) {
      _myContacts = [];
      if (_conListUnsub) { _conListUnsub(); _conListUnsub = null; }
      return;
    }
    startListeningContacts(user.uid);
  }

  function startListeningContacts(uid) {
    if (_conListUnsub) { _conListUnsub(); _conListUnsub = null; }
    _conListUnsub = window._db.collection('contacts')
      .where('userId', '==', uid)
      .onSnapshot(snap => {
        _myContacts = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.updatedAt && a.updatedAt.toMillis ? a.updatedAt.toMillis() : 0;
            const tb = b.updatedAt && b.updatedAt.toMillis ? b.updatedAt.toMillis() : 0;
            return tb - ta;
          });

        const totalUnread = _myContacts.reduce((a, c) => a + (c.unreadCustomer || 0), 0);
        const badge = document.getElementById('conFloatBadge');
        if (badge) {
          badge.textContent = totalUnread || '';
          badge.style.display = totalUnread > 0 ? 'flex' : 'none';
        }
        if (document.getElementById('conViewList') &&
            document.getElementById('conViewList').style.display !== 'none') {
          renderConList(_myContacts);
        }
      }, err => console.error('[contact-us] list listener', err));
  }

  // ── Auth listener ──────────────────────────────────────────────────────────
  document.addEventListener('authStateChanged', e => {
    refreshConFloatBtn(e.detail);
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  waitForFirebase(() => {
    const btn = document.getElementById('conFloatBtn');
    if (btn) btn.style.display = 'flex';
    const user = window._auth.currentUser;
    if (user) startListeningContacts(user.uid);
    window._auth.onAuthStateChanged(refreshConFloatBtn);
  });

})();
