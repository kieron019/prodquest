import { useState, useEffect, useRef, useCallback } from "react";

const fmt = (s) => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60; return h>0?`${h}:${p(m)}:${p(sc)}`:`${p(m)}:${p(sc)}`; };
const p = (n) => String(n).padStart(2,"0");
const fmtH = (m) => m>=60?`${(m/60).toFixed(1)}h`:`${m}m`;
const wc = (s) => s.trim().split(/\s+/).filter(Boolean).length;

const ME = { name:"Kieron", handle:"@nightowlcoder", avatar:"KD", level:23, xp:4820, xpCap:5000, streak:14, hours:847, shards:340, pro:false, guild:"Silicon Wolves", country:"GB", todayMins:137, rank:3, weekGoal:20, weekHours:14.2, prevRank:5 };
const FRIENDS = [
  { handle:"@zencode",    avatar:"ZC", status:"live",    mins:94,  cat:"Coding",    streak:21 },
  { handle:"@focusqueen", avatar:"FQ", status:"live",    mins:180, cat:"Deep Work", streak:45 },
  { handle:"@dawnwarrior",avatar:"DW", status:"away",    mins:0,   cat:null,        streak:8  },
  { handle:"@bytesmith",  avatar:"BS", status:"offline", mins:0,   cat:null,        streak:3  },
];
const LEADERBOARD = [
  { rank:1, handle:"@zencode",       avatar:"ZC", hours:12.4, level:31, guild:"Data Monks",    verified:true  },
  { rank:2, handle:"@focusqueen",    avatar:"FQ", hours:11.8, level:28, guild:"Silicon Wolves", verified:true  },
  { rank:3, handle:"@nightowlcoder", avatar:"KD", hours:10.2, level:23, guild:"Silicon Wolves", verified:true, me:true },
  { rank:4, handle:"@dawnwarrior",   avatar:"DW", hours:9.7,  level:25, guild:"Study Syndicate",verified:true  },
  { rank:5, handle:"@bytesmith",     avatar:"BS", hours:9.1,  level:19, guild:"Data Monks",    verified:true  },
  { rank:6, handle:"@mindforge",     avatar:"MF", hours:8.6,  level:22, guild:"Solo",          verified:true  },
  { rank:7, handle:"@quickgrind",    avatar:"QG", hours:8.0,  level:10, guild:"Solo",          verified:false },
  { rank:8, handle:"@deepdiver",     avatar:"DD", hours:7.3,  level:20, guild:"Study Syndicate",verified:true  },
];
const EVENTS = [
  { id:"e1", type:"sprint",      name:"48-Hour Sprint",     desc:"Log the most verified hours in 48 hours.", prize:"500 Shards + Crown Badge", participants:847, timeLeft:"31h 14m", status:"live",     joined:true,  myRank:3, myHours:10.2, leaderHours:12.4, color:"#e05252" },
  { id:"e2", type:"elimination", name:"Weekly Elimination", desc:"Bottom 20% eliminated each day. Survive 7.", prize:"750 Shards + Survivor Badge", participants:312, timeLeft:"3d 8h", status:"live", joined:false, color:"#d97706" },
  { id:"e3", type:"blitz",       name:"Sunday Blitz",       desc:"6-hour window. Most focused hours wins.", prize:"300 Shards", participants:0, timeLeft:"Starts in 2d", status:"upcoming", joined:false, color:"#7c3aed" },
  { id:"e4", type:"bounty",      name:"Bounty: Deep Work",  desc:"First to log 10h verified Deep Work.", prize:"1,000 Shards", participants:156, timeLeft:"4d left", status:"live", joined:false, progress:72, color:"#059669" },
  { id:"e5", type:"war",         name:"Guild Wars: March",  desc:"Silicon Wolves vs Data Monks.", prize:"Guild banner + 200 Shards each", participants:0, timeLeft:"6d left", status:"live", joined:true, myGuildHours:73.2, enemyGuildHours:68.4, myGuild:"Silicon Wolves", enemyGuild:"Data Monks", color:"#0891b2" },
];
const ACTIVE_DUELS = [{ id:"d1", opponent:"@focusqueen", oppAvatar:"FQ", type:"24h", myMins:137, oppMins:180, endsIn:"6h 42m", stake:"200 Shards", status:"losing" }];
const DUEL_HISTORY = [
  { opponent:"@dawnwarrior", result:"won",  myH:8.2, oppH:6.1, date:"2 days ago", earned:150 },
  { opponent:"@bytesmith",   result:"lost", myH:5.4, oppH:7.2, date:"4 days ago", earned:0   },
  { opponent:"@zencode",     result:"won",  myH:9.1, oppH:8.8, date:"1 week ago", earned:200 },
];
const SESSIONS = [
  { id:1, cat:"Coding",    dur:92,  desc:"Auth module — JWT refresh + session mgmt. Completed token rotation logic and added refresh queue to prevent race conditions.", ps:2, ok:true,  score:92,  aiSummary:"Shipped auth module. High proof score." },
  { id:2, cat:"Deep Work", dur:45,  desc:"NIPS 2024 paper review + notes.",                                                                                            ps:1, ok:true,  score:34,  aiSummary:"Paper review. Light description." },
  { id:3, cat:"Coding",    dur:180, desc:"Dashboard feature — charts, filters, scroll. All tests pass.",                                                               ps:3, ok:true,  score:207, aiSummary:"Major dashboard feature. Elite proof." },
];
const CATS = ["Deep Work","Coding","Study","Writing","Exercise","Research","Design","Planning","Reading","Language"];
const SHARD_PACKS = [
  { shards:100,  price:"£0.99",  bonus:null,       tag:null },
  { shards:500,  price:"£3.99",  bonus:"+50 free",  tag:"Popular" },
  { shards:1200, price:"£7.99",  bonus:"+200 free", tag:"Best Value" },
  { shards:3000, price:"£17.99", bonus:"+600 free", tag:null },
];
const BATTLE_PASS_TIERS = [
  { tier:1, reward:"100 Shards",   done:true  },
  { tier:2, reward:"Steel avatar", done:true  },
  { tier:3, reward:"200 Shards",   done:true  },
  { tier:4, reward:"Name glow",    done:false },
  { tier:5, reward:"500 Shards",   done:false },
  { tier:6, reward:"Excl. badge",  done:false },
  { tier:7, reward:"Guild banner", done:false },
  { tier:8, reward:"1,000 Shards", done:false },
];
const WEEKLY_DATA = [{day:"M",h:3.2},{day:"T",h:5.1},{day:"W",h:4.8},{day:"T",h:6.2},{day:"F",h:7.1},{day:"S",h:2.4},{day:"S",h:1.8}];
const EVENT_TYPE_META = {
  sprint:      { label:"Sprint",     emoji:"⚡" },
  elimination: { label:"Elimination",emoji:"☠"  },
  blitz:       { label:"Blitz",      emoji:"◈"  },
  bounty:      { label:"Bounty",     emoji:"◎"  },
  war:         { label:"Guild War",  emoji:"⚔"  },
};
const PARTNER = { handle:"@zencode", avatar:"ZC", weekGoal:25, weekHours:18.4, streak:21, status:"live", sharedGoal:"Ship 3 features this week" };
const WEEKLY_REPORT = {
  weekOf:"24 Feb – 2 Mar", totalH:32.4, goalH:35, goalMet:false, focusScore:78, prevScore:71,
  topCat:"Coding", topCatH:14.6, peakDay:"Thursday", peakH:7.1,
  insights:[
    { type:"pattern", text:"Thursday sessions average 2.1× longer than Monday. Front-load harder work to Thursday." },
    { type:"risk",    text:"No Saturday logs in 3 weeks. One 30-min session protects your streak." },
    { type:"win",     text:"Coding proof scores up 40% week-on-week. Detailed descriptions are ranking you higher." },
  ],
  nextWeekSuggestion:"Target 35h with at least one session every day. Schedule Deep Work before 10am on Tuesday — that's when your focus score peaks."
};
const POW_PROFILE = {
  totalVerifiedH:847, since:"Sep 2024",
  categories:[
    { name:"Coding",    h:382, verified:true  },
    { name:"Deep Work", h:211, verified:true  },
    { name:"Study",     h:152, verified:true  },
    { name:"Writing",   h:102, verified:false },
  ],
  monthlyAvg:68.4, longestStreak:21, certLevel:"Gold",
  shareUrl:"prodquest.app/u/nightowlcoder",
};

// Smart context messages — read the situation
const getContextMsg = (me, running, secs, sessions) => {
  if (running) return { msg:`Session running — ${fmt(secs)}`, urgency:"live", cta:"timer" };
  if (me.streak > 0 && me.todayMins === 0) return { msg:"Streak at risk — you haven't logged today.", urgency:"warn", cta:"timer" };
  if (ACTIVE_DUELS[0]?.status === "losing") return { msg:`1.6h behind @focusqueen — duel ends in ${ACTIVE_DUELS[0].endsIn}.`, urgency:"warn", cta:"duels" };
  if (me.rank < me.prevRank) return { msg:`You climbed ${me.prevRank - me.rank} ranks this week. Keep pushing.`, urgency:"good", cta:null };
  return { msg:`${me.weekGoal - me.weekHours}h to hit your weekly goal. ${Math.ceil((me.weekGoal - me.weekHours) / 2)} sessions away.`, urgency:"neutral", cta:"timer" };
};

const psCalc  = (d,t,u) => { if(t==="video")return 3; if(u&&wc(d)>=80)return 3; if(u)return 2; if(t==="link"||wc(d)>=20)return 1; return 0; };
const psMult  = (s) => [0.5,0.75,1.0,1.15][s]??1;
const psLabel = (s) => ["No proof","Link / text","Screenshot","Elite proof"][s]??"";
const psColor = (s) => ["var(--red)","var(--amber)","var(--matrix)","var(--matrix)"][s]??"";

const CAT_COLORS = { Coding:"#22c55e", "Deep Work":"#60a5fa", Study:"#a78bfa", Writing:"#f59e0b", Exercise:"#f87171", Research:"#34d399", Design:"#fb923c", Planning:"#94a3b8", Reading:"#e879f9", Language:"#fbbf24" };

const BOTTOM_NAV = [
  { id:"dashboard",   label:"Home",   icon:"◈" },
  { id:"timer",       label:"Timer",  icon:"◉" },
  { id:"events",      label:"Events", icon:"◆" },
  { id:"leaderboard", label:"Ranks",  icon:"▲" },
  { id:"menu",        label:"More",   icon:"≡" },
];
const NAV_ARENA    = ["dashboard","timer","events","duels","leaderboard"];
const NAV_PERSONAL = ["insights","accountability","profile","shop"];
const NAV_META = {
  dashboard:      { label:"Dashboard",     icon:"◈", sub:"Overview & today" },
  timer:          { label:"Timer",         icon:"◉", sub:"Track focus sessions" },
  events:         { label:"Events",        icon:"◆", sub:"Compete & win prizes" },
  duels:          { label:"1v1 Duels",     icon:"⚔", sub:"Head-to-head battles" },
  leaderboard:    { label:"Leaderboard",   icon:"▲", sub:"Global & guild ranks" },
  insights:       { label:"Insights",      icon:"◎", sub:"AI weekly report" },
  accountability: { label:"Accountability",icon:"◇", sub:"Partner & commitments" },
  profile:        { label:"Profile",       icon:"○", sub:"Stats & proof of work" },
  shop:           { label:"Pro & Shop",    icon:"◈", sub:"Upgrade & cosmetics" },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root {
  --bg:      #181612;
  --bg-solid:#181612;
  --surface: #1f1d19;
  --raised:  #28251f;
  --high:    #33302a;
  --border:  rgba(155,140,118,0.18);
  --border2: rgba(155,140,118,0.35);

  --ink:  #ede8df;
  --ink2: #bdb4a8;
  --ink3: #8a8278;
  --ink4: #5c5650;

  --amber:  #f59e0b;
  --red:    #e05252;
  --blue:   #60a5fa;
  --purple: #a78bfa;

  /* ── THE MATRIX ACCENT ──
     Used ONLY for: live timer, verified states, active sessions, computed data.
     Never for decoration. Always means "something real is happening." */
  --matrix:     #00e676;
  --matrix-dim: rgba(0,230,118,0.08);
  --matrix-glow:rgba(0,230,118,0.18);
  --matrix-mid: rgba(0,230,118,0.45);

  --serif:'DM Serif Display',Georgia,serif;
  --mono: 'DM Mono','Courier New',monospace;
  --sans: 'Instrument Sans',system-ui,sans-serif;

  --r:4px; --r2:8px; --r3:12px; --r4:18px;
}

html,body{
  height:100%;
  background:#181612;
  color:var(--ink);
  overflow-x:hidden;
}
body {
  background: #141210;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,230,118,0.04) 0%, transparent 60%),
    linear-gradient(180deg, #141210 0%, #111009 100%);
  background-attachment: fixed;
}

#pq{font-family:var(--sans);min-height:100vh;position:relative}

/* ── AMBIENT DOT GRID ── */
#pq::before {
  content:'';
  position:fixed;
  inset:0;
  background-image: radial-gradient(circle, rgba(155,140,118,0.08) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events:none;
  z-index:0;
}

::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--high)}

.shell{display:flex;min-height:100vh;position:relative;z-index:1}

