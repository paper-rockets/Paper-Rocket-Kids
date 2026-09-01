import React from 'react';
import { motion } from 'motion/react';
import { soundEngine } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { Play, Pause, RotateCw } from 'lucide-react';

interface KidsScrubberBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  isTurntable: boolean;
  onToggleTurntable: () => void;
}

export const KidsScrubberBar: React.FC<KidsScrubberBarProps> = ({
  isPlaying,
  onTogglePlay,
  isTurntable,
  onToggleTurntable,
}) => {
  return (
    <div
      id="kids-scrubber-bar"
      className="flex items-center select-none pointer-events-auto"
    >
      {/* Yellow Pill Bar: Shader Animation & 3D Turntable Playback Controls */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FFE600] rounded-full border-[3px] border-black shadow-[4px_4px_0_#1B1B4B]">
        {/* Play / Pause Animation */}
        <motion.button
          id="btn-media-play"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            soundEngine.playBubblePop(isPlaying ? 0.9 : 1.3);
            triggerHaptic('selection');
            onTogglePlay();
          }}
          className="p-1.5 bg-white text-black rounded-full border-[2px] border-black shadow-[1.5px_1.5px_0_#000] cursor-pointer"
          title={isPlaying ? 'Pause Magic FX' : 'Play Magic FX'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
        </motion.button>

        {/* 360 Turntable Auto-Rotate Button */}
        <motion.button
          id="btn-turntable"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            soundEngine.playDialClick(isTurntable ? 500 : 1000);
            triggerHaptic('medium');
            onToggleTurntable();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-[2px] border-black text-xs font-bold font-['Fredoka',sans-serif] transition-colors cursor-pointer ${
            isTurntable
              ? 'bg-[#FF2A6D] text-white shadow-[2px_2px_0_#000]'
              : 'bg-white text-black hover:bg-yellow-100 shadow-[1.5px_1.5px_0_#000]'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isTurntable ? 'animate-spin' : ''}`} />
          <span>360° Spin</span>
        </motion.button>
      </div>
    </div>
  );
};
