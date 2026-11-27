'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Video,
  X,
  Sparkles,
  Clock,
  Play,
  Square,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Mic,
  MicOff,
  Wand2,
  Layers,
  ChevronRight,
  Info,
  Crop,
  Move,
  Maximize2,
  Check,
  ShieldCheck
} from 'lucide-react';
import {
  captureScreenshotFromDisplay,
  isScreenCaptureSupported,
  saveRecordedVideo
} from '@/lib/screenCapture';
import { useRouter } from 'next/navigation';
import FloatingPipStudio from './FloatingPipStudio';

interface ScreenCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'movavi' | 'pip' | 'screenshot' | 'record';
  onScreenshotCaptured?: (file: File) => void;
  onRecordingComplete?: (file: File) => void;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

export default function ScreenCaptureModal({
  isOpen,
  onClose,
  initialTab = 'movavi',
  onScreenshotCaptured,
  onRecordingComplete
}: ScreenCaptureModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'movavi' | 'pip' | 'screenshot' | 'record'>(initialTab);
  const [isSupported, setIsSupported] = useState(true);

  // 플로팅 PiP 스튜디오 상태
  const [isPipOpen, setIsPipOpen] = useState(false);
  const [pipStream, setPipStream] = useState<MediaStream | null>(null);

  // 자유 영역 지정 스튜디오 상태
  const [isMovaviOpen, setIsMovaviOpen] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // 오렌지색 조절 프레임 (0.0 ~ 1.0 비율 좌표계)
  const [frameNorm, setFrameNorm] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0.15,
    y: 0.15,
    w: 0.7,
    h: 0.7
  });
  const frameNormRef = useRef(frameNorm);
  frameNormRef.current = frameNorm;

  const [activePreset, setActivePreset] = useState<'free' | 'blog' | 'square' | 'wide' | 'full'>('blog');
  const [videoResolution, setVideoResolution] = useState<{ width: number; height: number }>({
    width: 1920,
    height: 1080
  });

  // 드래그 및 리사이즈 상태 관리
  const dragInfoRef = useRef<{
    handle: ResizeHandle;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
    initW: number;
    initH: number;
    stageW: number;
    stageH: number;
  } | null>(null);

  // 녹화 관련 상태 (자유 영역 스튜디오 내부 및 단독 녹화 공용)
  const [recordDuration, setRecordDuration] = useState<number>(10); // 초 단위 (5, 10, 15, 0=무제한)
  const [includeAudio, setIncludeAudio] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordCountdown, setRecordCountdown] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // 스크린샷 탭 관련 상태
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCropLoopRunningRef = useRef<boolean>(false);

  useEffect(() => {
    setIsSupported(isScreenCaptureSupported());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      resetAllState();
    } else {
      cleanupStreams();
    }
  }, [isOpen, initialTab]);

  const cleanupStreams = () => {
    isCropLoopRunningRef.current = false;
    if (videoStream) {
      videoStream.getTracks().forEach((t) => t.stop());
      setVideoStream(null);
    }
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setCountdown(null);
    setRecordCountdown(null);
    setIsMovaviOpen(false);
  };

  const resetAllState = () => {
    cleanupStreams();
    setIsRecording(false);
    setElapsedTime(0);
    setRecordedBlob(null);
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl(null);
    setRecordedFile(null);
  };

  // =========================================================
  // [0] 항상 위에 떠서 다른 창 자유 이동 캡처/녹화 (PiP)
  // =========================================================
  const launchFloatingPip = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor'
        } as any,
        audio: includeAudio
      });
      setPipStream(stream);
      setIsPipOpen(true);
      onClose(); // 고정 모달을 닫아 다른 작업을 자유롭게 할 수 있도록 함
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        alert(err.message || '화면 공유 권한을 가져오지 못했습니다.');
      }
    }
  };

  // =========================================================
  // [1] 자유 영역 인터랙티브 캡처 스튜디오 시작
  // =========================================================
  const launchMovaviStudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor'
        } as any,
        audio: includeAudio
      });

      // 오디오 추가 병합
      let combinedStream = stream;
      if (includeAudio) {
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
          combinedStream = new MediaStream([...stream.getVideoTracks(), ...mic.getAudioTracks()]);
        } catch {}
      }

      setVideoStream(combinedStream);
      setIsMovaviOpen(true);
      resetRecordingStateOnly();

      // 스트림 연결 대기
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = combinedStream;
          videoRef.current.play().then(() => {
            if (videoRef.current) {
              const vw = videoRef.current.videoWidth || 1920;
              const vh = videoRef.current.videoHeight || 1080;
              setVideoResolution({ width: vw, height: vh });
              // 블로그 최적 4:3 또는 800x600 기본 세팅
              applyPresetDimensions('blog', vw, vh);
            }
          }).catch(console.error);
        }
      }, 100);

      stream.getVideoTracks()[0].onended = () => {
        cleanupStreams();
      };
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        alert(err.message || '화면 공유 권한을 가져오지 못했습니다.');
      }
    }
  };

  const resetRecordingStateOnly = () => {
    setIsRecording(false);
    setElapsedTime(0);
    setRecordedBlob(null);
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl(null);
    setRecordedFile(null);
  };

  // 프리셋 크기 적용
  const applyPresetDimensions = (preset: 'free' | 'blog' | 'square' | 'wide' | 'full', vw = videoResolution.width, vh = videoResolution.height) => {
    setActivePreset(preset);
    if (preset === 'full') {
      setFrameNorm({ x: 0, y: 0, w: 1, h: 1 });
    } else if (preset === 'blog') {
      // 800 x 600 (4:3)
      const targetRatio = 4 / 3;
      const screenRatio = vw / vh;
      let w = 0.6;
      let h = (w * screenRatio) / targetRatio;
      if (h > 0.85) {
        h = 0.85;
        w = (h * targetRatio) / screenRatio;
      }
      setFrameNorm({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
    } else if (preset === 'square') {
      // 1:1 정사각형
      const targetRatio = 1;
      const screenRatio = vw / vh;
      let w = 0.55;
      let h = (w * screenRatio) / targetRatio;
      if (h > 0.85) {
        h = 0.85;
        w = (h * targetRatio) / screenRatio;
      }
      setFrameNorm({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
    } else if (preset === 'wide') {
      // 16:9 와이드
      const targetRatio = 16 / 9;
      const screenRatio = vw / vh;
      let w = 0.75;
      let h = (w * screenRatio) / targetRatio;
      if (h > 0.85) {
        h = 0.85;
        w = (h * targetRatio) / screenRatio;
      }
      setFrameNorm({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
    }
  };

  // 마우스 드래그 & 핸들 리사이즈 핸들러
  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    dragInfoRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initX: frameNorm.x,
      initY: frameNorm.y,
      initW: frameNorm.w,
      initH: frameNorm.h,
      stageW: rect.width,
      stageH: rect.height
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const info = dragInfoRef.current;
    if (!info) return;

    const dx = (e.clientX - info.startX) / info.stageW;
    const dy = (e.clientY - info.startY) / info.stageH;

    let { initX, initY, initW, initH } = info;
    let newX = initX;
    let newY = initY;
    let newW = initW;
    let newH = initH;

    const MIN_SIZE = 0.05;

    if (info.handle === 'move') {
      newX = Math.max(0, Math.min(1 - newW, initX + dx));
      newY = Math.max(0, Math.min(1 - newH, initY + dy));
    } else {
      setActivePreset('free');
      if (info.handle.includes('e')) {
        newW = Math.max(MIN_SIZE, Math.min(1 - initX, initW + dx));
      }
      if (info.handle.includes('s')) {
        newH = Math.max(MIN_SIZE, Math.min(1 - initY, initH + dy));
      }
      if (info.handle.includes('w')) {
        const potentialW = initW - dx;
        if (potentialW >= MIN_SIZE && initX + dx >= 0) {
          newX = initX + dx;
          newW = potentialW;
        }
      }
      if (info.handle.includes('n')) {
        const potentialH = initH - dy;
        if (potentialH >= MIN_SIZE && initY + dy >= 0) {
          newY = initY + dy;
          newH = potentialH;
        }
      }
    }

    setFrameNorm({ x: newX, y: newY, w: newW, h: newH });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragInfoRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // 실시간 선택 박스 픽셀 치수 계산
  const currentPixelWidth = Math.round(frameNorm.w * videoResolution.width);
  const currentPixelHeight = Math.round(frameNorm.h * videoResolution.height);

  // 실시간 예상 GIF 용량 계산 (10초 기준)
  const estimatedGifSizeMB = ((currentPixelWidth * currentPixelHeight * 0.000045 * Math.min(15, recordDuration || 10))).toFixed(1);
  const isSafeSize = parseFloat(estimatedGifSizeMB) <= 19.5;

  // =========================================================
  // [2] 오렌지 프레임 내부 스크린샷 캡처 (100% 무손실 DPI)
  // =========================================================
  const captureMovaviAreaScreenshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const cropX = Math.round(frameNorm.x * vw);
    const cropY = Math.round(frameNorm.y * vh);
    const cropW = Math.max(1, Math.round(frameNorm.w * vw));
    const cropH = Math.max(1, Math.round(frameNorm.h * vh));

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 무손실 원본 픽셀 1:1 크롭
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const file = new File([blob], `gifty_crop_${timestamp}.png`, { type: 'image/png' });

      onScreenshotCaptured?.(file);
      cleanupStreams();
      onClose();
    }, 'image/png');
  };

  // =========================================================
  // [3] 오렌지 프레임 내부만 '실시간 부분 화면 녹화'
  // =========================================================
  const startMovaviAreaRecording = () => {
    if (!videoRef.current || !videoStream) return;

    setRecordCountdown(3);
    let count = 3;

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setRecordCountdown(count);
      } else {
        clearInterval(interval);
        setRecordCountdown(null);
        beginActualCroppedRecording();
      }
    }, 1000);
  };

  const beginActualCroppedRecording = () => {
    if (!videoRef.current || !videoStream) return;
    const video = videoRef.current;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const cropW = Math.max(2, Math.round(frameNormRef.current.w * vw));
    const cropH = Math.max(2, Math.round(frameNormRef.current.h * vh));

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const ctx = cropCanvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    isCropLoopRunningRef.current = true;

    // 30fps 실시간 크롭 렌더 루프
    const renderCropFrame = () => {
      if (!isCropLoopRunningRef.current) return;
      const curX = Math.round(frameNormRef.current.x * video.videoWidth);
      const curY = Math.round(frameNormRef.current.y * video.videoHeight);
      const curW = Math.max(1, Math.round(frameNormRef.current.w * video.videoWidth));
      const curH = Math.max(1, Math.round(frameNormRef.current.h * video.videoHeight));

      ctx.drawImage(video, curX, curY, curW, curH, 0, 0, cropCanvas.width, cropCanvas.height);
      requestAnimationFrame(renderCropFrame);
    };
    requestAnimationFrame(renderCropFrame);

    const croppedStream = cropCanvas.captureStream(30);

    // 오디오 트랙이 있다면 추가
    videoStream.getAudioTracks().forEach((track) => croppedStream.addTrack(track));

    recordedChunksRef.current = [];
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

    const recorder = new MediaRecorder(croppedStream, selectedMime ? { mimeType: selectedMime } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      isCropLoopRunningRef.current = false;
      const blob = new Blob(recordedChunksRef.current, { type: selectedMime || 'video/webm' });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const file = new File([blob], `gifty_record_area_${timestamp}.webm`, { type: blob.type });

      setRecordedBlob(blob);
      setRecordedVideoUrl(url);
      setRecordedFile(file);
      setIsRecording(false);
    };

    recorder.start(250);
    setIsRecording(true);
    setElapsedTime(0);

    const startTime = Date.now();
    recordTimerRef.current = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsedSec);

      if (recordDuration > 0 && elapsedSec >= recordDuration) {
        stopCroppedRecording();
      }
    }, 250);
  };

  const stopCroppedRecording = () => {
    isCropLoopRunningRef.current = false;
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // 녹화된 영상을 Gifty 메인 GIF 변환기로 전달
  const handleTransferToGifEditor = async () => {
    if (!recordedFile && !recordedBlob) return;
    setIsNavigating(true);

    try {
      const blob = recordedBlob || (recordedFile as Blob);
      await saveRecordedVideo(blob, recordedFile?.name || 'screen-recording.webm');
      onRecordingComplete?.(recordedFile!);
      cleanupStreams();
      onClose();
      router.push('/?from=record');
    } catch (err) {
      console.error(err);
      alert('녹화된 영상을 편집기로 전달하는 중 오류가 발생했습니다.');
      setIsNavigating(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!recordedVideoUrl || !recordedFile) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = recordedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen && !isPipOpen) return null;

  return (
    <>
      {/* 플로팅 PiP 뷰파인더 (항상 위에 떠서 다른 창 자유 이동 캡처 & 녹화) */}
      {isPipOpen && (
        <FloatingPipStudio
          stream={pipStream}
          isOpen={isPipOpen}
          onClose={() => {
            setIsPipOpen(false);
            if (pipStream) {
              pipStream.getTracks().forEach((t) => t.stop());
              setPipStream(null);
            }
          }}
          onScreenshotCaptured={(file) => {
            setIsPipOpen(false);
            if (pipStream) {
              pipStream.getTracks().forEach((t) => t.stop());
              setPipStream(null);
            }
            onScreenshotCaptured?.(file);
          }}
          onRecordingComplete={(file) => {
            setIsPipOpen(false);
            if (pipStream) {
              pipStream.getTracks().forEach((t) => t.stop());
              setPipStream(null);
            }
            onRecordingComplete?.(file);
          }}
        />
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* [A] 자유 영역 전체 인터랙티브 스튜디오 오버레이 (화면 선택 시 풀스크린 가동) */}
      {/* ========================================================================= */}
      {isMovaviOpen ? (
        <div className="relative w-full h-[96vh] max-w-7xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
          {/* 상단 컨트롤 바 */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-30 select-none">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5">
                <Crop size={14} />
                <span>자유 영역 지정 스튜디오</span>
              </div>
              <span className="text-xs font-bold text-orange-400 bg-orange-950/80 border border-orange-800/80 px-2.5 py-1 rounded-md">
                📐 {currentPixelWidth} × {currentPixelHeight} px
              </span>
            </div>

            {/* 프리셋 선택 버튼 그룹 */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => applyPresetDimensions('blog')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activePreset === 'blog' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                블로그(4:3) ⭐
              </button>
              <button
                type="button"
                onClick={() => applyPresetDimensions('wide')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activePreset === 'wide' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                와이드(16:9)
              </button>
              <button
                type="button"
                onClick={() => applyPresetDimensions('square')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activePreset === 'square' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                정사각형(1:1)
              </button>
              <button
                type="button"
                onClick={() => applyPresetDimensions('full')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activePreset === 'full' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                전체 화면
              </button>
            </div>

            <button
              onClick={cleanupStreams}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* 중앙 인터랙티브 캔버스 스테이지 */}
          <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center p-4">
            <div
              ref={stageRef}
              className="relative w-full h-full max-h-[82vh] flex items-center justify-center select-none"
            >
              {/* 원본 비디오 스트림 (배경) */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-w-full max-h-full object-contain pointer-events-none rounded-lg"
              />

              {/* 오렌지색 조절 프레임 (Movavi Signature) */}
              <div
                style={{
                  left: `${frameNorm.x * 100}%`,
                  top: `${frameNorm.y * 100}%`,
                  width: `${frameNorm.w * 100}%`,
                  height: `${frameNorm.h * 100}%`
                }}
                className={`absolute border-2 border-orange-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] transition-shadow duration-100 ${
                  isRecording ? 'border-red-500 animate-pulse' : ''
                }`}
              >
                {/* 프레임 상단 실시간 치수 및 상태 배지 */}
                <div className="absolute -top-7 left-0 flex items-center gap-1.5 pointer-events-none">
                  <span className="bg-orange-500 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-sm">
                    {currentPixelWidth} × {currentPixelHeight}
                  </span>
                  {isRecording && (
                    <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      REC 00:{String(elapsedTime).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* 가운데 드래그 이동 영역 (핸들) */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'move')}
                  className="w-full h-full cursor-move flex items-center justify-center bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
                >
                  <div className="p-2 bg-black/50 text-white/80 rounded-full backdrop-blur-xs opacity-0 hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1 text-xs">
                    <Move size={14} /> 드래그하여 이동
                  </div>
                </div>

                {/* 8방향 리사이즈 핸들러 */}
                {!isRecording && (
                  <>
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'nw')}
                      className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-orange-400 border-2 border-white rounded-xs cursor-nwse-resize shadow-md"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'n')}
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-orange-400 border border-white rounded-xs cursor-ns-resize shadow-md"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'ne')}
                      className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-orange-400 border-2 border-white rounded-xs cursor-nesw-resize shadow-md"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'e')}
                      className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-4 bg-orange-400 border border-white rounded-xs cursor-ew-resize shadow-md"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'se')}
                      className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-orange-400 border-2 border-white rounded-xs cursor-nwse-resize shadow-md"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 's')}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-orange-400 border border-white rounded-xs cursor-ns-resize shadow-md"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'sw')}
                      className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-orange-400 border-2 border-white rounded-xs cursor-nesw-resize shadow-md"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'w')}
                      className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-4 bg-orange-400 border border-white rounded-xs cursor-ew-resize shadow-md"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 하단 플로팅 조작 툴바 (이 영역 캡처 vs 이 영역 녹화) */}
          <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-30">
            {/* 용량 및 네이버 블로그 안전 배지 */}
            <div className="flex items-center gap-3 text-xs">
              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold ${
                  isSafeSize
                    ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-300'
                    : 'bg-amber-950/60 border-amber-700/70 text-amber-300'
                }`}
              >
                <ShieldCheck size={16} />
                <span>
                  예상 움짤 용량: 약 {estimatedGifSizeMB} MB{' '}
                  {isSafeSize ? '(네이버 20MB 완벽 안전 ✅)' : '(용량 주의 ⚠️)'}
                </span>
              </div>
            </div>

            {/* 메인 실행 버튼들 */}
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <>
                  {/* 스크린샷 캡처 버튼 */}
                  <button
                    type="button"
                    onClick={captureMovaviAreaScreenshot}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Camera size={17} />
                    <span>📸 이 영역 스크린샷 캡처</span>
                  </button>

                  {/* 부분 화면 녹화 시작 버튼 */}
                  <button
                    type="button"
                    onClick={startMovaviAreaRecording}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Video size={17} className="animate-pulse" />
                    <span>🔴 이 영역만 녹화 ({recordDuration > 0 ? `${recordDuration}초` : '수동'})</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={stopCroppedRecording}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl flex items-center gap-2 shadow-lg animate-bounce cursor-pointer"
                >
                  <Square size={16} fill="white" />
                  <span>⏹️ 녹화 즉시 종료</span>
                </button>
              )}
            </div>
          </div>

          {/* 녹화 완료 모달 팝업 */}
          {recordedBlob && recordedVideoUrl && (
            <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <h4 className="text-base font-black">지정 영역 녹화 완료!</h4>
                  </div>
                  <span className="text-xs text-slate-400">
                    약 {(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <video src={recordedVideoUrl} controls autoPlay className="max-w-full max-h-full" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTransferToGifEditor}
                    disabled={isNavigating}
                    className="py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Wand2 size={16} />
                    <span>{isNavigating ? '편집기로 이동 중...' : '✨ 움짤(GIF)로 만들기'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadVideo}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download size={16} />
                    <span>WebM 영상 저장</span>
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={resetRecordingStateOnly}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    🔄 다시 영역 지정해서 녹화하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3초 카운트다운 오버레이 */}
          {recordCountdown !== null && (
            <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-red-500/20 text-red-500 border-4 border-red-500 flex items-center justify-center text-5xl font-black mb-4 animate-ping">
                {recordCountdown}
              </div>
              <p className="text-lg font-bold text-white">원하는 액션을 준비하세요!</p>
              <p className="text-xs text-slate-400 mt-1">지정한 오렌지 사각형 영역 내부만 녹화됩니다.</p>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* [B] 일반 모달 다이얼로그 (모드 선택 창) */
        /* ========================================================================= */
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
          {/* 모달 상단 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-xs">
                <Crop size={18} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  화면 캡처 &amp; 녹화 스튜디오
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  원하는 크기를 조절 프레임으로 자유롭게 직접 지정합니다
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 상단 탭 전환 */}
          <div className="flex border-b border-slate-200 px-6 pt-3 bg-white overflow-x-auto">
            <button
              onClick={() => setActiveTab('pip')}
              className={`pb-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pip'
                  ? 'border-blue-600 text-blue-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles size={16} />
              <span>🚀 자유 이동 플로팅</span>
              <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                신규
              </span>
            </button>
            <button
              onClick={() => setActiveTab('movavi')}
              className={`pb-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'movavi'
                  ? 'border-orange-500 text-orange-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Crop size={16} />
              <span>🎯 자유 영역 지정</span>
              <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                BEST
              </span>
            </button>
            <button
              onClick={() => setActiveTab('screenshot')}
              className={`pb-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'screenshot'
                  ? 'border-purple-600 text-purple-700 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera size={16} />
              <span>전체 캡처</span>
            </button>
            <button
              onClick={() => setActiveTab('record')}
              className={`pb-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'record'
                  ? 'border-indigo-600 text-indigo-700 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Video size={16} />
              <span>전체 녹화</span>
            </button>
          </div>

          {!isSupported ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">화면 캡처 미지원 브라우저</h4>
              <p className="text-sm text-slate-600 max-w-sm mb-6 leading-relaxed">
                화면 캡처 및 화면 녹화는 보안 정책상 <strong>PC 크롬, 웨일, 엣지</strong> 브라우저에서만 동작합니다.
              </p>
              <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm">
                닫기
              </button>
            </div>
          ) : (
            <div className="p-6">
              {/* [탭 0: 화면 위 자유 이동 플로팅 뷰파인더] */}
              {activeTab === 'pip' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
                        <Sparkles size={18} />
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-sm font-black text-blue-950 block mb-1">
                          설치 없이 컴퓨터 화면 위에 항상 떠 있는 자유 크기 조절 플로팅 창!
                        </strong>
                        브라우저, 엑셀, 노션, 유튜브 등 다른 창을 자유롭게 이동하면서,
                        플로팅 창에 탑재된 <strong>오렌지 조절 프레임(8방향 리사이즈 &amp; 픽셀 입력)</strong>으로 내가 원하는 크기(너비×높이)를 자유자재로 맞춰서 <strong>[📸 이 크기로 캡처]</strong> 또는 <strong>[🔴 이 크기로 녹화]</strong>하세요!
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">🎙️ 마이크 음성 함께 녹음</span>
                      <button
                        type="button"
                        onClick={() => setIncludeAudio(!includeAudio)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                          includeAudio
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {includeAudio ? <Mic size={13} /> : <MicOff size={13} />}
                        {includeAudio ? '음성 포함 ON' : '음성 제외 OFF'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      💡 내 목소리나 마이크 음성을 함께 설명하며 녹화할 수 있습니다.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={launchFloatingPip}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Sparkles size={18} />
                    <span>🚀 화면 위 플로팅 뷰파인더 띄우기</span>
                    <ChevronRight size={18} />
                  </button>

                  <div className="text-center pt-1 text-[11px] text-slate-500">
                    💡 프로그램 설치 없이 웹 브라우저(크롬, 엣지, 웨일 등) 최신 표준 기능으로 동작합니다.
                  </div>
                </div>
              )}

              {/* [탭 1: 자유 영역 지정 캡처 & 부분 녹화 (추천)] */}
              {activeTab === 'movavi' && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-500 text-white rounded-xl shrink-0 mt-0.5">
                        <Crop size={18} />
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-sm font-black text-orange-900 block mb-1">
                          내가 원하는 크기와 위치만 쏙!
                        </strong>
                        화면을 선택하면 <strong>자유롭게 크기를 맞추는 조절 프레임</strong>이 뜹니다.
                        마우스로 원하는 크기로 자유롭게 늘리고 줄여서 <strong>스크린샷 캡처</strong> 또는 <strong>그 영역만 부분 녹화</strong>하세요!
                      </div>
                    </div>
                  </div>

                  {/* 녹화 시간 프리셋 선택 */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      ⏱️ 부분 녹화 시 권장 시간
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { sec: 5, label: '5초' },
                        { sec: 10, label: '10초 (추천⭐)' },
                        { sec: 15, label: '15초' },
                        { sec: 0, label: '무제한' }
                      ].map((item) => (
                        <button
                          key={item.sec}
                          type="button"
                          onClick={() => setRecordDuration(item.sec)}
                          className={`py-2 px-1 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                            recordDuration === item.sec
                              ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 메인 실행 버튼 */}
                  <button
                    type="button"
                    onClick={launchMovaviStudio}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Crop size={18} />
                    <span>🎯 오렌지 프레임 영역 선택 스튜디오 열기</span>
                    <ChevronRight size={18} />
                  </button>

                  {/* 단축키 꿀팁 */}
                  <div className="text-center pt-1 text-[11px] text-slate-500">
                    💡 캡처 후 스튜디오에서 <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-orange-600">Ctrl + V</kbd>를 눌러도 즉시 로드됩니다.
                  </div>
                </div>
              )}

              {/* [탭 2: 전체 캡처] */}
              {activeTab === 'screenshot' && (
                <div className="space-y-4">
                  {countdown !== null ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center animate-pulse">
                      <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-3xl font-black mb-3">
                        {countdown}
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {countdown}초 후 화면 선택 창이 나타납니다.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsCapturing(true);
                          try {
                            const file = await captureScreenshotFromDisplay();
                            onScreenshotCaptured?.(file);
                            onClose();
                          } catch (err: any) {
                            if (err.name !== 'NotAllowedError') alert(err.message || '오류 발생');
                          } finally {
                            setIsCapturing(false);
                          }
                        }}
                        className="p-5 border-2 border-purple-200 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 rounded-2xl flex flex-col items-center text-center transition-all group cursor-pointer"
                      >
                        <Camera size={26} className="text-purple-600 mb-2" />
                        <span className="text-sm font-black text-slate-800 mb-1">⚡ 전체 바로 캡처</span>
                        <span className="text-xs text-slate-500">화면/창 전체를 1초 만에 로드</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsCapturing(true);
                          setCountdown(3);
                          let c = 3;
                          countdownTimerRef.current = setInterval(async () => {
                            c -= 1;
                            if (c > 0) setCountdown(c);
                            else {
                              clearInterval(countdownTimerRef.current!);
                              setCountdown(null);
                              try {
                                const file = await captureScreenshotFromDisplay();
                                onScreenshotCaptured?.(file);
                                onClose();
                              } catch (err: any) {
                                if (err.name !== 'NotAllowedError') alert(err.message || '오류 발생');
                              } finally {
                                setIsCapturing(false);
                              }
                            }
                          }, 1000);
                        }}
                        className="p-5 border-2 border-indigo-200 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl flex flex-col items-center text-center transition-all group cursor-pointer"
                      >
                        <Clock size={26} className="text-indigo-600 mb-2" />
                        <span className="text-sm font-black text-slate-800 mb-1">⏱️ 3초 후 전체 캡처</span>
                        <span className="text-xs text-slate-500">다른 창으로 전환할 시간 제공</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* [탭 3: 전체 녹화] */}
              {activeTab === 'record' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    특정 영역만 잘라서 녹화하려면 상단의 <strong>[🎯 자유 영역 지정]</strong> 탭을 이용해 주세요.
                  </p>
                  <button
                    type="button"
                    onClick={launchMovaviStudio}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Video size={18} />
                    <span>화면 녹화기 실행하기</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    )}
  </>
  );
}
