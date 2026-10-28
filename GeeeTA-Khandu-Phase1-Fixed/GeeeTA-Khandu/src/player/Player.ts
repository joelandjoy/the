import * as THREE from 'three';
import { Input } from '../game/Input';
import { World } from '../world/World';

export class Player {
  public root = new THREE.Group();
  public position = new THREE.Vector3(-12, 0, 4);
  public yaw = 0;
  public inVehicle = false;
  private velocityY = 0;
  private onGround = true;
  private body: THREE.Group;
  private cameraYaw = Math.PI;
  private cameraPitch = 0.23;

  constructor(private scene: THREE.Scene, private world: World) {
    this.body = this.makeCharacter();
    this.root.add(this.body); this.root.position.copy(this.position); scene.add(this.root);
  }

  private makeCharacter(): THREE.Group {
    const g = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: 0xa76d4e, roughness: 0.9 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0x2b7d87, roughness: 0.8 });
    const pants = new THREE.MeshStandardMaterial({ color: 0x29364a, roughness: 0.9 });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.55, 4, 8), shirt);
    torso.position.y = 1.15; torso.castShadow = true; g.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), skin);
    head.position.y = 1.83; head.castShadow = true; g.add(head);
    for (const x of [-0.16, 0.16]) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.45, 3, 6), pants);
      leg.position.set(x, 0.42, 0); leg.castShadow = true; g.add(leg);
    }
    return g;
  }

  update(dt: number, input: Input, camera: THREE.PerspectiveCamera): void {
    if (this.inVehicle) return;
    this.cameraYaw -= input.mouseDeltaX * 0.004;
    this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch + input.mouseDeltaY * 0.003, -0.05, 0.75);
    const forwardInput = input.axis('KeyW', 'KeyS');
    const sideInput = input.axis('KeyD', 'KeyA');
    const running = input.isDown('ShiftLeft') || input.isDown('ShiftRight');
    const speed = running ? 10 : 5.5;
    const direction = new THREE.Vector3(sideInput, 0, -forwardInput);
    if (direction.lengthSq() > 0) {
      direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);
      const next = this.position.clone().addScaledVector(direction, speed * dt);
      if (!this.world.collides(new THREE.Vector3(next.x, 0, this.position.z))) this.position.x = next.x;
      if (!this.world.collides(new THREE.Vector3(this.position.x, 0, next.z))) this.position.z = next.z;
      this.yaw = Math.atan2(direction.x, direction.z);
      this.body.rotation.y = this.yaw;
    }
    if (input.consume('Space') && this.onGround) { this.velocityY = 7.3; this.onGround = false; }
    this.velocityY -= 19 * dt; this.position.y += this.velocityY * dt;
    if (this.position.y <= 0) { this.position.y = 0; this.velocityY = 0; this.onGround = true; }
    this.root.position.copy(this.position);

    const target = this.position.clone().add(new THREE.Vector3(0, 1.3, 0));
    const distance = 7.8;
    const offset = new THREE.Vector3(Math.sin(this.cameraYaw) * distance, 2.4 + this.cameraPitch * 3, Math.cos(this.cameraYaw) * distance);
    camera.position.lerp(target.clone().add(offset), 1 - Math.pow(0.001, dt));
    camera.lookAt(target);
  }

  getInteractionPosition(): THREE.Vector3 { return this.position.clone().add(new THREE.Vector3(0, 1, 0)); }
  setVisible(visible: boolean): void { this.root.visible = visible; }
  setPosition(position: THREE.Vector3): void { this.position.copy(position); this.root.position.copy(position); }
}
