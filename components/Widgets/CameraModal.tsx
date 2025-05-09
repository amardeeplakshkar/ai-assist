'use client';
import { useRef, useState } from 'react';
import Webcam from 'react-webcam';

export default function CameraModal({ prompt, onComplete }: { prompt: string, onComplete: (image: string) => void }) {
  const webcamRef = useRef<Webcam>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    try {
      const image = webcamRef.current?.getScreenshot();
      if (!image) {
        throw new Error("Failed to capture image.");
      }
      onComplete(image); // Send the image back to parent component or handler.
    } catch (e: any) {
      setError("Error capturing photo. Please ensure camera permissions are granted.");
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: 'environment' }}
        className="w-full rounded"
      />
      <button onClick={handleCapture} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Capture Photo
      </button>
    </div>
  );
}
