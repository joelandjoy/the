import * as THREE from 'three';
import type { Landmark } from '../world/World';

export type Temple = { id: string; name: string; outside: THREE.Vector3; inside: boolean; group: THREE.Group; shrine: THREE.Vector3 };

export class Temples {
  public temples: Temple[] = [];
  constructor(private scene: THREE.Scene, landmarks: Landmark[]) {
    for (const l of landmarks.filter((x) => x.kind === 'temple')) this.temples.push(this.createTemple(l));
  }

  private createTemple(l: Landmark): Temple {
    const group = new THREE.Group(); group.position.copy(l.position);
    const marble = new THREE.MeshStandardMaterial({ color: 0xe9e5dc, roughness: 0.75 });
    const trim = new THREE.MeshStandardMaterial({ color: 0xd5ad55, metalness: 0.4, roughness: 0.42 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(13, 5, 12), marble);
    wall.position.set(0, 2.5, 0); wall.castShadow = true; wall.receiveShadow = true;
    // Doorway is represented by a dark front entrance panel; this first prototype switches scenes on interaction.
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(3.1, 3.4, 0.18), new THREE.MeshStandardMaterial({ color: 0x4c453b }));
    entrance.position.set(0, 1.7, 6.08); group.add(wall, entrance);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(8.5, 2.6, 4), trim);
    roof.position.y = 6.2; roof.rotation.y = Math.PI / 4; roof.castShadow = true; group.add(roof);
    const sign = this.label(l.name);
    sign.position.set(0, 8.1, 0); group.add(sign);

    // Shrine arrangement is a stylized respectful reference, not a photogrammetric copy.
    const shrineGroup = new THREE.Group();
    const platform = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.65, 2.2), marble);
    platform.position.set(0, 0.45, -2.6); platform.castShadow = true; shrineGroup.add(platform);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.12, 8, 28), trim);
    halo.position.set(0, 2.0, -3.25); shrineGroup.add(halo);
    for (let i = -1; i <= 1; i++) {
      const idolMat = new THREE.MeshStandardMaterial({ color: l.id === 'parshwanath' ? 0x3a3430 : 0xe5dfd1, roughness: 0.55, metalness: 0.08 });
      const idol = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), idolMat); seat.scale.set(1, 0.72, 0.78); seat.position.y = 1.12; idol.add(seat);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 10), idolMat); head.position.y = 1.75; idol.add(head);
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.29, 0.65, 4, 8), idolMat); body.position.y = 1.45; idol.add(body);
      idol.position.set(i * 1.55, 0, -3.0); shrineGroup.add(idol);
    }
    for (let i = 0; i < 5; i++) {
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), trim);
      bell.position.set(-2 + i, 3.8, 2.6); shrineGroup.add(bell);
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6), trim);
      cord.position.set(-2 + i, 4.1, 2.6); shrineGroup.add(cord);
    }
    group.add(shrineGroup);
    this.scene.add(group);
    return { id: l.id, name: l.name, outside: l.position.clone(), inside: false, group, shrine: new THREE.Vector3(0, 0, -3) };
  }

  private label(text: string): THREE.Sprite {
    const c = document.createElement('canvas'); c.width = 512; c.height = 80;
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#31271a'; ctx.fillRect(0, 0, 512, 80);
    ctx.fillStyle = '#fff5d6'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center'; ctx.fillText(text, 256, 49);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c) }));
    s.scale.set(8, 1.25, 1); return s;
  }

  enter(temple: Temple): void {
    temple.inside = true;
    // Keep the player in a dedicated interior coordinate space; hide outside temple shell to reveal room layout.
    temple.group.visible = false;
  }
  exit(temple: Temple): void { temple.inside = false; temple.group.visible = true; }
  buildInterior(temple: Temple): THREE.Group {
    const room = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ color: 0xdad6ce, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; room.add(floor);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1eee6 });
    for (const [x, z, w, d] of [[0,-8,16,0.35], [0,8,16,0.35], [-8,0,0.35,16], [8,0,0.35,16]] as number[][]) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(w, 4.5, d), wallMat); h.position.set(x, 2.25, z); room.add(h);
    }
    const gold = new THREE.MeshStandardMaterial({ color: 0xc9a348, metalness: 0.35, roughness: 0.5 });
    const platform = new THREE.Mesh(new THREE.BoxGeometry(7, 0.55, 2), new THREE.MeshStandardMaterial({ color: 0xe7e2d7 }));
    platform.position.set(0, 0.3, -4.7); room.add(platform);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.12, 8, 32), gold); halo.position.set(0, 2.05, -5.4); room.add(halo);
    for (let i = -1; i <= 1; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: temple.id === 'parshwanath' ? 0x393330 : 0xe4ded0, roughness: 0.5 });
      const idol = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.7, 4, 10), mat); body.position.y = 1.25; idol.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 10), mat); head.position.y = 1.95; idol.add(head);
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 0.85), gold); base.position.y = 0.3; idol.add(base);
      idol.position.set(i * 1.8, 0, -5.1); room.add(idol);
    }
    for (let i = 0; i < 5; i++) {
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), gold); bell.position.set(-3 + i * 1.5, 3.6, 0); room.add(bell);
    }
    const light = new THREE.PointLight(0xffe7b3, 12, 22); light.position.set(0, 3.8, -2); room.add(light);
    room.position.set(temple.outside.x, 0, temple.outside.z);
    return room;
  }
}
