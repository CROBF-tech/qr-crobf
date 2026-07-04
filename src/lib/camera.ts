export type CameraErrorName =
  | 'NotAllowedError'
  | 'NotFoundError'
  | 'NotReadableError'
  | 'OverconstrainedError'
  | 'SecurityError'
  | 'AbortError';

export interface CameraRequestError {
  name: CameraErrorName;
  message: string;
}

export class CameraRequestError extends Error {
  declare name: CameraErrorName;

  constructor(name: CameraErrorName, message: string) {
    super(message);
    this.name = name;
  }
}

export const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30, max: 30 },
  },
};

export function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

export function isCameraApiSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
}

export async function requestCamera(
  constraints: MediaStreamConstraints = CAMERA_CONSTRAINTS
): Promise<MediaStream> {
  if (!isSecureContext()) {
    throw new CameraRequestError(
      'SecurityError',
      'Camera access requires a secure context (HTTPS or localhost).'
    );
  }
  if (!isCameraApiSupported()) {
    throw new CameraRequestError(
      'NotFoundError',
      'Camera API is not available in this browser.'
    );
  }
  return navigator.mediaDevices.getUserMedia(constraints);
}

export function stopStream(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

export async function getCameraPermissionState(): Promise<
  'granted' | 'denied' | 'prompt' | 'unsupported'
> {
  if (!navigator.permissions?.query) return 'unsupported';
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return result.state as 'granted' | 'denied' | 'prompt';
  } catch {
    return 'unsupported';
  }
}

export async function listCameras(
  signal?: AbortSignal
): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];

  // Labels are hidden until permission is granted. Request a temporary stream to unlock labels.
  let tempStream: MediaStream | null = null;
  try {
    if (signal?.aborted) return [];
    tempStream = await requestCamera({ audio: false, video: true });
  } catch {
    // Permission denied or no camera; still try to enumerate without labels.
  }

  if (signal?.aborted) {
    stopStream(tempStream);
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  stopStream(tempStream);

  return devices.filter((device) => device.kind === 'videoinput');
}

export function toCameraErrorName(error: unknown): CameraErrorName | 'unknown' {
  if (error instanceof CameraRequestError) {
    return error.name;
  }
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'NotFoundError':
      case 'NotReadableError':
      case 'OverconstrainedError':
      case 'SecurityError':
      case 'AbortError':
        return error.name as CameraErrorName;
      default:
        return 'unknown';
    }
  }
  return 'unknown';
}
