export type ViewMode =
  | 'site'
  | 'top'
  | 'audience'
  | 'av'
  | 'vip'
  | 'booth'
  | 'learning'
  | 'control'
  | 'registration'
  | 'photo'
  | 'corridor'
  | 'stage';

export interface CameraPreset {
  id: ViewMode;
  name: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
  ortho?: boolean;
}

export interface RoomSpec {
  length: number; // ความยาว (เมตร) - แกน X
  width: number;  // ความกว้าง (เมตร) - แกน Z
  height: number; // ความสูงผนัง (เมตร) - แกน Y
  wallThickness: number;
  annexWidth: number; // โถงทางเดิน/จุดลงทะเบียนเชื่อมต่อ
}

export type ObjectKind =
  | 'stage'
  | 'screen'
  | 'podium'
  | 'chair'
  | 'sofa'
  | 'table'
  | 'booth'
  | 'registration_desk'
  | 'photo_backdrop'
  | 'av_console'
  | 'truss_light'
  | 'speaker'
  | 'column'
  | 'stanchion'
  | 'plant'
  | 'banner';

export interface VenueObject {
  id: string;
  kind: ObjectKind;
  name: string;
  zone: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  angle?: number;
  audience?: boolean;
  vip?: boolean;
  seats?: number;
  color?: string;
  equipmentLight?: boolean;
}

export interface ZoneDefinition {
  id: string;
  name: string;
  color: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  description: string;
}

export interface RehearsalChapter {
  id: string;
  time: string; // e.g. "08:30"
  durationMinutes: number;
  title: string;
  category: string;
  description: string;
  cue: string;
  targetView: ViewMode;
  attendeeState: {
    registrationCount: number;
    exhibitionCount: number;
    audienceCount: number;
    vipCount: number;
    stageCount: number;
    photoCount: number;
  };
}

export interface DisplayOptions {
  transparentWalls: boolean;
  wallTransparency: number; // 0 to 100
  zoneGuides: boolean;
  grid: boolean;
  equipmentLights: boolean;
  blueprintOverlay: boolean;
}
