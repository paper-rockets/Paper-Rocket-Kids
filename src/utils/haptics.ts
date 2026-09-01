/**
 * Web Vibration API wrapper for tactile touch feedback
 */

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' = 'light') {
  if (typeof window === 'undefined' || !('navigator' in window) || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'selection':
      case 'light':
        navigator.vibrate(8);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([15, 40, 25]);
        break;
    }
  } catch {
    // Ignore any browser security restrictions
  }
}
