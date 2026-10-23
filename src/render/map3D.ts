/**
 * Impostor Protocol - 3D Spaceship Map (The Skeld)
 * Procedural 3D rooms, walls, corridors, props, space windows, and lighting.
 */

import * as THREE from 'three';
import { MAP_CORRIDORS, MAP_ROOMS_DETAIL, MAP_WALLS } from '../../shared/mapData';

export class Map3D {
  public group: THREE.Group;
  public roomLights: THREE.PointLight[] = [];
  private starParticles: THREE.Points | null = null;

  constructor() {
    this.group = new THREE.Group();

    this.buildFloors();
    this.buildCorridors();
    this.buildWalls();
    this.buildRoomProps();
    this.buildOuterSpace();
  }

  private createFloorTexture(baseColorHex: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = baseColorHex;
      ctx.fillRect(0, 0, 128, 128);

      // Subtle panel grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 126, 126);

      // Rivets in corners
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(4, 4, 3, 3);
      ctx.fillRect(121, 4, 3, 3);
      ctx.fillRect(4, 121, 3, 3);
      ctx.fillRect(121, 121, 3, 3);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private buildFloors(): void {
    const floorGroup = new THREE.Group();

    for (const room of MAP_ROOMS_DETAIL) {
      const width = room.bounds.maxX - room.bounds.minX;
      const depth = room.bounds.maxZ - room.bounds.minZ;
      const centerX = (room.bounds.minX + room.bounds.maxX) / 2;
      const centerZ = (room.bounds.minZ + room.bounds.maxZ) / 2;

      const floorGeo = new THREE.BoxGeometry(width, 0.3, depth);
      const floorTex = this.createFloorTexture(room.floorHex);
      floorTex.repeat.set(Math.max(1, Math.round(width / 3)), Math.max(1, Math.round(depth / 3)));

      const floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.5,
        metalness: 0.3,
      });

      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(centerX, -0.15, centerZ);
      floorMesh.receiveShadow = true;
      floorGroup.add(floorMesh);

      // Glowing room center point light
      const roomLight = new THREE.PointLight(new THREE.Color(room.color), 0.7, 18);
      roomLight.position.set(centerX, 2.5, centerZ);
      this.roomLights.push(roomLight);
      floorGroup.add(roomLight);
    }

