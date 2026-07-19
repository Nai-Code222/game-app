import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

export interface TeamView {
  id: string;
  name: string;
  score: number;
  players: { name: string; ready: boolean }[];
}

export interface RoundTile {
  char: string;
  space: boolean;
  revealed: boolean;
}

export interface RoundView {
  category: string;
  value: number;
  clue: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  tiles: RoundTile[];
  buzzedTeamId: string | null;
  buzzedPlayerId: string | null;
  lockedTeamIds: string[];
  answer: string | null;
  winnerTeamId: string | null;
  secondsLeft: number | null;
}

export interface GameState {
  phase: 'lobby' | 'board' | 'round' | 'roundOver';
  joinUrl: string;
  categories: string[];
  values: number[];
  poolCounts: Record<string, number>;
  teams: TeamView[];
  used: string[];
  pickerTeamId: string | null;
  allReady: boolean;
  message: string;
  round: RoundView | null;
}

const EMPTY: GameState = {
  phase: 'lobby',
  joinUrl: '',
  categories: [],
  values: [],
  poolCounts: {},
  teams: [],
  used: [],
  pickerTeamId: null,
  allReady: false,
  message: 'Connecting…',
  round: null,
};

@Injectable({ providedIn: 'root' })
export class Realtime {
  private readonly socket: Socket = io({ transports: ['websocket', 'polling'] });
  readonly state = signal<GameState>(EMPTY);
  readonly connected = signal(false);

  /** This phone's identity, once joined. */
  readonly playerId = signal<string | null>(null);
  readonly teamId = signal<string | null>(null);

  private hostMode = false;

  constructor() {
    this.socket.on('connect', () => {
      this.connected.set(true);
      if (this.hostMode) this.socket.emit('host:register'); // re-register after reconnect
    });
    this.socket.on('disconnect', () => this.connected.set(false));
    this.socket.on('state', (s: GameState) => this.state.set(s));
    // Host returned everyone to the lobby — forget our team/identity.
    this.socket.on('resetIdentity', () => {
      this.playerId.set(null);
      this.teamId.set(null);
    });
  }

  /** Claim this browser as a host (allowed to run host controls). */
  becomeHost() {
    this.hostMode = true;
    this.socket.emit('host:register');
  }

  // ---- Player actions ----
  join(playerName: string, teamName: string): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit('player:join', { playerName, teamName }, (res: any) => {
        if (res?.ok) {
          this.playerId.set(res.playerId);
          this.teamId.set(res.teamId);
        }
        resolve(res ?? { ok: false, error: 'No response' });
      });
    });
  }

  setReady(ready: boolean) {
    this.socket.emit('player:setReady', ready);
  }

  buzz() {
    this.socket.emit('player:buzz');
  }

  answer(text: string): Promise<{ correct: boolean; partial?: number }> {
    return new Promise((resolve) => {
      this.socket.emit('player:answer', { text }, (res: any) => resolve(res ?? { correct: false }));
    });
  }

  // ---- Host actions ----
  hostStart() {
    this.socket.emit('host:start');
  }
  hostPickTile(category: string, value: number) {
    this.socket.emit('host:pickTile', { category, value });
  }
  hostSurprise() {
    this.socket.emit('host:surprise');
  }
  hostAwardWin(teamId: string) {
    this.socket.emit('host:awardWin', { teamId });
  }
  hostAdjustScore(teamId: string, delta: number) {
    this.socket.emit('host:adjustScore', { teamId, delta });
  }
  hostRevealLetter() {
    this.socket.emit('host:revealLetter');
  }
  hostRevealAnswer() {
    this.socket.emit('host:revealAnswer');
  }
  hostNextRound() {
    this.socket.emit('host:nextRound');
  }
  hostClearPoints() {
    this.socket.emit('host:clearPoints');
  }
  hostReturnToLobby() {
    this.socket.emit('host:returnToLobby');
  }
  hostLoadContent(text: string): Promise<{ ok: boolean; added?: number; total?: number; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit('host:loadContent', { text }, (res: any) => resolve(res ?? { ok: false, error: 'No response' }));
    });
  }
}
