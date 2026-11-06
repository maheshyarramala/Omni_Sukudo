export function triggerHaptic(type: 'light' | 'medium' | 'error' | 'success' = 'light') {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
    return;
  }
  try {
    switch (type) {
      case 'light':
        window.navigator.vibrate(10);
        break;
      case 'medium':
        window.navigator.vibrate(25);
        break;
      case 'error':
        window.navigator.vibrate([40, 60, 40]);
        break;
      case 'success':
        window.navigator.vibrate([30, 40, 60, 40, 100]);
        break;
    }
  } catch {
    // Vibration blocked by user agent
  }
}