/* ── SIDEBAR ── */
.sidebar{
  width:184px;flex-shrink:0;
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  position:sticky;top:0;height:100vh;
  background:rgba(20,18,15,0.95);
  backdrop-filter:blur(12px);
}
.logo-area{padding:20px 17px 14px;border-bottom:1px solid var(--border)}
.logotype{font-family:var(--serif);font-size:19px;color:var(--ink);letter-spacing:-.5px;line-height:1}
.logotype span{color:var(--amber)}
.tagline{font-family:var(--mono);font-size:8px;color:var(--ink4);letter-spacing:2px;text-transform:uppercase;margin-top:3px}
.nav-sect{padding:10px 9px 2px}
.nav-grp{font-family:var(--mono);font-size:8px;color:var(--ink4);letter-spacing:2px;text-transform:uppercase;padding:0 8px;margin-bottom:2px}
.nav-i{
  display:flex;align-items:center;gap:8px;
  padding:7px 9px;border-radius:var(--r2);
  cursor:pointer;font-size:12px;font-weight:500;
  color:var(--ink3);transition:all .12s;
  border:1px solid transparent;margin-bottom:1px;
  position:relative;user-select:none;
}
.nav-i:hover{color:var(--ink);background:var(--raised)}
.nav-i.on{color:var(--ink);background:var(--raised);border-color:var(--border)}
.nav-i.on::before{content:'';position:absolute;left:0;top:18%;bottom:18%;width:2px;background:var(--amber);border-radius:1px}
.nav-dot{width:5px;height:5px;border-radius:50%;background:var(--matrix);margin-left:auto;animation:glow-pulse 2s ease infinite;box-shadow:0 0 4px var(--matrix)}
.nav-badge{margin-left:auto;background:var(--red);color:#fff;font-size:8px;padding:1px 5px;border-radius:8px;font-family:var(--mono)}
.nav-pro{margin-left:auto;background:var(--amber);color:#141210;font-size:7px;padding:1px 5px;border-radius:3px;font-family:var(--mono);font-weight:700}
.sidebar-user{margin-top:auto;padding:11px;border-top:1px solid var(--border)}
.user-pill{display:flex;align-items:center;gap:9px;padding:6px 8px;border-radius:var(--r2);cursor:pointer;transition:background .12s}
.user-pill:hover{background:var(--raised)}

/* ── MAIN ── */
.main{flex:1;overflow-y:auto;min-width:0}
.page{padding:24px 22px;max-width:900px;padding-bottom:90px}

/* ── SMART HEADER BANNER ── */
.ctx-banner {
  display:flex;align-items:center;gap:12px;
  padding:10px 14px;
  border-radius:var(--r2);
  margin-bottom:20px;
  font-family:var(--mono);font-size:11px;
  border:1px solid;
  transition:all .3s;
}
.ctx-banner.live   { background:var(--matrix-dim); border-color:var(--matrix-mid); color:var(--matrix); }
.ctx-banner.warn   { background:rgba(224,82,82,.06); border-color:rgba(224,82,82,.3); color:var(--red); }
.ctx-banner.good   { background:rgba(96,165,250,.06); border-color:rgba(96,165,250,.25); color:var(--blue); }
.ctx-banner.neutral{ background:rgba(245,158,11,.05); border-color:rgba(245,158,11,.2); color:var(--amber); }
.ctx-dot { width:6px;height:6px;border-radius:50%;flex-shrink:0;background:currentColor;animation:glow-pulse 1.4s ease infinite }

/* ── AVATARS ── */
.avatar{width:32px;height:32px;border-radius:var(--r2);background:var(--raised);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:10px;font-weight:500;color:var(--ink2);flex-shrink:0}
.avatar.lg{width:46px;height:46px;font-size:13px}
.avatar.xl{width:62px;height:62px;font-size:15px;border-radius:var(--r3)}
.avatar.live{border-color:var(--matrix);box-shadow:0 0 8px var(--matrix-glow)}
.u-name{font-size:12px;font-weight:600;color:var(--ink)}
.u-sub{font-family:var(--mono);font-size:9px;color:var(--ink3);margin-top:1px}

/* ── PAGE HEADER ── */
.ph{margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border)}
.pt{font-family:var(--serif);font-size:26px;color:var(--ink);letter-spacing:-.5px;line-height:1.1}
.pt em{font-style:italic;color:var(--ink2)}
.ps-sub{font-size:11px;color:var(--ink3);margin-top:4px;font-family:var(--mono);letter-spacing:.3px}

/* ── CARDS ── */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);padding:16px}
.card-r{background:var(--raised);border:1px solid var(--border);border-radius:var(--r3);padding:16px}
.card-pro{background:var(--surface);border:1px solid rgba(245,158,11,.2);border-radius:var(--r3);padding:16px;position:relative}
.card-pro::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--amber),transparent);border-radius:var(--r3) var(--r3) 0 0}

/* ── VERIFIED card gets matrix glow ── */
.card-verified {
  background:var(--surface);
  border:1px solid var(--matrix-mid);
  border-radius:var(--r3);
  padding:16px;
  position:relative;
  box-shadow:0 0 20px var(--matrix-dim);
}
.card-verified::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--matrix),transparent);border-radius:var(--r3) var(--r3) 0 0}

.clabel{font-family:var(--mono);font-size:9px;color:var(--ink3);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;display:block}

/* ── STAT GRID ── */
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border-radius:var(--r3);overflow:hidden;margin-bottom:18px}
.sb{background:var(--surface);padding:13px 15px;transition:background .15s}
.sb:hover{background:var(--raised)}
.sl{font-family:var(--mono);font-size:8px;color:var(--ink3);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px}
.sv{font-family:var(--serif);font-size:28px;color:var(--ink);line-height:1}
.sv.amber{color:var(--amber)} .sv.green{color:var(--matrix)} .sv.red{color:var(--red)}
.ss{font-size:10px;color:var(--ink3);margin-top:2px}

/* ── BUTTONS ── */
.btn{padding:8px 17px;border-radius:var(--r2);font-weight:600;font-size:12px;cursor:pointer;border:none;font-family:var(--sans);display:inline-flex;align-items:center;gap:6px;transition:all .12s;white-space:nowrap;letter-spacing:.2px}
.btn-primary{background:var(--ink);color:#141210}
.btn-primary:hover{background:var(--ink2)}
.btn-danger{background:var(--red);color:#fff}
.btn-ghost{background:transparent;color:var(--ink2);border:1px solid var(--border)}
.btn-ghost:hover{background:var(--raised);color:var(--ink);border-color:var(--border2)}
.btn-amber{background:var(--amber);color:#141210;font-weight:700}
.btn-amber:hover{filter:brightness(1.1)}
.btn-matrix{background:var(--matrix-dim);color:var(--matrix);border:1px solid var(--matrix-mid);font-family:var(--mono)}
.btn-matrix:hover{background:var(--matrix-glow)}
.btn-sm{padding:6px 12px;font-size:11px}
.btn-xs{padding:4px 9px;font-size:10px;border-radius:var(--r)}
.btn:disabled{opacity:.35;cursor:not-allowed}

/* ── INPUTS ── */
input,textarea,select{width:100%;background:var(--raised);border:1px solid var(--border);border-radius:var(--r2);padding:9px 12px;color:var(--ink);font-family:var(--sans);font-size:13px;outline:none;transition:border-color .14s;resize:none;appearance:none}
input:focus,textarea:focus,select:focus{border-color:var(--border2)}
input::placeholder,textarea::placeholder{color:var(--ink4)}
select option{background:var(--surface)}
.f-label{font-family:var(--mono);font-size:9px;color:var(--ink3);letter-spacing:2px;text-transform:uppercase;display:block;margin-bottom:5px}
.f-row{margin-bottom:12px}
.wc{text-align:right;font-family:var(--mono);font-size:9px;color:var(--ink3);margin-top:2px}
.wc.good{color:var(--matrix)} .wc.ok{color:var(--amber)}

/* ── TAGS ── */
.tags{display:flex;flex-wrap:wrap;gap:5px}
.tag{padding:4px 10px;border-radius:99px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid var(--border);color:var(--ink2);transition:all .12s;background:transparent}
.tag:hover{color:var(--ink);border-color:var(--border2)}
.tag.sel{background:var(--ink);color:#141210;border-color:var(--ink)}

/* ── PROGRESS ── */
.prog{background:var(--high);border-radius:2px;overflow:hidden}
.prog-fill{height:100%;border-radius:2px;transition:width .6s cubic-bezier(.4,0,.2,1)}

/* ── BAR CHART ── */
.bar-chart{display:flex;align-items:flex-end;gap:4px;height:64px}
.bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end}
.bar{width:100%;min-height:2px;border-radius:2px 2px 0 0;background:var(--high);transition:height .4s}
.bar.today{background:var(--amber)}
.bar-lbl{font-family:var(--mono);font-size:8px;color:var(--ink3)}

/* ── SESSION CARDS (replacing boring rows) ── */
.sess-cards{display:flex;flex-direction:column;gap:8px}
.sess-card{
  background:var(--raised);
  border:1px solid var(--border);
  border-radius:var(--r3);
  padding:12px 14px;
  display:grid;
  grid-template-columns:auto 1fr auto;
  gap:12px;
  align-items:start;
  transition:border-color .12s, background .12s;
  position:relative;
  overflow:hidden;
}
.sess-card:hover{border-color:var(--border2);background:var(--high)}
.sess-card.verified{border-left:2px solid var(--matrix)}
.sess-card.flagged{border-left:2px solid var(--red)}
.sess-card-accent{
  width:3px;
  position:absolute;left:0;top:0;bottom:0;
  border-radius:var(--r3) 0 0 var(--r3);
}
.sess-dur-block{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:36px}
.sess-big{font-family:var(--serif);font-size:22px;color:var(--ink);line-height:1}
.sess-unit{font-family:var(--mono);font-size:8px;color:var(--ink3);letter-spacing:1px}
.sess-info{flex:1;min-width:0}
.sess-top{display:flex;align-items:center;gap:7px;margin-bottom:4px;flex-wrap:wrap}
.sess-cat-badge{font-family:var(--mono);font-size:8px;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:3px;font-weight:500}
.sess-desc-text{font-size:12px;color:var(--ink2);line-height:1.5;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sess-ai{font-family:var(--mono);font-size:9px;color:var(--ink3);display:flex;align-items:center;gap:5px}
.sess-ai-dot{width:4px;height:4px;border-radius:50%;background:var(--matrix);flex-shrink:0}
.sess-right{text-align:right;flex-shrink:0}
.sess-score{font-family:var(--serif);font-size:18px;color:var(--ink)}
.sess-score-lbl{font-family:var(--mono);font-size:8px;color:var(--ink3)}
.sess-status{font-family:var(--mono);font-size:8px;margin-top:4px}
.sess-status.ok{color:var(--matrix)} .sess-status.flag{color:var(--red)} .sess-status.pend{color:var(--amber)}

/* ── LEADERBOARD ── */
.lb-row{display:flex;align-items:center;gap:10px;padding:10px 13px;border-bottom:1px solid var(--border);transition:background .12s}
.lb-row:last-child{border-bottom:none}
.lb-row:hover{background:var(--raised)}
.lb-row.me{background:rgba(245,158,11,.04);border-left:2px solid var(--amber)}
.rk{font-family:var(--mono);font-size:12px;width:20px;text-align:right;color:var(--ink3)}
.rk.r1{color:var(--amber);font-weight:700}
.lb-info{flex:1;min-width:0}
.lb-handle{font-size:13px;font-weight:600;color:var(--ink)}
.lb-meta{font-family:var(--mono);font-size:9px;color:var(--ink3);margin-top:1px}
.lb-h{font-family:var(--serif);font-size:19px;color:var(--ink)}
.lb-hl{font-family:var(--mono);font-size:8px;color:var(--ink3)}
.me-chip{font-family:var(--mono);font-size:8px;color:var(--amber);background:rgba(245,158,11,.1);padding:1px 5px;border-radius:3px;margin-left:5px}
.unv-chip{font-family:var(--mono);font-size:8px;color:var(--red);margin-left:5px}

/* ── EVENTS ── */
.ev-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);overflow:hidden;margin-bottom:8px;transition:border-color .12s}
.ev-card:hover{border-color:var(--border2)}
.ev-stripe{height:2px}
.ev-body{padding:13px 15px}
.ev-type{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--ink3);border:1px solid var(--border);border-radius:3px;padding:2px 6px;margin-bottom:6px}
.ev-name{font-family:var(--serif);font-size:17px;color:var(--ink);margin-bottom:3px}
.ev-desc{font-size:11px;color:var(--ink2);line-height:1.5;margin-bottom:8px}
.ev-foot{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:9px;color:var(--ink3);flex-wrap:wrap}
.ev-prize{color:var(--amber)}
.ev-live{width:5px;height:5px;border-radius:50%;background:var(--matrix);display:inline-block;margin-right:3px;animation:glow-pulse 1.5s ease infinite;box-shadow:0 0 4px var(--matrix)}
.joined-pill{margin-left:auto;font-family:var(--mono);font-size:8px;color:var(--matrix);border:1px solid var(--matrix-mid);border-radius:3px;padding:2px 6px}

/* ── DUEL ── */
.duel-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);overflow:hidden;margin-bottom:8px}
.duel-head{padding:10px 13px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.duel-vs{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-bottom:10px}
.duel-side{text-align:center}
.duel-hrs{font-family:var(--serif);font-size:24px;color:var(--ink)}
.duel-hrs.ahead{color:var(--matrix);text-shadow:0 0 12px var(--matrix-glow)}
.duel-hrs.behind{color:var(--red)}
.vs-lbl{font-family:var(--serif);font-size:17px;font-style:italic;color:var(--ink3)}
.duel-bar{height:3px;background:var(--high);border-radius:2px;overflow:hidden;position:relative}
.duel-bar-a{position:absolute;left:0;height:100%;background:var(--matrix);border-radius:2px;box-shadow:0 0 6px var(--matrix-glow)}
.duel-bar-b{position:absolute;right:0;height:100%;background:var(--red);border-radius:2px}

/* ── TIMER ── */
.timer-wrap{display:grid;grid-template-columns:1fr 250px;gap:1px;background:var(--border);border-radius:var(--r3);overflow:hidden;margin-bottom:18px}
.timer-face{background:var(--surface);padding:32px 28px;text-align:center;position:relative;overflow:hidden}

/* Scan-line effect on timer face when running */
.timer-face.running::after {
  content:'';
  position:absolute;inset:0;
  background:repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,230,118,0.015) 2px,
    rgba(0,230,118,0.015) 4px
  );
  pointer-events:none;
  animation:scanlines 8s linear infinite;
}
@keyframes scanlines {
  0%  { background-position:0 0 }
  100%{ background-position:0 200px }
}

.t-state{font-family:var(--mono);font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--ink3);margin-bottom:14px}
.t-state.live{color:var(--matrix);text-shadow:0 0 8px var(--matrix-glow)}
.t-display{font-family:var(--serif);font-size:72px;font-weight:400;color:var(--ink);line-height:1;letter-spacing:-3px;transition:color .3s,text-shadow .3s}
.t-display.running{color:var(--matrix);text-shadow:0 0 30px var(--matrix-glow),0 0 60px rgba(0,230,118,0.1)}
.t-display.paused{color:var(--amber)}
.t-display.stopped{color:var(--ink3)}
.t-sub{font-family:var(--mono);font-size:9px;color:var(--ink3);margin-top:7px;height:13px}
.t-ctrls{display:flex;gap:7px;justify-content:center;margin-top:18px;flex-wrap:wrap}
.t-opts{display:flex;gap:6px;justify-content:center;margin-top:9px}
.ps-track{padding:10px 12px;background:var(--raised);border-radius:var(--r2);border:1px solid var(--border)}
.ps-lbl{font-family:var(--mono);font-size:9px;color:var(--ink3);display:flex;justify-content:space-between;margin-bottom:6px}
.ps-pips{display:flex;gap:4px}
.ps-pip{flex:1;height:2px;border-radius:1px;background:var(--high);transition:background .3s}
.ps-pip.on{background:var(--matrix);box-shadow:0 0 4px var(--matrix-glow)}
.ps-pip.amber-pip{background:var(--amber)}
.timer-panel{background:var(--surface);padding:16px;display:flex;flex-direction:column;gap:12px}
.act-bar{flex:1;height:2px;background:var(--high);border-radius:1px;overflow:hidden}
.act-fill{height:100%;border-radius:1px;transition:width .5s,background .5s}
.acheat-note{padding:8px 11px;background:var(--raised);border-radius:var(--r2);border-left:2px solid var(--matrix-mid);font-family:var(--mono);font-size:8px;color:var(--ink3);line-height:1.7}

