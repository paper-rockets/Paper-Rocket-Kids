import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SparkleStar } from './SparkleStar';
import { BrushType } from '../../types';
import { BRUSH_SIZES, CANDY_SWATCHES } from '../../constants/presets';
import { soundEngine } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import {
  Paintbrush,
  PaintBucket,
  Sparkles,
  Wand2,
  Eraser,
  Trash2,
  Tag,
  Undo2,
  Redo2,
  Heart,
  Plus,
  Pipette,
} from 'lucide-react';

interface KidsVerticalToolDockProps {
  activeBrush: BrushType;
  onSelectBrush: (brush: BrushType) => void;
  activeSizeId: string;
  onSelectSize: (sizeId: string, radius: number) => void;
  activeColor: string;
  onSelectColor: (color: string) => void;
  onClearCanvas: () => void;
  onOpenStickerTray: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const KidsVerticalToolDock: React.FC<KidsVerticalToolDockProps> = ({
  activeBrush,
  onSelectBrush,
  activeSizeId,
  onSelectSize,
  activeColor,
  onSelectColor,
  onClearCanvas,
  onOpenStickerTray,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('remix3d_favorite_colors');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return ['#FF2A6D', '#FFE600', '#00F0FF', '#75F0C2', '#B042FF', '#FF9E00'];
  });

  const handleAddFavorite = () => {
    if (!favorites.some((c) => c.toLowerCase() === activeColor.toLowerCase())) {
      const next = [activeColor, ...favorites].slice(0, 6);
      setFavorites(next);
      try {
        localStorage.setItem('remix3d_favorite_colors', JSON.stringify(next));
      } catch (_) {}
      soundEngine.playBubblePop(1.5);
      triggerHaptic('success');
    }
  };

  const tools: { id: BrushType; name: string; icon: React.ReactNode; color: string }[] = [
    { id: 'flat_paint', name: 'Flat Paint', icon: <Paintbrush className="w-5 h-5" />, color: '#FF70B8' },
    { id: 'bucket', name: '1-Tap Fill', icon: <PaintBucket className="w-5 h-5" />, color: '#00F0FF' },
    { id: 'stardust', name: 'Star Dust', icon: <Sparkles className="w-5 h-5" />, color: '#FFE600' },
    { id: 'magic_wand', name: 'Magic Glow', icon: <Wand2 className="w-5 h-5" />, color: '#8FA2FA' },
    { id: 'sticker', name: '3D Sticker', icon: <Tag className="w-5 h-5" />, color: '#75F0C2' },
    { id: 'eraser', name: 'Super Zap', icon: <Eraser className="w-5 h-5" />, color: '#FF9E00' },
  ];

