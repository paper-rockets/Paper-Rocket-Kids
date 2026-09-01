import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { StudioEngine } from '../../core/studioEngine';
import { BrushType, ShaderPreset } from '../../types';
import {
  Layers,
  Sliders,
  Cpu,
  Eye,
  Settings,
  FolderOpen,
  Save,
  Maximize2,
  Terminal,
  Grid,
  Zap,
  RotateCcw,
  Undo2,
  Redo2,
} from 'lucide-react';

interface ProWorkspaceProps {
  engine: StudioEngine | null;
  onToggleMode: () => void;
}

export const ProWorkspace: React.FC<ProWorkspaceProps> = ({ engine, onToggleMode }) => {
  const [wireframe, setWireframe] = useState(false);
  const [dracoCompressionRatio, setDracoCompressionRatio] = useState(85);
  const [bvhDensity, setBvhDensity] = useState(64);

  const [canUndo, setCanUndo] = useState(engine?.canUndo || false);
  const [canRedo, setCanRedo] = useState(engine?.canRedo || false);

  useEffect(() => {
    if (engine) {
      setCanUndo(engine.canUndo);
      setCanRedo(engine.canRedo);
      engine.undoManager.onChange = (u, r) => {
        setCanUndo(u);
        setCanRedo(r);
      };
    }
  }, [engine]);

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none z-20 font-mono text-xs text-gray-200">
      {/* Pro CAD Header Bar */}
      <header className="pointer-events-auto flex items-center justify-between px-4 py-2 bg-[#121420]/95 border-b border-gray-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-sans font-bold text-white text-sm">
            <span className="text-pink-500">◆</span>
            <span>Remix 3D Pro Studio</span>
            <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">
              v14.0.0-PRO
            </span>
          </div>

          <div className="h-4 w-px bg-gray-700" />

          <button
            id="btn-pro-mode-toggle"
            onClick={onToggleMode}
            className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-black font-sans font-extrabold text-xs rounded-lg hover:bg-yellow-300 transition-colors shadow-sm cursor-pointer"
          >
            <span>🧸 Switch to Play Mode</span>
          </button>
        </div>

        {/* Center: Quick Undo / Redo Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-pro-undo"
            disabled={!canUndo}
            onClick={() => {
              if (engine) engine.undo();
            }}
            title="Undo (Ctrl+Z)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
              canUndo
                ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-600 cursor-pointer'
                : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
            <span className="text-[9px] text-gray-400 opacity-70">Ctrl+Z</span>
          </button>

          <button
            id="btn-pro-redo"
            disabled={!canRedo}
            onClick={() => {
              if (engine) engine.redo();
            }}
            title="Redo (Ctrl+Y)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
              canRedo
                ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-600 cursor-pointer'
                : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span>Redo</span>
            <span className="text-[9px] text-gray-400 opacity-70">Ctrl+Y</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">three-mesh-bvh:</span>
          <span className="text-green-400 font-bold">ACTIVE (0.9.14)</span>
        </div>
      </header>

      {/* Pro CAD Side Panel */}
      <div className="flex-1 flex justify-between p-3 pointer-events-none overflow-hidden">
        {/* Left Inspector */}
        <aside className="pointer-events-auto hidden md:block w-60 bg-[#121420]/90 border border-gray-800 rounded-xl p-3 backdrop-blur-md space-y-3 max-h-[calc(100vh-100px)] overflow-y-auto custom-kids-scrollbar">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">Scene Graph</span>
            <Layers className="w-4 h-4 text-gray-500" />
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="p-1.5 bg-gray-900/80 rounded border border-gray-800 flex items-center justify-between text-gray-300">
              <span className="truncate max-w-[130px]">{engine?.currentModelInfo?.name || 'Pusheen'}</span>
              <span className="text-cyan-400 text-[9px]">MeshStandard</span>
            </div>
            <div className="p-1.5 bg-gray-900/80 rounded border border-gray-800 flex items-center justify-between text-gray-300">
              <span>Strokes Buffer</span>
              <span className="text-purple-400 text-[9px]">TubeGeometry</span>
            </div>
            <div className="p-1.5 bg-gray-900/80 rounded border border-gray-800 flex items-center justify-between text-gray-300">
              <span>Stickers</span>
              <span className="text-yellow-400 text-[9px]">PlaneDecal</span>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-2 space-y-1.5">
            <span className="font-bold text-gray-300 uppercase tracking-wider block text-[10px]">
              Draco Compression
            </span>
            <div className="flex items-center justify-between text-gray-400 text-[10px]">
              <span>Ratio: {dracoCompressionRatio}%</span>
              <span className="text-green-400">Level 7</span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              value={dracoCompressionRatio}
              onChange={(e) => setDracoCompressionRatio(parseInt(e.target.value))}
              className="w-full accent-pink-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
            />
          </div>
        </aside>

        {/* Right Shaders / BVH Panel */}
        <aside className="pointer-events-auto hidden md:block w-60 bg-[#121420]/90 border border-gray-800 rounded-xl p-3 backdrop-blur-md space-y-3 max-h-[calc(100vh-100px)] overflow-y-auto custom-kids-scrollbar">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="font-bold text-gray-300 uppercase tracking-wider text-[11px]">KD-Tree & BVH</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Density</span>
              <span className="text-white font-bold">{bvhDensity} pts/cm²</span>
            </div>
            <input
              type="range"
              min="16"
              max="128"
              value={bvhDensity}
              onChange={(e) => setBvhDensity(parseInt(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-gray-800">
            <button
              onClick={() => {
                if (engine) engine.clearAllPaint();
              }}
              className="w-full py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-800 rounded flex items-center justify-center gap-1 text-[10px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Purge Stroke Buffers</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Footer Terminal Bar */}
      <footer className="pointer-events-auto flex items-center justify-between px-4 py-1.5 bg-[#0E0F1D] border-t border-gray-800 text-[11px] text-gray-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-gray-500" />
          <span>Press Ctrl+K for command palette • Ready for input</span>
        </div>
        <div className="flex items-center gap-3">
          <span>FPS: 60</span>
          <span>Draw Calls: 14</span>
          <span>Triangles: 12.4k</span>
        </div>
      </footer>
    </div>
  );
};
