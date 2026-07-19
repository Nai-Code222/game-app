import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Realtime } from '../services/realtime';

@Component({
  selector: 'app-player',
  templateUrl: './player.html',
  styleUrl: './player.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Player {
  protected readonly rt = inject(Realtime);
  protected readonly state = this.rt.state;

  protected readonly playerName = signal('');
  protected readonly teamName = signal('');
  protected readonly joinError = signal('');
  protected readonly joining = signal(false);

  protected readonly answerText = signal('');
  protected readonly feedback = signal('');

  constructor() {
    // When the host sends us back to the lobby, clear our local join state.
    effect(() => {
      if (this.rt.playerId() === null) {
        this.myReady.set(false);
        this.answerText.set('');
        this.feedback.set('');
        this.joinError.set('');
      }
    });
  }

  protected readonly joined = computed(() => this.rt.playerId() !== null);
  protected readonly myReady = signal(false);

  protected readonly myTeam = computed(() =>
    this.state().teams.find((t) => t.id === this.rt.teamId()) ?? null,
  );

  protected readonly isMyBuzz = computed(() => {
    const r = this.state().round;
    return !!r && r.buzzedPlayerId === this.rt.playerId();
  });

  protected readonly buzzOpen = computed(() => {
    const s = this.state();
    if (s.phase !== 'round' || !s.round) return false;
    if (s.round.buzzedTeamId) return false;
    return !s.round.lockedTeamIds.includes(this.rt.teamId() ?? '');
  });

  protected readonly myTeamLocked = computed(() => {
    const r = this.state().round;
    return !!r && r.lockedTeamIds.includes(this.rt.teamId() ?? '');
  });

  async submitJoin(): Promise<void> {
    const name = this.playerName().trim();
    const team = this.teamName().trim();
    if (!name || !team) {
      this.joinError.set('Enter your name and a team.');
      return;
    }
    this.joining.set(true);
    const res = await this.rt.join(name, team);
    this.joining.set(false);
    if (!res.ok) this.joinError.set(res.error ?? 'Could not join.');
  }

  pickExisting(name: string): void {
    this.teamName.set(name);
  }

  toggleReady(): void {
    const next = !this.myReady();
    this.myReady.set(next);
    this.rt.setReady(next);
  }

  buzz(): void {
    this.feedback.set('');
    this.rt.buzz();
  }

  async sendAnswer(): Promise<void> {
    const text = this.answerText().trim();
    if (!text) return;
    const res = await this.rt.answer(text);
    this.answerText.set('');
    this.feedback.set(
      res.correct ? '✅ Correct!' : res.partial ? `❌ Not it — but +${res.partial} for correct letters` : '❌ Not it',
    );
  }
}
