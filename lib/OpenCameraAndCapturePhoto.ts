let resolveCapture: ((img: string | null) => void) | null = null;

export function openCameraAndCapturePhoto(): Promise<string | null> {
  const event = new CustomEvent('open-camera-capture');
  window.dispatchEvent(event);

  return new Promise((resolve) => {
    resolveCapture = resolve;
  });
}

export function completeCapture(image: string | null) {
  if (resolveCapture) {
    resolveCapture(image);
    resolveCapture = null;
  }
}
