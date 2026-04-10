/* app.js — MicroLearn PWA — complete application logic */

'use strict';

// ============================================================
// CONSTANTS
// ============================================================

const CIRCUMFERENCE = 2 * Math.PI * 45; // SVG timer ring (r=45)

// Leaderboard data now comes from auth.js (Auth.leaderboardEntries())

const ACHIEVEMENTS = [
  {id:'first',    title:'First Step',    desc:'Complete your first session',          icon:'⭐'},
  {id:'fire3',    title:'On Fire 🔥',    desc:'Maintain a 3-day streak',              icon:'🔥'},
  {id:'week',     title:'Week Warrior',  desc:'Maintain a 7-day streak',             icon:'⚡'},
  {id:'xp100',    title:'Century Club',  desc:'Earn 100 total XP',                   icon:'💯'},
  {id:'xp500',    title:'Scholar',       desc:'Earn 500 total XP',                   icon:'🎓'},
  {id:'poly',     title:'Polymath',      desc:'Study all 5 subjects',                icon:'🌐'},
  {id:'ten',      title:'Consistent',    desc:'Complete 10 total sessions',           icon:'✅'},
  {id:'deep',     title:'Deep Diver',    desc:'Complete a 10-minute session',         icon:'⏱️'},
  {id:'palg',     title:'Algebra Ace',   desc:'Score 100% in an Algebra session',     icon:'📐'},
  {id:'pbio',     title:'Bio Whiz',      desc:'Score 100% in a Biology session',      icon:'🧬'},
  {id:'peng',     title:'Word Nerd',     desc:'Score 100% in an English session',     icon:'📚'},
  {id:'pcsp',     title:'Tech Genius',   desc:'Score 100% in an AP CSP session',      icon:'💻'},
  {id:'pesp',     title:'¡Excelente!',   desc:'Score 100% in a Spanish session',      icon:'🌎'},
  {id:'speed',    title:'Speed Demon',   desc:'Answer 5 in a row under 8 seconds each',icon:'🏃'},
];

// ============================================================
// STATE
// ============================================================

const S = {
  // Navigation
  viewStack: [],
  activeTab: 'home',

  // User (persisted)
  userName:     'Freshman',
  totalXP:      0,
  streakDays:   0,
  totalSessions:0,
  lastStudyDate:null,
  sessions:     [],
  unlockedAchs: [],

  // Session (ephemeral)
  sesSubjects:   [],
  sesUnitId:     null,
  sesDuration:   5,
  sesStartTime:  0,
  sesState:      'idle', // idle|question|feedback|finished
  sesQuestion:   null,
  sesOptions:    [],
  sesSelected:   null,
  sesTimeLeft:   0,
  sesTimer:      null,
  sesQAnswered:  0,
  sesQCorrect:   0,
  sesConsec:     0,
  sesSpeedStreak:0,
  sesXP:         0,
  sesQueue:      [],
  sesUsed:       new Set(),
  sesQStart:     0,
  sesRecycled:   0,

  // Resources filter
  resFilter:     'all',
};

// ============================================================
// STORAGE
// ============================================================

function save() {
  const data = {
    userName:      S.userName,
    totalXP:       S.totalXP,
    streakDays:    S.streakDays,
    totalSessions: S.totalSessions,
    lastStudyDate: S.lastStudyDate,
    sessions:      S.sessions.slice(0, 50),
    unlockedAchs:  S.unlockedAchs,
  };
  localStorage.setItem(Auth.dataKey(), JSON.stringify(data));
}

function load() {
  try {
    const raw = localStorage.getItem(Auth.dataKey());
    if (!raw) return;
    const d = JSON.parse(raw);
    Object.assign(S, d);
  } catch(e) {}
}

// ============================================================
// HELPERS
// ============================================================

