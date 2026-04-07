(function () {

    // ── Firebase init ─────────────────────────────────
    const firebaseConfig = {
        apiKey: "AIzaSyDXWP9NHvhgPcsIA3Fo52CbpPTKoSejqx8",
        authDomain: "clasherman.firebaseapp.com",
        projectId: "clasherman",
        storageBucket: "clasherman.firebasestorage.app",
        messagingSenderId: "536431763369",
        appId: "1:536431763369:web:272ca187de05caadcaeeb8",
        measurementId: "G-GVSYVRX0Z4"
    };
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window._auth = firebase.auth();
    window._db   = firebase.firestore();

    // ── Inject CSS ────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
    .nav-auth { display:flex; align-items:center; gap:10px; margin-left:20px; }
    .nav-login-btn {
        cursor:pointer;
        background: linear-gradient(135deg,#38bdf8,#0ea5e9);
        color:#0f172a !important;
        font-weight:700; padding:10px 22px;
        border-radius:10px; font-size:15px;
        letter-spacing:0.3px;
        box-shadow:0 4px 14px rgba(56,189,248,0.35);
        transition:0.2s; white-space:nowrap;
        font-family:'Poppins',sans-serif;
    }
    .nav-login-btn:hover { background:linear-gradient(135deg,#0ea5e9,#0284c7); transform:translateY(-1px); }
    .mobile-nav-user { display:flex; align-items:center; gap:8px; font-size:13px; font-family:'Poppins',sans-serif; }
    #userNameDisplay { color:#38bdf8; font-weight:600; }
    .mobile-nav-logout {
        cursor:pointer; background:transparent;
        border:1px solid #475569; color:#94a3b8 !important;
        padding:4px 10px; border-radius:20px; font-size:12px; transition:0.2s;
    }
    .mobile-nav-logout:hover { border-color:#38bdf8; color:#38bdf8 !important; }
    .auth-overlay {
        display:none; position:fixed; inset:0;
        background:rgba(0,0,0,0.7); z-index:9999;
        justify-content:center; align-items:flex-start;
        overflow-y:auto; padding:40px 16px;
    }
    .auth-overlay.open { display:flex; }
    .auth-box {
        background:#0f172a; border:1px solid #1e293b;
        border-radius:16px; padding:36px 32px 28px;
        width:360px; max-width:100%; position:relative;
        font-family:'Poppins',sans-serif;
        margin:auto;
    }
    .auth-close { position:absolute; top:14px; right:16px; background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer; }
    .auth-close:hover { color:white; }
    .auth-tabs { display:flex; gap:6px; margin-bottom:24px; background:#1e293b; border-radius:10px; padding:4px; }
    .auth-tab { flex:1; padding:8px; border:none; border-radius:8px; background:transparent; color:#94a3b8; font-family:'Poppins',sans-serif; font-size:14px; font-weight:500; cursor:pointer; transition:0.2s; }
    .auth-tab.active { background:#38bdf8; color:#0f172a; font-weight:600; }
    .auth-title { font-size:18px; font-weight:700; color:white; margin-bottom:18px; font-family:'Poppins',sans-serif; }
    .auth-subtitle { color:#94a3b8; font-size:13px; margin:-10px 0 16px; }
    .auth-box input {
        width:100%; padding:11px 14px; margin-bottom:12px;
        border-radius:8px; border:1px solid #1e293b;
        background:#1e293b; color:white;
        font-family:'Poppins',sans-serif; font-size:14px;
        outline:none; box-sizing:border-box;
    }
    .auth-box input:focus { border-color:#38bdf8; }
    .auth-box input::placeholder { color:#475569; }
    .auth-submit {
        width:100%; padding:11px; border-radius:8px; border:none;
        background:#38bdf8; color:#0f172a;
        font-family:'Poppins',sans-serif; font-size:15px;
        font-weight:700; cursor:pointer; transition:0.2s; margin-top:4px;
    }
    .auth-submit:hover { background:#0ea5e9; }
    .auth-error { color:#f87171; font-size:12px; margin:-6px 0 10px; min-height:16px; font-family:'Poppins',sans-serif; }
    .auth-success { color:#4ade80; font-size:13px; margin:-6px 0 10px; min-height:16px; font-family:'Poppins',sans-serif; }
    .forgot-link { text-align:center; margin-top:12px; font-size:13px; color:#38bdf8; cursor:pointer; font-family:'Poppins',sans-serif; }
    .forgot-link:hover { text-decoration:underline; }
    @media(max-width:768px){
        .navbar .nav-auth { order:2; margin-left:auto; }
    }
    `;
    document.head.appendChild(style);

    // ── Inject Modal HTML ─────────────────────────────
    const modalEl = document.createElement('div');
    modalEl.innerHTML = `
    <div id="authModal" class="auth-overlay">
        <div class="auth-box">
            <button class="auth-close" onclick="closeAuth()">✕</button>
            <div class="auth-tabs" id="authTabs">
                <button id="tabLogin"  class="auth-tab active" onclick="switchTab('login')">Login</button>
                <button id="tabSignup" class="auth-tab"        onclick="switchTab('signup')">Sign Up</button>
            </div>
            <form id="loginForm" onsubmit="handleLogin(event)">
                <p class="auth-title">Welcome back</p>
                <input type="email"    id="loginEmail" placeholder="Email"    required>
                <input type="password" id="loginPass"  placeholder="Password" required>
                <p id="loginError" class="auth-error"></p>
                <button type="submit" class="auth-submit">Login</button>
                <p class="forgot-link" onclick="switchTab('forgot')">Forgot password?</p>
            </form>
            <form id="signupForm" style="display:none;" onsubmit="handleSignup(event)">
                <p class="auth-title">Create account</p>
                <input type="text"     id="signupName"    placeholder="Username"               required>
                <input type="email"    id="signupEmail"   placeholder="Email"                  required>
                <input type="password" id="signupPass"    placeholder="Password (min 6 chars)"  minlength="6" required>
                <input type="password" id="signupConfirm" placeholder="Confirm password"        minlength="6" required>
                <p id="signupError" class="auth-error"></p>
                <button type="submit" class="auth-submit">Sign Up</button>
            </form>
            <div id="forgotForm" style="display:none;">
                <p class="auth-title">Reset password</p>
                <p class="auth-subtitle">Enter your email and we'll send a reset link.</p>
                <input type="email" id="forgotEmail" placeholder="Your email address">
                <p id="forgotError"   class="auth-error"></p>
                <p id="forgotSuccess" class="auth-success"></p>
                <button onclick="handleForgot()" class="auth-submit">Send Reset Link</button>
                <p class="forgot-link" onclick="switchTab('login')">← Back to login</p>
            </div>
        </div>
    </div>`;
    document.body.appendChild(modalEl);

    // ── Inject nav-auth into navbar ───────────────────
    function injectNavAuth() {
        const navbar = document.querySelector('.navbar');
        if (!navbar || navbar.querySelector('.nav-auth')) return;
        const slot = document.createElement('div');
        slot.className = 'nav-auth';
        slot.innerHTML = `
            <span id="authBtn" onclick="openAuth()" class="nav-login-btn">🔐 Login</span>
            <span id="userGreeting" style="display:none;" class="mobile-nav-user">
                <img id="userAvatar" src="" style="width:32px;height:32px;border-radius:50%;border:2px solid #38bdf8;object-fit:cover;background:#1e293b;">
                <span id="userNameDisplay"></span>
                <span onclick="logout()" class="mobile-nav-logout">Logout</span>
            </span>`;
        navbar.appendChild(slot);
    }

    // ── Device info ───────────────────────────────────
    function getDeviceInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown', os = 'Unknown';
        if (/Chrome/.test(ua) && !/Edge/.test(ua)) browser = 'Chrome';
        else if (/Firefox/.test(ua)) browser = 'Firefox';
        else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
        else if (/Edge/.test(ua)) browser = 'Edge';
        if (/Windows/.test(ua)) os = 'Windows';
        else if (/Android/.test(ua)) os = 'Android';
        else if (/iPhone|iPad/.test(ua)) os = 'iOS';
        else if (/Mac/.test(ua)) os = 'Mac';
        else if (/Linux/.test(ua)) os = 'Linux';
        return { browser, os, device: /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop', screenRes: `${screen.width}x${screen.height}` };
    }

    function friendlyError(code) {
        const map = {
            'auth/email-already-in-use': 'This email is already registered.',
            'auth/invalid-email':        'Invalid email address.',
            'auth/weak-password':        'Password must be at least 6 characters.',
            'auth/user-not-found':       'No account found. Please Sign Up first.',
            'auth/wrong-password':       'Incorrect password.',
            'auth/invalid-credential':   'No account found or wrong password. Please Sign Up if you are new.',
            'auth/too-many-requests':    'Too many attempts. Try again later.',
        };
        return map[code] || `Error: ${code}`;
    }

    // ── Global auth functions ─────────────────────────
    window.openAuth  = () => document.getElementById('authModal').classList.add('open');
    window.closeAuth = () => document.getElementById('authModal').classList.remove('open');
    window.logout    = () => window._auth.signOut();

    window.switchTab = (tab) => {
        document.getElementById('loginForm').style.display  = tab === 'login'  ? '' : 'none';
        document.getElementById('signupForm').style.display = tab === 'signup' ? '' : 'none';
        document.getElementById('forgotForm').style.display = tab === 'forgot' ? '' : 'none';
        document.getElementById('authTabs').style.display   = tab === 'forgot' ? 'none' : '';
        document.getElementById('tabLogin').classList.toggle('active',  tab === 'login');
        document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
        ['loginError','signupError','forgotError','forgotSuccess'].forEach(id => {
            const el = document.getElementById(id); if (el) el.textContent = '';
        });
    };

    window.handleLogin = async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass  = document.getElementById('loginPass').value;
        const errEl = document.getElementById('loginError');
        const btn   = e.target.querySelector('button[type=submit]');
        btn.disabled = true; btn.textContent = 'Logging in...';
        try {
            const cred = await window._auth.signInWithEmailAndPassword(email, pass);
            await window._db.collection('users').doc(cred.user.uid).update({
                lastLogin:  firebase.firestore.FieldValue.serverTimestamp(),
                loginCount: firebase.firestore.FieldValue.increment(1),
                ...getDeviceInfo()
            });
            window.closeAuth();
        } catch(err) { errEl.textContent = friendlyError(err.code); }
        btn.disabled = false; btn.textContent = 'Login';
    };

    window.handleSignup = async (e) => {
        e.preventDefault();
        const name    = document.getElementById('signupName').value.trim();
        const email   = document.getElementById('signupEmail').value.trim();
        const pass    = document.getElementById('signupPass').value;
        const confirm = document.getElementById('signupConfirm').value;
        const errEl   = document.getElementById('signupError');
        const btn     = e.target.querySelector('button[type=submit]');

        if (pass !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }

        btn.disabled = true; btn.textContent = 'Creating...';
        let cred = null;
        try {
            // Create auth account first so we are authenticated for Firestore reads
            cred = await window._auth.createUserWithEmailAndPassword(email, pass);

            // Now check username uniqueness while authenticated
            const nameCheck = await window._db.collection('users')
                .where('nameLower', '==', name.toLowerCase())
                .limit(1)
                .get();

            if (!nameCheck.empty) {
                await cred.user.delete();
                errEl.textContent = 'Username already taken. Please choose another.';
                btn.disabled = false; btn.textContent = 'Sign Up';
                return;
            }

            // Generate a permanent random avatar
            const avatarStyles = ['adventurer','avataaars','big-ears','bottts','fun-emoji','lorelei','micah','personas','pixel-art'];
            const avatarStyle  = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
            const avatarSeed   = Math.random().toString(36).substring(2, 12);
            const avatarUrl    = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}`;

            await cred.user.updateProfile({ displayName: name, photoURL: avatarUrl });
            await window._db.collection('users').doc(cred.user.uid).set({
                name, nameLower: name.toLowerCase(), email, avatarUrl,
                joinedAt:   firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin:  firebase.firestore.FieldValue.serverTimestamp(),
                loginCount: 1,
                ...getDeviceInfo()
            });
            window.closeAuth();
        } catch(err) {
            // Clean up auth account if anything went wrong after creation
            if (cred) await cred.user.delete().catch(() => {});
            errEl.textContent = friendlyError(err.code);
        }
        btn.disabled = false; btn.textContent = 'Sign Up';
    };

    window.handleForgot = async () => {
        const email  = document.getElementById('forgotEmail').value.trim();
        const errEl  = document.getElementById('forgotError');
        const succEl = document.getElementById('forgotSuccess');
        errEl.textContent = ''; succEl.textContent = '';
        if (!email) { errEl.textContent = 'Please enter your email.'; return; }
        try {
            await window._auth.sendPasswordResetEmail(email);
            succEl.textContent = '✅ Reset link sent! Check your inbox.';
            document.getElementById('forgotEmail').value = '';
        } catch(err) { errEl.textContent = friendlyError(err.code); }
    };

    // ── Auth state ────────────────────────────────────
    window._auth.onAuthStateChanged(user => {
        const btn      = document.getElementById('authBtn');
        const greeting = document.getElementById('userGreeting');
        const nameEl   = document.getElementById('userNameDisplay');
        const avatarEl = document.getElementById('userAvatar');
        if (btn)      btn.style.display      = user ? 'none' : '';
        if (greeting) greeting.style.display = user ? 'flex' : 'none';
        if (user) {
            if (nameEl)   nameEl.textContent = user.displayName || user.email;
            if (avatarEl) avatarEl.src = user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`;
        }
        document.dispatchEvent(new CustomEvent('authStateChanged', { detail: user }));
    });

    // close modal on outside click
    document.addEventListener('click', e => {
        const modal = document.getElementById('authModal');
        if (modal && e.target === modal) window.closeAuth();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNavAuth);
    } else {
        injectNavAuth();
    }

})();
