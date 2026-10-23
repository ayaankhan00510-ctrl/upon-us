/**
 * Impostor Protocol - Camera Controller
 * Supports Third-Person over-the-shoulder follow with wall collision avoidance and First-Person toggle (V key).
 */

import * as THREE from 'three';
import { lineIntersectsWalls } from '../../shared/physics';

export type CameraViewMode = 'third_person' | 'first_person';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public mode: CameraViewMode = 'third_person';

  // Orbit angles & distance
  public angleH: number = 0; // horizontal yaw
  public angleV: number = 0.42; // vertical pitch (~24 degrees)
  public distance: number = 5.8;

  // Settings
  public sensitivity: number = 0.005;
  public enableHeadBob: boolean = true;
  private headBobTimer: number = 0;

  // Pointers & Drag
  private isDragging: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.setupListeners();
  }

  public toggleViewMode(): CameraViewMode {
    this.mode = this.mode === 'third_person' ? 'first_person' : 'third_person';
    return this.mode;
  }

  private setupListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyV' && !e.repeat) {
        this.toggleViewMode();
      }
    });

    window.addEventListener('pointerdown', (e) => {
      // Right click or left click drag
      this.isDragging = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      this.rotate(dx, dy);
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    window.addEventListener(
      'wheel',
      (e) => {
        if (this.mode === 'third_person') {
          this.distance = Math.max(3.0, Math.min(8.5, this.distance + e.deltaY * 0.005));
        }
      },
      { passive: true }
    );
  }

  public rotate(dx: number, dy: number): void {
    this.angleH -= dx * this.sensitivity;
    if (this.mode === 'third_person') {
      this.angleV = Math.max(0.1, Math.min(1.2, this.angleV + dy * this.sensitivity));
    } else {
      // First person pitch (-60 to +60 degrees)
      this.angleV = Math.max(-1.1, Math.min(1.1, this.angleV - dy * this.sensitivity));
    }
  }

  public update(
    delta: number,
    targetPos: THREE.Vector3,
    isMoving: boolean
  ): void {
    if (this.mode === 'first_person') {
      // First person eye level (~1.15m above ground)
      let eyeY = targetPos.y + 1.15;

      if (this.enableHeadBob && isMoving) {
        this.headBobTimer += delta * 12;
        eyeY += Math.sin(this.headBobTimer) * 0.04;
      }

      this.camera.position.set(targetPos.x, eyeY, targetPos.z);

      // Look direction from angles
      const lookDist = 10;
      const lookX = targetPos.x - Math.sin(this.angleH) * Math.cos(this.angleV) * lookDist;
      const lookY = eyeY + Math.sin(this.angleV) * lookDist;
      const lookZ = targetPos.z - Math.cos(this.angleH) * Math.cos(this.angleV) * lookDist;

      this.camera.lookAt(lookX, lookY, lookZ);
    } else {
      // Third person follow
      const headPos = targetPos.clone().add(new THREE.Vector3(0, 1.1, 0));

      // Intended camera offset
      const cosV = Math.cos(this.angleV);
      const sinV = Math.sin(this.angleV);
      const sinH = Math.sin(this.angleH);
      const cosH = Math.cos(this.angleH);

      let effDist = this.distance;

      // Check line of sight against walls from head to intended camera position
      const idealX = headPos.x + sinH * cosV * this.distance;
      const idealZ = headPos.z + cosH * cosV * this.distance;

      const wallCheck = lineIntersectsWalls(headPos.x, headPos.z, idealX, idealZ);
      if (wallCheck.hit) {
        // Pull camera inside wall border with safety margin
        effDist = Math.max(1.2, this.distance * wallCheck.distanceRatio * 0.88);
      }

      const targetCamX = headPos.x + sinH * cosV * effDist;
      const targetCamY = headPos.y + sinV * effDist;
      const targetCamZ = headPos.z + cosH * cosV * effDist;

      // Smooth camera damp
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 12, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 12, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 12, delta);

      this.camera.lookAt(headPos);
    }
  }
}
