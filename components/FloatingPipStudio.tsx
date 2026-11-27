'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  Video,
  Square,
  Crop,
  CheckCircle2,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { saveRecordedVideo } from '@/lib/screenCapture';

interface FloatingPipStudioProps {
  stream: MediaStream | null;
  isOpen: boolean;
  onClose: () => void;
  onScreenshotCaptured: (file: File) => void;
  onRecordingComplete: (file: File) => void;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

export default function FloatingPipStudio({
  stream,
  isOpen,
  onClose,
  onScreenshotCaptured,
  onRecordingComplete
}: FloatingPipStudioProps) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordCountdown, setRecordCountdown] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  // 실시간 스트림 원본 해상도
  const [streamRes, setStreamRes] = useState<{ width: number; height: number }>({
    width: 1920,
    height: 1080
  });

  // 오렌지 조절 프레임 (0.0 ~ 1.0 비율 좌표계)
  const [frameNorm, setFrameNorm] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0.15,
    y: 0.15,
    w: 0.7,
    h: 0.7
  });
  const frameNormRef = useRef(frameNorm);
  frameNormRef.current = frameNorm;

  const [activePreset, setActivePreset] = useState<'free' | 'blog' | 'square' | 'wide' | 'full'>('blog');

  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCropLoopRunningRef = useRef<boolean>(false);

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

  // Document Picture-in-Picture 창 생성
  useEffect(() => {
    if (!isOpen || !stream) {
      if (pipWindow) {
        pipWindow.close();
        setPipWindow(null);
      }
      return;
    }

    let isSubscribed = true;

    const openPip = async () => {
      try {
        if ('documentPictureInPicture' in window) {
          const win = await (window as any).documentPictureInPicture.requestWindow({
            width: 520,
            height: 480
          });

          if (!isSubscribed) {
            win.close();
            return;
          }

          // 기본 스타일 지정
          win.document.body.style.margin = '0';
          win.document.body.style.padding = '0';
          win.document.body.style.background = '#090d16';
          win.document.body.style.color = '#ffffff';
          win.document.body.style.overflow = 'hidden';
          win.document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';

          win.addEventListener('pagehide', () => {
            onClose();
          });

          setPipWindow(win);
        } else {
          alert('현재 브라우저에서는 Document Picture-in-Picture 기능을 지원하지 않습니다. PC 최신 Chrome 또는 Edge를 사용해 주세요.');
          onClose();
        }
      } catch (err: any) {
        console.error('PiP 창 열기 실패:', err);
        onClose();
      }
    };

    openPip();

    return () => {
      isSubscribed = false;
      if (timerRef.current) clearInterval(timerRef.current);
      isCropLoopRunningRef.current = false;
    };
  }, [isOpen, stream]);

  // PiP 비디오 요소에 스트림 연결 및 원본 해상도 취득
  useEffect(() => {
    if (!stream) return;

    if (pipVideoRef.current) {
      pipVideoRef.current.srcObject = stream;
      pipVideoRef.current.play().then(() => {
        if (pipVideoRef.current) {
          const vw = pipVideoRef.current.videoWidth || 1920;
          const vh = pipVideoRef.current.videoHeight || 1080;
          setStreamRes({ width: vw, height: vh });
          applyPresetDimensions('blog', vw, vh);
        }
      }).catch(console.error);
    }

    const track = stream.getVideoTracks()[0];
    if (track) {
      track.onended = () => {
        if (pipWindow) {
          pipWindow.close();
        }
        onClose();
      };
    }
  }, [pipWindow, stream, onClose]);

  // 프리셋 크기 적용
  const applyPresetDimensions = (
    preset: 'free' | 'blog' | 'square' | 'wide' | 'full',
    vw = streamRes.width,
    vh = streamRes.height
  ) => {
    setActivePreset(preset);
    if (preset === 'full') {
      setFrameNorm({ x: 0, y: 0, w: 1, h: 1 });
    } else if (preset === 'blog') {
      // 4:3 (네이버 블로그 최적)
      const targetRatio = 4 / 3;
      const screenRatio = vw / vh;
      let w = 0.65;
      let h = (w * screenRatio) / targetRatio;
      if (h > 0.85) {
        h = 0.85;
        w = (h * targetRatio) / screenRatio;
      }
      setFrameNorm({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
    } else if (preset === 'square') {
      // 1:1 정사각형
      const screenRatio = vw / vh;
      let h = 0.7;
      let w = h / screenRatio;
      if (w > 0.85) {
        w = 0.85;
        h = w * screenRatio;
      }
      setFrameNorm({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
    } else if (preset === 'wide') {
      // 16:9 와이드
      const targetRatio = 16 / 9;
      const screenRatio = vw / vh;
      let w = 0.8;
      let h = (w * screenRatio) / targetRatio;
      if (h > 0.85) {
        h = 0.85;
        w = (h * targetRatio) / screenRatio;
      }
      setFrameNorm({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
    }
  };

  // 직접 픽셀 크기 변경 핸들러
  const handlePixelSizeChange = (type: 'w' | 'h', val: number) => {
    setActivePreset('free');
    if (type === 'w') {
      const newW = Math.max(0.05, Math.min(1, val / streamRes.width));
      let newX = frameNormRef.current.x;
      if (newX + newW > 1) newX = 1 - newW;
      setFrameNorm((prev) => ({ ...prev, x: newX, w: newW }));
    } else {
      const newH = Math.max(0.05, Math.min(1, val / streamRes.height));
      let newY = frameNormRef.current.y;
      if (newY + newH > 1) newY = 1 - newH;
      setFrameNorm((prev) => ({ ...prev, y: newY, h: newH }));
    }
  };

  // 프레임 마우스 드래그 및 리사이즈 시작
  const handleStartDrag = (handle: ResizeHandle, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!stageRef.current || !pipWindow) return;

    const rect = stageRef.current.getBoundingClientRect();
    dragInfoRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initX: frameNormRef.current.x,
      initY: frameNormRef.current.y,
      initW: frameNormRef.current.w,
      initH: frameNormRef.current.h,
      stageW: rect.width,
      stageH: rect.height
    };

    const onMouseMove = (moveEvt: MouseEvent) => {
      const info = dragInfoRef.current;
      if (!info) return;

      const dx = (moveEvt.clientX - info.startX) / info.stageW;
      const dy = (moveEvt.clientY - info.startY) / info.stageH;

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
    };

    const onMouseUp = () => {
      dragInfoRef.current = null;
      pipWindow.removeEventListener('mousemove', onMouseMove);
      pipWindow.removeEventListener('mouseup', onMouseUp);
    };

    pipWindow.addEventListener('mousemove', onMouseMove);
    pipWindow.addEventListener('mouseup', onMouseUp);
  };

  // 실시간 선택 박스 픽셀 치수 계산
  const currentPixelWidth = Math.round(frameNorm.w * streamRes.width);
  const currentPixelHeight = Math.round(frameNorm.h * streamRes.height);

  // ==========================================
  // [1] 플로팅 창에서 지정 영역 스크린샷 찰칵
  // ==========================================
  const handlePipCapture = useCallback(() => {
    if (!stream || !pipVideoRef.current) return;
    const video = pipVideoRef.current;
    const vw = video.videoWidth || streamRes.width;
    const vh = video.videoHeight || streamRes.height;

    const cropX = Math.round(frameNormRef.current.x * vw);
    const cropY = Math.round(frameNormRef.current.y * vh);
    const cropW = Math.max(2, Math.round(frameNormRef.current.w * vw));
    const cropH = Math.max(2, Math.round(frameNormRef.current.h * vh));

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const file = new File([blob], `gifty_pip_crop_${timestamp}.png`, { type: 'image/png' });

      onScreenshotCaptured(file);

      setFeedbackText(`📸 ${cropW} × ${cropH}px 캡처 완료!`);
      setTimeout(() => {
        setFeedbackText(null);
        if (pipWindow) pipWindow.close();
        window.focus();
        onClose();
      }, 700);
    }, 'image/png');
  }, [stream, pipWindow, streamRes, onScreenshotCaptured, onClose]);

  // ==========================================
  // [2] 플로팅 창에서 지정 영역 녹화 시작/정지
  // ==========================================
  const handlePipRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!stream || !pipVideoRef.current) return;

    setRecordCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setRecordCountdown(count);
      } else {
        clearInterval(interval);
        setRecordCountdown(null);
        beginActualPipRecord();
      }
    }, 1000);
  };

  const beginActualPipRecord = () => {
    if (!stream || !pipVideoRef.current) return;
    const video = pipVideoRef.current;
    const vw = video.videoWidth || streamRes.width;
    const vh = video.videoHeight || streamRes.height;

    const cropW = Math.max(2, Math.round(frameNormRef.current.w * vw));
    const cropH = Math.max(2, Math.round(frameNormRef.current.h * vh));

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const ctx = cropCanvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    isCropLoopRunningRef.current = true;

    // 30fps 실시간 부분 영역 크롭 렌더 루프
    const renderLoop = () => {
      if (!isCropLoopRunningRef.current) return;
      const curX = Math.round(frameNormRef.current.x * video.videoWidth);
      const curY = Math.round(frameNormRef.current.y * video.videoHeight);
      const curW = Math.max(2, Math.round(frameNormRef.current.w * video.videoWidth));
      const curH = Math.max(2, Math.round(frameNormRef.current.h * video.videoHeight));

      ctx.drawImage(video, curX, curY, curW, curH, 0, 0, cropCanvas.width, cropCanvas.height);
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);

    const croppedStream = cropCanvas.captureStream(30);
    // 오디오 트랙이 있다면 추가
    stream.getAudioTracks().forEach((track) => croppedStream.addTrack(track));

    recordedChunksRef.current = [];
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

    const recorder = new MediaRecorder(croppedStream, selectedMime ? { mimeType: selectedMime } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      isCropLoopRunningRef.current = false;
      const blob = new Blob(recordedChunksRef.current, { type: selectedMime || 'video/webm' });
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const file = new File([blob], `gifty_pip_record_${timestamp}.webm`, { type: blob.type });

      setIsRecording(false);
      setFeedbackText('🎬 부분 녹화 완료! 편집기로 이동합니다...');

      try {
        await saveRecordedVideo(blob, file.name);
        onRecordingComplete(file);
      } catch (err) {
        console.error(err);
      }

      setTimeout(() => {
        if (pipWindow) pipWindow.close();
        window.focus();
        onClose();
        window.location.href = '/?from=record';
      }, 1000);
    };

    recorder.start(250);
    setIsRecording(true);
    setElapsedTime(0);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 500);
  };

  const stopRecording = () => {
    isCropLoopRunningRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  if (!isOpen || !pipWindow) return null;

  // 플로팅 PiP 윈도우 내부 렌더링 컨텐츠
  return createPortal(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#090d16',
        color: '#ffffff',
        userSelect: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '8px',
        gap: '6px'
      }}
    >
      {/* 1. 상단 타이틀 & 레코딩 상태 바 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isRecording ? '#ef4444' : '#10b981',
              boxShadow: isRecording ? '0 0 8px #ef4444' : '0 0 6px #10b981'
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#cbd5e1' }}>
            {isRecording ? `🔴 REC 00:${String(elapsedTime).padStart(2, '0')}` : 'Gifty 자유 크기 조절 플로팅 창'}
          </span>
        </div>

        {/* 실시간 선택 픽셀 뱃지 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(249, 115, 22, 0.18)',
            border: '1px solid rgba(249, 115, 22, 0.5)',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '900',
            color: '#fb923c'
          }}
        >
          <span>📐 {currentPixelWidth} × {currentPixelHeight} px</span>
        </div>
      </div>

      {/* 2. 상단 크기 프리셋 & 직접 픽셀 조절 툴바 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#131b2e',
          borderRadius: '8px',
          padding: '4px 6px',
          border: '1px solid #1e293b',
          gap: '4px'
        }}
      >
        {/* 프리셋 버튼 그룹 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {[
            { id: 'blog', label: '블로그 4:3' },
            { id: 'square', label: '1:1' },
            { id: 'wide', label: '16:9' },
            { id: 'full', label: '전체' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyPresetDimensions(item.id as any)}
              style={{
                padding: '3px 7px',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '5px',
                border: activePreset === item.id ? '1px solid #f97316' : '1px solid transparent',
                background: activePreset === item.id ? '#ea580c' : '#1e293b',
                color: activePreset === item.id ? '#ffffff' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* W x H 직접 입력 컨트롤 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#94a3b8' }}>
          <span>W</span>
          <input
            type="number"
            value={currentPixelWidth}
            onChange={(e) => handlePixelSizeChange('w', parseInt(e.target.value) || 100)}
            style={{
              width: '44px',
              padding: '2px 4px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          />
          <span>× H</span>
          <input
            type="number"
            value={currentPixelHeight}
            onChange={(e) => handlePixelSizeChange('h', parseInt(e.target.value) || 100)}
            style={{
              width: '44px',
              padding: '2px 4px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          />
        </div>
      </div>

      {/* 3. 중앙 비디오 뷰파인더 + 오렌지 조절 프레임 스테이지 */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          background: '#020617',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid #1e293b'
        }}
      >
        <div
          ref={stageRef}
          style={{
            position: 'relative',
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: `${streamRes.width} / ${streamRes.height}`,
            userSelect: 'none',
            overflow: 'hidden'
          }}
        >
          {/* 비디오 화면 */}
          <video
            ref={pipVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              pointerEvents: 'none'
            }}
          />

          {/* 오렌지색 조절 프레임 */}
          <div
            onMouseDown={(e) => handleStartDrag('move', e)}
            style={{
              position: 'absolute',
              left: `${frameNorm.x * 100}%`,
              top: `${frameNorm.y * 100}%`,
              width: `${frameNorm.w * 100}%`,
              height: `${frameNorm.h * 100}%`,
              border: '2px solid #f97316',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
              cursor: 'move',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* 중앙 실시간 크기 태그 */}
            <div
              style={{
                pointerEvents: 'none',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(249, 115, 22, 0.6)',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: '900',
                color: '#fdba74'
              }}
            >
              {currentPixelWidth} × {currentPixelHeight}
            </div>

            {/* 8방향 리사이즈 핸들 */}
            {[
              { handle: 'nw', top: '-5px', left: '-5px', cursor: 'nwse-resize' },
              { handle: 'n', top: '-5px', left: 'calc(50% - 4px)', cursor: 'ns-resize' },
              { handle: 'ne', top: '-5px', right: '-5px', cursor: 'nesw-resize' },
              { handle: 'e', top: 'calc(50% - 4px)', right: '-5px', cursor: 'ew-resize' },
              { handle: 'se', bottom: '-5px', right: '-5px', cursor: 'nwse-resize' },
              { handle: 's', bottom: '-5px', left: 'calc(50% - 4px)', cursor: 'ns-resize' },
              { handle: 'sw', bottom: '-5px', left: '-5px', cursor: 'nesw-resize' },
              { handle: 'w', top: 'calc(50% - 4px)', left: '-5px', cursor: 'ew-resize' }
            ].map((h) => (
              <div
                key={h.handle}
                onMouseDown={(e) => handleStartDrag(h.handle as ResizeHandle, e)}
                style={{
                  position: 'absolute',
                  top: h.top,
                  bottom: (h as any).bottom,
                  left: h.left,
                  right: (h as any).right,
                  width: '9px',
                  height: '9px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #ea580c',
                  borderRadius: '2px',
                  cursor: h.cursor,
                  zIndex: 20
                }}
              />
            ))}
          </div>

          {/* 피드백 알림 */}
          {feedbackText && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.88)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#38bdf8',
                zIndex: 50
              }}
            >
              {feedbackText}
            </div>
          )}

          {/* 3초 카운트다운 */}
          {recordCountdown !== null && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                zIndex: 50
              }}
            >
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: '900',
                  color: '#ef4444'
                }}
              >
                {recordCountdown}
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                선택한 크기로 녹화 준비 중...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 안내 텍스트 */}
      <div
        style={{
          fontSize: '10px',
          color: '#64748b',
          textAlign: 'center'
        }}
      >
        💡 오렌지 네모 틀을 마우스로 자유롭게 늘리거나 이동하여 원하는 크기로 맞추세요!
      </div>

      {/* 4. 하단 조작 버튼 그룹 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          type="button"
          onClick={handlePipCapture}
          disabled={isRecording}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 10px',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: isRecording ? 'not-allowed' : 'pointer',
            opacity: isRecording ? 0.5 : 1
          }}
        >
          <Camera size={14} />
          <span>📸 이 크기로 캡처</span>
        </button>

        <button
          type="button"
          onClick={handlePipRecordToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 10px',
            background: isRecording
              ? '#dc2626'
              : 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {isRecording ? <Square size={13} fill="white" /> : <Video size={14} />}
          <span>{isRecording ? '⏹️ 녹화 종료' : '🔴 이 크기로 녹화'}</span>
        </button>
      </div>
    </div>,
    pipWindow.document.body
  );
}
