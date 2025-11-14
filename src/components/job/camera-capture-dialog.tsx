"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCamera } from "@/hooks/use-camera";
import { Camera, X, RotateCcw, Upload } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useRef, useEffect, useState } from "react";

interface CameraCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageFile: File, previewUrl: string) => void;
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
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
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
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1" size="lg">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
                <Button onClick={stopCamera} variant="outline" size="lg">
                  <X className="w-4 h-4" />
                </Button>
              </div>
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
