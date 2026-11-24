import React, { useState } from 'react';
import { X, Upload, Check, RefreshCw, FileText, Layers, AlertCircle, Eye } from 'lucide-react';
import { RoomSpec } from '../types/venue';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomSpec: RoomSpec;
  onUpdateRoomSpec: (newSpec: RoomSpec) => void;
  projectTitle: string;
  onUpdateProjectTitle: (title: string, venue: string) => void;
  venueName: string;
  onUploadCustomPlan: (dataUrl: string) => void;
  hasCustomPlan: boolean;
  onToggleBlueprintOverlay: () => void;
  isBlueprintOverlayActive: boolean;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  roomSpec,
  onUpdateRoomSpec,
  projectTitle,
  onUpdateProjectTitle,
  venueName,
  onUploadCustomPlan,
  hasCustomPlan,
  onToggleBlueprintOverlay,
  isBlueprintOverlayActive
}) => {
  const [titleInput, setTitleInput] = useState(projectTitle);
  const [venueInput, setVenueInput] = useState(venueName);
  const [lengthInput, setLengthInput] = useState(roomSpec.length);
  const [widthInput, setWidthInput] = useState(roomSpec.width);
  const [heightInput, setHeightInput] = useState(roomSpec.height);
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProjectTitle(titleInput, venueInput);
    onUpdateRoomSpec({
      ...roomSpec,
      length: Number(lengthInput),
      width: Number(widthInput),
      height: Number(heightInput)
    });
    onClose();
  };

  const handleFileDrop = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onUploadCustomPlan(ev.target.result as string);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-['Prompt',sans-serif]">
      <div className="w-full max-w-2xl bg-[#0c1f2b] border border-[#314652] rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#243d49]">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#88ebe2]" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              แปลน 2D อ้างอิง & ปรับแต่งข้อมูลสถานที่
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#9bbcc5] hover:text-white hover:bg-[#163745] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 py-4 overflow-y-auto pr-1">
          {/* Section 1: Upload User's Floorplan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#88ebe2] uppercase tracking-wider">
                1. อัปโหลดภาพแปลนจริง (PNG / JPG / PDF)
              </span>
              {hasCustomPlan && (
                <span className="text-[11px] text-[#4ade80] flex items-center space-x-1 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>กำลังแสดงผลบนพื้น 3D</span>
                </span>
              )}
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.[0]) handleFileDrop(e.dataTransfer.files[0]);
              }}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-[#88ebe2] bg-[#143d4d]/50'
                  : 'border-[#2d4b58] bg-[#091d28]/70 hover:border-[#60a9b8]'
              }`}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) handleFileDrop(f);
                };
                input.click();
              }}
            >
              <Upload className="w-8 h-8 mx-auto text-[#70d4e9] mb-2" />
              <div className="text-xs sm:text-sm font-semibold text-white">
                ลากไฟล์ภาพแปลนมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </div>
              <p className="text-[11px] text-[#8caab5] mt-1">
                ภาพแปลนจะถูกฉายลงบนพื้น 3D ทันที เพื่อให้คุณเทียบสัดส่วนกับโมเดล 3D แบบ 1:1
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={onToggleBlueprintOverlay}
                className={`text-xs px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-colors ${
                  isBlueprintOverlayActive
                    ? 'bg-[#194b58] text-[#76e3e8] border-[#67e0e9]'
                    : 'bg-[#15323d] text-[#9bbcc5] border-[#4b6470] hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {isBlueprintOverlayActive ? '✓ เปิดแสดงลายเส้นแปลน 2D บนพื้น' : 'เปิดลายเส้นแปลน 2D บนพื้น'}
                </span>
              </button>

              <span className="text-[11px] text-[#63828d]">
                รองรับการหมุนมุม &quot;แปลนด้านบน&quot; สำหรับตรวจแบบ
              </span>
            </div>
          </div>

          {/* Section 2: Dimension Customizer Form */}
          <form onSubmit={handleApply} className="space-y-4 pt-2 border-t border-[#243d49]">
            <span className="text-xs font-semibold text-[#88ebe2] uppercase tracking-wider block">
              2. กำหนดขนาดและข้อมูลโครงการ (เมตร)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#9bbcc5] mb-1 font-medium">ชื่องาน / โครงการ</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-[#15323d] border border-[#3b5966] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#70d4e9]"
                />
              </div>

              <div>
                <label className="block text-[#9bbcc5] mb-1 font-medium">สถานที่จัดงาน</label>
                <input
                  type="text"
                  value={venueInput}
                  onChange={(e) => setVenueInput(e.target.value)}
                  className="w-full bg-[#15323d] border border-[#3b5966] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#70d4e9]"
                />
              </div>

              <div>
                <label className="block text-[#9bbcc5] mb-1 font-medium">
                  ความยาวห้องประชุม (เมตร)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="10"
                  max="50"
                  value={lengthInput}
                  onChange={(e) => setLengthInput(Number(e.target.value))}
                  className="w-full bg-[#15323d] border border-[#3b5966] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#70d4e9]"
                />
              </div>

              <div>
                <label className="block text-[#9bbcc5] mb-1 font-medium">
                  ความกว้างห้องประชุม (เมตร)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="8"
                  max="35"
                  value={widthInput}
                  onChange={(e) => setWidthInput(Number(e.target.value))}
                  className="w-full bg-[#15323d] border border-[#3b5966] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#70d4e9]"
                />
              </div>
            </div>

            <div className="p-3 bg-[#0a1b24] border border-[#234350] rounded-xl flex items-start space-x-2.5 text-xs text-[#9bbcc5]">
              <AlertCircle className="w-4 h-4 text-[#fbbf24] mt-0.5 flex-shrink-0" />
              <div className="leading-relaxed">
                <span className="text-white font-semibold block">สเกลและหน่วยวัด:</span>
                โมเดลนี้ใช้หน่วยเมตรจริง (1 Unit = 1.0 เมตร) ตามระยะของแปลน หากแปลนไม่มีตัวเลขระบุ สามารถใช้ระยะผนังด้านหนึ่งเป็นตัวอ้างอิงเพื่อคำนวณอัตราส่วนได้ทันที
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#15323d] hover:bg-[#204553] text-[#eaf3f5] text-xs font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#9ce8e2] hover:bg-[#bbfff5] text-[#092e36] text-xs font-bold transition-colors shadow-sm"
              >
                บันทึกและอัปเดตโมเดล 3D
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