/* ── VERIFICATION SEQUENCE ── */
.verify-seq{font-family:var(--mono);font-size:10px;color:var(--matrix);line-height:1.8;padding:10px 12px;background:var(--matrix-dim);border:1px solid var(--matrix-mid);border-radius:var(--r2)}
.verify-seq span{opacity:0;animation:type-in .2s ease forwards}

/* ── MODAL ── */
.overlay{position:fixed;inset:0;background:rgba(14,12,9,.9);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(6px);animation:fo .16s ease}
@keyframes fo{from{opacity:0}to{opacity:1}}
.modal{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r4);padding:24px;max-width:430px;width:94%;max-height:90vh;overflow-y:auto;animation:su .18s ease}
@keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
.m-title{font-family:var(--serif);font-size:21px;color:var(--ink);margin-bottom:4px}
.m-sub{font-size:12px;color:var(--ink2);margin-bottom:16px;line-height:1.6}

/* ── TOASTS ── */
.toasts{position:fixed;bottom:74px;right:14px;z-index:2000;display:flex;flex-direction:column;gap:5px;align-items:flex-end}
.toast{background:var(--raised);border:1px solid var(--border2);border-radius:var(--r2);padding:8px 13px;font-size:11px;display:flex;align-items:center;gap:7px;max-width:250px;animation:sir .18s ease;box-shadow:0 4px 20px rgba(0,0,0,.5)}
@keyframes sir{from{transform:translateX(38px);opacity:0}to{transform:translateX(0);opacity:1}}

/* ── FLOAT TIMER ── */
.float-t{position:fixed;bottom:68px;left:50%;transform:translateX(-50%);background:rgba(20,18,15,.95);border:1px solid var(--matrix-mid);border-radius:99px;padding:7px 17px;display:flex;align-items:center;gap:10px;z-index:500;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.5),0 0 16px var(--matrix-dim);animation:su .18s ease;backdrop-filter:blur(8px)}
.ft-dot{width:5px;height:5px;border-radius:50%;background:var(--matrix);animation:glow-pulse 1s ease infinite;flex-shrink:0;box-shadow:0 0 6px var(--matrix)}
.ft-time{font-family:var(--serif);font-size:19px;color:var(--matrix);text-shadow:0 0 12px var(--matrix-glow)}
.ft-cat{font-family:var(--mono);font-size:9px;color:var(--ink3)}

/* ── UPLOAD ── */
.upload-zone{border:1px solid var(--border);border-radius:var(--r2);padding:12px;text-align:center;cursor:pointer;transition:all .14s;font-family:var(--mono);font-size:10px;color:var(--ink3);letter-spacing:1px}
.upload-zone:hover{border-color:var(--border2);color:var(--ink2)}
.upload-zone.filled{border-color:var(--matrix-mid);color:var(--matrix);background:var(--matrix-dim)}
.challenge-word{font-family:var(--serif);font-size:34px;font-style:italic;color:var(--matrix);text-align:center;padding:15px;border:1px solid var(--matrix-mid);border-radius:var(--r2);margin:12px 0;background:var(--matrix-dim);text-shadow:0 0 20px var(--matrix-glow)}

/* ── DUEL MODAL ── */
.duel-tc{padding:10px 12px;border:1px solid var(--border);border-radius:var(--r2);cursor:pointer;transition:all .12s}
.duel-tc:hover{border-color:var(--border2);background:var(--raised)}
.duel-tc.sel{border-color:var(--ink);background:var(--raised)}
.fp-row{display:flex;align-items:center;gap:10px;padding:8px;border:1px solid var(--border);border-radius:var(--r2);cursor:pointer;margin-bottom:5px;transition:all .12s}
.fp-row:hover{background:var(--raised)}
.fp-row.sel{border-color:var(--ink);background:var(--raised)}

