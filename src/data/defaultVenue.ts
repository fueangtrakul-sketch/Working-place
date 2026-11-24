import { RoomSpec, VenueObject, ZoneDefinition, CameraPreset, RehearsalChapter } from '../types/venue';

export const DEFAULT_ROOM: RoomSpec = {
  length: 22.0, // เมตร (แกน X: -11 ถึง +11)
  width: 14.0,  // เมตร (แกน Z: -7 ถึง +7)
  height: 4.2,  // เมตร (แกน Y)
  wallThickness: 0.25,
  annexWidth: 5.5, // โถงด้านหน้า/ทางเดิน (แกน X: -16.5 ถึง -11)
};

export const ZONES: ZoneDefinition[] = [
  {
    id: 'stage',
    name: 'โซนเวทีหลัก & จอ LED',
    color: '#38bdf8',
    bounds: { minX: 6.0, maxX: 10.5, minZ: -5.5, maxZ: 5.5 },
    description: 'เวทียกสูง 60 ซม. จอ LED ขนาดใหญ่ และโพเดียมบรรยาย'
  },
  {
    id: 'vip',
    name: 'ที่นั่งผู้บริหาร / VIP',
    color: '#facc15',
    bounds: { minX: 3.2, maxX: 5.8, minZ: -4.5, maxZ: 4.5 },
    description: 'โซฟาเดี่ยว 8 ที่นั่ง พร้อมโต๊ะกลางกระจกสำหรับแขกผู้ใหญ่'
  },
  {
    id: 'audience',
    name: 'โซนที่นั่งผู้ชม',
    color: '#4ade80',
    bounds: { minX: -6.5, maxX: 2.8, minZ: -6.0, maxZ: 6.0 },
    description: 'เก้าอี้เบาะจัดแบบเธียเตอร์ 140 ที่นั่ง เว้นทางเดินกลาง 1.6 ม.'
  },
  {
    id: 'control',
    name: 'โต๊ะควบคุมแสง–เสียง (FOH)',
    color: '#a78bfa',
    bounds: { minX: -8.5, maxX: -6.2, minZ: 3.5, maxZ: 6.5 },
    description: 'มิกเซอร์เสียง คอนโซลจัดแสงไฟ และมอนิเตอร์ควบคุมภาพ'
  },
  {
    id: 'booth',
    name: 'บูธนิทรรศการนวัตกรรม',
    color: '#fb923c',
    bounds: { minX: -10.5, maxX: -7.0, minZ: -6.2, maxZ: -1.5 },
    description: 'บูธจัดแสดงโปสเตอร์ผลงานและต้นแบบผลิตภัณฑ์ 3 จุด'
  },
  {
    id: 'learning',
    name: 'ชุดเรียนรู้ & จุดสาธิต',
    color: '#f472b6',
    bounds: { minX: -10.5, maxX: -7.0, minZ: -1.0, maxZ: 2.5 },
    description: 'โต๊ะสาธิตพร้อมอุปกรณ์ชุดทดลองและหน้าจออินเทอร์แอคทีฟ'
  },
  {
    id: 'registration',
    name: 'จุดลงทะเบียน & ต้อนรับ',
    color: '#2dd4bf',
    bounds: { minX: -16.0, maxX: -11.5, minZ: -4.5, maxZ: 4.5 },
    description: 'เคาน์เตอร์ลงทะเบียน 3 จุด พร้อมเสากั้นสายสะพายจัดคิว'
  },
  {
    id: 'photo',
    name: 'ลานถ่ายภาพ & สื่อมวลชน',
    color: '#e879f9',
    bounds: { minX: -16.0, maxX: -11.5, minZ: -6.5, maxZ: -4.5 },
    description: 'ฉาก Backdrop โลโก้งาน พรมแดง และชุดไฟสตูดิโอ'
  }
];

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'site',
    name: 'ภาพรวมทุกโซน',
    description: 'มุมมอง Bird-Eye Perspective แสดงทั้งห้องประชุมและโถงลงทะเบียน',
    position: [-22, 26, 26],
    target: [-3, 0.5, 0]
  },
  {
    id: 'top',
    name: 'แปลนด้านบน',
    description: 'มุมมองแปลนตั้งฉาก (Orthographic view) เทียบกับไฟล์แปลน 2D',
    position: [-3, 36, 0.001],
    target: [-3, 0, 0],
    ortho: true
  },
  {
    id: 'audience',
    name: 'สายตาผู้ชม',
    description: 'ระดับสายตาผู้เข้าร่วมงาน (ความสูง 1.3 ม.) มองไปยังเวที',
    position: [-4.5, 1.35, 0],
    target: [8.5, 1.8, 0]
  },
  {
    id: 'av',
    name: 'หน้าเวที',
    description: 'มุมประจันหน้าเวที ตรวจสอบความชัดเจนของจอ LED และมุมโพเดียม',
    position: [2.5, 2.2, 0],
    target: [8.5, 1.6, 0]
  },
  {
    id: 'vip',
    name: 'ที่นั่งผู้บริหาร / VIP',
    description: 'มุมมองจากโซฟาแขกเกียรติยศแถวหน้า พร้อมระยะห่างหน้าเวที',
    position: [2.5, 1.8, 2.8],
    target: [4.6, 0.7, 0]
  },
  {
    id: 'booth',
    name: 'บูธนิทรรศการ',
    description: 'โซนนิทรรศการผลงานและโปสเตอร์ด้านหลังห้องประชุม',
    position: [-5.2, 2.5, -4.5],
    target: [-8.8, 1.2, -4.0]
  },
  {
    id: 'learning',
    name: 'ชุดเรียนรู้ / จุดสาธิต',
    description: 'มุมมองใกล้โต๊ะทดลองและชุดสาธิตอุปกรณ์',
    position: [-6.0, 2.0, 0.8],
    target: [-8.8, 1.0, 0.8]
  },
  {
    id: 'control',
    name: 'ควบคุมแสง–เสียง',
    description: 'มุมมองโต๊ะควบคุมระบบภาพ เสียง และแสงเวที (FOH)',
    position: [-5.0, 2.2, 5.0],
    target: [-7.5, 1.0, 5.0]
  },
  {
    id: 'registration',
    name: 'ลงทะเบียน',
    description: 'บริเวณโถงทางเข้า เคาน์เตอร์เช็กอิน และเสากั้นคิว',
    position: [-11.0, 3.2, 0],
    target: [-14.0, 1.0, 0]
  },
  {
    id: 'photo',
    name: 'ถ่ายภาพ / สื่อ',
    description: 'จุด Backdrop ถ่ายภาพที่ระลึกสำหรับผู้บริหารและสื่อมวลชน',
    position: [-12.5, 2.2, -3.2],
    target: [-14.5, 1.4, -5.5]
  },
  {
    id: 'corridor',
    name: 'ทางเดิน',
    description: 'โถงทางเดินหลักและแนวประตูเข้าสู่ห้องประชุม 2 ฝั่ง',
    position: [-15.5, 2.8, 6.0],
    target: [-11.0, 1.0, 0]
  },
  {
    id: 'stage',
    name: 'มองจากเวที',
    description: 'มุมมองของผู้บรรยายจากบนเวที มองออกไปยังผู้ฟังทั้งห้อง',
    position: [8.5, 2.0, 0],
    target: [-4.0, 1.2, 0]
  }
];

