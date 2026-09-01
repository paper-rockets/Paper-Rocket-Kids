import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SparkleStar } from './SparkleStar';
import { ModelCategoryId, ShaderCategoryId, ShaderPreset, SkyPreset, StickerItem, ToyModelInfo } from '../../types';
import { TOYBOX_MODELS } from '../../core/sampleModels';
import { SHADER_PRESETS } from '../../core/animatedShaders';
import { SKY_PRESETS, STICKER_CATALOG } from '../../constants/presets';
import { soundEngine } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { X, Search, Sparkles, Box, Upload, Check } from 'lucide-react';

interface KidsToyConsoleModalProps {
  isOpen: boolean;
  initialTab?: 'toybox' | 'stickers' | 'shaders' | 'sky';
  onClose: () => void;
  currentModelId: string;
  onSelectModel: (model: ToyModelInfo) => void;
  onUploadModel?: (file: File) => void;
  activeShaderId: string;
  onSelectShader: (shader: ShaderPreset) => void;
  activeStickerEmoji: string;
  onSelectSticker: (sticker: StickerItem) => void;
  currentSkyId: string;
  onSelectSky: (sky: SkyPreset) => void;
}

export const KidsToyConsoleModal: React.FC<KidsToyConsoleModalProps> = ({
  isOpen,
  initialTab = 'toybox',
  onClose,
  currentModelId,
  onSelectModel,
  onUploadModel,
  activeShaderId,
  onSelectShader,
  activeStickerEmoji,
  onSelectSticker,
  currentSkyId,
  onSelectSky,
}) => {
  const [activeTab, setActiveTab] = useState<'toybox' | 'stickers' | 'shaders' | 'sky'>(initialTab);
  const [selectedModelCategory, setSelectedModelCategory] = useState<ModelCategoryId | 'all'>('all');
  const [selectedShaderCategory, setSelectedShaderCategory] = useState<ShaderCategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const modelCategories: { id: ModelCategoryId | 'all'; name: string; emoji: string }[] = [
    { id: 'all', name: 'All 37 Toys', emoji: '🌟' },
    { id: 'animals', name: 'Cute Animals', emoji: '🐱' },
    { id: 'cartoons', name: 'Pokémon & Anime', emoji: '⚡' },
    { id: 'houses', name: 'Fairytale Houses', emoji: '🍄' },
    { id: 'vehicles', name: 'Cyber Vehicles', emoji: '🏍️' },
    { id: 'shapes', name: 'Shapes & Easel', emoji: '🍩' },
  ];

  const shaderCategories: { id: ShaderCategoryId | 'all'; name: string; emoji: string }[] = [
    { id: 'all', name: 'All 27 Shaders', emoji: '✨' },
    { id: 'toon', name: 'Toon & Anime', emoji: '🖋️' },
    { id: 'magic', name: 'Fun & Magic', emoji: '🌈' },
    { id: 'elemental', name: 'Wonderlust', emoji: '🔥' },
    { id: 'cosmic', name: 'Cosmic & Sci-Fi', emoji: '🌌' },
  ];

  const filteredModels = TOYBOX_MODELS.filter((m) => {
    const matchesCat = selectedModelCategory === 'all' || m.category === selectedModelCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const filteredShaders = SHADER_PRESETS.filter((s) => {
    const matchesCat = selectedShaderCategory === 'all' || s.category === selectedShaderCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadModel) {
      soundEngine.playBubblePop(1.1);
      triggerHaptic('success');
      onUploadModel(file);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
        {/* Hidden 3D Model File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf,.obj,.stl"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* The Toy Console Modal Window */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-[#FFE600] rounded-3xl border-[4px] border-black shadow-[8px_8px_0px_#1B1B4B] overflow-hidden"
        >
          {/* Top Console Periwinkle Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#8FA2FA] border-b-[3.5px] border-black select-none">
            {/* 3 Circle Bubble Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playBubblePop(0.7);
                  onClose();
                }}
                className="w-4 h-4 rounded-full bg-[#FF2A6D] border-[2px] border-black shadow-[1px_1px_0_#000] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title="Close"
              />
              <div className="w-4 h-4 rounded-full bg-white border-[2px] border-black shadow-[1px_1px_0_#000]" />
              <div className="w-4 h-4 rounded-full bg-white border-[2px] border-black shadow-[1px_1px_0_#000]" />
              <span className="ml-3 font-['Righteous',sans-serif] text-black text-lg tracking-wide hidden sm:inline">
                TOY CONSOLE HUB
              </span>
            </div>

            {/* Sparkle Star + Close Button */}
            <div className="flex items-center gap-3">
              <SparkleStar size={22} color="#FFE600" />
              <button
                onClick={() => {
                  soundEngine.playBubblePop(0.8);
                  onClose();
                }}
                className="p-1.5 bg-white text-black rounded-xl border-[2.5px] border-black shadow-[2px_2px_0_#000] hover:bg-[#FF70B8] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/90 border-b-[3px] border-black overflow-x-auto select-none scrollbar-none">
            <button
              onClick={() => {
                soundEngine.playBubblePop(1.0);
                setActiveTab('toybox');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-[3px] border-black font-extrabold text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'toybox'
                  ? 'bg-[#FF70B8] text-white shadow-[3px_3px_0_#000] scale-105'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <span>🧸</span>
              <span className="font-['Fredoka',sans-serif]">3D Toybox ({TOYBOX_MODELS.length})</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playBubblePop(1.1);
                setActiveTab('shaders');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-[3px] border-black font-extrabold text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'shaders'
                  ? 'bg-[#00F0FF] text-black shadow-[3px_3px_0_#000] scale-105'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <span>✨</span>
              <span className="font-['Fredoka',sans-serif]">Magic Shaders (27)</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playBubblePop(1.2);
                setActiveTab('stickers');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-[3px] border-black font-extrabold text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'stickers'
                  ? 'bg-[#75F0C2] text-black shadow-[3px_3px_0_#000] scale-105'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <span>🏷️</span>
              <span className="font-['Fredoka',sans-serif]">3D Stickers (16)</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playBubblePop(1.3);
                setActiveTab('sky');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-[3px] border-black font-extrabold text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'sky'
                  ? 'bg-[#8FA2FA] text-white shadow-[3px_3px_0_#000] scale-105'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <span>🌅</span>
              <span className="font-['Fredoka',sans-serif]">Sky Worlds (5)</span>
            </button>
          </div>

          {/* Search & Upload Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white/70 border-b-[2px] border-black/20">
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-white px-3 py-1.5 rounded-xl border-[2px] border-black">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search toys & shaders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-bold outline-none bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs font-bold text-gray-400 hover:text-black">
                  ✕
                </button>
              )}
            </div>

            {/* Upload Custom 3D Model Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE600] text-black font-extrabold text-xs rounded-xl border-[2px] border-black shadow-[2px_2px_0_#000] hover:bg-[#FFF066] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              title="Upload your own .glb, .gltf, .obj, or .stl 3D file"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Upload 3D Model</span>
            </button>
          </div>

          {/* Interior Main Content Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[58vh] bg-[#FFFBEA]">
            {/* TAB 1: 3D TOYBOX MODELS */}
            {activeTab === 'toybox' && (
              <div className="space-y-4">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {modelCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        soundEngine.playDialClick(700);
                        setSelectedModelCategory(cat.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-[2px] border-black font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                        selectedModelCategory === cat.id
                          ? 'bg-[#FF2A6D] text-white shadow-[2px_2px_0_#000]'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* 3D Toybox Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {filteredModels.map((model) => {
                    const isSelected = currentModelId === model.id;
                    return (
                      <motion.div
                        key={model.id}
                        id={`toy-card-${model.id}`}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          soundEngine.playBubblePop(1.2);
                          triggerHaptic('success');
                          onSelectModel(model);
                          onClose();
                        }}
                        className={`relative flex flex-col items-center justify-between p-3.5 rounded-2xl border-[3px] border-black cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FFE600] shadow-[4px_4px_0_#000] ring-3 ring-pink-500'
                            : 'bg-white shadow-[3px_3px_0_#000] hover:bg-pink-50'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-[#FF2A6D] text-white p-1 rounded-full border-[2px] border-black shadow-[1px_1px_0_#000]">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        <div className="text-4xl sm:text-5xl my-2 filter drop-shadow-md">
                          {model.icon}
                        </div>

                        <div className="text-center w-full">
                          <h4 className="font-['Fredoka',sans-serif] font-bold text-sm text-black truncate">
                            {model.name}
                          </h4>
                          <div className="flex items-center justify-center gap-1 mt-1 text-[11px] font-semibold text-gray-600">
                            <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-300">
                              {model.subParts.length} Parts
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: MAGIC SHADERS */}
            {activeTab === 'shaders' && (
              <div className="space-y-4">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {shaderCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        soundEngine.playDialClick(700);
                        setSelectedShaderCategory(cat.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-[2px] border-black font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                        selectedShaderCategory === cat.id
                          ? 'bg-[#00F0FF] text-black shadow-[2px_2px_0_#000]'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Shaders Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {filteredShaders.map((shader) => {
                    const isSelected = activeShaderId === shader.id;
                    return (
                      <motion.div
                        key={shader.id}
                        id={`shader-card-${shader.id}`}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          soundEngine.playBubblePop(1.4);
                          triggerHaptic('medium');
                          onSelectShader(shader);
                          onClose();
                        }}
                        className={`relative flex flex-col p-3 rounded-2xl border-[3px] border-black cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#00F0FF] shadow-[4px_4px_0_#000] ring-3 ring-pink-500'
                            : 'bg-white shadow-[3px_3px_0_#000] hover:bg-cyan-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{shader.emoji}</span>
                          <div
                            className="w-5 h-5 rounded-full border-[2px] border-black shadow-[1px_1px_0_#000]"
                            style={{
                              background: `linear-gradient(135deg, ${shader.colorA}, ${shader.colorB})`,
                            }}
                          />
                        </div>

                        <h4 className="font-['Fredoka',sans-serif] font-bold text-sm text-black truncate">
                          {shader.name}
                        </h4>
                        <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                          {shader.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: 3D STICKERS */}
            {activeTab === 'stickers' && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-700 bg-white p-2.5 rounded-xl border-[2px] border-black inline-block">
                  💡 Tap a sticker, then tap anywhere on your 3D toy model to stamp it directly onto the surface!
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {STICKER_CATALOG.map((sticker) => {
                    const isSelected = activeStickerEmoji === sticker.emoji;
                    return (
                      <motion.button
                        key={sticker.id}
                        id={`sticker-btn-${sticker.id}`}
                        whileHover={{ scale: 1.1, rotate: [-2, 2, 0] }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          soundEngine.playStickerSlap();
                          triggerHaptic('selection');
                          onSelectSticker(sticker);
                          onClose();
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-[3px] border-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#75F0C2] shadow-[4px_4px_0_#000] ring-3 ring-black'
                            : 'bg-white shadow-[3px_3px_0_#000] hover:bg-emerald-50'
                        }`}
                      >
                        <span className="text-4xl filter drop-shadow-sm">{sticker.emoji}</span>
                        <span className="text-[10px] font-bold text-black mt-1 text-center truncate w-full">
                          {sticker.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: SKY WORLDS */}
            {activeTab === 'sky' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SKY_PRESETS.map((sky) => {
                    const isSelected = currentSkyId === sky.id;
                    return (
                      <motion.div
                        key={sky.id}
                        id={`sky-card-${sky.id}`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          soundEngine.playBubblePop(1.1);
                          triggerHaptic('success');
                          onSelectSky(sky);
                          onClose();
                        }}
                        className={`relative flex items-center gap-3.5 p-4 rounded-2xl border-[3px] border-black cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#8FA2FA] text-white shadow-[4px_4px_0_#000] ring-3 ring-yellow-400'
                            : 'bg-white text-black shadow-[3px_3px_0_#000] hover:bg-indigo-50'
                        }`}
                      >
                        <div
                          className="w-14 h-14 rounded-2xl border-[2.5px] border-black flex items-center justify-center text-3xl shadow-[2px_2px_0_#000]"
                          style={{
                            background: `linear-gradient(180deg, ${sky.skyTop}, ${sky.skyBottom})`,
                          }}
                        >
                          {sky.icon}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-['Fredoka',sans-serif] font-bold text-base">
                            {sky.name}
                          </h4>
                          <p
                            className={`text-xs mt-0.5 line-clamp-2 ${
                              isSelected ? 'text-white/90' : 'text-gray-600'
                            }`}
                          >
                            {sky.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Console Chunky Base Pad */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#FFE600] border-t-[3.5px] border-black select-none">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-black uppercase tracking-wider bg-white px-2 py-1 rounded-lg border-[2px] border-black">
                Remix Engine 3D
              </span>
              <span className="text-xs font-bold text-black hidden sm:inline">
                Tap anywhere on 3D viewport to draw flat paint!
              </span>
            </div>

            <button
              onClick={() => {
                soundEngine.playBubblePop(0.9);
                onClose();
              }}
              className="px-5 py-2 bg-[#FF2A6D] text-white font-extrabold text-sm rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
            >
              Let's Paint! 🎨
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
