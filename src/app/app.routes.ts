import { Routes } from '@angular/router';
import { Host } from './host/host';
import { Player } from './player/player';

export const routes: Routes = [
  { path: '', component: Host, data: { controls: false } }, // clean game view
  { path: 'host', component: Host, data: { controls: true } }, // control panel
  { path: 'play', component: Player },
];
