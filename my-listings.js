(function () {

  const COLS = {
    coc:   { collection: 'listings_coc',   label: 'CoC Account', color: '#38bdf8' },
    cr:    { collection: 'listings_cr',    label: 'CR Account',  color: '#a78bfa' },
    clans: { collection: 'listings_clans', label: 'Clan',        color: '#4ade80' }
  };

  // ── CSS ──────────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
  .ml-float-btn {
    display:none; position:fixed; bottom:136px; right:24px;
    width:52px; height:52px; border-radius:50%;
    background:linear-gradient(135deg,#f59e0b,#f97316);
    color:white; border:none; cursor:pointer;
    box-shadow:0 4px 18px rgba(249,115,22,0.45);
    z-index:9000; align-items:center; justify-content:center;
    transition:transform 0.2s, box-shadow 0.2s;
  }
  .ml-float-btn:hover { transform:scale(1.1); box-shadow:0 6px 24px rgba(249,115,22,0.6); }
  .ml-float-btn img { width:24px; height:24px; object-fit:contain; }

  .ml-overlay {
    display:none; position:fixed; inset:0;
    background:rgba(0,0,0,0.78); z-index:10000;
    justify-content:center; align-items:flex-start;
    overflow-y:auto; padding:40px 16px;
  }
  .ml-overlay.open { display:flex; }
  .ml-box {
    background:#0f172a; border:1px solid #1e293b;
    border-radius:18px; padding:28px;
    width:600px; max-width:100%; position:relative;
    font-family:'Poppins',sans-serif; margin:auto;
    box-shadow:0 20px 60px rgba(0,0,0,0.6);
  }
  .ml-close {
    position:absolute; top:14px; right:16px;
    background:none; border:none; color:#475569;
    font-size:20px; cursor:pointer; transition:color 0.15s;
  }
  .ml-close:hover { color:white; }
  .ml-heading { font-size:19px; font-weight:700; color:white; margin:0 0 20px; }
  .ml-tabs { display:flex; gap:6px; margin-bottom:18px; background:#1e293b; border-radius:10px; padding:4px; }
  .ml-tab {
    flex:1; padding:8px; border:none; border-radius:8px;
    background:transparent; color:#64748b;
    font-family:'Poppins',sans-serif; font-size:12px;
    font-weight:600; cursor:pointer; transition:0.2s;
  }
  .ml-tab.active { background:#1d4ed8; color:white; }
  .ml-empty { text-align:center; color:#475569; font-size:13px; padding:40px 0; }
  .ml-card {
    display:flex; align-items:center; gap:14px;
    background:#1e293b; border:1px solid #334155;
    border-radius:12px; padding:12px 14px; margin-bottom:10px;
  }
  .ml-card-thumb {
    width:56px; height:56px; border-radius:8px;
    object-fit:cover; background:#0f172a; flex-shrink:0;
  }
  .ml-card-info { flex:1; min-width:0; }
  .ml-card-title { font-size:12px; font-weight:600; color:#e2e8f0; line-height:1.4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ml-card-price { font-size:14px; font-weight:700; color:#38bdf8; margin-top:2px; }
  .ml-card-type { font-size:10px; font-weight:600; padding:2px 8px; border-radius:20px; display:inline-block; margin-top:4px; }
  .ml-card-actions { display:flex; gap:8px; flex-shrink:0; }
  .ml-edit-btn, .ml-del-btn {
    padding:6px 14px; border-radius:8px; border:none;
    font-family:'Poppins',sans-serif; font-size:12px;
    font-weight:600; cursor:pointer; transition:0.2s;
  }
  .ml-edit-btn { background:#1e40af; color:white; }
  .ml-edit-btn:hover { background:#1d4ed8; }
  .ml-del-btn { background:#7f1d1d; color:#fca5a5; }
  .ml-del-btn:hover { background:#991b1b; }

  /* Edit modal */
  .ml-edit-overlay {
    display:none; position:fixed; inset:0;
    background:rgba(0,0,0,0.85); z-index:11000;
    justify-content:center; align-items:flex-start;
    overflow-y:auto; padding:40px 16px;
  }
  .ml-edit-overlay.open { display:flex; }
  .ml-edit-box {
    background:#0f172a; border:1px solid #1e293b;
    border-radius:18px; padding:28px;
    width:520px; max-width:100%; position:relative;
    font-family:'Poppins',sans-serif; margin:auto;
    box-shadow:0 20px 60px rgba(0,0,0,0.7);
  }
  .ml-edit-heading { font-size:17px; font-weight:700; color:white; margin:0 0 20px; }
  .ml-label { display:block; font-size:11px; font-weight:600; color:#64748b; margin-bottom:5px; letter-spacing:0.4px; text-transform:uppercase; }
  .ml-input, .ml-textarea {
    width:100%; padding:10px 13px; border-radius:8px;
    border:1px solid #334155; background:#1e293b;
    color:white; font-family:'Poppins',sans-serif;
    font-size:13px; outline:none; box-sizing:border-box;
    margin-bottom:14px;
  }
  .ml-input:focus, .ml-textarea:focus { border-color:#38bdf8; }
  .ml-input::placeholder, .ml-textarea::placeholder { color:#475569; }
  .ml-textarea { height:80px; resize:vertical; }
  .ml-img-zone {
    border:2px dashed #334155; border-radius:10px;
    padding:14px; text-align:center; cursor:pointer;
    position:relative; margin-bottom:14px; font-size:12px; color:#64748b;
  }
  .ml-img-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; }
  .ml-img-zone:hover { border-color:#38bdf8; }
  .ml-thumb-preview { width:80px; height:80px; border-radius:8px; object-fit:cover; border:2px solid #334155; margin-top:8px; display:none; }
  .ml-save-btn {
    width:100%; padding:12px; border-radius:10px; border:none;
    background:linear-gradient(90deg,#38bdf8,#818cf8);
    color:#0f172a; font-family:'Poppins',sans-serif;
    font-size:14px; font-weight:700; cursor:pointer; transition:opacity 0.2s;
  }
  .ml-save-btn:hover { opacity:0.88; }
  .ml-save-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .ml-cancel-btn {
    width:100%; padding:11px; border-radius:10px;
    border:1px solid #334155; background:transparent;
    color:#94a3b8; font-family:'Poppins',sans-serif;
    font-size:13px; font-weight:600; cursor:pointer;
    margin-top:8px; transition:0.2s;
  }
  .ml-cancel-btn:hover { border-color:#38bdf8; color:#38bdf8; }
  .ml-msg { font-size:12px; text-align:center; margin:10px 0 0; min-height:16px; }
  .ml-msg.error { color:#f87171; }
  .ml-msg.success { color:#4ade80; }
  `;
  document.head.appendChild(style);

  // ── Float Button ─────────────────────────────────────────────────────────────
  const floatBtn = document.createElement('button');
  floatBtn.className = 'ml-float-btn';
  floatBtn.title = 'My Listings';
  floatBtn.innerHTML = `<img src="images/listings.png" alt="My Listings">`;
  floatBtn.onclick = function() { window.openMyListings(); };
  document.body.appendChild(floatBtn);

  // ── Main Panel HTML ───────────────────────────────────────────────────────────
  const panelEl = document.createElement('div');
  panelEl.innerHTML = `
  <div class="ml-overlay" id="mlOverlay" onclick="mlCloseOutside(event)">
    <div class="ml-box">
      <button class="ml-close" onclick="closeMyListings()">✕</button>
      <p class="ml-heading">📋 My Listings</p>
      <div class="ml-tabs">
        <button class="ml-tab active" onclick="mlSwitchTab('coc',this)">CoC Accounts</button>
        <button class="ml-tab" onclick="mlSwitchTab('cr',this)">CR Accounts</button>
        <button class="ml-tab" onclick="mlSwitchTab('clans',this)">Clans</button>
      </div>
      <div id="mlListContent"><p class="ml-empty">Loading...</p></div>
    </div>
  </div>`;
  document.body.appendChild(panelEl);

  // ── State ─────────────────────────────────────────────────────────────────────
  let _currentTab = 'coc';

  // ── Open / Close ─────────────────────────────────────────────────────────────
  window.openMyListings = function() {
    const user = window._auth && window._auth.currentUser;
    if (!user) return;
    document.getElementById('mlOverlay').classList.add('open');
    mlLoadTab(_currentTab);
  };
  window.closeMyListings = function() {
    document.getElementById('mlOverlay').classList.remove('open');
  };
  window.mlCloseOutside = function(e) {
    if (e.target.id === 'mlOverlay') window.closeMyListings();
  };

  // ── Tab switching ─────────────────────────────────────────────────────────────
  window.mlSwitchTab = function(tab, btn) {
    _currentTab = tab;
    document.querySelectorAll('.ml-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    mlLoadTab(tab);
  };

  function mlLoadTab(tab) {
    const content = document.getElementById('mlListContent');
    content.innerHTML = '<p class="ml-empty">Loading...</p>';
    const user = window._auth.currentUser;
    if (!user) { content.innerHTML = '<p class="ml-empty">Please log in.</p>'; return; }

    window._db.collection(COLS[tab].collection)
      .where('sellerUid', '==', user.uid)
      .get()
      .then(snap => {
        if (snap.empty) {
          content.innerHTML = '<p class="ml-empty">No listings yet.</p>';
          return;
        }
        content.innerHTML = '';
        snap.docs.forEach(doc => {
          const d = doc.data();
          const col = COLS[tab];
          const card = document.createElement('div');
          card.className = 'ml-card';
          card.innerHTML = `
            <img class="ml-card-thumb" src="${d.thumbnail || ''}" onerror="this.style.opacity='0.3'">
            <div class="ml-card-info">
              <div class="ml-card-title">${d.title}</div>
              <div class="ml-card-price">$${d.price}</div>
              <span class="ml-card-type" style="background:rgba(${col.color === '#38bdf8' ? '56,189,248' : col.color === '#a78bfa' ? '167,139,250' : '74,222,128'},0.12);color:${col.color};">${col.label}</span>
            </div>
            <div class="ml-card-actions">
              <button class="ml-edit-btn" onclick="mlOpenEdit('${doc.id}','${tab}')">Edit</button>
              <button class="ml-del-btn" onclick="mlDelete('${doc.id}','${tab}')">Delete</button>
            </div>`;
          content.appendChild(card);
        });
      })
      .catch(() => {
        content.innerHTML = '<p class="ml-empty">Failed to load listings.</p>';
      });
  }

  // ── Edit — redirect to full edit page ────────────────────────────────────────
  window.mlOpenEdit = function(id, type) {
    window.location.href = `edit-listing.html?id=${id}&type=${type}`;
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  window.mlDelete = async function(id, type) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await window._db.collection(COLS[type].collection).doc(id).delete();
      mlLoadTab(type);
    } catch(err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  // ── Auth state ────────────────────────────────────────────────────────────────
  function initAuth() {
    window._auth.onAuthStateChanged(user => {
      floatBtn.style.display = user ? 'flex' : 'none';
    });
  }

  if (window._auth) {
    initAuth();
  } else {
    document.addEventListener('authStateChanged', function once() {
      document.removeEventListener('authStateChanged', once);
      initAuth();
    });
  }

})();
