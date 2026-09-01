import React from 'react';
import { motion } from 'motion/react';
import { SparkleStar } from './SparkleStar';
import { UITheme } from '../../types';
import { soundEngine } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { TOYBOX_MODELS } from '../../core/sampleModels';
import { SHADER_PRESETS } from '../../core/animatedShaders';
import { STICKER_CATALOG } from '../../constants/presets';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Sun,
  Undo2,
  Redo2,
  Trash2,
  Tag,
  Play,
  Pause,
} from 'lucide-react';

interface KidsHeaderBarProps {
  onOpenToybox: () => void;
  onOpenShaders: () => void;
  onOpenStickers: () => void;
  onOpenSky: () => void;
  onJellyBoing: () => void;
  symmetryCount: number;
  onToggleSymmetry: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onClearCanvas?: () => void;
  activeTheme: UITheme;
  onSelectTheme: (theme: UITheme) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isSpinning?: boolean;
  onToggleSpin?: () => void;
}

export const KidsHeaderBar: React.FC<KidsHeaderBarProps> = ({
  onOpenToybox,
  onOpenShaders,
  onOpenStickers,
  onOpenSky,
  onJellyBoing,
  symmetryCount,
  onToggleSymmetry,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onClearCanvas,
  activeTheme,
  onSelectTheme,
  isMuted,
  onToggleMute,
  isSpinning = false,
  onToggleSpin,
}) => {
  const themes: { id: UITheme; name: string; color: string }[] = [
    { id: 'periwinkle', name: 'Periwinkle', color: '#8FA2FA' },
    { id: 'cotton_candy', name: 'Pink Cotton', color: '#FFB6D9' },
    { id: 'mint_splash', name: 'Mint Splash', color: '#75F0C2' },
    { id: 'cyber_twilight', name: 'Cyber Neon', color: '#2A2D4A' },
  ];

  return (
    <header
      className="relative z-30 flex items-center justify-between gap-2 px-3 py-2 border-b-[3.5px] border-black shadow-[0_4px_0_#000] select-none transition-colors duration-300"
      style={{
        backgroundColor: themes.find((t) => t.id === activeTheme)?.color || '#8FA2FA',
      }}
    >
      {/* 1. Group: Content Hub (Toybox, Shaders, Stickers) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 3D Toybox */}
        <motion.button
          id="btn-open-toybox"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundEngine.playBubblePop(1.1);
            triggerHaptic('light');
            onOpenToybox();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#FF70B8] text-white font-extrabold text-xs sm:text-sm rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          <span className="text-base sm:text-lg">🧸</span>
          <span className="font-['Fredoka',sans-serif] tracking-wide whitespace-nowrap">3D Toybox</span>
        </motion.button>

        {/* Magic Shaders */}
        <motion.button
          id="btn-open-shaders"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundEngine.playBubblePop(1.3);
            triggerHaptic('light');
            onOpenShaders();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#00F0FF] text-black font-extrabold text-xs sm:text-sm rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
          <span className="font-['Fredoka',sans-serif] whitespace-nowrap hidden xs:inline">Shaders</span>
        </motion.button>

        {/* 3D Stickers */}
        <motion.button
          id="btn-open-stickers"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundEngine.playBubblePop(1.2);
            triggerHaptic('light');
            onOpenStickers();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#FFE600] text-black font-extrabold text-xs sm:text-sm rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
          <span className="font-['Fredoka',sans-serif] whitespace-nowrap hidden sm:inline">Stickers</span>
        </motion.button>
      </div>

      {/* 2. Group: Editing Tools Container (Undo / Redo / Clear) */}
      <div className="flex items-center gap-1 p-1 bg-white/80 rounded-2xl border-[2.5px] border-black shadow-[2px_2px_0_#000]">
        {/* Undo Button */}
        <motion.button
          id="btn-header-undo"
          whileHover={canUndo ? { scale: 1.08 } : undefined}
          whileTap={canUndo ? { scale: 0.92 } : undefined}
          disabled={!canUndo}
          onClick={() => {
            if (canUndo && onUndo) {
              triggerHaptic('light');
              onUndo();
            }
          }}
          title="Undo Last Stroke (Ctrl+Z)"
          className={`flex items-center gap-1 px-2 py-1 font-bold text-xs rounded-xl border-[2px] border-black transition-all ${
            canUndo
              ? 'bg-white text-black shadow-[1.5px_1.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer hover:bg-yellow-50'
              : 'bg-white/40 text-black/30 border-black/30 cursor-not-allowed shadow-none'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">Undo</span>
        </motion.button>

        {/* Redo Button */}
        <motion.button
          id="btn-header-redo"
          whileHover={canRedo ? { scale: 1.08 } : undefined}
          whileTap={canRedo ? { scale: 0.92 } : undefined}
          disabled={!canRedo}
          onClick={() => {
            if (canRedo && onRedo) {
              triggerHaptic('light');
              onRedo();
            }
          }}
          title="Redo Stroke (Ctrl+Y)"
          className={`flex items-center gap-1 px-2 py-1 font-bold text-xs rounded-xl border-[2px] border-black transition-all ${
            canRedo
              ? 'bg-white text-black shadow-[1.5px_1.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer hover:bg-yellow-50'
              : 'bg-white/40 text-black/30 border-black/30 cursor-not-allowed shadow-none'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">Redo</span>
        </motion.button>

        {/* Clear Drawing Button */}
        <motion.button
          id="btn-header-clear"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            if (onClearCanvas) {
              soundEngine.playEraserWhoosh();
              triggerHaptic('medium');
              onClearCanvas();
            }
          }}
          title="Clear Drawing"
          className="flex items-center gap-1 px-2 py-1 bg-white text-red-600 font-bold text-xs rounded-xl border-[2px] border-black shadow-[1.5px_1.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer hover:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">Clear</span>
        </motion.button>
      </div>

      {/* 3. Group: Environment, FX & 360 Spin Container */}
      <div className="flex items-center gap-1.5">
        {/* Jelly Wobble / Boing Button */}
        <motion.button
          id="btn-jelly-boing"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            triggerHaptic('heavy');
            onJellyBoing();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#75F0C2] text-black font-extrabold text-xs rounded-xl border-[2.5px] border-black shadow-[2.5px_2.5px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          <span className="text-sm">🍮</span>
          <span className="font-['Fredoka',sans-serif] hidden sm:inline">Boing!</span>
        </motion.button>

        {/* 360 Spin Play/Pause Button */}
        <motion.button
          id="btn-360-spin"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            soundEngine.playBubblePop(1.4);
            triggerHaptic('selection');
            onToggleSpin?.();
          }}
          title={isSpinning ? 'Pause 360° Spin' : 'Start 360° Spin'}
          className={`flex items-center gap-1 px-2.5 py-1.5 font-extrabold text-xs rounded-xl border-[2.5px] border-black shadow-[2.5px_2.5px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer ${
            isSpinning ? 'bg-[#FFE600] text-black animate-pulse' : 'bg-white text-black hover:bg-yellow-50'
          }`}
        >
          {isSpinning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="font-['Fredoka',sans-serif] hidden md:inline">360°</span>
        </motion.button>

        {/* Sky Worlds */}
        <motion.button
          id="btn-sky-worlds"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundEngine.playBubblePop(1.0);
            triggerHaptic('light');
            onOpenSky();
          }}
          className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-[#B042FF] text-white font-bold text-xs rounded-xl border-[2.5px] border-black shadow-[2.5px_2.5px_0_#000] cursor-pointer"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Sky</span>
        </motion.button>

        {/* Audio Mute / Unmute */}
        <button
          id="btn-toggle-sound"
          onClick={() => {
            triggerHaptic('light');
            onToggleMute();
          }}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 bg-white text-black rounded-xl border-[2.5px] border-black shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-black" />}
        </button>
      </div>
    </header>
  );
};
