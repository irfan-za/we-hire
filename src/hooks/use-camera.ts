"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  isCameraOpen: boolean;
  error: string | null;
  capturedFile: File | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => void;
  retakePhoto: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsCameraOpen(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setIsStreaming(true);
              })
              .catch((playError) => {
                setError("Error playing video: " + playError.message);
                setIsCameraOpen(false);
              });
          }
        };
      }
    } catch (err) {
      let errorMessage = "Failed to access camera";

      if (err instanceof Error) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          errorMessage =
            "Camera access denied. Please allow camera permissions.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (err.name === "NotReadableError") {
          errorMessage = "Camera is already in use by another application.";
        }
      }

      setError(errorMessage);
      setIsCameraOpen(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }

    setIsStreaming(false);
    setIsCameraOpen(false);
    setError(null);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !isStreaming) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (context) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const timestamp = Date.now();
            const file = new File([blob], `profile-${timestamp}.jpg`, {
              type: "image/jpeg",
              lastModified: timestamp,
            });
            setCapturedFile(file);
          }
        },
        "image/jpeg",
        0.9
      );

      stopCamera();
    }
  }, [isStreaming, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedFile(null);
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isStreaming,
    isCameraOpen,
    error,
    capturedFile,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
  };
}
