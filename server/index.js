import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import { CATEGORIES, VALUES, PUZZLES, tileKey } from './puzzles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Puzzle pool. There can be MANY puzzles per (category, value); each game we
// "roll" one active puzzle per tile, avoiding the one used last time so a
// reset / rematch isn't the same questions.
// ---------------------------------------------------------------------------
const bank = [...PUZZLES]; // grows when the host pastes new questions
const active = new Map(); // tileKey -> chosen puzzle for this game
const lastUsed = new Map(); // tileKey -> phrase last shown (avoid repeats)
const CELL_COUNT = CATEGORIES.length * VALUES.length;

const poolFor = (cat, val) => bank.filter((p) => p.category === cat && p.value === val);

function rollActive() {
  for (const cat of CATEGORIES) {
    for (const val of VALUES) {
      const key = tileKey(cat, val);
      const pool = poolFor(cat, val);
      if (!pool.length) {
        active.delete(key);
        continue;
      }
      let choices = pool;
      const prev = lastUsed.get(key);
      if (pool.length > 1 && prev) {
        const filtered = pool.filter((p) => p.phrase !== prev);
        if (filtered.length) choices = filtered;
      }
      active.set(key, choices[Math.floor(Math.random() * choices.length)]);
    }
  }
}
rollActive();
const findActive = (cat, val) => active.get(tileKey(cat, val));

// ---------------------------------------------------------------------------
// Game state (the server is the single source of truth)
// ---------------------------------------------------------------------------
const game = {
  phase: 'lobby', // lobby | board | round | roundOver
  teams: new Map(), // id -> { id, name, score }
  players: new Map(), // socketId -> { id, name, teamId, ready }
  used: new Set(), // tileKey of solved/finished tiles
  pickerTeamId: null,
  message: 'Scan the QR code to join a team!',
  round: null,
};

const hosts = new Set(); // socketIds allowed to run host controls
const isHost = (socket) => hosts.has(socket.id);
let teamSeq = 0;

