import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SparkleStar } from './SparkleStar';
import { soundEngine } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';
import { X, Eye, Camera, Check, Smartphone, Sparkles } from 'lucide-react';

interface KidsARModalProps {
  isOpen: boolean;
  onClose: () => void;
  toyName: string;
}

export const KidsARModal: React.FC<KidsARModalProps> = ({ isOpen, onClose, toyName }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [arScale, setArScale] = useState(1.0);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative flex flex-col items-center p-6 bg-[#8FA2FA] rounded-3xl border-[4px] border-black shadow-[8px_8px_0px_#1B1B4B] max-w-lg w-full text-white text-center"
        >
          {/* Close button */}
          <button
            onClick={() => {
              soundEngine.playBubblePop(0.8);
              onClose();
            }}
            className="absolute top-3 right-3 p-1.5 bg-white text-black rounded-xl border-[2px] border-black shadow-[2px_2px_0_#000]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🌟</span>
            <h3 className="font-['Righteous',sans-serif] text-2xl text-yellow-300 drop-shadow-[2px_2px_0_#000]">
              SEE IN YOUR ROOM!
            </h3>
            <SparkleStar size={24} color="#FFE600" />
          </div>

          <p className="font-['Fredoka',sans-serif] text-sm text-white/90 mb-4 max-w-md">
            Place your freshly painted <strong className="text-yellow-300 font-bold">{toyName}</strong> onto your desk, bedroom floor, or table with WebXR Augmented Reality!
          </p>

          {/* AR Preview / Surface Hit Test Viewport */}
          <div className="relative w-full aspect-video bg-[#1B1B4B] rounded-2xl border-[3px] border-black overflow-hidden flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80 pointer-events-none" />

            {/* Target Reticle */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 180, 270, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 rounded-full border-[3px] border-dashed border-[#FFE600] flex items-center justify-center"
            >
              <div className="text-4xl">🧸</div>
            </motion.div>

            <span className="relative z-10 text-xs font-bold text-yellow-200 mt-3 bg-black/60 px-3 py-1 rounded-full border border-yellow-300/40">
              Point phone camera at table or floor to place toy
            </span>
          </div>

          {/* Scale Slider */}
          <div className="w-full mt-4 flex items-center justify-between gap-3 bg-white/20 p-3 rounded-2xl border-[2px] border-black">
            <span className="text-xs font-bold">Toy Size:</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={arScale}
              onChange={(e) => setArScale(parseFloat(e.target.value))}
              className="flex-1 accent-[#FFE600]"
            />
            <span className="text-xs font-black bg-black/40 px-2 py-0.5 rounded">
              {arScale.toFixed(1)}x
            </span>
          </div>

          {/* Launch WebXR Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              soundEngine.playBubblePop(1.4);
              triggerHaptic('success');
              // Request camera or WebXR session
              if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                  .then(() => setIsCameraActive(true))
                  .catch(() => {});
              }
            }}
            className="mt-5 w-full py-3 bg-[#FFE600] text-black font-['Fredoka',sans-serif] font-black text-base rounded-2xl border-[3px] border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            🚀 Launch 3D AR Camera
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
