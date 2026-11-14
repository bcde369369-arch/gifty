/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  Upload,
  Download,
  Loader2,
  Image as ImageIcon,
  Menu,
  X,
  Copy,
  Check,
  Palette,
  Layers,
  Wand2,
  Sticker,
  Film,
  Sun,
  Contrast,
  Sliders,
  RotateCw,
  FlipHorizontal,
  Eye,
  RefreshCw,
  Zap,
  Scissors,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Coffee,
  Heart,
  Droplets,
  Package,
  Eraser,
  Undo2,
  Paintbrush
} from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import CoupangBanner from '@/components/CoupangBanner';
import CoupangSupportCard from '@/components/CoupangSupportCard';
import { useSiteSettings } from '@/lib/settings';

// 누끼 배경 프리셋
const COLOR_PRESETS = [
  { id: 'transparent', name: '투명', bg: 'transparent', border: true },
  { id: 'white', name: '순백색', bg: '#FFFFFF', border: true },
  { id: 'pastel-pink', name: '핑크', bg: '#FFE4E6' },
  { id: 'pastel-blue', name: '스카이', bg: '#E0F2FE' },
  { id: 'pastel-green', name: '민트', bg: '#DCFCE7' },
  { id: 'pastel-yellow', name: '크림', bg: '#FEF9C3' },
  { id: 'lavender', name: '라벤더', bg: '#F3E8FF' },
  { id: 'charcoal', name: '다크', bg: '#0F172A' },
];

const GRADIENT_PRESETS = [
  { id: 'sunset', name: '선셋', bg: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)' },
  { id: 'ocean', name: '오션', bg: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)' },
  { id: 'purple', name: '바이올렛', bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { id: 'aurora', name: '오로라', bg: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)' },
];

// 사진 보정 프리셋
interface FilterPreset {
  id: string;
  name: string;
  icon: any;
  desc: string;
  values: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    blur: number;
    shadows: number;
  };
}

const PHOTO_PRESETS: FilterPreset[] = [
  {
    id: 'original',
    name: '원본',
    icon: RefreshCw,
    desc: '보정 없음',
    values: { brightness: 100, contrast: 100, saturation: 100, warmth: 0, blur: 0, shadows: 0 }
  },
  {
    id: 'shadow-fix',
    name: '스마트 그림자 제거 🧹',
    icon: Eraser,
    desc: '핸드폰 그림자·어두운 그늘 완화',
    values: { brightness: 105, contrast: 108, saturation: 104, warmth: 0, blur: 0, shadows: 65 }
  },
  {
    id: 'auto',
    name: '자동 최적화',
    icon: Sparkles,
    desc: '밝기+대비 자동 톤업',
    values: { brightness: 108, contrast: 114, saturation: 110, warmth: 4, blur: 0, shadows: 30 }
  },
  {
    id: 'warm',
    name: '카페 감성',
    icon: Coffee,
    desc: '따뜻한 웜톤 분위기',
    values: { brightness: 105, contrast: 106, saturation: 96, warmth: 22, blur: 0, shadows: 15 }
  },
  {
    id: 'vivid',
    name: '생생 리뷰',
    icon: Flame,
    desc: '음식·제품 쨍하고 선명하게',
    values: { brightness: 106, contrast: 120, saturation: 132, warmth: 5, blur: 0, shadows: 20 }
  },
  {
    id: 'clean',
    name: '화이트 스튜디오',
    icon: Package,
    desc: '쇼핑몰·체험단 깔끔한 톤',
    values: { brightness: 115, contrast: 112, saturation: 105, warmth: -4, blur: 0, shadows: 45 }
  },
  {
    id: 'soft',
    name: '뽀샤시 인물',
    icon: Heart,
    desc: '화사하고 부드러운 피부톤',
    values: { brightness: 112, contrast: 94, saturation: 106, warmth: 10, blur: 0, shadows: 25 }
  },
  {
    id: 'film',
    name: '레트로 필름',
    icon: Film,
    desc: '감성적인 아날로그 톤',
    values: { brightness: 102, contrast: 122, saturation: 88, warmth: 16, blur: 0, shadows: 0 }
  },
  {
    id: 'bw',
    name: '모노크롬 흑백',
    icon: Contrast,
    desc: '클래식 흑백 대비',
    values: { brightness: 106, contrast: 128, saturation: 0, warmth: 0, blur: 0, shadows: 0 }
  }
];

