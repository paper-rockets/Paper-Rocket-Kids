import React, { useState, useEffect } from 'react';
import { StudioEngine } from '../../core/studioEngine';
import { BrushType, ShaderPreset, SkyPreset, StickerItem, ToyModelInfo, UITheme } from '../../types';
import { THEME_CONFIGS } from '../../constants/presets';
import { KidsHeaderBar } from './KidsHeaderBar';
import { KidsVerticalToolDock } from './KidsVerticalToolDock';
import { KidsShaderRemixCard } from './KidsShaderRemixCard';
import { KidsScrubberBar } from './KidsScrubberBar';
import { KidsMagicFaceDial } from './KidsMagicFaceDial';
import { KidsToyConsoleModal } from './KidsToyConsoleModal';
import { soundEngine } from '../../utils/audio';

interface KidsWorkspaceOverlayProps {
  engine: StudioEngine | null;
  onToggleMode: () => void;
  activeTheme: UITheme;
  onSelectTheme: (theme: UITheme) => void;
}

export const KidsWorkspaceOverlay: React.FC<KidsWorkspaceOverlayProps> = ({
  engine,
  onToggleMode,
  activeTheme,
  onSelectTheme,
}) => {
  // Modal states
  const [isToyConsoleOpen, setIsToyConsoleOpen] = useState(false);
  const [consoleInitialTab, setConsoleInitialTab] = useState<'toybox' | 'stickers' | 'shaders' | 'sky'>('toybox');

  // Active Tooling State (Default: flat_paint)
  const [activeBrush, setActiveBrush] = useState<BrushType>('flat_paint');
  const [activeSizeId, setActiveSizeId] = useState('med');
  const [activeColor, setActiveColor] = useState('#FF2A6D');
  const [symmetryCount, setSymmetryCount] = useState(1);
  const [activeStickerEmoji, setActiveStickerEmoji] = useState('⭐');

  // Shader Remix State
  const [activeShader, setActiveShader] = useState<ShaderPreset>(
    engine?.activeShader || {
      id: 'anime_cel',
      name: 'Anime Cel Ink',
      category: 'toon',
      categoryName: 'Toon & Anime',
      emoji: '🖋️',
      description: 'Stepped cel-shaded cartoon ink with stylized outlines',
      colorA: '#FF5376',
      colorB: '#FFE600',
      glow: 0.5,
      speed: 1.0,
    }
  );
  const [remixColorA, setRemixColorA] = useState('#FF5376');
  const [remixColorB, setRemixColorB] = useState('#FFE600');
  const [remixGlow, setRemixGlow] = useState(0.5);
  const [remixSpeed, setRemixSpeed] = useState(1.0);

  // Sky & Playback State
  const [timeOfDay, setTimeOfDay] = useState(0.45);
  const [currentSkyId, setCurrentSkyId] = useState('ghibli_summer');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTurntable, setIsTurntable] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [currentModel, setCurrentModel] = useState<ToyModelInfo>(
    engine?.currentModelInfo || {
      id: 'pusheen_classic',
      name: 'Classic Pusheen',
      category: 'animals',
      categoryName: 'Cute Animals',
      icon: '🐱',
      description: 'Chubby grey tabby cat with cute whiskers',
      subParts: ['Cat Body', 'Ears', 'Stripes', 'Tail'],
      scale: 1.2,
      polyCount: 1420,
      tags: ['cat', 'pusheen'],
    }
  );

  // Undo / Redo Reactive State
  const [canUndo, setCanUndo] = useState(engine?.canUndo || false);
  const [canRedo, setCanRedo] = useState(engine?.canRedo || false);

  useEffect(() => {
    if (engine) {
      setCanUndo(engine.canUndo);
      setCanRedo(engine.canRedo);
      engine.undoManager.onChange = (undoAvailable, redoAvailable) => {
        setCanUndo(undoAvailable);
        setCanRedo(redoAvailable);
      };
    }
  }, [engine]);

  const handleUndo = () => {
    if (engine) {
      engine.undo();
    }
  };

  const handleRedo = () => {
    if (engine) {
      engine.redo();
    }
  };

  // Update engine uniforms on remix changes
  useEffect(() => {
    if (engine) {
      engine.updateShaderUniforms(remixColorA, remixColorB, remixGlow, remixSpeed);
    }
  }, [engine, remixColorA, remixColorB, remixGlow, remixSpeed]);

  const handleSelectBrush = (brush: BrushType) => {
    setActiveBrush(brush);
    if (engine) engine.brushType = brush;
  };

  const handleSelectSize = (sizeId: string, radius: number) => {
    setActiveSizeId(sizeId);
    if (engine) engine.brushRadius = radius;
  };

  const handleSelectColor = (color: string) => {
    setActiveColor(color);
    setRemixColorA(color);
    if (engine) {
      engine.brushColor = color;
      engine.updateShaderUniforms(color, remixColorB, remixGlow, remixSpeed);
    }
  };

  const handleSelectModel = (model: ToyModelInfo) => {
    setCurrentModel(model);
    if (engine) {
      engine.loadToyModel(model);
    }
  };

  const handleUploadModel = async (file: File) => {
    if (engine) {
      try {
        const uploadedInfo = await engine.loadCustomModelFile(file);
        setCurrentModel(uploadedInfo);
      } catch (err: any) {
        console.error('Model upload failed:', err);
      }
    }
  };

  const handleSelectShader = (shader: ShaderPreset) => {
    setActiveShader(shader);
    setRemixColorA(shader.colorA);
    setRemixColorB(shader.colorB);
    setRemixGlow(shader.glow);
    setRemixSpeed(shader.speed);
    if (engine) {
      engine.applyShaderToModel(shader);
    }
  };

  const handleSelectSticker = (sticker: StickerItem) => {
    setActiveStickerEmoji(sticker.emoji);
    setActiveBrush('sticker');
    if (engine) {
      engine.brushType = 'sticker';
      engine.activeStickerEmoji = sticker.emoji;
    }
  };

  const handleSelectSky = (sky: SkyPreset) => {
    setCurrentSkyId(sky.id);
    setTimeOfDay(sky.timeOfDay);
    if (engine) {
      engine.sky.applyPreset(sky);
    }
  };

  const handleTimeChange = (time: number) => {
    setTimeOfDay(time);
    if (engine) {
      engine.sky.setTimeOfDay(time);
    }
  };

  const handleToggleSymmetry = () => {
    const nextSym = symmetryCount === 1 ? 2 : symmetryCount === 2 ? 4 : symmetryCount === 4 ? 6 : symmetryCount === 6 ? 8 : 1;
    setSymmetryCount(nextSym);
    if (engine) {
      engine.symmetryCount = nextSym;
    }
  };

  const handleJellyBoing = () => {
    if (engine) {
      engine.triggerJellyBoing();
    }
  };

  return (
    <div
      id="kids-workspace-overlay"
      className="absolute inset-0 flex flex-col pointer-events-none z-20 overflow-hidden font-['Outfit',sans-serif]"
    >
      {/* 1. TOP HEADER BAR */}
      <div className="pointer-events-auto w-full">
        <KidsHeaderBar
        onOpenToybox={() => {
          setConsoleInitialTab('toybox');
          setIsToyConsoleOpen(true);
        }}
        onOpenShaders={() => {
          setConsoleInitialTab('shaders');
          setIsToyConsoleOpen(true);
        }}
        onOpenStickers={() => {
          setConsoleInitialTab('stickers');
          setIsToyConsoleOpen(true);
        }}
        onOpenSky={() => {
          setConsoleInitialTab('sky');
          setIsToyConsoleOpen(true);
        }}
        onJellyBoing={handleJellyBoing}
        symmetryCount={symmetryCount}
        onToggleSymmetry={() => {
          const next = symmetryCount === 1 ? 2 : symmetryCount === 2 ? 4 : 1;
          setSymmetryCount(next);
          if (engine) engine.symmetryCount = next;
        }}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearCanvas={() => {
          if (engine) engine.clearAllPaint();
        }}
        activeTheme={activeTheme}
        onSelectTheme={onSelectTheme}
        isMuted={isMuted}
        onToggleMute={() => {
          const nextMute = !isMuted;
          setIsMuted(nextMute);
          soundEngine.setMuted(nextMute);
        }}
        isSpinning={isTurntable}
        onToggleSpin={() => {
          const nextTurn = !isTurntable;
          setIsTurntable(nextTurn);
          if (engine) engine.isTurntableActive = nextTurn;
        }}
      />
      </div>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <div className="relative flex-1 flex justify-between p-3 sm:p-4 pointer-events-none overflow-hidden">
        {/* LEFT DOCK: Progressive Disclosure Tabbed Tool Dock */}
        <div className="pointer-events-auto">
          <KidsVerticalToolDock
            activeBrush={activeBrush}
            onSelectBrush={handleSelectBrush}
            activeSizeId={activeSizeId}
            onSelectSize={handleSelectSize}
            activeColor={activeColor}
            onSelectColor={handleSelectColor}
            onClearCanvas={() => {
              if (engine) engine.clearAllPaint();
            }}
            onOpenStickerTray={() => {
              setConsoleInitialTab('stickers');
              setIsToyConsoleOpen(true);
            }}
            activeShaderId={activeShader.id}
            onSelectShader={handleSelectShader}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        </div>

        {/* RIGHT DOCK: Glossy 3-Track Shader Remix Card */}
        <div className="pointer-events-auto hidden md:block">
          <KidsShaderRemixCard
            activeShader={activeShader}
            colorA={remixColorA}
            colorB={remixColorB}
            glow={remixGlow}
            speed={remixSpeed}
            onChangeColorA={(col) => setRemixColorA(col)}
            onChangeColorB={(col) => setRemixColorB(col)}
            onChangeGlow={(g) => setRemixGlow(g)}
            onChangeSpeed={(s) => setRemixSpeed(s)}
            onOpenShadersModal={() => {
              setConsoleInitialTab('shaders');
              setIsToyConsoleOpen(true);
            }}
          />
        </div>
      </div>

      {/* 3. MODALS */}
      <div className="pointer-events-auto">
        <KidsToyConsoleModal
          isOpen={isToyConsoleOpen}
          initialTab={consoleInitialTab}
          onClose={() => setIsToyConsoleOpen(false)}
          currentModelId={currentModel.id}
          onSelectModel={handleSelectModel}
          onUploadModel={handleUploadModel}
          activeShaderId={activeShader.id}
          onSelectShader={handleSelectShader}
          activeStickerEmoji={activeStickerEmoji}
          onSelectSticker={handleSelectSticker}
          currentSkyId={currentSkyId}
          onSelectSky={handleSelectSky}
        />
      </div>
    </div>
  );
};