  return (
    <motion.div
      id="kids-vertical-tool-dock"
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="relative flex flex-col gap-3 p-3 bg-[#FFE600] rounded-3xl border-[3.5px] border-black shadow-[6px_6px_0px_#1B1B4B] select-none max-w-[210px]"
    >
      {/* Gloss Highlight */}
      <div className="absolute top-2 left-4 right-8 h-2 bg-white/40 rounded-full pointer-events-none" />

      {/* Tool Selector Grid */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {tools.map((tool) => {
          const isSelected = activeBrush === tool.id;
          return (
            <motion.button
              key={tool.id}
              id={`tool-btn-${tool.id}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundEngine.playBubblePop(1.1);
                triggerHaptic('selection');
                onSelectBrush(tool.id);
                if (tool.id === 'sticker') {
                  onOpenStickerTray();
                }
              }}
              title={tool.name}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl border-[2.5px] border-black transition-all cursor-pointer ${
                isSelected
                  ? 'bg-black text-white shadow-[2px_2px_0_#FFE600] scale-105'
                  : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0_#000]'
              }`}
            >
              <span className={isSelected ? 'text-[#FFE600]' : 'text-black'}>{tool.icon}</span>
              <span className="text-[10px] font-['Fredoka',sans-serif] font-bold mt-0.5 leading-tight truncate w-full text-center">
                {tool.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Section Divider */}
      <div className="h-0.5 bg-black/20 rounded-full" />

      {/* Brush Sizes */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Fredoka',sans-serif] font-bold text-xs text-black">
            Pen Size
          </span>
          <SparkleStar size={14} color="#FF70B8" />
        </div>

        <div className="grid grid-cols-5 gap-1 bg-white/90 p-1 rounded-2xl border-[2.5px] border-black w-full overflow-hidden">
          {BRUSH_SIZES.map((size) => {
            const isSelected = activeSizeId === size.id;
            return (
              <button
                key={size.id}
                id={`size-fader-pill-${size.id}`}
                onClick={() => {
                  soundEngine.playDialClick(600 + size.radius * 2000);
                  triggerHaptic('light');
                  onSelectSize(size.id, size.radius);
                }}
                title={`${size.name} (${size.label})`}
                className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl border-[2px] border-black transition-all cursor-pointer min-w-0 ${
                  isSelected
                    ? 'bg-[#FF2A6D] text-white shadow-[1.5px_1.5px_0_#000] -translate-y-0.5'
                    : 'bg-[#FFE600] text-black hover:bg-yellow-300'
                }`}
              >
                {/* Center Groove Slit */}
                <div
                  className={`w-1 rounded-full mb-1 ${
                    isSelected ? 'bg-white' : 'bg-black/40'
                  }`}
                  style={{ height: `${6 + BRUSH_SIZES.indexOf(size) * 3}px` }}
                />
                <span className="text-[8.5px] font-black tracking-tighter truncate w-full text-center">
                  {size.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-0.5 bg-black/20 rounded-full" />

      {/* 16 Candy Swatch Strip & Custom Color Picker */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Fredoka',sans-serif] font-bold text-xs text-black">
            Candy Colors
          </span>
          <label
            htmlFor="custom-color-input"
            className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 rounded-full border border-black shadow-[1px_1px_0_#000] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            title="Pick Custom Color"
          >
            <Pipette className="w-2.5 h-2.5 text-black" />
            <div
              className="w-3 h-3 rounded-full border border-black shadow-inner"
              style={{ backgroundColor: activeColor }}
            />
            <input
              id="custom-color-input"
              type="color"
              value={activeColor.startsWith('#') ? activeColor : '#FF2A6D'}
              onChange={(e) => {
                onSelectColor(e.target.value);
                soundEngine.playDialClick(700);
              }}
              className="sr-only"
            />
          </label>
        </div>

        <div className="grid grid-cols-4 gap-1.5 bg-white/80 p-1.5 rounded-2xl border-[2.5px] border-black">
          {CANDY_SWATCHES.map((color, idx) => {
            const isSelected = activeColor.toLowerCase() === color.toLowerCase();
            return (
              <motion.button
                key={color}
                id={`swatch-btn-${idx}`}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  soundEngine.playBubblePop(0.8 + (idx / CANDY_SWATCHES.length) * 0.8);
                  triggerHaptic('selection');
                  onSelectColor(color);
                }}
                style={{ backgroundColor: color }}
                className={`w-full aspect-square rounded-xl border-[2px] border-black transition-transform cursor-pointer ${
                  isSelected ? 'scale-115 ring-2 ring-black shadow-[2px_2px_0_#000]' : 'shadow-[1px_1px_0_#000]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Favorites Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 font-['Fredoka',sans-serif] font-bold text-xs text-black">
            <Heart className="w-3 h-3 text-[#FF2A6D] fill-[#FF2A6D]" />
            <span>Favorites</span>
          </div>

          <motion.button
            id="btn-add-favorite-color"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddFavorite}
            title="Save Current Color to Favorites"
            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white text-black text-[9px] font-black rounded-full border border-black shadow-[1px_1px_0_#000] hover:bg-pink-100 cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5 stroke-[3]" />
            <span>Save</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-1 bg-white/80 p-1.5 rounded-2xl border-[2.5px] border-black overflow-x-auto scrollbar-none">
          {favorites.map((favColor, idx) => {
            const isSelected = activeColor.toLowerCase() === favColor.toLowerCase();
            return (
              <motion.button
                key={`${favColor}-${idx}`}
                id={`favorite-swatch-${idx}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  soundEngine.playBubblePop(1.1);
                  triggerHaptic('selection');
                  onSelectColor(favColor);
                }}
                style={{ backgroundColor: favColor }}
                title={`Favorite Color ${favColor}`}
                className={`flex-1 min-w-[22px] h-6 rounded-lg border-[2px] border-black transition-transform cursor-pointer ${
                  isSelected ? 'scale-115 ring-2 ring-black shadow-[1.5px_1.5px_0_#000]' : 'shadow-[1px_1px_0_#000]'
                }`}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
