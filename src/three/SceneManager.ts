import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoomSpec, VenueObject, ZoneDefinition, ViewMode, DisplayOptions, RehearsalChapter } from '../types/venue';
import { CAMERA_PRESETS, ZONES } from '../data/defaultVenue';

export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  private isSoftwareGl: boolean;
  private animationFrameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  // Root groups
  private roomRoot: THREE.Group = new THREE.Group();
  private objectRoot: THREE.Group = new THREE.Group();
  private zoneGuideRoot: THREE.Group = new THREE.Group();
  private attendeeRoot: THREE.Group = new THREE.Group();
  private blueprintMesh: THREE.Mesh | null = null;
  private equipmentLightsGroup: THREE.Group = new THREE.Group();
  private gridHelper: THREE.GridHelper | null = null;

  // Wall meshes for transparency toggling
  private wallMeshes: THREE.Mesh[] = [];
  private wallEdges: THREE.LineSegments[] = [];

  // Instanced chairs for maximum 60fps performance
  private chairInstancedMesh: THREE.InstancedMesh | null = null;

  // Attendees simulation instances
  private attendeeMeshes: THREE.Group[] = [];

  // Camera tweening
  private cameraTween: {
    startTime: number;
    duration: number;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
  } | null = null;

  private currentView: ViewMode = 'site';

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Detect software WebGL guard
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Initialize Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdce0df); // Light warm studio grey
    this.scene.fog = new THREE.Fog(0xdce0df, 30, 95);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Required for canvas snapshot export
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Camera & Controls
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    this.camera.position.set(-22, 26, 26);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // Never go below ground
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 75.0;
    this.controls.target.set(-3, 0.5, 0);
    this.controls.update();

    // 4. Environment Lighting
    this.setupLighting();

    // 5. Add Root Groups
    this.scene.add(this.roomRoot);
    this.scene.add(this.objectRoot);
    this.scene.add(this.zoneGuideRoot);
    this.scene.add(this.attendeeRoot);
    this.scene.add(this.equipmentLightsGroup);

    // 6. Resize listener
    window.addEventListener('resize', this.onWindowResize);

    // 7. Start Render Loop
    this.startLoop();
  }

  private setupLighting() {
    // Studio Environment map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Hemisphere warm/cool balance
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcdd7d8, 0.7);
    hemiLight.position.set(0, 30, 0);
    this.scene.add(hemiLight);

    // Main Key Light
    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.35);
    keyLight.position.set(18, 28, 14);
    keyLight.castShadow = !this.isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 10;
      keyLight.shadow.camera.far = 70;
      keyLight.shadow.camera.left = -25;
      keyLight.shadow.camera.right = 25;
      keyLight.shadow.camera.top = 25;
      keyLight.shadow.camera.bottom = -25;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // Soft Ambient Fill Light
    const fillLight = new THREE.DirectionalLight(0xdbe7ea, 0.5);
    fillLight.position.set(-20, 20, -15);
    this.scene.add(fillLight);

    // Stage Spotlights (Equipment Lights)
    const stageSpot1 = new THREE.SpotLight(0xa5f3fc, 3.2, 25, Math.PI / 5, 0.4, 1);
    stageSpot1.position.set(4.0, 4.0, -3.5);
    stageSpot1.target.position.set(8.5, 0.6, -1.0);
    this.equipmentLightsGroup.add(stageSpot1);
    this.equipmentLightsGroup.add(stageSpot1.target);

    const stageSpot2 = new THREE.SpotLight(0xfef08a, 3.2, 25, Math.PI / 5, 0.4, 1);
    stageSpot2.position.set(4.0, 4.0, 3.5);
    stageSpot2.target.position.set(8.5, 0.6, 1.0);
    this.equipmentLightsGroup.add(stageSpot2);
    this.equipmentLightsGroup.add(stageSpot2.target);

    // Photo booth softbox light
    const photoSpot = new THREE.PointLight(0xfffbeb, 1.5, 8);
    photoSpot.position.set(-14.0, 2.5, -5.0);
    this.equipmentLightsGroup.add(photoSpot);
  }

  // Build Architectural Shell (Dollhouse Cutaway)
  public buildRoom(spec: RoomSpec, options: DisplayOptions) {
    this.roomRoot.clear();
    this.wallMeshes = [];
    this.wallEdges = [];

    const { length, width, height, wallThickness, annexWidth } = spec;

    // 1. Main Hall Floor (Light oak / architectural stone)
    const floorGeo = new THREE.PlaneGeometry(length, width);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xedede9,
      roughness: 0.75,
      metalness: 0.05
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, 0);
    floorMesh.receiveShadow = !this.isSoftwareGl;
    this.roomRoot.add(floorMesh);

    // 2. Foyer / Annex Floor (Slightly cooler stone tone to distinguish zone)
    const foyerGeo = new THREE.PlaneGeometry(annexWidth, width);
    const foyerMat = new THREE.MeshStandardMaterial({
      color: 0xe2e6e7,
      roughness: 0.65,
      metalness: 0.1
    });
    const foyerMesh = new THREE.Mesh(foyerGeo, foyerMat);
    foyerMesh.rotation.x = -Math.PI / 2;
    foyerMesh.position.set(-length / 2 - annexWidth / 2, 0, 0);
    foyerMesh.receiveShadow = !this.isSoftwareGl;
    this.roomRoot.add(foyerMesh);

    // Base Ground Podium under whole venue
    const baseGeo = new THREE.BoxGeometry(length + annexWidth + 3, 0.4, width + 3);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xcdd5d6,
      roughness: 0.9
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(-annexWidth / 2, -0.21, 0);
    this.roomRoot.add(baseMesh);

    // 3. Walls creation (Cutaway height ~1.2m on camera-facing sides, full height 4.2m on rear stage side)
    const wallMatBase = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.85,
      metalness: 0.05,
      transparent: options.transparentWalls,
      opacity: options.transparentWalls ? 1 - options.wallTransparency / 100 : 1.0,
      depthWrite: !options.transparentWalls || options.wallTransparency < 50
    });

    const addWall = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      isCutaway = false
    ) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = wallMatBase.clone();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = !this.isSoftwareGl && (!options.transparentWalls || options.wallTransparency < 20);
      mesh.receiveShadow = !this.isSoftwareGl;
      this.roomRoot.add(mesh);
      this.wallMeshes.push(mesh);

      // Edge outline
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x5a737d,
        transparent: true,
        opacity: options.transparentWalls ? 0.65 : 0.25,
        depthWrite: false
      });
      const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
      mesh.add(edgeLine);
      this.wallEdges.push(edgeLine);
    };

    const halfL = length / 2;
    const halfW = width / 2;
    const totalHalfL = halfL + annexWidth;

    // Back Stage Wall (East wall: X = halfL) - Full height
    addWall(wallThickness, height, width, halfL + wallThickness / 2, height / 2, 0);

    // North Wall (Z = -halfW) - Cutaway low profile
    const cutawayH = 1.35;
    addWall(length, cutawayH, wallThickness, 0, cutawayH / 2, -halfW - wallThickness / 2, true);
    addWall(annexWidth, cutawayH, wallThickness, -halfL - annexWidth / 2, cutawayH / 2, -halfW - wallThickness / 2, true);

    // South Wall (Z = halfW) - Full height / cutaway
    addWall(length, cutawayH, wallThickness, 0, cutawayH / 2, halfW + wallThickness / 2, true);
    addWall(annexWidth, cutawayH, wallThickness, -halfL - annexWidth / 2, cutawayH / 2, halfW + wallThickness / 2, true);

    // West Wall (Foyer entrance: X = -totalHalfL)
    addWall(wallThickness, cutawayH, width, -totalHalfL - wallThickness / 2, cutawayH / 2, 0, true);

    // Interior Partition Wall between Foyer and Main Hall (X = -halfL) with 2 Door Openings!
    // Top section: Z from -halfW to -3.0
    const partW = halfW - 3.0;
    addWall(wallThickness, height, partW, -halfL, height / 2, -halfW + partW / 2);
    // Center section: Z from -1.0 to 1.0
    addWall(wallThickness, height, 2.0, -halfL, height / 2, 0);
    // Bottom section: Z from 3.0 to halfW
    addWall(wallThickness, height, partW, -halfL, height / 2, halfW - partW / 2);

    // Door Header lintels (Door openings at Z = -2.0 and Z = 2.0)
    addWall(wallThickness, height - 2.4, 2.0, -halfL, height - (height - 2.4) / 2, -2.0);
    addWall(wallThickness, height - 2.4, 2.0, -halfL, height - (height - 2.4) / 2, 2.0);

    // Door Signs over entrances
    this.createDoorSign('ทางเข้า 1 (ENTRANCE A)', -halfL + 0.15, 2.55, -2.0);
    this.createDoorSign('ทางเข้า 2 (ENTRANCE B)', -halfL + 0.15, 2.55, 2.0);

    // 4. Columns / Pillars (Architectural structural realism)
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.5 });
    const addColumn = (x: number, z: number) => {
      const colGeo = new THREE.BoxGeometry(0.5, height, 0.5);
      const col = new THREE.Mesh(colGeo, pillarMat);
      col.position.set(x, height / 2, z);
      col.castShadow = !this.isSoftwareGl;
      this.roomRoot.add(col);
    };
    addColumn(-halfL, -halfW + 0.3);
    addColumn(-halfL, halfW - 0.3);
    addColumn(0, -halfW + 0.3);
    addColumn(0, halfW - 0.3);

    // 5. Grid Helper
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      this.gridHelper.dispose();
    }
    this.gridHelper = new THREE.GridHelper(40, 40, 0x507584, 0xbdcbcf);
    this.gridHelper.position.y = 0.015;
    this.gridHelper.visible = options.grid;
    this.scene.add(this.gridHelper);

    // 6. 2D Blueprint Floor Overlay
    this.setupBlueprintOverlay(length, width, annexWidth);
  }

  // Create Signboard above doors
  private createDoorSign(text: string, x: number, y: number, z: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#10212b';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#a0e8e4';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.fillStyle = '#a0e8e4';
    ctx.font = 'bold 36px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const geo = new THREE.PlaneGeometry(1.6, 0.4);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = -Math.PI / 2;
    this.roomRoot.add(mesh);
  }

  // Procedural 2D Architectural Blueprint CAD overlay on floor
  private setupBlueprintOverlay(length: number, width: number, annexWidth: number) {
    if (this.blueprintMesh) {
      this.scene.remove(this.blueprintMesh);
      this.blueprintMesh.geometry.dispose();
      this.blueprintMesh = null;
    }

    const totalL = length + annexWidth;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Background CAD paper tint
    ctx.fillStyle = 'rgba(238, 242, 245, 0.95)';
    ctx.fillRect(0, 0, 2048, 1024);

    // CAD Grid lines
    ctx.strokeStyle = 'rgba(100, 140, 160, 0.22)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 2048; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }

    // Outer Room boundary
    ctx.strokeStyle = '#082f3e';
    ctx.lineWidth = 8;
    ctx.strokeRect(100, 80, 1848, 864);

    // Dimension lines & architectural markers
    ctx.fillStyle = '#082f3e';
    ctx.font = 'bold 28px Prompt, sans-serif';
    ctx.fillText(`22.00 ม. (ความยาวห้องประชุม)`, 950, 60);
    ctx.fillText(`14.00 ม. (ความกว้าง)`, 1900, 520);
    ctx.fillText(`5.50 ม. (โถงลงทะเบียน)`, 240, 60);

    // Zone boxes in blueprint
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(1380, 200, 480, 624); // Stage
    ctx.fillText('เวทีหลัก (STAGE 10.5 x 4.2 ม.)', 1420, 250);

    ctx.strokeStyle = '#16a34a';
    ctx.strokeRect(700, 180, 620, 664); // Audience
    ctx.fillText('โซนที่นั่งผู้ชม 140 ที่นั่ง', 850, 230);

    ctx.strokeStyle = '#eab308';
    ctx.strokeRect(1180, 260, 180, 500); // VIP
    ctx.fillText('ที่นั่ง VIP', 1210, 300);

    ctx.strokeStyle = '#0d9488';
    ctx.strokeRect(140, 220, 340, 584); // Registration
    ctx.fillText('ลงทะเบียน & ต้อนรับ', 180, 270);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.PlaneGeometry(totalL, width);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.88,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    this.blueprintMesh = new THREE.Mesh(geo, mat);
    this.blueprintMesh.rotation.x = -Math.PI / 2;
    this.blueprintMesh.position.set(-annexWidth / 2, 0.02, 0);
    this.blueprintMesh.visible = false;
    this.scene.add(this.blueprintMesh);
  }

  // Update Blueprint Texture with User Uploaded Image
  public setCustomBlueprintImage(dataUrl: string) {
    if (!this.blueprintMesh) return;
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      (this.blueprintMesh!.material as THREE.MeshBasicMaterial).map = tex;
      (this.blueprintMesh!.material as THREE.MeshBasicMaterial).needsUpdate = true;
      this.blueprintMesh!.visible = true;
    };
  }

  // Build All 3D Objects in the venue
  public buildObjects(objects: VenueObject[]) {
    this.objectRoot.clear();

    // 1. Separate audience chairs to use high-performance InstancedMesh
    const chairObjects = objects.filter((o) => o.kind === 'chair');
    const otherObjects = objects.filter((o) => o.kind !== 'chair');

    this.createInstancedChairs(chairObjects);

    // 2. Build detailed modular 3D objects
    for (const obj of otherObjects) {
      const group = new THREE.Group();
      group.position.set(obj.x, obj.y, obj.z);
      if (obj.angle) group.rotation.y = obj.angle;

      switch (obj.kind) {
        case 'stage':
          this.buildStageMesh(group, obj);
          break;
        case 'screen':
          this.buildLedScreenMesh(group, obj);
          break;
        case 'podium':
          this.buildPodiumMesh(group, obj);
          break;
        case 'sofa':
          this.buildVipSofaMesh(group, obj);
          break;
        case 'table':
          this.buildTableMesh(group, obj);
          break;
        case 'booth':
          this.buildBoothMesh(group, obj);
          break;
        case 'registration_desk':
          this.buildRegistrationDeskMesh(group, obj);
          break;
        case 'photo_backdrop':
          this.buildPhotoBackdropMesh(group, obj);
          break;
        case 'av_console':
          this.buildAvConsoleMesh(group, obj);
          break;
        case 'speaker':
          this.buildSpeakerMesh(group, obj);
          break;
      }

      this.objectRoot.add(group);
    }
  }

  // High Performance Instanced Chairs for 140+ Seats
  private createInstancedChairs(chairs: VenueObject[]) {
    if (this.chairInstancedMesh) {
      this.scene.remove(this.chairInstancedMesh);
      this.chairInstancedMesh.dispose();
      this.chairInstancedMesh = null;
    }
    if (chairs.length === 0) return;

    // Composite Chair Geometry (cushion seat + backrest + metal legs)
    const seatGeo = new THREE.BoxGeometry(0.48, 0.08, 0.46);
    seatGeo.translate(0, 0.44, 0);

    const backGeo = new THREE.BoxGeometry(0.46, 0.42, 0.06);
    backGeo.translate(0, 0.68, -0.2);

    const leg1 = new THREE.CylinderGeometry(0.015, 0.015, 0.44);
    leg1.translate(-0.2, 0.22, 0.18);
    const leg2 = new THREE.CylinderGeometry(0.015, 0.015, 0.44);
    leg2.translate(0.2, 0.22, 0.18);
    const leg3 = new THREE.CylinderGeometry(0.015, 0.015, 0.44);
    leg3.translate(-0.2, 0.22, -0.18);
    const leg4 = new THREE.CylinderGeometry(0.015, 0.015, 0.44);
    leg4.translate(0.2, 0.22, -0.18);

    // Merge chair parts
    const mergedGeo = new THREE.BufferGeometry();
    // We can use a group of seat + backrest with clean material
    const chairMat = new THREE.MeshStandardMaterial({
      color: 0x1f3b4d, // Teal dark blue audience seat cushion
      roughness: 0.6,
      metalness: 0.2
    });

    this.chairInstancedMesh = new THREE.InstancedMesh(seatGeo, chairMat, chairs.length);
    this.chairInstancedMesh.castShadow = !this.isSoftwareGl;
    this.chairInstancedMesh.receiveShadow = !this.isSoftwareGl;

    const dummy = new THREE.Object3D();
    chairs.forEach((c, i) => {
      dummy.position.set(c.x, c.y, c.z);
      dummy.rotation.y = c.angle || 0;
      dummy.updateMatrix();
      this.chairInstancedMesh!.setMatrixAt(i, dummy.matrix);
    });

    this.chairInstancedMesh.instanceMatrix.needsUpdate = true;
    this.chairInstancedMesh.computeBoundingSphere();
    this.objectRoot.add(this.chairInstancedMesh);
  }

  // 1. Stage Mesh
  private buildStageMesh(parent: THREE.Group, obj: VenueObject) {
    const stageGeo = new THREE.BoxGeometry(obj.w, obj.h, obj.d);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x1a242c,
      roughness: 0.4,
      metalness: 0.2
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = obj.h / 2;
    stage.castShadow = !this.isSoftwareGl;
    stage.receiveShadow = !this.isSoftwareGl;
    parent.add(stage);

    // Stage edge trim
    const trimGeo = new THREE.BoxGeometry(0.05, 0.05, obj.d + 0.1);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(-obj.w / 2 + 0.02, obj.h, 0);
    parent.add(trim);

    // Stage Access Steps (Left and Right)
    const stepGeo = new THREE.BoxGeometry(1.2, 0.3, 1.2);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });
    const step1 = new THREE.Mesh(stepGeo, stepMat);
    step1.position.set(-obj.w / 2 - 0.6, 0.15, -obj.d / 2 + 0.8);
    const step2 = new THREE.Mesh(stepGeo, stepMat);
    step2.position.set(-obj.w / 2 - 0.6, 0.15, obj.d / 2 - 0.8);
    parent.add(step1);
    parent.add(step2);
  }

  // 2. LED Screen with Digital Canvas Graphic
  private buildLedScreenMesh(parent: THREE.Group, obj: VenueObject) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Digital Stage Visual
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, '#0c2331');
    grad.addColorStop(0.5, '#0d5c75');
    grad.addColorStop(1, '#1e8ca8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.strokeStyle = 'rgba(160, 232, 228, 0.3)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 1024; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
    }

    ctx.fillStyle = '#a0e8e4';
    ctx.font = 'bold 54px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('INNOVATION SUMMIT 2026', 512, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = '32px Prompt, sans-serif';
    ctx.fillText('BEYOND THE GATEWAY · ก้าวสู่อนาคต', 512, 290);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const screenGeo = new THREE.BoxGeometry(obj.w, obj.h, obj.d);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2 });
    const screenFaceMat = new THREE.MeshBasicMaterial({ map: tex });

    const materials = [
      screenFaceMat, // Facing negative X (towards audience)
      frameMat,
      frameMat,
      frameMat,
      frameMat,
      frameMat
    ];

    const screen = new THREE.Mesh(screenGeo, materials);
    screen.position.y = obj.h / 2;
    parent.add(screen);
  }

  // 3. Stage Podium
  private buildPodiumMesh(parent: THREE.Group, obj: VenueObject) {
    const geo = new THREE.BoxGeometry(obj.w, obj.h, obj.d);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.4
    });
    const podium = new THREE.Mesh(geo, mat);
    podium.position.y = obj.h / 2;
    parent.add(podium);

    // Accent mint front stripe
    const stripeGeo = new THREE.BoxGeometry(obj.w * 0.4, obj.h * 0.85, 0.02);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xa0e8e4,
      roughness: 0.2,
      emissive: 0x124747
    });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(-obj.w / 2 - 0.01, obj.h / 2, 0);
    parent.add(stripe);

    // Microphone
    const micStemGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.35);
    const micStemMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.9 });
    const mic = new THREE.Mesh(micStemGeo, micStemMat);
    mic.position.set(0, obj.h + 0.18, 0);
    mic.rotation.z = 0.3;
    parent.add(mic);
  }

  // 4. VIP Executive Armchair / Sofa
  private buildVipSofaMesh(parent: THREE.Group, obj: VenueObject) {
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x24323d, // Dark elegant charcoal teal
      roughness: 0.5,
      metalness: 0.15
    });

    // Seat cushion
    const seatGeo = new THREE.BoxGeometry(obj.w, 0.35, obj.d);
    const seat = new THREE.Mesh(seatGeo, leatherMat);
    seat.position.y = 0.28;
    seat.castShadow = !this.isSoftwareGl;
    parent.add(seat);

    // Backrest
    const backGeo = new THREE.BoxGeometry(0.18, 0.52, obj.d);
    const back = new THREE.Mesh(backGeo, leatherMat);
    back.position.set(obj.w / 2 - 0.09, 0.58, 0);
    parent.add(back);

    // Armrests (Left & Right)
    const armGeo = new THREE.BoxGeometry(obj.w - 0.18, 0.28, 0.12);
    const arm1 = new THREE.Mesh(armGeo, leatherMat);
    arm1.position.set(-0.05, 0.42, obj.d / 2 - 0.06);
    const arm2 = new THREE.Mesh(armGeo, leatherMat);
    arm2.position.set(-0.05, 0.42, -obj.d / 2 + 0.06);
    parent.add(arm1);
    parent.add(arm2);

    // Gold/Chrome feet
    const feetMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
    const footGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12);
    [-0.3, 0.3].forEach((fx) => {
      [-0.3, 0.3].forEach((fz) => {
        const foot = new THREE.Mesh(footGeo, feetMat);
        foot.position.set(fx, 0.06, fz);
        parent.add(foot);
      });
    });
  }

  // 5. Table (Coffee / Demonstration)
  private buildTableMesh(parent: THREE.Group, obj: VenueObject) {
    const isVip = obj.vip;
    const topGeo = new THREE.BoxGeometry(obj.w, 0.04, obj.d);
    const topMat = isVip
      ? new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.1, metalness: 0.8 })
      : new THREE.MeshStandardMaterial({ color: 0xf9fafb, roughness: 0.4 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = obj.h;
    top.castShadow = !this.isSoftwareGl;
    parent.add(top);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, obj.h);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.7 });
    [-obj.w / 2 + 0.05, obj.w / 2 - 0.05].forEach((lx) => {
      [-obj.d / 2 + 0.05, obj.d / 2 - 0.05].forEach((lz) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, obj.h / 2, lz);
        parent.add(leg);
      });
    });

    // Small tabletop details (Water bottle or display kit)
    if (isVip) {
      const bottleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.14);
      const bottleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 });
      const bottle = new THREE.Mesh(bottleGeo, bottleMat);
      bottle.position.set(0, obj.h + 0.07, 0);
      parent.add(bottle);
    }
  }

  // 6. Exhibition Booth
  private buildBoothMesh(parent: THREE.Group, obj: VenueObject) {
    // Back wall panel
    const backGeo = new THREE.BoxGeometry(0.08, obj.h, obj.d);
    const backMat = new THREE.MeshStandardMaterial({ color: 0x1e3a47, roughness: 0.6 });
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.set(-obj.w / 2, obj.h / 2, 0);
    parent.add(back);

    // Side partition
    const sideGeo = new THREE.BoxGeometry(obj.w, obj.h, 0.06);
    const side = new THREE.Mesh(sideGeo, backMat);
    side.position.set(0, obj.h / 2, obj.d / 2);
    parent.add(side);

    // Counter Plinth
    const counterGeo = new THREE.BoxGeometry(0.7, 0.95, 1.1);
    const counterMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(0.2, 0.475, -0.1);
    counter.castShadow = !this.isSoftwareGl;
    parent.add(counter);

    // Roll-up Display Banner
    const bannerGeo = new THREE.BoxGeometry(0.04, 1.8, 0.6);
    const bannerMat = new THREE.MeshStandardMaterial({ color: 0xa0e8e4, roughness: 0.3 });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0.6, 0.9, -obj.d / 2 + 0.4);
    parent.add(banner);
  }

  // 7. Registration Desk Counter
  private buildRegistrationDeskMesh(parent: THREE.Group, obj: VenueObject) {
    const deskGeo = new THREE.BoxGeometry(obj.w, obj.h, obj.d);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x132733, roughness: 0.4 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.y = obj.h / 2;
    desk.castShadow = !this.isSoftwareGl;
    parent.add(desk);

    // Mint Counter Top trim
    const trimGeo = new THREE.BoxGeometry(obj.w + 0.06, 0.05, obj.d + 0.06);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xa0e8e4, roughness: 0.2 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = obj.h;
    parent.add(trim);

    // Laptop Check-in station
    const laptopBase = new THREE.BoxGeometry(0.3, 0.02, 0.24);
    const laptopMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.8 });
    const laptop = new THREE.Mesh(laptopBase, laptopMat);
    laptop.position.set(0, obj.h + 0.04, 0);

    const screenGeo = new THREE.BoxGeometry(0.3, 0.2, 0.015);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, obj.h + 0.14, 0.11);
    screen.rotation.x = -0.25;

    parent.add(laptop);
    parent.add(screen);
  }

  // 8. Photo Backdrop
  private buildPhotoBackdropMesh(parent: THREE.Group, obj: VenueObject) {
    const wallGeo = new THREE.BoxGeometry(obj.w, obj.h, obj.d);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f232e, roughness: 0.5 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = obj.h / 2;
    wall.castShadow = !this.isSoftwareGl;
    parent.add(wall);

    // Red Carpet runner in front of backdrop
    const carpetGeo = new THREE.PlaneGeometry(3.0, obj.d - 0.4);
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(1.5, 0.02, 0);
    parent.add(carpet);

    // Studio Softbox Lights (Left & Right)
    [-obj.d / 2 - 0.3, obj.d / 2 + 0.3].forEach((sz) => {
      const standGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.8);
      const standMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8 });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.set(1.6, 0.9, sz);

      const boxGeo = new THREE.BoxGeometry(0.4, 0.6, 0.2);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.1 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(1.6, 1.8, sz);
      box.rotation.y = sz > 0 ? -0.5 : 0.5;

      parent.add(stand);
      parent.add(box);
    });
  }

  // 9. AV & Lighting Sound Console Desk
  private buildAvConsoleMesh(parent: THREE.Group, obj: VenueObject) {
    const deskGeo = new THREE.BoxGeometry(obj.w, obj.h, obj.d);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.y = obj.h / 2;
    desk.castShadow = !this.isSoftwareGl;
    parent.add(desk);

    // Digital Mixer Surface with knobs and sliders
    const mixerGeo = new THREE.BoxGeometry(obj.w - 0.2, 0.04, obj.d - 0.2);
    const mixerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    const mixer = new THREE.Mesh(mixerGeo, mixerMat);
    mixer.position.y = obj.h + 0.02;
    parent.add(mixer);

    // Dual Computer Monitors
    [-0.35, 0.35].forEach((mx) => {
      const monGeo = new THREE.BoxGeometry(0.42, 0.28, 0.03);
      const monMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const mon = new THREE.Mesh(monGeo, monMat);
      mon.position.set(mx, obj.h + 0.24, -0.15);
      parent.add(mon);
    });
  }

  // 10. Speaker Line Array
  private buildSpeakerMesh(parent: THREE.Group, obj: VenueObject) {
    const spkGeo = new THREE.BoxGeometry(obj.w, obj.h, obj.d);
    const spkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const spk = new THREE.Mesh(spkGeo, spkMat);
    spk.castShadow = !this.isSoftwareGl;
    parent.add(spk);

    // Hanging rig cable
    const cableGeo = new THREE.CylinderGeometry(0.01, 0.01, 2.0);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.y = obj.h / 2 + 1.0;
    parent.add(cable);
  }

  // 3D Zone Guides & Boundary Lines
  public buildZoneGuides(zones: ZoneDefinition[], visible: boolean) {
    this.zoneGuideRoot.clear();
    this.zoneGuideRoot.visible = visible;

    for (const z of zones) {
      const { minX, maxX, minZ, maxZ } = z.bounds;
      const w = maxX - minX;
      const d = maxZ - minZ;
      const cx = (minX + maxX) / 2;
      const cz = (minZ + maxZ) / 2;

      // Soft colored ground patch
      const patchGeo = new THREE.PlaneGeometry(w, d);
      const patchMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(z.color),
        transparent: true,
        opacity: 0.07,
        depthWrite: false
      });
      const patch = new THREE.Mesh(patchGeo, patchMat);
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(cx, 0.012, cz);
      this.zoneGuideRoot.add(patch);

      // Boundary outline
      const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, 0.02, d));
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(z.color),
        transparent: true,
        opacity: 0.5,
        depthWrite: false
      });
      const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
      edgeLine.position.set(cx, 0.02, cz);
      this.zoneGuideRoot.add(edgeLine);

      // 3D Billboard Floating Label
      this.createZone3DLabel(z.name, z.color, cx, 0.4, cz);
    }
  }

  // Floating 3D text label
  private createZone3DLabel(text: string, color: string, x: number, y: number, z: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(16, 33, 43, 0.88)';
    ctx.roundRect(10, 10, 492, 108, 24);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.roundRect(10, 10, 492, 108, 24);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    const geo = new THREE.PlaneGeometry(2.4, 0.6);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2; // Flat on floor or facing up
    mesh.position.set(x, 0.03, z);
    this.zoneGuideRoot.add(mesh);
  }

  // Build Stylized 3D Animated Attendees for Rehearsal Simulation
  public updateAttendees(chapter: RehearsalChapter) {
    this.attendeeRoot.clear();
    this.attendeeMeshes = [];

    const { registrationCount, exhibitionCount, audienceCount, vipCount, stageCount, photoCount } =
      chapter.attendeeState;

    const createPerson = (x: number, z: number, isVip = false, isSpeaker = false) => {
      const p = new THREE.Group();
      p.position.set(x, 0, z);

      // Body (Stylized cylinder/capsule figurine)
      const bodyGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.85);
      const color = isSpeaker ? 0xef4444 : isVip ? 0xfacc15 : 0x0284c7;
      const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.85 / 2 + 0.45;
      body.castShadow = !this.isSoftwareGl;
      p.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.4 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.05;
      p.add(head);

      this.attendeeRoot.add(p);
      this.attendeeMeshes.push(p);
    };

    // Registration foyer attendees
    for (let i = 0; i < Math.min(registrationCount, 30); i++) {
      const rx = -15.5 + Math.random() * 3.0;
      const rz = -3.5 + Math.random() * 7.0;
      createPerson(rx, rz);
    }

    // Exhibition booth attendees
    for (let i = 0; i < Math.min(exhibitionCount, 25); i++) {
      const bx = -9.8 + Math.random() * 2.5;
      const bz = -5.5 + Math.random() * 7.5;
      createPerson(bx, bz);
    }

    // Audience seated
    const audienceShow = Math.min(audienceCount, 70);
    for (let i = 0; i < audienceShow; i++) {
      const ax = -5.8 + (i % 8) * 0.9;
      const az = -4.5 + Math.floor(i / 8) * 1.0;
      createPerson(ax, az);
    }

    // VIP Executives
    for (let i = 0; i < vipCount; i++) {
      const vx = i < 4 ? 3.8 : 5.0;
      const vz = ((i % 4) - 1.5) * 1.1;
      createPerson(vx, vz, true);
    }

    // Speakers on stage
    for (let i = 0; i < stageCount; i++) {
      const sx = 7.8 + i * 0.8;
      const sz = -1.5 + i * 1.0;
      createPerson(sx, sz, false, true);
    }

    // Photo booth attendees
    for (let i = 0; i < Math.min(photoCount, 15); i++) {
      const px = -14.5 + Math.random() * 2.0;
      const pz = -6.0 + Math.random() * 2.0;
      createPerson(px, pz);
    }
  }

  // Display Visibility Controls
  public applyDisplayOptions(options: DisplayOptions) {
    // Walls transparency
    const opacity = options.transparentWalls ? 1 - options.wallTransparency / 100 : 1.0;
    const isTrans = opacity < 1.0;

    this.wallMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.transparent = isTrans;
      mat.opacity = opacity;
      mat.depthWrite = !isTrans || options.wallTransparency < 50;
      mat.needsUpdate = true;
    });

    this.wallEdges.forEach((edge) => {
      edge.visible = options.transparentWalls;
      const lineMat = edge.material as THREE.LineBasicMaterial;
      if (lineMat) {
        lineMat.opacity = options.transparentWalls ? 0.65 : 0.2;
      }
    });

    // Grid
    if (this.gridHelper) {
      this.gridHelper.visible = options.grid;
    }

    // Zone Guides
    this.zoneGuideRoot.visible = options.zoneGuides;

    // Equipment Lights
    this.equipmentLightsGroup.visible = options.equipmentLights;

    // Blueprint Floor Overlay
    if (this.blueprintMesh) {
      this.blueprintMesh.visible = options.blueprintOverlay;
    }
  }

  // Camera Preset Navigation with Silky Smooth Interpolation
  public setView(viewId: ViewMode, instant = false) {
    this.currentView = viewId;
    const preset = CAMERA_PRESETS.find((p) => p.id === viewId) || CAMERA_PRESETS[0];

    const targetPos = new THREE.Vector3(...preset.position);
    const targetLookAt = new THREE.Vector3(...preset.target);

    if (instant) {
      this.cameraTween = null;
      this.camera.position.copy(targetPos);
      this.controls.target.copy(targetLookAt);
      this.controls.update();
    } else {
      this.cameraTween = {
        startTime: performance.now(),
        duration: 900, // 900ms smooth cinematic travel
        startPos: this.camera.position.clone(),
        endPos: targetPos,
        startTarget: this.controls.target.clone(),
        endTarget: targetLookAt
      };
    }
  }

  // High-Resolution Snapshot Capture (PNG Download)
  public captureSnapshot(filename: string) {
    this.renderer.render(this.scene, this.camera);
    this.renderer.domElement.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, 'image/png');
  }

  // Main Render Loop
  private startLoop = () => {
    const tick = () => {
      const delta = this.clock.getDelta();

      // Camera tweening animation
      if (this.cameraTween) {
        const elapsed = performance.now() - this.cameraTween.startTime;
        const progress = Math.min(elapsed / this.cameraTween.duration, 1.0);
        // Smooth Cubic In-Out easing
        const t =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        this.camera.position.lerpVectors(this.cameraTween.startPos, this.cameraTween.endPos, t);
        this.controls.target.lerpVectors(this.cameraTween.startTarget, this.cameraTween.endTarget, t);
        this.controls.update();

        if (progress >= 1.0) {
          this.cameraTween = null;
        }
      } else {
        this.controls.update();
      }

      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(tick);
    };

    tick();
  };

  private onWindowResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public dispose() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
