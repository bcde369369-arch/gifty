/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { convertToGif, MosaicBox } from '@/lib/ffmpeg';
import {
  Loader2,
  Download,
  RotateCcw,
  Sparkles,
  Copy,
  Play,
  Pause,
  Repeat,
  Film,
  Wand2,
  ChevronDown,
  ChevronUp,
  Grid,
  Trash2,
  Plus,
  X,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { useSiteSettings } from '@/lib/settings';
import CoupangBanner from '@/components/CoupangBanner';
import CoupangSupportCard from '@/components/CoupangSupportCard';

interface VideoEditorProps {
  videoFile: File;
  onReset: () => void;
}

interface SubtitlePreset {
  id: string;
  name: string;
  tag: string;
  font: 'Jua' | 'Gaegu' | 'BlackHanSans' | 'NanumGothic';
  size: 'small' | 'medium' | 'large' | 'xlarge';
  color: string;
  borderWidth: 'none' | 'thin' | 'bold' | 'heavy';
  borderColor: string;
  position: 'bottom' | 'center' | 'top';
  badge?: string;
}

const SUBTITLE_PRESETS: SubtitlePreset[] = [
  {
    id: 'variety-yellow',
    name: '예능 옐로우',
    tag: '유튜브·예능',
    font: 'BlackHanSans',
    size: 'large',
    color: '#FFE812',
    borderWidth: 'heavy',
    borderColor: '#000000',
    position: 'bottom',
    badge: '인기 🔥',
  },
  {
    id: 'clean-white',
    name: '깔끔 화이트',
    tag: '넷플릭스·인터뷰',
    font: 'NanumGothic',
    size: 'medium',
    color: '#FFFFFF',
    borderWidth: 'thin',
    borderColor: '#000000',
    position: 'bottom',
  },
  {
    id: 'shock-red',
    name: '긴급 충격',
    tag: '속보·강조',
    font: 'BlackHanSans',
    size: 'xlarge',
    color: '#FF2A2A',
    borderWidth: 'heavy',
    borderColor: '#FFFFFF',
    position: 'center',
    badge: '강조 🚨',
  },
  {
    id: 'vlog-pink',
    name: '감성 브이로그',
    tag: '손글씨 감성',
    font: 'Gaegu',
    size: 'large',
    color: '#FF6EA7',
    borderWidth: 'thin',
    borderColor: '#000000',
    position: 'bottom',
  },
  {
    id: 'cute-mint',
    name: '동글 민트',
    tag: '귀여운 밈',
    font: 'Jua',
    size: 'medium',
    color: '#00F5D4',
    borderWidth: 'bold',
    borderColor: '#000000',
    position: 'bottom',
  },
];

export default function VideoEditor({ videoFile, onReset }: VideoEditorProps) {
  const { settings, isLoaded } = useSiteSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(15);
  
  // Filmstrip & preview states
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGeneratingThumbs, setIsGeneratingThumbs] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activeHandle, setActiveHandle] = useState<'start' | 'end' | 'move' | null>(null);
  const dragStateRef = useRef<{
    mode: 'start' | 'end' | 'move';
    grabOffset: number;
    windowLength: number;
  } | null>(null);

  const [quality, setQuality] = useState<'high' | 'normal' | 'community' | 'low'>('normal');
  const [textOverlay, setTextOverlay] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('variety-yellow');
  const [showCustomTextDetail, setShowCustomTextDetail] = useState<boolean>(false);
  const [textFont, setTextFont] = useState<'Jua' | 'Gaegu' | 'BlackHanSans' | 'NanumGothic'>('BlackHanSans');
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('large');
  const [textColor, setTextColor] = useState<string>('#FFE812');
  const [textBorderWidth, setTextBorderWidth] = useState<'none' | 'thin' | 'bold' | 'heavy'>('heavy');
  const [textBorderColor, setTextBorderColor] = useState<string>('#000000');
  const [textPosition, setTextPosition] = useState<'bottom' | 'center' | 'top'>('bottom');

  const handleApplyPreset = (preset: SubtitlePreset) => {
    setSelectedPresetId(preset.id);
    setTextFont(preset.font);
    setTextSize(preset.size);
    setTextColor(preset.color);
    setTextBorderWidth(preset.borderWidth);
    setTextBorderColor(preset.borderColor);
    setTextPosition(preset.position);
  };

  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1.0');
  const [isBoomerang, setIsBoomerang] = useState<boolean>(false);
  const [videoFilter, setVideoFilter] = useState<'none' | 'grayscale' | 'sepia' | 'bright'>('none');
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [textWatermark, setTextWatermark] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // ==========================================
  // [동영상 모자이크 & AI 얼굴 인식 상태]
  // ==========================================
  const [mosaicBoxes, setMosaicBoxes] = useState<MosaicBox[]>([]);
  const [isMosaicOpen, setIsMosaicOpen] = useState<boolean>(false);
  const [mosaicDefaultType, setMosaicDefaultType] = useState<'blur' | 'pixel'>('blur');
  const [isDetectingFaces, setIsDetectingFaces] = useState<boolean>(false);
  const [aiScanStatus, setAiScanStatus] = useState<string>('');
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);
  const videoPlayerContainerRef = useRef<HTMLDivElement>(null);
  const mosaicDragRef = useRef<{
    type: 'move' | 'resize';
    boxId: string;
    startX: number;
    startY: number;
    startBox: MosaicBox;
  } | null>(null);

  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('마법 부리는 중... (조금만 기다려주세요)');
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState<number>(0);
  const [webpUrl, setWebpUrl] = useState<string | null>(null);
  const [webpSize, setWebpSize] = useState<number | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  // Extract 8 filmstrip thumbnail images using an offscreen video + canvas
  useEffect(() => {
    if (!videoUrl) return;
    let isCancelled = false;
    setThumbnails([]);
    setIsGeneratingThumbs(true);

    const tempVideo = document.createElement('video');
    tempVideo.src = videoUrl;
    tempVideo.muted = true;
    tempVideo.playsInline = true;
    tempVideo.preload = 'auto';

    const extractFrames = async () => {
      try {
        await new Promise<void>((resolve, reject) => {
          tempVideo.onloadeddata = () => resolve();
          tempVideo.onerror = () => reject(new Error('Failed to load video for thumbnails'));
        });

        const totalDuration = tempVideo.duration;
        if (!totalDuration || !isFinite(totalDuration)) {
          setIsGeneratingThumbs(false);
          return;
        }

        setDuration((prev) => (prev > 0 ? prev : totalDuration));
        setEndTime((prev) => (prev > 0 && prev <= totalDuration ? prev : Math.min(totalDuration, 15)));

        const count = 8;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 160;
        canvas.height = 90;

        const frames: string[] = [];

        for (let i = 0; i < count; i++) {
          if (isCancelled) break;
          const targetTime = Math.min((totalDuration / count) * (i + 0.5), Math.max(0, totalDuration - 0.1));
          tempVideo.currentTime = targetTime;

          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              tempVideo.removeEventListener('seeked', onSeeked);
              resolve();
            };
            tempVideo.addEventListener('seeked', onSeeked);
          });

          if (isCancelled) break;
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL('image/jpeg', 0.6));
            setThumbnails([...frames]);
          }
        }
      } catch (e) {
        console.warn('Thumbnail extraction skipped:', e);
      } finally {
        if (!isCancelled) {
          setIsGeneratingThumbs(false);
        }
        tempVideo.removeAttribute('src');
        tempVideo.load();
      }
    };

    extractFrames();

    return () => {
      isCancelled = true;
      tempVideo.removeAttribute('src');
      tempVideo.load();
    };
  }, [videoUrl]);

  const seekVideoTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      if (vidDuration && isFinite(vidDuration) && vidDuration > 0) {
        setDuration(vidDuration);
        setEndTime((prev) => (prev > 0 && prev <= vidDuration ? prev : Math.min(vidDuration, 15)));
      }
    }
  };

  const getTimeFromPointerEvent = (e: React.PointerEvent<HTMLDivElement>): number => {
    const rect = e.currentTarget.getBoundingClientRect();
    const effectiveDuration = duration > 0 ? duration : 15;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Number((ratio * effectiveDuration).toFixed(1));
  };

  const handleStartTimeChange = (newStart: number) => {
    const effectiveDuration = duration > 0 ? duration : 15;
    const maxStart = Math.max(0, Number((effectiveDuration - 0.5).toFixed(1)));
    const clampedStart = Number(Math.max(0, Math.min(newStart, maxStart)).toFixed(1));
    const currentWindow = Math.max(1, Math.min(15, endTime - startTime));

    setStartTime(clampedStart);

    // If startTime moves past or too close to endTime, push endTime forward automatically
    if (clampedStart >= endTime - 0.5) {
      const pushedEnd = Math.min(
        effectiveDuration,
        Math.max(clampedStart + 0.5, Number((clampedStart + currentWindow).toFixed(1)))
      );
      setEndTime(Number(pushedEnd.toFixed(1)));
    } else if (endTime - clampedStart > 15) {
      setEndTime(Number((clampedStart + 15).toFixed(1)));
    }

    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlayingPreview(false);
    }
    seekVideoTo(clampedStart);
  };

  const handleEndTimeChange = (newEnd: number) => {
    const effectiveDuration = duration > 0 ? duration : 15;
    const clampedEnd = Number(Math.min(effectiveDuration, Math.max(0.5, newEnd)).toFixed(1));

    if (clampedEnd <= startTime + 0.5) {
      const pulledStart = Math.max(0, Number((clampedEnd - 0.5).toFixed(1)));
      setStartTime(pulledStart);
    } else if (clampedEnd - startTime > 15) {
      const adjustedStart = Math.max(0, Number((clampedEnd - 15).toFixed(1)));
      setStartTime(adjustedStart);
    }

    setEndTime(clampedEnd);
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlayingPreview(false);
    }
    seekVideoTo(clampedEnd);
  };

  const handleWindowMove = (targetStart: number, windowLength: number) => {
    const effectiveDuration = duration > 0 ? duration : 15;
    const safeWindow = Math.max(0.5, Math.min(15, windowLength, effectiveDuration));
    const maxStart = Math.max(0, effectiveDuration - safeWindow);
    const nextStart = Number(Math.max(0, Math.min(targetStart, maxStart)).toFixed(1));
    const nextEnd = Number(Math.min(effectiveDuration, nextStart + safeWindow).toFixed(1));

    setStartTime(nextStart);
    setEndTime(nextEnd);

    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlayingPreview(false);
    }
    seekVideoTo(nextStart);
  };

  const handleTimelinePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isConverting) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const effectiveDuration = duration > 0 ? duration : 15;
    const clickedTime = getTimeFromPointerEvent(e);
    const edgeThreshold = Math.max(0.4, effectiveDuration * 0.045);
    const distToStart = Math.abs(clickedTime - startTime);
    const distToEnd = Math.abs(clickedTime - endTime);
    const windowLength = Math.max(0.5, Math.min(15, endTime - startTime));

    if (distToStart <= edgeThreshold && distToStart <= distToEnd) {
      dragStateRef.current = { mode: 'start', grabOffset: 0, windowLength };
      setActiveHandle('start');
      handleStartTimeChange(clickedTime);
    } else if (distToEnd <= edgeThreshold) {
      dragStateRef.current = { mode: 'end', grabOffset: 0, windowLength };
      setActiveHandle('end');
      handleEndTimeChange(clickedTime);
    } else if (clickedTime > startTime && clickedTime < endTime) {
      // Dragging inside the selection box moves the entire [startTime ~ endTime] window
      const grabOffset = clickedTime - startTime;
      dragStateRef.current = { mode: 'move', grabOffset, windowLength };
      setActiveHandle('move');
      seekVideoTo(startTime);
    } else {
      // Clicking outside the selection box jumps startTime to clicked position
      dragStateRef.current = { mode: 'move', grabOffset: 0, windowLength };
      setActiveHandle('move');
      handleWindowMove(clickedTime, windowLength);
    }
  };

  const handleTimelinePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || isConverting) return;
    const moveTime = getTimeFromPointerEvent(e);
    if (dragState.mode === 'start') {
      handleStartTimeChange(moveTime);
    } else if (dragState.mode === 'end') {
      handleEndTimeChange(moveTime);
    } else {
      handleWindowMove(moveTime - dragState.grabOffset, dragState.windowLength);
    }
  };

  const handleTimelinePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current || activeHandle) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore if not captured
      }
      dragStateRef.current = null;
      setActiveHandle(null);
    }
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const now = vid.currentTime;
    setCurrentTime(now);

    // Loop within [startTime, endTime] when loop preview is enabled
    if (isLooping && !vid.paused && activeHandle === null) {
      if (now >= endTime || now < startTime - 0.15) {
        vid.currentTime = startTime;
        vid.play().catch(() => {});
      }
    }
  };

  const toggleLoopPreview = () => {
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      setIsLooping(true);
      if (vid.currentTime < startTime || vid.currentTime >= endTime) {
        vid.currentTime = startTime;
      }
      vid.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(() => {});
    } else {
      vid.pause();
      setIsPlayingPreview(false);
    }
  };

  // Sync playback speed & filter preview on the live video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = parseFloat(playbackSpeed) || 1.0;
    }
  }, [playbackSpeed]);

  const getPreviewFilterStyle = () => {
    if (videoFilter === 'grayscale') return 'grayscale(100%)';
    if (videoFilter === 'sepia') return 'sepia(100%)';
    if (videoFilter === 'bright') return 'brightness(1.06) contrast(1.1) saturate(1.2)';
    return 'none';
  };

  // ==========================================
  // [동영상 모자이크 & AI 얼굴 자동 감지 로직]
  // ==========================================
  const loadScriptOnce = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  };

  // 피부톤 기반의 오프라인 스마트 얼굴 후보 탐색기 (최후의 폴백)
  const detectFacesBySkinCluster = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const step = 8;
      const skinPoints: { x: number; y: number }[] = [];

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          // 일반적인 사람 피부색 범위 (RGB & 델타 조건)
          if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15 && (Math.max(r, g, b) - Math.min(r, g, b)) > 15) {
            skinPoints.push({ x, y });
          }
        }
      }

      if (skinPoints.length < 15) return [];

      let minX = width, maxX = 0, minY = height, maxY = 0;
      skinPoints.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const clusterW = maxX - minX;
      const clusterH = maxY - minY;
      if (clusterW > 20 && clusterH > 20 && clusterW < width * 0.9) {
        return [{
          x: Math.max(0, minX),
          y: Math.max(0, minY),
          w: Math.min(width - minX, clusterW),
          h: Math.min(height - minY, clusterH)
        }];
      }
      return [];
    } catch {
      return [];
    }
  };

  // 비디오 프레임에서 얼굴 감지 실행
  const detectFacesFromVideoElement = async (video: HTMLVideoElement): Promise<{ x: number; y: number; w: number; h: number }[]> => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 1. 브라우저 Native Shape Detection API (하드웨어 가속)
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        setAiScanStatus('하드웨어 가속 얼굴 인식 엔진 실행 중...');
        const detector = new (window as any).FaceDetector({ fastMode: false, maxDetectedFaces: 8 });
        const faces = await detector.detect(canvas);
        if (faces && faces.length > 0) {
          return faces.map((f: any) => ({
            x: f.boundingBox.x,
            y: f.boundingBox.y,
            w: f.boundingBox.width,
            h: f.boundingBox.height
          }));
        }
      } catch (err) {
        console.warn('Native FaceDetector error, falling back:', err);
      }
    }

    // 2. TensorFlow.js BlazeFace (CDN 지연 로딩)
    try {
      setAiScanStatus('AI 신경망 모델 로딩 중...');
      if (!(window as any).tf) {
        await loadScriptOnce('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js');
      }
      if (!(window as any).blazeface) {
        await loadScriptOnce('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js');
      }
      if ((window as any).blazeface) {
        setAiScanStatus('영상 속 사람 얼굴 정밀 스캔 중...');
        const model = await (window as any).blazeface.load();
        const predictions = await model.estimateFaces(canvas, false);
        if (predictions && predictions.length > 0) {
          return predictions.map((p: any) => {
            const start = p.topLeft as [number, number];
            const end = p.bottomRight as [number, number];
            return {
              x: start[0],
              y: start[1],
              w: Math.max(20, end[0] - start[0]),
              h: Math.max(20, end[1] - start[1])
            };
          });
        }
      }
    } catch (err) {
      console.warn('BlazeFace CDN load error, fallback to skin cluster:', err);
    }

    // 3. Fallback: 오프라인 스마트 피부톤 클러스터 분석
    setAiScanStatus('스마트 피부톤 클러스터 분석 중...');
    return detectFacesBySkinCluster(ctx, canvas.width, canvas.height);
  };

  // AI 자동 얼굴 감지 버튼 핸들러
  const handleScanFacesAI = async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsDetectingFaces(true);
    setAiScanStatus('AI 얼굴 탐지 준비 중...');

    try {
      const rawFaces = await detectFacesFromVideoElement(video);
      const vidW = video.videoWidth || 640;
      const vidH = video.videoHeight || 360;

      if (!rawFaces || rawFaces.length === 0) {
        alert('현재 화면에서 감지된 얼굴이 없습니다.\n사람 얼굴이 정면으로 보이는 구간으로 이동한 후 다시 시도하거나, [➕ 수동 박스 추가]를 이용해 주세요.');
        return;
      }

      // 15% 안전 패딩을 적용하여 0~100% 비율로 변환
      const newBoxes: MosaicBox[] = rawFaces.map((f, i) => {
        const padX = f.w * 0.18;
        const padY = f.h * 0.18;
        const x = Math.max(0, f.x - padX);
        const y = Math.max(0, f.y - padY);
        const w = Math.min(vidW - x, f.w + padX * 2);
        const h = Math.min(vidH - y, f.h + padY * 2);

        return {
          id: `ai-face-${Date.now()}-${i}`,
          xPercent: Math.round((x / vidW) * 100),
          yPercent: Math.round((y / vidH) * 100),
          widthPercent: Math.max(10, Math.round((w / vidW) * 100)),
          heightPercent: Math.max(10, Math.round((h / vidH) * 100)),
          type: mosaicDefaultType,
          label: `🤖 AI 얼굴 #${mosaicBoxes.length + i + 1}`
        };
      });

      setMosaicBoxes(prev => [...prev, ...newBoxes]);
      setIsMosaicOpen(true);
      if (newBoxes.length > 0) setActiveBoxId(newBoxes[0].id);
    } catch (e: any) {
      console.error(e);
      alert('얼굴 감지 중 일시적인 오류가 발생했습니다. 수동으로 박스를 추가해 주세요.');
    } finally {
      setIsDetectingFaces(false);
      setAiScanStatus('');
    }
  };

  // 수동 박스 추가 핸들러
  const handleAddManualBox = () => {
    const newBox: MosaicBox = {
      id: `manual-box-${Date.now()}`,
      xPercent: 38,
      yPercent: 32,
      widthPercent: 24,
      heightPercent: 28,
      type: mosaicDefaultType,
      label: `수동 영역 #${mosaicBoxes.length + 1}`
    };
    setMosaicBoxes(prev => [...prev, newBox]);
    setIsMosaicOpen(true);
    setActiveBoxId(newBox.id);
  };

  // 박스 삭제
  const handleDeleteBox = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMosaicBoxes(prev => prev.filter(b => b.id !== id));
    if (activeBoxId === id) setActiveBoxId(null);
  };

  // 전체 삭제
  const handleClearAllBoxes = () => {
    if (mosaicBoxes.length === 0) return;
    if (confirm('모든 모자이크 영역을 삭제하시겠습니까?')) {
      setMosaicBoxes([]);
      setActiveBoxId(null);
    }
  };

  // 박스 모자이크 타입 토글 (블러 <-> 픽셀)
  const handleToggleBoxType = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMosaicBoxes(prev => prev.map(b => b.id === id ? { ...b, type: b.type === 'pixel' ? 'blur' : 'pixel' } : b));
  };

  // 박스 드래그 & 리사이즈 포인터 핸들러
  const handleBoxPointerDown = (
    e: React.MouseEvent | React.TouchEvent,
    boxId: string,
    actionType: 'move' | 'resize'
  ) => {
    e.stopPropagation();
    setActiveBoxId(boxId);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const targetBox = mosaicBoxes.find(b => b.id === boxId);
    if (!targetBox) return;

    mosaicDragRef.current = {
      type: actionType,
      boxId,
      startX: clientX,
      startY: clientY,
      startBox: { ...targetBox }
    };
  };

  // 윈도우 전역 포인터 이벤트 리스너 (마우스가 박스 밖으로 나가도 드래그 지속)
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!mosaicDragRef.current || !videoPlayerContainerRef.current) return;
      const { type, boxId, startX, startY, startBox } = mosaicDragRef.current;

      const rect = videoPlayerContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const deltaXPercent = ((clientX - startX) / rect.width) * 100;
      const deltaYPercent = ((clientY - startY) / rect.height) * 100;

      setMosaicBoxes(prev =>
        prev.map(b => {
          if (b.id !== boxId) return b;

          if (type === 'move') {
            const nextX = Math.max(0, Math.min(100 - startBox.widthPercent, startBox.xPercent + deltaXPercent));
            const nextY = Math.max(0, Math.min(100 - startBox.heightPercent, startBox.yPercent + deltaYPercent));
            return {
              ...b,
              xPercent: Math.round(nextX),
              yPercent: Math.round(nextY)
            };
          } else {
            const nextW = Math.max(8, Math.min(100 - startBox.xPercent, startBox.widthPercent + deltaXPercent));
            const nextH = Math.max(8, Math.min(100 - startBox.yPercent, startBox.heightPercent + deltaYPercent));
            return {
              ...b,
              widthPercent: Math.round(nextW),
              heightPercent: Math.round(nextH)
            };
          }
        })
      );
    };

    const handlePointerUp = () => {
      mosaicDragRef.current = null;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, []);

  const handleConvert = async () => {
    setIsConverting(true);
    setProgress(0);
    setStatusMessage('마법 부리는 중... (조금만 기다려주세요)');
    
    // Ensure duration is maximum 15 seconds
    const resultDuration = Math.min(endTime - startTime, 15);

    try {
      const result = await convertToGif(
        videoFile,
        startTime,
        resultDuration,
        quality,
        {
          text: textOverlay,
          font: textFont,
          size: textSize,
          color: textColor,
          borderWidth: textBorderWidth,
          borderColor: textBorderColor,
          position: textPosition,
        },
        parseFloat(playbackSpeed),
        watermarkType === 'image' ? logoFile : null,
        videoFilter,
        (ratio, status) => {
          setProgress(Math.round(ratio * 100));
          if (status) setStatusMessage(status);
        },
        null,
        {
          isBoomerang,
          textWatermark: watermarkType === 'text' ? textWatermark : undefined,
          mosaicBoxes: mosaicBoxes.length > 0 ? mosaicBoxes : undefined,
        }
      );
      setGifUrl(result.url);
      setGifSize(result.size);
      setWebpUrl(result.webpUrl || null);
      setWebpSize(result.webpSize || null);
    } catch (error: unknown) {
      console.error('Conversion failed', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`변환 중 오류가 발생했습니다: ${errorMessage}\n(브라우저가 지원하지 않거나 파일이 너무 클 수 있습니다)`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopyHtml = () => {
    const htmlString = `
<p><br/></p>
<p style="text-align: center;">
  <span style="font-size: 13px; color: #888888;">
    이 움짤은 <a href="https://gifty.run" target="_blank" style="color: #4f46e5; text-decoration: underline;">Gifty</a>에서 1초만에 만들어졌습니다!
  </span>
</p>
<p><br/></p>
    `;
    
    try {
      const blob = new Blob([htmlString], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      navigator.clipboard.write([clipboardItem]).then(() => {
        alert('블로그용 출처 문구가 복사되었습니다!\n네이버 블로그 에디터에 붙여넣기(Ctrl+V) 해보세요.');
      });
    } catch (err: unknown) {
      // Fallback for older browsers
      console.warn("Clipboard API HTML copy failed, falling back to text", err);
      navigator.clipboard.writeText('이 움짤은 Gifty(https://gifty.run)에서 1초만에 만들어졌습니다!').then(() => {
        alert('블로그용 출처 문구가 텍스트로 복사되었습니다!');
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 편집 및 변환
        </h3>
        <button onClick={onReset} className="text-slate-400 hover:text-slate-600 p-1">
          <RotateCcw size={18} />
        </button>
      </div>

      <div 
        ref={videoPlayerContainerRef}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 shadow-inner ring-1 ring-slate-900/10 group select-none"
      >
        <video
          ref={videoRef}
          src={videoUrl}
          style={{ filter: getPreviewFilterStyle() }}
          className="w-full h-full object-contain transition-[filter] duration-200"
          controls
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={handleLoadedMetadata}
          onDurationChange={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlayingPreview(true)}
          onPause={() => setIsPlayingPreview(false)}
        />

        {/* Mosaic Overlay Boxes */}
        {mosaicBoxes.map((box) => {
          const isActive = activeBoxId === box.id;
          return (
            <div
              key={box.id}
              onMouseDown={(e) => handleBoxPointerDown(e, box.id, 'move')}
              onTouchStart={(e) => handleBoxPointerDown(e, box.id, 'move')}
              onClick={() => setActiveBoxId(box.id)}
              style={{
                left: `${box.xPercent}%`,
                top: `${box.yPercent}%`,
                width: `${box.widthPercent}%`,
                height: `${box.heightPercent}%`,
                touchAction: 'none'
              }}
              className={`absolute cursor-move flex flex-col justify-between p-1.5 transition-[box-shadow] select-none z-20 ${
                box.type === 'pixel'
                  ? 'bg-purple-900/40 backdrop-blur-xs border-2 border-dashed border-purple-400'
                  : 'bg-purple-500/30 backdrop-blur-md border-2 border-purple-400'
              } rounded-xl shadow-lg ${
                isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-purple-600 scale-[1.01]' : 'opacity-90 hover:opacity-100'
              }`}
            >
              {/* Box Header Label & Action Buttons */}
              <div className="flex items-center justify-between gap-1 pointer-events-auto">
                <span className="text-[10px] font-black text-white bg-purple-900/80 px-1.5 py-0.5 rounded shadow-xs truncate max-w-[80px]">
                  {box.label || (box.type === 'pixel' ? '픽셀' : '블러')}
                </span>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => handleToggleBoxType(box.id, e)}
                    className="p-1 rounded bg-black/60 hover:bg-black/80 text-white text-[9px] font-bold transition-colors"
                    title={box.type === 'pixel' ? '블러로 변경' : '픽셀 모자이크로 변경'}
                  >
                    {box.type === 'pixel' ? '⬛' : '💧'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteBox(box.id, e)}
                    className="p-1 rounded bg-red-600/80 hover:bg-red-700 text-white transition-colors"
                    title="이 모자이크 삭제"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>

              {/* Box Center Icon / Type */}
              <div className="flex items-center justify-center pointer-events-none opacity-70">
                {box.type === 'pixel' ? (
                  <Grid size={16} className="text-white drop-shadow" />
                ) : (
                  <EyeOff size={16} className="text-white drop-shadow" />
                )}
              </div>

              {/* Resize Handle (Bottom-Right) */}
              <div
                onMouseDown={(e) => handleBoxPointerDown(e, box.id, 'resize')}
                onTouchStart={(e) => handleBoxPointerDown(e, box.id, 'resize')}
                className="self-end p-1 -mr-0.5 -mb-0.5 cursor-se-resize text-white bg-purple-700/80 rounded-md hover:bg-purple-600 transition-colors pointer-events-auto shadow-xs"
                title="드래그하여 크기 조절"
              >
                <Maximize2 size={11} className="transform rotate-90" />
              </div>
            </div>
          );
        })}

        {/* AI Scan Loading Overlay on Video */}
        {isDetectingFaces && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs z-30 flex flex-col items-center justify-center gap-3 text-white animate-in fade-in">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin flex items-center justify-center">
              <Sparkles size={20} className="text-purple-300" />
            </div>
            <div className="text-center">
              <span className="text-sm font-black text-purple-200">
                {aiScanStatus || 'AI 얼굴 스캔 중...'}
              </span>
              <p className="text-xs text-slate-300 mt-1">영상 속 사람들의 얼굴 위치를 찾고 있습니다.</p>
            </div>
          </div>
        )}

        {/* Live Subtitle Overlay Preview */}
        {textOverlay.trim() && (
          <div
            className={`pointer-events-none absolute inset-x-4 text-center z-10 transition-all duration-200 ${
              textPosition === 'top'
                ? 'top-4'
                : textPosition === 'center'
                ? 'top-1/2 -translate-y-1/2'
                : 'bottom-8'
            }`}
          >
            <span
              className="inline-block px-3 py-1 tracking-wide break-keep select-none transition-all duration-200"
              style={{
                fontFamily: textFont,
                color: textColor,
                fontSize:
                  textSize === 'small'
                    ? '1.1rem'
                    : textSize === 'medium'
                    ? '1.45rem'
                    : textSize === 'large'
                    ? '1.9rem'
                    : '2.4rem',
                fontWeight: textFont === 'BlackHanSans' ? 900 : textFont === 'NanumGothic' ? 800 : 700,
                textShadow:
                  textBorderWidth === 'none'
                    ? '0 2px 4px rgba(0,0,0,0.5)'
                    : textBorderWidth === 'thin'
                    ? `-1.5px -1.5px 0 ${textBorderColor}, 1.5px -1.5px 0 ${textBorderColor}, -1.5px 1.5px 0 ${textBorderColor}, 1.5px 1.5px 0 ${textBorderColor}`
                    : textBorderWidth === 'bold'
                    ? `-2.5px -2.5px 0 ${textBorderColor}, 2.5px -2.5px 0 ${textBorderColor}, -2.5px 2.5px 0 ${textBorderColor}, 2.5px 2.5px 0 ${textBorderColor}, 0 2px 6px rgba(0,0,0,0.7)`
                    : `-3.5px -3.5px 0 ${textBorderColor}, 3.5px -3.5px 0 ${textBorderColor}, -3.5px 3.5px 0 ${textBorderColor}, 3.5px 3.5px 0 ${textBorderColor}, -3.5px 0 0 ${textBorderColor}, 3.5px 0 0 ${textBorderColor}, 0 -3.5px 0 ${textBorderColor}, 0 3.5px 0 ${textBorderColor}, 0 3px 8px rgba(0,0,0,0.85)`,
              }}
            >
              {textOverlay}
            </span>
          </div>
        )}

        {/* Active Handle Dragging Indicator Badge */}
        {activeHandle && (
          <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg border border-white/15 flex items-center gap-2 animate-in fade-in duration-150">
            <span
              className={`w-2 h-2 rounded-full ${
                activeHandle === 'start'
                  ? 'bg-indigo-400'
                  : activeHandle === 'end'
                  ? 'bg-fuchsia-400'
                  : 'bg-emerald-400'
              } animate-ping`}
            />
            <span>
              {activeHandle === 'start'
                ? `시작 장면 맞추는 중: ${startTime.toFixed(1)}초`
                : activeHandle === 'end'
                ? `끝 장면 맞추는 중: ${endTime.toFixed(1)}초`
                : `구간 이동 중: ${startTime.toFixed(1)}초 ~ ${endTime.toFixed(1)}초`}
            </span>
          </div>
        )}
      </div>

      {!gifUrl && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          {/* Visual Filmstrip Timeline & Range Selector */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            {/* Top Status Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Film size={14} className="text-indigo-600" />
                <span>장면 보며 구간 자르기</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-extrabold">
                <span>선택 구간: {(endTime - startTime).toFixed(1)}초</span>
                <span className="text-indigo-400 font-normal">
                  (최대 15초 · 출력 약 {((endTime - startTime) / (parseFloat(playbackSpeed) || 1)).toFixed(1)}초)
                </span>
              </div>
            </div>

            {/* Filmstrip Container */}
            <div
              ref={timelineRef}
              onPointerDown={handleTimelinePointerDown}
              onPointerMove={handleTimelinePointerMove}
              onPointerUp={handleTimelinePointerUp}
              onPointerCancel={handleTimelinePointerUp}
              style={{ touchAction: 'none' }}
              className="relative h-16 w-full rounded-xl overflow-hidden bg-slate-900 select-none ring-1 ring-slate-900/15 shadow-inner cursor-ew-resize"
            >
              {/* Extracted Frame Thumbnails */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-8 w-full h-full">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const thumb = thumbnails[idx];
                  return (
                    <div
                      key={idx}
                      className="relative w-full h-full border-r border-white/10 last:border-r-0 overflow-hidden bg-slate-800"
                    >
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={`frame-${idx}`}
                          className="w-full h-full object-cover pointer-events-none"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 animate-pulse">
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {isGeneratingThumbs ? '...' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Unselected Left Dim Overlay */}
              {duration > 0 && (
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 bg-slate-950/70 backdrop-blur-[1px] z-10"
                  style={{ width: `${Math.min(100, Math.max(0, (startTime / duration) * 100))}%` }}
                />
              )}

              {/* Unselected Right Dim Overlay */}
              {duration > 0 && (
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 bg-slate-950/70 backdrop-blur-[1px] z-10"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - (endTime / duration) * 100))}%` }}
                />
              )}

              {/* Active Selection Window Frame & Visual Handle Bars */}
              {duration > 0 && (
                <div
                  className="pointer-events-none absolute inset-y-0 z-20 border-y-[3px] border-indigo-500 shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
                  style={{
                    left: `${Math.min(100, Math.max(0, (startTime / duration) * 100))}%`,
                    width: `${Math.min(100, Math.max(0, ((endTime - startTime) / duration) * 100))}%`,
                  }}
                >
                  {/* Left Visual Handle Bar */}
                  <div className="absolute left-0 inset-y-0 w-3.5 bg-indigo-600 flex items-center justify-center shadow-md ring-1 ring-white/80">
                    <div className="w-0.5 h-6 bg-white/90 rounded-full" />
                  </div>
                  {/* Right Visual Handle Bar */}
                  <div className="absolute right-0 inset-y-0 w-3.5 bg-fuchsia-500 flex items-center justify-center shadow-md ring-1 ring-white/80">
                    <div className="w-0.5 h-6 bg-white/90 rounded-full" />
                  </div>
                </div>
              )}

              {/* Current Playhead Position Line */}
              {duration > 0 && (
                <div
                  className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-amber-300 shadow-[0_0_6px_rgba(0,0,0,0.9)]"
                  style={{
                    left: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-amber-300 -translate-x-[3px] -translate-y-0.5 shadow" />
                </div>
              )}
            </div>

            {/* Fine-tuning Controls + Dedicated Sliders for Start & End */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Start Time Fine Control */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    시작점: {startTime.toFixed(1)}초
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStartTimeChange(currentTime)}
                    className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
                    title="현재 재생 중인 화면을 시작점으로 지정"
                  >
                    현재 화면으로
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 15}
                  step={0.1}
                  value={startTime}
                  onMouseDown={() => setActiveHandle('start')}
                  onTouchStart={() => setActiveHandle('start')}
                  onMouseUp={() => setActiveHandle(null)}
                  onTouchEnd={() => setActiveHandle(null)}
                  onChange={(e) => handleStartTimeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartTimeChange(startTime - 0.5)}
                    className="flex-1 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    -0.5초
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartTimeChange(startTime - 0.1)}
                    className="flex-1 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    -0.1초
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartTimeChange(startTime + 0.1)}
                    className="flex-1 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    +0.1초
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartTimeChange(startTime + 0.5)}
                    className="flex-1 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    +0.5초
                  </button>
                </div>
              </div>

              {/* End Time Fine Control */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-fuchsia-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500" />
                    끝점: {endTime.toFixed(1)}초
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEndTimeChange(currentTime)}
                    className="text-[11px] font-bold text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 px-2 py-0.5 rounded-md transition-colors"
                    title="현재 재생 중인 화면을 끝점으로 지정"
                  >
                    현재 화면으로
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 15}
                  step={0.1}
                  value={endTime}
                  onMouseDown={() => setActiveHandle('end')}
                  onTouchStart={() => setActiveHandle('end')}
                  onMouseUp={() => setActiveHandle(null)}
                  onTouchEnd={() => setActiveHandle(null)}
                  onChange={(e) => handleEndTimeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-fuchsia-100 rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEndTimeChange(endTime - 0.5)}
                    className="flex-1 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    -0.5초
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEndTimeChange(endTime - 0.1)}
                    className="flex-1 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    -0.1초
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEndTimeChange(endTime + 0.1)}
                    className="flex-1 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    +0.1초
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEndTimeChange(endTime + 0.5)}
                    className="flex-1 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    +0.5초
                  </button>
                </div>
              </div>
            </div>

            {/* Loop Preview Action Bar */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={toggleLoopPreview}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isPlayingPreview
                    ? 'bg-slate-800 text-white hover:bg-slate-900'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isPlayingPreview ? (
                  <>
                    <Pause size={14} /> 구간 미리보기 일시정지
                  </>
                ) : (
                  <>
                    <Play size={14} /> 선택 구간만 반복 미리보기 ({startTime.toFixed(1)}s ~ {endTime.toFixed(1)}s)
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsLooping(!isLooping)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center gap-1 transition-colors ${
                  isLooping
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
                title="선택 구간 무한 반복 재생 켜기/끄기"
              >
                <Repeat size={14} />
                <span>{isLooping ? '반복 ON' : '반복 OFF'}</span>
              </button>
            </div>
          </div>

          {/* New Feature: Speed Control */}
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 mb-2">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              재생 속도 조절 
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-500 text-white animate-pulse shadow-sm shadow-red-200">NEW ✨</span>
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => setPlaybackSpeed('0.5')} disabled={isConverting} className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${playbackSpeed === '0.5' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} disabled:opacity-50`}>0.5x<br/><span className="font-normal opacity-70">느리게</span></button>
              <button onClick={() => setPlaybackSpeed('1.0')} disabled={isConverting} className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${playbackSpeed === '1.0' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} disabled:opacity-50`}>1.0x<br/><span className="font-normal opacity-70">기본</span></button>
              <button onClick={() => setPlaybackSpeed('1.5')} disabled={isConverting} className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${playbackSpeed === '1.5' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} disabled:opacity-50`}>1.5x<br/><span className="font-normal opacity-70">빠르게</span></button>
              <button onClick={() => setPlaybackSpeed('2.0')} disabled={isConverting} className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${playbackSpeed === '2.0' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} disabled:opacity-50`}>2.0x<br/><span className="font-normal opacity-70">아주빠름</span></button>
            </div>

            {/* Boomerang Loop Toggle */}
            <button
              type="button"
              onClick={() => setIsBoomerang(!isBoomerang)}
              disabled={isConverting}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                isBoomerang
                  ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-xs ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              } disabled:opacity-50`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🔁</span>
                <div className="text-left">
                  <span className="block font-bold">인스타 부메랑 모드 (앞뒤 무한 재생)</span>
                  <span className="block text-[10px] text-slate-400 font-normal">앞으로 갔다가 뒤로 되감겨서 음식·액션 짤에 최고!</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isBoomerang ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
              }`}>
                {isBoomerang ? '적용 ON ✨' : 'OFF'}
              </span>
            </button>
          </div>

          {/* New Feature: Video Filter */}
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 mb-2">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              감성 화면 필터 
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-500 text-white animate-pulse shadow-sm shadow-red-200">NEW ✨</span>
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => setVideoFilter('none')} disabled={isConverting} className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${videoFilter === 'none' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} disabled:opacity-50`}>없음<br/><span className="font-normal opacity-70">원본</span></button>
              <button onClick={() => setVideoFilter('grayscale')} disabled={isConverting} className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${videoFilter === 'grayscale' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} disabled:opacity-50`}>흑백<br/><span className="font-normal opacity-70">클래식</span></button>
              <button onClick={() => setVideoFilter('sepia')} disabled={isConverting} className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${videoFilter === 'sepia' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} disabled:opacity-50`}>세피아<br/><span className="font-normal opacity-70">빈티지</span></button>
              <button onClick={() => setVideoFilter('bright')} disabled={isConverting} className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${videoFilter === 'bright' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} disabled:opacity-50`}>뽀샤시<br/><span className="font-normal opacity-70">화사하게</span></button>
            </div>
          </div>

          {/* New Feature: Text Overlay */}
          <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 mb-2 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span>💬 움짤 자막 달기</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-600 text-white shadow-xs">
                  디자인 UP ✨
                </span>
              </h4>
              {textOverlay && (
                <button
                  onClick={() => setTextOverlay('')}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  자막 지우기 ✕
                </button>
              )}
            </div>

            {/* 자막 입력 인풋 */}
            <input
              type="text"
              value={textOverlay}
              onChange={(e) => setTextOverlay(e.target.value)}
              placeholder="예: 지글지글 육즙 대박! 🥩"
              maxLength={25}
              disabled={isConverting}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 disabled:opacity-50 shadow-xs"
            />

            {/* 자막 상세 스타일링 옵션 (글꼴, 색상, 크기, 테두리) */}
            <div className="space-y-3 pt-1">
              {/* ⚡ 1초 완성 인기 프리셋 (미리캔버스 감성 원클릭 스타일) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Wand2 size={13} className="text-indigo-600" />
                    <span>1초 완성 스타일 프리셋</span>
                  </label>
                  <span className="text-[10px] text-indigo-600 font-semibold">원클릭 방송 스타일 ✨</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {SUBTITLE_PRESETS.map((p) => {
                    const isSelected = selectedPresetId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        disabled={isConverting}
                        className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-500'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        } disabled:opacity-50`}
                      >
                        {p.badge && (
                          <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white shadow-xs">
                            {p.badge}
                          </span>
                        )}
                        <div
                          className="text-xs px-2 py-0.5 rounded mb-1 select-none font-bold truncate max-w-full"
                          style={{
                            fontFamily: p.font,
                            color: p.color,
                            backgroundColor: '#1E293B',
                            textShadow:
                              p.borderWidth === 'heavy'
                                ? `0 0 2px ${p.borderColor}, -1px -1px 0 ${p.borderColor}, 1px -1px 0 ${p.borderColor}, -1px 1px 0 ${p.borderColor}, 1px 1px 0 ${p.borderColor}`
                                : `0 0 1px ${p.borderColor}`,
                          }}
                        >
                          자막 예시
                        </div>
                        <span className="text-xs font-bold text-slate-800 leading-tight">{p.name}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{p.tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 세부 조절 토글 버튼 */}
              <div className="pt-1 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setShowCustomTextDetail(!showCustomTextDetail)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <span>글꼴·색상·크기 직접 미세 조절</span>
                  {showCustomTextDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* 직접 미세 조절 상세 영역 (토글형) */}
              {showCustomTextDetail && (
                <div className="space-y-3 pt-1 border-t border-slate-200/60 animate-in fade-in duration-150">
                  {/* 1. 글꼴 선택 */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1.5">
                      글꼴 선택
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'Jua' as const, label: '둥글 귀염', fontFam: 'Jua' },
                        { id: 'Gaegu' as const, label: '감성 손글씨', fontFam: 'Gaegu' },
                        { id: 'BlackHanSans' as const, label: '예능 볼드', fontFam: 'BlackHanSans' },
                        { id: 'NanumGothic' as const, label: '깔끔 기본', fontFam: 'NanumGothic' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setTextFont(f.id);
                            setSelectedPresetId(null);
                          }}
                          disabled={isConverting}
                          style={{ fontFamily: f.fontFam }}
                          className={`py-2 px-2 rounded-xl border text-xs text-center transition-all ${
                            textFont === f.id
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-xs ring-1 ring-indigo-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          } disabled:opacity-50`}
                        >
                          <span className="block text-[13px]">{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. 글자 색상 & 테두리 프리셋 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-500">
                        인기 색상 배색
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">직접 지정:</span>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => {
                            setTextColor(e.target.value);
                            setSelectedPresetId(null);
                          }}
                          disabled={isConverting}
                          className="w-5 h-5 rounded cursor-pointer border border-slate-200 p-0 bg-transparent"
                          title="커스텀 글자색"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {[
                        { name: '예능 옐로우', color: '#FFE812', border: '#000000', chip: 'bg-[#FFE812]' },
                        { name: '클래식 화이트', color: '#FFFFFF', border: '#000000', chip: 'bg-white' },
                        { name: '러블리 핑크', color: '#FF6EA7', border: '#000000', chip: 'bg-[#FF6EA7]' },
                        { name: '네온 민트', color: '#00F5D4', border: '#000000', chip: 'bg-[#00F5D4]' },
                        { name: '상큼 오렌지', color: '#FF7A00', border: '#000000', chip: 'bg-[#FF7A00]' },
                        { name: '바이올렛', color: '#C084FC', border: '#000000', chip: 'bg-[#C084FC]' },
                      ].map((c) => {
                        const isSelected = textColor === c.color && textBorderColor === c.border;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setTextColor(c.color);
                              setTextBorderColor(c.border);
                              setSelectedPresetId(null);
                            }}
                            disabled={isConverting}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-xl border text-[11px] font-bold transition-all ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs ring-1 ring-indigo-500'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            } disabled:opacity-50`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full border border-black/20 ${c.chip}`}
                            />
                            <span className="truncate">{c.name.split(' ')[1] || c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. 크기 / 두께 / 위치 컨트롤 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/60">
                    {/* 크기 */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        글자 크기
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'small' as const, label: 'S' },
                          { id: 'medium' as const, label: 'M' },
                          { id: 'large' as const, label: 'L' },
                          { id: 'xlarge' as const, label: 'XL' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setTextSize(s.id);
                              setSelectedPresetId(null);
                            }}
                            disabled={isConverting}
                            className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                              textSize === s.id
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            } disabled:opacity-50`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 테두리 굵기 */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        테두리 두께
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'none' as const, label: '없음' },
                          { id: 'thin' as const, label: '얇게' },
                          { id: 'bold' as const, label: '도톰' },
                          { id: 'heavy' as const, label: '굵게' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setTextBorderWidth(b.id);
                              setSelectedPresetId(null);
                            }}
                            disabled={isConverting}
                            className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                              textBorderWidth === b.id
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            } disabled:opacity-50`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 위치 */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        자막 위치
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'top' as const, label: '상단' },
                          { id: 'center' as const, label: '중앙' },
                          { id: 'bottom' as const, label: '하단' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setTextPosition(p.id);
                              setSelectedPresetId(null);
                            }}
                            disabled={isConverting}
                            className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                              textPosition === p.id
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            } disabled:opacity-50`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* New Feature: Watermark & Signature (도용 방지) */}
          <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 mb-2 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span>🛡️ 블로그 서명·워터마크 (도용 방지)</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-600 text-white shadow-xs">
                  추천 ✨
                </span>
              </h4>
              {(textWatermark || logoFile) && (
                <button
                  type="button"
                  onClick={() => {
                    setTextWatermark('');
                    setLogoFile(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  지우기 ✕
                </button>
              )}
            </div>

            {/* 워터마크 모드 탭 (텍스트 서명 vs 이미지 로고) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/60 rounded-xl">
              <button
                type="button"
                onClick={() => setWatermarkType('text')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  watermarkType === 'text'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                ✍️ 텍스트 서명 (간편 1초)
              </button>
              <button
                type="button"
                onClick={() => setWatermarkType('image')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  watermarkType === 'image'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                🖼️ 로고 이미지 업로드
              </button>
            </div>

            {watermarkType === 'text' ? (
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  value={textWatermark}
                  onChange={(e) => setTextWatermark(e.target.value)}
                  placeholder="예: © 혜진의 맛집일기 (불펌금지)"
                  maxLength={25}
                  disabled={isConverting}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 shadow-xs"
                />
                <p className="text-[10px] text-slate-400 pl-0.5">
                  * 우측 하단에 반투명 각인으로 깔끔하게 박혀 다른 곳 불펌을 방지합니다.
                </p>
              </div>
            ) : (
              <div>
                <label className={`w-full border-2 border-dashed rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${logoFile ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-100'} ${isConverting ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setLogoFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    disabled={isConverting}
                  />
                  <span className="text-xs font-medium text-slate-600 truncate max-w-full">
                    {logoFile ? `✅ ${logoFile.name} (선택됨)` : '📷 투명 로고 이미지 선택 (.png, .jpg)'}
                  </span>
                </label>
                <p className="text-[10px] text-slate-400 pl-0.5 mt-1">완성된 움짤 우측 하단에 로고가 자동으로 합성됩니다.</p>
              </div>
            )}
          </div>

          {/* New Feature: Video Face & Area Mosaic / Blur (AI 자동 + 수동 영역) */}
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 mb-2 p-3.5 bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-purple-50/90 border border-purple-200 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-600 text-white rounded-xl shadow-xs">
                  <Grid size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>얼굴 & 개인정보 모자이크</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-600 text-white shadow-xs">
                      AI 탑재 🤖
                    </span>
                  </h4>
                  <p className="text-[11px] text-purple-900/70 mt-0.5">
                    초상권(지나가는 사람 얼굴) 및 번호판, 상호명을 깔끔하게 가려줍니다.
                  </p>
                </div>
              </div>

              {mosaicBoxes.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">
                    {mosaicBoxes.length}개 적용 중
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllBoxes}
                    className="text-xs text-slate-400 hover:text-red-600 transition-colors p-1"
                    title="모든 모자이크 박스 삭제"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* 핵심 액션 버튼 2종: [ 🤖 AI 얼굴 자동 감지 ] & [ ➕ 수동 박스 추가 ] */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* 1. AI 얼굴 자동 감지 버튼 */}
              <button
                type="button"
                onClick={handleScanFacesAI}
                disabled={isConverting || isDetectingFaces}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-black shadow-sm shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDetectingFaces ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>얼굴 탐지 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="text-yellow-300" />
                    <span>🤖 AI 얼굴 자동 감지 (원클릭)</span>
                  </>
                )}
              </button>

              {/* 2. 수동 영역 박스 추가 버튼 */}
              <button
                type="button"
                onClick={handleAddManualBox}
                disabled={isConverting || isDetectingFaces}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-purple-50 border border-purple-300 text-purple-900 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Plus size={15} className="text-purple-600" />
                <span>➕ 수동 영역 추가 (번호판·간판)</span>
              </button>
            </div>

            {/* 스타일 선택 및 설명 */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-purple-200/60 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">기본 스타일:</span>
                <div className="flex items-center bg-white border border-purple-200 rounded-lg p-0.5 gap-0.5">
                  <button
                    type="button"
                    onClick={() => setMosaicDefaultType('blur')}
                    className={`px-2 py-0.5 rounded text-[11px] font-extrabold transition-colors ${
                      mosaicDefaultType === 'blur' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    💧 부드러운 블러
                  </button>
                  <button
                    type="button"
                    onClick={() => setMosaicDefaultType('pixel')}
                    className={`px-2 py-0.5 rounded text-[11px] font-extrabold transition-colors ${
                      mosaicDefaultType === 'pixel' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ⬛ 픽셀 모자이크
                  </button>
                </div>
              </div>

              <span className="text-[10px] text-purple-700/80">
                💡 영상 속 모자이크 박스를 드래그하여 이동하거나 모서리를 당겨 크기를 조절하세요.
              </span>
            </div>
          </div>

          {/* Quality & Target File Size Selection */}
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" /> 화질 및 목표 용량 안심 선택
              </h4>
              <span className="text-[10px] text-indigo-600 font-bold">자동 압축 엔진 탑재 🎯</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                type="button"
                onClick={() => setQuality('normal')}
                disabled={isConverting}
                className={`py-2 px-1 rounded-xl border text-center transition-all ${quality === 'normal' ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs ring-1 ring-indigo-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'} disabled:opacity-50`}
              >
                <span className="block text-xs font-bold">네이버 블로그용</span>
                <span className="text-[10px] opacity-70 leading-tight block mt-0.5">20MB 이하 보장 🎯</span>
              </button>
              <button 
                type="button"
                onClick={() => setQuality('community')}
                disabled={isConverting}
                className={`py-2 px-1 rounded-xl border text-center transition-all ${quality === 'community' ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs ring-1 ring-indigo-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'} disabled:opacity-50`}
              >
                <span className="block text-xs font-bold text-rose-600">디시·커뮤니티</span>
                <span className="text-[10px] opacity-70 leading-tight block mt-0.5">10MB 안심 압축 🔥</span>
              </button>
              <button 
                type="button"
                onClick={() => setQuality('high')}
                disabled={isConverting}
                className={`py-2 px-1 rounded-xl border text-center transition-all ${quality === 'high' ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs ring-1 ring-indigo-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'} disabled:opacity-50`}
              >
                <span className="block text-xs font-bold">초고화질</span>
                <span className="text-[10px] opacity-70 leading-tight block mt-0.5">선명한 640px</span>
              </button>
              <button 
                type="button"
                onClick={() => setQuality('low')}
                disabled={isConverting}
                className={`py-2 px-1 rounded-xl border text-center transition-all ${quality === 'low' ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs ring-1 ring-indigo-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'} disabled:opacity-50`}
              >
                <span className="block text-xs font-bold">초경량</span>
                <span className="text-[10px] opacity-70 leading-tight block mt-0.5">작고 빠른 로딩</span>
              </button>
            </div>
          </div>

          {isConverting ? (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm animate-in fade-in duration-300">
              <div className="flex justify-between items-center text-sm font-bold text-indigo-700">
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> {statusMessage}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-3 rounded-full transition-all duration-300 ease-out relative" 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>

              {/* 로딩 대기 시간 쿠팡 핫딜 넛지 */}
              <div className="mt-2 p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                <span className="text-amber-900 font-bold flex items-center gap-1.5 truncate">
                  <span>☕</span>
                  <span className="truncate">움짤 제작 중 잠시만요! 오늘자 쿠팡 로켓배송 특가 보러가기</span>
                </span>
                <a
                  href="https://www.coupang.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black px-3 py-1 rounded-lg shrink-0 transition-all shadow-xs"
                >
                  쿠팡 보기 🚀
                </a>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConvert}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              마법처럼 움짤 만들기 🪄
            </button>
          )}
        </div>
      )}

      {gifUrl && (
        <div className="flex flex-col items-center space-y-5 animate-in fade-in zoom-in duration-500 pt-4 border-t border-slate-100 mt-2">
          <div className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full mb-2">
            완성되었습니다!
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gifUrl} alt="Converted GIF" className="max-w-full h-auto max-h-[200px] rounded-lg shadow-md border border-slate-200" />
          
          <div className="w-full bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm animate-in fade-in duration-300">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                  <span>✨ 변환 성공!</span>
                  {isBoomerang && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-purple-600 text-white">
                      부메랑 🔁
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${gifSize > (quality === 'community' ? 10 : 20) * 1024 * 1024 ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-700'}`}>
                    GIF: {(gifSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  {webpSize && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      WebP: {(webpSize / (1024 * 1024)).toFixed(2)} MB ✨
                    </span>
                  )}
                </div>
              </div>
              
              {gifSize > 20 * 1024 * 1024 && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                  ⚠️ 20MB를 초과하여 네이버 블로그에 업로드할 수 없습니다. [블로그용] 또는 [디시·커뮤니티] 옵션으로 다시 변환해 주세요!
                </p>
              )}

              {quality === 'community' && gifSize <= 10 * 1024 * 1024 && (
                <p className="text-xs text-emerald-700 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200 font-medium flex items-center gap-1">
                  <span>✅ 디시인사이드·에펨코리아·더쿠 업로드 규격(10MB 미만)을 통과했습니다!</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 w-full mt-2">
            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
              <a
                href={gifUrl}
                download="gifty-magic.gif"
                onClick={(e) => {
                  const targetUrl = window.location.href;
                  const ua = navigator.userAgent.toLowerCase();
                  const isInAppBrowser = /kakaotalk|instagram|facebook|line|band/.test(ua);
                  if (isInAppBrowser) {
                    e.preventDefault();
                    if (ua.match(/kakaotalk/i)) {
                      alert('현재 브라우저에서는 움짤 저장이 불가능합니다. 기본 브라우저(Safari/Chrome)로 이동합니다!');
                      window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(targetUrl)}`;
                    } else if (ua.match(/line/i)) {
                      alert('현재 브라우저에서는 움짤 저장이 불가능합니다. 기본 브라우저(Safari/Chrome)로 이동합니다!');
                      window.location.href = targetUrl.includes('?') ? targetUrl + '&openExternalBrowser=1' : targetUrl + '?openExternalBrowser=1';
                    } else {
                      navigator.clipboard.writeText(targetUrl).then(() => {
                        alert('현재 브라우저에서는 움짤 저장이 불가능합니다.\n링크가 복사되었으니 Safari 또는 Chrome 주소창에 붙여넣어 주세요!');
                      }).catch(() => {
                        alert('현재 브라우저에서는 움짤 저장이 불가능합니다.\n화면의 [︙] 메뉴를 눌러 [다른 브라우저로 열기]를 선택해주세요.');
                      });
                    }
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
              >
                <Download size={18} />
                <span>GIF 다운로드 (표준 호환)</span>
              </a>

              {webpUrl && (
                <a
                  href={webpUrl}
                  download="gifty-magic.webp"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg transition-all"
                >
                  <Sparkles size={18} />
                  <span>WebP 다운로드 (용량 1/5 · 고화질)</span>
                </a>
              )}
            </div>

            <button
              onClick={onReset}
              className="w-full px-4 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-xs"
            >
              새로운 영상으로 다시 만들기 ↺
            </button>
          </div>
          
          <button
            onClick={handleCopyHtml}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors mt-2"
          >
            <Copy size={18} />
            네이버 블로그용 출처 문구 복사 (추천✨)
          </button>

          {/* 블로그 촬영 장비 추천 & 서버 응원 쿠팡 위젯 */}
          <CoupangSupportCard category="gif" className="mt-4" />

          {/* Coupang Partners Banner */}
          {isLoaded && (
            <div className="w-full mt-6 flex flex-col justify-center items-center">
              {/* PC Banner */}
              {settings.coupangBannerHtml && (
                <div className="hidden md:flex w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm p-2 justify-center">
                  <CoupangBanner htmlCode={settings.coupangBannerHtml} />
                </div>
              )}
              {/* Mobile Banner */}
              {settings.coupangBannerHtmlMobile && (
                <div className="flex md:hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm p-2 justify-center">
                  <CoupangBanner htmlCode={settings.coupangBannerHtmlMobile} />
                </div>
              )}
            </div>
          )}

          {/* Square Affiliate Banner */}
          <a
            href={isLoaded ? settings.affiliateLink : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-8 flex flex-col items-center justify-center text-white shadow-lg hover:shadow-xl transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:opacity-40 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500 opacity-20 rounded-full blur-2xl transform -translate-x-5 translate-y-5 group-hover:opacity-40 transition-opacity"></div>
            
            <span className="text-[10px] uppercase tracking-widest font-black text-indigo-300 mb-3 bg-indigo-950 px-2 py-1 rounded">SPONSOR</span>
            <h4 className="text-xl font-extrabold text-center mb-2 leading-tight">{isLoaded ? settings.affiliateTitle : '스폰서 배너'}</h4>
            <p className="text-sm text-indigo-200 text-center mb-6 leading-relaxed">
              {isLoaded ? settings.affiliateSubtitle : '불러오는 중...'}
            </p>
            <div className="bg-white text-indigo-900 font-bold px-6 py-2.5 rounded-full text-sm group-hover:bg-indigo-50 transition-colors shadow-md">
              자세히 보기
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