// Helper to generate 140 audience chairs (10 rows x 14 chairs with 1.6m center aisle)
function generateChairs(): VenueObject[] {
  const chairs: VenueObject[] = [];
  const rows = 10;
  const cols = 14;
  const rowSpacing = 0.9;
  const colSpacing = 0.65;
  const aisleWidth = 1.4;

  const startX = -6.0;
  const totalLength = (rows - 1) * rowSpacing;

  for (let r = 0; r < rows; r++) {
    const x = startX + r * rowSpacing;
    for (let c = 0; c < cols; c++) {
      let z = (c - (cols - 1) / 2) * colSpacing;
      // Add aisle gap in the middle
      if (c >= cols / 2) {
        z += aisleWidth / 2;
      } else {
        z -= aisleWidth / 2;
      }

      chairs.push({
        id: `chair_${r}_${c}`,
        kind: 'chair',
        name: `เก้าอี้ แถว ${String.fromCharCode(65 + r)} ที่นั่ง ${c + 1}`,
        zone: 'audience',
        x,
        y: 0,
        z,
        w: 0.52,
        h: 0.82,
        d: 0.54,
        angle: 0, // facing positive X (towards stage)
        audience: true
      });
    }
  }
  return chairs;
}

// 8 VIP Executive Sofas with Coffee Tables
function generateVipLounge(): VenueObject[] {
  const vips: VenueObject[] = [];
  const sofaSpacing = 1.1;

  // Row 1 (4 VIP sofas)
  for (let i = 0; i < 4; i++) {
    const z = (i - 1.5) * sofaSpacing;
    vips.push({
      id: `vip_sofa_1_${i}`,
      kind: 'sofa',
      name: `โซฟา VIP แถว 1 ที่นั่ง ${i + 1}`,
      zone: 'vip',
      x: 3.8,
      y: 0,
      z,
      w: 0.85,
      h: 0.82,
      d: 0.85,
      angle: 0,
      vip: true,
      seats: 1
    });
  }

  // Row 2 (4 VIP sofas)
  for (let i = 0; i < 4; i++) {
    const z = (i - 1.5) * sofaSpacing;
    vips.push({
      id: `vip_sofa_2_${i}`,
      kind: 'sofa',
      name: `โซฟา VIP แถว 2 ที่นั่ง ${i + 1}`,
      zone: 'vip',
      x: 5.0,
      y: 0,
      z,
      w: 0.85,
      h: 0.82,
      d: 0.85,
      angle: 0,
      vip: true,
      seats: 1
    });
  }

  // Coffee Tables between rows
  vips.push(
    {
      id: 'vip_table_1',
      kind: 'table',
      name: 'โต๊ะกลาง VIP กระจก 1',
      zone: 'vip',
      x: 4.4,
      y: 0,
      z: -1.1,
      w: 0.6,
      h: 0.45,
      d: 0.9,
      vip: true
    },
    {
      id: 'vip_table_2',
      kind: 'table',
      name: 'โต๊ะกลาง VIP กระจก 2',
      zone: 'vip',
      x: 4.4,
      y: 0,
      z: 1.1,
      w: 0.6,
      h: 0.45,
      d: 0.9,
      vip: true
    }
  );

  return vips;
}