export default function ImageStudioPage() {
  const { settings, isLoaded } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 상단 메인 모드 탭: 'remove-bg' (AI 배경제거) vs 'enhance' (사진 보정)
  const [currentTab, setCurrentTab] = useState<'remove-bg' | 'enhance'>('remove-bg');

  // ==========================================
  // [공통 & 누끼 탭 상태]
  // ==========================================
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 누끼 배경 및 스타일링 옵션
  const [selectedBgId, setSelectedBgId] = useState<string>('transparent');
  const [customBgColor, setCustomBgColor] = useState<string>('#FFFFFF');
  const [outlineMode, setOutlineMode] = useState<'none' | 'thin' | 'bold'>('none');
  const [outlineColor, setOutlineColor] = useState<string>('#FFFFFF');
  const [hasShadow, setHasShadow] = useState<boolean>(false);

  // ==========================================
  // [사진 보정 탭 상태]
  // ==========================================
  const [enhanceFile, setEnhanceFile] = useState<File | null>(null);
  const [enhanceUrl, setEnhanceUrl] = useState<string | null>(null);
  const [isEnhanceDragging, setIsEnhanceDragging] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>('original');
  const [filterValues, setFilterValues] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    blur: 0,
    shadows: 0 // 0 ~ 100% (어두운 그림자 영역 선택적 밝기 복원)
  });
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [isComparingOriginal, setIsComparingOriginal] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // ==========================================
  // [그림자 지우개 브러시 전용 상태]
  // ==========================================
  const [isBrushMode, setIsBrushMode] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(45); // 브러시 크기
  const [brushStrength, setBrushStrength] = useState<number>(65); // 지우개 강도
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushHistory, setBrushHistory] = useState<string[]>([]); // 실행 취소(Undo) 스택
  const [brushCursorPos, setBrushCursorPos] = useState<{ x: number; y: number } | null>(null);

  // 캔버스 참조
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const currentImageRef = useRef<HTMLImageElement | null>(null);

  // 토스트 메시지
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const enhanceFileInputRef = useRef<HTMLInputElement>(null);

  // 단축키 Ctrl + V 클립보드 붙여넣기 지원
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            if (currentTab === 'remove-bg') {
              processFile(file);
            } else {
              processEnhanceFile(file);
            }
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [currentTab]);

  // ==========================================
  // [누끼 관련 핸들러]
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다. (JPG, PNG 등)');
      return;
    }
    
    setSelectedFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setIsProcessing(false);
    setSelectedBgId('transparent');
    setOutlineMode('none');
    setHasShadow(false);
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProgressText('AI 엔진 준비 중...');
    
    try {
      const config = {
        model: 'medium' as const,
        progress: (key: string, current: number, total: number) => {
          const percent = Math.round((current / total) * 100);
          if (key.includes('fetch')) {
            setProgressText(`AI 모델 다운로드 중... ${percent}%`);
          } else {
            setProgressText('배경 지우는 중... (약 2~5초 소요)');
          }
        },
        publicPath: 'https://unpkg.com/@imgly/background-removal-data@1.4.5/dist/'
      };

      const resultBlob = await removeBackground(selectedFile, config);
      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
      setProgressText('완료!');
      
    } catch (error: any) {
      console.error(error);
      alert('오류 발생: ' + (error.message || error.toString()) + '\n\n브라우저를 업데이트하거나 다른 사진을 사용해보세요.');
      setProgressText('');
    } finally {
      setIsProcessing(false);
    }
  };

  const getBackgroundStyle = () => {
    if (selectedBgId === 'custom') {
      return { backgroundColor: customBgColor };
    }
    const colorPreset = COLOR_PRESETS.find(p => p.id === selectedBgId);
    if (colorPreset) {
      if (colorPreset.id === 'transparent') {
        return {
          backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          backgroundColor: '#f8fafc',
        };
      }
      return { backgroundColor: colorPreset.bg };
    }
    const gradPreset = GRADIENT_PRESETS.find(p => p.id === selectedBgId);
    if (gradPreset) {
      return { background: gradPreset.bg };
    }
    return {};
  };

  const getImageFilterStyle = () => {
    const filters: string[] = [];
    if (outlineMode === 'thin') {
      filters.push(`drop-shadow(2px 0 0 ${outlineColor}) drop-shadow(-2px 0 0 ${outlineColor}) drop-shadow(0 2px 0 ${outlineColor}) drop-shadow(0 -2px 0 ${outlineColor})`);
    } else if (outlineMode === 'bold') {
      filters.push(
        `drop-shadow(4px 0 0 ${outlineColor}) drop-shadow(-4px 0 0 ${outlineColor}) drop-shadow(0 4px 0 ${outlineColor}) drop-shadow(0 -4px 0 ${outlineColor}) drop-shadow(2px 2px 0 ${outlineColor}) drop-shadow(-2px -2px 0 ${outlineColor})`
      );
    }
    if (hasShadow) {
      filters.push('drop-shadow(0 12px 18px rgba(0, 0, 0, 0.28))');
    }
    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  // 합성된 최종 누끼 Blob 생성
  const generateFinalBlob = async (): Promise<Blob | null> => {
    if (!resultUrl) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // 1. 배경 채우기
        if (selectedBgId === 'custom') {
          ctx.fillStyle = customBgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (selectedBgId !== 'transparent') {
          const colorPreset = COLOR_PRESETS.find(p => p.id === selectedBgId);
          if (colorPreset) {
            ctx.fillStyle = colorPreset.bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            const gradPreset = GRADIENT_PRESETS.find(p => p.id === selectedBgId);
            if (gradPreset) {
              const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
              if (gradPreset.id === 'sunset') {
                gradient.addColorStop(0, '#FF9A8B');
                gradient.addColorStop(0.55, '#FF6A88');
                gradient.addColorStop(1, '#FF99AC');
              } else if (gradPreset.id === 'ocean') {
                gradient.addColorStop(0, '#48c6ef');
                gradient.addColorStop(1, '#6f86d6');
              } else if (gradPreset.id === 'purple') {
                gradient.addColorStop(0, '#a18cd1');
                gradient.addColorStop(1, '#fbc2eb');
              } else if (gradPreset.id === 'aurora') {
                gradient.addColorStop(0, '#2af598');
                gradient.addColorStop(1, '#009efd');
              }
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          }
        }

        // 2. 외곽선(스트로크) 효과
        if (outlineMode !== 'none') {
          const strokeWidth = outlineMode === 'thin' ? Math.max(3, Math.round(canvas.width * 0.006)) : Math.max(6, Math.round(canvas.width * 0.012));
          const dCanvas = document.createElement('canvas');
          dCanvas.width = canvas.width;
          dCanvas.height = canvas.height;
          const dCtx = dCanvas.getContext('2d');
          if (dCtx) {
            dCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
            dCtx.globalCompositeOperation = 'source-in';
            dCtx.fillStyle = outlineColor;
            dCtx.fillRect(0, 0, canvas.width, canvas.height);

            const steps = 16;
            for (let i = 0; i < steps; i++) {
              const angle = (i * 2 * Math.PI) / steps;
              const ox = Math.cos(angle) * strokeWidth;
              const oy = Math.sin(angle) * strokeWidth;
              ctx.drawImage(dCanvas, ox, oy);
            }
          }
        }

        // 3. 그림자 효과
        if (hasShadow) {
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          ctx.shadowBlur = Math.round(canvas.width * 0.02);
          ctx.shadowOffsetY = Math.round(canvas.width * 0.012);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        } else {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };
      img.onerror = () => resolve(null);
      img.src = resultUrl;
    });
  };

  const handleDownload = async () => {
    const blob = await generateFinalBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gifty-studio-nukki-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = async () => {
    try {
      const blob = await generateFinalBlob();
      if (!blob) return;

      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      setCopyFeedback('클립보드에 복사 완료! 블로그 에디터에 Ctrl + V로 붙여넣으세요.');
      setTimeout(() => setCopyFeedback(''), 3500);
    } catch (err) {
      console.error(err);
      alert('클립보드 복사에 실패했습니다. 아래 [이미지로 저장] 버튼을 이용해주세요.');
    }
  };

  // 누끼 결과물을 사진 보정 탭으로 즉시 전송
  const handleTransferToEnhance = async () => {
    setIsProcessing(true);
    setProgressText('사진 보정 스튜디오로 이동 중...');
    try {
      const blob = await generateFinalBlob();
      if (!blob) return;
      const file = new File([blob], `nukki-for-edit-${Date.now()}.png`, { type: 'image/png' });
      processEnhanceFile(file);
      setCurrentTab('enhance');
      setCopyFeedback('누끼 이미지를 보정 탭으로 불러왔습니다! 이제 색감, 밝기, 그림자를 조절해보세요.');
      setTimeout(() => setCopyFeedback(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // [사진 보정 & 그림자 지우기 핸들러]
  // ==========================================
  const handleEnhanceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processEnhanceFile(file);
  };

  const handleEnhanceDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsEnhanceDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processEnhanceFile(file);
  };

  const processEnhanceFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    const url = URL.createObjectURL(file);
    setEnhanceFile(file);
    setEnhanceUrl(url);
    setActivePresetId('original');
    setFilterValues({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      blur: 0,
      shadows: 0
    });
    setRotation(0);
    setFlipH(false);
    setIsBrushMode(false);
    setBrushHistory([]);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      currentImageRef.current = img;
      renderPreviewCanvas();
    };
    img.src = url;
  };

  const applyPreset = (preset: FilterPreset) => {
    setActivePresetId(preset.id);
    setFilterValues({ ...preset.values });
  };

  const handleSliderChange = (field: keyof typeof filterValues, value: number) => {
    setActivePresetId('custom');
    setFilterValues(prev => ({ ...prev, [field]: value }));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFlip = () => {
    setFlipH(prev => !prev);
  };

  const handleResetFilters = () => {
    setActivePresetId('original');
    setFilterValues({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      blur: 0,
      shadows: 0
    });
    setRotation(0);
    setFlipH(false);
    setIsBrushMode(false);
    setBrushHistory([]);
    if (enhanceUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        currentImageRef.current = img;
        renderPreviewCanvas();
      };
      img.src = enhanceUrl;
    }
  };

  // CSS 필터 스타일 문자열 생성
  const getEnhanceFilterString = (fv: typeof filterValues) => {
    if (isComparingOriginal) return 'none';

    let warmthPart = '';
    if (fv.warmth > 0) {
      const sepiaVal = (fv.warmth / 100) * 0.35;
      warmthPart = `sepia(${sepiaVal}) saturate(${1 + sepiaVal * 0.15})`;
    } else if (fv.warmth < 0) {
      const hueVal = Math.round((fv.warmth / 100) * 16);
      warmthPart = `hue-rotate(${hueVal}deg)`;
    }

    const blurPart = fv.blur > 0 ? `blur(${fv.blur}px)` : '';
    return `brightness(${fv.brightness}%) contrast(${fv.contrast}%) saturate(${fv.saturation}%) ${warmthPart} ${blurPart}`.trim() || 'none';
  };

  // 픽셀 레벨 섀도우 리프팅 (어두운 그림자 영역만 부드럽게 밝히는 핵심 알고리즘)
  const applyShadowRecoveryToImageData = (imageData: ImageData, shadowStrength: number) => {
    if (shadowStrength <= 0) return;
    const data = imageData.data;
    const strength = Math.min(100, Math.max(0, shadowStrength)) / 100;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 명도 (Luminance) 계산
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      // 어두운 영역(Shadows & Dark Midtones)에 집중적인 가중치 부여 (0~1)
      // 밝기가 210 이상인 하이라이트는 보존하고, 어두울수록 그림자 제거 효과 최대화
      if (luma < 210) {
        const shadowWeight = Math.pow((210 - luma) / 210, 1.2);
        const boost = shadowWeight * strength * 95; // 최대 명도 리프트 폭

        data[i] = Math.min(255, r + boost);
        data[i + 1] = Math.min(255, g + boost);
        data[i + 2] = Math.min(255, b + boost);
      }
    }
  };

  // 실시간 미리보기 캔버스 렌더링
  const renderPreviewCanvas = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = currentImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isRotated90or270 = rotation % 180 !== 0;
    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;
    const targetW = isRotated90or270 ? natH : natW;
    const targetH = isRotated90or270 ? natW : natH;

    canvas.width = targetW;
    canvas.height = targetH;

    if (isComparingOriginal) {
      // 원본 보기 상태
      ctx.drawImage(img, 0, 0, targetW, targetH);
      return;
    }

    // 1. CSS 필터 적용
    const filterStr = getEnhanceFilterString(filterValues);
    if (filterStr !== 'none') {
      ctx.filter = filterStr;
    } else {
      ctx.filter = 'none';
    }

    // 2. 변환 (회전 및 좌우 반전)
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);
    ctx.drawImage(img, -natW / 2, -natH / 2, natW, natH);
    ctx.restore();

    ctx.filter = 'none';

    // 3. 그림자 제거 슬라이더(Shadows) 적용
    if (filterValues.shadows > 0) {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyShadowRecoveryToImageData(imgData, filterValues.shadows);
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {
        console.warn('Canvas pixel manipulation error:', e);
      }
    }
  }, [filterValues, rotation, flipH, isComparingOriginal]);

  useEffect(() => {
    if (enhanceUrl && currentTab === 'enhance') {
      renderPreviewCanvas();
    }
  }, [enhanceUrl, currentTab, renderPreviewCanvas]);

  // ==========================================
  // [그림자 지우개 브러시 터치/마우스 이벤트]
  // ==========================================
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      screenX: clientX - rect.left,
      screenY: clientY - rect.top
    };
  };

  const handleBrushStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isBrushMode) return;
    setIsDrawing(true);

    const canvas = previewCanvasRef.current;
    if (canvas) {
      // Undo를 위한 현재 상태 저장 (최대 6단계)
      setBrushHistory(prev => [...prev.slice(-5), canvas.toDataURL()]);
    }

    applyBrushStrokeAt(e);
  };

  const handleBrushMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (coords) {
      setBrushCursorPos({ x: coords.screenX, y: coords.screenY });
    }

    if (!isBrushMode || !isDrawing) return;
    applyBrushStrokeAt(e);
  };

  const handleBrushEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // 지우개로 편집된 캔버스를 새로운 base 이미지로 반영
    const canvas = previewCanvasRef.current;
    if (canvas) {
      const updatedUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        currentImageRef.current = img;
      };
      img.src = updatedUrl;
    }
  };

  // 국소 부위 스마트 그림자 지우개 연산
  const applyBrushStrokeAt = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    if (!coords) return;

    const { x, y } = coords;
    // 캔버스 해상도에 맞춘 실제 브러시 반지름 계산
    const rect = canvas.getBoundingClientRect();
    const scaleFactor = canvas.width / rect.width;
    const radius = brushSize * scaleFactor;

    const startX = Math.max(0, Math.floor(x - radius));
    const startY = Math.max(0, Math.floor(y - radius));
    const width = Math.min(canvas.width - startX, Math.ceil(radius * 2));
    const height = Math.min(canvas.height - startY, Math.ceil(radius * 2));

    if (width <= 0 || height <= 0) return;

    try {
      const imgData = ctx.getImageData(startX, startY, width, height);
      const data = imgData.data;
      const strength = brushStrength / 100;

      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = (py * width + px) * 4;
          const curX = startX + px;
          const curY = startY + py;

          // 중심으로부터의 거리 계산 (원형 소프트 브러시)
          const dist = Math.sqrt(Math.pow(curX - x, 2) + Math.pow(curY - y, 2));
          if (dist <= radius) {
            // 원형 외곽으로 갈수록 부드러워지는 가우시안 소프트 블렌딩 (0~1)
            const brushWeight = Math.pow(1 - dist / radius, 1.4);

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;

            // 어두운 영역(그림자)일수록 더 강력하게 밝혀줌
            if (luma < 225) {
              const shadowFactor = Math.pow((225 - luma) / 225, 0.9);
              const boost = shadowFactor * brushWeight * strength * 28;

              data[idx] = Math.min(255, r + boost);
              data[idx + 1] = Math.min(255, g + boost);
              data[idx + 2] = Math.min(255, b + boost);
            }
          }
        }
      }

      ctx.putImageData(imgData, startX, startY);
    } catch (err) {
      console.warn('Brush manipulation error:', err);
    }
  };

  // 실행 취소 (Undo)
  const handleUndoBrush = () => {
    if (brushHistory.length === 0) return;
    const prevDataUrl = brushHistory[brushHistory.length - 1];
    setBrushHistory(prev => prev.slice(0, -1));

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      currentImageRef.current = img;
      renderPreviewCanvas();
    };
    img.src = prevDataUrl;
  };

  // 보정된 최종 이미지 Canvas Blob 생성 (고해상도 무손실)
  const generateEnhancedBlob = async (): Promise<Blob | null> => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return null;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 0.95);
    });
  };

  const handleDownloadEnhanced = async () => {
    setIsExporting(true);
    try {
      const blob = await generateEnhancedBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gifty-studio-enhanced-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyEnhancedClipboard = async () => {
    setIsExporting(true);
    try {
      const blob = await generateEnhancedBlob();
      if (!blob) return;
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      setCopyFeedback('보정된 사진이 클립보드에 복사되었습니다! Ctrl + V로 어디든 붙여넣으세요.');
      setTimeout(() => setCopyFeedback(''), 3500);
    } catch (err) {
      console.error(err);
      alert('클립보드 복사에 실패했습니다. [고화질 다운로드] 버튼을 이용해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  // 보정된 사진을 누끼 제거 탭으로 전송
  const handleTransferToNukki = async () => {
    setIsExporting(true);
    try {
      const blob = await generateEnhancedBlob();
      if (!blob) return;
      const file = new File([blob], `enhanced-for-nukki-${Date.now()}.png`, { type: 'image/png' });
      processFile(file);
      setCurrentTab('remove-bg');
      setCopyFeedback('보정된 사진을 누끼 제거 탭으로 불러왔습니다! 이제 배경을 지워보세요.');
      setTimeout(() => setCopyFeedback(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl transform rotate-3">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800">
              Gifty<span className="text-indigo-600">.</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">홈</Link>
            <Link href="/blog-lab" className="hover:text-indigo-600 transition-colors text-indigo-600 font-extrabold flex items-center gap-1">연구소(SEO) 🔬</Link>
            <Link href="/neighbor" className="hover:text-emerald-700 transition-colors text-emerald-600 font-extrabold flex items-center gap-1">이웃 소통 지표 📊</Link>
            <Link href="/community" className="hover:text-indigo-600 transition-colors text-slate-600 flex items-center gap-1">커뮤니티 💬</Link>
            <Link href="/experience-diary" className="hover:text-indigo-600 transition-colors text-blue-600">체험단 다이어리 📓</Link>
            <Link href="/sticker" className="hover:text-pink-700 transition-colors text-pink-600 font-extrabold">블로그 스티커 🎨</Link>
            <Link href="/remove-bg" className="text-purple-600 font-extrabold flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
              이미지 스튜디오 🎨
            </Link>
          </div>
          <button 
            className="md:hidden text-slate-500 hover:text-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 shadow-md w-full flex flex-col p-4 gap-2 text-sm font-bold absolute top-16 left-0">
            <Link href="/" className="text-slate-700 hover:text-indigo-600 p-3 rounded-xl hover:bg-slate-50">홈</Link>
            <Link href="/blog-lab" className="text-indigo-600 bg-indigo-50 p-3 rounded-xl font-black">연구소(SEO) 🔬</Link>
            <Link href="/neighbor" className="text-emerald-600 hover:bg-emerald-50 p-3 rounded-xl font-black">이웃 소통 지표 📊</Link>
            <Link href="/community" className="text-slate-700 hover:bg-slate-50 p-3 rounded-xl">커뮤니티 💬</Link>
            <Link href="/experience-diary" className="text-blue-600 hover:bg-blue-50 p-3 rounded-xl">체험단 다이어리 📓</Link>
            <Link href="/sticker" className="text-pink-600 hover:bg-pink-50 p-3 rounded-xl">블로그 스티커 🎨</Link>
            <Link href="/remove-bg" className="text-purple-600 bg-purple-50 p-3 rounded-xl font-black">이미지 스튜디오 🎨</Link>
          </div>
        )}
      </nav>

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex flex-col items-center">
        {/* 헤더 섹션 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-purple-100/90 text-purple-700 rounded-full text-xs sm:text-sm font-extrabold mb-3 shadow-xs">
            <Sparkles size={16} /> 100% 무료 브라우저 원스톱 작업실
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            이미지 스튜디오 <span className="text-purple-600">✨</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
            {currentTab === 'remove-bg' 
              ? '클릭 한 번으로 깔끔하게 누끼를 따고, 원하는 배경색과 스티커 효과를 더해보세요.' 
              : '어두운 핸드폰 그림자 지우기부터 화사한 감성 톤보정까지 원스톱 완성!'}
          </p>
        </div>

        {/* 상단 탭 전환 스위처 */}
        <div className="w-full max-w-md bg-slate-200/80 p-1.5 rounded-2xl flex items-center mb-7 shadow-inner">
          <button
            type="button"
            onClick={() => setCurrentTab('remove-bg')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${
              currentTab === 'remove-bg'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scissors size={17} />
            <span>AI 배경 제거 (누끼)</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('enhance')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${
              currentTab === 'enhance'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders size={17} />
            <span>사진 보정 & 그림자 지우개 ✨</span>
          </button>
        </div>

        {/* 공통 피드백 토스트 */}
        {copyFeedback && (
          <div className="w-full max-w-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 mb-6 shadow-sm animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{copyFeedback}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 탭 1: AI 배경제거 (누끼따기) */}
        {/* ========================================================= */}
        {currentTab === 'remove-bg' && (
          <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-8 animate-in fade-in">
            {!originalUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`w-full h-80 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-purple-500 bg-purple-50 scale-[0.99]' 
                    : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/40'
                }`}
              >
                <div className="bg-purple-50 p-4 rounded-2xl mb-3">
                  <Scissors className="text-purple-600" size={36} />
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-700">
                  {isDragging ? '파일을 여기에 놓아주세요' : '클릭하거나 누끼 딸 사진을 끌어다 놓으세요'}
                </p>
                <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                  <span>💡 캡처 후</span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs text-purple-600 font-extrabold">Ctrl + V</kbd>
                  <span>로 바로 붙여넣기도 가능해요!</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">JPG, PNG, WEBP 등 모든 이미지 지원</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* 이미지 비교 영역 (원본 vs 누끼 결과) */}
                <div className="flex flex-col md:flex-row w-full gap-6 justify-center items-center mb-6">
                  <div className="flex flex-col items-center w-full md:w-1/2">
                    <span className="text-xs font-bold text-slate-500 mb-2">원본 사진</span>
                    <div className="w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center p-2">
                      <img src={originalUrl} alt="원본" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center w-full md:w-1/2">
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-bold text-slate-500">누끼 결과 & 스타일링</span>
                      {resultUrl && (
                        <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          배경 제거 완료 ✨
                        </span>
                      )}
                    </div>
                    <div 
                      className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center p-2 transition-all duration-200 shadow-inner"
                      style={getBackgroundStyle()}
                    >
                      {resultUrl ? (
                        <img 
                          src={resultUrl} 
                          alt="누끼 결과" 
                          style={{ filter: getImageFilterStyle() }}
                          className="max-w-full max-h-full object-contain transition-all duration-200" 
                        />
                      ) : (
                        <div className="text-slate-400 flex flex-col items-center">
                          <ImageIcon size={32} className="mb-2 opacity-50" />
                          <span className="text-xs font-medium">아래 버튼을 눌러 배경을 지워보세요</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 진행 상태 바 */}
                {isProcessing && (
                  <div className="w-full bg-purple-50 text-purple-700 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 mb-6 font-bold text-sm border border-purple-100 shadow-xs animate-pulse">
                    <Loader2 className="animate-spin text-purple-600" size={20} />
                    <span>{progressText}</span>
                  </div>
                )}

                {/* 누끼 완료 후 스타일링 패널 */}
                {resultUrl && !isProcessing && (
                  <div className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {/* 1. 배경 선택 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Palette size={15} className="text-purple-600" />
                          <span>배경 선택</span>
                          <span className="text-[11px] font-normal text-slate-400">(쇼핑몰 흰색, 파스텔, 그라데이션)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">직접 지정:</span>
                          <input
                            type="color"
                            value={customBgColor}
                            onChange={(e) => {
                              setCustomBgColor(e.target.value);
                              setSelectedBgId('custom');
                            }}
                            className="w-5 h-5 rounded cursor-pointer border border-slate-300 p-0 bg-transparent"
                            title="원하는 배경색 직접 고르기"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS.map((p) => {
                          const isSelected = selectedBgId === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedBgId(p.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                isSelected
                                  ? 'border-purple-600 bg-white text-purple-700 shadow-xs ring-1 ring-purple-500'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span 
                                className={`w-3.5 h-3.5 rounded-full border border-black/15 ${
                                  p.id === 'transparent' ? 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] bg-[size:4px_4px]' : ''
                                }`}
                                style={p.id !== 'transparent' ? { backgroundColor: p.bg } : {}}
                              />
                              <span>{p.name}</span>
                            </button>
                          );
                        })}

                        {GRADIENT_PRESETS.map((g) => {
                          const isSelected = selectedBgId === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setSelectedBgId(g.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                isSelected
                                  ? 'border-purple-600 bg-white text-purple-700 shadow-xs ring-1 ring-purple-500'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span 
                                className="w-3.5 h-3.5 rounded-full border border-black/15"
                                style={{ background: g.bg }}
                              />
                              <span>{g.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. 외곽선 & 그림자 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200/70">
                      <div>
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                          <Layers size={14} className="text-purple-600" />
                          <span>스티커 외곽선 테두리</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { id: 'none' as const, label: '없음' },
                            { id: 'thin' as const, label: '얇게 (2px)' },
                            { id: 'bold' as const, label: '도톰 (4px)' },
                          ].map((o) => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => setOutlineMode(o.id)}
                              className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                                outlineMode === o.id
                                  ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                          <Sparkles size={14} className="text-purple-600" />
                          <span>입체 그림자 효과</span>
                        </label>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => setHasShadow(false)}
                            className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                              !hasShadow
                                ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            그림자 끄기
                          </button>
                          <button
                            type="button"
                            onClick={() => setHasShadow(true)}
                            className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                              hasShadow
                                ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            자연스러운 그림자 ✨
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 보정 탭 연동 팁 배너 */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Sparkles size={16} className="text-indigo-600 shrink-0" />
                        <span>누끼 딴 피사체의 밝기나 색감, 그림자를 더 보정하고 싶으신가요?</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleTransferToEnhance}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black shadow-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95"
                      >
                        <Sliders size={13} />
                        <span>이 사진 보정실로 보내기 &rarr;</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 하단 액션 버튼 그룹 */}
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-center w-full">
                  {!resultUrl && !isProcessing && (
                    <button 
                      onClick={handleRemoveBackground}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Wand2 size={18} />
                      <span>배경 지우기 시작!</span>
                    </button>
                  )}
                  
                  {resultUrl && (
                    <>
                      <button 
                        onClick={handleCopyClipboard}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                      >
                        <Copy size={16} />
                        <span>클립보드 복사 (Ctrl+V)</span>
                      </button>

                      <button 
                        onClick={handleDownload}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                      >
                        <Download size={16} />
                        <span>{selectedBgId === 'transparent' ? '투명 PNG로 저장' : '이미지로 저장'}</span>
                      </button>

                      <Link
                        href="/sticker"
                        className="bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-sm"
                      >
                        <Sticker size={16} />
                        <span>블로그 스티커 만들기</span>
                      </Link>
                    </>
                  )}
                  
                  <button 
                    onClick={() => {
                      setSelectedFile(null);
                      setOriginalUrl(null);
                      setResultUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-5 rounded-xl transition-colors text-sm"
                  >
                    다른 사진 고르기
                  </button>
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* 탭 2: 사진 보정 & 스마트 그림자 지우개 스튜디오 */}
        {/* ========================================================= */}
        {currentTab === 'enhance' && (
          <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-8 animate-in fade-in">
            {!enhanceUrl ? (
              <div 
                onClick={() => enhanceFileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsEnhanceDragging(true); }}
                onDragLeave={() => setIsEnhanceDragging(false)}
                onDrop={handleEnhanceDrop}
                className={`w-full h-80 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isEnhanceDragging 
                    ? 'border-indigo-500 bg-indigo-50 scale-[0.99]' 
                    : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40'
                }`}
              >
                <div className="bg-indigo-50 p-4 rounded-2xl mb-3">
                  <Eraser className="text-indigo-600" size={36} />
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-700">
                  {isEnhanceDragging ? '파일을 여기에 놓아주세요' : '클릭하거나 그림자 지울 사진을 끌어다 놓으세요'}
                </p>
                <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                  <span>💡 캡처 후</span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs text-indigo-600 font-extrabold">Ctrl + V</kbd>
                  <span>로 바로 붙여넣기도 가능해요!</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">블로그 리뷰, 영수증, 책, 제품 사진 등 핸드폰 그림자 지우기 지원</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* 메인 미리보기 및 조작 툴바 */}
                <div className="w-full mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">실시간 스튜디오</span>
                      {activePresetId !== 'original' && (
                        <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          {PHOTO_PRESETS.find(p => p.id === activePresetId)?.name || '사용자 정의 보정'}
                        </span>
                      )}
                      {isBrushMode && (
                        <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 animate-pulse">
                          🖌️ 그림자 지우개 브러시 활성
                        </span>
                      )}
                    </div>
                    {/* 상단 보조 도구: 브러시 모드 토글, 회전, 반전, 원본비교, 리셋 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsBrushMode(!isBrushMode)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                          isBrushMode
                            ? 'bg-amber-500 text-white shadow-amber-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="원하는 그림자 부분을 직접 문질러 지우기"
                      >
                        <Eraser size={14} />
                        <span>{isBrushMode ? '브러시 끄기' : '그림자 지우개 브러시'}</span>
                      </button>

                      {isBrushMode && brushHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={handleUndoBrush}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                          title="마지막 브러시 실행 취소"
                        >
                          <Undo2 size={13} />
                          <span>되돌리기</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onMouseDown={() => setIsComparingOriginal(true)}
                        onMouseUp={() => setIsComparingOriginal(false)}
                        onTouchStart={() => setIsComparingOriginal(true)}
                        onTouchEnd={() => setIsComparingOriginal(false)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors select-none"
                        title="누르고 있는 동안 원본 사진 표시"
                      >
                        <Eye size={13} />
                        <span>{isComparingOriginal ? '원본 표시 중' : '원본 비교'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRotate}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        title="90도 회전"
                      >
                        <RotateCw size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={handleFlip}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        title="좌우 반전"
                      >
                        <FlipHorizontal size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        title="모든 설정 초기화"
                      >
                        <RefreshCw size={15} />
                      </button>
                    </div>
                  </div>

                  {/* 브러시 설정 바 (브러시 모드 활성 시 노출) */}
                  {isBrushMode && (
                    <div className="w-full bg-amber-50/90 border border-amber-200 rounded-2xl p-3 mb-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <Paintbrush size={15} className="text-amber-600" />
                        <span>그림자가 진 어두운 부분을 마우스나 손가락으로 슥슥 문질러보세요!</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>크기:</span>
                          {[
                            { label: '작게', val: 25 },
                            { label: '보통', val: 45 },
                            { label: '크게', val: 75 }
                          ].map((b) => (
                            <button
                              key={b.val}
                              type="button"
                              onClick={() => setBrushSize(b.val)}
                              className={`px-2 py-0.5 rounded-lg border text-[11px] transition-all ${
                                brushSize === b.val
                                  ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                                  : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-50'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>지우개 세기:</span>
                          <span className="text-amber-700 font-extrabold">{brushStrength}%</span>
                          <input
                            type="range"
                            min="30"
                            max="100"
                            value={brushStrength}
                            onChange={(e) => setBrushStrength(Number(e.target.value))}
                            className="w-20 accent-amber-600 cursor-pointer h-1.5 bg-amber-200 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 캔버스/이미지 미리보기 창 */}
                  <div 
                    className={`w-full h-80 sm:h-96 bg-slate-900/5 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center p-2 shadow-inner select-none ${
                      isBrushMode ? 'cursor-crosshair' : 'cursor-default'
                    }`}
                  >
                    <canvas 
                      ref={previewCanvasRef}
                      onMouseDown={handleBrushStart}
                      onMouseMove={handleBrushMove}
                      onMouseUp={handleBrushEnd}
                      onMouseLeave={handleBrushEnd}
                      onTouchStart={handleBrushStart}
                      onTouchMove={handleBrushMove}
                      onTouchEnd={handleBrushEnd}
                      className="max-w-full max-h-full object-contain transition-all duration-75 shadow-sm"
                    />

                    {isComparingOriginal && (
                      <div className="absolute top-3 left-3 bg-black/75 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                        원본 사진 확인 중
                      </div>
                    )}
                  </div>
                </div>

                {/* 컨트롤 패널 1: 원클릭 감성 & 그림자 제거 프리셋 */}
                <div className="w-full bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Sparkles size={15} className="text-indigo-600" />
                        <span>원클릭 감성 프리셋</span>
                        <span className="text-[11px] font-normal text-slate-400">(스마트 그림자 제거 및 톤 프리셋)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PHOTO_PRESETS.map((p) => {
                        const IconComponent = p.icon;
                        const isSelected = activePresetId === p.id;
                        const isShadowFix = p.id === 'shadow-fix';
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => applyPreset(p)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                              isSelected
                                ? isShadowFix
                                  ? 'border-amber-500 bg-amber-50/50 text-amber-900 shadow-sm ring-2 ring-amber-400/30'
                                  : 'border-indigo-600 bg-white text-indigo-900 shadow-sm ring-2 ring-indigo-500/20'
                                : isShadowFix
                                ? 'border-amber-300/80 bg-gradient-to-r from-amber-50/70 to-orange-50/50 hover:bg-amber-100/50 text-amber-900 font-bold'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black">{p.name}</span>
                              <IconComponent size={14} className={isSelected ? 'text-indigo-600' : isShadowFix ? 'text-amber-600' : 'text-slate-400'} />
                            </div>
                            <span className="text-[10px] text-slate-400 leading-tight">{p.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 컨트롤 패널 2: 정밀 슬라이더 (그림자 제거 슬라이더 포함) */}
                  <div className="pt-3 border-t border-slate-200/80">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <SlidersHorizontal size={15} className="text-indigo-600" />
                        <span>세부 톤 & 그림자 정밀 조절</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {/* 스마트 그림자 제거 슬라이더 (강조 표시) */}
                      <div className="space-y-1 sm:col-span-2 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80">
                        <div className="flex justify-between text-xs font-bold text-amber-900">
                          <span className="flex items-center gap-1.5">
                            <Eraser size={14} className="text-amber-600" />
                            <span>🧹 그림자 제거 (어두운 곳 밝히기)</span>
                            <span className="text-[10px] font-normal text-amber-700/80">밝은 곳 보존 + 그늘만 밝힘</span>
                          </span>
                          <span className="text-amber-700 font-black">{filterValues.shadows}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={filterValues.shadows}
                          onChange={(e) => handleSliderChange('shadows', Number(e.target.value))}
                          className="w-full accent-amber-600 cursor-pointer h-2 bg-amber-200 rounded-lg"
                        />
                      </div>

                      {/* 밝기 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1"><Sun size={13} className="text-amber-500" /> 전체 밝기</span>
                          <span className="text-indigo-600 font-extrabold">{filterValues.brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="160"
                          value={filterValues.brightness}
                          onChange={(e) => handleSliderChange('brightness', Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>

                      {/* 대비 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1"><Contrast size={13} className="text-indigo-500" /> 대비</span>
                          <span className="text-indigo-600 font-extrabold">{filterValues.contrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="160"
                          value={filterValues.contrast}
                          onChange={(e) => handleSliderChange('contrast', Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>

                      {/* 채도 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1"><Palette size={13} className="text-pink-500" /> 채도</span>
                          <span className="text-indigo-600 font-extrabold">{filterValues.saturation}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={filterValues.saturation}
                          onChange={(e) => handleSliderChange('saturation', Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>

                      {/* 색온도 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1"><Coffee size={13} className="text-amber-700" /> 색온도 (쿨톤 ↔ 웜톤)</span>
                          <span className="text-indigo-600 font-extrabold">{filterValues.warmth > 0 ? `+${filterValues.warmth}` : filterValues.warmth}</span>
                        </div>
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          value={filterValues.warmth}
                          onChange={(e) => handleSliderChange('warmth', Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>

                      {/* 흐림/소프트 블러 */}
                      <div className="space-y-1 sm:col-span-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1"><Droplets size={13} className="text-sky-500" /> 부드러운 흐림 (블러)</span>
                          <span className="text-indigo-600 font-extrabold">{filterValues.blur}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="8"
                          step="0.5"
                          value={filterValues.blur}
                          onChange={(e) => handleSliderChange('blur', Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 누끼 탭 연동 팁 배너 */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-xl border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <Scissors size={16} className="text-purple-600 shrink-0" />
                      <span>그림자를 지우고 보정한 이 사진의 배경을 깔끔하게 지우시겠습니까?</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTransferToNukki}
                      disabled={isExporting}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black shadow-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <Scissors size={13} />
                      <span>누끼따기 작업실로 보내기 &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* 하단 액션 버튼 그룹 */}
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-center w-full">
                  <button 
                    onClick={handleCopyEnhancedClipboard}
                    disabled={isExporting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Copy size={16} />}
                    <span>클립보드 복사 (Ctrl+V)</span>
                  </button>

                  <button 
                    onClick={handleDownloadEnhanced}
                    disabled={isExporting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                    <span>고화질 이미지로 저장</span>
                  </button>

                  <button 
                    onClick={() => {
                      setEnhanceFile(null);
                      setEnhanceUrl(null);
                      if (enhanceFileInputRef.current) enhanceFileInputRef.current.value = '';
                    }}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-5 rounded-xl transition-colors text-sm"
                  >
                    다른 사진 고르기
                  </button>
                </div>
              </div>
            )}

            <input 
              type="file" 
              ref={enhanceFileInputRef} 
              onChange={handleEnhanceFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        )}

        {/* 하단 추천 상품 / 소품 배너 */}
        <div className="w-full max-w-4xl mx-auto mt-8">
          <CoupangSupportCard category="nukki" />
        </div>

        {/* Global Coupang Partners Banner */}
        {isLoaded && (settings.coupangBannerHtml || settings.coupangBannerHtmlMobile) && (
          <div className="max-w-4xl mx-auto px-4 mt-12 mb-8 w-full">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col justify-center items-center overflow-hidden">
              <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider self-start">AD</p>
              <div className="w-full max-w-[680px]">
                {settings.coupangBannerHtml && (
                  <div className="hidden md:block w-full">
                    <CoupangBanner htmlCode={settings.coupangBannerHtml} />
                  </div>
                )}
                {settings.coupangBannerHtmlMobile && (
                  <div className="md:hidden w-full">
                    <CoupangBanner htmlCode={settings.coupangBannerHtmlMobile} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <div className="mt-auto"></div>
    </div>
  );
}
