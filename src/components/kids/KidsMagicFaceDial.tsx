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
  RefreshCw,
  Compass,
} from 'lucide-react';

interface KidsMagicFaceDialProps {
  onRotateAzimuth: (deltaAngle: number) => void;
  onRotateElevation: (deltaPitch: number) => void;
  onZoomChange: (deltaDist: number) => void;
  onResetCamera: () => void;
}

export const KidsMagicFaceDial: React.FC<KidsMagicFaceDialProps> = ({
  onRotateAzimuth,
  onRotateElevation,
  onZoomChange,
  onResetCamera,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const intervalRef = React.useRef<number | null>(null);

  const startContinuous = (action: () => void) => {
    action();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(action, 75);
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
      className="relative flex flex-col items-center p-2 sm:p-2.5 bg-[#FFE600] rounded-3xl border-[3.5px] border-black shadow-[5px_5px_0px_#1B1B4B] select-none pointer-events-auto"
    >
      {/* Title Badge with Minimize Button */}
      <div className="flex items-center justify-between w-full gap-2 mb-1.5">
        <div className="flex items-center gap-1 text-[9px] font-['Fredoka',sans-serif] font-black uppercase text-purple-900 bg-white/90 px-2 py-0.5 rounded-full border border-black/30 shadow-[1px_1px_0_#000]">
          <Compass className="w-3 h-3 text-[#FF2A6D]" />
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

      {/* Arcade D-Pad 3D Orbit Compass */}
      <div className="relative w-24 h-24 sm:w-26 sm:h-26 flex items-center justify-center bg-white/90 rounded-full border-[3px] border-black shadow-[2px_2px_0_#000]">
        {/* Top: Pitch Up */}
        <motion.button
          id="btn-nav-pitch-up"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onPointerDown={() => {
            soundEngine.playDialClick(750);
            triggerHaptic('light');
            startContinuous(() => onRotateElevation(0.25));
          }}
          onPointerUp={stopContinuous}
          onPointerLeave={stopContinuous}
          className="absolute top-1 p-1 bg-[#8FA2FA] hover:bg-indigo-300 text-black rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer touch-none"
          title="Pitch Up (Look from Top)"
        >
          <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
        </motion.button>

        {/* Bottom: Pitch Down */}
        <motion.button
          id="btn-nav-pitch-down"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onPointerDown={() => {
            soundEngine.playDialClick(650);
            triggerHaptic('light');
            startContinuous(() => onRotateElevation(-0.25));
          }}
          onPointerUp={stopContinuous}
          onPointerLeave={stopContinuous}
          className="absolute bottom-1 p-1 bg-[#8FA2FA] hover:bg-indigo-300 text-black rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer touch-none"
          title="Pitch Down (Look from Bottom)"
        >
          <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
        </motion.button>

        {/* Left: Orbit Left */}
        <motion.button
          id="btn-nav-orbit-left"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onPointerDown={() => {
            soundEngine.playDialClick(800);
            triggerHaptic('light');
            startContinuous(() => onRotateAzimuth(-0.35));
          }}
          onPointerUp={stopContinuous}
          onPointerLeave={stopContinuous}
          className="absolute left-1 p-1 bg-[#75F0C2] hover:bg-emerald-300 text-black rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer touch-none"
          title="Orbit Left ⟲"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
        </motion.button>

        {/* Right: Orbit Right */}
        <motion.button
          id="btn-nav-orbit-right"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onPointerDown={() => {
            soundEngine.playDialClick(900);
            triggerHaptic('light');
            startContinuous(() => onRotateAzimuth(0.35));
          }}
          onPointerUp={stopContinuous}
          onPointerLeave={stopContinuous}
          className="absolute right-1 p-1 bg-[#75F0C2] hover:bg-emerald-300 text-black rounded-lg border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer touch-none"
          title="Orbit Right ⟳"
        >
          <RotateCw className="w-3.5 h-3.5 stroke-[3]" />
        </motion.button>

        {/* Center: Reset Camera Target */}
        <motion.button
          id="btn-nav-reset"
          whileHover={{ scale: 1.2, rotate: 180 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            triggerHaptic('medium');
            onResetCamera();
          }}
          className="flex items-center justify-center w-7 h-7 bg-[#FF2A6D] text-white rounded-full border-[2px] border-black shadow-[1px_1px_0_#000] cursor-pointer hover:bg-[#FF4365] transition-transform"
          title="Reset Camera View"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
        </motion.button>
      </div>

      {/* Bottom: Zoom In / Zoom Out Pill */}
      <div className="flex items-center justify-between w-full gap-1 mt-1.5 bg-white/95 px-2 py-0.5 rounded-full border-[2px] border-black shadow-[1.5px_1.5px_0_#000]">
        <button
          id="btn-nav-zoom-in"
          onPointerDown={() => {
            soundEngine.playDialClick(650);
            triggerHaptic('light');
            startContinuous(() => onZoomChange(-0.6));
          }}
          onPointerUp={stopContinuous}
          onPointerLeave={stopContinuous}
          className="p-0.5 rounded-md text-black hover:bg-yellow-200 active:scale-90 transition-all cursor-pointer touch-none"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <span className="text-[8px] font-black text-gray-700 tracking-wider uppercase">Zoom</span>

        <button
          id="btn-nav-zoom-out"
          onPointerDown={() => {
            soundEngine.playDialClick(500);
            triggerHaptic('light');
            startContinuous(() => onZoomChange(0.6));
          }}
          onPointerUp={stopContinuous}
          onPointerLeave={stopContinuous}
          className="p-0.5 rounded-md text-black hover:bg-yellow-200 active:scale-90 transition-all cursor-pointer touch-none"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </motion.div>
  );
};