export const VENUE_OBJECTS: VenueObject[] = [
  // STAGE & AV
  {
    id: 'stage_main',
    kind: 'stage',
    name: 'เวทีหลักยกพื้น 60 ซม.',
    zone: 'stage',
    x: 8.5,
    y: 0,
    z: 0,
    w: 4.2,
    h: 0.6,
    d: 10.5
  },
  {
    id: 'led_screen_main',
    kind: 'screen',
    name: 'จอ LED เวทีความคมชัดสูง 8x3.2 ม.',
    zone: 'stage',
    x: 10.2,
    y: 0.6,
    z: 0,
    w: 0.35,
    h: 3.2,
    d: 8.4,
    equipmentLight: true
  },
  {
    id: 'stage_podium',
    kind: 'podium',
    name: 'โพเดียมบรรยายพร้อมไมโครโฟนก้านยาว',
    zone: 'stage',
    x: 7.2,
    y: 0.6,
    z: -3.0,
    w: 0.65,
    h: 1.15,
    d: 0.55
  },
  {
    id: 'speaker_left',
    kind: 'speaker',
    name: 'ลำโพง Line Array ซ้าย',
    zone: 'stage',
    x: 7.2,
    y: 1.8,
    z: -4.8,
    w: 0.45,
    h: 1.2,
    d: 0.5,
    equipmentLight: true
  },
  {
    id: 'speaker_right',
    kind: 'speaker',
    name: 'ลำโพง Line Array ขวา',
    zone: 'stage',
    x: 7.2,
    y: 1.8,
    z: 4.8,
    w: 0.45,
    h: 1.2,
    d: 0.5,
    equipmentLight: true
  },

  // FOH CONTROL DESK
  {
    id: 'av_desk_sound',
    kind: 'av_console',
    name: 'โต๊ะควบคุมระบบเสียงดิจิทัล',
    zone: 'control',
    x: -7.5,
    y: 0,
    z: 4.5,
    w: 1.6,
    h: 0.85,
    d: 0.8,
    equipmentLight: true
  },
  {
    id: 'av_desk_lighting',
    kind: 'av_console',
    name: 'โต๊ะควบคุมระบบไฟและภาพ',
    zone: 'control',
    x: -7.5,
    y: 0,
    z: 5.6,
    w: 1.6,
    h: 0.85,
    d: 0.8,
    equipmentLight: true
  },

  // EXHIBITION BOOTHS
  {
    id: 'booth_1',
    kind: 'booth',
    name: 'บูธนิทรรศการ 1: Smart City',
    zone: 'booth',
    x: -8.8,
    y: 0,
    z: -5.0,
    w: 2.2,
    h: 2.4,
    d: 1.6,
    equipmentLight: true
  },
  {
    id: 'booth_2',
    kind: 'booth',
    name: 'บูธนิทรรศการ 2: AI & Health',
    zone: 'booth',
    x: -8.8,
    y: 0,
    z: -3.0,
    w: 2.2,
    h: 2.4,
    d: 1.6,
    equipmentLight: true
  },
  {
    id: 'booth_3',
    kind: 'booth',
    name: 'บูธนิทรรศการ 3: Green Energy',
    zone: 'booth',
    x: -8.8,
    y: 0,
    z: -1.0,
    w: 2.2,
    h: 2.4,
    d: 1.6,
    equipmentLight: true
  },

  // LEARNING STATIONS
  {
    id: 'learning_station_1',
    kind: 'table',
    name: 'โต๊ะชุดเรียนรู้ 1: IoT Kits',
    zone: 'learning',
    x: -8.8,
    y: 0,
    z: 1.0,
    w: 1.8,
    h: 0.8,
    d: 1.0,
    equipmentLight: true
  },
  {
    id: 'learning_station_2',
    kind: 'table',
    name: 'โต๊ะชุดเรียนรู้ 2: Robot Demonstration',
    zone: 'learning',
    x: -8.8,
    y: 0,
    z: 2.5,
    w: 1.8,
    h: 0.8,
    d: 1.0,
    equipmentLight: true
  },

  // REGISTRATION & FOYER
  {
    id: 'reg_counter_1',
    kind: 'registration_desk',
    name: 'เคาน์เตอร์ลงทะเบียน 1 (A-M)',
    zone: 'registration',
    x: -14.0,
    y: 0,
    z: -1.8,
    w: 1.8,
    h: 1.05,
    d: 0.75,
    equipmentLight: true
  },
  {
    id: 'reg_counter_2',
    kind: 'registration_desk',
    name: 'เคาน์เตอร์ลงทะเบียน 2 (N-Z)',
    zone: 'registration',
    x: -14.0,
    y: 0,
    z: 0.2,
    w: 1.8,
    h: 1.05,
    d: 0.75,
    equipmentLight: true
  },
  {
    id: 'reg_counter_vip',
    kind: 'registration_desk',
    name: 'เคาน์เตอร์ลงทะเบียนแขก VIP & วิทยากร',
    zone: 'registration',
    x: -14.0,
    y: 0,
    z: 2.2,
    w: 1.8,
    h: 1.05,
    d: 0.75,
    equipmentLight: true
  },

  // PHOTO BOOTH & PRESS
  {
    id: 'photo_backdrop',
    kind: 'photo_backdrop',
    name: 'ฉาก Backdrop ถ่ายภาพ 4.5 ม.',
    zone: 'photo',
    x: -15.8,
    y: 0,
    z: -5.4,
    w: 0.3,
    h: 2.6,
    d: 3.8,
    equipmentLight: true
  },

  // Add VIP Lounge Objects
  ...generateVipLounge(),

  // Add 140 Audience Chairs
  ...generateChairs()
];

