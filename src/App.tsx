import React, { useEffect, useRef, useState } from 'react';
import { StudioEngine } from './core/studioEngine';
import { AppMode, UITheme } from './types';
import { KidsWorkspaceOverlay } from './components/kids/KidsWorkspaceOverlay';
import { ProWorkspace } from './components/pro/ProWorkspace';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [engine, setEngine] = useState<StudioEngine | null>(null);
  const [mode, setMode] = useState<AppMode>('kids');
  const [activeTheme, setActiveTheme] = useState<UITheme>('periwinkle');

  useEffect(() => {
    if (!canvasRef.current) return;

    const studio = new StudioEngine({
      canvas: canvasRef.current,
    });
    setEngine(studio);

    const handleResize = () => {
      studio.handleResize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      studio.dispose();
    };
  }, []);

  const handleToggleMode = () => {
    setMode((prev) => (prev === 'kids' ? 'pro' : 'kids'));
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#141529] select-none">
      {/* 3D WebGL Canvas Viewport */}
      <canvas
        ref={canvasRef}
        id="remix-3d-canvas"
        className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
      />

      {/* Mode Overlay Switcher */}
      {mode === 'kids' ? (
        <KidsWorkspaceOverlay
          engine={engine}
          onToggleMode={handleToggleMode}
          activeTheme={activeTheme}
          onSelectTheme={setActiveTheme}
        />
      ) : (
        <ProWorkspace
          engine={engine}
          onToggleMode={handleToggleMode}
        />
      )}
    </main>
  );
}
