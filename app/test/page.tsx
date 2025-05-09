'use client';

import React, { useRef, useState } from 'react';
import { Camera } from 'react-camera-pro';
import { toast } from 'react-toastify';

type Props = {
  prompt: string;
};

export default function CameraCapture({ prompt }: Props) {
  const camera = useRef<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const captureAndAnalyze = async () => {
    if (!camera.current) return;
    const photo = camera.current.takePhoto();

    if (!photo) {
      toast.error('Failed to capture photo. Try again.');
      return;
    }

    setImage(photo);
    setLoading(true);

    try {
      const res = await fetch('/api/camera-ai-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: photo, prompt }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      toast.error('Error analyzing photo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {!image ? (
        <>
          <div className='relative z-0 h-[10rem] aspect-video rounded-lg overflow-hidden'>
            <Camera
              ref={camera}
              aspectRatio="cover"
              facingMode="user"
              errorMessages={{
                noCameraAccessible: 'No camera device accessible.',
                permissionDenied: 'Permission denied. Please allow camera access.',
                switchCamera: 'It is not possible to switch the camera.',
                canvas: 'Canvas is not supported.',
              }}
            />
          </div>
          <button
            onClick={captureAndAnalyze}
            className="mt-4 z-50 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Capture & Analyze
          </button>
        </>
      ) : (
        <>
          <img src={image} alt="Captured" className="w-full rounded" />
          <button
            onClick={() => {
              setImage(null);
              setResult(null);
            }}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Retake
          </button>
        </>
      )}

      {loading && <p className="mt-4 text-blue-500">Analyzing image...</p>}

      {result && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h2 className="text-lg font-semibold">AI Result:</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
