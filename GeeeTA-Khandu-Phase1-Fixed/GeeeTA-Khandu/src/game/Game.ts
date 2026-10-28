import * as THREE from 'three';
import { Input } from './Input';
import { World } from '../world/World';
import { Player } from '../player/Player';
import { Vehicle } from '../vehicles/Vehicle';
import { NPCs } from '../npcs/NPCs';
import { Temples, type Temple } from '../temples/Temples';
import { Missions } from '../missions/Missions';
import { UI } from '../ui/UI';

export class Game {
  private renderer: THREE.WebGLRenderer;
  private camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 450);
  private world = new World();
  private input: Input;
  private player!: Player;
  private car!: Vehicle;
  private npcs!: NPCs;
  private temples!: Temples;
  private missions!: Missions;
  private ui!: UI;
  private clock = new THREE.Clock();
  private paused = false;
  private currentTemple: Temple | null = null;
  private interior: THREE.Group | null = null;
  private audioEnabled = true;
  private frame = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.input = new Input(canvas);
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('game-resume', () => { this.paused = false; });
    window.addEventListener('game-pause-toggle', () => { this.paused = !this.paused; });
    window.addEventListener('game-restart', () => window.location.reload());
    window.addEventListener('game-audio', (e) => { this.audioEnabled = Boolean((e as CustomEvent).detail); });
  }

  async init(): Promise<void> {
    this.world.build();
    this.player = new Player(this.world.scene, this.world);
    this.player.setPosition(new THREE.Vector3(-12, 0, 4));
    this.car = new Vehicle(this.world.scene, this.world, new THREE.Vector3(-5, 0, -3));
    this.npcs = new NPCs(this.world.scene, 12);
    this.temples = new Temples(this.world.scene, this.world.landmarks);
    this.missions = new Missions(this.world.landmarks);
    this.ui = new UI(this.world.landmarks, this.missions);
    this.camera.position.set(-5, 5, 13);
    this.camera.lookAt(this.player.position);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  start(): void {
    const loop = () => {
      requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.04);
      if (!this.paused) this.update(dt);
      this.renderer.render(this.world.scene, this.camera);
      this.input.endFrame();
      this.frame++;
    };
    loop();
  }

  private update(dt: number): void {
    this.ui.tick(dt);
    if (this.input.consume('Escape')) this.paused = !this.paused;
    const position = this.activePosition();
    const nearby = this.getNearbyInteraction(position);
    if (this.input.consume('KeyE')) this.interact(nearby);
    if (this.car.occupied) {
      this.car.update(dt, this.input, this.camera);
      this.player.setPosition(this.car.position.clone().add(new THREE.Vector3(0, 0, 0)));
    } else if (!this.currentTemple) {
      this.player.update(dt, this.input, this.camera);
    } else {
      // Interior camera: constrained room view.
      this.player.update(dt, this.input, this.camera);
      const center = this.currentTemple.outside.clone();
      this.camera.position.lerp(center.clone().add(new THREE.Vector3(0, 8, 12)), 0.08);
      this.camera.lookAt(center.clone().add(new THREE.Vector3(0, 1, -1)));
    }
    this.npcs.update(dt);
    const active = this.activePosition();
    if (this.missions.update(active, this.world.landmarks)) this.ui.toast(this.missions.current.title);
    this.ui.update(active, this.car.occupied, this.car.speedKmh, this.getNearbyInteraction(active), this.paused);
  }

  private activePosition(): THREE.Vector3 {
    if (this.car.occupied) return this.car.position;
    return this.player.position;
  }

  private getNearbyInteraction(position: THREE.Vector3): string | null {
    if (this.currentTemple) {
      const shrinePosition = this.currentTemple.outside.clone().add(new THREE.Vector3(0, 0, -4.5));
      return position.distanceTo(shrinePosition) < 3.8 ? 'Perform respectful darshan' : 'Exit temple';
    }
    if (!this.car.occupied && position.distanceTo(this.car.position) < 3.6) return 'Enter vehicle';
    if (this.car.occupied) return 'Exit vehicle';
    for (const t of this.temples.temples) {
      if (position.distanceTo(t.outside) < 5.2) return `Enter ${t.name}`;
    }
    // Darshan point is reachable after entering a temple.
    return null;
  }

  private interact(action: string | null): void {
    if (!action) return;
    if (this.currentTemple) {
      const shrinePosition = this.currentTemple.outside.clone().add(new THREE.Vector3(0, 0, -4.5));
      if (this.player.position.distanceTo(shrinePosition) < 3.8) {
        this.ui.toast('You pause for a respectful darshan.');
      } else {
        this.exitTemple();
      }
      return;
    }
    if (action === 'Enter vehicle') {
      this.car.enter(); this.player.setVisible(false); this.ui.toast('Vehicle acquired. Drive carefully.');
      return;
    }
    if (action === 'Exit vehicle') {
      this.car.exit(); this.player.setVisible(true);
      this.player.setPosition(this.car.position.clone().add(new THREE.Vector3(2, 0, 0)));
      this.ui.toast('You exited the vehicle.');
      return;
    }
    const temple = this.temples.temples.find((t) => action.includes(t.name));
    if (temple) this.enterTemple(temple);
  }

  private enterTemple(temple: Temple): void {
    this.currentTemple = temple;
    this.temples.enter(temple);
    this.interior = this.temples.buildInterior(temple);
    this.world.scene.add(this.interior);
    this.player.setPosition(temple.outside.clone().add(new THREE.Vector3(0, 0, 2)));
    this.player.setVisible(true);
    this.ui.toast(`${temple.name}: press E near the shrine for respectful darshan, or E again near the entrance to leave.`);
    // Place the player near room entrance; room and player use the same local world coordinates.
    this.player.setPosition(temple.outside.clone().add(new THREE.Vector3(0, 0, 5)));
  }

  private exitTemple(): void {
    if (!this.currentTemple) return;
    this.world.scene.remove(this.interior!);
    this.interior = null;
    this.temples.exit(this.currentTemple);
    this.player.setPosition(this.currentTemple.outside.clone().add(new THREE.Vector3(0, 0, 9)));
    this.currentTemple = null;
    this.ui.toast('You returned to the neighborhood.');
  }

  private resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
