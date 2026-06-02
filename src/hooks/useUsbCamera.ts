import { useCallback, useEffect, useState } from "react";
import {
  InitializeResult,
  StartPreviewResult,
  UsbCameraDevice,
  usbCamera,
} from "@/lib/usb-camera";

export interface UsbCameraState {
  available: boolean;
  reason: string | null;
  device: UsbCameraDevice | null;
  initialized: boolean;
  initializeResult: InitializeResult | null;
  initializing: boolean;
  permissionPending: boolean;
  previewActive: boolean;
  previewResult: StartPreviewResult | null;
  pumpError: string | null;
}

interface UsbCameraActions {
  requestPermission: () => Promise<void>;
  initialize: () => Promise<void>;
  startPreview: (width?: number, height?: number, fps?: number) => Promise<void>;
  stopPreview: () => Promise<void>;
  release: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULT_W = 1280;
const DEFAULT_H = 720;
const DEFAULT_FPS = 30;

export function useUsbCamera(): UsbCameraState & UsbCameraActions {
  const [device, setDevice] = useState<UsbCameraDevice | null>(null);
  const [initializeResult, setInitializeResult] = useState<InitializeResult | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [permissionPending, setPermissionPending] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [previewResult, setPreviewResult] = useState<StartPreviewResult | null>(null);
  const [pumpError, setPumpError] = useState<string | null>(null);

  useEffect(() => {
    if (!usbCamera.available) return;

    const unA = usbCamera.addAttachListener((d) => setDevice(d));
    const unD = usbCamera.addDetachListener(() => {
      setDevice(null);
      setInitialized(false);
      setInitializeResult(null);
      setPreviewActive(false);
      setPreviewResult(null);
    });
    const unP = usbCamera.addPermissionListener(() => {
      setPermissionPending(false);
      usbCamera.getCurrentDevice().then((d) => setDevice(d ?? null));
    });
    const unErr = usbCamera.addPumpErrorListener((info) => {
      setPumpError(info.message);
      setPreviewActive(false);
    });

    usbCamera.getCurrentDevice().then((d) => setDevice(d ?? null));

    return () => {
      unA();
      unD();
      unP();
      unErr();
    };
  }, []);

  const requestPermission = useCallback<UsbCameraActions["requestPermission"]>(async () => {
    if (!usbCamera.available) return;
    setPermissionPending(true);
    const alreadyGranted = await usbCamera.requestPermission();
    if (alreadyGranted) {
      setPermissionPending(false);
      const d = await usbCamera.getCurrentDevice();
      setDevice(d ?? null);
    }
  }, []);

  const initialize = useCallback<UsbCameraActions["initialize"]>(async () => {
    if (!usbCamera.available) return;
    setInitializing(true);
    setPumpError(null);
    try {
      const result = await usbCamera.initialize();
      setInitializeResult(result);
      setInitialized(result.ok);
    } finally {
      setInitializing(false);
    }
  }, []);

  const startPreview = useCallback<UsbCameraActions["startPreview"]>(
    async (
      width: number = DEFAULT_W,
      height: number = DEFAULT_H,
      fps: number = DEFAULT_FPS,
    ) => {
      if (!usbCamera.available) return;
      setPumpError(null);
      const result = await usbCamera.startPreview(width, height, fps);
      setPreviewResult(result);
      setPreviewActive(result.ok);
      if (!result.ok && result.message) setPumpError(result.message);
    },
    [],
  );

  const stopPreview = useCallback<UsbCameraActions["stopPreview"]>(async () => {
    if (!usbCamera.available) return;
    await usbCamera.stopPreview();
    setPreviewActive(false);
  }, []);

  const release = useCallback<UsbCameraActions["release"]>(async () => {
    if (!usbCamera.available) return;
    await usbCamera.release();
    setInitialized(false);
    setInitializeResult(null);
    setPreviewActive(false);
    setPreviewResult(null);
  }, []);

  const refresh = useCallback<UsbCameraActions["refresh"]>(async () => {
    if (!usbCamera.available) return;
    await usbCamera.refresh();
    const d = await usbCamera.getCurrentDevice();
    setDevice(d ?? null);
  }, []);

  return {
    available: usbCamera.available,
    reason: usbCamera.reason,
    device,
    initialized,
    initializeResult,
    initializing,
    permissionPending,
    previewActive,
    previewResult,
    pumpError,
    requestPermission,
    initialize,
    startPreview,
    stopPreview,
    release,
    refresh,
  };
}