function levelFor(xp) { return Math.max(1, Math.floor(xp / 100)); }
function levelTitle(lvl) {
  if (lvl <= 2)  return 'Sprout';
  if (lvl <= 5)  return 'Scholar';
  if (lvl <= 9)  return 'Expert';
  if (lvl <= 14) return 'Master';
  return 'Legend';
}
function xpProgress(xp) {
  const lvl = levelFor(xp);
  const start = lvl * 100, end = (lvl+1)*100;
  return (xp - start) / (end - start);
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function fmtTime(secs) {
  return `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;
}
function pct(correct, total) {
  if (!total) return '—';
  return Math.round(correct/total*100)+'%';
}
function subColor(sub) { return SUBJECTS[sub]?.color || '#5856D6'; }
function subEmoji(sub) { return SUBJECTS[sub]?.emoji || '📖'; }
function subShort(sub) { return SUBJECTS[sub]?.short || sub; }

// ============================================================
// NAVIGATION
// ============================================================

const vc = () => document.getElementById('view-container');
const tabBar = () => document.getElementById('tab-bar');

function navigate(viewId, data = {}, back = false) {
  S.viewStack.push(viewId);
  renderView(viewId, data, back);
  // Hide tab bar during sessions
  const hideTabs = ['session','results'].includes(viewId);
  tabBar().classList.toggle('hidden', hideTabs);
}

function goBack() {
  if (S.viewStack.length <= 1) return;
  S.viewStack.pop();
  const prev = S.viewStack[S.viewStack.length-1];
  renderView(prev, {}, true);
  tabBar().classList.remove('hidden');
}

function switchTab(tab) {
  S.activeTab = tab;
  S.viewStack = [tab];
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  renderView(tab, {}, false);
  tabBar().classList.remove('hidden');
}

function renderView(viewId, data, back) {
  const container = vc();
  let html = '';
  switch(viewId) {
    case 'home':        html = renderHome(); break;
    case 'leaderboard': html = renderLeaderboard(); break;
    case 'resources':   html = renderResources(); break;
    case 'profile':     html = renderProfile(); break;
    case 'unitselect':  html = renderUnitSelect(data); break;
    case 'setup':       html = renderSetup(data); break;
    case 'session':     html = renderSession(); break;
    case 'results':     html = renderResults(); break;
    default: html = '<div class="view"></div>';
  }
  container.innerHTML = html;
  container.scrollTop = 0;
  // Animate
  const view = container.firstElementChild;
  if (view) {
    view.classList.add(back ? 'view-back' : 'view-enter');
    setTimeout(() => view.classList.remove('view-enter','view-back'), 300);
  }
  // Post-render hooks
  if (viewId === 'session') startSession();
  if (viewId === 'profile') setupProfileInput();
}

// ============================================================
// HOME VIEW
// ============================================================

function renderHome() {
  const lvl = levelFor(S.totalXP);
  const prog = xpProgress(S.totalXP);
  const recentHTML = S.sessions.slice(0,6).map(ses => `
    <div class="recent-card">
      <div class="recent-card-icons">${ses.subjects.slice(0,3).map(s=>subEmoji(s)).join('')}</div>
      <div class="recent-card-pct">${pct(ses.correct, ses.answered)}</div>
      <div class="recent-card-sub">${ses.correct}/${ses.answered} correct</div>
      <div class="recent-card-xp">+${ses.xpEarned} XP</div>
    </div>`).join('');

  const achHTML = ACHIEVEMENTS.map(a => `
    <div class="ach-chip ${S.unlockedAchs.includes(a.id)?'unlocked':''}">
      <div class="ach-icon-wrap">${a.icon}</div>
      <div class="ach-chip-label">${a.title}</div>
    </div>`).join('');

  const subjectCards = Object.entries(SUBJECTS).map(([key,sub]) => {
    const subXP = S.sessions.filter(s=>s.subjects.includes(key)).reduce((t,s)=>t+s.xpEarned,0);
    return `
    <button class="subject-card" style="background:linear-gradient(135deg,${sub.color},${sub.color}BB)"
            onclick="showUnitSelect('${key}')">
      <div class="subject-card-icon-bg">${sub.emoji}</div>
      <div class="subject-card-icon">${sub.emoji}</div>
      <div class="subject-card-name">${sub.short}</div>
      <div class="subject-card-xp">${subXP} XP</div>
    </button>`;
  }).join('');

  return `<div class="view home-scroll">
    <div class="page-title">MicroLearn ⚡</div>

    <div class="header-card">
      <div class="header-top">
        <div>
          <div class="header-xp">${S.totalXP} XP</div>
          <div class="header-level">Level ${lvl} · ${levelTitle(lvl)}</div>
        </div>
        <div class="streak-badge ${S.streakDays===0?'zero':''}">
          🔥 ${S.streakDays} ${S.streakDays===1?'day':'days'}
        </div>
      </div>
      <div class="xp-bar-wrap">
        <div class="xp-bar-labels">
          <span style="color:var(--c-accent)">Lv ${lvl}</span>
          <span>Lv ${lvl+1}</span>
        </div>
        <div class="xp-bar-track">
          <div class="xp-bar-fill" style="width:${Math.round(prog*100)}%"></div>
        </div>
      </div>
    </div>

    <button class="medley-btn" onclick="startMedley()">
      <div class="medley-text">
        <h3>🔀 Medley Mode</h3>
        <p>Mix questions from all 5 subjects</p>
      </div>
      <div class="medley-play">▶</div>
    </button>

    <div class="subjects-section">
      <div class="section-title">Subjects</div>
      <div class="subject-grid">${subjectCards}</div>
    </div>

    ${S.sessions.length > 0 ? `
    <div class="section-header">
      <div class="section-title" style="padding:0">Recent Sessions</div>
    </div>
    <div class="recent-scroll">${recentHTML}</div>` : ''}

    <div class="section-header">
      <div class="section-title" style="padding:0">Achievements</div>
      <div class="section-header-right">${S.unlockedAchs.length}/${ACHIEVEMENTS.length}</div>
    </div>
    <div class="achievement-strip">${achHTML}</div>

    <div style="height:20px"></div>
  </div>`;
}

// ============================================================
// SESSION SETUP VIEW
// ============================================================

function startSetup(subjectKey) {
  S.sesSubjects = [subjectKey];
  S.sesUnitId   = null;
  navigate('setup', { subjects: [subjectKey] });
}
function startMedley() {
  S.sesSubjects = Object.keys(SUBJECTS);
  S.sesUnitId   = null;
  navigate('setup', { subjects: Object.keys(SUBJECTS) });
}

// ── Unit Selection ──────────────────────────────────────────────
function showUnitSelect(subjectKey) {
  S.sesSubjects = [subjectKey];
  navigate('unitselect', { subject: subjectKey });
}

function renderUnitSelect(data) {
  const subKey = data.subject || S.sesSubjects[0];
  const sub    = SUBJECTS[subKey];
  const units  = (typeof SUBJECT_UNITS !== 'undefined' && SUBJECT_UNITS[subKey]) || [];
  const color  = sub.color;
  const total  = (QUESTION_BANK[subKey] || []).length;

  const unitCards = units.map(unit => {
    const count  = getUnitQuestionCount(subKey, unit.id);
    const locked = unit.locked || count === 0;
    return `
    <button class="unit-card ${locked?'locked':''}"
            ${locked ? 'disabled' : `onclick="startUnitSetup('${subKey}','${unit.id}')"`}
            style="${locked ? '' : 'border-left:4px solid '+color}">
      <div class="unit-card-icon">${unit.icon}</div>
      <div class="unit-card-info">
        <div class="unit-card-name">${unit.name}</div>
        <div class="unit-card-count">${locked ? 'Coming soon' : count+' questions'}</div>
      </div>
      <div class="unit-card-arrow">${locked ? '🔒' : '→'}</div>
    </button>`;
  }).join('');

  return `<div class="view">
    <div class="nav-bar">
      <button class="nav-btn" onclick="goBack()">← Back</button>
      <div class="nav-title">${sub.emoji} ${sub.short}</div>
      <div class="nav-btn right"></div>
    </div>

    <div class="page-title" style="padding-top:8px">Choose a Unit</div>

    <button class="unit-card all-units" onclick="startSetup('${subKey}')"
            style="border-left:4px solid ${color}">
      <div class="unit-card-icon">📚</div>
      <div class="unit-card-info">
        <div class="unit-card-name">All Units</div>
        <div class="unit-card-count">${total} questions</div>
      </div>
      <div class="unit-card-arrow">→</div>
    </button>

    <div style="padding:4px 16px 8px">
      <div class="label-sm">By Unit</div>
    </div>
    ${unitCards}
    <div style="height:20px"></div>
  </div>`;
}

function startUnitSetup(subjectKey, unitId) {
  S.sesSubjects = [subjectKey];
  S.sesUnitId   = unitId;
  navigate('setup', { subject: subjectKey, unitId });
}

function renderSetup() {
  const isMedley = S.sesSubjects.length > 1;
  const color = isMedley ? '#5856D6' : subColor(S.sesSubjects[0]);
  const emoji = isMedley ? '🔀' : subEmoji(S.sesSubjects[0]);
  const title = isMedley ? 'All Subjects Medley' : SUBJECTS[S.sesSubjects[0]].name;

  const allTopics = S.sesSubjects.flatMap(s => {
    const qs = QUESTION_BANK[s] || [];
    return [...new Set(qs.map(q=>q.topic))];
  });
  const topicsHTML = shuffle(allTopics).slice(0,14).map(t =>
    `<span class="topic-chip" style="background:${color}18;color:${color}">${t}</span>`
  ).join('');

  const timeButtons = [3,5,10].map(m => `
    <button class="time-btn ${S.sesDuration===m?'selected':''}"
            style="color:${color}"
            onclick="selectTime(${m})">
      <span class="time-num" style="color:${S.sesDuration===m?'#fff':color}">${m}</span>
      <span class="time-label">min</span>
    </button>`).join('');

  const estQ = S.sesDuration === 3 ? 7 : S.sesDuration === 5 ? 12 : 24;

  return `<div class="view">
    <div class="nav-bar">
      <button class="nav-btn" onclick="goBack()">← Back</button>
      <div class="nav-title">${isMedley?'Medley Mode':SUBJECTS[S.sesSubjects[0]].short}</div>
      <div class="nav-btn right"></div>
    </div>

    <div class="setup-hero">
      <div class="setup-icon-ring" style="background:${color}18">
        <span style="font-size:44px">${emoji}</span>
      </div>
      <div class="setup-title">${title}</div>
      <div class="setup-sub">Choose a time block to get started</div>
    </div>

    <div class="how-it-works">
      <div class="how-item">
        <div class="how-item-icon">❓</div>
        <div class="how-item-title">Question</div>
        <div class="how-item-desc">Tap the correct answer</div>
      </div>
      <div class="how-item">
        <div class="how-item-icon">⚡</div>
        <div class="how-item-title">XP</div>
        <div class="how-item-desc">+5–20 per correct</div>
      </div>
      <div class="how-item">
        <div class="how-item-icon">🔥</div>
        <div class="how-item-title">Streak</div>
        <div class="how-item-desc">3 in a row = bonus</div>
      </div>
    </div>

    <div style="padding:20px 16px 8px">
      <div class="label-sm" style="margin-bottom:10px">Choose your block</div>
      <div class="time-grid">${timeButtons}</div>
      <div class="caption" style="margin-top:8px">~${estQ} questions in ${S.sesDuration} minutes</div>
    </div>

    <div style="padding:4px 16px 8px">
      <div class="label-sm" style="margin-bottom:8px">Topics</div>
      <div class="topic-chips">${topicsHTML}</div>
    </div>

    <button class="start-btn" style="background:${color};box-shadow:0 8px 24px ${color}44"
            onclick="beginSession()">
      ▶ Start ${S.sesDuration}-Minute Session
    </button>
    <div style="height:20px"></div>
  </div>`;
}

function selectTime(m) {
  S.sesDuration = m;
  renderView('setup', {});
}

function beginSession() {
  navigate('session');
}

// ============================================================
// SESSION VIEW
// ============================================================

function renderSession() {
  return `<div class="view session-view" style="height:100%">
    <div class="nav-bar">
      <div class="nav-btn"></div>
      <div class="nav-title" id="ses-title">—</div>
      <button class="nav-btn right danger" onclick="endSession()">End</button>
    </div>

    <div class="session-stats">
      <div class="stat-col left">
        <div class="stat-val xp" id="ses-xp">0</div>
        <div class="stat-lbl">XP</div>
      </div>

      <div class="timer-wrap">
        <svg class="timer-svg" viewBox="0 0 100 100">
          <circle class="timer-track" cx="50" cy="50" r="45"/>
          <circle class="timer-progress" id="timer-arc" cx="50" cy="50" r="45"
            stroke="#5856D6"
            stroke-dasharray="${CIRCUMFERENCE}"
            stroke-dashoffset="0"/>
          <text class="timer-text timer-time" x="50" y="47" text-anchor="middle" id="timer-txt">—:——</text>
          <text class="timer-text timer-sub"  x="50" y="60" text-anchor="middle">left</text>
        </svg>
      </div>

      <div class="stat-col right">
        <div class="stat-val" id="ses-acc">—</div>
        <div class="stat-lbl">correct</div>
      </div>
    </div>

    <div class="session-counter">
      ✅ <span id="ses-counter">0/0 correct</span>
      <span class="streak-pill" id="ses-streak" style="display:none"></span>
    </div>

    <div class="session-scroll" id="ses-scroll">
      <div id="ses-card"></div>
    </div>
  </div>`;
}

function startSession() {
  // Reset session state
  S.sesState = 'question';
  S.sesQAnswered = 0;
  S.sesQCorrect = 0;
  S.sesConsec = 0;
  S.sesSpeedStreak = 0;
  S.sesXP = 0;
  S.sesUsed = new Set();
  S.sesRecycled = 0;
  S.sesTimeLeft = S.sesDuration * 60;

  // Build question queue (with optional unit filter)
  const seed = typeof getDaySeed === 'function' ? getDaySeed() : Date.now();

  let allQ = S.sesSubjects.flatMap(sub => {
    let qs = QUESTION_BANK[sub] || [];
    if (S.sesSubjects.length === 1 && S.sesUnitId && typeof SUBJECT_UNITS !== 'undefined') {
      const unit = (SUBJECT_UNITS[sub] || []).find(u => u.id === S.sesUnitId);
      if (unit && unit.topics && unit.topics.length > 0) {
        qs = qs.filter(q => unit.topics.includes(q.topic));
      }
    }
    return qs.map(q => ({...q, subject:sub}));
  });

  // Auto-pad: if unit has < 12 questions, fill with other questions from same subject
  if (S.sesUnitId && S.sesSubjects.length === 1 && allQ.length < 12) {
    const sub = S.sesSubjects[0];
    const usedIds = new Set(allQ.map(q => q.id));
    const padQ = (QUESTION_BANK[sub] || [])
      .filter(q => !usedIds.has(q.id))
      .map(q => ({...q, subject:sub, _pad:true}));
    const padShuffled = typeof seededShuffle === 'function' ? seededShuffle(padQ, seed + 1) : shuffle(padQ);
    allQ = [...allQ, ...padShuffled.slice(0, 20 - allQ.length)];
  }

  S.sesQueue = typeof seededShuffle === 'function' ? seededShuffle(allQ, seed) : shuffle(allQ);
  S.sesStartTime = Date.now();

  // Update title
  const t = document.getElementById('ses-title');
  if (t) t.textContent = S.sesSubjects.length > 1 ? 'Medley' : subShort(S.sesSubjects[0]);

  // Update timer color
  const color = S.sesSubjects.length > 1 ? '#5856D6' : subColor(S.sesSubjects[0]);
  const arc = document.getElementById('timer-arc');
  if (arc) arc.setAttribute('stroke', color);

  // Start timer
  updateTimerDisplay();
  S.sesTimer = setInterval(() => {
    S.sesTimeLeft--;
    updateTimerDisplay();
    if (S.sesTimeLeft <= 0) endSession();
  }, 1000);

  nextQuestion();
}

function updateTimerDisplay() {
  const txt = document.getElementById('timer-txt');
  const arc = document.getElementById('timer-arc');
  if (txt) txt.textContent = fmtTime(S.sesTimeLeft);
  if (arc) {
    const total = S.sesDuration * 60;
    const frac = S.sesTimeLeft / total;
    arc.style.strokeDashoffset = CIRCUMFERENCE * (1 - frac);
  }
}

function nextQuestion() {
  let q = S.sesQueue.find(q => !S.sesUsed.has(q.id));
  if (!q) {
    // Recycle: reshuffle and keep going
    S.sesRecycled++;
    S.sesUsed.clear();
    const seed = (typeof getDaySeed === 'function' ? getDaySeed() : Date.now()) + S.sesRecycled;
    S.sesQueue = typeof seededShuffle === 'function' ? seededShuffle(S.sesQueue, seed) : shuffle(S.sesQueue);
    q = S.sesQueue[0];
    if (!q) { endSession(); return; }
    // Show brief recycle toast
    const card = document.getElementById('ses-card');
    if (card) {
      const toast = document.createElement('div');
      toast.style.cssText = 'position:absolute;top:8px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.6);color:#fff;padding:4px 12px;border-radius:12px;font-size:12px;z-index:10;white-space:nowrap';
      toast.textContent = '🔄 Round ' + (S.sesRecycled + 1);
      card.style.position = 'relative';
      card.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
    }
  }
  S.sesUsed.add(q.id);
  S.sesQuestion = q;
  S.sesOptions = shuffle(q.opts);
  S.sesSelected = null;
  S.sesState = 'question';
  S.sesQStart = Date.now();
  renderQuestionCard();
}

function renderQuestionCard() {
  const q = S.sesQuestion;
  if (!q) return;
  const color = subColor(q.subject);
  const diffDots = ['easy','medium','hard'].map((d,i) =>
    `<div class="diff-dot ${i < ['easy','medium','hard'].indexOf(q.diff)+1 ? 'filled '+q.diff : ''}"></div>`
  ).join('');

  const optHTML = S.sesOptions.map((opt,i) => {
    let cls = 'answer-btn';
    let icon = '';
    if (S.sesState === 'feedback') {
      if (opt === q.opts[0]) { cls += ' correct'; icon = '<span class="answer-btn-icon">✅</span>'; }
      else if (opt === S.sesSelected) { cls += ' wrong'; icon = '<span class="answer-btn-icon">❌</span>'; }
    }
    const disabled = S.sesState === 'feedback' ? 'disabled' : '';
    return `<button class="${cls}" ${disabled} onclick="submitAnswer(${i})">${opt}${icon}</button>`;
  }).join('');

  const expHTML = S.sesState === 'feedback' ? `
    <div class="explanation-box ${S.sesSelected===q.opts[0]?'correct':'wrong'}">
      <div class="explanation-title ${S.sesSelected===q.opts[0]?'correct':'wrong'}">
        ${S.sesSelected===q.opts[0]?'✅ Correct!':'💡 Here\'s why:'}
      </div>
      <div class="explanation-body">${q.exp}</div>
    </div>` : '';

  const nextBtn = S.sesState === 'feedback' ? `
    <button class="next-btn" style="background:${color}" onclick="advanceQuestion()">
      Next Question →
    </button>` : '';

  const card = document.getElementById('ses-card');
  if (!card) return;
  card.innerHTML = `
    <div class="question-card">
      <div class="q-header">
        <span class="q-topic-chip" style="background:${color}18;color:${color}">${q.topic}</span>
        <div class="diff-dots">${diffDots}</div>
      </div>
      <div class="q-text">${q.q}</div>
      ${optHTML}
      ${expHTML}
    </div>
    ${nextBtn}`;

  document.getElementById('ses-scroll')?.scrollTo({top:0, behavior:'smooth'});
}

function submitAnswer(idx) {
  if (S.sesState !== 'question' || !S.sesQuestion) return;
  const answer = S.sesOptions[idx];
  S.sesSelected = answer;
  S.sesState = 'feedback';
  S.sesQAnswered++;

  const correct = answer === S.sesQuestion.opts[0];
  const elapsed = (Date.now() - S.sesQStart) / 1000;

  if (correct) {
    S.sesQCorrect++;
    S.sesConsec++;
    // XP
    const diffXP = {easy:5, medium:10, hard:20}[S.sesQuestion.diff] || 10;
    let earned = diffXP;
    if (elapsed < 8) { earned += 5; S.sesSpeedStreak++; } else { S.sesSpeedStreak = 0; }
    if (S.sesConsec > 0 && S.sesConsec % 3 === 0) earned += Math.floor(diffXP/2);
    S.sesXP += earned;
  } else {
    S.sesConsec = 0;
    S.sesSpeedStreak = 0;
  }

  updateSessionStats();
  renderQuestionCard();
}

function advanceQuestion() {
  nextQuestion();
}

function updateSessionStats() {
  const xpEl = document.getElementById('ses-xp');
  const accEl = document.getElementById('ses-acc');
  const ctrEl = document.getElementById('ses-counter');
  const strEl = document.getElementById('ses-streak');
  if (xpEl) xpEl.textContent = S.sesXP;
  if (accEl) accEl.textContent = pct(S.sesQCorrect, S.sesQAnswered);
  if (ctrEl) ctrEl.textContent = `${S.sesQCorrect}/${S.sesQAnswered} correct`;
  if (strEl) {
    if (S.sesConsec >= 2) {
      strEl.style.display = 'inline';
      strEl.textContent = `🔥 ${S.sesConsec} streak`;
    } else {
      strEl.style.display = 'none';
    }
  }
}

function endSession() {
  clearInterval(S.sesTimer);
  S.sesState = 'finished';

  const prevLevel = levelFor(S.totalXP);

  // Update streak
  const today = new Date().toDateString();
  if (S.lastStudyDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (S.lastStudyDate === yesterday) S.streakDays++;
    else if (!S.lastStudyDate) S.streakDays = 1;
    else S.streakDays = 1;
    S.lastStudyDate = today;
  }

  // Record session
  const actualMs = S.sesStartTime > 0 ? Date.now() - S.sesStartTime : S.sesDuration * 60000;
  const rec = {
    id:            Date.now(),
    date:          new Date().toISOString(),
    subjects:      [...S.sesSubjects],
    unitId:        S.sesUnitId || null,
    duration:      S.sesDuration,
    actualMinutes: Math.max(1, Math.round(actualMs / 60000)),
    answered:      S.sesQAnswered,
    correct:       S.sesQCorrect,
    xpEarned:      S.sesXP,
  };
  S.sessions.unshift(rec);
  S.totalXP += S.sesXP;
  S.totalSessions++;

  checkAchievements();
  save();

  const newLevel = levelFor(S.totalXP);
  navigate('results');

  if (newLevel > prevLevel) {
    setTimeout(() => showLevelUp(newLevel), 400);
  }
}

// ============================================================
// RESULTS VIEW
// ============================================================

function renderResults() {
  const acc = S.sesQAnswered > 0 ? S.sesQCorrect/S.sesQAnswered : 0;
  const emoji = acc >= .9 ? '🏆' : acc >= .75 ? '⭐' : acc >= .5 ? '👍' : '📚';
  const msg   = acc >= .9 ? 'Outstanding!' : acc >= .75 ? 'Great Work!' : acc >= .5 ? 'Good Effort!' : 'Keep Practicing!';
  const lvl   = levelFor(S.totalXP);
  const prog  = xpProgress(S.totalXP);
  const color = S.sesSubjects.length > 1 ? '#5856D6' : subColor(S.sesSubjects[0]);

  const resources = RESOURCES
    .filter(r => S.sesSubjects.includes(r.subject) && r.featured)
    .slice(0,3);

  const resHTML = resources.map(r => `
    <a class="resource-row" href="${r.url}" target="_blank" rel="noopener">
      <div class="resource-icon-wrap" style="background:${subColor(r.subject)}18">${r.icon}</div>
      <div class="resource-info">
        <div class="resource-name">${r.title}</div>
        <div class="resource-desc">${r.desc}</div>
      </div>
      <div class="resource-arrow">↗</div>
    </a>`).join('');

  return `<div class="view results-view">
    <div class="nav-bar" style="position:relative;top:0">
      <div class="nav-btn"></div>
      <div class="nav-title">Session Complete</div>
      <div class="nav-btn right"></div>
    </div>

    <div class="results-emoji">${emoji}</div>
    <div class="results-message">${msg}</div>
    <div class="results-sub">${S.sesSubjects.length>1?'Medley':subShort(S.sesSubjects[0])} · ${S.sesDuration}min session</div>

    <div class="stats-row">
      <div class="stat-tile">
        <div class="stat-tile-icon">⭐</div>
        <div class="stat-tile-val" style="color:var(--yellow)">+${S.sesXP}</div>
        <div class="stat-tile-lbl">XP Earned</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-icon">✅</div>
        <div class="stat-tile-val" style="color:var(--green)">${S.sesQCorrect}/${S.sesQAnswered}</div>
        <div class="stat-tile-lbl">Correct</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-icon">📊</div>
        <div class="stat-tile-val">${pct(S.sesQCorrect,S.sesQAnswered)}</div>
        <div class="stat-tile-lbl">Accuracy</div>
      </div>
    </div>

    <div class="progress-card">
      <div class="progress-card-title">Overall Progress</div>
      <div class="xp-bar-labels">
        <span style="color:var(--c-accent);font-size:11px;font-weight:600">Lv ${lvl}</span>
        <span style="color:var(--t2);font-size:11px">Lv ${lvl+1}</span>
      </div>
      <div class="xp-bar-track" style="margin-top:4px">
        <div class="xp-bar-fill" style="width:${Math.round(prog*100)}%"></div>
      </div>
      <div class="progress-card-sub">${S.totalXP} total XP · Level ${lvl} ${levelTitle(lvl)}</div>
    </div>

    ${resources.length > 0 ? `
    <div class="resources-list" style="text-align:left">
      <div class="label-sm" style="padding:0 0 10px">Keep Learning</div>
      ${resHTML}
    </div>` : ''}

    <button class="action-btn" style="background:${color}"
            onclick="studyAgain()">🔄 Study Again</button>
    <button class="action-btn secondary" onclick="goHome()">← Back to Home</button>
  </div>`;
}

function studyAgain() {
  S.viewStack = ['home'];
  navigate('setup', {});
}
function goHome() {
  S.viewStack = ['home'];
  switchTab('home');
}

// ============================================================
// LEADERBOARD VIEW
// ============================================================

function renderLeaderboard() {
  const entries = buildLeaderboard();
  const userIdx = entries.findIndex(e => e.isMe);
  const userRank = userIdx + 1;

  const podium = entries.slice(0,3);
  const medalH = [110, 80, 60];
  const medalC = [
    'linear-gradient(180deg,#FFD700,#B8860B)',
    'linear-gradient(180deg,#C0C0C0,#808080)',
    'linear-gradient(180deg,#CD7F32,#8B4513)',
  ];
  const medals = ['🥇','🥈','🥉'];
  // Display order: 2nd, 1st, 3rd
  const podiumOrder = [1,0,2];

  const podiumHTML = podiumOrder.map(i => {
    const e = podium[i];
    if (!e) return '<div class="podium-block"></div>';
    return `
    <div class="podium-block">
      <div class="podium-emoji">${e.emoji}</div>
      <div class="podium-name">${e.name}</div>
      <div class="podium-xp">${e.xp} XP</div>
      <div class="podium-bar" style="height:${medalH[i]}px;background:${medalC[i]}">
        ${medals[i]}
      </div>
    </div>`;
  }).join('');

  const listHTML = entries.map((e,i) => `
    <div class="lb-row ${e.isMe?'me':''}">
      <div class="lb-rank-badge">${i<3 ? medals[i] : '#'+(i+1)}</div>
      <div class="lb-avatar">${e.emoji}</div>
      <div class="lb-info">
        <div class="lb-name">
          ${e.name}
          ${e.isMe ? '<span class="me-tag">YOU</span>' : ''}
        </div>
        <div class="lb-sublabel">
          Lv ${levelFor(e.xp)} · ${levelTitle(levelFor(e.xp))}
          ${e.streak > 0 ? `<span class="lb-streak">🔥${e.streak}d</span>` : ''}
        </div>
      </div>
      <div class="lb-xp">${e.xp} XP</div>
    </div>`).join('');

  return `<div class="view">
    <div class="page-title">Leaderboard 🏆</div>

    <div class="lb-rank-banner">
      <div class="lb-rank-left">
        <div class="lb-rank-emoji">⭐</div>
        <div>
          <div class="lb-rank-label">Your Rank</div>
          <div class="lb-rank-val">#${userRank} of ${entries.length}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div class="lb-xp-label">Total XP</div>
        <div class="lb-xp-val">${S.totalXP} XP</div>
      </div>
    </div>

    <div class="podium">${podiumHTML}</div>
    <div class="lb-list">${listHTML}</div>
  </div>`;
}

function buildLeaderboard() {
  if (typeof Auth !== 'undefined') {
    return Auth.leaderboardEntries().sort((a,b) => b.xp - a.xp);
  }
  // Fallback if auth not loaded
  return [{ name: S.userName||'You', xp: S.totalXP, streak: S.streakDays, emoji: '⭐', isMe: true }];
}

// ============================================================
// RESOURCES VIEW
// ============================================================

function renderResources() {
  const filterSubjects = ['all', ...Object.keys(SUBJECTS)];
  const filterHTML = filterSubjects.map(f => {
    const label = f === 'all' ? '🌟 All' : subEmoji(f)+' '+subShort(f);
    const color = f === 'all' ? '#5856D6' : subColor(f);
    const active = S.resFilter === f;
    return `<button class="filter-chip ${active?'active':''}"
               style="${active?'background:'+color+';border-color:'+color:''}"
               onclick="setResFilter('${f}')">${label}</button>`;
  }).join('');

  const filtered = S.resFilter === 'all' ? RESOURCES : RESOURCES.filter(r=>r.subject===S.resFilter);
  const featured = filtered.filter(r=>r.featured);
  const others   = filtered.filter(r=>!r.featured);

  const featHTML = featured.map(r => `
    <a class="featured-card" href="${r.url}" target="_blank" rel="noopener">
      <div class="featured-card-top">
        <span class="featured-card-icon">${r.icon}</span>
        <span class="featured-card-arrow">↗</span>
      </div>
      <div class="featured-card-title">${r.title}</div>
      <div class="featured-card-desc">${r.desc}</div>
      <span class="featured-subject-tag" style="background:${subColor(r.subject)}18;color:${subColor(r.subject)}">${subShort(r.subject)}</span>
    </a>`).join('');

  const otherHTML = others.map(r => `
    <a class="resource-row" href="${r.url}" target="_blank" rel="noopener">
      <div class="resource-icon-wrap" style="background:${subColor(r.subject)}18">${r.icon}</div>
      <div class="resource-info">
        <div class="resource-name">${r.title}</div>
        <div class="resource-desc">${r.desc}</div>
      </div>
      <div class="resource-arrow">↗</div>
    </a>`).join('');

  return `<div class="view">
    <div class="page-title">Resources 🔗</div>
    <div class="filter-bar">${filterHTML}</div>

    ${featured.length > 0 ? `
    <div class="section-header"><div class="section-title" style="padding:0">⭐ Featured</div></div>
    <div class="featured-scroll">${featHTML}</div>` : ''}

    ${others.length > 0 ? `
    <div class="section-header"><div class="section-title" style="padding:0">All Resources</div></div>
    <div class="resources-list-section">${otherHTML}</div>` : ''}
  </div>`;
}

function setResFilter(f) {
  S.resFilter = f;
  renderView('resources', {});
}

// ============================================================
// PROFILE VIEW
// ============================================================

function renderProfile() {
  const lvl = levelFor(S.totalXP);
  const totalSessions = S.totalSessions;
  const lb = buildLeaderboard();
  const rank = lb.findIndex(e=>e.isMe)+1;

  const subjectRows = Object.entries(SUBJECTS).map(([key,sub]) => {
    const subSessions = S.sessions.filter(s=>s.subjects.includes(key));
    const subXP = subSessions.reduce((t,s)=>t+s.xpEarned,0);
    return `
    <div class="subject-row">
      <div class="subject-row-icon" style="background:${sub.color}18">${sub.emoji}</div>
      <div class="subject-row-info">
        <div class="subject-row-name">${sub.short}</div>
        <div class="subject-row-sessions">${subSessions.length} sessions</div>
      </div>
      <div class="subject-row-xp">${subXP} XP</div>
    </div>`;
  }).join('');

  const achHTML = ACHIEVEMENTS.map(a => {
    const unlocked = S.unlockedAchs.includes(a.id);
    return `
    <div class="ach-row ${unlocked?'unlocked':''}">
      <div class="ach-row-icon">${a.icon}</div>
      <div>
        <div class="ach-row-title">${a.title}</div>
        <div class="ach-row-desc">${a.desc}</div>
      </div>
      ${unlocked ? '<div class="ach-check">✅</div>' : ''}
    </div>`;
  }).join('');

  const authUser     = typeof Auth !== 'undefined' ? Auth.user() : null;
  const displayName  = authUser ? authUser.name  : (S.userName || 'You');
  const displayEmoji = authUser ? authUser.emoji : '⭐';

  return `<div class="view">
    <div class="page-title">Profile 👤</div>

    <div class="profile-avatar-section">
      <div class="avatar-circle">${displayEmoji}</div>
      <div style="flex:1">
        <div class="profile-display-name">${displayName}</div>
        <div class="profile-lvl">Level ${lvl} · ${levelTitle(lvl)}</div>
      </div>
    </div>

    ${typeof renderWeeklyGraph === 'function' ? renderWeeklyGraph(S.sessions) : ''}
    ${typeof renderWeeklyReport === 'function' ? renderWeeklyReport(S.sessions) : ''}

    <div class="mini-stats">
      <div class="mini-stat">
        <div class="mini-stat-icon" style="color:var(--yellow)">⭐</div>
        <div>
          <div class="mini-stat-val">${S.totalXP} XP</div>
          <div class="mini-stat-lbl">Total XP</div>
        </div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-icon" style="color:var(--orange)">🔥</div>
        <div>
          <div class="mini-stat-val">${S.streakDays}d</div>
          <div class="mini-stat-lbl">Streak</div>
        </div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-icon" style="color:var(--green)">✅</div>
        <div>
          <div class="mini-stat-val">${totalSessions}</div>
          <div class="mini-stat-lbl">Sessions</div>
        </div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-icon" style="color:var(--c-accent)">🏆</div>
        <div>
          <div class="mini-stat-val">#${rank}</div>
          <div class="mini-stat-lbl">Rank</div>
        </div>
      </div>
    </div>

    <div class="subject-breakdown">
      <div class="label-sm" style="padding:8px 0">XP by Subject</div>
      ${subjectRows}
    </div>

    <div style="padding:12px 16px 0">
      <div class="label-sm" style="padding:0 0 10px">Achievements (${S.unlockedAchs.length}/${ACHIEVEMENTS.length})</div>
    </div>
    <div class="achievements-grid">${achHTML}</div>

    <div style="padding:8px 16px 4px">
      <div class="xp-bar-labels">
        <span style="color:var(--c-accent);font-size:11px;font-weight:600">Lv ${lvl}</span>
        <span style="color:var(--t2);font-size:11px">${S.totalXP} / ${(lvl+1)*100} XP</span>
      </div>
      <div class="xp-bar-track" style="margin-top:4px">
        <div class="xp-bar-fill" style="width:${Math.round(xpProgress(S.totalXP)*100)}%"></div>
      </div>
    </div>

    ${typeof Auth !== 'undefined' ? `
    <button class="logout-btn" onclick="Auth.logout()">Sign Out</button>` : ''}
    <button class="reset-btn" onclick="confirmReset()">🗑 Reset All Progress</button>
  </div>`;
}

function setupProfileInput() {
  // Name editing removed — identity managed by auth
}

function confirmReset() {
  if (confirm('Reset all XP, sessions, and streaks? This cannot be undone.')) {
    S.totalXP = 0; S.streakDays = 0; S.totalSessions = 0;
    S.lastStudyDate = null; S.sessions = []; S.unlockedAchs = [];
    save();
    switchTab('home');
  }
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

function checkAchievements() {
  const subjStudied = new Set(S.sessions.flatMap(s=>s.subjects));
  const perfSessions = S.sessions.filter(s=>s.answered>0 && s.correct===s.answered);

  ACHIEVEMENTS.forEach(a => {
    if (S.unlockedAchs.includes(a.id)) return;
    let unlock = false;
    switch(a.id) {
      case 'first':  unlock = S.totalSessions >= 1; break;
      case 'fire3':  unlock = S.streakDays >= 3; break;
      case 'week':   unlock = S.streakDays >= 7; break;
      case 'xp100':  unlock = S.totalXP >= 100; break;
      case 'xp500':  unlock = S.totalXP >= 500; break;
      case 'poly':   unlock = subjStudied.size >= 5; break;
      case 'ten':    unlock = S.totalSessions >= 10; break;
      case 'deep':   unlock = S.sessions.some(s=>s.duration>=10); break;
      case 'palg':   unlock = perfSessions.some(s=>s.subjects.includes('algebra2')); break;
      case 'pbio':   unlock = perfSessions.some(s=>s.subjects.includes('biology')); break;
      case 'peng':   unlock = perfSessions.some(s=>s.subjects.includes('english')); break;
      case 'pcsp':   unlock = perfSessions.some(s=>s.subjects.includes('apCSP')); break;
      case 'pesp':   unlock = perfSessions.some(s=>s.subjects.includes('spanish2')); break;
      case 'speed':  unlock = S.sesSpeedStreak >= 5; break;
    }
    if (unlock) S.unlockedAchs.push(a.id);
  });
}

// ============================================================
// LEVEL UP OVERLAY
// ============================================================

function showLevelUp(lvl) {
  const overlay = document.getElementById('level-up-overlay');
  if (!overlay) return;
  document.getElementById('lu-level').textContent = `Level ${lvl}`;
  document.getElementById('lu-title').textContent = levelTitle(lvl);
  overlay.classList.remove('hidden');
}
function dismissLevelUp() {
  document.getElementById('level-up-overlay')?.classList.add('hidden');
}

// ============================================================
// INIT
// ============================================================

/* initApp — called by bootApp() in auth.js after login confirmed */
function initApp() {
  load();

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }

  // Tab bar clicks
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Initial view
  switchTab('home');
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof bootApp === 'function') {
    bootApp();
  } else {
    initApp(); // fallback if auth.js not loaded
  }
});
