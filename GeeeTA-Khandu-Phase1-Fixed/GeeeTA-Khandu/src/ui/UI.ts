import * as THREE from 'three';
import type { Landmark } from '../world/World';
import { Missions } from '../missions/Missions';

export class UI {
  private interaction = document.querySelector<HTMLElement>('#interaction')!;
  private toastEl = document.querySelector<HTMLElement>('#toast')!;
  private objective = document.querySelector<HTMLElement>('#objective')!;
  private hint = document.querySelector<HTMLElement>('#mission-hint')!;
  private mode = document.querySelector<HTMLElement>('#mode')!;
  private speed = document.querySelector<HTMLElement>('#speed')!;
  private minimap = document.querySelector<HTMLCanvasElement>('#minimap')!;
  private ctx = this.minimap.getContext('2d')!;
  private toastTimer = 0;

  constructor(private landmarks: Landmark[], private missions: Missions) {
    document.querySelector('#resume')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('game-resume')));
    document.querySelector('#restart')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('game-restart')));
    document.querySelector('#audio-toggle')?.addEventListener('change', (e) => {
      window.dispatchEvent(new CustomEvent('game-audio', { detail: (e.target as HTMLInputElement).checked }));
    });
    if (window.matchMedia('(max-width: 760px)').matches) {
      document.querySelector('#mobile-controls')?.classList.remove('hidden');
      document.querySelector('#help')?.classList.add('hidden');
    }
  }

  update(position: THREE.Vector3, vehicle: boolean, speed: number, nearby: string | null, paused: boolean): void {
    this.objective.textContent = this.missions.current.title;
    this.hint.textContent = this.missions.current.hint;
    this.mode.textContent = vehicle ? 'DRIVING' : 'ON FOOT';
    this.speed.textContent = vehicle ? `${speed} km/h` : '';
    this.interaction.classList.toggle('hidden', !nearby || paused);
    if (nearby) this.interaction.innerHTML = `Press <kbd>E</kbd> — ${nearby}`;
    this.drawMap(position);
    document.querySelector('#pause')?.classList.toggle('hidden', !paused);
  }

  toast(message: string): void {
    this.toastEl.textContent = message; this.toastEl.classList.remove('hidden'); this.toastTimer = 3;
  }

  tick(dt: number): void {
    if (this.toastTimer > 0) { this.toastTimer -= dt; if (this.toastTimer <= 0) this.toastEl.classList.add('hidden'); }
  }

  private drawMap(player: THREE.Vector3): void {
    const c = this.ctx; const w = this.minimap.width; const h = this.minimap.height;
    c.clearRect(0, 0, w, h); c.fillStyle = '#1d2b31'; c.fillRect(0, 0, w, h);
    const scale = 0.72;
    const px = (x: number) => w / 2 + x * scale;
    const pz = (z: number) => h / 2 + z * scale;
    c.strokeStyle = '#66747a'; c.lineWidth = 6;
    const roads = [[-95,0,95,0],[0,-95,0,95],[-65,-40,65,-40],[-60,42,65,42],[-42,-95,-42,95],[42,-95,42,95],[-95,72,95,72],[-95,-72,95,-72]];
    for (const [x1,z1,x2,z2] of roads) { c.beginPath(); c.moveTo(px(x1),pz(z1)); c.lineTo(px(x2),pz(z2)); c.stroke(); }
    this.landmarks.forEach((l) => {
      c.fillStyle = l.kind === 'temple' ? '#e9c46a' : '#8ecf9a';
      c.beginPath(); c.moveTo(px(l.position.x), pz(l.position.z)-5); c.lineTo(px(l.position.x)+5,pz(l.position.z)); c.lineTo(px(l.position.x),pz(l.position.z)+5); c.lineTo(px(l.position.x)-5,pz(l.position.z)); c.closePath(); c.fill();
    });
    c.fillStyle = '#58d9ff'; c.beginPath(); c.arc(px(player.x), pz(player.z), 4.5, 0, Math.PI*2); c.fill();
    c.strokeStyle = '#58d9ff'; c.lineWidth = 1.5; c.stroke();
  }
}
