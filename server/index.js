import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import { CATEGORIES, VALUES, PUZZLES, findPuzzle, tileKey } from './puzzles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

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

/** Build the masked board tiles for the current phrase. */
function maskedTiles(phrase, revealed, showAll) {
  return [...phrase].map((ch) => {
    if (ch === ' ') return { char: ' ', space: true, revealed: true };
    const shown = showAll || revealed.has(ch);
    return { char: shown ? ch : '', space: false, revealed: shown };
  });
}

function publicState() {
  const r = game.round;
  let round = null;
  if (r) {
    const showAll = game.phase === 'roundOver';
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
    };
  }
  return {
    phase: game.phase,
    joinUrl: JOIN_URL,
    categories: CATEGORIES,
    values: VALUES,
    teams: teamList(),
    used: [...game.used],
    pickerTeamId: game.pickerTeamId,
    allReady: allReady(),
    message: game.message,
    round,
  };
}

let io;
function broadcast() {
  io.emit('state', publicState());
}

// ---------------------------------------------------------------------------
// Round helpers
// ---------------------------------------------------------------------------
function startRound(category, value) {
  const p = findPuzzle(category, value);
  if (!p || game.used.has(tileKey(category, value))) return;

  // Reveal a few letters up front ("bits and pieces").
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
    locked: new Set(),
    winnerTeamId: null,
  };
  game.phase = 'round';
  game.message = 'Puzzle is up — buzz in to answer!';
  broadcast();
}

function correctLetterPoints(guess, answer) {
  const g = normalize(guess).replace(/ /g, '');
  const a = normalize(answer).replace(/ /g, '');
  let hits = 0;
  for (let i = 0; i < Math.min(g.length, a.length); i++) {
    if (g[i] === a[i]) hits++;
  }
  return hits * 2;
}

function everyTeamLocked() {
  return game.teams.size > 0 && [...game.teams.keys()].every((id) => game.round.locked.has(id));
}

// ---------------------------------------------------------------------------
// HTTP + Socket.IO
// ---------------------------------------------------------------------------
const app = express();
const browserDir = path.join(__dirname, '..', 'dist', 'game-app', 'browser');
app.use(express.static(browserDir));
// SPA fallback (Express 5 / path-to-regexp v6 safe splat)
app.get(/.*/, (_req, res) => res.sendFile(path.join(browserDir, 'index.html')));

const server = http.createServer(app);
io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.emit('state', publicState());

  // ----- Player (phone) -----
  socket.on('player:join', ({ playerName, teamName }, ack) => {
    const name = String(playerName || '').trim().slice(0, 20) || 'Player';
    const tName = String(teamName || '').trim().slice(0, 24);
    if (!tName) return ack && ack({ ok: false, error: 'Enter a team name.' });

    // Find existing team by name (case-insensitive) or create it.
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
    const team = game.teams.get(p.teamId);
    game.message = `${team?.name || 'A team'} buzzed in! ${p.name} is answering…`;
    broadcast();
  });

  socket.on('player:answer', ({ text }, ack) => {
    const p = game.players.get(socket.id);
    if (!p || !game.round || game.round.buzzedPlayerId !== socket.id) return;
    const team = game.teams.get(p.teamId);
    if (normalize(text) === normalize(game.round.phrase)) {
      // Correct — reveal all, award value.
      [...game.round.phrase].forEach((c) => c !== ' ' && game.round.revealed.add(c));
      team.score += game.round.value;
      game.round.winnerTeamId = team.id;
      game.phase = 'roundOver';
      game.used.add(tileKey(game.round.category, game.round.value));
      game.pickerTeamId = team.id;
      game.message = `✅ ${team.name} got it: ${game.round.phrase} (+${game.round.value})`;
      ack && ack({ ok: true, correct: true });
    } else {
      // Wrong — award 2 points per correct letter, lock team out, reopen buzzers.
      const partial = correctLetterPoints(text, game.round.phrase);
      team.score += partial;
      game.round.locked.add(team.id);
      game.round.buzzedTeamId = null;
      game.round.buzzedPlayerId = null;
      const closeMsg = partial > 0 ? ` So close — +${partial} for correct letters!` : '';
      if (everyTeamLocked()) {
        game.phase = 'roundOver';
        game.used.add(tileKey(game.round.category, game.round.value));
        game.message = `Nobody solved it. The answer was ${game.round.phrase}.${closeMsg}`;
      } else {
        game.message = `❌ ${team.name} missed it.${closeMsg} Buzzers are open again!`;
      }
      ack && ack({ ok: true, correct: false, partial });
    }
    broadcast();
  });

  // ----- Host (big screen) -----
  socket.on('host:start', () => {
    if (game.phase !== 'lobby') return;
    game.phase = 'board';
    game.pickerTeamId = [...game.teams.keys()][0] || null;
    game.message = 'Pick a tile to begin!';
    broadcast();
  });

  socket.on('host:pickTile', ({ category, value }) => {
    if (game.phase !== 'board') return;
    startRound(category, value);
  });

  socket.on('host:revealLetter', () => {
    if (!game.round || game.phase !== 'round') return;
    const hidden = [...new Set([...game.round.phrase].filter((c) => c !== ' ' && !game.round.revealed.has(c)))];
    if (!hidden.length) return;
    game.round.revealed.add(hidden[Math.floor(Math.random() * hidden.length)]);
    game.message = 'Host revealed a letter.';
    broadcast();
  });

  socket.on('host:revealAnswer', () => {
    if (!game.round) return;
    game.phase = 'roundOver';
    game.used.add(tileKey(game.round.category, game.round.value));
    game.message = `The answer was ${game.round.phrase}.`;
    broadcast();
  });

  socket.on('host:nextRound', () => {
    game.round = null;
    game.phase = game.used.size >= PUZZLES.length ? 'board' : 'board';
    game.message = game.used.size >= PUZZLES.length ? 'Board cleared! 🏆' : 'Pick a tile.';
    broadcast();
  });

  socket.on('host:resetGame', () => {
    game.used = new Set();
    game.teams.forEach((t) => (t.score = 0));
    game.round = null;
    game.phase = 'board';
    game.pickerTeamId = [...game.teams.keys()][0] || null;
    game.message = 'New game! Pick a tile.';
    broadcast();
  });

  socket.on('disconnect', () => {
    game.players.delete(socket.id);
    broadcast();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  🎉 Jepo-Roberts-Reynolds server running!');
  console.log(`  Host screen:  http://${lanIp()}:${PORT}`);
  console.log(`  Players join: ${JOIN_URL}\n`);
});
