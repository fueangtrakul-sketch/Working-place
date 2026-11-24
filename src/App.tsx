import React, { useState, useEffect, useRef } from 'react';
import { SceneManager } from './three/SceneManager';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RehearsalOverlay } from './components/RehearsalOverlay';
import { PlanModal } from './components/PlanModal';
import { Toast } from './components/Toast';
import {
  DEFAULT_ROOM,
  VENUE_OBJECTS,
  ZONES,
  CAMERA_PRESETS,
  REHEARSAL_TIMELINE
} from './data/defaultVenue';
import { ViewMode, DisplayOptions, RoomSpec, VenueObject, RehearsalChapter } from './types/venue';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // Venue Metadata
  const [projectTitle, setProjectTitle] = useState('BEYOND THE GATEWAY');
  const [venueName, setVenueName] = useState('ห้องประชุม 201 · ศูนย์การประชุมและนิทรรศการ');
  const [roomSpec, setRoomSpec] = useState<RoomSpec>(DEFAULT_ROOM);
  const [objects, setObjects] = useState<VenueObject[]>(VENUE_OBJECTS);

  // View & Display State
  const [currentView, setCurrentView] = useState<ViewMode>('site');
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
    transparentWalls: true,
    wallTransparency: 85,
    zoneGuides: true,
    grid: false,
    equipmentLights: true,
    blueprintOverlay: false
  });

  // Rehearsal Mode State
  const [isRehearsalMode, setIsRehearsalMode] = useState<boolean>(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [autoCamera, setAutoCamera] = useState<boolean>(true);

  // UI Utilities
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [hasCustomPlan, setHasCustomPlan] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initialize SceneManager on mount
  useEffect(() => {
    if (!mountRef.current) return;

    const sm = new SceneManager(mountRef.current);
    sceneManagerRef.current = sm;

    sm.buildRoom(roomSpec, displayOptions);
    sm.buildObjects(objects);
    sm.buildZoneGuides(ZONES, displayOptions.zoneGuides);

    return () => {
      sm.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // 2. React to display option changes
  useEffect(() => {
    if (!sceneManagerRef.current) return;
    sceneManagerRef.current.applyDisplayOptions(displayOptions);
  }, [displayOptions]);

  // 3. React to room spec changes
  useEffect(() => {
    if (!sceneManagerRef.current) return;
    sceneManagerRef.current.buildRoom(roomSpec, displayOptions);
    sceneManagerRef.current.buildObjects(objects);
    sceneManagerRef.current.buildZoneGuides(ZONES, displayOptions.zoneGuides);
  }, [roomSpec, objects]);

  // 4. Camera View switching
  const handleSelectView = (view: ViewMode) => {
    setCurrentView(view);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setView(view);
    }
  };

  // 5. Rehearsal Mode playback timer
  useEffect(() => {
    if (!isRehearsalMode || !isPlaying) return;

    const baseDuration = 6000; // 6 seconds per chapter at 1x
    const interval = setInterval(() => {
      setCurrentChapterIndex((prev) => {
        const next = (prev + 1) % REHEARSAL_TIMELINE.length;
        return next;
      });
    }, baseDuration / playbackSpeed);

    return () => clearInterval(interval);
  }, [isRehearsalMode, isPlaying, playbackSpeed]);

  // 6. Update 3D Attendees & Auto-camera on chapter change
  useEffect(() => {
    if (!isRehearsalMode || !sceneManagerRef.current) return;

    const chap = REHEARSAL_TIMELINE[currentChapterIndex];
    sceneManagerRef.current.updateAttendees(chap);

    if (autoCamera && chap.targetView) {
      handleSelectView(chap.targetView);
    }
  }, [currentChapterIndex, isRehearsalMode, autoCamera]);

  // Start Rehearsal Mode
  const handleStartRehearsal = () => {
    setIsRehearsalMode(true);
    setIsPlaying(true);
    setCurrentChapterIndex(0);
    showToast('เข้าสู่โหมดจำลองกำหนดการลำดับงาน');
  };

  // Exit Rehearsal Mode
  const handleExitRehearsal = () => {
    setIsRehearsalMode(false);
    setIsPlaying(false);
    if (sceneManagerRef.current) {
      // Clear attendees when exiting
      sceneManagerRef.current.updateAttendees({
        ...REHEARSAL_TIMELINE[0],
        attendeeState: {
          registrationCount: 0,
          exhibitionCount: 0,
          audienceCount: 0,
          vipCount: 0,
          stageCount: 0,
          photoCount: 0
        }
      });
      sceneManagerRef.current.setView('site');
      setCurrentView('site');
    }
    showToast('กลับสู่โหมดสำรวจผังปกติ');
  };

  // Snapshot PNG Export
  const handleSnapshot = () => {
    if (!sceneManagerRef.current) return;
    const cleanTitle = projectTitle.replace(/\s+/g, '-');
    sceneManagerRef.current.captureSnapshot(`${cleanTitle}-${currentView}`);
    showToast(`บันทึกภาพมุมมอง "${currentViewLabel}" สำเร็จ`);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      showToast('เบราว์เซอร์นี้ไม่รองรับการแสดงผลเต็มจอ');
    }
  };

  // Custom blueprint floorplan upload
  const handleUploadCustomPlan = (dataUrl: string) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setCustomBlueprintImage(dataUrl);
      setDisplayOptions((prev) => ({ ...prev, blueprintOverlay: true }));
      setHasCustomPlan(true);
      showToast('นำภาพแปลนเข้าสู่พื้น 3D เรียบร้อย');
    }
  };

  const currentPreset = CAMERA_PRESETS.find((p) => p.id === currentView) || CAMERA_PRESETS[0];
  const currentViewLabel = currentPreset.name;
  const roomArea = roomSpec.length * roomSpec.width;

  return (
    <div className={`h-screen w-screen flex flex-col bg-[#0c1921] text-[#eaf3f5] overflow-hidden select-none ${isRehearsalMode ? 'rehearsal-mode' : ''}`}>
      {/* Top Header */}
      <Header
        title={projectTitle}
        venueName={venueName}
        onSnapshot={handleSnapshot}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        onOpenPlanModal={() => setIsPlanModalOpen(true)}
        onStartRehearsal={handleStartRehearsal}
        isRehearsalMode={isRehearsalMode}
      />

      {/* Main View Area: Sidebar + 3D Viewport */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Sidebar Controls (Hidden in Rehearsal Mode) */}
        {!isRehearsalMode && (
          <Sidebar
            currentView={currentView}
            onSelectView={handleSelectView}
            displayOptions={displayOptions}
            onChangeDisplayOptions={(opts) => setDisplayOptions((prev) => ({ ...prev, ...opts }))}
            objects={objects}
            roomAreaSqM={roomArea}
          />
        )}

        {/* 3D Viewport Container */}
        <section
          id="viewport"
          className="flex-1 relative bg-[#dce0df] min-w-0 min-h-0 overflow-hidden"
          aria-label="ผังงานสามมิติ"
        >
          {/* Mount canvas container */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Scene Title in Viewport (Hidden in Rehearsal Mode) */}
          {!isRehearsalMode && (
            <div className="absolute top-4 sm:top-5 left-4 sm:left-6 text-[#193b49] pointer-events-none select-none z-10">
              <span className="text-[10px] tracking-[2px] block uppercase font-semibold text-[#305969]">
                {projectTitle}
              </span>
              <strong className="text-base sm:text-lg font-bold block mt-0.5 text-[#0a2733]">
                {currentViewLabel}
              </strong>
            </div>
          )}

          {/* Bottom Hint (Hidden in Rehearsal Mode) */}
          {!isRehearsalMode && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/85 text-[#42616b] px-4 py-2 rounded-full text-xs font-medium shadow-md pointer-events-none whitespace-nowrap z-10">
              ลากเพื่อหมุน · เลื่อนหรือใช้สองนิ้วเพื่อซูม
            </div>
          )}

          {/* Rehearsal Simulation HUD Overlay */}
          {isRehearsalMode && (
            <RehearsalOverlay
              timeline={REHEARSAL_TIMELINE}
              currentChapterIndex={currentChapterIndex}
              onSelectChapterIndex={(idx) => setCurrentChapterIndex(idx)}
              onExitRehearsal={handleExitRehearsal}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={(sp) => setPlaybackSpeed(sp)}
              autoCamera={autoCamera}
              onToggleAutoCamera={() => setAutoCamera(!autoCamera)}
            />
          )}
        </section>
      </main>

      {/* Plan / Blueprint Modal */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        roomSpec={roomSpec}
        onUpdateRoomSpec={(newSpec) => setRoomSpec(newSpec)}
        projectTitle={projectTitle}
        onUpdateProjectTitle={(t, v) => {
          setProjectTitle(t);
          setVenueName(v);
        }}
        venueName={venueName}
        onUploadCustomPlan={handleUploadCustomPlan}
        hasCustomPlan={hasCustomPlan}
        onToggleBlueprintOverlay={() =>
          setDisplayOptions((prev) => ({ ...prev, blueprintOverlay: !prev.blueprintOverlay }))
        }
        isBlueprintOverlayActive={displayOptions.blueprintOverlay}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
