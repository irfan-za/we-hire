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
import { Camera, X, RotateCcw, Upload, ChevronRight } from "lucide-react";
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
  const [countdown, setCountdown] = useState<number | null>(null);

  useHandSequenceDetector({
    videoRef,
    enabled: isStreaming && !previewUrl,
    sequence: [1, 2, 3],
    requiredFramesPerPose: 6,
    onSequenceComplete: () => {
      setCountdown(3);
    },
    onGestureStateChange: (state) => {
      setGestureState(state);
    },
  });

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      const timer = setTimeout(() => {
        capturePhoto();
        setGestureState(null);
        setCountdown(null);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, capturePhoto]);
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Raise Your Hand to Capture</DialogTitle>
          <DialogDescription>
            We&apos;ll take the photo once your hand pose is detected.
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

                {gestureState && !countdown && (
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

                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg text-white font-semibold mb-4">
                        Capturing photo in:
                      </p>
                      <p className="text-8xl font-bold text-white animate-pulse">
                        {countdown}
                      </p>
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
                <p className="text-sm text-muted-foreground">
                  To take a picture, follow the hand poses in the order shown
                  below. The system will automatically capture the image once
                  the final pose is detected.
                </p>
                <div className="mb-3 flex justify-center items-center space-x-3">
                  <div className="w-14 h-14 bg-muted flex justify-center items-center">
                    <Image
                      src={"/images/hand-gestures/1.svg"}
                      alt="hand gesture 1"
                      width={16}
                      height={16}
                    />
                  </div>
                  <ChevronRight />
                  <div className="w-14 h-14 bg-muted flex justify-center items-center">
                    <Image
                      src={"/images/hand-gestures/2.svg"}
                      alt="hand gesture 2"
                      width={16}
                      height={16}
                    />
                  </div>
                  <ChevronRight />
                  <div className="w-14 h-14 bg-muted flex justify-center items-center">
                    <Image
                      src={"/images/hand-gestures/3.svg"}
                      alt="hand gesture 3"
                      width={16}
                      height={16}
                    />
                  </div>
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
