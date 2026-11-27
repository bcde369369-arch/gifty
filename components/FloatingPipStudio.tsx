'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  Video,
  Square,
  X,
  CheckCircle2,
  Sparkles,
  Maximize2,
  Clock,
  ShieldCheck,
  Wand2
} from 'lucide-react';
import { saveRecordedVideo } from '@/lib/screenCapture';

interface FloatingPipStudioProps {
  stream: MediaStream | null;
  isOpen: boolean;
  onClose: () => void;
  onScreenshotCaptured: (file: File) => void;
  onRecordingComplete: (file: File) => void;
}

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

  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
            width: 360,
            height: 280
          });

          if (!isSubscribed) {
            win.close();
            return;
          }

          // 부모 문서 스타일시트 복사
          [...document.styleSheets].forEach((sheet) => {
            try {
              const cssRules = [...sheet.cssRules].map((r) => r.cssText).join('');
              const style = win.document.createElement('style');
              style.textContent = cssRules;
              win.document.head.appendChild(style);
            } catch {
              if (sheet.href) {
                const link = win.document.createElement('link');
                link.rel = 'stylesheet';
                link.href = sheet.href;
                win.document.head.appendChild(link);
              }
            }
          });

          // 기본 스타일 지정
          win.document.body.style.margin = '0';
          win.document.body.style.padding = '0';
          win.document.body.style.background = '#0f172a';
          win.document.body.style.color = '#ffffff';
          win.document.body.style.overflow = 'hidden';
          win.document.body.style.fontFamily = 'system-ui, sans-serif';

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
    };
  }, [isOpen, stream]);

  // PiP 비디오 요소에 스트림 연결 및 트랙 종료 감지
  useEffect(() => {
    if (!stream) return;

    if (pipVideoRef.current) {
      pipVideoRef.current.srcObject = stream;
      pipVideoRef.current.play().catch(console.error);
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

  // ==========================================
  // [1] 플로팅 창에서 지금 바로 스크린샷 찰칵
  // ==========================================
  const handlePipCapture = useCallback(() => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    const tempVideo = document.createElement('video');
    tempVideo.srcObject = new MediaStream([track]);
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    tempVideo.onloadedmetadata = () => {
      tempVideo.play().then(() => {
        const canvas = document.createElement('canvas');
        canvas.width = tempVideo.videoWidth || 1920;
        canvas.height = tempVideo.videoHeight || 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const now = new Date();
          const pad = (n: number) => String(n).padStart(2, '0');
          const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
          const file = new File([blob], `gifty_pip_capture_${timestamp}.png`, { type: 'image/png' });

          onScreenshotCaptured(file);

          setFeedbackText('📸 캡처 완료! 스튜디오에 반영되었습니다.');
          setTimeout(() => {
            setFeedbackText(null);
            if (pipWindow) pipWindow.close();
            window.focus();
            onClose();
          }, 800);
        }, 'image/png');
      });
    };
  }, [stream, pipWindow, onScreenshotCaptured, onClose]);

  // ==========================================
  // [2] 플로팅 창에서 화면 녹화 시작/정지
  // ==========================================
  const handlePipRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!stream) return;

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
    if (!stream) return;

    recordedChunksRef.current = [];
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

    const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: selectedMime || 'video/webm' });
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const file = new File([blob], `gifty_record_${timestamp}.webm`, { type: blob.type });

      setIsRecording(false);
      setFeedbackText('🎬 녹화 완료! 편집기로 이동합니다...');

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
        background: '#0f172a',
        color: '#ffffff',
        userSelect: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '10px'
      }}
    >
      {/* 헤더 바 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'between',
          marginBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isRecording ? '#ef4444' : '#10b981',
              boxShadow: isRecording ? '0 0 8px #ef4444' : 'none'
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }}>
            {isRecording ? `REC 00:${String(elapsedTime).padStart(2, '0')}` : 'Gifty 플로팅 뷰파인더'}
          </span>
        </div>
      </div>

      {/* 중앙 미니 비디오 뷰파인더 */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          background: '#000000',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid #334155'
        }}
      >
        <video
          ref={pipVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* 피드백 알림 */}
        {feedbackText && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#38bdf8'
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
              color: '#ffffff'
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: '900',
                color: '#ef4444'
              }}
            >
              {recordCountdown}
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
              녹화 준비 중...
            </span>
          </div>
        )}
      </div>

      {/* 안내 텍스트 */}
      <div
        style={{
          fontSize: '10px',
          color: '#64748b',
          textAlign: 'center',
          margin: '6px 0 8px 0'
        }}
      >
        💡 이 창을 화면 구석에 두고, 다른 창을 자유롭게 쓰세요!
      </div>

      {/* 하단 조작 버튼 그룹 */}
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
            padding: '8px 10px',
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
          <span>📸 찰칵 캡처</span>
        </button>

        <button
          type="button"
          onClick={handlePipRecordToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 10px',
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
          <span>{isRecording ? '⏹️ 녹화 종료' : '🔴 녹화 시작'}</span>
        </button>
      </div>
    </div>,
    pipWindow.document.body
  );
}