    this.group.add(floorGroup);
  }

  private buildCorridors(): void {
    const corridorMat = new THREE.MeshStandardMaterial({
      color: 0x18202f,
      roughness: 0.6,
      metalness: 0.2,
    });

    for (const corr of MAP_CORRIDORS) {
      const width = corr.bounds.maxX - corr.bounds.minX;
      const depth = corr.bounds.maxZ - corr.bounds.minZ;
      const centerX = (corr.bounds.minX + corr.bounds.maxX) / 2;
      const centerZ = (corr.bounds.minZ + corr.bounds.maxZ) / 2;

      const corrGeo = new THREE.BoxGeometry(width, 0.28, depth);
      const corrMesh = new THREE.Mesh(corrGeo, corridorMat);
      corrMesh.position.set(centerX, -0.16, centerZ);
      corrMesh.receiveShadow = true;
      this.group.add(corrMesh);
    }
  }

  private buildWalls(): void {
    const wallGroup = new THREE.Group();
    const wallHeight = 2.8;
    const wallThickness = 0.45;

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x243247,
      roughness: 0.5,
      metalness: 0.3,
    });

    const wallTrimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.4,
    });

    for (const wall of MAP_WALLS) {
      const dx = wall.x2 - wall.x1;
      const dz = wall.z2 - wall.z1;
      const length = Math.hypot(dx, dz);
      if (length < 0.01) continue;

      const angle = Math.atan2(dz, dx);
      const midX = (wall.x1 + wall.x2) / 2;
      const midZ = (wall.z1 + wall.z2) / 2;

      // Main wall body
      const wallGeo = new THREE.BoxGeometry(length, wallHeight, wallThickness);
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.set(midX, wallHeight / 2, midZ);
      wallMesh.rotation.y = -angle;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallGroup.add(wallMesh);

      // Top Trim
      const trimGeo = new THREE.BoxGeometry(length + 0.1, 0.15, wallThickness + 0.1);
      const trimMesh = new THREE.Mesh(trimGeo, wallTrimMat);
      trimMesh.position.set(midX, wallHeight, midZ);
      trimMesh.rotation.y = -angle;
      wallGroup.add(trimMesh);
    }

    this.group.add(wallGroup);
  }

  private buildRoomProps(): void {
    const propGroup = new THREE.Group();

    // 1. Cafeteria Emergency Table & Button
    const tableGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.85, 24);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.3 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.425, -14);
    table.castShadow = true;
    table.receiveShadow = true;
    propGroup.add(table);

    // Emergency Button Glass Dome
    const glassDomeGeo = new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const glassDomeMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    });
    const glassDome = new THREE.Mesh(glassDomeGeo, glassDomeMat);
    glassDome.position.set(0, 0.85, -14);
    propGroup.add(glassDome);

    // Emergency Red Button
    const buttonGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.25, 16);
    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x7f1d1d,
      roughness: 0.3,
    });
    const button = new THREE.Mesh(buttonGeo, buttonMat);
    button.position.set(0, 0.95, -14);
    propGroup.add(button);

    // 2. Medbay Scan Pad
    const padGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.12, 24);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.4 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(-17, 0.06, -8);
    pad.receiveShadow = true;
    propGroup.add(pad);

    const ringGeo = new THREE.RingGeometry(0.8, 1.0, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(-17, 0.13, -8);
    propGroup.add(ring);

    // 3. Reactor Core Column
    const coreGeo = new THREE.CylinderGeometry(1.8, 1.8, 2.6, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.2,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(-44, 1.3, -4);
    core.castShadow = true;
    propGroup.add(core);

    const energyRingsGeo = new THREE.TorusGeometry(2.1, 0.12, 12, 24);
    const energyMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const ring1 = new THREE.Mesh(energyRingsGeo, energyMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.set(-44, 0.8, -4);
    propGroup.add(ring1);

    const ring2 = new THREE.Mesh(energyRingsGeo, energyMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.set(-44, 1.8, -4);
    propGroup.add(ring2);

    // 4. Admin Map Hologram Table
    const adminTableGeo = new THREE.BoxGeometry(3.6, 0.8, 2.2);
    const adminTableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const adminTable = new THREE.Mesh(adminTableGeo, adminTableMat);
    adminTable.position.set(15, 0.4, 1);
    adminTable.castShadow = true;
    propGroup.add(adminTable);

    const holoGeo = new THREE.PlaneGeometry(3.0, 1.6);
    const holoMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const holo = new THREE.Mesh(holoGeo, holoMat);
    holo.rotation.x = -Math.PI / 2;
    holo.position.set(15, 0.81, 1);
    propGroup.add(holo);

    // 5. Storage Cargo Crates
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const crateGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);

    const crate1 = new THREE.Mesh(crateGeo, crateMat);
    crate1.position.set(-5, 0.7, 14);
    crate1.castShadow = true;
    propGroup.add(crate1);

    const crate2 = new THREE.Mesh(crateGeo, crateMat);
    crate2.position.set(-5, 0.7, 16);
    crate2.rotation.y = 0.3;
    crate2.castShadow = true;
    propGroup.add(crate2);

    const crate3 = new THREE.Mesh(crateGeo, crateMat);
    crate3.position.set(-5, 2.1, 15);
    crate3.rotation.y = -0.15;
    crate3.castShadow = true;
    propGroup.add(crate3);

    // 6. Navigation Cockpit Consoles
    const navConsoleGeo = new THREE.BoxGeometry(1.6, 1.0, 4.0);
    const navConsoleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 });
    const navConsole = new THREE.Mesh(navConsoleGeo, navConsoleMat);
    navConsole.position.set(45, 0.5, 0);
    navConsole.castShadow = true;
    propGroup.add(navConsole);

    this.group.add(propGroup);
  }

  private buildOuterSpace(): void {
    // Starfield around the ship
    const starCount = 1200;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 60 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i] = radius * Math.cos(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi);
      positions[i + 2] = radius * Math.cos(phi) * Math.sin(theta);
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0.8,
    });

    this.starParticles = new THREE.Points(starGeo, starMat);
    this.group.add(this.starParticles);
  }

  public update(delta: number): void {
    if (this.starParticles) {
      this.starParticles.rotation.y += delta * 0.005;
    }
  }
}
