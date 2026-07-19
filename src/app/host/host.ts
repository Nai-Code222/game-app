import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Realtime } from '../services/realtime';
import QRCode from 'qrcode';

@Component({
  selector: 'app-host',
  templateUrl: './host.html',
  styleUrl: './host.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Host {
  protected readonly rt = inject(Realtime);
  private readonly route = inject(ActivatedRoute);
  protected readonly state = this.rt.state;
  protected readonly qr = signal<string>('');

  /** true on /host (control panel), false on / (clean game view). */
  protected readonly controls = signal(this.route.snapshot.data['controls'] === true);

  // Paste-box state
  protected readonly showPaste = signal(false);
  protected readonly pasteText = signal('');
  protected readonly pasteMsg = signal('');
  protected readonly pasteOk = signal(false);

  // Reset menu state
  protected readonly showReset = signal(false);

  protected readonly teamName = (id: string | null) =>
    this.state().teams.find((t) => t.id === id)?.name ?? '';

  protected readonly buzzedName = computed(() => {
    const r = this.state().round;
    return r ? this.teamName(r.buzzedTeamId) : '';
  });

  constructor() {
    this.rt.becomeHost();

    // Regenerate the QR whenever the join URL arrives/changes.
    effect(() => {
      const url = this.state().joinUrl;
      if (!url) return;
      QRCode.toDataURL(url, { width: 260, margin: 1, color: { dark: '#10152e', light: '#ffffff' } })
        .then((data) => this.qr.set(data))
        .catch(() => this.qr.set(''));
    });
  }

  protected tileUsed(category: string, value: number): boolean {
    return this.state().used.includes(`${category}|${value}`);
  }

  protected poolCount(category: string, value: number): number {
    return this.state().poolCounts[`${category}|${value}`] ?? 0;
  }

  protected clearPoints(): void {
    this.rt.hostClearPoints();
    this.showReset.set(false);
  }

  protected returnToLobby(): void {
    this.rt.hostReturnToLobby();
    this.showReset.set(false);
  }

  protected async loadPaste(): Promise<void> {
    const res = await this.rt.hostLoadContent(this.pasteText());
    this.pasteOk.set(!!res.ok);
    if (res.ok) {
      this.pasteMsg.set(`✓ Added ${res.added} question${res.added === 1 ? '' : 's'} — pool is now ${res.total} tiles.`);
      this.pasteText.set('');
    } else {
      this.pasteMsg.set(res.error ?? 'Could not load.');
    }
  }
}
