import * as THREE from 'three';
import type { Landmark } from '../world/World';

export class Missions {
  private index = 0;
  private steps: Array<{ title: string; hint: string; target: string }> = [];
  constructor(landmarks: Landmark[]) {
    this.steps = [
      { title: 'Explore the neighborhood', hint: 'Walk to Tanki School', target: 'school' },
      { title: 'Visit Big Jain Mandir', hint: 'Approach the temple and press E', target: 'big-temple' },
      { title: 'Visit Parshwanath Jain Mandir', hint: 'Travel across the neighborhood', target: 'parshwanath' },
      { title: 'Prototype route complete!', hint: 'You explored both temple landmarks', target: 'done' }
    ];
    void landmarks;
  }
  get current() { return this.steps[Math.min(this.index, this.steps.length - 1)]; }
  update(position: THREE.Vector3, landmarks: Landmark[]): boolean {
    if (this.current.target === 'done') return false;
    const target = landmarks.find((l) => l.id === this.current.target);
    if (target && position.distanceTo(target.position) < 7) {
      this.index = Math.min(this.index + 1, this.steps.length - 1);
      return true;
    }
    return false;
  }
}
