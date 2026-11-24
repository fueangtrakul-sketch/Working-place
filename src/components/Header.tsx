import React from 'react';
import { Camera, Maximize, Minimize, Map, Play, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  venueName: string;
  onSnapshot: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onOpenPlanModal: () => void;
  onStartRehearsal: () => void;
  isRehearsalMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  venueName,
  onSnapshot,
  onToggleFullscreen,
  isFullscreen,
  onOpenPlanModal,
  onStartRehearsal,
  isRehearsalMode
}) => {
  return (
    <header className="h-[74px] sm:h-[78px] px-4 sm:px-6 bg-[#0c1921] border-b border-[#2c414b] flex items-center justify-between gap-3 select-none z-30">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#88ebe2] to-[#1c8eb6] text-[#082f3e] flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md flex-shrink-0 relative">
          <span>E</span>
          <span className="text-xs sm:text-sm absolute top-1 right-1.5 font-mono">↗</span>
        </div>

        <div className="min-w-0">
          <strong className="block text-sm sm:text-base font-semibold text-white tracking-tight truncate max-w-[48vw] sm:max-w-none">
            {title}
          </strong>
          <small className="block text-[#95abb7] text-xs font-normal truncate">
            {venueName}
          </small>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <span className="hidden md:inline-flex items-center text-[11px] text-[#a2e7dd] px-2.5 py-1 rounded-full border border-[#3b625f] bg-[#0c242c]">
          สำหรับชม
        </span>

        <button
          onClick={onOpenPlanModal}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#17303c] hover:bg-[#254451] text-[#eaf3f5] border border-[#36515e] hover:border-[#76cddd] text-xs font-medium transition-colors"
          title="ดูแปลน 2D / อัปโหลดแปลนของฉัน"
        >
          <Map className="w-3.5 h-3.5 text-[#70d4e9]" />
          <span className="hidden sm:inline">แปลน 2D / อัปโหลด</span>
        </button>

        <button
          onClick={onSnapshot}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#17303c] hover:bg-[#254451] text-[#eaf3f5] border border-[#36515e] hover:border-[#76cddd] text-xs font-medium transition-colors"
          title="บันทึกภาพมุมมองปัจจุบันเป็น PNG"
        >
          <Camera className="w-3.5 h-3.5 text-[#a0e8e4]" />
          <span>บันทึกภาพ</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 sm:px-3 sm:py-2 rounded-lg bg-[#17303c] hover:bg-[#254451] text-[#eaf3f5] border border-[#36515e] hover:border-[#76cddd] text-xs font-medium transition-colors flex items-center space-x-1.5"
          title={isFullscreen ? 'ออกจากเต็มจอ' : 'ดูแบบเต็มจอ'}
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isFullscreen ? 'ย่อจอ' : 'เต็มจอ'}</span>
        </button>

        {!isRehearsalMode && (
          <button
            onClick={onStartRehearsal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#9ce8e2] hover:bg-[#bbfff5] text-[#092e36] font-semibold text-xs transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>จำลองกำหนดการ</span>
          </button>
        )}
      </div>
    </header>
  );
};
