export class Input {
  private down = new Set<string>();
  private pressed = new Set<string>();
  private mouseDown = false;
  private lastX = 0;
  public mouseDeltaX = 0;
  public mouseDeltaY = 0;
  public pointerLocked = false;

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      if (!this.down.has(e.code)) this.pressed.add(e.code);
      this.down.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => this.down.clear());
    canvas.addEventListener('mousedown', (e) => { this.mouseDown = true; this.lastX = e.clientX; });
    window.addEventListener('mouseup', () => { this.mouseDown = false; });
    window.addEventListener('mousemove', (e) => {
      if (this.mouseDown) {
        this.mouseDeltaX += e.clientX - this.lastX;
        this.mouseDeltaY += e.movementY || 0;
        this.lastX = e.clientX;
      }
    });
    canvas.addEventListener('click', () => {
      if (window.matchMedia('(pointer:fine)').matches && document.pointerLockElement !== canvas) {
        // Orbit uses drag by default; pointer lock is intentionally not required.
      }
    });
    document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach((button) => {
      const key = button.dataset.key!;
      const press = (e: Event) => { e.preventDefault(); this.down.add(key); this.pressed.add(key); };
      const release = (e: Event) => { e.preventDefault(); this.down.delete(key); };
      button.addEventListener('pointerdown', press);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('pointerleave', release);
    });
    document.querySelector('#mobile-interact')?.addEventListener('click', () => this.pressed.add('KeyE'));
  }

  isDown(code: string): boolean { return this.down.has(code); }
  consume(code: string): boolean {
    const result = this.pressed.has(code);
    this.pressed.delete(code);
    return result;
  }
  consumeAny(codes: string[]): boolean {
    return codes.some((code) => this.consume(code));
  }
  axis(positive: string, negative: string): number {
    return Number(this.isDown(positive)) - Number(this.isDown(negative));
  }
  endFrame(): void {
    this.pressed.clear();
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
  }
}
