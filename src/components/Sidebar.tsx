import React from 'react';
import { ViewMode, DisplayOptions, VenueObject } from '../types/venue';
import { CAMERA_PRESETS } from '../data/defaultVenue';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  displayOptions: DisplayOptions;
  onChangeDisplayOptions: (opts: Partial<DisplayOptions>) => void;
  objects: VenueObject[];
  roomAreaSqM: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  displayOptions,
  onChangeDisplayOptions,
  objects,
  roomAreaSqM
}) => {
  const audienceCount = objects.filter((o) => o.audience).length;
  const vipCount = objects
    .filter((o) => o.vip && o.kind === 'sofa')
    .reduce((sum, o) => sum + (o.seats || 1), 0);

  return (
    <aside className="w-full lg:w-[265px] bg-[#10212b] border-r border-[#314652] p-4 sm:p-5 overflow-y-auto flex-shrink-0 select-none flex flex-col justify-between">
      <div>
        {/* Section Head */}
        <div className="mb-5">
          <span className="text-[10px] tracking-[2px] font-semibold text-[#70d4e9] block uppercase">
            EXPLORE THE SPACE
          </span>
          <h1 className="text-xl sm:text-[22px] font-bold text-white mt-1 mb-1 tracking-tight">
            สำรวจพื้นที่งาน
          </h1>
          <p className="text-xs text-[#98b2bf] leading-relaxed">
            ห้องประชุม + ลงทะเบียน + ลานถ่ายภาพ + ทางเดิน
          </p>
        </div>

        {/* 12 Camera View Presets Grid */}
        <div className="grid grid-cols-2 gap-1.5 mb-6" aria-label="เลือกมุมมอง">
          {CAMERA_PRESETS.map((preset) => {
            const isActive = currentView === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectView(preset.id)}
                className={`text-[11px] font-medium text-left px-2.5 py-2.5 rounded-lg border transition-all truncate ${
                  isActive
                    ? 'bg-[#a0e8e4] text-[#09323c] font-semibold border-[#a0e8e4] shadow-sm'
                    : 'bg-[#17303c] text-[#eaf3f5] border-[#36515e] hover:bg-[#254451] hover:border-[#76cddd]'
                }`}
                title={preset.description}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {/* Display Controls Details */}
        <details className="border-t border-[#314652] pt-4" open>
          <summary className="cursor-pointer font-semibold text-xs sm:text-sm text-white mb-3 hover:text-[#a0e8e4] transition-colors">
            การแสดงผล
          </summary>

          <div className="space-y-2.5 text-xs">
            {/* Transparent Walls Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-[#c2d5df] hover:text-white">
              <input
                type="checkbox"
                checked={displayOptions.transparentWalls}
                onChange={(e) => onChangeDisplayOptions({ transparentWalls: e.target.checked })}
                className="w-4 h-4 accent-[#6cd8df] rounded bg-[#17303c] border-[#36515e]"
              />
              <span>ผนังโปร่งใส</span>
            </label>

            {/* Transparency Slider */}
            <div className="pl-6 space-y-1">
              <div className="flex justify-between text-[11px] text-[#91afbd]">
                <span>ความโปร่งใส</span>
                <span className="font-mono text-[#a0e8e4]">
                  {displayOptions.transparentWalls ? `${displayOptions.wallTransparency}%` : 'ทึบ'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={displayOptions.wallTransparency}
                disabled={!displayOptions.transparentWalls}
                onChange={(e) => onChangeDisplayOptions({ wallTransparency: Number(e.target.value) })}
                className="w-full accent-[#6cd8df] bg-[#17303c] h-1.5 rounded cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Zone Guides */}
            <label className="flex items-center gap-2 cursor-pointer text-[#c2d5df] hover:text-white">
              <input
                type="checkbox"
                checked={displayOptions.zoneGuides}
                onChange={(e) => onChangeDisplayOptions({ zoneGuides: e.target.checked })}
                className="w-4 h-4 accent-[#6cd8df] rounded bg-[#17303c] border-[#36515e]"
              />
              <span>เส้นแบ่งโซน & ป้ายชื่อ</span>
            </label>

            {/* Ground Grid */}
            <label className="flex items-center gap-2 cursor-pointer text-[#c2d5df] hover:text-white">
              <input
                type="checkbox"
                checked={displayOptions.grid}
                onChange={(e) => onChangeDisplayOptions({ grid: e.target.checked })}
                className="w-4 h-4 accent-[#6cd8df] rounded bg-[#17303c] border-[#36515e]"
              />
              <span>ตารางพื้นสเกล (Grid)</span>
            </label>

            {/* Equipment Lights */}
            <label className="flex items-center gap-2 cursor-pointer text-[#c2d5df] hover:text-white">
              <input
                type="checkbox"
                checked={displayOptions.equipmentLights}
                onChange={(e) => onChangeDisplayOptions({ equipmentLights: e.target.checked })}
                className="w-4 h-4 accent-[#6cd8df] rounded bg-[#17303c] border-[#36515e]"
              />
              <span>แสงอุปกรณ์และสปอตไลต์</span>
            </label>

            {/* Blueprint Floor Overlay */}
            <label className="flex items-center gap-2 cursor-pointer text-[#c2d5df] hover:text-white">
              <input
                type="checkbox"
                checked={displayOptions.blueprintOverlay}
                onChange={(e) => onChangeDisplayOptions({ blueprintOverlay: e.target.checked })}
                className="w-4 h-4 accent-[#6cd8df] rounded bg-[#17303c] border-[#36515e]"
              />
              <span>ลายเส้นแปลน 2D บนพื้น (CAD)</span>
            </label>
          </div>
        </details>
      </div>

      {/* Model-Calculated Project Stats */}
      <div className="border-t border-[#314652] pt-4 mt-6 text-xs text-[#98b2bf] space-y-1">
        <strong className="text-[#b0e5e5] block text-sm font-semibold">
          {audienceCount} ผู้ชม + {vipCount} VIP
        </strong>
        <span className="block text-[11px] text-[#c2d5df]">
          {objects.length} ชิ้นในโมเดลจริง
        </span>
        <p className="text-[11px] text-[#91afbd] leading-relaxed pt-1">
          พื้นที่ในแปลน {roomAreaSqM.toFixed(1)} ตร.ม. (ขนาดและตำแหน่งเป็นค่าประมาณ)
        </p>
        <small className="text-[10px] text-[#63828d] block pt-1.5 leading-normal">
          สำเนาสำหรับทีม · ไม่อัปเดตตามแอปในเครื่องอัตโนมัติ
        </small>
      </div>
    </aside>
  );
};
