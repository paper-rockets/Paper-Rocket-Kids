import React from 'react';
import { motion } from 'motion/react';
import { soundEngine } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import {
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  MoveUp,
  MoveDown,
  Home,
  Compass,
} from 'lucide-react';

interface KidsMagicFaceDialProps {
  onRotateAzimuth: (deltaAngle: number) => void;
  onRotateElevation: (deltaPitch: number) => void;
  onPanVertical: (deltaY: number) => void;
  onZoomChange: (deltaDist: number) => void;
  onResetCamera: () => void;
}

export const KidsMagicFaceDial: React.FC<KidsMagicFaceDialProps> = ({
  onRotateAzimuth,
  onRotateElevation,
  onPanVertical,
  onZoomChange,
  onResetCamera,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const intervalRef = React.useRef<number | null>(null);

  const startContinuous = (action: () => void) => {
    action();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(action, 65);
  };

  const stopContinuous = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  if (!isExpanded) {
    return (
      <motion.button
        id="kids-magic-face-dial-toggle"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          soundEngine.playBubblePop(1.2);
          triggerHaptic('light');
          setIsExpanded(true);
        }}
        title="Open 3D Navigator"
        className="flex items-center gap-1.5 px-3 py-2 bg-[#FFE600] text-black font-['Fredoka',sans-serif] font-bold text-xs rounded-full border-[3px] border-black shadow-[4px_4px_0_#1B1B4B] cursor-pointer hover:bg-yellow-300 pointer-events-auto"
      >
        <Compass className="w-4 h-4 text-[#FF2A6D] stroke-[2.5]" />
        <span>3D Cam</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      id="kids-magic-face-dial"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative flex flex-col items-center p-2.5 bg-[#FFE600] rounded-3xl border-[3.5px] border-black shadow-[5px_5px_0px_#1B1B4B] select-none pointer-events-auto"
    >
      {/* Title Header with Minimize Button */}
      <div className="flex items-center justify-between w-full gap-2 mb-2">
        <div className="flex items-center gap-1 text-[10px] font-['Fredoka',sans-serif] font-black uppercase text-purple-950 bg-white/90 px-2 py-0.5 rounded-full border border-black/30 shadow-[1px_1px_0_#000]">
          <Compass className="w-3.5 h-3.5 text-[#FF2A6D]" />
          <span>3D Navigator</span>
        </div>

        <button
          onClick={() => {
            soundEngine.playBubblePop(0.9);
            setIsExpanded(false);
          }}
          title="Minimize Navigator"
          className="text-[10px] font-bold bg-white text-black px-1.5 py-0.5 rounded-full border border-black shadow-[1px_1px_0_#000] hover:bg-gray-100 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Main Controls Section: Orbit Cross + Vertical Pan Column */}
      <div className="flex items-center gap-2">
        {/* 1. Orbit Cross (Look Up / Down, Turn Left / Right, Reset Center) */}
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-28 h-28 p-1 bg-white/90 rounded-2xl border-[2.5px] border-black shadow-[2px_2px_0_#000] items-center justify-items-center">
          {/* Row 1, Col 2: Pitch Up (Look Top) */}
          <div className="col-start-2 row-start-1">
            <motion.button
              id="btn-nav-pitch-up"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onPointerDown={() => {
                soundEngine.playDialClick(750);
                triggerHaptic('light');
                startContinuous(() => onRotateElevation(0.2));
              }}
              onPointerUp={stopContinuous}
              onPointerLeave={stopContinuous}
              className="flex items-center justify-center w-8 h-8 bg-[#8FA2FA] hover:bg-indigo-300 text-black rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer touch-none"
              title="Pitch Up (Look from Top)"
            >
              <ChevronUp className="w-4 h-4 stroke-[3]" />
            </motion.button>
          </div>

          {/* Row 2, Col 1: Orbit Left */}
          <div className="col-start-1 row-start-2">
            <motion.button
              id="btn-nav-orbit-left"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onPointerDown={() => {
                soundEngine.playDialClick(800);
                triggerHaptic('light');
                startContinuous(() => onRotateAzimuth(-0.25));
              }}
              onPointerUp={stopContinuous}
              onPointerLeave={stopContinuous}
              className="flex items-center justify-center w-8 h-8 bg-[#75F0C2] hover:bg-emerald-300 text-black rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer touch-none"
              title="Turn Left"
            >
              <RotateCcw className="w-4 h-4 stroke-[3]" />
            </motion.button>
          </div>

          {/* Row 2, Col 2: Center RESET View Button (Clear rounded rectangle with label) */}
          <div className="col-start-2 row-start-2">
            <motion.button
              id="btn-nav-reset"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                soundEngine.playDialClick(1000);
                triggerHaptic('medium');
                onResetCamera();
              }}
              className="flex flex-col items-center justify-center w-8 h-8 bg-[#FF2A6D] text-white rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer hover:bg-[#FF4365] transition-transform"
              title="Reset View to Front"
            >
              <Home className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[7px] font-black uppercase tracking-tighter leading-none mt-0.5">RESET</span>
            </motion.button>
          </div>

          {/* Row 2, Col 3: Orbit Right */}
          <div className="col-start-3 row-start-2">
            <motion.button
              id="btn-nav-orbit-right"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onPointerDown={() => {
                soundEngine.playDialClick(900);
                triggerHaptic('light');
                startContinuous(() => onRotateAzimuth(0.25));
              }}
              onPointerUp={stopContinuous}
              onPointerLeave={stopContinuous}
              className="flex items-center justify-center w-8 h-8 bg-[#75F0C2] hover:bg-emerald-300 text-black rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer touch-none"
              title="Turn Right"
            >
              <RotateCw className="w-4 h-4 stroke-[3]" />
            </motion.button>
          </div>

          {/* Row 3, Col 2: Pitch Down (Look Bottom) */}
          <div className="col-start-2 row-start-3">
            <motion.button
              id="btn-nav-pitch-down"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onPointerDown={() => {
                soundEngine.playDialClick(650);
                triggerHaptic('light');
                startContinuous(() => onRotateElevation(-0.2));
              }}
              onPointerUp={stopContinuous}
              onPointerLeave={stopContinuous}
              className="flex items-center justify-center w-8 h-8 bg-[#8FA2FA] hover:bg-indigo-300 text-black rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer touch-none"
              title="Pitch Down (Look from Bottom)"
            >
              <ChevronDown className="w-4 h-4 stroke-[3]" />
            </motion.button>
          </div>
        </div>

        {/* 2. Dedicated Vertical Pan Column (Pan Up / Pan Down) */}
        <div className="flex flex-col items-center justify-between h-28 p-1 bg-white/90 rounded-2xl border-[2.5px] border-black shadow-[2px_2px_0_#000]">
          <motion.button
            id="btn-nav-pan-up"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onPointerDown={() => {
              soundEngine.playDialClick(700);
              triggerHaptic('light');
              startContinuous(() => onPanVertical(0.2));
            }}
            onPointerUp={stopContinuous}
            onPointerLeave={stopContinuous}
            className="flex items-center justify-center w-8 h-9 bg-[#00F0FF] hover:bg-cyan-300 text-black rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer touch-none"
            title="Pan Camera Up"
          >
            <MoveUp className="w-4 h-4 stroke-[2.5]" />
          </motion.button>

          <span className="text-[7.5px] font-black text-purple-900 tracking-wider uppercase writing-mode-vertical">
            PAN
          </span>

          <motion.button
            id="btn-nav-pan-down"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onPointerDown={() => {
              soundEngine.playDialClick(600);
              triggerHaptic('light');
              startContinuous(() => onPanVertical(-0.2));
            }}
            onPointerUp={stopContinuous}
            onPointerLeave={stopContinuous}
            className="flex items-center justify-center w-8 h-9 bg-[#00F0FF] hover:bg-cyan-300 text-black rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer touch-none"
            title="Pan Camera Down"
          >
            <MoveDown className="w-4 h-4 stroke-[2.5]" />
          </motion.button>
        </div>
      </div>

      {/* 3. Bottom Zoom Bar */}
      <div className="flex items-center justify-between w-full gap-1 mt-2 bg-white/95 px-2.5 py-1 rounded-full border-[2px] border-black shadow-[1.5px_1.5px_0_#000]">
        <button
          id="btn-nav-zoom-in"
          onPointerDown={() => {
            soundEngine.playDialClick(650);
            triggerHaptic('light');
            startContinuous(() => onZoomChange(-0.5));
          }}
          onPointerUp={stopContinuous}
          onPointerLeave={stopContinuous}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-black hover:bg-yellow-200 active:scale-90 transition-all cursor-pointer touch-none"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="text-[9px] font-black">+</span>
        </button>

        <span className="text-[8px] font-black text-gray-700 tracking-wider uppercase">ZOOM</span>

        <button
          id="btn-nav-zoom-out"
          onPointerDown={() => {
            soundEngine.playDialClick(500);
            triggerHaptic('light');
            startContinuous(() => onZoomChange(0.5));
          }}
          onPointerUp={stopContinuous}
          onPointerLeave={stopContinuous}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-black hover:bg-yellow-200 active:scale-90 transition-all cursor-pointer touch-none"
          title="Zoom Out (-)"
        >
          <span className="text-[9px] font-black">-</span>
          <ZoomOut className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </motion.div>
  );
};
