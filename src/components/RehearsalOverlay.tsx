import React, { useState, useEffect } from 'react';
import { RehearsalChapter } from '../types/venue';
import { Play, Pause, SkipBack, SkipForward, X, Camera, Clock, Info } from 'lucide-react';

interface RehearsalOverlayProps {
  timeline: RehearsalChapter[];
  currentChapterIndex: number;
  onSelectChapterIndex: (index: number) => void;
  onExitRehearsal: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  autoCamera: boolean;
  onToggleAutoCamera: () => void;
}

export const RehearsalOverlay: React.FC<RehearsalOverlayProps> = ({
  timeline,
  currentChapterIndex,
  onSelectChapterIndex,
  onExitRehearsal,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  autoCamera,
  onToggleAutoCamera
}) => {
  const currentChapter = timeline[currentChapterIndex] || timeline[0];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 text-[#ecf8fc] font-['Prompt',sans-serif] flex flex-col justify-between p-3 sm:p-6 overflow-hidden">
      {/* Top Bar Overlay */}
      <div className="flex items-center justify-between gap-3 pointer-events-auto">
        <div className="bg-[#09232e]/90 border border-[#41616c] rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-xl backdrop-blur-sm">
          <small className="block text-[#9bbcc5] text-[10px] tracking-[1.5px] uppercase font-semibold">
            REHEARSAL MODE · โหมดจำลองกำหนดการ
          </small>
          <strong className="text-xs sm:text-sm font-semibold text-white">
            จำลองลำดับเวลางานและการเคลื่อนที่ของผู้เข้าร่วม
          </strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoCamera}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              autoCamera
                ? 'bg-[#194b58] text-[#76e3e8] border-[#67e0e9]'
                : 'bg-[#15323d] text-[#9bbcc5] border-[#4b6470] hover:text-white'
            }`}
            title="กล้องจะเคลื่อนที่ไปยังโซนของกิจกรรมโดยอัตโนมัติ"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">กล้องอัตโนมัติ: {autoCamera ? 'เปิด' : 'ปิด'}</span>
          </button>

          <button
            onClick={onExitRehearsal}
            className="px-3 py-1.5 rounded-lg bg-[#15323d] hover:bg-[#204553] text-[#eaf3f5] border border-[#41616c] text-xs font-medium flex items-center space-x-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>กลับสู่ผังปกติ</span>
          </button>
        </div>
      </div>

      {/* Floating Caption Card (Top Left below topbar) */}
      <div className="pointer-events-auto max-w-[420px] w-full bg-gradient-to-br from-[#071b29]/95 to-[#0c2e3d]/90 border border-[#42616a] rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md self-start mt-2">
        <div className="flex items-center justify-between text-[11px] text-[#67e5e5] tracking-[1.5px] font-semibold mb-1">
          <span>{currentChapter.time} น. · {currentChapter.category}</span>
          <span className="text-[#a0bbc5] font-normal">{currentChapter.durationMinutes} นาที</span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
          {currentChapter.title}
        </h2>

        <p className="text-xs text-[#d0e0e5] leading-relaxed mb-3">
          {currentChapter.description}
        </p>

        {currentChapter.cue && (
          <div className="border-l-2 border-[#60d9df] pl-3 py-1 bg-[#09232e]/50 rounded-r-lg">
            <span className="block text-[10px] text-[#70d4e9] font-semibold uppercase">
              คิวงาน & คำแนะนำทีมงาน (CUE):
            </span>
            <p className="text-[11px] text-[#b4d2db] leading-relaxed mt-0.5">
              {currentChapter.cue}
            </p>
          </div>
        )}

        <div className="mt-3 pt-2.5 border-t border-[#42616a]/60 flex items-center justify-between text-[10px] text-[#7e9ea8]">
          <span>ตัวคน 3D ในฉากจะเปลี่ยนตำแหน่งตามช่วงเวลา</span>
          <span className="text-[#a0e8e4] font-medium">โซน: {currentChapter.targetView}</span>
        </div>
      </div>

      {/* Bottom Timeline & Controls Bar */}
      <div className="pointer-events-auto w-full bg-[#081d28]/95 border border-[#3d5c68] rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md space-y-3">
        {/* Main Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onTogglePlay}
              className="min-w-[100px] sm:min-w-[110px] h-9 px-4 rounded-xl bg-[#91e9e0] hover:bg-[#bbfff5] text-[#082a31] font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>พัก (PAUSE)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>เล่น (PLAY)</span>
                </>
              )}
            </button>

            {/* Skip Prev / Next */}
            <button
              disabled={currentChapterIndex === 0}
              onClick={() => onSelectChapterIndex(Math.max(0, currentChapterIndex - 1))}
              className="p-2 rounded-lg bg-[#15323d] hover:bg-[#204553] disabled:opacity-40 text-white border border-[#4b6470] transition-colors"
              title="ช่วงก่อนหน้า"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={currentChapterIndex === timeline.length - 1}
              onClick={() => onSelectChapterIndex(Math.min(timeline.length - 1, currentChapterIndex + 1))}
              className="p-2 rounded-lg bg-[#15323d] hover:bg-[#204553] disabled:opacity-40 text-white border border-[#4b6470] transition-colors"
              title="ช่วงถัดไป"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Simulation Digital Clock */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#061922] border border-[#2b4b57]">
              <Clock className="w-3.5 h-3.5 text-[#8ee7e8]" />
              <span className="font-mono text-base sm:text-lg font-bold text-[#8ee7e8]">
                {currentChapter.time}
              </span>
              <span className="text-[10px] text-[#7ba2af]">น.</span>
            </div>
          </div>

          {/* Speed Multiplier & Notes */}
          <div className="flex items-center gap-3">
            <label className="flex items-center space-x-1.5 text-xs text-[#9bbcc5]">
              <span>ความเร็ว:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => onChangeSpeed(Number(e.target.value))}
                className="bg-[#15323d] text-white border border-[#4b6470] rounded-md px-2 py-1 text-xs focus:outline-none"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </label>

            <span className="hidden md:inline-block text-[10px] text-[#63828d]">
              * ภาพจำลองเพื่อซ้อมลำดับงาน ไม่ใช่การวิเคราะห์การอพยพ
            </span>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={timeline.length - 1}
            step={1}
            value={currentChapterIndex}
            onChange={(e) => onSelectChapterIndex(Number(e.target.value))}
            className="w-full accent-[#76e3e8] bg-[#15323d] h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Chapters Navigation Buttons Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
          {timeline.map((chap, idx) => {
            const isActive = currentChapterIndex === idx;
            return (
              <button
                key={chap.id}
                onClick={() => onSelectChapterIndex(idx)}
                className={`text-left p-1.5 sm:p-2 rounded-lg border text-[10px] sm:text-[11px] transition-all truncate ${
                  isActive
                    ? 'bg-[#194b58] border-[#67e0e9] text-white font-semibold shadow-sm'
                    : 'bg-[#0f2833] border-[#2b4855] text-[#8cabb7] hover:text-white hover:bg-[#163745]'
                }`}
              >
                <span className="block text-[9px] text-[#67e5e5] font-mono">{chap.time} น.</span>
                <span className="truncate block font-medium">{chap.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
