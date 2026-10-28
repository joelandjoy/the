import * as THREE from 'three';

export type Landmark = { id: string; name: string; position: THREE.Vector3; kind: 'school' | 'temple' | 'ground' | 'shop' };

export class World {
  public scene = new THREE.Scene();
  public landmarks: Landmark[] = [];
  public colliders: THREE.Box3[] = [];
  public roadSegments: Array<[number, number, number, number]> = [];
  private buildingMaterial = new THREE.MeshStandardMaterial({ color: 0xc8b69a, roughness: 0.94 });
  private roadMaterial = new THREE.MeshStandardMaterial({ color: 0x353b40, roughness: 1 });
  private groundMaterial = new THREE.MeshStandardMaterial({ color: 0x7f9a6d, roughness: 1 });

  build(): void {
    this.scene.background = new THREE.Color(0x9bc7e3);
    this.scene.fog = new THREE.Fog(0x9bc7e3, 95, 230);
    const hemi = new THREE.HemisphereLight(0xe5f3ff, 0x6a5a42, 2.1);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0d2, 2.3);
    sun.position.set(-45, 70, 35);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -90; sun.shadow.camera.right = 90;
    sun.shadow.camera.top = 90; sun.shadow.camera.bottom = -90;
    this.scene.add(sun);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), this.groundMaterial);
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.08; ground.receiveShadow = true;
    this.scene.add(ground);

    // Placeholder street grid. Replace with verified, licensed road geometry before claiming map accuracy.
    const roads: Array<[number, number, number, number]> = [
      [-95, 0, 95, 0], [0, -95, 0, 95], [-65, -40, 65, -40], [-60, 42, 65, 42],
      [-42, -95, -42, 95], [42, -95, 42, 95], [-95, 72, 95, 72], [-95, -72, 95, -72]
    ];
    this.roadSegments = roads;
    for (const [x1, z1, x2, z2] of roads) {
      const horizontal = Math.abs(z2 - z1) < 0.01;
      const length = horizontal ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
      const road = new THREE.Mesh(new THREE.PlaneGeometry(horizontal ? length : 8, horizontal ? 8 : length), this.roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.position.set((x1 + x2) / 2, 0.005, (z1 + z2) / 2);
      road.receiveShadow = true; this.scene.add(road);
      const line = new THREE.Mesh(new THREE.PlaneGeometry(horizontal ? length : 0.12, horizontal ? 0.12 : length),
        new THREE.MeshBasicMaterial({ color: 0xd9d2a5 }));
      line.rotation.x = -Math.PI / 2; line.position.set((x1 + x2) / 2, 0.015, (z1 + z2) / 2);
      this.scene.add(line);
    }

    this.addLandmark('school', 'Tanki School', -12, 12, 'school');
    this.addLandmark('big-temple', 'Big Jain Mandir', 28, 27, 'temple');
    this.addLandmark('parshwanath', 'Parshwanath Jain Mandir', 30, -25, 'temple');
    this.addLandmark('school-ground', 'Higher Secondary Ground*', -35, -28, 'ground');
    this.addLandmark('market', 'Neighborhood Shops', 12, -4, 'shop');

    // Residential blocks and small shopfronts, placed as illustrative environment art.
    const blocks = [
      [-65, -55, 14, 12], [-67, -18, 16, 12], [-66, 20, 16, 12], [-65, 56, 16, 12],
      [-20, -56, 12, 12], [-18, -17, 12, 12], [-18, 56, 12, 12],
      [20, -57, 12, 12], [65, -56, 14, 12], [65, -17, 14, 12], [66, 20, 14, 12], [65, 56, 14, 12],
      [55, -3, 14, 10], [-65, 88, 14, 10], [68, 88, 14, 10]
    ];
    blocks.forEach(([x, z, w, d], i) => this.addBuilding(x, z, w, d, i));
    this.addLabel('KHANDU COLONY · PROTOTYPE MAP', 0, 0, -102);
  }

  private addLandmark(id: string, name: string, x: number, z: number, kind: Landmark['kind']): void {
    const position = new THREE.Vector3(x, 0, z);
    this.landmarks.push({ id, name, position, kind });
    if (kind === 'temple') return; // Temple module supplies the actual building.
    const colors: Record<Landmark['kind'], number> = { school: 0xe5b64c, temple: 0xe7dfd2, ground: 0x4c985b, shop: 0xb9784c };
    const w = kind === 'ground' ? 24 : kind === 'school' ? 20 : 12;
    const d = kind === 'ground' ? 19 : kind === 'school' ? 14 : 10;
    const building = new THREE.Mesh(new THREE.BoxGeometry(w, kind === 'ground' ? 0.25 : 5, d),
      new THREE.MeshStandardMaterial({ color: colors[kind], roughness: 0.9 }));
    building.position.set(x, kind === 'ground' ? 0.1 : 2.5, z);
    building.castShadow = true; building.receiveShadow = true; this.scene.add(building);
    if (kind !== 'ground') this.addLabel(name, x, 0, z - d / 2 - 2);
    if (kind === 'school') {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 0.6, d + 1), new THREE.MeshStandardMaterial({ color: 0xb65b42 }));
      roof.position.set(x, 5.3, z); roof.castShadow = true; this.scene.add(roof);
    }
  }

  private addBuilding(x: number, z: number, w: number, d: number, seed: number): void {
    const h = 4 + (seed % 4) * 1.1;
    const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.buildingMaterial);
    building.position.set(x, h / 2, z); building.castShadow = true; building.receiveShadow = true; this.scene.add(building);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3),
      new THREE.MeshStandardMaterial({ color: seed % 2 ? 0x9f6b4e : 0xeee0c8 }));
    roof.position.set(x, h + 0.12, z); roof.castShadow = true; this.scene.add(roof);
    const box = new THREE.Box3().setFromObject(building);
    this.colliders.push(box);
  }

  addLabel(text: string, x: number, y: number, z: number): void {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(18,29,35,0.83)'; ctx.roundRect(4, 4, 504, 88, 16); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 48, 480);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.position.set(x, y + 8, z); sprite.scale.set(13, 2.45, 1); this.scene.add(sprite);
  }

  collides(position: THREE.Vector3, radius = 0.6): boolean {
    const test = new THREE.Box3(
      new THREE.Vector3(position.x - radius, 0, position.z - radius),
      new THREE.Vector3(position.x + radius, 3, position.z + radius)
    );
    return this.colliders.some((box) => box.intersectsBox(test));
  }
}
