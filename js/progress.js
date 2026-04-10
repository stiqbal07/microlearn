/* progress.js — Weekly graph, weekly report, seeded daily rotation
   ──────────────────────────────────────────────────────────────── */

'use strict';

// ── Seeded RNG (mulberry32) for daily question rotation ──────────

function getDaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function mulberry32(seed) {
  return function() {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const rng = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Week data helper ────────────────────────────────────────────

function getWeekData(sessions) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d     = new Date(Date.now() - i * 86400000);
    const key   = d.toDateString();
    const label = i === 0 ? 'Today'
                : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    const daySessions = sessions.filter(s => new Date(s.date).toDateString() === key);
    const xp       = daySessions.reduce((t,s) => t + (s.xpEarned    || 0), 0);
    const mins     = daySessions.reduce((t,s) => t + (s.actualMinutes || s.duration || 0), 0);
    const answered = daySessions.reduce((t,s) => t + (s.answered     || 0), 0);
    const correct  = daySessions.reduce((t,s) => t + (s.correct      || 0), 0);
    days.push({ label, xp, mins, answered, correct, count: daySessions.length });
  }
  return days;
}

// ── Weekly Graph (SVG bar chart) ────────────────────────────────

function renderWeeklyGraph(sessions) {
  if (!window._graphMode) window._graphMode = 'xp';
  const mode  = window._graphMode;
  const days  = getWeekData(sessions);
  const values = mode === 'xp' ? days.map(d => d.xp) : days.map(d => d.mins);
  const maxVal = Math.max(...values, 1);

  const BAR_W = 28, GAP = 10, H = 90;
  const totalW = 7 * (BAR_W + GAP) - GAP;

  const bars = days.map((d, i) => {
    const val  = values[i];
    const barH = val > 0 ? Math.max(5, Math.round((val / maxVal) * H)) : 0;
    const x    = i * (BAR_W + GAP);
    const y    = H - barH;
    const today = d.label === 'Today';
    const fill = today ? 'var(--c-accent)' : 'var(--c-accent)55';
    const labelFill = today ? 'var(--c-accent)' : 'var(--t3)';
    return `<g>
      <rect x="${x}" y="${y}" width="${BAR_W}" height="${barH}" rx="5" fill="${fill}"/>
      <text x="${x + BAR_W/2}" y="${H + 14}" text-anchor="middle"
            font-size="9" fill="${labelFill}">${d.label}</text>
      ${val > 0 ? `<text x="${x + BAR_W/2}" y="${y - 4}" text-anchor="middle"
            font-size="8" fill="var(--t2)">${val}</text>` : ''}
    </g>`;
  }).join('');

  const activeTab = (window.S && S.activeTab) || 'profile';

  return `
  <div class="graph-card">
    <div class="graph-header">
      <div class="graph-title">This Week</div>
      <div class="graph-toggle">
        <button class="graph-tab ${mode==='xp'  ?'active':''}"
                onclick="window._graphMode='xp';renderView('${activeTab}',{})">XP</button>
        <button class="graph-tab ${mode==='mins'?'active':''}"
                onclick="window._graphMode='mins';renderView('${activeTab}',{})">Mins</button>
      </div>
    </div>
    <svg viewBox="0 0 ${totalW} ${H + 20}" style="width:100%;overflow:visible;display:block">
      ${bars}
    </svg>
  </div>`;
}

// ── Weekly Report card ──────────────────────────────────────────

function renderWeeklyReport(sessions) {
  const cutoff = Date.now() - 7 * 86400000;
  const week   = sessions.filter(s => new Date(s.date).getTime() >= cutoff);

  const totalMins     = week.reduce((t,s) => t + (s.actualMinutes || s.duration || 0), 0);
  const totalXP       = week.reduce((t,s) => t + (s.xpEarned    || 0), 0);
  const totalAnswered = week.reduce((t,s) => t + (s.answered     || 0), 0);
  const totalCorrect  = week.reduce((t,s) => t + (s.correct      || 0), 0);
  const accuracy      = totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0;
  const daysActive    = new Set(week.map(s => new Date(s.date).toDateString())).size;

  // Best subject this week by XP share
  const subXP = {};
  week.forEach(s => {
    s.subjects.forEach(sub => {
      subXP[sub] = (subXP[sub] || 0) + (s.xpEarned || 0) / s.subjects.length;
    });
  });
  const bestEntry = Object.entries(subXP).sort((a,b) => b[1]-a[1])[0];
  const bestName  = bestEntry ? (SUBJECTS[bestEntry[0]]?.short  || bestEntry[0]) : null;
  const bestEmoji = bestEntry ? (SUBJECTS[bestEntry[0]]?.emoji  || '')           : '';

  if (week.length === 0) {
    return `
    <div class="report-card">
      <div class="report-title">Weekly Report</div>
      <div class="report-empty">No sessions this week yet. Start studying!</div>
    </div>`;
  }

  return `
  <div class="report-card">
    <div class="report-title">Weekly Report</div>
    <div class="report-grid">
      <div class="report-stat">
        <div class="report-stat-val">${totalMins}<span class="report-unit">m</span></div>
        <div class="report-stat-lbl">Study Time</div>
      </div>
      <div class="report-stat">
        <div class="report-stat-val">${week.length}</div>
        <div class="report-stat-lbl">Sessions</div>
      </div>
      <div class="report-stat">
        <div class="report-stat-val">${accuracy}<span class="report-unit">%</span></div>
        <div class="report-stat-lbl">Accuracy</div>
      </div>
      <div class="report-stat">
        <div class="report-stat-val">+${totalXP}</div>
        <div class="report-stat-lbl">XP Earned</div>
      </div>
    </div>
    ${bestName ? `
    <div class="report-best">
      <span class="report-best-label">Top Subject</span>
      <span class="report-best-val">${bestEmoji} ${bestName}</span>
    </div>` : ''}
    <div class="report-active">${daysActive} of 7 days active this week</div>
  </div>`;
}
