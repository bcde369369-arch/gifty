/**
 * Gifty 화면 캡처 및 화면 녹화 유틸리티
 */

const DB_NAME = 'gifty_media_db';
const STORE_NAME = 'recorded_videos';
const VIDEO_KEY = 'latest_recorded_video';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** 녹화된 동영상을 다른 페이지(메인 GIF 편집기 등)로 안전하게 전달하기 위해 IndexedDB에 임시 저장 */
export async function saveRecordedVideo(fileOrBlob: Blob, filename = 'screen-recording.webm'): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Blob 또는 File을 ArrayBuffer로 변환하여 저장
    const arrayBuffer = await fileOrBlob.arrayBuffer();
    const record = {
      buffer: arrayBuffer,
      type: fileOrBlob.type || 'video/webm',
      filename,
      timestamp: Date.now()
    };
    
    await new Promise<void>((resolve, reject) => {
      const putReq = store.put(record, VIDEO_KEY);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (err) {
    console.error('Failed to save recorded video to IndexedDB:', err);
    throw err;
  }
}

/** IndexedDB에 대기 중인 녹화된 동영상 가져오기 */
export async function getRecordedVideo(): Promise<File | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    const record = await new Promise<any>((resolve, reject) => {
      const getReq = store.get(VIDEO_KEY);
      getReq.onsuccess = () => resolve(getReq.result);
      getReq.onerror = () => reject(getReq.error);
    });

    if (!record || !record.buffer) return null;

    const file = new File([record.buffer], record.filename || 'screen-recording.webm', {
      type: record.type || 'video/webm'
    });
    return file;
  } catch (err) {
    console.error('Failed to get recorded video from IndexedDB:', err);
    return null;
  }
}

/** IndexedDB 임시 동영상 삭제 */
export async function clearRecordedVideo(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const delReq = store.delete(VIDEO_KEY);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    });
  } catch (err) {
    console.error('Failed to clear recorded video from IndexedDB:', err);
  }
}

/** 브라우저가 화면 캡처/녹화 getDisplayMedia API를 지원하는지 확인 */
export function isScreenCaptureSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'
  );
}

/**
 * 화면 또는 특정 창을 캡처하여 단일 PNG File 객체로 반환
 */
export async function captureScreenshotFromDisplay(): Promise<File> {
  if (!isScreenCaptureSupported()) {
    throw new Error('현재 브라우저에서는 화면 캡처 API를 지원하지 않습니다. PC 크롬/웨일/엣지를 이용해주세요.');
  }

  let stream: MediaStream | null = null;
  let videoEl: HTMLVideoElement | null = null;

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor'
      } as any,
      audio: false
    });

    videoEl = document.createElement('video');
    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl.playsInline = true;

    await new Promise<void>((resolve, reject) => {
      if (!videoEl) return reject(new Error('No video element'));
      videoEl.onloadedmetadata = () => {
        videoEl?.play().then(resolve).catch(reject);
      };
      videoEl.onerror = () => reject(new Error('비디오 스트림 재생에 실패했습니다.'));
    });

    // 1프레임 렌더 대기
    await new Promise((resolve) => setTimeout(resolve, 300));

    const width = videoEl.videoWidth || 1920;
    const height = videoEl.videoHeight || 1080;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context 생성 실패');

    ctx.drawImage(videoEl, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('이미지 Blob 변환에 실패했습니다.'));
      }, 'image/png');
    });

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `gifty_capture_${timestamp}.png`;

    return new File([blob], filename, { type: 'image/png' });
  } finally {
    // 모든 미디어 트랙 종료
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoEl) {
      videoEl.srcObject = null;
      videoEl.remove();
    }
  }
}
