/* auth.js — Login system, user management, fake leaderboard data
   ─────────────────────────────────────────────────────────────
   TO CUSTOMIZE:
   • Change 'falcon' password to something only your son knows
   • Change 'falcon' name to your son's actual name
   • Add/remove friends in the USERS object below
   • Each friend gets their own username + password
*/

'use strict';

const USERS = {
  //  username     password          display name     emoji  starting fake XP
  'falcon':   { pw:'FlyEagle1',  name:"Falcon",    emoji:'🦅', fakeXP:0   },
  'aria_k':   { pw:'aria2024',   name:'Aria K.',   emoji:'🦁', fakeXP:840 },
  'marcus_t': { pw:'marc2024',   name:'Marcus T.', emoji:'🐯', fakeXP:720 },
  'sofia_r':  { pw:'sofi2024',   name:'Sofia R.',  emoji:'🦊', fakeXP:670 },
  'ethan_w':  { pw:'ethn2024',   name:'Ethan W.',  emoji:'🐻', fakeXP:590 },
  'chloe_l':  { pw:'chlo2024',   name:'Chloe L.',  emoji:'🐼', fakeXP:520 },
  'jordan_m': { pw:'jord2024',   name:'Jordan M.', emoji:'🦅', fakeXP:430 },
  'priya_s':  { pw:'priy2024',   name:'Priya S.',  emoji:'🦋', fakeXP:370 },
};

const Auth = {
  _key: 'ml_user',

  current()    { return localStorage.getItem(this._key); },
  user()       { const u = this.current(); return u ? USERS[u] : null; },
  isLoggedIn() { const u = this.current(); return !!(u && USERS[u]); },

  login(username, password) {
    const key = (username || '').toLowerCase().trim();
    const u   = USERS[key];
    if (!u || u.pw !== password) return false;
    localStorage.setItem(this._key, key);
    return true;
  },

  logout() {
    localStorage.removeItem(this._key);
    location.reload();
  },

  dataKey() {
    return 'mldata_' + (this.current() || 'guest');
  },

  /* Returns all users as leaderboard entries.
     Current user gets real XP from app state; others get fakeXP. */
  leaderboardEntries() {
    const me = this.current();
    return Object.entries(USERS).map(([key, u]) => ({
      username: key,
      name:     u.name,
      emoji:    u.emoji,
      isMe:     key === me,
      xp:       key === me ? (window.S ? S.totalXP : 0) : u.fakeXP,
      streak:   key === me ? (window.S ? S.streakDays : 0) : Math.max(1, Math.floor(u.fakeXP / 75)),
    }));
  },
};

/* ── Login Screen ─────────────────────────────────────────── */

function renderLoginScreen() {
  return `
  <div id="login-screen">
    <div class="login-card">
      <div class="login-logo">⚡</div>
      <div class="login-title">MicroLearn</div>
      <div class="login-sub">Sign in to continue</div>

      <div class="login-error hidden" id="login-error">
        ❌ Wrong username or password
      </div>

      <input id="login-user" class="login-input" type="text"
             placeholder="Username" autocomplete="username"
             autocapitalize="none" autocorrect="off"/>

      <input id="login-pass" class="login-input" type="password"
             placeholder="Password" autocomplete="current-password"/>

      <button class="login-btn" id="login-submit">Sign In →</button>
    </div>
  </div>`;
}

function initLogin() {
  document.getElementById('app').insertAdjacentHTML('beforebegin', renderLoginScreen());

  const submit = () => {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const err  = document.getElementById('login-error');

    if (Auth.login(user, pass)) {
      document.getElementById('login-screen').remove();
      initApp();
    } else {
      err.classList.remove('hidden');
      document.getElementById('login-pass').value = '';
    }
  };

  document.getElementById('login-submit').addEventListener('click', submit);
  document.getElementById('login-pass').addEventListener('keydown', e => {
    if (e.key === 'Enter') submit();
  });
  document.getElementById('login-user').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-pass').focus();
  });
}

/* Called from app.js DOMContentLoaded */
function bootApp() {
  if (Auth.isLoggedIn()) {
    initApp();
  } else {
    initLogin();
  }
}