export const REHEARSAL_TIMELINE: RehearsalChapter[] = [
  {
    id: 'chap_1',
    time: '08:30',
    durationMinutes: 30,
    title: 'เปิดลงทะเบียน & ต้อนรับผู้เข้าร่วมงาน',
    category: 'Registration & Welcome',
    description: 'ผู้เข้าร่วมงานทยอยลงทะเบียนที่เคาน์เตอร์ Foyer ตรวจสอบบัตร QR Code รับเอกสาร และของที่ระลึก',
    cue: 'เจ้าหน้าที่จุดลงทะเบียน 3 ท่านประจำเคาน์เตอร์, เจ้าหน้าที่ต้อนรับพาแขก VIP ไปยังห้องพักรับรอง',
    targetView: 'registration',
    attendeeState: {
      registrationCount: 45,
      exhibitionCount: 15,
      audienceCount: 10,
      vipCount: 2,
      stageCount: 0,
      photoCount: 8
    }
  },
  {
    id: 'chap_2',
    time: '09:00',
    durationMinutes: 30,
    title: 'ชมนิทรรศการ & ถ่ายภาพที่ระลึก',
    category: 'Exhibition & Networking',
    description: 'ผู้เข้าร่วมงานเดินชมนิทรรศการ 3 บูธ ทดลองใช้งานชุดเรียนรู้ และถ่ายภาพร่วมกันหน้า Backdrop',
    cue: 'เปิดไฟส่องบูธ 100%, เจ้าหน้าที่ประจำชุดเรียนรู้พร้อมสาธิต, ช่างภาพสแตนด์บายที่จุด Photo Backdrop',
    targetView: 'booth',
    attendeeState: {
      registrationCount: 15,
      exhibitionCount: 50,
      audienceCount: 30,
      vipCount: 4,
      stageCount: 1,
      photoCount: 25
    }
  },
  {
    id: 'chap_3',
    time: '09:30',
    durationMinutes: 30,
    title: 'เข้าสู่ห้องประชุม & พิธีเปิดงาน',
    category: 'Opening Ceremony',
    description: 'ผู้ดำเนินรายการเชิญผู้เข้าร่วมงานเข้าห้องประชุม นั่งตามผังที่นั่ง ผู้บริหารและแขก VIP นั่งแถวหน้า',
    cue: 'เสียงดนตรีโหมโรง, ปิดประตูท้ายห้อง, เปิดไฟ Follow-spot โพเดียม, จอ LED แสดงวิดีทัศน์เปิดงาน',
    targetView: 'audience',
    attendeeState: {
      registrationCount: 2,
      exhibitionCount: 5,
      audienceCount: 125,
      vipCount: 8,
      stageCount: 2,
      photoCount: 2
    }
  },
  {
    id: 'chap_4',
    time: '10:00',
    durationMinutes: 60,
    title: 'การบรรยายพิเศษ Keynote Speech',
    category: 'Keynote & Presentation',
    description: 'วิทยากรหลักขึ้นบรรยายบนเวที นำเสนอผ่านจอ LED ผู้ฟังทั้งห้องร่วมรับฟังและจดบันทึก',
    cue: 'ปรับไฟหรี่โซนผู้ชม 30%, ควบคุมสไลด์จอ LED และเสียงไมค์ลอยวิทยากร',
    targetView: 'av',
    attendeeState: {
      registrationCount: 0,
      exhibitionCount: 2,
      audienceCount: 138,
      vipCount: 8,
      stageCount: 1,
      photoCount: 0
    }
  },
  {
    id: 'chap_5',
    time: '11:00',
    durationMinutes: 45,
    title: 'ช่วงเสวนาและสาธิตเทคโนโลยี',
    category: 'Panel Discussion & Demo',
    description: 'ตัวแทนผู้เชี่ยวชาญ 4 ท่านร่วมเสวนาบนเวที และสลับสาธิตผลงานจากจุดเรียนรู้แบบถ่ายทอดสดขึ้นจอ',
    cue: 'เปิดไมค์รอบทิศทาง 4 ตัวบนเวที, สลับสัญญาณกล้องถ่ายทอดสดจากโต๊ะสาธิต',
    targetView: 'stage',
    attendeeState: {
      registrationCount: 1,
      exhibitionCount: 8,
      audienceCount: 135,
      vipCount: 8,
      stageCount: 4,
      photoCount: 1
    }
  },
  {
    id: 'chap_6',
    time: '11:45',
    durationMinutes: 45,
    title: 'ถ่ายภาพหมู่ & สัมภาษณ์สื่อมวลชน',
    category: 'Group Photo & Press Conference',
    description: 'เชิญคณะผู้บริหารและวิทยากรถ่ายภาพร่วมกันบนเวที จากนั้นให้สัมภาษณ์สื่อมวลชนที่ลาน Backdrop',
    cue: 'เปิดไฟสว่างเต็มห้อง (Full House Lights), จัดบันไดทางขึ้น-ลงเวทีสองฝั่ง, เสิร์ฟอาหารว่างที่โถงด้านนอก',
    targetView: 'photo',
    attendeeState: {
      registrationCount: 4,
      exhibitionCount: 20,
      audienceCount: 45,
      vipCount: 8,
      stageCount: 10,
      photoCount: 40
    }
  }
];
