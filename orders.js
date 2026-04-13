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
  /* ── Overlay ── */
  .ord-overlay {
    display:none; position:fixed; inset:0;
    background:rgba(0,0,0,0.78); z-index:10000;
    justify-content:center; align-items:flex-start;
    overflow-y:auto; padding:40px 16px;
  }
  .ord-overlay.open { display:flex; }
  .ord-box {
    background:#0f172a; border:1px solid #1e293b;
    border-radius:18px; padding:30px 28px;
    width:500px; max-width:100%; position:relative;
    font-family:'Poppins',sans-serif; margin:auto;
    box-shadow:0 20px 60px rgba(0,0,0,0.6);
  }
  .ord-close {
    position:absolute; top:14px; right:16px;
    background:none; border:none; color:#475569;
    font-size:20px; cursor:pointer; line-height:1;
    transition:color 0.15s;
  }
  .ord-close:hover { color:white; }

  /* ── Form view ── */
  .ord-title { font-size:19px; font-weight:700; color:white; margin:0 0 6px; }
  .ord-service-badge {
    display:inline-block; font-size:11px; font-weight:600;
    padding:3px 12px; border-radius:20px; margin-bottom:20px;
    background:rgba(56,189,248,0.15); color:#38bdf8;
  }
  .ord-label {
    display:block; font-size:12px; color:#64748b;
    margin:14px 0 5px; font-weight:500; letter-spacing:0.3px;
  }
  .ord-input {
    width:100%; padding:10px 14px; border-radius:9px;
    border:1px solid #1e293b; background:#1e293b; color:white;
    font-family:'Poppins',sans-serif; font-size:13px;
    outline:none; box-sizing:border-box; transition:border-color 0.15s;
  }
  .ord-input:focus { border-color:#38bdf8; }
  .ord-input::placeholder { color:#334155; }
  textarea.ord-input { min-height:88px; resize:vertical; }
  .ord-btn {
    width:100%; padding:12px; border-radius:9px; border:none;
    background:linear-gradient(90deg,#38bdf8,#818cf8);
    color:#0f172a; font-family:'Poppins',sans-serif;
    font-size:14px; font-weight:700; cursor:pointer;
    transition:opacity 0.2s; margin-top:20px;
  }
  .ord-btn:hover { opacity:0.85; }
  .ord-btn:disabled { opacity:0.45; cursor:not-allowed; }
  .ord-err { color:#f87171; font-size:12px; margin-top:8px; min-height:16px; }

  /* ── Orders list view ── */
  .ord-list { display:flex; flex-direction:column; gap:10px; max-height:360px; overflow-y:auto; padding-right:2px; }
  .ord-list::-webkit-scrollbar { width:4px; }
  .ord-list::-webkit-scrollbar-thumb { background:#334155; border-radius:4px; }
  .ord-list-item {
    background:#1e293b; border:1px solid #334155; border-radius:11px;
    padding:14px 16px; cursor:pointer; transition:border-color 0.15s;
    display:flex; align-items:center; justify-content:space-between; gap:10px;
  }
  .ord-list-item:hover { border-color:#38bdf8; }
  .ord-list-left { flex:1; min-width:0; }
  .ord-list-service { font-size:14px; font-weight:600; color:white; margin:0 0 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ord-list-preview { font-size:12px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ord-list-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }
  .ord-new-order-btn {
    display:block; width:100%; padding:11px; border-radius:9px; border:none;
    background:rgba(56,189,248,0.1); color:#38bdf8;
    font-family:'Poppins',sans-serif; font-size:13px; font-weight:600;
    cursor:pointer; transition:background 0.15s; margin-top:14px;
    border:1px solid rgba(56,189,248,0.2);
  }
  .ord-new-order-btn:hover { background:rgba(56,189,248,0.18); }
  .ord-empty { text-align:center; color:#475569; font-size:13px; padding:30px 0; }

  /* ── Status badges ── */
  .s-badge {
    font-size:10px; font-weight:600; padding:2px 9px;
    border-radius:20px; white-space:nowrap;
  }
  .s-pending    { background:rgba(251,191,36,0.15);  color:#fbbf24; }
  .s-in-progress{ background:rgba(56,189,248,0.15);  color:#38bdf8; }
  .s-completed  { background:rgba(74,222,128,0.15);  color:#4ade80; }
  .s-cancelled  { background:rgba(248,113,113,0.15); color:#f87171; }
  .s-upi        { background:rgba(74,222,128,0.12);  color:#4ade80; }
  .unread-dot {
    width:8px; height:8px; border-radius:50%;
    background:#38bdf8; flex-shrink:0;
  }
  .ord-list-item.upi-item { border-color:#1a3a2a; }
  .ord-list-item.upi-item:hover { border-color:#4ade80; }
  .upi-tag {
    font-size:9px; font-weight:700; padding:2px 7px;
    border-radius:20px; background:rgba(74,222,128,0.12);
    color:#4ade80; display:inline-block; margin-bottom:4px;
  }

  /* ── UPI detail view ── */
  .upi-detail-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:10px 0; border-bottom:1px solid #1e293b;
    font-size:13px;
  }
  .upi-detail-row:last-of-type { border-bottom:none; }
  .upi-detail-label { color:#64748b; font-size:12px; }
  .upi-detail-value { color:#e2e8f0; font-weight:600; text-align:right; max-width:60%; word-break:break-all; }
  .upi-detail-value.mono { font-family:monospace; color:#4ade80; }

  /* ── Chat view ── */
  .chat-top {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:4px; flex-wrap:wrap; gap:8px;
  }
  .chat-back {
    background:none; border:none; color:#64748b; font-family:'Poppins',sans-serif;
    font-size:12px; cursor:pointer; padding:0; transition:color 0.15s;
  }
  .chat-back:hover { color:#38bdf8; }
  .chat-order-id { font-size:11px; color:#334155; font-family:monospace; margin:0 0 12px; }
  .chat-msgs {
    height:260px; overflow-y:auto; display:flex;
    flex-direction:column; gap:10px; padding:2px 0;
    margin-bottom:12px;
  }
  .chat-msgs::-webkit-scrollbar { width:4px; }
  .chat-msgs::-webkit-scrollbar-thumb { background:#334155; border-radius:4px; }
  .msg {
    max-width:82%; padding:10px 14px; border-radius:13px;
    font-size:13px; line-height:1.55; word-break:break-word;
  }
  .msg.customer {
    background:linear-gradient(135deg,#1e3a5f,#1e293b);
    border:1px solid #2563eb33; color:#e2e8f0;
    align-self:flex-end; border-bottom-right-radius:4px;
  }
  .msg.admin {
    background:linear-gradient(135deg,#1a2744,#0f172a);
    border:1px solid #38bdf833; color:#e2e8f0;
    align-self:flex-start; border-bottom-left-radius:4px;
  }
  .msg-meta { font-size:10px; color:#475569; margin-top:4px; }
  .msg.customer .msg-meta { text-align:right; }
  .chat-input-row { display:flex; gap:8px; }
  .chat-input {
    flex:1; padding:10px 14px; border-radius:9px;
    border:1px solid #1e293b; background:#1e293b; color:white;
    font-family:'Poppins',sans-serif; font-size:13px; outline:none;
    transition:border-color 0.15s;
  }
  .chat-input:focus { border-color:#38bdf8; }
  .chat-input::placeholder { color:#334155; }
  .chat-send {
    padding:10px 18px; border-radius:9px; border:none;
    background:#38bdf8; color:#0f172a;
    font-family:'Poppins',sans-serif; font-weight:700;
    font-size:13px; cursor:pointer; transition:opacity 0.2s;
  }
  .chat-send:hover { opacity:0.85; }
  .chat-empty-msg { text-align:center; color:#334155; font-size:13px; margin:auto; padding:20px; }
  .chat-closed-note {
    text-align:center; color:#64748b; font-size:12px;
    padding:10px; background:#1e293b; border-radius:8px; margin-top:4px;
  }

  /* ── Float button ── */
  #ordFloatBtn {
    position:fixed; bottom:24px; right:24px;
    background:linear-gradient(135deg,#38bdf8,#818cf8);
    border:none; border-radius:50px; padding:13px 20px;
    color:#0f172a; font-family:'Poppins',sans-serif;
    font-size:14px; font-weight:700; cursor:pointer;
    box-shadow:0 4px 22px rgba(56,189,248,0.45);
    display:none; align-items:center; gap:8px;
    z-index:9000; transition:transform 0.2s, box-shadow 0.2s;
  }
  #ordFloatBtn:hover { transform:translateY(-2px); box-shadow:0 6px 28px rgba(56,189,248,0.55); }
  #ordFloatBadge {
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
  <div id="ordModal" class="ord-overlay">
    <div class="ord-box">
      <button class="ord-close" onclick="closeOrdModal()">✕</button>

      <!-- VIEW: Form -->
      <div id="ordViewForm">
        <p class="ord-title">Place Your Order</p>
        <span id="ordServiceBadge" class="ord-service-badge"></span>
        <label class="ord-label">What exactly do you need?</label>
        <textarea id="ordDetails" class="ord-input" placeholder="e.g. Push from 4500 to 5500 trophies — I'll share account info in chat"></textarea>
        <label class="ord-label">Your Discord / WhatsApp <span style="color:#334155">(optional — you can also just chat here)</span></label>
        <input id="ordContact" class="ord-input" type="text" placeholder="e.g. discord: name#0000">
        <p id="ordErr" class="ord-err"></p>
        <button class="ord-btn" onclick="submitOrder()">Submit Order &amp; Start Chat →</button>
      </div>

      <!-- VIEW: Order list -->
      <div id="ordViewList" style="display:none">
        <p class="ord-title" style="margin-bottom:16px">My Orders</p>
        <div id="ordListItems" class="ord-list"></div>
        <button class="ord-new-order-btn" onclick="ordShowForm(null)">+ Place a New Order</button>
      </div>

      <!-- VIEW: UPI Payment Detail -->
      <div id="ordViewUpi" style="display:none">
        <button class="chat-back" onclick="ordShowList()" style="margin-bottom:12px;">← My Orders</button>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <img src="images/upi.png" style="width:32px;height:32px;object-fit:contain;">
          <div>
            <div style="font-size:16px;font-weight:700;color:white;" id="upiDetailTitle"></div>
            <div style="font-size:11px;color:#64748b;">UPI Payment</div>
          </div>
          <span id="upiDetailBadge" class="s-badge s-pending" style="margin-left:auto;"></span>
        </div>
        <div id="upiDetailRows"></div>
      </div>

      <!-- VIEW: Chat -->
      <div id="ordViewChat" style="display:none">
        <div class="chat-top">
          <button class="chat-back" onclick="ordShowList()">← My Orders</button>
          <span id="chatStatusBadge" class="s-badge s-pending">Pending</span>
        </div>
        <p class="ord-title" style="margin:2px 0 2px" id="chatServiceTitle"></p>
        <p class="chat-order-id">ID: <span id="chatOrderIdSpan"></span></p>
        <div class="chat-msgs" id="chatMsgs"></div>
        <div id="chatInputArea" class="chat-input-row">
          <input id="chatInput" class="chat-input" placeholder="Type a message…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendOrdMsg();}">
          <button class="chat-send" onclick="sendOrdMsg()">Send</button>
        </div>
        <div id="chatClosedNote" class="chat-closed-note" style="display:none">This order is closed. <a href="#" onclick="ordShowForm(null);return false;" style="color:#38bdf8">Start a new order</a></div>
      </div>

    </div>
  </div>

  <button id="ordFloatBtn" onclick="openMyOrders()">
    <img src="images/orders.png" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;"> My Orders
    <span id="ordFloatBadge"></span>
  </button>
  `;
  document.body.appendChild(wrap);

  // ── State ──────────────────────────────────────────────────────────────────
  let _pendingService = null;
  let _activeOrderId  = null;
  let _msgsUnsub      = null;
  let _listUnsub      = null;
  let _upiUnsub       = null;
  let _myOrders       = [];
  let _myUpiPayments  = [];

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

  function statusLabel(s) {
    return { pending:'Pending', 'in-progress':'In Progress', completed:'Completed', cancelled:'Cancelled' }[s] || s;
  }

  function switchView(name) {
    ['ordViewForm','ordViewList','ordViewChat','ordViewUpi'].forEach(id => {
      document.getElementById(id).style.display = id === 'ordView' + name ? '' : 'none';
    });
  }

  function scrollBottom() {
    const el = document.getElementById('chatMsgs');
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }

  // ── Open / close modal ─────────────────────────────────────────────────────
  window.openOrder = function(serviceName) {
    const user = window._auth && window._auth.currentUser;
    if (!user) {
      _pendingService = serviceName;
      window.openAuth();
      return;
    }
    _pendingService = null;
    ordShowForm(serviceName);
    document.getElementById('ordModal').classList.add('open');
  };

  window.closeOrdModal = function() {
    document.getElementById('ordModal').classList.remove('open');
    if (_msgsUnsub) { _msgsUnsub(); _msgsUnsub = null; }
  };

  window.openMyOrders = function() {
    const user = window._auth && window._auth.currentUser;
    if (!user) { window.openAuth(); return; }
    ordShowList();
    document.getElementById('ordModal').classList.add('open');
  };

  // After login: open pending order
  document.addEventListener('authStateChanged', e => {
    if (e.detail && _pendingService) {
      const s = _pendingService; _pendingService = null;
      setTimeout(() => window.openOrder(s), 200);
    }
    refreshFloatBtn(e.detail);
  });

  document.addEventListener('click', e => {
    const m = document.getElementById('ordModal');
    if (m && e.target === m) window.closeOrdModal();
  });

  // ── View helpers ───────────────────────────────────────────────────────────
  window.ordShowForm = function ordShowForm(serviceName) {
    document.getElementById('ordServiceBadge').textContent = serviceName || '';
    document.getElementById('ordDetails').value = '';
    document.getElementById('ordContact').value = '';
    document.getElementById('ordErr').textContent = '';
    const btn = document.querySelector('#ordViewForm .ord-btn');
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Order & Start Chat →'; }
    switchView('Form');
  };

  window.ordShowList = function ordShowList() {
    if (_msgsUnsub) { _msgsUnsub(); _msgsUnsub = null; }
    renderOrderList();
    switchView('List');
  };

  function ordShowChat(orderId, data) {
    _activeOrderId = orderId;
    document.getElementById('chatServiceTitle').textContent = data.service || '';
    document.getElementById('chatOrderIdSpan').textContent = orderId;
    const badge = document.getElementById('chatStatusBadge');
    badge.textContent = statusLabel(data.status);
    badge.className = `s-badge s-${data.status}`;
    const closed = data.status === 'completed' || data.status === 'cancelled';
    document.getElementById('chatInputArea').style.display = closed ? 'none' : 'flex';
    document.getElementById('chatClosedNote').style.display = closed ? '' : 'none';
    document.getElementById('chatMsgs').innerHTML = '<p class="chat-empty-msg">Loading…</p>';
    switchView('Chat');
    listenMsgs(orderId);
    // Clear unread for customer
    window._db.collection('orders').doc(orderId).update({ unreadCustomer: 0 }).catch(()=>{});
  }

  // ── Render order list ──────────────────────────────────────────────────────
  function renderOrderList() {
    const container = document.getElementById('ordListItems');

    // Merge regular orders + UPI payments, sort by date desc
    const upiItems = _myUpiPayments.map(p => ({ ...p, _isUpi: true }));
    const all = [..._myOrders, ...upiItems].sort((a, b) => {
      const ta = (a.updatedAt || a.submittedAt);
      const tb = (b.updatedAt || b.submittedAt);
      const taN = ta && ta.toMillis ? ta.toMillis() : 0;
      const tbN = tb && tb.toMillis ? tb.toMillis() : 0;
      return tbN - taN;
    });

    if (!all.length) {
      container.innerHTML = '<p class="ord-empty">No orders yet.</p>';
      return;
    }

    container.innerHTML = all.map(o => {
      if (o._isUpi) {
        const upiStatus = { pending:'Pending Verification', completed:'Completed', refunded:'Refunded' }[o.status] || o.status;
        return `
          <div class="ord-list-item upi-item" onclick="openUpiDetail('${esc(o.id)}')">
            <div class="ord-list-left">
              <span class="upi-tag">UPI</span>
              <p class="ord-list-service">${esc(o.listingTitle || 'UPI Payment')}</p>
              <p class="ord-list-preview">Txn: ${esc(o.txnId || '—')} · $${o.priceUsd || '—'}</p>
            </div>
            <div class="ord-list-right">
              <span class="s-badge s-${esc(o.status)}">${esc(upiStatus)}</span>
            </div>
          </div>`;
      }
      return `
        <div class="ord-list-item" onclick="openOrderChat('${esc(o.id)}')">
          <div class="ord-list-left">
            <p class="ord-list-service">${esc(o.service)}</p>
            <p class="ord-list-preview">${esc(o.lastMsg || o.details || '')}</p>
          </div>
          <div class="ord-list-right">
            <span class="s-badge s-${esc(o.status)}">${esc(statusLabel(o.status))}</span>
            ${o.unreadCustomer > 0 ? `<span class="unread-dot" title="${o.unreadCustomer} new message(s)"></span>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  window.openOrderChat = async function(orderId) {
    const snap = await window._db.collection('orders').doc(orderId).get();
    if (!snap.exists) return;
    ordShowChat(orderId, snap.data());
  };

  window.openUpiDetail = function(paymentId) {
    const p = _myUpiPayments.find(x => x.id === paymentId);
    if (!p) return;
    const upiStatus = { pending:'Pending Verification', completed:'Completed', refunded:'Refunded' }[p.status] || p.status;
    document.getElementById('upiDetailTitle').textContent = p.listingTitle || 'UPI Payment';
    const badge = document.getElementById('upiDetailBadge');
    badge.textContent = upiStatus;
    badge.className = `s-badge s-${p.status}`;
    document.getElementById('upiDetailRows').innerHTML = `
      <div class="upi-detail-row">
        <span class="upi-detail-label">Amount Paid</span>
        <span class="upi-detail-value">$${p.priceUsd || '—'} USD</span>
      </div>
      <div class="upi-detail-row">
        <span class="upi-detail-label">Transaction ID</span>
        <span class="upi-detail-value mono">${esc(p.txnId || '—')}</span>
      </div>
      <div class="upi-detail-row">
        <span class="upi-detail-label">Delivery Gmail</span>
        <span class="upi-detail-value">${esc(p.deliveryEmail || '—')}</span>
      </div>
      <div class="upi-detail-row">
        <span class="upi-detail-label">UPI ID Paid To</span>
        <span class="upi-detail-value mono">${esc(p.upiId || '—')}</span>
      </div>
      <div class="upi-detail-row">
        <span class="upi-detail-label">Submitted</span>
        <span class="upi-detail-value">${fmtTime(p.submittedAt)}</span>
      </div>
      ${p.orderId ? `
      <div style="background:#0d2a1a;border:1px solid #4ade80;border-radius:10px;padding:14px 16px;text-align:center;">
        <div style="font-size:11px;color:#64748b;margin-bottom:6px;">Your Order ID</div>
        <div style="font-size:22px;font-weight:700;color:#4ade80;font-family:monospace;letter-spacing:2px;">${esc(p.orderId)}</div>
        <div style="font-size:11px;color:#475569;margin-top:6px;">Keep this for reference</div>
      </div>` : `
      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:12px 14px;">
        <div style="font-size:12px;color:#4ade80;font-weight:600;margin-bottom:4px;">✓ If payment received</div>
        <div style="font-size:12px;color:#64748b;">Product delivered to your Gmail within <strong style="color:white;">1 hour</strong>.</div>
        <div style="font-size:12px;color:#f59e0b;font-weight:600;margin:8px 0 4px;">⚠ If payment not found</div>
        <div style="font-size:12px;color:#64748b;">Refund reflected within <strong style="color:white;">24 hours</strong>.</div>
      </div>`}`;
    switchView('Upi');
  };

  // ── Submit new order ───────────────────────────────────────────────────────
  window.submitOrder = async function() {
    const user = window._auth.currentUser;
    if (!user) return;

    const details  = document.getElementById('ordDetails').value.trim();
    const contact  = document.getElementById('ordContact').value.trim();
    const service  = document.getElementById('ordServiceBadge').textContent.trim();
    const errEl    = document.getElementById('ordErr');
    const btn      = document.querySelector('#ordViewForm .ord-btn');

    if (!details) { errEl.textContent = 'Please describe what you need.'; return; }

    btn.disabled = true; btn.textContent = 'Submitting…';
    errEl.textContent = '';

    try {
      const ref = await window._db.collection('orders').add({
        service,
        details,
        contact: contact || 'In-site chat only',
        userId:     user.uid,
        userName:   user.displayName || user.email,
        userEmail:  user.email,
        userAvatar: user.photoURL || '',
        status:     'pending',
        createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:  firebase.firestore.FieldValue.serverTimestamp(),
        lastMsg:    '',
        unreadAdmin:    1,
        unreadCustomer: 0,
      });

      // First message summarising the order
      const firstMsg = `New order placed!\n\nService: ${service}\nDetails: ${details}` +
                       (contact ? `\nContact: ${contact}` : '');
      await window._db.collection('orders').doc(ref.id)
        .collection('messages').add({
          text:       firstMsg,
          sender:     'customer',
          senderName: user.displayName || user.email,
          createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
        });
      // Automated reply
      const autoReply = `Thanks for your order! 🎮 An agent will be assigned to you shortly. We'll update you here in the chat as soon as someone picks up your request.`;
      await window._db.collection('orders').doc(ref.id)
        .collection('messages').add({
          text:       autoReply,
          sender:     'admin',
          senderName: 'Clasherman Support',
          createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
        });
      await window._db.collection('orders').doc(ref.id)
        .update({ lastMsg: `Service: ${service}`, unreadCustomer: 1 });

      ordShowChat(ref.id, { service, status: 'pending' });
      showFloatBtn();

    } catch(err) {
      errEl.textContent = 'Failed to submit — please try again.';
      console.error('[orders]', err);
      btn.disabled = false; btn.textContent = 'Submit Order & Start Chat →';
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  window.sendOrdMsg = async function() {
    const user = window._auth && window._auth.currentUser;
    if (!user || !_activeOrderId) return;
    const input = document.getElementById('chatInput');
    const text  = input.value.trim();
    if (!text) return;
    input.value = '';

    const batch = window._db.batch();
    const msgRef = window._db
      .collection('orders').doc(_activeOrderId)
      .collection('messages').doc();
    batch.set(msgRef, {
      text,
      sender:     'customer',
      senderName: user.displayName || user.email,
      createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
    });
    const ordRef = window._db.collection('orders').doc(_activeOrderId);
    batch.update(ordRef, {
      lastMsg:    text.slice(0, 60),
      updatedAt:  firebase.firestore.FieldValue.serverTimestamp(),
      unreadAdmin: firebase.firestore.FieldValue.increment(1),
    });
    await batch.commit().catch(err => console.error('[orders] send', err));
  };

  // ── Messages real-time listener ────────────────────────────────────────────
  function listenMsgs(orderId) {
    if (_msgsUnsub) { _msgsUnsub(); _msgsUnsub = null; }
    _msgsUnsub = window._db
      .collection('orders').doc(orderId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snap => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const container = document.getElementById('chatMsgs');
        if (!container) return;
        if (!msgs.length) {
          container.innerHTML = '<p class="chat-empty-msg">No messages yet.</p>';
          return;
        }
        container.innerHTML = msgs.map(m => `
          <div class="msg ${esc(m.sender)}">
            ${esc(m.text).replace(/\n/g,'<br>')}
            <div class="msg-meta">${esc(m.senderName)} · ${fmtTime(m.createdAt)}</div>
          </div>
        `).join('');
        scrollBottom();
      }, err => console.error('[orders] msgs listener', err));

    // Also listen for status changes
    window._db.collection('orders').doc(orderId).onSnapshot(snap => {
      if (!snap.exists) return;
      const d = snap.data();
      const badge = document.getElementById('chatStatusBadge');
      if (badge) {
        badge.textContent = statusLabel(d.status);
        badge.className = `s-badge s-${d.status}`;
      }
      const closed = d.status === 'completed' || d.status === 'cancelled';
      const ia = document.getElementById('chatInputArea');
      const cn = document.getElementById('chatClosedNote');
      if (ia) ia.style.display = closed ? 'none' : 'flex';
      if (cn) cn.style.display = closed ? '' : 'none';
    });
  }

  // ── Float button ───────────────────────────────────────────────────────────
  function showFloatBtn() {
    const btn = document.getElementById('ordFloatBtn');
    if (btn) btn.style.display = 'flex';
  }

  function refreshFloatBtn(user) {
    const btn = document.getElementById('ordFloatBtn');
    if (btn) btn.style.display = 'flex';
    if (!user) {
      _myOrders = []; _myUpiPayments = [];
      if (_listUnsub) { _listUnsub(); _listUnsub = null; }
      if (_upiUnsub)  { _upiUnsub();  _upiUnsub  = null; }
      return;
    }
    startListeningOrders(user.uid);
  }

  function startListeningOrders(uid) {
    if (_listUnsub) { _listUnsub(); _listUnsub = null; }
    _listUnsub = window._db.collection('orders')
      .where('userId', '==', uid)
      .onSnapshot(snap => {
        _myOrders = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.updatedAt && a.updatedAt.toMillis ? a.updatedAt.toMillis() : 0;
            const tb = b.updatedAt && b.updatedAt.toMillis ? b.updatedAt.toMillis() : 0;
            return tb - ta;
          });
        const totalUnread = _myOrders.reduce((a, o) => a + (o.unreadCustomer || 0), 0);
        const badge = document.getElementById('ordFloatBadge');
        if (badge) {
          badge.textContent = totalUnread || '';
          badge.style.display = totalUnread > 0 ? 'flex' : 'none';
        }
        if (document.getElementById('ordViewList') &&
            document.getElementById('ordViewList').style.display !== 'none') {
          renderOrderList();
        }
      }, err => console.error('[orders] list listener', err));

    // Also listen to UPI payments
    if (_upiUnsub) { _upiUnsub(); _upiUnsub = null; }
    _upiUnsub = window._db.collection('upi_payments')
      .where('buyerUid', '==', uid)
      .onSnapshot(snap => {
        _myUpiPayments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (document.getElementById('ordViewList') &&
            document.getElementById('ordViewList').style.display !== 'none') {
          renderOrderList();
        }
      }, err => console.error('[orders] upi listener', err));
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  waitForFirebase(() => {
    showFloatBtn();
    const user = window._auth.currentUser;
    if (user) startListeningOrders(user.uid);
    window._auth.onAuthStateChanged(refreshFloatBtn);
  });

})();
