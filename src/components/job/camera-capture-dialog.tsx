"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCamera } from "@/hooks/use-camera";
import { Camera, X, RotateCcw, Upload } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useRef, useEffect, useState } from "react";
import { useHandSequenceDetector } from "@/hooks/use-hand-sequence-detector";

interface CameraCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageFile: File, previewUrl: string) => void;
}
interface GestureState {
  currentStep: number;
  totalSteps: number;
  detectedFingers: number;
  progress: number;
}

export default function CameraCaptureDialog({
  open,
  onOpenChange,
  onCapture,
}: CameraCaptureDialogProps) {
  const {
    videoRef,
    isStreaming,
    isCameraOpen,
    error,
    capturedFile,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
  } = useCamera();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = capturedFile ? URL.createObjectURL(capturedFile) : null;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      stopCamera();
    }
    onOpenChange(isOpen);
  };

  const handleUsePhoto = () => {
    if (capturedFile && previewUrl) {
      onCapture(capturedFile, previewUrl);
      stopCamera();
      onOpenChange(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onCapture(file, base64String);
        onOpenChange(false);
      };
      reader.readAsDataURL(file);
    }
  };
  const [gestureState, setGestureState] = useState<GestureState | null>(null);

  useHandSequenceDetector({
    videoRef,
    enabled: isStreaming && !previewUrl,
    sequence: [1, 2, 3],
    requiredFramesPerPose: 6,
    onSequenceComplete: () => {
      capturePhoto();
      setGestureState(null);
    },
    onGestureStateChange: (state) => {
      setGestureState(state);
    },
  });
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Take a Profile Picture</DialogTitle>
          <DialogDescription>
            Use your camera to take a photo or upload from your device
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="relative aspect-video bg-accent rounded-lg overflow-hidden flex items-center justify-center">
            {!isCameraOpen && !previewUrl && (
              <div className="flex flex-col items-center gap-4 p-8">
                <Camera className="w-16 h-16 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  Click the button below to start your camera
                </p>
              </div>
            )}

            {(isStreaming || isCameraOpen) && !previewUrl && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />

                {gestureState && (
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-3 rounded-lg backdrop-blur-sm">
                    <div className="text-sm font-semibold mb-2">
                      Raise Your Hand to Capture
                    </div>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`flex flex-col items-center gap-1 ${
                            step === gestureState.currentStep ? "scale-110" : ""
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                              step < gestureState.currentStep
                                ? "bg-primary text-white"
                                : step === gestureState.currentStep
                                ? "bg-secondary text-white animate-pulse"
                                : "bg-gray-600 text-gray-400"
                            }`}
                          >
                            {step < gestureState.currentStep ? "✓" : step}
                          </div>
                          <div className="text-xs">
                            {step === 1 && "☝️"}
                            {step === 2 && "✌️"}
                            {step === 3 && "🤟"}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-300 mt-2">
                      Detected: {gestureState.detectedFingers} finger(s) | Hold
                      steady...
                    </div>
                  </div>
                )}
              </>
            )}

            {previewUrl && (
              <div className="relative w-full h-full">
                <Image
                  src={previewUrl}
                  alt="Captured photo"
                  fill
                  className="object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {!isCameraOpen && !previewUrl && (
              <>
                <Button onClick={startCamera} className="w-full" size="lg">
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload from Device
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}

            {isStreaming && !previewUrl && (
              <>
                <div className="text-sm text-muted-foreground mb-3 text-center">
                  Show your hand: 1 finger ☝️, then 2 ✌️, then 3 🤟
                </div>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}

            {previewUrl && (
              <div className="flex gap-2">
                <Button onClick={handleUsePhoto} className="flex-1" size="lg">
                  Use This Photo
                </Button>
                <Button onClick={retakePhoto} variant="outline" size="lg">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
