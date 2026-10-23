/**
 * Impostor Protocol - Full 3D Game Scene
 * Manages 14-room spaceship, local player controller, remote player interpolation, and camera modes.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GameSettings } from '../../shared/constants';
import { GameStateSnapshot, PlayerSnapshot } from '../../shared/events';
import { detectRoom, getSpawnPosition } from '../../shared/mapData';
import { resolveWallCollisions } from '../../shared/physics';
import { net } from '../net';
import { CameraController, CameraViewMode } from './cameraController';
import { CrewmateModel } from './crewmateModel';
import { Map3D } from './map3D';

export class GameScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private isDestroyed: boolean = false;
  private animationFrameId: number = 0;

  // Components
  public map3D: Map3D;
  public cameraController: CameraController;

  // Local Player
  public localPlayerId: string = '';
  public localPos: THREE.Vector3 = new THREE.Vector3(0, 0, -14);
  public localRotation: number = 0;
  public isMoving: boolean = false;
  public currentRoom: string = 'Cafeteria';
  public playerSpeedMultiplier: number = 1.0;

  // Inputs
  private keys: Record<string, boolean> = {};
  private joystickVector: { x: number; y: number } = { x: 0, y: 0 };
  private inputSeq: number = 0;
  private lastInputSendTime: number = 0;

  // Actors
  private playerModels: Map<string, CrewmateModel> = new Map();
  private remoteTargets: Map<string, { x: number; z: number; rotation: number; isMoving: boolean }> = new Map();

  // Callbacks
  private onRoomChangeCb?: (room: string) => void;

  constructor(
    container: HTMLElement,
    settings: GameSettings,
    myId: string,
    onRoomChange?: (room: string) => void
  ) {
    this.container = container;
    this.localPlayerId = myId;
    this.playerSpeedMultiplier = settings.playerSpeed || 1.0;
    this.onRoomChangeCb = onRoomChange;
    this.clock = new THREE.Clock();

    // Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060814);
    this.scene.fog = new THREE.FogExp2(0x060814, 0.02);

    // Camera
    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 120);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Studio Environment map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting
    this.setupLighting();

    // 3D Map
    this.map3D = new Map3D();
    this.scene.add(this.map3D.group);

    // Camera Controller
    this.cameraController = new CameraController(this.camera);

    // Input listeners
    this.bindInputs();

    // Spawn local player
    this.localPos.set(0, 0, -14);

    // Render loop
    this.tick = this.tick.bind(this);
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  private setupLighting(): void {
    // Cool/warm hemisphere
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.65);
    this.scene.add(hemiLight);

    // Key directional light with orthographic shadows covering ship core
    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    keyLight.position.set(15, 30, -10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1.0;
    keyLight.shadow.camera.far = 80;
    keyLight.shadow.camera.left = -40;
    keyLight.shadow.camera.right = 40;
    keyLight.shadow.camera.top = 40;
    keyLight.shadow.camera.bottom = -40;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);
  }

  private bindInputs(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('resize', this.onResize.bind(this));
  }

  public setJoystick(x: number, y: number): void {
    this.joystickVector = { x, y };
  }

  public handleSnapshot(snapshot: GameStateSnapshot): void {
    const activeIds = new Set<string>();

    for (const [id, player] of Object.entries(snapshot.players)) {
      activeIds.add(id);

      let model = this.playerModels.get(id);
      if (!model) {
        model = new CrewmateModel(player.colorId, player.hatId, player.name, player.isHost);
        this.playerModels.set(id, model);
        this.scene.add(model.group);

        if (id === this.localPlayerId) {
          this.localPos.set(player.x, 0, player.z);
          model.group.position.copy(this.localPos);
        } else {
          model.group.position.set(player.x, 0, player.z);
        }
      } else {
        model.setColor(player.colorId);
        model.setHat(player.hatId);
      }

      if (id !== this.localPlayerId) {
        this.remoteTargets.set(id, {
          x: player.x,
          z: player.z,
          rotation: player.rotation,
          isMoving: player.isMoving,
        });
      }
    }

    // Remove vanished
    for (const [id, model] of this.playerModels) {
      if (!activeIds.has(id)) {
        this.scene.remove(model.group);
        model.dispose();
        this.playerModels.delete(id);
        this.remoteTargets.delete(id);
      }
    }
  }

  private tick(): void {
    if (this.isDestroyed) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const now = performance.now();

    // 1. Local Player Movement
    let moveX = 0;
    let moveZ = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    moveX += this.joystickVector.x;
    moveZ += this.joystickVector.y;

    const inputLen = Math.hypot(moveX, moveZ);
    this.isMoving = inputLen > 0.1;

    if (this.isMoving) {
      const normX = moveX / Math.max(inputLen, 1);
      const normZ = moveZ / Math.max(inputLen, 1);

      // Camera-relative angle
      const cameraYaw = this.cameraController.angleH;
      const sin = Math.sin(cameraYaw);
      const cos = Math.cos(cameraYaw);

      const worldMoveX = normX * cos + normZ * sin;
      const worldMoveZ = -normX * sin + normZ * cos;

      const baseSpeed = 4.8 * this.playerSpeedMultiplier;
      const stepX = worldMoveX * baseSpeed * delta;
      const stepZ = worldMoveZ * baseSpeed * delta;

      // Projected position with wall collision resolution
      const targetX = this.localPos.x + stepX;
      const targetZ = this.localPos.z + stepZ;

      const resolved = resolveWallCollisions(targetX, targetZ);
      this.localPos.x = resolved.x;
      this.localPos.z = resolved.z;

      this.localRotation = Math.atan2(worldMoveX, worldMoveZ);

      // Room detection
      const room = detectRoom(this.localPos.x, this.localPos.z);
      if (room !== this.currentRoom) {
        this.currentRoom = room;
        if (this.onRoomChangeCb) this.onRoomChangeCb(room);
      }

      // Send to server throttled at ~20 Hz
      if (now - this.lastInputSendTime > 50) {
        this.lastInputSendTime = now;
        this.inputSeq++;
        net.sendPlayerInput({
          seq: this.inputSeq,
          x: this.localPos.x,
          z: this.localPos.z,
          rotation: this.localRotation,
          isMoving: true,
        });
      }
    } else if (now - this.lastInputSendTime > 200) {
      this.lastInputSendTime = now;
      this.inputSeq++;
      net.sendPlayerInput({
        seq: this.inputSeq,
        x: this.localPos.x,
        z: this.localPos.z,
        rotation: this.localRotation,
        isMoving: false,
      });
    }

    // 2. Update Local Model
    const localModel = this.playerModels.get(this.localPlayerId);
    if (localModel) {
      localModel.group.position.copy(this.localPos);
      localModel.group.rotation.y = this.localRotation;
      localModel.updateAnimation(delta, this.isMoving, this.camera);

      // In first person, hide local visor/body mesh so it doesn't obstruct camera view
      const isFP = this.cameraController.mode === 'first_person';
      localModel.bodyMesh.visible = !isFP;
      localModel.visorMesh.visible = !isFP;
      localModel.visorFrameMesh.visible = !isFP;
      localModel.backpackMesh.visible = !isFP;
      localModel.hatGroup.visible = !isFP;
    }

    // 3. Interpolate Remote Players
    for (const [id, target] of this.remoteTargets) {
      const model = this.playerModels.get(id);
      if (model && id !== this.localPlayerId) {
        model.group.position.x = THREE.MathUtils.damp(model.group.position.x, target.x, 14, delta);
        model.group.position.z = THREE.MathUtils.damp(model.group.position.z, target.z, 14, delta);
        model.group.rotation.y = THREE.MathUtils.damp(model.group.rotation.y, target.rotation, 14, delta);
        model.updateAnimation(delta, target.isMoving, this.camera);
      }
    }

    // 4. Update Camera
    this.cameraController.update(delta, this.localPos, this.isMoving);

    // 5. Space motion
    this.map3D.update(delta);

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  private onResize(): void {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animationFrameId);

    window.removeEventListener('resize', this.onResize);

    for (const model of this.playerModels.values()) {
      model.dispose();
    }
    this.playerModels.clear();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
