import * as THREE from 'three';
import { Input } from '../game/Input';
import { World } from '../world/World';

export class Vehicle {
  public root = new THREE.Group();
  public speed = 0;
  public occupied = false;
  private yaw = 0;
  private wheels: THREE.Mesh[] = [];
  private body: THREE.Mesh;
  private readonly maxSpeed = 22;

  constructor(private scene: THREE.Scene, private world: World, position: THREE.Vector3, color = 0xc94d3b) {
    const paint = new THREE.MeshStandardMaterial({ color, metalness: 0.15, roughness: 0.45 });
    this.body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.72, 4), paint);
    this.body.position.y = 0.72; this.body.castShadow = true; this.root.add(this.body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.65, 1.9), new THREE.MeshStandardMaterial({ color: 0x8fc2d4, roughness: 0.3, metalness: 0.1 }));
    cabin.position.set(0, 1.35, -0.15); cabin.castShadow = true; this.root.add(cabin);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x202327, roughness: 0.85 });
    for (const x of [-0.94, 0.94]) for (const z of [-1.3, 1.3]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.22, 12), wheelMat);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(x, 0.38, z); wheel.castShadow = true; this.root.add(wheel); this.wheels.push(wheel);
    }
    this.root.position.copy(position); scene.add(this.root);
  }

  update(dt: number, input: Input, camera: THREE.PerspectiveCamera): void {
    if (!this.occupied) return;
    const throttle = input.axis('KeyW', 'KeyS');
    if (throttle !== 0) this.speed += throttle * 15 * dt;
    else this.speed *= Math.pow(0.22, dt);
    if (input.isDown('Space')) this.speed *= Math.pow(0.04, dt);
    this.speed = THREE.MathUtils.clamp(this.speed, -8, this.maxSpeed);
    const steer = input.axis('KeyA', 'KeyD');
    if (Math.abs(this.speed) > 0.15) this.yaw += steer * 1.55 * dt * Math.sign(this.speed);
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const next = this.root.position.clone().addScaledVector(forward, this.speed * dt);
    if (!this.world.collides(next, 1.15)) this.root.position.copy(next);
    else this.speed *= -0.18;
    this.root.rotation.y = this.yaw;
    this.wheels.forEach((w) => { w.rotation.x += this.speed * dt; });
    const target = this.root.position.clone().add(new THREE.Vector3(0, 1.1, 0));
    const offset = new THREE.Vector3(Math.sin(this.yaw) * 9, 4.3, Math.cos(this.yaw) * 9);
    camera.position.lerp(target.clone().add(offset), 1 - Math.pow(0.001, dt));
    camera.lookAt(target);
  }

  get position(): THREE.Vector3 { return this.root.position; }
  get speedKmh(): number { return Math.round(Math.abs(this.speed) * 3.6); }
  enter(): void { this.occupied = true; this.speed = 0; }
  exit(): void { this.occupied = false; this.speed = 0; }
}