function normalize(s) {
  return String(s || '')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function lanIp() {
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const net of iface || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}
const JOIN_URL = `http://${lanIp()}:${PORT}/play`;

function teamList() {
  return [...game.teams.values()].map((t) => ({
    id: t.id,
    name: t.name,
    score: t.score,
    players: [...game.players.values()].filter((p) => p.teamId === t.id).map((p) => ({ name: p.name, ready: p.ready })),
  }));
}

function allReady() {
  const ps = [...game.players.values()];
  return ps.length > 0 && ps.every((p) => p.ready) && game.teams.size >= 1;
}

function maskedTiles(phrase, revealed, showAll) {
  return [...phrase].map((ch) => {
    if (ch === ' ') return { char: ' ', space: true, revealed: true };
    const shown = showAll || revealed.has(ch);
    return { char: shown ? ch : '', space: false, revealed: shown };
  });
}

function poolCounts() {
  const counts = {};
  for (const cat of CATEGORIES) for (const val of VALUES) counts[tileKey(cat, val)] = poolFor(cat, val).length;
  return counts;
}

function publicState() {
  const r = game.round;
  let round = null;
  if (r) {
    const showAll = game.phase === 'roundOver';
    let secondsLeft = null;
    if (r.deadline != null) secondsLeft = Math.max(0, Math.ceil((r.deadline - Date.now()) / 1000));
    else if (r.remaining != null) secondsLeft = Math.max(0, Math.ceil(r.remaining / 1000));
    round = {
      category: r.category,
      value: r.value,
      clue: r.clue || '',
      partOfSpeech: r.partOfSpeech || '',
      definition: r.definition || '',
      example: r.example || '',
      tiles: maskedTiles(r.phrase, r.revealed, showAll),
      buzzedTeamId: r.buzzedTeamId,
      buzzedPlayerId: r.buzzedPlayerId,
      lockedTeamIds: [...r.locked],
      answer: showAll ? r.phrase : null,
      winnerTeamId: r.winnerTeamId || null,
      secondsLeft,
    };
  }
  return {
    phase: game.phase,
    joinUrl: JOIN_URL,
    categories: CATEGORIES,
    values: VALUES,
    poolCounts: poolCounts(),
    teams: teamList(),
    used: [...game.used],
    pickerTeamId: game.pickerTeamId,
    allReady: allReady(),
    message: game.message,
    round,
  };
}

let io;
const broadcast = () => io.emit('state', publicState());

// Auto-return to the board a few seconds after a round ends.
const ADVANCE_MS = 4500;
let advanceTimer = null;
function goToBoard() {
  game.round = null;
  game.phase = 'board';
  game.message = game.used.size >= CELL_COUNT ? 'Board cleared! 🏆' : 'Pick a tile.';
}
function scheduleAdvance() {
  clearTimeout(advanceTimer);
  advanceTimer = setTimeout(() => {
    goToBoard();
    broadcast();
  }, ADVANCE_MS);
}
function cancelAdvance() {
  clearTimeout(advanceTimer);
  advanceTimer = null;
}

// Per-puzzle countdown. Pauses while a team is answering; on 0 the answer is
// revealed and the game auto-advances so a stumper never stalls the board.
const ROUND_MS = 45000;
function tick() {
  if (game.phase !== 'round' || !game.round || game.round.deadline == null) return;
  if (Date.now() >= game.round.deadline) {
    const r = game.round;
    r.deadline = null;
    game.phase = 'roundOver';
    game.used.add(tileKey(r.category, r.value));
    game.message = `⏰ Time's up! The answer was ${r.phrase}.`;
    scheduleAdvance();
  }
  broadcast();
}

// ---------------------------------------------------------------------------
// Rounds
// ---------------------------------------------------------------------------
function startRound(category, value) {
  const p = findActive(category, value);
  if (!p || game.used.has(tileKey(category, value))) return;
  cancelAdvance();
  lastUsed.set(tileKey(category, value), p.phrase); // remember for next roll

  const letters = [...new Set([...p.phrase].filter((c) => c !== ' '))];
  const revealCount = Math.max(1, Math.round(letters.length * 0.18));
  const revealed = new Set();
  const shuffled = [...letters].sort(() => Math.random() - 0.5);
  for (let i = 0; i < revealCount; i++) revealed.add(shuffled[i]);

  game.round = {
    category,
    value,
    phrase: p.phrase,
    clue: p.clue,
    partOfSpeech: p.partOfSpeech,
    definition: p.definition,
    example: p.example,
    revealed,
    buzzedTeamId: null,
    buzzedPlayerId: null,
    locked: new Set(), // teams locked out after a wrong guess (cleared once all have missed)
    partialTeams: new Set(), // teams that already received a letter bonus this round
    winnerTeamId: null,
    deadline: Date.now() + ROUND_MS, // countdown end (null = paused)
    remaining: null, // ms left, stored while paused
  };
  game.phase = 'round';
  game.message = 'Puzzle is up — buzz in to answer!';
  broadcast();
}

function correctLetterPoints(guess, answer) {
  const g = normalize(guess).replace(/ /g, '');
  const a = normalize(answer).replace(/ /g, '');
  let hits = 0;
  for (let i = 0; i < Math.min(g.length, a.length); i++) if (g[i] === a[i]) hits++;
  return hits * 2;
}

const everyTeamLocked = () =>
  game.teams.size > 0 && [...game.teams.keys()].every((id) => game.round.locked.has(id));

// ---------------------------------------------------------------------------
// Pasting new questions (host only) — appends to the pool for variety
// ---------------------------------------------------------------------------
function applyContent(text) {
  let src = String(text || '').trim();
  if (!src) throw new Error('Nothing pasted.');
  src = src.replace(/^\s*(export\s+)?const\s+[\w$]+\s*=\s*/, '').replace(/;\s*$/, '');
  if (!src.startsWith('[')) src = '[' + src.replace(/,\s*$/, '') + ']';
  let arr;
  try {
    arr = Function('"use strict"; return (' + src + ')')();
  } catch {
    throw new Error('Could not read that. Paste tile objects like the example.');
  }
  if (!Array.isArray(arr)) throw new Error('Expected a list of tiles.');

  let added = 0;
  for (const e of arr) {
    if (!e || !CATEGORIES.includes(e.category) || !VALUES.includes(Number(e.value)) || typeof e.phrase !== 'string') continue;
    const phrase = normalize(e.phrase);
    if (!phrase) continue;
    if (bank.some((b) => b.category === e.category && b.value === Number(e.value) && b.phrase === phrase)) continue;
    bank.push({
      category: e.category,
      value: Number(e.value),
      phrase,
      clue: e.clue || '',
      partOfSpeech: e.partOfSpeech || '',
      definition: e.definition || '',
      example: e.example || '',
    });
    added++;
  }
  if (!added) throw new Error('No new valid tiles found.');
  rollActive();
  return { added, total: bank.length };
}

// ---------------------------------------------------------------------------
// HTTP + Socket.IO
// ---------------------------------------------------------------------------
const app = express();
const browserDir = path.join(__dirname, '..', 'dist', 'game-app', 'browser');
app.use(express.static(browserDir));
app.get(/.*/, (_req, res) => res.sendFile(path.join(browserDir, 'index.html')));

const server = http.createServer(app);
io = new Server(server, { cors: { origin: '*' } });
setInterval(tick, 1000); // drives the per-puzzle countdown

io.on('connection', (socket) => {
  socket.emit('state', publicState());

  // ----- Player (phone) -----
  socket.on('player:join', ({ playerName, teamName }, ack) => {
    const name = String(playerName || '').trim().slice(0, 20) || 'Player';
    const tName = String(teamName || '').trim().slice(0, 24);
    if (!tName) return ack && ack({ ok: false, error: 'Enter a team name.' });

    let team = [...game.teams.values()].find((t) => t.name.toLowerCase() === tName.toLowerCase());
    if (!team) {
      team = { id: `t${++teamSeq}`, name: tName, score: 0 };
      game.teams.set(team.id, team);
    }
    game.players.set(socket.id, { id: socket.id, name, teamId: team.id, ready: false });
    ack && ack({ ok: true, playerId: socket.id, teamId: team.id });
    game.message = `${name} joined ${team.name}.`;
    broadcast();
  });

  socket.on('player:setReady', (ready) => {
    const p = game.players.get(socket.id);
    if (!p) return;
    p.ready = !!ready;
    broadcast();
  });

  socket.on('player:buzz', () => {
    const p = game.players.get(socket.id);
    if (!p || game.phase !== 'round' || !game.round) return;
    if (game.round.buzzedTeamId || game.round.locked.has(p.teamId)) return;
    game.round.buzzedTeamId = p.teamId;
    game.round.buzzedPlayerId = socket.id;
    // Pause the countdown while they type.
    if (game.round.deadline != null) {
      game.round.remaining = Math.max(0, game.round.deadline - Date.now());
      game.round.deadline = null;
    }
    const team = game.teams.get(p.teamId);
    game.message = `${team?.name || 'A team'} buzzed in! ${p.name} is answering…`;
    broadcast();
  });

  socket.on('player:answer', ({ text }, ack) => {
    const p = game.players.get(socket.id);
    if (!p || !game.round || game.round.buzzedPlayerId !== socket.id) return;
    const team = game.teams.get(p.teamId);
    if (normalize(text) === normalize(game.round.phrase)) {
      [...game.round.phrase].forEach((c) => c !== ' ' && game.round.revealed.add(c));
      team.score += game.round.value;
      game.round.winnerTeamId = team.id;
      game.round.deadline = null;
      game.phase = 'roundOver';
      game.used.add(tileKey(game.round.category, game.round.value));
      game.pickerTeamId = team.id;
      game.message = `✅ ${team.name} got it: ${game.round.phrase} (+${game.round.value})`;
      scheduleAdvance();
      ack && ack({ ok: true, correct: true });
    } else {
      // Wrong — lock out this team and open the buzzer to the OTHER teams.
      let partial = 0;
      if (!game.round.partialTeams.has(team.id)) {
        partial = correctLetterPoints(text, game.round.phrase);
        team.score += partial;
        game.round.partialTeams.add(team.id);
      }
      game.round.locked.add(team.id);
      game.round.buzzedTeamId = null;
      game.round.buzzedPlayerId = null;
      // Resume the countdown.
      game.round.deadline = Date.now() + (game.round.remaining ?? ROUND_MS);
      game.round.remaining = null;
      const closeMsg = partial > 0 ? ` So close — +${partial} for correct letters!` : '';
      if (everyTeamLocked()) {
        // Everyone has had a turn — reopen to all so play continues.
        game.round.locked.clear();
        game.message = `❌ ${team.name} missed it.${closeMsg} Everyone has tried — buzzers open for all again!`;
      } else {
        game.message = `❌ ${team.name} missed it.${closeMsg} Open to the other teams — buzz in!`;
      }
      ack && ack({ ok: true, correct: false, partial });
    }
    broadcast();
  });

  // ----- Host (big screen) — gated behind host:register -----
  socket.on('host:register', () => {
    hosts.add(socket.id);
    socket.emit('state', publicState());
  });

  socket.on('host:start', () => {
    if (!isHost(socket) || game.phase !== 'lobby') return;
    rollActive();
    game.phase = 'board';
    game.pickerTeamId = [...game.teams.keys()][0] || null;
    game.message = 'Pick a tile to begin!';
    broadcast();
  });

  socket.on('host:pickTile', ({ category, value }) => {
    if (!isHost(socket) || game.phase !== 'board') return;
    startRound(category, value);
  });

  socket.on('host:surprise', () => {
    if (!isHost(socket) || game.phase !== 'board') return;
    const cells = [];
    for (const cat of CATEGORIES)
      for (const val of VALUES) {
        const key = tileKey(cat, val);
        if (!game.used.has(key) && active.has(key)) cells.push({ cat, val });
      }
    if (!cells.length) return;
    const c = cells[Math.floor(Math.random() * cells.length)];
    startRound(c.cat, c.val);
  });

  socket.on('host:revealLetter', () => {
    if (!isHost(socket) || !game.round || game.phase !== 'round') return;
    const hidden = [...new Set([...game.round.phrase].filter((c) => c !== ' ' && !game.round.revealed.has(c)))];
    if (!hidden.length) return;
    game.round.revealed.add(hidden[Math.floor(Math.random() * hidden.length)]);
    game.message = 'Host revealed a letter.';
    broadcast();
  });

  // Manual override — lets the host run the game if a phone crashes.
  socket.on('host:awardWin', ({ teamId }) => {
    if (!isHost(socket) || !game.round || game.phase !== 'round') return;
    const team = game.teams.get(teamId);
    if (!team) return;
    [...game.round.phrase].forEach((c) => c !== ' ' && game.round.revealed.add(c));
    team.score += game.round.value;
    game.round.winnerTeamId = team.id;
    game.round.deadline = null;
    game.phase = 'roundOver';
    game.used.add(tileKey(game.round.category, game.round.value));
    game.pickerTeamId = team.id;
    game.message = `✅ ${team.name} wins ${game.round.phrase} (+${game.round.value})`;
    scheduleAdvance();
    broadcast();
  });

  socket.on('host:adjustScore', ({ teamId, delta }) => {
    if (!isHost(socket)) return;
    const team = game.teams.get(teamId);
    if (!team) return;
    team.score += Number(delta) || 0;
    broadcast();
  });

  socket.on('host:revealAnswer', () => {
    if (!isHost(socket) || !game.round) return;
    game.phase = 'roundOver';
    game.used.add(tileKey(game.round.category, game.round.value));
    game.message = `The answer was ${game.round.phrase}.`;
    scheduleAdvance();
    broadcast();
  });

  socket.on('host:nextRound', () => {
    if (!isHost(socket)) return;
    game.round = null;
    game.phase = 'board';
    game.message = game.used.size >= CELL_COUNT ? 'Board cleared! 🏆' : 'Pick a tile.';
    broadcast();
  });

  // Reset — clear points but keep teams and stay on the board.
  socket.on('host:clearPoints', () => {
    if (!isHost(socket)) return;
    cancelAdvance();
    rollActive(); // fresh questions — avoids repeating what was just played
    game.used = new Set();
    game.teams.forEach((t) => (t.score = 0));
    game.round = null;
    game.phase = 'board';
    game.pickerTeamId = [...game.teams.keys()][0] || null;
    game.message = 'Points cleared with fresh questions! Pick a tile.';
    broadcast();
  });

  // Reset — full restart: wipe teams & players, everyone rejoins from the lobby.
  socket.on('host:returnToLobby', () => {
    if (!isHost(socket)) return;
    cancelAdvance();
    rollActive();
    game.used = new Set();
    game.teams.clear();
    game.players.clear();
    game.round = null;
    game.phase = 'lobby';
    game.pickerTeamId = null;
    game.message = 'Back in the lobby — scan the QR code to join a team!';
    io.emit('resetIdentity'); // send phones back to the join screen
    broadcast();
  });

  socket.on('host:loadContent', ({ text }, ack) => {
    if (!isHost(socket)) return ack && ack({ ok: false, error: 'Only the host screen can add questions.' });
    try {
      const r = applyContent(text);
      game.message = `Loaded ${r.added} new question${r.added > 1 ? 's' : ''}! Pool is now ${r.total} tiles.`;
      broadcast();
      ack && ack({ ok: true, ...r });
    } catch (e) {
      ack && ack({ ok: false, error: e.message });
    }
  });

  socket.on('disconnect', () => {
    game.players.delete(socket.id);
    hosts.delete(socket.id);
    broadcast();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  🎉 Jepo-RobNyolds server running!');
  console.log(`  Host screen:  http://${lanIp()}:${PORT}`);
  console.log(`  Players join: ${JOIN_URL}\n`);
});
