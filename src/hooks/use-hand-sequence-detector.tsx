"use client";

import { useEffect, useRef } from "react";

/**
 * useHandSequenceDetector
 *
 * - videoRef: HTMLVideoElement ref of the camera feed (required)
 * - onSequenceComplete: callback invoked when full sequence detected (e.g., call capturePhoto)
 * - sequence: array of finger counts to detect in order (default [1,2,3])
 * - requiredFramesPerPose: how many consecutive frames required to accept a pose (debounce)
 *
 * NOTE: this hook uses MediaPipe Hands (web). It does not manage starting/stopping camera stream.
 */
export function useHandSequenceDetector({
  videoRef,
  onSequenceComplete,
  onGestureStateChange,
  sequence = [1, 2, 3],
  requiredFramesPerPose = 6,
  enabled = false,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onSequenceComplete: () => void;
  onGestureStateChange?: (state: {
    currentStep: number;
    totalSteps: number;
    detectedFingers: number;
    progress: number;
  }) => void;
  sequence?: number[];
  requiredFramesPerPose?: number;
  enabled?: boolean;
}) {
  const handsRef = useRef<any | null>(null);
  const cameraRef = useRef<any | null>(null);

  const currentIndexRef = useRef(0);
  const consecutiveRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    async function setup() {
      const [{ Hands }, { Camera }] = await Promise.all([
        import("@mediapipe/hands"),
        import("@mediapipe/camera_utils"),
      ]);

      if (!mounted) return;

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: any) => {
        if (!mounted) return;
        if (!videoRef.current) return;

        // if no hands, reset consecutive for current pose
        if (
          !results.multiHandLandmarks ||
          results.multiHandLandmarks.length === 0
        ) {
          consecutiveRef.current = 0;
          return;
        }

        const landmarks = results.multiHandLandmarks[0];
        const count = countExtendedFingers(landmarks);

        const expected = sequence[currentIndexRef.current];

        if (onGestureStateChange) {
          onGestureStateChange({
            currentStep: currentIndexRef.current + 1,
            totalSteps: sequence.length,
            detectedFingers: count,
            progress: Math.floor(
              (consecutiveRef.current / requiredFramesPerPose) * 100
            ),
          });
        }

        if (count === expected) {
          consecutiveRef.current += 1;

          if (consecutiveRef.current >= requiredFramesPerPose) {
            currentIndexRef.current += 1;
            consecutiveRef.current = 0;

            // reset or complete
            if (currentIndexRef.current >= sequence.length) {
              currentIndexRef.current = 0;
              consecutiveRef.current = 0;
              onSequenceComplete();
            }
          }
        } else {
          const nextExpected = sequence[currentIndexRef.current + 1];

          // If user already moved to the next pose, it will be counted in next frame
          if (typeof nextExpected !== "undefined" && count === nextExpected) {
            currentIndexRef.current += 1;
            consecutiveRef.current = 1;
          } else if (count === sequence[0] && currentIndexRef.current > 0) {
            currentIndexRef.current = 0;
            consecutiveRef.current = 1;
          } else {
            consecutiveRef.current = Math.max(0, consecutiveRef.current - 1);
          }
        }
      });

      handsRef.current = hands;

      if (videoRef.current) {
        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (!handsRef.current) return;
            await handsRef.current.send({ image: videoRef.current! });
          },
          width: 1280,
          height: 720,
        });
        cameraRef.current.start();
      }
    }

    setup().catch((err) => {
      console.error("hand detector setup failed", err);
    });

    return () => {
      mounted = false;
      try {
        cameraRef.current?.stop?.();
      } catch (e) {}
      handsRef.current = null;
      cameraRef.current = null;
      currentIndexRef.current = 0;
      consecutiveRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, JSON.stringify(sequence), requiredFramesPerPose, videoRef]);

  function countExtendedFingers(
    landmarks: Array<{ x: number; y: number; z: number }>
  ) {
    // indices: thumb tip 4, index 8, middle 12, ring 16, pinky 20
    const tips = [4, 8, 12, 16, 20];
    const pips = [3, 6, 10, 14, 18];

    let count = 0;

    if (!landmarks || landmarks.length < 21) return 0;

    const isRightHand = landmarks[17].x > landmarks[5].x;

    for (let i = 1; i <= 4; i++) {
      const tip = landmarks[tips[i]];
      const pip = landmarks[pips[i]];
      if (!tip || !pip) continue;
      if (tip.y < pip.y - 0.02) count += 1;
    }

    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    if (thumbTip && thumbIp) {
      if (isRightHand) {
        if (thumbTip.x < thumbIp.x - 0.03) count += 1;
      } else {
        if (thumbTip.x > thumbIp.x + 0.03) count += 1;
      }
    }

    return count;
  }
}