/* ── PRICING ── */
.pricing-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);border-radius:var(--r3);overflow:hidden;margin-bottom:16px}
.pc{background:var(--surface);padding:20px;position:relative}
.pc.pro-card{background:var(--raised)}
.pc-name{font-family:var(--serif);font-size:19px;color:var(--ink);margin-bottom:3px}
.pc-price{font-family:var(--mono);font-size:22px;color:var(--ink);font-weight:500}
.pc-price span{font-size:11px;color:var(--ink3);font-weight:400}
.pf-row{display:flex;align-items:flex-start;gap:7px;padding:5px 0;border-bottom:1px solid var(--border);font-size:11px;color:var(--ink2)}
.pf-row:last-of-type{border-bottom:none}
.pf-check{color:var(--matrix);flex-shrink:0;font-size:10px;margin-top:1px}
.pf-cross{color:var(--ink4);flex-shrink:0;font-size:10px;margin-top:1px}
.pro-tag{position:absolute;top:13px;right:13px;background:var(--amber);color:#141210;font-family:var(--mono);font-size:8px;letter-spacing:1.5px;padding:2px 7px;border-radius:3px;font-weight:700}

/* ── SHARDS ── */
.shard-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:16px}
.shard-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);padding:13px;text-align:center;cursor:pointer;transition:border-color .12s;position:relative}
.shard-card:hover{border-color:var(--border2)}
.shard-card.pop{border-color:rgba(245,158,11,.45)}
.shard-amt{font-family:var(--serif);font-size:24px;color:var(--ink)}
.shard-bonus{font-family:var(--mono);font-size:9px;color:var(--matrix);margin:2px 0}
.shard-price{font-family:var(--mono);font-size:11px;color:var(--amber);margin-top:6px}
.shard-tag{position:absolute;top:-7px;left:50%;transform:translateX(-50%);background:var(--amber);color:#141210;font-family:var(--mono);font-size:7px;padding:2px 6px;border-radius:3px;white-space:nowrap;font-weight:700}

/* ── BP ── */
.bp-track{display:flex;overflow-x:auto;padding-bottom:4px;margin:10px 0}
.bp-tier{flex-shrink:0;width:70px;display:flex;flex-direction:column;align-items:center;gap:4px;position:relative}
.bp-tier-n{font-family:var(--mono);font-size:8px;color:var(--ink3)}
.bp-gem{width:26px;height:26px;border-radius:var(--r);border:1px solid var(--border);background:var(--raised);display:flex;align-items:center;justify-content:center;font-size:10px;position:relative}
.bp-gem.done{background:var(--amber);border-color:var(--amber);color:#141210}
.bp-gem::after{content:'';position:absolute;top:50%;left:100%;width:44px;height:1px;background:var(--high);transform:translateY(-50%)}
.bp-tier:last-child .bp-gem::after{display:none}
.bp-reward{font-size:8px;color:var(--ink3);text-align:center;line-height:1.3;max-width:66px}

/* ── WAR BAR ── */
.war-wrap{position:relative;height:5px;background:var(--high);border-radius:3px;overflow:hidden;margin:6px 0}
.war-a{position:absolute;left:0;height:100%;background:var(--matrix);border-radius:3px;box-shadow:0 0 6px var(--matrix-glow)}
.war-b{position:absolute;right:0;height:100%;background:var(--red);border-radius:3px}

/* ── INSIGHT ROW ── */
.insight-row{display:flex;gap:11px;padding:12px 0;border-bottom:1px solid var(--border)}
.insight-row:last-child{border-bottom:none}
.insight-icon{width:28px;height:28px;border-radius:var(--r2);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;margin-top:1px}
.insight-icon.pattern{background:rgba(96,165,250,.1);color:var(--blue)}
.insight-icon.risk{background:rgba(224,82,82,.1);color:var(--red)}
.insight-icon.win{background:var(--matrix-dim);color:var(--matrix)}

/* ── POW ── */
.pow-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:99px;font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:1px;text-transform:uppercase}
.pow-badge.gold{background:rgba(245,158,11,.12);color:var(--amber);border:1px solid rgba(245,158,11,.28)}
.pow-share-box{background:var(--raised);border:1px solid var(--border2);border-radius:var(--r2);padding:10px 14px;display:flex;align-items:center;gap:10px;margin-top:12px}
.pow-url{font-family:var(--mono);font-size:10px;color:var(--ink3);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ── ACCOUNTABILITY ── */
.partner-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);overflow:hidden}
.partner-head{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px}
.partner-body{padding:14px 16px}
.commit-row{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)}
.commit-row:last-child{border-bottom:none}
.commit-check{width:18px;height:18px;border-radius:4px;border:1px solid var(--border2);background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:all .12s;margin-top:1px;font-size:10px}
.commit-check.done{background:var(--matrix);border-color:var(--matrix);color:#141210;box-shadow:0 0 8px var(--matrix-glow)}

/* ── BOTTOM NAV ── */
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:900;height:60px;background:rgba(20,18,15,.95);border-top:1px solid var(--border);backdrop-filter:blur(12px);padding-bottom:env(safe-area-inset-bottom)}
.bottom-nav-inner{display:flex;height:60px}
.bn-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;transition:color .12s;color:var(--ink3);position:relative;-webkit-tap-highlight-color:transparent}
.bn-item.on{color:var(--amber)}
.bn-item.on::after{content:'';position:absolute;bottom:0;left:25%;right:25%;height:2px;background:var(--amber);border-radius:1px}
.bn-icon{font-size:17px;line-height:1}
.bn-label{font-family:var(--mono);font-size:8px;letter-spacing:.5px;text-transform:uppercase}
.bn-badge{position:absolute;top:8px;right:calc(50% - 18px);width:14px;height:14px;border-radius:50%;background:var(--matrix);color:#141210;font-family:var(--mono);font-size:7px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 6px var(--matrix-glow)}

/* ── MENU PAGE ── */
.menu-page{padding:0;max-width:none}
.menu-hero{padding:28px 22px 22px;border-bottom:1px solid var(--border);position:relative;overflow:hidden}
.menu-hero::after{content:'';position:absolute;top:-80px;right:-80px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(245,158,11,.05) 0%,transparent 70%);pointer-events:none}
.menu-greeting{font-family:var(--serif);font-size:36px;color:var(--ink);letter-spacing:-1px;line-height:1.05}
.menu-greeting em{font-style:italic;color:var(--ink2)}
.menu-date{font-family:var(--mono);font-size:9px;color:var(--ink3);letter-spacing:2px;text-transform:uppercase;margin-top:5px}
.menu-qstats{display:flex;gap:0;margin-top:18px;background:var(--raised);border-radius:var(--r3);overflow:hidden;border:1px solid var(--border)}
.mqs{flex:1;padding:10px 12px;text-align:center;border-right:1px solid var(--border)}
.mqs:last-child{border-right:none}
.mqs-v{font-family:var(--serif);font-size:20px;color:var(--ink);line-height:1}
.mqs-v.amber{color:var(--amber)}
.mqs-l{font-family:var(--mono);font-size:8px;color:var(--ink3);letter-spacing:1.5px;text-transform:uppercase;margin-top:2px}
.menu-nudge{margin:14px 22px 0;display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--raised);border:1px solid var(--border);border-radius:var(--r3);cursor:pointer;transition:border-color .12s}
.menu-nudge:hover{border-color:var(--border2)}
.menu-nudge.running{border-color:var(--matrix-mid);background:var(--matrix-dim)}
.nudge-dot{width:7px;height:7px;border-radius:50%;background:var(--matrix);animation:glow-pulse 1s ease infinite;flex-shrink:0;box-shadow:0 0 6px var(--matrix)}
.nudge-play{width:26px;height:26px;border-radius:50%;background:var(--amber);display:flex;align-items:center;justify-content:center;font-size:11px;color:#141210;flex-shrink:0}
.menu-sect-label{font-family:var(--mono);font-size:8px;color:var(--ink3);letter-spacing:2.5px;text-transform:uppercase;padding:14px 22px 6px}
.menu-list{padding:0 14px 100px}
.menu-item{display:flex;align-items:center;gap:13px;padding:12px 10px;border-radius:var(--r3);cursor:pointer;transition:background .12s;margin-bottom:1px}
.menu-item:hover{background:var(--raised)}
.menu-item:active{background:var(--high)}
.mi-icon-wrap{width:36px;height:36px;border-radius:var(--r2);background:var(--raised);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--ink2);flex-shrink:0;transition:background .12s}
.menu-item:hover .mi-icon-wrap{background:var(--high)}
.mi-text{flex:1}
.mi-label{font-size:14px;font-weight:600;color:var(--ink)}
.mi-sub{font-size:11px;color:var(--ink3);margin-top:1px}
.mi-badge{font-family:var(--mono);font-size:8px;background:var(--red);color:#fff;padding:2px 6px;border-radius:3px;flex-shrink:0}
.mi-badge.pro{background:var(--amber);color:#141210;font-weight:700}
.mi-badge.live{background:var(--matrix);color:#141210}
.mi-arrow{font-family:var(--mono);font-size:11px;color:var(--ink4);flex-shrink:0}

/* ── PRO VALUE CARDS ── */
.pro-value-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px}
.pv-card{background:var(--raised);border:1px solid var(--border);border-radius:var(--r3);padding:16px;position:relative;overflow:hidden}
.pv-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:var(--r3) var(--r3) 0 0}
.pv-card.amber-top::before{background:var(--amber)}
.pv-card.green-top::before{background:var(--matrix)}
.pv-card.blue-top::before{background:var(--blue)}
.pv-icon{font-size:22px;margin-bottom:9px}
.pv-title{font-family:var(--serif);font-size:16px;color:var(--ink);margin-bottom:5px}
.pv-desc{font-size:11px;color:var(--ink2);line-height:1.55}

/* ── ONBOARDING ── */
.onboard-overlay{position:fixed;inset:0;background:#0e0c09;z-index:2000;display:flex;align-items:center;justify-content:center;animation:fo .3s ease}
.onboard-box{max-width:480px;width:94%;padding:40px 36px;animation:su .4s ease}
.ob-step{display:none}
.ob-step.active{display:block;animation:su .25s ease}
.ob-logo{font-family:var(--serif);font-size:28px;color:var(--ink);margin-bottom:4px}
.ob-logo span{color:var(--amber)}
.ob-tagline{font-family:var(--mono);font-size:9px;color:var(--ink4);letter-spacing:2.5px;text-transform:uppercase;margin-bottom:36px}
.ob-heading{font-family:var(--serif);font-size:32px;color:var(--ink);letter-spacing:-.5px;line-height:1.1;margin-bottom:8px}
.ob-sub{font-size:13px;color:var(--ink2);line-height:1.65;margin-bottom:28px}
.ob-features{display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
.ob-feat{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r3)}
.ob-feat-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.ob-feat-text{flex:1}
.ob-feat-title{font-size:13px;font-weight:600;color:var(--ink);margin-bottom:2px}
.ob-feat-desc{font-size:11px;color:var(--ink3);line-height:1.5}
.ob-progress{display:flex;gap:5px;margin-bottom:24px}
.ob-pip{flex:1;height:2px;border-radius:1px;background:var(--high);transition:background .3s}
.ob-pip.done{background:var(--amber)}
.ob-goal-opts{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:20px}
.ob-opt{padding:12px;border:1px solid var(--border);border-radius:var(--r2);cursor:pointer;transition:all .12s;text-align:center;font-family:var(--mono)}
.ob-opt:hover{border-color:var(--border2);background:var(--raised)}
.ob-opt.sel{border-color:var(--amber);background:rgba(245,158,11,.07);color:var(--amber)}
.ob-opt-h{font-size:20px;color:inherit}
.ob-opt-l{font-size:9px;color:var(--ink3);letter-spacing:1px;text-transform:uppercase;margin-top:2px}

/* ── MISC UTILS ── */
.divider{border:none;border-top:1px solid var(--border);margin:13px 0}
.ruled{display:grid;gap:1px;background:var(--border);border-radius:var(--r3);overflow:hidden}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.flex{display:flex} .ic{align-items:center} .jb{justify-content:space-between}
.gap1{gap:4px} .gap2{gap:8px} .gap3{gap:12px}
.mb2{margin-bottom:8px} .mb3{margin-bottom:12px} .mb4{margin-bottom:16px} .mb5{margin-bottom:20px}
.mt2{margin-top:8px} .mt3{margin-top:12px} .mt4{margin-top:16px}
.mono{font-family:var(--mono)} .serif{font-family:var(--serif)}
.dim{color:var(--ink3)} .amber{color:var(--amber)} .matrix{color:var(--matrix)} .red{color:var(--red)}
.w100{width:100%}

@keyframes glow-pulse { 0%,100%{opacity:1;box-shadow:0 0 4px currentColor} 50%{opacity:.4;box-shadow:0 0 1px currentColor} }
@keyframes type-in { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }

/* ── RESPONSIVE ── */
@media(max-width:768px){
  .sidebar{display:none}
  .bottom-nav{display:block}
  .page{padding:16px 15px 90px}
  .sg{grid-template-columns:1fr 1fr}
  .two-col{grid-template-columns:1fr}
  .pricing-grid{grid-template-columns:1fr}
  .shard-grid{grid-template-columns:1fr 1fr}
  .pro-value-grid{grid-template-columns:1fr}
  .timer-wrap{grid-template-columns:1fr}
  .t-display{font-size:62px}
  .menu-greeting{font-size:28px}
  .menu-hero{padding:22px 15px 18px}
  .menu-nudge{margin:12px 15px 0}
  .menu-sect-label{padding:12px 15px 5px}
  .menu-list{padding:0 7px 100px}
  .toasts{bottom:72px;right:12px}
  .float-t{bottom:66px}
  .onboard-box{padding:28px 20px}
  .ob-goal-opts{grid-template-columns:1fr 1fr}
}
@media(min-width:769px){
  .page{padding-bottom:40px}
  .menu-page{padding-bottom:40px}
  .menu-list{padding:0 14px 40px}
}
`;

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep]       = useState(0);
  const [goal, setGoal]       = useState(null);
  const [cat, setCat]         = useState(null);
  const [verifyLines, setVL]  = useState([]);

  const GOALS = [
    { h:10, l:"Casual" }, { h:20, l:"Focused" },
    { h:30, l:"Serious" }, { h:40, l:"Elite" },
  ];
  const TOP_CATS = ["Coding","Deep Work","Study","Writing","Design","Research"];

  // Terminal boot sequence on step 2
  useEffect(() => {
    if (step !== 2) return;
    const lines = [
      "$ initialising ProdQuest arena...",
      "$ generating rank seed...",
      "$ loading leaderboard...",
      "$ anti-cheat layer: active",
      "$ proof engine: online",
      "$ welcome to the arena.",
    ];
    setVL([]);
    lines.forEach((l,i) => {
      setTimeout(() => setVL(v => [...v, l]), i * 340);
    });
  }, [step]);

  const STEPS = [
    // Step 0 — Welcome
    <div key={0} className="ob-step active">
      <div className="ob-logo">Prod<span>Quest</span></div>
      <div className="ob-tagline">the grind is the game</div>
      <div className="ob-heading">Your productivity<br /><em style={{fontStyle:"italic",color:"var(--ink2)"}}>has an audience.</em></div>
      <div className="ob-sub">Log verified focus sessions, compete on live leaderboards, challenge friends to 1v1 duels, and build a proof-of-work record you can actually share.</div>
      <div className="ob-features">
        {[
          { icon:"◉", title:"Anti-cheat timer", desc:"Every session verified. Tab switches logged. Proof required for big sessions." },
          { icon:"▲", title:"Live leaderboards", desc:"Compete daily, weekly, monthly. Guild wars and 1v1 duels for Shards." },
          { icon:"○", title:"Proof of work", desc:"A shareable, verified record of your focus hours. Show the world what you do." },
        ].map((f,i) => (
          <div key={i} className="ob-feat">
            <div className="ob-feat-icon">{f.icon}</div>
            <div className="ob-feat-text"><div className="ob-feat-title">{f.title}</div><div className="ob-feat-desc">{f.desc}</div></div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary w100" style={{width:"100%"}} onClick={()=>setStep(1)}>Enter the arena →</button>
    </div>,

    // Step 1 — Set goal + category
    <div key={1} className="ob-step active">
      <div className="ob-progress">{[0,1,2].map(i=><div key={i} className={`ob-pip ${i<=step?"done":""}`}/>)}</div>
      <div className="ob-heading" style={{fontSize:24}}>Set your weekly goal</div>
      <div className="ob-sub" style={{marginBottom:16}}>How many hours do you want to log per week? You can change this anytime.</div>
      <div className="ob-goal-opts">
        {GOALS.map(g=>(
          <div key={g.h} className={`ob-opt ${goal===g.h?"sel":""}`} onClick={()=>setGoal(g.h)}>
            <div className="ob-opt-h">{g.h}h</div>
            <div className="ob-opt-l">{g.l}</div>
          </div>
        ))}
      </div>
      <div className="ob-heading" style={{fontSize:20,marginBottom:10}}>Top category</div>
      <div className="tags" style={{marginBottom:24}}>
        {TOP_CATS.map(c=><div key={c} className={`tag ${cat===c?"sel":""}`} onClick={()=>setCat(c)}>{c}</div>)}
      </div>
      <button className="btn btn-primary w100" style={{width:"100%"}} disabled={!goal||!cat} onClick={()=>setStep(2)}>Continue →</button>
    </div>,

    // Step 2 — Boot sequence
    <div key={2} className="ob-step active">
      <div className="ob-progress">{[0,1,2].map(i=><div key={i} className={`ob-pip ${i<=step?"done":""}`}/>)}</div>
      <div className="ob-heading" style={{fontSize:24,marginBottom:16}}>Initialising your arena</div>
      <div className="verify-seq" style={{minHeight:140,marginBottom:24}}>
        {verifyLines.map((l,i)=><div key={i} style={{animationDelay:`${i*.05}s`,opacity:0,animation:"type-in .2s ease forwards",animationFillMode:"both"}}>{l}</div>)}
      </div>
      {verifyLines.length >= 6 && (
        <button className="btn btn-matrix w100" style={{width:"100%",justifyContent:"center",animation:"su .3s ease"}} onClick={onComplete}>
          Enter arena →
        </button>
      )}
    </div>,
  ];

  return (
    <div className="onboard-overlay">
      <div className="onboard-box">
        {STEPS[step]}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function ProdQuestApp({ onUpgradeToPro, onSessionLogged, initialUser }) {
  const [onboarded, setOnboarded] = useState(false);
  const [page, setPage]           = useState("dashboard");
  const [secs, setSecs]           = useState(0);
  const [running, setRunning]     = useState(false);
  const [paused, setPaused]       = useState(false);
  const [activity, setActivity]   = useState(100);
  const [pomoMode, setPomoMode]   = useState(false);
  const [pomoDone, setPomoDone]   = useState(0);
  const [pomoPhase, setPomoPhase] = useState("work");
  const [showForm, setShowForm]   = useState(false);
  const [fDesc, setFDesc]   = useState("");
  const [fCat, setFCat]     = useState("");
  const [fPType, setFPType] = useState("none");
  const [fPUp, setFPUp]     = useState(false);
  const [fPLink, setFPLink] = useState("");
  const [showResume, setShowResume] = useState(false);
  const [resumeIn, setResumeIn]     = useState("");
  const [showDuel, setShowDuel]     = useState(false);
  const [duelTarget, setDuelTarget] = useState(null);
  const [duelType, setDuelType]     = useState("24h");
  const [duelStake, setDuelStake]   = useState(100);
  const [sessions, setSessions]   = useState(SESSIONS);
  const [joinedEvs, setJoinedEvs] = useState({ e1:true });
  const [lbTab, setLbTab]         = useState("global");
  const [lbPeriod, setLbPeriod]   = useState("daily");
  const [evFilter, setEvFilter]   = useState("all");
  const [toasts, setToasts]       = useState([]);
  const [xpPop, setXpPop]         = useState(null);
  const [todayMins, setTodayMins] = useState(137);
  const [me, setMe]               = useState(ME);
  const [shopTab, setShopTab]     = useState("pro");
  const [duelTab, setDuelTab]     = useState("active");
  const [commits, setCommits]     = useState([
    { id:1, text:"Log 20h this week",   done:true  },
    { id:2, text:"No missed days",       done:false },
    { id:3, text:"1h Deep Work daily",   done:false },
  ]);

  const timerRef  = useRef(null);
  const actRef    = useRef(null);
  const actEvs    = useRef(0);
  const bgRef     = useRef(null);
  const hideSince = useRef(null);

  const mins   = Math.floor(secs / 60);
  const ps     = psCalc(fDesc, fPType, fPUp);
  const mult   = psMult(ps);
  const dw     = wc(fDesc);
  const canSub = fDesc.trim().length > 0 && fCat.length > 0;
  const active = running || paused || secs > 0;
  const xpPct  = (me.xp / me.xpCap) * 100;
  const ctx    = getContextMsg(me, running, secs, sessions);

  useEffect(() => {
    if (!initialUser) return;
    setMe((u) => ({
      ...u,
      name: initialUser.name || u.name,
      handle: initialUser.handle || u.handle,
    }));
  }, [initialUser]);

  useEffect(() => {
    const h = () => {
      if (document.hidden && running) {
        hideSince.current = Date.now();
        bgRef.current = setTimeout(() => { setRunning(false); setPaused(true); setShowResume(true); }, 120000);
      } else if (!document.hidden) {
        clearTimeout(bgRef.current);
        if (hideSince.current && running) { setRunning(false); setPaused(true); addToast("Tab switched — paused"); }
        hideSince.current = null;
      }
    };
    document.addEventListener("visibilitychange", h);
    return () => { document.removeEventListener("visibilitychange", h); clearTimeout(bgRef.current); };
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const inc = () => actEvs.current++;
    ["mousemove","keydown","click"].forEach(e => document.addEventListener(e, inc, { passive:true }));
    actRef.current = setInterval(() => {
      setActivity(prev => Math.round(prev * 0.7 + Math.min(100, actEvs.current * 10) * 0.3));
      actEvs.current = 0;
    }, 30000);
    return () => {
      ["mousemove","keydown","click"].forEach(e => document.removeEventListener(e, inc));
      clearInterval(actRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSecs(s => {
        if (pomoMode) {
          const pos = s % (25*60+5*60);
          if (pos===25*60-1) { setPomoPhase("break"); addToast("Pomo break — 5 min"); }
          if (pos===25*60+5*60-1) { setPomoPhase("work"); setPomoDone(d=>d+1); }
        }
        return s+1;
      }), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running, pomoMode]);

  useEffect(() => {
    const k = e => { if (e.code==="Space" && e.target.tagName!=="INPUT" && e.target.tagName!=="TEXTAREA") { e.preventDefault(); running ? pauseTimer() : startTimer(); } };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [running]);

  const startTimer = useCallback(() => { setRunning(true); setPaused(false); if(secs===0) addToast("Session started"); }, [secs]);
  const pauseTimer = useCallback(() => { setRunning(false); setPaused(true); addToast("Paused"); }, []);
  const stopTimer  = useCallback(() => { setRunning(false); setPaused(false); if(secs>0) setShowForm(true); }, [secs]);

  const resume = () => {
    if (resumeIn.trim().toUpperCase()==="PRODUCTIVE") { setShowResume(false); setResumeIn(""); startTimer(); }
    else addToast("Type PRODUCTIVE exactly");
  };

  const submitSession = useCallback(() => {
    if (!canSub) return;
    const dur = Math.max(1, Math.floor(secs/60));
    const scored = Math.floor(dur*mult);
    const xpG = scored*2, shG = Math.floor(scored/10);
    const aiSummary = fDesc.split(" ").slice(0,6).join(" ")+"…";
    const sessionPayload = { id:Date.now(), cat:fCat, dur, desc:fDesc, ps, ok:ps>=2||dur<15, score:scored, aiSummary };
    setSessions(s => [sessionPayload, ...s]);
    setTodayMins(t => t+dur);
    setMe(u => ({ ...u, xp:Math.min(u.xpCap, u.xp+xpG), shards:u.shards+shG }));
    setSecs(0); setShowForm(false);
    setFDesc(""); setFCat(""); setFPType("none"); setFPUp(false); setFPLink("");
    addToast(`Logged — +${xpG} XP`);
    setXpPop(`+${xpG} XP`); setTimeout(()=>setXpPop(null),1600);
    if (onSessionLogged) {
      Promise.resolve(onSessionLogged(sessionPayload)).catch(() => {
        addToast("Saved locally. Cloud sync pending.");
      });
    }
  }, [canSub, secs, fCat, fDesc, ps, mult, onSessionLogged]);

  const addToast = useCallback((msg) => {
    const id = Date.now()+Math.random();
    setToasts(t => [...t.slice(-3), { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id!==id)), 3000);
  }, []);

  const sendDuel = () => {
    if (!duelTarget) return;
    setShowDuel(false); addToast(`Challenge sent to ${duelTarget.handle}`);
    setDuelTarget(null); setDuelType("24h"); setDuelStake(100);
  };

  const nav = (pg) => setPage(pg);
  const sp = { me, xpPct, todayMins, sessions, running, paused, active, secs, mins, activity, startTimer, pauseTimer, stopTimer, pomoMode, setPomoMode, pomoPhase, pomoDone, addToast, setShowDuel, setDuelTarget, nav, lbTab, setLbTab, lbPeriod, setLbPeriod, ctx };

  if (!onboarded) return (
    <>
      <style>{CSS}</style>
      <div id="pq"><Onboarding onComplete={()=>setOnboarded(true)} /></div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div id="pq">
        <div className="shell">
          <Sidebar page={page} nav={nav} running={running} me={me} />
          <main className="main">
            {page==="dashboard"      && <DashPage {...sp} />}
            {page==="timer"          && <TimerPage {...sp} />}
            {page==="events"         && <EventsPage joinedEvs={joinedEvs} setJoinedEvs={setJoinedEvs} evFilter={evFilter} setEvFilter={setEvFilter} addToast={addToast} />}
            {page==="duels"          && <DuelsPage duelTab={duelTab} setDuelTab={setDuelTab} setShowDuel={setShowDuel} addToast={addToast} />}
            {page==="leaderboard"    && <LBPage {...sp} />}
            {page==="insights"       && <InsightsPage />}
            {page==="accountability" && <AccountabilityPage commits={commits} setCommits={setCommits} addToast={addToast} />}
            {page==="profile"        && <ProfilePage me={me} xpPct={xpPct} sessions={sessions} />}
            {page==="shop"           && <ShopPage me={me} shopTab={shopTab} setShopTab={setShopTab} addToast={addToast} onUpgradeToPro={onUpgradeToPro} />}
            {page==="menu"           && <MenuPage {...sp} />}
          </main>
        </div>

        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            {BOTTOM_NAV.map(n=>(
              <div key={n.id} className={`bn-item ${page===n.id?"on":""}`} onClick={()=>nav(n.id)}>
                {n.id==="timer" && running && <span className="bn-badge">●</span>}
                {n.id==="events" && !running && <span className="bn-badge">5</span>}
                <span className="bn-icon">{n.icon}</span>
                <span className="bn-label">{n.label}</span>
              </div>
            ))}
          </div>
        </nav>

        {running && page!=="timer" && (
          <div className="float-t" onClick={()=>nav("timer")}>
            <span className="ft-dot"/>
            <span className="ft-time">{fmt(secs)}</span>
            <span className="ft-cat">{fCat||"Session"}</span>
            <button className="btn btn-ghost btn-xs" onClick={e=>{e.stopPropagation();pauseTimer();}}>⏸</button>
          </div>
        )}

        {showForm && <SessionForm secs={secs} mins={mins} fDesc={fDesc} setFDesc={setFDesc} fCat={fCat} setFCat={setFCat} fPType={fPType} setFPType={setFPType} fPUp={fPUp} setFPUp={setFPUp} fPLink={fPLink} setFPLink={setFPLink} ps={ps} mult={mult} dw={dw} canSub={canSub} submit={submitSession} discard={()=>{setShowForm(false);setSecs(0);}} />}

        {showResume && (
          <div className="overlay">
            <div className="modal">
              <div className="m-title">Verify your presence</div>
              <div className="m-sub">Tab hidden &gt;2 minutes. Type the word to resume.</div>
              <div className="challenge-word">PRODUCTIVE</div>
              <input style={{marginBottom:10}} placeholder="Type the word above…" value={resumeIn} onChange={e=>setResumeIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&resume()} autoFocus />
              <div className="flex gap2">
                <button className="btn btn-primary w100" onClick={resume}>Verify &amp; Resume</button>
                <button className="btn btn-danger btn-sm" onClick={()=>{setShowResume(false);setSecs(0);}}>End</button>
              </div>
            </div>
          </div>
        )}

        {showDuel && <DuelModal duelTarget={duelTarget} setDuelTarget={setDuelTarget} duelType={duelType} setDuelType={setDuelType} duelStake={duelStake} setDuelStake={setDuelStake} send={sendDuel} close={()=>setShowDuel(false)} />}

        <div className="toasts">
          {toasts.map(t=><div key={t.id} className="toast"><span style={{color:"var(--matrix)",fontSize:10}}>◈</span>{t.msg}</div>)}
        </div>

        {xpPop && (
          <div style={{position:"fixed",bottom:88,right:14,zIndex:2000,fontFamily:"var(--serif)",fontSize:20,color:"var(--matrix)",textShadow:"0 0 12px var(--matrix-glow)",pointerEvents:"none",animation:"xp 1.6s ease forwards"}}>
            <style>{`@keyframes xp{0%{transform:translateY(0) scale(.7);opacity:0}25%{transform:translateY(-10px) scale(1.1);opacity:1}100%{transform:translateY(-60px);opacity:0}}`}</style>
            {xpPop}
          </div>
        )}
      </div>
    </>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ page, nav, running, me }) {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <div className="logotype">Prod<span>Quest</span></div>
        <div className="tagline">the grind is the game</div>
      </div>
      <div className="nav-sect">
        <div className="nav-grp">Arena</div>
        {NAV_ARENA.map(id=>{
          const n=NAV_META[id];
          return (
            <div key={id} className={`nav-i ${page===id?"on":""}`} onClick={()=>nav(id)}>
              <span style={{fontSize:12,width:14,flexShrink:0}}>{n.icon}</span>{n.label}
              {id==="timer"  && running  && <span className="nav-dot"/>}
              {id==="events" && !running && <span className="nav-badge">5</span>}
              {id==="duels"  && !running && <span className="nav-badge">{ACTIVE_DUELS.length}</span>}
            </div>
          );
        })}
      </div>
      <div className="nav-sect">
        <div className="nav-grp">Personal</div>
        {NAV_PERSONAL.map(id=>{
          const n=NAV_META[id];
          return (
            <div key={id} className={`nav-i ${page===id?"on":""}`} onClick={()=>nav(id)}>
              <span style={{fontSize:12,width:14,flexShrink:0}}>{n.icon}</span>{n.label}
              {id==="shop"&&<span className="nav-pro">PRO</span>}
            </div>
          );
        })}
      </div>
      <div className="nav-sect" style={{marginTop:"auto",paddingBottom:4}}>
        <div className={`nav-i ${page==="menu"?"on":""}`} onClick={()=>nav("menu")}>
          <span style={{fontSize:12,width:14,flexShrink:0}}>≡</span>Menu
        </div>
      </div>
      <div className="sidebar-user">
        <div className="user-pill" onClick={()=>nav("profile")}>
          <div className="avatar">{me.avatar}</div>
          <div><div className="u-name">{me.handle}</div><div className="u-sub">Lv{me.level} · {me.shards}✦</div></div>
        </div>
      </div>
    </aside>
  );
}

// ─── SESSION CARD component ───────────────────────────────────────────────���───
function SCard({ s }) {
  const cc = CAT_COLORS[s.cat] || "var(--ink3)";
  const durH = Math.floor(s.dur/60);
  const durM = s.dur % 60;
  return (
    <div className={`sess-card ${s.ok?"verified":s.ok===false?"flagged":""}`}>
      <div className="sess-dur-block">
        {durH > 0 && <span className="sess-big">{durH}<span style={{fontSize:13,color:"var(--ink3)",fontFamily:"var(--sans)"}}>h</span></span>}
        <span className="sess-big" style={{fontSize:durH>0?16:22}}>{durH>0?p(durM):durM}<span style={{fontSize:11,color:"var(--ink3)",fontFamily:"var(--sans)"}}>m</span></span>
      </div>
      <div className="sess-info">
        <div className="sess-top">
          <span className="sess-cat-badge" style={{background:`${cc}18`,color:cc}}>{s.cat}</span>
          {s.ps===3 && <span style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--matrix)",letterSpacing:1}}>ELITE</span>}
        </div>
        <div className="sess-desc-text">{s.desc}</div>
        {s.aiSummary && (
          <div className="sess-ai">
            <span className="sess-ai-dot"/>
            {s.aiSummary}
          </div>
        )}
      </div>
      <div className="sess-right">
        <div className="sess-score">{s.score}</div>
        <div className="sess-score-lbl">pts</div>
        <div className={`sess-status ${s.ok?"ok":s.ok===false?"flag":"pend"}`}>
          {s.ok?"VERIFIED":s.ok===false?"FLAGGED":"PENDING"}
        </div>
      </div>
    </div>
  );
}

// ─── SMART CONTEXT BANNER ─────────────────────────────────────────────────────
function CtxBanner({ ctx, nav }) {
  if (!ctx) return null;
  return (
    <div className={`ctx-banner ${ctx.urgency}`} onClick={ctx.cta?()=>nav(ctx.cta):undefined} style={{cursor:ctx.cta?"pointer":"default"}}>
      <span className="ctx-dot"/>
      <span style={{flex:1}}>{ctx.msg}</span>
      {ctx.cta && <span style={{fontFamily:"var(--mono)",fontSize:10,opacity:.7}}>→</span>}
    </div>
  );
}

// ─── MENU PAGE ────────────────────────────────────────────────────────────────
function MenuPage({ me, xpPct, todayMins, running, secs, nav, startTimer, ctx }) {
  const todayH = (todayMins/60).toFixed(1);
  const PRIMARY    = [
    { id:"dashboard",      badge:null },
    { id:"timer",          badge:running?"live":null },
    { id:"events",         badge:"5 live" },
    { id:"duels",          badge:`${ACTIVE_DUELS.length} active` },
    { id:"leaderboard",    badge:null },
  ];
  const SECONDARY  = [
    { id:"insights",       badge:null },
    { id:"accountability", badge:"partner live", badgeStyle:"live" },
    { id:"profile",        badge:null },
    { id:"shop",           badge:"pro", badgeStyle:"pro" },
  ];
  return (
    <div className="menu-page">
      <div className="menu-hero">
        <div className="menu-greeting">Good evening,<br /><em>{me.name}.</em></div>
        <div className="menu-date">Wed 4 Mar 2026 · Rank #{me.rank} · {me.streak}d streak</div>
        <div className="menu-qstats">
          <div className="mqs"><div className="mqs-v amber">{todayH}h</div><div className="mqs-l">Today</div></div>
          <div className="mqs"><div className="mqs-v">{me.streak}d</div><div className="mqs-l">Streak</div></div>
          <div className="mqs"><div className="mqs-v">#{me.rank}</div><div className="mqs-l">Rank</div></div>
          <div className="mqs" style={{flex:2}}>
            <div style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--ink3)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>Lv{me.level} · {me.xp}/{me.xpCap} XP</div>
            <div className="prog" style={{height:3}}><div className="prog-fill" style={{width:`${xpPct}%`,background:"var(--amber)"}}/></div>
          </div>
        </div>
      </div>
      <div style={{padding:"0 22px"}}>
        <div style={{marginTop:14}}><CtxBanner ctx={ctx} nav={nav}/></div>
      </div>
      <div className="menu-nudge" style={{marginTop:4}} onClick={running?undefined:startTimer}>
        {running?<span className="nudge-dot"/>:<span className="nudge-play">▶</span>}
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:running?"var(--matrix)":"var(--ink)"}}>{running?`Session running — ${fmt(secs)}`:"Start a session"}</div>
          <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginTop:1}}>{running?"Tap timer to return":"Tap to begin tracking"}</div>
        </div>
        <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--ink4)"}}>›</span>
      </div>
      <div className="menu-sect-label">Arena</div>
      <div className="menu-list" style={{paddingBottom:8}}>
        {PRIMARY.map(({id,badge,badgeStyle})=>{
          const n=NAV_META[id];
          return (
            <div key={id} className="menu-item" onClick={()=>nav(id)}>
              <div className="mi-icon-wrap">{n.icon}</div>
              <div className="mi-text"><div className="mi-label">{n.label}</div><div className="mi-sub">{n.sub}</div></div>
              {badge&&<span className={`mi-badge ${badgeStyle||""}`}>{badge}</span>}
              <span className="mi-arrow">›</span>
            </div>
          );
        })}
      </div>
      <div className="menu-sect-label">Personal</div>
      <div className="menu-list">
        {SECONDARY.map(({id,badge,badgeStyle})=>{
          const n=NAV_META[id];
          return (
            <div key={id} className="menu-item" onClick={()=>nav(id)}>
              <div className="mi-icon-wrap">{n.icon}</div>
              <div className="mi-text"><div className="mi-label">{n.label}</div><div className="mi-sub">{n.sub}</div></div>
              {badge&&<span className={`mi-badge ${badgeStyle||""}`}>{badge}</span>}
              <span className="mi-arrow">›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SESSION FORM ─────────────────────────────────────────────────────────────
function SessionForm({ secs, mins, fDesc, setFDesc, fCat, setFCat, fPType, setFPType, fPUp, setFPUp, fPLink, setFPLink, ps, mult, dw, canSub, submit, discard }) {
  const scored = Math.floor(mins*mult);
  return (
    <div className="overlay">
      <div className="modal">
        <div className="m-title">Log session</div>
        <div className="m-sub"><span style={{fontFamily:"var(--mono)",color:"var(--ink)"}}>{fmt(secs)}</span> · <span style={{color:"var(--amber)",fontFamily:"var(--mono)"}}>{scored}min scored</span>{mins>=15&&<span style={{color:"var(--red)",fontFamily:"var(--mono)",fontSize:10,marginLeft:8}}> · proof required</span>}</div>
        <div className="ps-track mb3" style={{marginBottom:12}}>
          <div className="ps-lbl"><span>Proof strength</span><span style={{color:psColor(ps)}}>{psLabel(ps)} · ×{mult.toFixed(2)}</span></div>
          <div className="ps-pips">{[0,1,2].map(i=><div key={i} className={`ps-pip ${i<=ps-1?(ps===1?"amber-pip":"on"):""}`}/>)}</div>
        </div>
        <div className="f-row">
          <label className="f-label">What did you work on? ({dw} words)</label>
          <textarea rows={3} placeholder="Be specific — 80+ words + screenshot = elite bonus…" value={fDesc} onChange={e=>setFDesc(e.target.value)} />
          <div className={`wc ${dw>=80?"good":dw>=20?"ok":""}`}>{dw>=80?"Elite!":dw>=20?"Good":`${20-dw} more for auto-approve`}</div>
        </div>
        <div className="f-row">
          <label className="f-label">Category</label>
          <div className="tags">{CATS.map(c=><div key={c} className={`tag ${fCat===c?"sel":""}`} onClick={()=>setFCat(c)}>{c}</div>)}</div>
        </div>
        <div className="f-row">
          <label className="f-label">Proof</label>
          <div className="flex gap1 mb2" style={{marginBottom:8,flexWrap:"wrap"}}>{["none","link","screenshot","video"].map(t=><button key={t} className={`btn btn-xs ${fPType===t?"btn-primary":"btn-ghost"}`} onClick={()=>setFPType(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}</div>
          {fPType==="link"&&<input placeholder="Notion / GitHub / Drive…" value={fPLink} onChange={e=>setFPLink(e.target.value)} style={{marginBottom:8}}/>}
          {(fPType==="screenshot"||fPType==="video")&&<div className={`upload-zone ${fPUp?"filled":""}`} onClick={()=>setFPUp(true)}>{fPUp?`✓ ${fPType} attached`:`Tap to attach ${fPType}`}</div>}
        </div>
        <div className="acheat-note mb3" style={{marginBottom:12}}>Anti-cheat active · tab switches logged · activity tracked · no-proof ≥15min = 50% score</div>
        <div className="flex gap2">
          <button className="btn btn-primary w100" onClick={submit} disabled={!canSub}>Submit to arena</button>
          <button className="btn btn-ghost btn-sm" onClick={discard}>Discard</button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashPage({ me, xpPct, todayMins, sessions, nav, running, startTimer, ctx }) {
  const todayH = (todayMins/60).toFixed(1);
  const weekPct = Math.round((me.weekHours/me.weekGoal)*100);
  return (
    <div className="page">
      <div className="ph">
        <div className="flex ic jb" style={{flexWrap:"wrap",gap:10}}>
          <div><div className="pt">Good evening, <em>{me.name}.</em></div><div className="ps-sub">Wed 4 Mar · Rank #3 · Sprint ends 31h</div></div>
          <button className="btn btn-primary" onClick={startTimer}>{running?"◉ Recording":"▶ Start"}</button>
        </div>
      </div>

      <CtxBanner ctx={ctx} nav={nav}/>

      <div className="sg">
        <div className="sb"><div className="sl">Today</div><div className="sv">{todayH}<span style={{fontSize:13}}>h</span></div><div className="ss">+{me.todayMins*2} XP earned</div></div>
        <div className="sb"><div className="sl">Streak</div><div className="sv amber">{me.streak}<span style={{fontSize:13}}>d</span></div><div className="ss">Best 21d</div></div>
        <div className="sb"><div className="sl">Rank</div><div className="sv">#{me.rank}</div><div className="ss">↑2 this week</div></div>
        <div className="sb"><div className="sl">Shards</div><div className="sv">{me.shards}<span style={{fontSize:13}}>✦</span></div></div>
      </div>

      <div className="two-col mb4" style={{marginBottom:14}}>
        <div className="card">
          <div className="clabel">Level {me.level} · XP</div>
          <div className="flex ic jb" style={{marginBottom:7}}>
            <span style={{fontFamily:"var(--serif)",fontSize:16}}>{me.xp}<span style={{fontSize:11,color:"var(--ink3)",fontFamily:"var(--sans)"}}> / {me.xpCap}</span></span>
            <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)"}}>{me.xpCap-me.xp} to go</span>
          </div>
          <div className="prog" style={{height:2,marginBottom:14}}><div className="prog-fill" style={{width:`${xpPct}%`,background:"var(--ink)"}}/></div>
          <div className="clabel">Week — {me.weekHours}h / {me.weekGoal}h ({weekPct}%)</div>
          <div className="prog" style={{height:4,marginBottom:14}}><div className="prog-fill" style={{width:`${weekPct}%`,background:weekPct>=80?"var(--matrix)":"var(--amber)"}}/></div>
          <div className="clabel">This week</div>
          <div className="bar-chart">{WEEKLY_DATA.map((d,i)=><div key={d.day} className="bar-col"><div className={`bar ${i===4?"today":""}`} style={{height:`${(d.h/8)*100}%`}}/><span className="bar-lbl">{d.day}</span></div>)}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div className="card-pro" style={{padding:13}}>
            <div className="clabel" style={{marginBottom:8}}>Accountability partner</div>
            <div className="flex ic gap2" style={{marginBottom:9}}>
              <div className="avatar live">{PARTNER.avatar}</div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{PARTNER.handle}</div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--matrix)"}}>● Live now</div></div>
            </div>
            <div style={{display:"flex",gap:14,marginBottom:8}}>
              <div><div style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--ink3)",letterSpacing:1.5,marginBottom:2}}>THEM</div><div style={{fontFamily:"var(--serif)",fontSize:17,color:"var(--ink)"}}>{PARTNER.weekHours}h<span style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--sans)"}}> /{PARTNER.weekGoal}</span></div></div>
              <div><div style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--ink3)",letterSpacing:1.5,marginBottom:2}}>YOU</div><div style={{fontFamily:"var(--serif)",fontSize:17,color:"var(--ink)"}}>{me.weekHours}h<span style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--sans)"}}> /{me.weekGoal}</span></div></div>
            </div>
            <button className="btn btn-ghost btn-xs w100" style={{width:"100%"}} onClick={()=>nav("accountability")}>View partnership →</button>
          </div>
          <div className="card" style={{flex:1}}>
            <div className="clabel">Top 3 today</div>
            {LEADERBOARD.slice(0,3).map(pp=>(
              <div key={pp.rank} className={`lb-row ${pp.me?"me":""}`} style={{padding:"7px 0"}}>
                <span className={`rk r${pp.rank}`}>{pp.rank}</span>
                <div className="avatar">{pp.avatar}</div>
                <div className="lb-info"><div className="lb-handle" style={{fontSize:12}}>{pp.handle}{pp.me&&<span className="me-chip">YOU</span>}</div></div>
                <div style={{textAlign:"right"}}><div className="lb-h" style={{fontSize:16}}>{pp.hours}</div><div className="lb-hl">h</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex ic jb" style={{marginBottom:10}}>
          <span className="clabel" style={{marginBottom:0}}>Recent sessions</span>
          <button className="btn btn-ghost btn-xs" onClick={()=>nav("profile")}>All</button>
        </div>
        <div className="sess-cards">{sessions.slice(0,3).map(s=><SCard key={s.id} s={s}/>)}</div>
      </div>
    </div>
  );
}

// ─── TIMER ────────────────────────────────────────────────────────────────────
function TimerPage({ secs, running, paused, active, startTimer, pauseTimer, stopTimer, pomoMode, setPomoMode, pomoPhase, pomoDone, activity, todayMins, sessions, mins }) {
  const ac = activity>=70?"var(--matrix)":activity>=40?"var(--amber)":"var(--red)";
  return (
    <div className="page">
      <div className="ph"><div className="pt">Arena <em>Timer</em></div><div className="ps-sub">Track · prove · compete</div></div>
      <div className="timer-wrap">
        <div className={`timer-face ${running?"running":""}`}>
          <div className={`t-state ${running?"live":""}`}>{running?(pomoMode?`Pomo · ${pomoPhase}`:"● Recording"):paused?"Paused":"Ready"}</div>
          <div className={`t-display ${running?"running":paused?"paused":!running&&secs===0?"stopped":""}`}>{fmt(secs)}</div>
          <div className="t-sub">
            {running&&mins>=15&&<span style={{color:"var(--amber)",fontFamily:"var(--mono)",fontSize:9}}>proof required at stop</span>}
            {!running&&!paused&&<span style={{color:"var(--ink3)",fontFamily:"var(--mono)",fontSize:9}}>space to start</span>}
            {paused&&<span style={{color:"var(--amber)",fontFamily:"var(--mono)",fontSize:9}}>paused — space to resume</span>}
          </div>
          <div className="t-ctrls">
            {!running&&<button className="btn btn-primary" onClick={startTimer}>{paused?"Resume":"Start session"}</button>}
            {running &&<button className="btn btn-ghost" onClick={pauseTimer}>Pause</button>}
            {active  &&<button className="btn btn-danger btn-sm" onClick={stopTimer}>Stop &amp; log</button>}
          </div>
          <div className="t-opts">
            <button className={`btn btn-xs ${pomoMode?"btn-matrix":"btn-ghost"}`} onClick={()=>setPomoMode(v=>!v)}>Pomodoro</button>
          </div>
          {pomoMode&&<div style={{display:"flex",gap:5,justifyContent:"center",marginTop:10}}>{[0,1,2,3].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:i<pomoDone?"var(--ink3)":i===pomoDone&&running?"var(--matrix)":"var(--high)",border:"1px solid var(--border)",transition:"all .3s",boxShadow:i===pomoDone&&running?"0 0 6px var(--matrix-glow)":"none"}}/>)}<span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginLeft:6}}>{pomoDone}/4</span></div>}
          {active&&<div className="ps-track" style={{marginTop:14}}><div className="ps-lbl"><span>Proof at stop</span><span>{mins>=15?"Required":"Optional"}</span></div></div>}
          <div className="acheat-note" style={{marginTop:12}}>Tab hide pauses · hidden &gt;2min triggers verify · activity sampled every 30s</div>
        </div>
        <div className="timer-panel">
          <div>
            <div className="clabel">Activity</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div className="act-bar"><div className="act-fill" style={{width:`${activity}%`,background:ac,boxShadow:activity>=70?"0 0 4px var(--matrix-glow)":"none"}}/></div>
              <span style={{fontFamily:"var(--mono)",fontSize:10,color:ac,minWidth:28,textAlign:"right"}}>{activity}%</span>
            </div>
          </div>
          <div>
            <div className="clabel">Today — {(todayMins/60).toFixed(1)}h</div>
            <div className="prog" style={{height:2}}><div className="prog-fill" style={{width:`${Math.min(100,(todayMins/480)*100)}%`,background:"var(--ink)"}}/></div>
            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginTop:4,display:"flex",justifyContent:"space-between"}}><span>{todayMins}min</span><span>8h goal</span></div>
          </div>
          <div style={{flex:1,minHeight:0}}>
            <div className="clabel">Sessions</div>
            <div style={{maxHeight:180,overflowY:"auto"}} className="sess-cards">{sessions.slice(0,3).map(s=><SCard key={s.id} s={s}/>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
function EventsPage({ joinedEvs, setJoinedEvs, evFilter, setEvFilter, addToast }) {
  const filtered = evFilter==="all"?EVENTS:EVENTS.filter(e=>e.type===evFilter);
  return (
    <div className="page">
      <div className="ph"><div className="pt">Events</div><div className="ps-sub">Five formats · new events weekly</div></div>
      <div className="flex gap1 mb4" style={{marginBottom:14,flexWrap:"wrap"}}>
        {["all","sprint","elimination","blitz","bounty","war"].map(t=><button key={t} className={`btn btn-xs ${evFilter===t?"btn-primary":"btn-ghost"}`} onClick={()=>setEvFilter(t)}>{t==="all"?"All":EVENT_TYPE_META[t]?.label||t}</button>)}
      </div>
      {filtered.map(e=>(
        <div key={e.id} className="ev-card">
          <div className="ev-stripe" style={{background:e.color}}/>
          <div className="ev-body">
            <div className="ev-type">{EVENT_TYPE_META[e.type]?.emoji} {EVENT_TYPE_META[e.type]?.label}{e.status==="live"&&<><span className="ev-live" style={{marginLeft:5}}/>Live</>}</div>
            <div className="ev-name">{e.name}</div>
            <div className="ev-desc">{e.desc}</div>
            {e.type==="war"&&e.joined&&<div style={{marginBottom:8}}><div className="flex jb" style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginBottom:4}}><span style={{color:"var(--matrix)"}}>{e.myGuild} {e.myGuildHours}h</span><span style={{color:"var(--red)"}}>{e.enemyGuildHours}h {e.enemyGuild}</span></div><div className="war-wrap"><div className="war-a" style={{width:`${(e.myGuildHours/(e.myGuildHours+e.enemyGuildHours))*100}%`}}/><div className="war-b" style={{width:`${(e.enemyGuildHours/(e.myGuildHours+e.enemyGuildHours))*100}%`}}/></div></div>}
            {e.type==="bounty"&&<div style={{marginBottom:8}}><div className="prog" style={{height:3,marginBottom:3}}><div className="prog-fill" style={{width:`${e.progress}%`,background:e.color}}/></div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)"}}>Leader at {e.progress}%</div></div>}
            {e.type==="sprint"&&e.joined&&<div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginBottom:6}}>Your rank: <span style={{color:"var(--ink)"}}>#{e.myRank}</span> · {e.myHours}h · leader: {e.leaderHours}h</div>}
            <div className="ev-foot">
              <span>⏱ {e.timeLeft}</span>
              {e.participants>0&&<span>{e.participants} in</span>}
              <span className="ev-prize">◎ {e.prize}</span>
              {joinedEvs[e.id]?<span className="joined-pill">JOINED</span>:e.status!=="upcoming"&&<button className="btn btn-primary btn-xs" style={{marginLeft:"auto"}} onClick={()=>{setJoinedEvs(j=>({...j,[e.id]:true}));addToast(`Joined ${e.name}`);}}>Join</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DUELS ────────────────────────────────────────────────────────────────────
function DuelsPage({ duelTab, setDuelTab, setShowDuel, addToast }) {
  return (
    <div className="page">
      <div className="ph">
        <div className="flex ic jb" style={{flexWrap:"wrap",gap:10}}>
          <div><div className="pt">1v1 <em>Duels</em></div><div className="ps-sub">Stake Shards · winner takes all</div></div>
          <button className="btn btn-primary" onClick={()=>setShowDuel(true)}>+ Challenge</button>
        </div>
      </div>
      <div className="two-col mb4" style={{marginBottom:14}}>
        <div className="card">
          <div className="clabel">Formats</div>
          {[{l:"Blitz — 1h",d:"Most focus in 1h",s:"50–200✦"},{l:"Daily — 24h",d:"Most hours in 24h",s:"100–500✦"},{l:"Weekly",d:"Best week total",s:"200–1000✦"},{l:"Category",d:"Best in a category",s:"150–500✦"}].map((t,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<3?"1px solid var(--border)":"none"}}><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{t.l}</div><div style={{fontSize:10,color:"var(--ink3)"}}>{t.d}</div></div><span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--amber)"}}>{t.s}</span></div>)}
        </div>
        <div className="card">
          <div className="clabel">Your record</div>
          <div className="ruled" style={{gridTemplateColumns:"1fr 1fr 1fr",marginBottom:12,borderRadius:"var(--r2)"}}>
            {[["Won","2","var(--matrix)"],["Lost","1","var(--red)"],["Rate","67%","var(--ink)"]].map(([l,v,c])=><div key={l} style={{background:"var(--raised)",padding:"9px 10px"}}><div style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--ink3)",letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>{l}</div><div style={{fontFamily:"var(--serif)",fontSize:18,color:c}}>{v}</div></div>)}
          </div>
          <div className="clabel">Free duels this week</div>
          <div className="prog" style={{height:2,marginBottom:4}}><div className="prog-fill" style={{width:"33%",background:"var(--ink)"}}/></div>
          <div className="flex jb" style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)"}}><span>1 / 3 used</span><span style={{color:"var(--amber)"}}>Pro = unlimited</span></div>
        </div>
      </div>
      <div className="flex gap1 mb3" style={{marginBottom:10}}>
        {["active","pending","history"].map(t=><button key={t} className={`btn btn-xs ${duelTab===t?"btn-primary":"btn-ghost"}`} onClick={()=>setDuelTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
      </div>
      {duelTab==="active"&&ACTIVE_DUELS.map(d=>{
        const myP=(d.myMins/Math.max(d.myMins,d.oppMins,1))*46, opP=(d.oppMins/Math.max(d.myMins,d.oppMins,1))*46;
        return (
          <div key={d.id} className="duel-card">
            <div className="duel-head"><div style={{flex:1,fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",letterSpacing:1,textTransform:"uppercase"}}>24h Duel · {d.endsIn} left</div><div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--amber)"}}>{d.stake}</div><span style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--red)",border:"1px solid rgba(224,82,82,.28)",borderRadius:3,padding:"2px 6px",marginLeft:8}}>LOSING</span></div>
            <div style={{padding:"12px 13px"}}>
              <div className="duel-vs">
                <div className="duel-side"><div className="avatar lg" style={{margin:"0 auto"}}>{d.oppAvatar}</div><div style={{fontSize:11,fontWeight:600,color:"var(--ink)",marginTop:5}}>{d.opponent}</div><div className="duel-hrs ahead">{fmtH(d.oppMins)}</div></div>
                <div className="vs-lbl">vs</div>
                <div className="duel-side"><div className="avatar lg" style={{margin:"0 auto",border:"1px solid var(--amber)"}}>KD</div><div style={{fontSize:11,fontWeight:600,color:"var(--ink)",marginTop:5}}>you</div><div className="duel-hrs behind">{fmtH(d.myMins)}</div></div>
              </div>
              <div className="duel-bar"><div className="duel-bar-b" style={{width:`${opP}%`}}/><div className="duel-bar-a" style={{width:`${myP}%`}}/></div>
              <div className="flex jb" style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginTop:4}}><span style={{color:"var(--red)"}}>Behind {fmtH(d.oppMins-d.myMins)}</span><span>{d.endsIn} left</span></div>
              <div className="flex gap2 mt3" style={{marginTop:10}}><button className="btn btn-primary btn-sm">▶ Start session</button><button className="btn btn-ghost btn-sm" onClick={()=>addToast("Forfeit — stake lost")}>Forfeit</button></div>
            </div>
          </div>
        );
      })}
      {duelTab==="pending"&&<div className="card" style={{textAlign:"center",padding:20,color:"var(--ink3)",fontFamily:"var(--mono)",fontSize:11}}>No pending challenges</div>}
      {duelTab==="history"&&<div className="card"><div className="clabel">History</div>{DUEL_HISTORY.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<DUEL_HISTORY.length-1?"1px solid var(--border)":"none"}}><span style={{fontFamily:"var(--serif)",fontSize:17,color:d.result==="won"?"var(--matrix)":"var(--red)"}}>{d.result==="won"?"W":"L"}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{d.opponent}</div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)"}}>{d.myH}h vs {d.oppH}h · {d.date}</div></div>{d.result==="won"&&<span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--amber)"}}>+{d.earned}✦</span>}</div>)}</div>}
    </div>
  );
}

// ─── DUEL MODAL ───────────────────────────────────────────────────────────────
function DuelModal({ duelTarget, setDuelTarget, duelType, setDuelType, duelStake, setDuelStake, send, close }) {
  const TYPES=[{id:"1h",l:"Blitz — 1h",d:"Most focus"},{id:"24h",l:"Daily — 24h",d:"Most hours"},{id:"week",l:"Weekly",d:"Best week"},{id:"cat",l:"Category",d:"Best in category"}];
  return (
    <div className="overlay">
      <div className="modal">
        <div className="m-title">Issue a challenge</div>
        <div className="m-sub">Pick opponent, format, and stake.</div>
        <div className="clabel">Opponent</div>
        {FRIENDS.map(f=><div key={f.handle} className={`fp-row ${duelTarget?.handle===f.handle?"sel":""}`} onClick={()=>setDuelTarget(f)}><div className={`avatar ${f.status==="live"?"live":""}`}>{f.avatar}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{f.handle}</div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)"}}>{f.streak}d streak</div></div><span style={{width:6,height:6,borderRadius:"50%",background:f.status==="live"?"var(--matrix)":f.status==="away"?"var(--amber)":"var(--ink3)",flexShrink:0}}/><span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)"}}>{f.status}</span></div>)}
        <div className="clabel mt3" style={{marginTop:14}}>Format</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
          {TYPES.map(t=><div key={t.id} className={`duel-tc ${duelType===t.id?"sel":""}`} onClick={()=>setDuelType(t.id)}><div style={{fontWeight:600,fontSize:12,color:"var(--ink)"}}>{t.l}</div><div style={{fontSize:10,color:"var(--ink3)",marginTop:2}}>{t.d}</div></div>)}
        </div>
        <div className="clabel">Stake</div>
        <div className="flex gap1 mb3" style={{marginBottom:14,flexWrap:"wrap"}}>
          {[50,100,200,500].map(s=><button key={s} className={`btn btn-xs ${duelStake===s?"btn-primary":"btn-ghost"}`} onClick={()=>setDuelStake(s)}>{s}✦</button>)}
        </div>
        <div className="flex gap2">
          <button className="btn btn-primary w100" onClick={send} disabled={!duelTarget}>Send challenge</button>
          <button className="btn btn-ghost btn-sm" onClick={close}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
function LBPage({ lbTab, setLbTab, lbPeriod, setLbPeriod, setShowDuel, setDuelTarget }) {
  const TABS=["global","friends","guild","category"],PERS=["daily","weekly","monthly"];
  return (
    <div className="page">
      <div className="ph"><div className="pt">Leaderboard</div><div className="ps-sub">Resets daily, weekly &amp; monthly</div></div>
      <div style={{display:"flex",gap:1,marginBottom:18,background:"var(--border)",borderRadius:"var(--r3)",overflow:"hidden",alignItems:"flex-end"}}>
        {[LEADERBOARD[1],LEADERBOARD[0],LEADERBOARD[2]].map((pp,i)=>{
          const h=["145px","180px","125px"][i],od=[2,1,3][i];
          const isFirst=pp.rank===1;
          return(
            <div key={pp.rank} style={{flex:1,background:isFirst?"rgba(0,230,118,0.04)":"var(--surface)",height:h,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,padding:10,borderTop:isFirst?"2px solid var(--matrix)":"2px solid transparent",boxShadow:isFirst?"inset 0 0 20px rgba(0,230,118,0.04)":"none"}}>
              <div className={`avatar ${isFirst?"live":""}`}>{pp.avatar}</div>
              <div style={{fontSize:11,fontWeight:600,color:pp.me?"var(--amber)":"var(--ink)",textAlign:"center"}}>{pp.handle}{pp.me&&<span className="me-chip">YOU</span>}</div>
              <div style={{fontFamily:"var(--serif)",fontSize:18,color:isFirst?"var(--matrix)":"var(--ink)",textShadow:isFirst?"0 0 12px var(--matrix-glow)":"none"}}>{pp.hours}<span style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--sans)"}}>h</span></div>
            </div>
          );
        })}
      </div>
      <div className="flex ic jb mb3" style={{marginBottom:10,flexWrap:"wrap",gap:6}}>
        <div className="flex gap1" style={{flexWrap:"wrap"}}>{TABS.map(t=><button key={t} className={`btn btn-xs ${lbTab===t?"btn-primary":"btn-ghost"}`} onClick={()=>setLbTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}</div>
        <div className="flex gap1">{PERS.map(pp=><button key={pp} className={`btn btn-xs ${lbPeriod===pp?"btn-primary":"btn-ghost"}`} onClick={()=>setLbPeriod(pp)}>{pp.charAt(0).toUpperCase()+pp.slice(1)}</button>)}</div>
      </div>
      <div className="card" style={{padding:0}}>
        {LEADERBOARD.map(pp=>(
          <div key={pp.rank} className={`lb-row ${pp.me?"me":""}`}>
            <span className={`rk ${pp.rank<=3?`r${pp.rank}`:""}`}>{pp.rank}</span>
            <div className={`avatar ${pp.rank===1?"live":""}`}>{pp.avatar}</div>
            <div className="lb-info"><div className="lb-handle">{pp.handle}{pp.me&&<span className="me-chip">YOU</span>}{!pp.verified&&<span className="unv-chip">⚠</span>}</div><div className="lb-meta">Lv.{pp.level} · {pp.guild}</div></div>
            {!pp.me&&<button className="btn btn-ghost btn-xs" onClick={()=>{setDuelTarget({handle:pp.handle,avatar:pp.avatar,status:"live",streak:pp.level});setShowDuel(true);}}>⚔</button>}
            <div style={{textAlign:"right"}}><div className="lb-h">{pp.hours}</div><div className="lb-hl">h</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INSIGHTS ────────────────────────────────────────────────────────────────
function InsightsPage() {
  const R=WEEKLY_REPORT;
  const pct=Math.round((R.totalH/R.goalH)*100);
  return (
    <div className="page">
      <div className="ph">
        <div className="flex ic jb" style={{flexWrap:"wrap",gap:10}}>
          <div><div className="pt">Weekly <em>Report</em></div><div className="ps-sub">AI analysis · week of {R.weekOf}</div></div>
          <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--amber)",border:"1px solid rgba(245,158,11,.28)",borderRadius:3,padding:"3px 8px"}}>PRO</span>
        </div>
      </div>
      <div className="card-pro mb4" style={{marginBottom:14}}>
        <div className="clabel">Week summary</div>
        <div style={{display:"flex",gap:20,alignItems:"flex-end",flexWrap:"wrap",marginBottom:14}}>
          <div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Total hours</div><div style={{fontFamily:"var(--serif)",fontSize:48,color:R.goalMet?"var(--matrix)":"var(--ink)",lineHeight:1,textShadow:R.goalMet?"0 0 20px var(--matrix-glow)":"none"}}>{R.totalH}<span style={{fontSize:16,fontFamily:"var(--sans)",color:"var(--ink3)"}}> / {R.goalH}h</span></div></div>
          <div style={{paddingBottom:8}}><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Goal</div><div style={{fontFamily:"var(--serif)",fontSize:22,color:R.goalMet?"var(--matrix)":"var(--red)"}}>{pct}%{R.goalMet?" ✓":" short"}</div></div>
          <div style={{paddingBottom:8}}><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Focus score</div><div style={{fontFamily:"var(--serif)",fontSize:22,color:"var(--matrix)",textShadow:"0 0 10px var(--matrix-glow)"}}>{R.focusScore} <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--ink3)"}}>↑{R.focusScore-R.prevScore}</span></div></div>
        </div>
        <div className="prog" style={{height:4,marginBottom:4}}><div className="prog-fill" style={{width:`${Math.min(100,pct)}%`,background:pct>=100?"var(--matrix)":"var(--amber)",boxShadow:pct>=100?"0 0 8px var(--matrix-glow)":"none"}}/></div>
        <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",display:"flex",justifyContent:"space-between"}}><span>Top: {R.topCat} — {R.topCatH}h</span><span>Peak: {R.peakDay} — {R.peakH}h</span></div>
      </div>
      <div className="card mb4" style={{marginBottom:14}}>
        <div className="clabel">AI observations</div>
        {R.insights.map((ins,i)=>(
          <div key={i} className="insight-row">
            <div className={`insight-icon ${ins.type}`}>{ins.type==="pattern"?"◎":ins.type==="risk"?"▲":"✓"}</div>
            <p style={{fontSize:12,color:"var(--ink2)",lineHeight:1.65,flex:1}}>{ins.text}</p>
          </div>
        ))}
      </div>
      <div className="card-pro mb4" style={{marginBottom:14}}>
        <div className="clabel">Next week — AI recommendation</div>
        <p style={{fontSize:13,color:"var(--ink)",lineHeight:1.7,fontStyle:"italic",fontFamily:"var(--serif)"}}>"{R.nextWeekSuggestion}"</p>
      </div>
      <div className="card">
        <div className="clabel">12-week heatmap</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",filter:"blur(2px)",opacity:.4,pointerEvents:"none",marginBottom:10}}>
          {Array.from({length:84}).map((_,i)=><div key={i} style={{width:11,height:11,borderRadius:2,background:Math.random()>.4?`rgba(0,230,118,${(Math.random()*.6+.2).toFixed(2)})`:"var(--high)"}}/>)}
        </div>
        <div style={{textAlign:"center"}}><button className="btn btn-amber btn-sm">Export full report →</button></div>
      </div>
    </div>
  );
}

// ─── ACCOUNTABILITY ───────────────────────────────────────────────────────────
function AccountabilityPage({ commits, setCommits, addToast }) {
  const toggleCommit = id => setCommits(cs=>cs.map(c=>c.id===id?{...c,done:!c.done}:c));
  const weekPct = Math.round((ME.weekHours/ME.weekGoal)*100);
  const partnerPct = Math.round((PARTNER.weekHours/PARTNER.weekGoal)*100);
  return (
    <div className="page">
      <div className="ph">
        <div className="flex ic jb" style={{flexWrap:"wrap",gap:10}}>
          <div><div className="pt">Accountability</div><div className="ps-sub">Partner system · mutual stakes · weekly commitments</div></div>
          <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--amber)",border:"1px solid rgba(245,158,11,.28)",borderRadius:3,padding:"3px 8px"}}>PRO</span>
        </div>
      </div>
      <div className="partner-card mb4" style={{marginBottom:14}}>
        <div className="partner-head">
          <div className="avatar lg live">{PARTNER.avatar}</div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"var(--ink)"}}>{PARTNER.handle}</div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--matrix)",marginTop:1}}>● Live now · {PARTNER.streak}d streak</div></div>
          <button className="btn btn-ghost btn-xs">Message</button>
        </div>
        <div className="partner-body">
          <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Shared goal</div>
          <div style={{fontSize:13,color:"var(--ink)",fontWeight:600,marginBottom:14}}>"{PARTNER.sharedGoal}"</div>
          <div className="two-col" style={{gap:10,marginBottom:4}}>
            <div><div style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--ink3)",letterSpacing:2,marginBottom:5}}>YOU · {ME.weekHours}h / {ME.weekGoal}h</div><div className="prog" style={{height:5,marginBottom:3}}><div className="prog-fill" style={{width:`${weekPct}%`,background:weekPct>=100?"var(--matrix)":"var(--amber)",boxShadow:weekPct>=100?"0 0 6px var(--matrix-glow)":"none"}}/></div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)"}}>{weekPct}%</div></div>
            <div><div style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--ink3)",letterSpacing:2,marginBottom:5}}>THEM · {PARTNER.weekHours}h / {PARTNER.weekGoal}h</div><div className="prog" style={{height:5,marginBottom:3}}><div className="prog-fill" style={{width:`${partnerPct}%`,background:partnerPct>=100?"var(--matrix)":"var(--blue)"}}/></div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)"}}>{partnerPct}%</div></div>
          </div>
          <div style={{marginTop:14,padding:"9px 12px",background:"var(--raised)",borderRadius:"var(--r2)",fontFamily:"var(--mono)",fontSize:10,color:"var(--ink3)"}}>If either misses weekly goal → both lose <span style={{color:"var(--red)"}}>100✦</span>. Hit it together → both earn <span style={{color:"var(--matrix)"}}>50✦</span>.</div>
        </div>
      </div>
      <div className="card mb4" style={{marginBottom:14}}>
        <div className="flex ic jb" style={{marginBottom:12}}><div className="clabel" style={{marginBottom:0}}>Commitments this week</div><span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)"}}>{commits.filter(c=>c.done).length}/{commits.length}</span></div>
        {commits.map(c=>(
          <div key={c.id} className="commit-row">
            <div className={`commit-check ${c.done?"done":""}`} onClick={()=>{toggleCommit(c.id);addToast(c.done?"Unchecked":"Done ✓");}}>
              {c.done&&"✓"}
            </div>
            <div style={{fontSize:13,color:c.done?"var(--ink3)":"var(--ink)",textDecoration:c.done?"line-through":"none",flex:1}}>{c.text}</div>
          </div>
        ))}
        <button className="btn btn-ghost btn-xs" style={{marginTop:10}} onClick={()=>addToast("Added")}>+ Add commitment</button>
      </div>
      <div className="card-pro">
        <div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--ink)",marginBottom:5}}>Find an accountability partner</div>
        <div style={{fontSize:12,color:"var(--ink2)",lineHeight:1.65,marginBottom:14}}>Matched by skill level and category. Shared weekly goals, live tracking, and mutual Shard stakes.</div>
        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          {[{label:"Skill level",val:"Intermediate"},{label:"Top category",val:"Coding"},{label:"Goal range",val:"15–25h/wk"}].map(m=>(
            <div key={m.label} style={{background:"var(--raised)",border:"1px solid var(--border)",borderRadius:"var(--r2)",padding:"8px 12px"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--ink3)",letterSpacing:1.5,marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{m.val}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-amber" onClick={()=>addToast("Matching you with a partner…")}>Find my match →</button>
      </div>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function ProfilePage({ me, xpPct, sessions }) {
  const [tab, setTab] = useState("stats");
  const BADGES=[{icon:"⚡",earned:true,l:"First 10h"},{icon:"👑",earned:true,l:"Weekly Champ"},{icon:"🧠",earned:true,l:"Deep Work"},{icon:"🔥",earned:true,l:"30d Streak"},{icon:"🌸",earned:true,l:"Spring"},{icon:"💯",earned:false,l:"100h"},{icon:"⚔",earned:false,l:"Duel Champ"},{icon:"🏆",earned:false,l:"Event Win"}];
  const POW = POW_PROFILE;
  return (
    <div className="page">
      <div className="ph">
        <div className="flex ic gap3" style={{flexWrap:"wrap",gap:14}}>
          <div className="avatar xl" style={{border:"1px solid var(--amber)"}}>{me.avatar}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"var(--serif)",fontSize:24,color:"var(--ink)",letterSpacing:"-.5px"}}>{me.handle}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginTop:3}}>{me.guild} · Level {me.level} · {me.hours}h total</div>
            <div className="prog" style={{height:2,maxWidth:220,marginTop:8}}><div className="prog-fill" style={{width:`${xpPct}%`,background:"var(--ink)"}}/></div>
            <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginTop:3}}>{me.xp}/{me.xpCap} XP</div>
          </div>
          <button className="btn btn-ghost btn-sm">Edit</button>
        </div>
      </div>
      <div className="sg mb4" style={{marginBottom:14}}>
        <div className="sb"><div className="sl">Hours</div><div className="sv">{Math.floor(me.hours)}</div></div>
        <div className="sb"><div className="sl">Streak</div><div className="sv amber">{me.streak}d</div></div>
        <div className="sb"><div className="sl">Shards</div><div className="sv">{me.shards}✦</div></div>
        <div className="sb"><div className="sl">Rank</div><div className="sv">#{me.rank}</div></div>
      </div>
      <div className="flex gap1 mb4" style={{marginBottom:14}}>
        {["stats","proof","badges"].map(t=><button key={t} className={`btn btn-xs ${tab===t?"btn-primary":"btn-ghost"}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
      </div>
      {tab==="stats"&&<>
        <div className="two-col mb4" style={{marginBottom:14}}>
          <div className="card"><div className="clabel">This week</div><div className="bar-chart">{WEEKLY_DATA.map((d,i)=><div key={d.day} className="bar-col"><div className={`bar ${i===4?"today":""}`} style={{height:`${(d.h/8)*100}%`}}/><span className="bar-lbl">{d.day}</span></div>)}</div></div>
          <div className="card"><div className="clabel">Week goal</div><div style={{fontFamily:"var(--serif)",fontSize:38,color:"var(--ink)",lineHeight:1,marginBottom:8}}>{Math.round((me.weekHours/me.weekGoal)*100)}<span style={{fontSize:16,color:"var(--ink3)",fontFamily:"var(--sans)"}}>%</span></div><div className="prog" style={{height:3}}><div className="prog-fill" style={{width:`${Math.round((me.weekHours/me.weekGoal)*100)}%`,background:"var(--amber)"}}/></div></div>
        </div>
        <div><div className="flex ic jb mb3" style={{marginBottom:8}}><span className="clabel" style={{marginBottom:0}}>Sessions</span><button className="btn btn-ghost btn-xs">Export</button></div><div className="sess-cards">{sessions.map(s=><SCard key={s.id} s={s}/>)}</div></div>
      </>}
      {tab==="proof"&&(
        <div className="card-verified mb4" style={{marginBottom:14}}>
          <div className="flex ic jb" style={{marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div><div className="clabel" style={{marginBottom:4}}>Verified proof of work</div><span className="pow-badge gold">◎ Gold certified</span></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"var(--serif)",fontSize:36,color:"var(--matrix)",lineHeight:1,textShadow:"0 0 16px var(--matrix-glow)"}}>{POW.totalVerifiedH}h</div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginTop:2}}>verified since {POW.since}</div></div>
          </div>
          {POW.categories.map(c=>(
            <div key={c.name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
              <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink2)",width:70,flexShrink:0}}>{c.name}</div>
              <div className="prog" style={{height:3,flex:1}}><div className="prog-fill" style={{width:`${(c.h/POW.totalVerifiedH)*100}%`,background:c.verified?"var(--matrix)":"var(--ink4)",boxShadow:c.verified?"0 0 4px var(--matrix-glow)":"none"}}/></div>
              <div style={{fontFamily:"var(--mono)",fontSize:9,color:c.verified?"var(--matrix)":"var(--ink3)",width:30,textAlign:"right"}}>{c.h}h</div>
            </div>
          ))}
          <div className="pow-share-box" style={{marginTop:16,border:"1px solid var(--matrix-mid)"}}>
            <span className="pow-url">{POW.shareUrl}</span>
            <button className="btn btn-ghost btn-xs">Copy</button>
            <button className="btn btn-matrix btn-xs">Share</button>
          </div>
          <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginTop:9,lineHeight:1.6}}>Hours cryptographically stamped and independently auditable.</div>
        </div>
      )}
      {tab==="badges"&&<div className="card"><div className="clabel">Badges — {BADGES.filter(b=>b.earned).length}/{BADGES.length}</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{BADGES.map((b,i)=><div key={i} title={b.l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,width:56}}><div style={{width:40,height:40,borderRadius:"var(--r2)",background:b.earned?"var(--raised)":"var(--high)",border:b.earned?"1px solid var(--border2)":"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,opacity:b.earned?1:.18,transition:"transform .12s",cursor:"default"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{b.icon}</div><div style={{fontFamily:"var(--mono)",fontSize:7,color:"var(--ink3)",textAlign:"center",lineHeight:1.3}}>{b.l}</div></div>)}</div></div>}
    </div>
  );
}

// ─── SHOP ────────────────────────────────────────────────────────────────────
function ShopPage({ me, shopTab, setShopTab, addToast, onUpgradeToPro }) {
  const PRO_VALUE=[
    { icon:"◎", title:"AI Weekly Report", desc:"Every Monday — what worked, what didn't, what to fix. A real coach in your pocket.", color:"amber-top" },
    { icon:"◇", title:"Accountability Partner", desc:"Matched by level and category. Shared goals, live tracking, mutual Shard stakes.", color:"green-top" },
    { icon:"○", title:"Proof of Work", desc:"Shareable, verified record of your hours. Show employers, clients, or anyone.", color:"blue-top" },
  ];
  return (
    <div className="page">
      <div className="ph"><div className="pt">Pro &amp; <em>Shop</em></div><div className="ps-sub">Real value for paying members</div></div>
      <div className="flex gap1 mb4" style={{marginBottom:16,flexWrap:"wrap"}}>
        {["pro","shards","cosmetics","battlepass"].map(t=><button key={t} className={`btn btn-xs ${shopTab===t?"btn-primary":"btn-ghost"}`} onClick={()=>setShopTab(t)}>{t==="battlepass"?"Battle Pass":t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
      </div>
      {shopTab==="pro"&&<>
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>What you actually get</div>
          <div className="pro-value-grid">
            {PRO_VALUE.map((v,i)=><div key={i} className={`pv-card ${v.color}`}><div className="pv-icon">{v.icon}</div><div className="pv-title">{v.title}</div><div className="pv-desc">{v.desc}</div></div>)}
          </div>
        </div>
        <div className="pricing-grid">
          <div className="pc"><div className="pc-name">Free</div><div className="pc-price">£0 <span>forever</span></div><div className="divider"/>{[[true,"Timer + session logging"],[true,"Daily leaderboards"],[true,"3 duels/week"],[true,"Guild membership"],[false,"AI weekly report"],[false,"Accountability partner"],[false,"Proof of work profile"],[false,"Unlimited duels"],[false,"Premium events"],[false,"Battle Pass"]].map(([ok,f],i)=><div key={i} className="pf-row"><span className={ok?"pf-check":"pf-cross"}>{ok?"✓":"—"}</span>{f}</div>)}</div>
          <div className="pc pro-card"><div className="pro-tag">PRO</div><div className="pc-name">Pro</div><div className="pc-price">£6.99 <span>/mo</span></div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--amber)",marginBottom:4}}>or £59.99/yr — save 28%</div><div className="divider"/>{[[true,"AI weekly report + recommendations"],[true,"Accountability partner matching"],[true,"Verified proof of work profile"],[true,"Unlimited 1v1 duels"],[true,"Premium event entry"],[true,"Advanced heatmaps + export"],[true,"No ads"],[true,"Exclusive cosmetics"],[true,"Battle Pass access"]].map(([,f],i)=><div key={i} className="pf-row"><span className="pf-check">✓</span>{f}</div>)}<button className="btn btn-amber w100" style={{marginTop:14,width:"100%"}} onClick={()=>{if(onUpgradeToPro){onUpgradeToPro();}else{addToast("Upgrading to Pro…");}}}>Upgrade to Pro →</button></div>
        </div>
      </>}
      {shopTab==="shards"&&<>
        <div style={{marginBottom:10,fontSize:12,color:"var(--ink3)"}}>Earned by logging. <span style={{color:"var(--matrix)"}}>You have {me.shards}✦</span></div>
        <div className="shard-grid">{SHARD_PACKS.map((pp,i)=><div key={i} className={`shard-card ${pp.tag==="Popular"?"pop":""}`}>{pp.tag&&<div className="shard-tag">{pp.tag}</div>}<div className="shard-amt">{pp.shards.toLocaleString()}</div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)"}}>Shards</div>{pp.bonus&&<div className="shard-bonus">{pp.bonus}</div>}<div className="shard-price">{pp.price}</div><button className="btn btn-amber btn-xs w100" style={{marginTop:8,width:"100%"}} onClick={()=>addToast(`Purchased ${pp.shards} Shards`)}>Buy</button></div>)}</div>
        <div className="card"><div className="clabel">Earn free shards</div>{[["Log a verified session","Score ÷ 10"],["Win a duel","Opponent's stake"],["Top 3 daily","50/30/20✦"],["7-day challenge","100–500✦"],["Accountability goal","50✦ each"],["Refer a friend","200✦"]].map((e,i,arr)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<arr.length-1?"1px solid var(--border)":"none",fontSize:11}}><span style={{color:"var(--ink2)"}}>{e[0]}</span><span style={{fontFamily:"var(--mono)",color:"var(--amber)"}}>{e[1]}</span></div>)}</div>
      </>}
      {shopTab==="cosmetics"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
        {[{n:"Cyber Frame",c:200,i:"◈",o:false},{n:"Gold Username",c:500,i:"★",o:false},{n:"Matrix Theme",c:300,i:"◼",o:false},{n:"Neon Card",c:150,i:"◇",o:true},{n:"Spring Aura",c:400,i:"🌸",o:false,s:true},{n:"Obsidian",c:350,i:"⬛",o:false},{n:"Pro Verified",c:0,i:"✓",o:false,pr:true},{n:"Guild Banner",c:800,i:"⚑",o:false}].map((item,i)=><div key={i} style={{background:"var(--surface)",border:item.s?"1px solid rgba(244,114,182,.2)":item.o?"1px solid var(--matrix-mid)":"1px solid var(--border)",borderRadius:"var(--r3)",padding:12,textAlign:"center",cursor:"pointer",boxShadow:item.o?"0 0 12px var(--matrix-dim)":"none"}}><div style={{fontSize:22,marginBottom:6,opacity:item.o?1:.4}}>{item.i}</div><div style={{fontSize:11,fontWeight:600,color:item.s?"#f472b6":item.o?"var(--matrix)":"var(--ink)",marginBottom:3}}>{item.n}</div>{item.o&&<div style={{fontSize:8,color:"var(--matrix)",fontFamily:"var(--mono)"}}>OWNED</div>}{item.pr&&<button className="btn btn-amber btn-xs w100" style={{width:"100%"}}>Pro only</button>}{!item.o&&!item.pr&&<button className="btn btn-ghost btn-xs w100" style={{width:"100%"}} onClick={()=>addToast(`Purchased ${item.n}`)}>{item.c}✦</button>}</div>)}
      </div>}
      {shopTab==="battlepass"&&<div className="card"><div className="flex ic jb mb3" style={{marginBottom:12,flexWrap:"wrap",gap:8}}><div><div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--ink)"}}>Spring Battle Pass 2026</div><div style={{fontSize:11,color:"var(--ink3)",marginTop:2}}>8 tiers · unlock with XP · ends Mar 31</div></div><div style={{textAlign:"right"}}><div style={{fontFamily:"var(--serif)",fontSize:18,color:"var(--amber)"}}>£9.99</div><button className="btn btn-amber btn-sm" style={{marginTop:4}} onClick={()=>addToast("Battle Pass activated!")}>Activate</button></div></div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--ink3)",marginBottom:8}}>TIER 3 / 8 · 3,200 / 5,000 XP</div><div className="prog" style={{height:2,marginBottom:14}}><div className="prog-fill" style={{width:"64%",background:"var(--amber)"}}/></div><div className="bp-track">{BATTLE_PASS_TIERS.map((t,i)=><div key={i} className="bp-tier"><div className="bp-tier-n">{t.tier}</div><div className={`bp-gem ${t.done?"done":""}`}>{t.done?"★":"·"}</div><div className="bp-reward">{t.reward}</div></div>)}</div><div style={{marginTop:12,padding:"8px 12px",background:"var(--raised)",borderRadius:"var(--r2)",fontSize:11,color:"var(--ink3)"}}>Free: tiers 1–4. Pro: all 8 + XP boost.</div></div>}
    </div>
  );
}
