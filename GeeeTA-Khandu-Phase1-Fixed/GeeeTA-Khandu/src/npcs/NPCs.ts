import * as THREE from 'three';

type Pedestrian = { mesh: THREE.Group; direction: THREE.Vector3; timer: number; speed: number };

export class NPCs {
  private people: Pedestrian[] = [];
  constructor(private scene: THREE.Scene, count = 10) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Group();
      const shirt = new THREE.MeshStandardMaterial({ color: [0xc45d42, 0x416b9d, 0x7b8b4c, 0xd0a64d][i % 4] });
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.55, 3, 6), shirt);
      body.position.y = 1.05; body.castShadow = true; mesh.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), new THREE.MeshStandardMaterial({ color: 0xa97856 }));
      head.position.y = 1.62; mesh.add(head);
      const x = ((i * 17) % 105) - 52;
      const z = ((i * 29) % 125) - 62;
      mesh.position.set(x, 0, z); this.scene.add(mesh);
      this.people.push({ mesh, direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(), timer: 1 + Math.random() * 4, speed: 1.0 + Math.random() * 0.5 });
    }
  }

  update(dt: number): void {
    for (const p of this.people) {
      p.timer -= dt;
      if (p.timer <= 0) {
        p.direction.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        p.timer = 1.5 + Math.random() * 4;
      }
      p.mesh.position.addScaledVector(p.direction, p.speed * dt);
      if (Math.abs(p.mesh.position.x) > 88) p.direction.x *= -1;
      if (Math.abs(p.mesh.position.z) > 88) p.direction.z *= -1;
      p.mesh.rotation.y = Math.atan2(p.direction.x, p.direction.z);
    }
  }
}
