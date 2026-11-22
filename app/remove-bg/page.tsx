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
  Paintbrush,
  Pipette,
  SunMedium,
  Target,
  Utensils,
  Plane,
  Leaf,
  Camera,
  Sunset,
  Gem,
  ShoppingBag,
  Grid,
  Square,
  Smile,
  ShieldAlert,
  EyeOff,
  Type,
  LayoutTemplate,
  BookmarkCheck
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

// 사진 감성 톤 프리셋
type PresetCategory = 'all' | 'daily' | 'food' | 'beauty' | 'travel' | 'shop' | 'film';

interface FilterPreset {
  id: string;
  name: string;
  icon: any;
  desc: string;
  category: 'daily' | 'food' | 'beauty' | 'travel' | 'shop' | 'film';
  badge?: string;
  values: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    blur: number;
  };
}

// 모자이크 스티커용 이모지 프리셋
const MOSAIC_EMOJIS = ['😊', '😎', '🐱', '✨', '🙈', '😷', '❤️', '🔥', '🌸', '🐻', '👑', '⭐'];

const PRESET_CATEGORIES = [
  { id: 'all', label: '전체 (23)' },
  { id: 'daily', label: '카페·일상 ☕' },
  { id: 'food', label: '맛집·푸드 🍜' },
  { id: 'beauty', label: '인물·뷰티 🌸' },
  { id: 'travel', label: '여행·풍경 ✈️' },
  { id: 'shop', label: '제품·마켓 📦' },
  { id: 'film', label: '빈티지·필름 🎞️' },
] as const;

const PHOTO_PRESETS: FilterPreset[] = [
  // 1. 기본 & 스마트 보정
  {
    id: 'original',
    name: '원본',
    icon: RefreshCw,
    category: 'daily',
    desc: '필터 없는 기본 원본',
    values: { brightness: 100, contrast: 100, saturation: 100, warmth: 0, blur: 0 }
  },
  {
    id: 'auto',
    name: '자동 최적화 ✨',
    icon: Sparkles,
    category: 'daily',
    badge: '추천',
    desc: '밝기+대비 자동 톤업',
    values: { brightness: 108, contrast: 114, saturation: 110, warmth: 4, blur: 0 }
  },
  {
    id: 'hdr-pop',
    name: '선명 HDR 🌟',
    icon: Zap,
    category: 'daily',
    badge: '선명',
    desc: '역광 극복 & 깊은 입체감',
    values: { brightness: 112, contrast: 124, saturation: 118, warmth: 2, blur: 0 }
  },

  // 2. 카페 & 일상 감성 (daily)
  {
    id: 'warm',
    name: '감성 카페 ☕',
    icon: Coffee,
    category: 'daily',
    badge: '인기',
    desc: '따뜻하고 포근한 웜톤 분위기',
    values: { brightness: 106, contrast: 105, saturation: 96, warmth: 24, blur: 0 }
  },
  {
    id: 'sunshine',
    name: '골든 선샤인 ☀️',
    icon: SunMedium,
    category: 'daily',
    desc: '화사한 창가 오후 햇살',
    values: { brightness: 112, contrast: 108, saturation: 108, warmth: 28, blur: 0 }
  },
  {
    id: 'espresso',
    name: '딥 에스프레소 🟤',
    icon: Coffee,
    category: 'daily',
    desc: '원두 로스팅의 묵직한 무드',
    values: { brightness: 98, contrast: 118, saturation: 90, warmth: 30, blur: 0 }
  },
  {
    id: 'milktea',
    name: '코지 밀크티 🧋',
    icon: Heart,
    category: 'daily',
    desc: '차분하고 부드러운 베이지톤',
    values: { brightness: 108, contrast: 96, saturation: 88, warmth: 18, blur: 0 }
  },

  // 3. 맛집 & 푸드 (food)
  {
    id: 'vivid',
    name: '생생 리뷰 🍜',
    icon: Flame,
    category: 'food',
    badge: '추천',
    desc: '음식·요리 쨍하고 선명하게',
    values: { brightness: 106, contrast: 120, saturation: 132, warmth: 6, blur: 0 }
  },
  {
    id: 'foodie',
    name: '윤기 푸디 🍕',
    icon: Utensils,
    category: 'food',
    badge: '맛집',
    desc: '붉은기·노란기로 식욕 자극',
    values: { brightness: 110, contrast: 116, saturation: 128, warmth: 16, blur: 0 }
  },
  {
    id: 'fresh',
    name: '청량 프레시 🥗',
    icon: Leaf,
    category: 'food',
    desc: '신선한 채소 & 푸른 식재료 강조',
    values: { brightness: 108, contrast: 114, saturation: 122, warmth: -8, blur: 0 }
  },

  // 4. 인물 & 뷰티 (beauty)
  {
    id: 'soft',
    name: '뽀샤시 인물 🌸',
    icon: Heart,
    category: 'beauty',
    badge: '인기',
    desc: '화사하고 부드러운 피부결',
    values: { brightness: 114, contrast: 92, saturation: 104, warmth: 8, blur: 0 }
  },
  {
    id: 'peach',
    name: '러블리 피치 🍑',
    icon: Sparkles,
    category: 'beauty',
    desc: '복숭아빛 화사한 생기와 혈색',
    values: { brightness: 110, contrast: 102, saturation: 116, warmth: 16, blur: 0 }
  },
  {
    id: 'pure-cool',
    name: '퓨어 쿨톤 💎',
    icon: Gem,
    category: 'beauty',
    badge: '쿨톤',
    desc: '맑고 투명한 유리알 쿨톤 피부',
    values: { brightness: 112, contrast: 106, saturation: 102, warmth: -14, blur: 0 }
  },

  // 5. 여행 & 풍경 (travel)
  {
    id: 'blue-sky',
    name: '청명 스카이 ✈️',
    icon: Plane,
    category: 'travel',
    badge: '여행',
    desc: '푸른 하늘 & 청량 에메랄드 바다',
    values: { brightness: 108, contrast: 118, saturation: 128, warmth: -12, blur: 0 }
  },
  {
    id: 'sunset',
    name: '노을빛 선셋 🌇',
    icon: Sunset,
    category: 'travel',
    desc: '낭만적인 붉은 황혼의 오렌지빛',
    values: { brightness: 104, contrast: 116, saturation: 124, warmth: 36, blur: 0 }
  },
  {
    id: 'moody-nature',
    name: '딥 포레스트 🌲',
    icon: Leaf,
    category: 'travel',
    desc: '차분하고 짙은 녹음 & 감성 숲',
    values: { brightness: 96, contrast: 118, saturation: 105, warmth: -6, blur: 0 }
  },

  // 6. 제품 & 쇼핑몰 (shop)
  {
    id: 'clean',
    name: '화이트 스튜디오 📦',
    icon: Package,
    category: 'shop',
    badge: '스마트스토어',
    desc: '쇼핑몰·체험단 군더더기 없는 톤',
    values: { brightness: 116, contrast: 112, saturation: 102, warmth: -4, blur: 0 }
  },
  {
    id: 'minimal',
    name: '하이엔드 모던 🖤',
    icon: ShoppingBag,
    category: 'shop',
    desc: '시크하고 매트한 명품 감성',
    values: { brightness: 104, contrast: 126, saturation: 86, warmth: -6, blur: 0 }
  },
  {
    id: 'pop-candy',
    name: '팝 비비드 🍭',
    icon: Zap,
    category: 'shop',
    desc: '키치하고 톡톡 튀는 극채도',
    values: { brightness: 110, contrast: 122, saturation: 145, warmth: 4, blur: 0 }
  },

  // 7. 빈티지 & 필름 (film)
  {
    id: 'film',
    name: '클래식 필름 🎞️',
    icon: Film,
    category: 'film',
    badge: '레트로',
    desc: '감성적인 90년대 필름 톤',
    values: { brightness: 104, contrast: 122, saturation: 88, warmth: 18, blur: 0 }
  },
  {
    id: 'analog-fuji',
    name: '아날로그 카메라 📸',
    icon: Camera,
    category: 'film',
    desc: '빛바랜 빈티지 감성 필름',
    values: { brightness: 106, contrast: 108, saturation: 92, warmth: 12, blur: 0 }
  },
  {
    id: 'bw',
    name: '모노크롬 흑백 🌓',
    icon: Contrast,
    category: 'film',
    desc: '클래식하고 깊은 흑백 대비',
    values: { brightness: 106, contrast: 130, saturation: 0, warmth: 0, blur: 0 }
  },
  {
    id: 'noir',
    name: '시네마 누아르 🎬',
    icon: Film,
    category: 'film',
    desc: '어둡고 묵직한 영화의 한 장면',
    values: { brightness: 92, contrast: 142, saturation: 15, warmth: 8, blur: 0 }
  }
];

export default function ImageStudioPage() {
  const { settings, isLoaded } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 상단 메인 모드 탭: 'remove-bg' (AI 배경제거) vs 'enhance' (사진 보정 & 그림자 복원) vs 'design' (미리캔버스 썸네일 디자인)
  const [currentTab, setCurrentTab] = useState<'remove-bg' | 'enhance' | 'design'>('remove-bg');

  // ==========================================
  // [미리캔버스 모드: 썸네일 & 타이포 디자인 전용 상태]
  // ==========================================
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [isDesignDragging, setIsDesignDragging] = useState(false);
  const designCanvasRef = useRef<HTMLCanvasElement>(null);
  const designImageRef = useRef<HTMLImageElement | null>(null);
  const designFileInputRef = useRef<HTMLInputElement>(null);

  const [designRatio, setDesignRatio] = useState<'1:1' | '4:3' | '16:9' | 'orig'>('1:1');
  const [designDim, setDesignDim] = useState<number>(35); // 어두운 딤 오버레이 (0~75%)
  const [mainTitle, setMainTitle] = useState<string>('내돈내산 솔직 리뷰');
  const [subTitle, setSubTitle] = useState<string>('웨이팅 1시간 아깝지 않았던 인생 맛집!');
  const [designTemplate, setDesignTemplate] = useState<'food' | 'cafe' | 'info' | 'nandn' | 'clean'>('food');
  const [textPosition, setTextPosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [badgeType, setBadgeType] = useState<'none' | 'nandn' | 'honest' | 'best' | 'must'>('nandn');
  const [titleColor, setTitleColor] = useState<string>('#FFFFFF');
  const [hasOutline, setHasOutline] = useState<boolean>(true);
  const [isExportingDesign, setIsExportingDesign] = useState<boolean>(false);

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
  // [사진 보정 & 정밀 조명 복원 상태]
  // ==========================================
  const [enhanceFile, setEnhanceFile] = useState<File | null>(null);
  const [enhanceUrl, setEnhanceUrl] = useState<string | null>(null);
  const [isEnhanceDragging, setIsEnhanceDragging] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>('original');
  const [presetCategory, setPresetCategory] = useState<PresetCategory>('all');
  const [filterValues, setFilterValues] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    blur: 0
  });
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [isComparingOriginal, setIsComparingOriginal] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // ==========================================
  // [물리 조명 역보정 (Shadow Matte) 전용 상태]
  // ==========================================
  const [isShadowToolOpen, setIsShadowToolOpen] = useState<boolean>(false);
  const [isPipetteMode, setIsPipetteMode] = useState<boolean>(false);
  // 기준 정상 조명값 (기본값: 화사하고 깨끗한 조명 245)
  const [referenceLight, setReferenceLight] = useState<{ r: number; g: number; b: number; luma: number }>({
    r: 245,
    g: 245,
    b: 245,
    luma: 245
  });
  const [brushSize, setBrushSize] = useState<number>(50);
  const [shadowRestoreStrength, setShadowRestoreStrength] = useState<number>(100); // 초강력 100% 기본값!
  const [isDrawingBrush, setIsDrawingBrush] = useState<boolean>(false);
  const [historyStack, setHistoryStack] = useState<string[]>([]); // 실행 취소(Undo) 스택

  // ==========================================
  // [원클릭 자연스러운 그림자 제거 전용 상태]
  // ==========================================
  const [isAutoShadowProcessing, setIsAutoShadowProcessing] = useState<boolean>(false);
  const [shadowStrengthLevel, setShadowStrengthLevel] = useState<'soft' | 'natural' | 'strong'>('natural');
  const [hasAutoShadowApplied, setHasAutoShadowApplied] = useState<boolean>(false);
  const shadowBaseImgRef = useRef<HTMLImageElement | null>(null); // 원클릭 적용 직전의 베이스 이미지

  // ==========================================
  // [모자이크 / 블러 마스킹 전용 상태]
  // ==========================================
  const [isMosaicToolOpen, setIsMosaicToolOpen] = useState<boolean>(false);
  const [mosaicMode, setMosaicMode] = useState<'box' | 'brush'>('box'); // 'box'(영역 드래그) vs 'brush'(문지르기)
  const [mosaicStyle, setMosaicStyle] = useState<'pixel' | 'blur' | 'emoji'>('pixel'); // 'pixel' vs 'blur' vs 'emoji'
  const [mosaicPixelSize, setMosaicPixelSize] = useState<number>(14); // 픽셀 크기 (8~36)
  const [mosaicBlurRadius, setMosaicBlurRadius] = useState<number>(14); // 가우시안 블러 세기 (6~30)
  const [mosaicBrushSize, setMosaicBrushSize] = useState<number>(40); // 브러시 지름 (15~80)
  const [selectedEmoji, setSelectedEmoji] = useState<string>('😊');
  const [isMosaicInteracting, setIsMosaicInteracting] = useState<boolean>(false);
  const [mosaicDragStart, setMosaicDragStart] = useState<{ x: number; y: number } | null>(null);
  const [mosaicDragCurrent, setMosaicDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [mosaicBoxOffset, setMosaicBoxOffset] = useState<{ startX: number; startY: number; curX: number; curY: number } | null>(null);

  // 캔버스 참조
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const currentImageRef = useRef<HTMLImageElement | null>(null);

  // 토스트 피드백 메시지
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

  // 합성된 최종 누끼 Blob 생성 (네이버 블로그 20MB 이하 자동 최적화)
  const generateFinalBlob = async (forClipboard = false): Promise<{ blob: Blob | null; ext: string }> => {
    if (!resultUrl) return { blob: null, ext: 'png' };

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        // 가로/세로 최대 2560px로 안전 조절하여 20MB 초과 방지
        const maxDim = 2560;
        let targetW = origW;
        let targetH = origH;
        if (targetW > maxDim || targetH > maxDim) {
          if (targetW >= targetH) {
            targetH = Math.round((targetH * maxDim) / targetW);
            targetW = maxDim;
          } else {
            targetW = Math.round((targetW * maxDim) / targetH);
            targetH = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ blob: null, ext: 'png' });
          return;
        }

        const isTransparent = selectedBgId === 'transparent';

        // 1. 배경 채우기
        if (selectedBgId === 'custom') {
          ctx.fillStyle = customBgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (!isTransparent) {
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

        if (forClipboard || isTransparent) {
          canvas.toBlob((blob) => {
            resolve({ blob, ext: 'png' });
          }, 'image/png');
        } else {
          canvas.toBlob((blob) => {
            resolve({ blob, ext: 'jpg' });
          }, 'image/jpeg', 0.92);
        }
      };
      img.onerror = () => resolve({ blob: null, ext: 'png' });
      img.src = resultUrl;
    });
  };

  const handleDownload = async () => {
    const { blob, ext } = await generateFinalBlob(false);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gifty-studio-nukki-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = async () => {
    try {
      const { blob } = await generateFinalBlob(true);
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
      const { blob } = await generateFinalBlob(true);
      if (!blob) return;
      const file = new File([blob], `nukki-for-edit-${Date.now()}.png`, { type: 'image/png' });
      processEnhanceFile(file);
      setCurrentTab('enhance');
      setCopyFeedback('누끼 이미지를 보정실로 불러왔습니다! 톤 보정 및 그림자 복원을 사용해보세요.');
      setTimeout(() => setCopyFeedback(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 누끼 결과물을 썸네일 디자인 탭으로 즉시 전송
  const handleTransferToDesign = async () => {
    setIsProcessing(true);
    setProgressText('썸네일 디자인실로 이동 중...');
    try {
      const { blob } = await generateFinalBlob(true);
      if (!blob) return;
      const file = new File([blob], `nukki-for-design-${Date.now()}.png`, { type: 'image/png' });
      processDesignFile(file);
      setCurrentTab('design');
      setCopyFeedback('누끼 이미지를 썸네일 디자인실로 불러왔습니다! 제목과 템플릿을 선택해보세요.');
      setTimeout(() => setCopyFeedback(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // [사진 보정 & 물리 조명 그림자 복원 핸들러]
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
      blur: 0
    });
    setRotation(0);
    setFlipH(false);
    setIsShadowToolOpen(false);
    setIsPipetteMode(false);
    setHistoryStack([]);
    setHasAutoShadowApplied(false);
    setShadowStrengthLevel('natural');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      currentImageRef.current = img;
      shadowBaseImgRef.current = img;
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
      blur: 0
    });
    setRotation(0);
    setFlipH(false);
    setIsShadowToolOpen(false);
    setIsPipetteMode(false);
    setHistoryStack([]);
    setHasAutoShadowApplied(false);
    setShadowStrengthLevel('natural');
    if (enhanceUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        currentImageRef.current = img;
        shadowBaseImgRef.current = img;
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
      const origImg = shadowBaseImgRef.current || img;
      const oW = origImg.naturalWidth || origImg.width;
      const oH = origImg.naturalHeight || origImg.height;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);
      ctx.drawImage(origImg, -oW / 2, -oH / 2, oW, oH);
      ctx.restore();
      return;
    }

    // 1. CSS 필터 적용
    const filterStr = getEnhanceFilterString(filterValues);
    ctx.filter = filterStr !== 'none' ? filterStr : 'none';

    // 2. 변환 (회전 및 좌우 반전)
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);
    ctx.drawImage(img, -natW / 2, -natH / 2, natW, natH);
    ctx.restore();

    ctx.filter = 'none';
  }, [filterValues, rotation, flipH, isComparingOriginal]);

  useEffect(() => {
    if (enhanceUrl && currentTab === 'enhance') {
      renderPreviewCanvas();
    }
  }, [enhanceUrl, currentTab, renderPreviewCanvas]);

  // =========================================================
  // [원클릭 자연스러운 스마트 그림자 제거 (Adaptive Shadow Lifting)]
  // =========================================================
  const applyAutoShadowRemoval = (intensityLevel: 'soft' | 'natural' | 'strong' = 'natural') => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !currentImageRef.current) return;

    setIsAutoShadowProcessing(true);

    // 0. 베이스 원본 이미지가 없으면 현재 이미지를 베이스로 저장
    if (!shadowBaseImgRef.current) {
      shadowBaseImgRef.current = currentImageRef.current;
    }
    const baseImg = shadowBaseImgRef.current;

    // 되돌리기(Undo) 스택에 현재 캔버스 상태 저장
    try {
      const currentSnapshot = canvas.toDataURL('image/png');
      setHistoryStack(prev => [...prev.slice(-4), currentSnapshot]);
    } catch (e) {
      console.warn('History save failed:', e);
    }

    setTimeout(() => {
      try {
        const natW = baseImg.naturalWidth || baseImg.width;
        const natH = baseImg.naturalHeight || baseImg.height;

        // 원본 해상도 작업용 오프스크린 캔버스
        const offCanvas = document.createElement('canvas');
        offCanvas.width = natW;
        offCanvas.height = natH;
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) {
          setIsAutoShadowProcessing(false);
          return;
        }

        offCtx.drawImage(baseImg, 0, 0, natW, natH);
        const imgData = offCtx.getImageData(0, 0, natW, natH);
        const data = imgData.data;

        // 1. 초고속 조명 맵(Illumination Map) 추정:
        // 저주파 배경 조명을 구하기 위해 가로/세로 약 160px 수준으로 다운스케일
        const maxSmallDim = 160;
        const sScale = Math.min(1, maxSmallDim / Math.max(natW, natH));
        const sw = Math.max(20, Math.floor(natW * sScale));
        const sh = Math.max(20, Math.floor(natH * sScale));

        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = sw;
        smallCanvas.height = sh;
        const sctx = smallCanvas.getContext('2d');
        if (!sctx) {
          setIsAutoShadowProcessing(false);
          return;
        }

        sctx.drawImage(baseImg, 0, 0, sw, sh);
        const sImgData = sctx.getImageData(0, 0, sw, sh);
        const sData = sImgData.data;

        // 스몰 맵의 Luma 배열 계산
        const sLuma = new Float32Array(sw * sh);
        for (let i = 0; i < sw * sh; i++) {
          const r = sData[i * 4];
          const g = sData[i * 4 + 1];
          const b = sData[i * 4 + 2];
          sLuma[i] = 0.299 * r + 0.587 * g + 0.114 * b;
        }

        // 상위 8% 밝기를 기준 정상 조명(refLuma)으로 추정
        const sortedLuma = Array.from(sLuma).sort((a, b) => b - a);
        const refIndex = Math.floor(sortedLuma.length * 0.08);
        const refLuma = Math.min(240, Math.max(185, sortedLuma[refIndex]));

        // 조명 스무딩 (Illumination Smoothing): 박스 블러 2회 2-Pass 실행
        const blurredLuma = new Float32Array(sw * sh);
        const blurRadius = Math.max(3, Math.floor(sw * 0.09));

        for (let pass = 0; pass < 2; pass++) {
          // Horizontal pass
          for (let y = 0; y < sh; y++) {
            const yOffset = y * sw;
            for (let x = 0; x < sw; x++) {
              let sum = 0;
              let count = 0;
              for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                const nx = x + dx;
                if (nx >= 0 && nx < sw) {
                  sum += sLuma[yOffset + nx];
                  count++;
                }
              }
              blurredLuma[yOffset + x] = sum / count;
            }
          }
          // Vertical pass
          for (let x = 0; x < sw; x++) {
            for (let y = 0; y < sh; y++) {
              let sum = 0;
              let count = 0;
              for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                const ny = y + dy;
                if (ny >= 0 && ny < sh) {
                  sum += blurredLuma[ny * sw + x];
                  count++;
                }
              }
              sLuma[y * sw + x] = sum / count;
            }
          }
        }

        // 강도 레벨별 계수
        const factorMap = {
          soft: 0.60,
          natural: 0.85,
          strong: 1.08
        };
        const factor = factorMap[intensityLevel] || 0.85;

        // 2. 픽셀별 적응형 그림자 조명 보정 (Bilinear 보간)
        for (let y = 0; y < natH; y++) {
          const sy = Math.min(sh - 1, Math.max(0, (y / natH) * sh));
          const sy0 = Math.floor(sy);
          const sy1 = Math.min(sh - 1, sy0 + 1);
          const ty = sy - sy0;

          const rowOffset = y * natW * 4;

          for (let x = 0; x < natW; x++) {
            const sx = Math.min(sw - 1, Math.max(0, (x / natW) * sw));
            const sx0 = Math.floor(sx);
            const sx1 = Math.min(sw - 1, sx0 + 1);
            const tx = sx - sx0;

            // 4-point bilinear interpolation
            const l00 = sLuma[sy0 * sw + sx0];
            const l10 = sLuma[sy0 * sw + sx1];
            const l01 = sLuma[sy1 * sw + sx0];
            const l11 = sLuma[sy1 * sw + sx1];
            const localIllum = (1 - ty) * ((1 - tx) * l00 + tx * l10) + ty * ((1 - tx) * l01 + tx * l11);

            const pIdx = rowOffset + x * 4;
            const r = data[pIdx];
            const g = data[pIdx + 1];
            const b = data[pIdx + 2];
            const pLuma = 0.299 * r + 0.587 * g + 0.114 * b;

            // 그림자 영역 판단: 주변 조명이 기준치보다 낮거나 픽셀 밝기가 어두운 부분
            const illumDeficit = Math.max(0, refLuma - localIllum);
            if (illumDeficit > 5 && pLuma < refLuma) {
              // 부드러운 섀도우 마스크 가중치 (어두울수록 높고, 하이라이트(>225)는 0으로 수렴)
              const shadowWeight = Math.min(1, Math.max(0, (refLuma - pLuma) / (refLuma - 40)));

              // 조명 역보정 배율 (Shadow Gain)
              const rawRatio = refLuma / (localIllum + 14);
              const clampedRatio = Math.min(2.85, Math.max(1.0, rawRatio));

              // 최종 블렌딩 게인
              const gain = 1 + (clampedRatio - 1) * factor * shadowWeight;

              if (gain > 1.01) {
                // 그림자 영역 색온도 & 채도 밸런스:
                // 그림자 속 푸르스름하고 칙칙한 느낌을 자연스러운 온기(약간의 웜톤)로 보정
                let nr = r * gain * 1.025;
                let ng = g * gain * 1.005;
                let nb = b * gain * 0.975;

                // 약간의 채도 증폭 (그림자가 걷힌 영역이 바래지 않도록 보존)
                const newLuma = 0.299 * nr + 0.587 * ng + 0.114 * nb;
                const satBoost = 1.06;
                nr = newLuma + (nr - newLuma) * satBoost;
                ng = newLuma + (ng - newLuma) * satBoost;
                nb = newLuma + (nb - newLuma) * satBoost;

                data[pIdx] = Math.min(255, Math.max(0, Math.round(nr)));
                data[pIdx + 1] = Math.min(255, Math.max(0, Math.round(ng)));
                data[pIdx + 2] = Math.min(255, Math.max(0, Math.round(nb)));
              }
            }
          }
        }

        offCtx.putImageData(imgData, 0, 0);

        // 보정된 새 이미지를 생성하여 currentImageRef에 설정
        const resultDataUrl = offCanvas.toDataURL('image/png');
        const newImg = new Image();
        newImg.crossOrigin = 'anonymous';
        newImg.onload = () => {
          currentImageRef.current = newImg;
          setHasAutoShadowApplied(true);
          setShadowStrengthLevel(intensityLevel);
          setIsAutoShadowProcessing(false);
          renderPreviewCanvas();
          setCopyFeedback(
            intensityLevel === 'soft'
              ? '은은하게 그림자가 제거되었습니다 ✨'
              : intensityLevel === 'strong'
              ? '강력하게 그림자가 제거되었습니다 🔥'
              : '자연스러운 원클릭 그림자 제거가 완료되었습니다 ✨'
          );
          setTimeout(() => setCopyFeedback(''), 3000);
        };
        newImg.src = resultDataUrl;
      } catch (err) {
        console.error('Auto shadow removal failed:', err);
        setIsAutoShadowProcessing(false);
      }
    }, 50);
  };

  // 그림자 제거 취소 및 원래 이미지로 복귀
  const handleResetAutoShadow = () => {
    if (!shadowBaseImgRef.current) return;
    const canvas = previewCanvasRef.current;
    if (canvas) {
      try {
        setHistoryStack(prev => [...prev.slice(-4), canvas.toDataURL('image/png')]);
      } catch (e) {}
    }
    currentImageRef.current = shadowBaseImgRef.current;
    setHasAutoShadowApplied(false);
    renderPreviewCanvas();
    setCopyFeedback('그림자 제거 효과가 취소되었습니다.');
    setTimeout(() => setCopyFeedback(''), 2500);
  };

  // =========================================================
  // [물리 조명 역보정 (Shadow Matte Illumination Recovery)]
  // =========================================================
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
      y: (clientY - rect.top) * scaleY
    };
  };

  // 1. 빛 기준점 스포이드 샘플링
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPipetteMode) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    if (!coords) return;

    // 주변 5x5 영역의 평균 조명 추출 (노이즈 방지)
    const px = Math.floor(coords.x);
    const py = Math.floor(coords.y);
    const sampleSize = 5;
    const half = Math.floor(sampleSize / 2);
    const imgData = ctx.getImageData(Math.max(0, px - half), Math.max(0, py - half), sampleSize, sampleSize);
    const data = imgData.data;

    let sumR = 0, sumG = 0, sumB = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      sumR += data[i];
      sumG += data[i + 1];
      sumB += data[i + 2];
      count++;
    }

    const r = Math.round(sumR / count);
    const g = Math.round(sumG / count);
    const b = Math.round(sumB / count);
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    setReferenceLight({ r, g, b, luma: Math.max(120, luma) });
    setIsPipetteMode(false);
    setCopyFeedback(`빛 기준점 설정 완료! (밝기: ${luma}) 이제 그림자 부분을 문질러보세요.`);
    setTimeout(() => setCopyFeedback(''), 3500);
  };

  // 2. 물리 조명 역보정 브러시 드래그 처리
  const handleBrushStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isShadowToolOpen || isPipetteMode) return;
    setIsDrawingBrush(true);

    const canvas = previewCanvasRef.current;
    if (canvas) {
      setHistoryStack(prev => [...prev.slice(-5), canvas.toDataURL()]);
    }

    applyShadowMatteAt(e);
  };

  const handleBrushMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingBrush || !isShadowToolOpen || isPipetteMode) return;
    applyShadowMatteAt(e);
  };

  const handleBrushEnd = () => {
    if (!isDrawingBrush) return;
    setIsDrawingBrush(false);

    // 복원된 캔버스를 현재 베이스 이미지로 영구 반영
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

  // 핵심 물리 공식: 다이렉트 조명 일치(Direct Light Match)로 질감을 100% 살리며 그림자만 시원하게 100% 제거
  const applyShadowMatteAt = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    if (!coords) return;

    const { x, y } = coords;
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

      // 기준 조명값 (기본 235: 깨끗하고 화사한 정상 배경 밝기)
      const targetLuma = referenceLight.luma || 235;
      const refR = referenceLight.r || 235;
      const refG = referenceLight.g || 235;
      const refB = referenceLight.b || 235;
      const strength = (shadowRestoreStrength / 100);

      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = (py * width + px) * 4;
          const curX = startX + px;
          const curY = startY + py;

          const dist = Math.sqrt(Math.pow(curX - x, 2) + Math.pow(curY - y, 2));
          if (dist <= radius) {
            // 부드러운 원형 브러시 감쇠 (중심부는 100% 제거)
            const brushWeight = Math.pow(1 - dist / radius, 0.9);

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const curLuma = 0.299 * r + 0.587 * g + 0.114 * b;

            // 그림자 영역: 기준 밝기보다 어두우면 다이렉트로 부족한 조명을 100% 채워줌!
            if (curLuma < targetLuma) {
              const deficit = targetLuma - curLuma; // 부족한 빛의 양
              const effectiveBoost = deficit * brushWeight * strength;

              // 본래 픽셀의 색상 비율(Chromaticity)을 완벽 보존하며 빛만 주입
              const normRatio = curLuma > 10 ? (curLuma + effectiveBoost) / curLuma : 1.5;
              
              const newR = Math.min(255, Math.round(r * normRatio + (refR - targetLuma) * (effectiveBoost / 255)));
              const newG = Math.min(255, Math.round(g * normRatio + (refG - targetLuma) * (effectiveBoost / 255)));
              const newB = Math.min(255, Math.round(b * normRatio + (refB - targetLuma) * (effectiveBoost / 255)));

              data[idx] = newR;
              data[idx + 1] = newG;
              data[idx + 2] = newB;
            }
          }
        }
      }

      ctx.putImageData(imgData, startX, startY);
    } catch (err) {
      console.warn('Shadow matte calculation error:', err);
    }
  };

  // 캔버스 변경 내용을 현재 베이스 이미지로 동기화
  const syncCanvasToCurrentImage = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const updatedUrl = canvas.toDataURL('image/png');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      currentImageRef.current = img;
      // 베이스에 모자이크가 반영되었으므로 필터 중복 누적 방지
      setFilterValues({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        warmth: 0,
        blur: 0
      });
      setActivePresetId('original');
    };
    img.src = updatedUrl;
  };

  // =========================================================
  // [모자이크 / 가우시안 블러 / 스티커 마스킹 엔진]
  // =========================================================
  const getClientOffsetCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const applyPixelateArea = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    pixelSize: number
  ) => {
    if (w <= 0 || h <= 0) return;
    const offCanvas = document.createElement('canvas');
    const smallW = Math.max(1, Math.floor(w / pixelSize));
    const smallH = Math.max(1, Math.floor(h / pixelSize));
    offCanvas.width = smallW;
    offCanvas.height = smallH;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    offCtx.drawImage(ctx.canvas, x, y, w, h, 0, 0, smallW, smallH);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0, smallW, smallH, x, y, w, h);
    ctx.restore();
  };

  const applyBlurArea = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    blurRadius: number
  ) => {
    if (w <= 0 || h <= 0) return;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = ctx.canvas.width;
    offCanvas.height = ctx.canvas.height;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    offCtx.drawImage(ctx.canvas, 0, 0);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.filter = `blur(${blurRadius}px)`;
    ctx.drawImage(offCanvas, 0, 0);
    ctx.restore();
    ctx.filter = 'none';
  };

  const applyEmojiArea = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    emoji: string
  ) => {
    if (w <= 0 || h <= 0) return;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const size = Math.min(w, h) * 0.88;
    if (size < 8) return;

    ctx.save();
    ctx.font = `${Math.floor(size)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, cx, cy);
    ctx.restore();
  };

  const applyBoxMosaic = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = Math.max(0, Math.min(start.x, end.x));
    const y = Math.max(0, Math.min(start.y, end.y));
    const w = Math.min(canvas.width - x, Math.abs(end.x - start.x));
    const h = Math.min(canvas.height - y, Math.abs(end.y - start.y));

    if (w < 4 || h < 4) return;

    if (mosaicStyle === 'pixel') {
      applyPixelateArea(ctx, x, y, w, h, mosaicPixelSize);
    } else if (mosaicStyle === 'blur') {
      applyBlurArea(ctx, x, y, w, h, mosaicBlurRadius);
    } else if (mosaicStyle === 'emoji') {
      applyEmojiArea(ctx, x, y, w, h, selectedEmoji);
    }

    syncCanvasToCurrentImage();
    setCopyFeedback('모자이크가 적용되었습니다.');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const applyBrushMosaicAt = (coords: { x: number; y: number }) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleFactor = canvas.width / rect.width;
    const radius = (mosaicBrushSize / 2) * scaleFactor;
    const startX = Math.max(0, Math.floor(coords.x - radius));
    const startY = Math.max(0, Math.floor(coords.y - radius));
    const w = Math.min(canvas.width - startX, Math.ceil(radius * 2));
    const h = Math.min(canvas.height - startY, Math.ceil(radius * 2));

    if (w <= 0 || h <= 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, radius, 0, Math.PI * 2);
    ctx.clip();

    if (mosaicStyle === 'pixel') {
      applyPixelateArea(ctx, startX, startY, w, h, mosaicPixelSize);
    } else if (mosaicStyle === 'blur') {
      applyBlurArea(ctx, startX, startY, w, h, mosaicBlurRadius);
    } else if (mosaicStyle === 'emoji') {
      ctx.restore();
      applyEmojiArea(ctx, startX, startY, w, h, selectedEmoji);
      return;
    }
    ctx.restore();
  };

  // 포인터 통합 이벤트 핸들러
  const handleCanvasPointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isPipetteMode) {
      if ('clientX' in e) handleCanvasClick(e as React.MouseEvent<HTMLCanvasElement>);
      return;
    }

    if (isMosaicToolOpen) {
      const coords = getCanvasCoords(e);
      const clientOffset = getClientOffsetCoords(e);
      if (!coords) return;

      const canvas = previewCanvasRef.current;
      if (canvas) {
        setHistoryStack(prev => [...prev.slice(-6), canvas.toDataURL('image/png')]);
      }

      setIsMosaicInteracting(true);
      if (mosaicMode === 'box') {
        setMosaicDragStart(coords);
        setMosaicDragCurrent(coords);
        if (clientOffset) {
          setMosaicBoxOffset({
            startX: clientOffset.x,
            startY: clientOffset.y,
            curX: clientOffset.x,
            curY: clientOffset.y
          });
        }
      } else {
        applyBrushMosaicAt(coords);
      }
      return;
    }

    if (isShadowToolOpen) {
      handleBrushStart(e);
    }
  };

  const handleCanvasPointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isMosaicToolOpen && isMosaicInteracting) {
      const coords = getCanvasCoords(e);
      const clientOffset = getClientOffsetCoords(e);
      if (!coords) return;

      if (mosaicMode === 'box') {
        setMosaicDragCurrent(coords);
        if (clientOffset) {
          setMosaicBoxOffset(prev => prev ? { ...prev, curX: clientOffset.x, curY: clientOffset.y } : null);
        }
      } else {
        applyBrushMosaicAt(coords);
      }
      return;
    }

    if (isShadowToolOpen) {
      handleBrushMove(e);
    }
  };

  const handleCanvasPointerUp = () => {
    if (isMosaicToolOpen && isMosaicInteracting) {
      setIsMosaicInteracting(false);
      if (mosaicMode === 'box' && mosaicDragStart && mosaicDragCurrent) {
        applyBoxMosaic(mosaicDragStart, mosaicDragCurrent);
      } else if (mosaicMode === 'brush') {
        syncCanvasToCurrentImage();
      }
      setMosaicDragStart(null);
      setMosaicDragCurrent(null);
      setMosaicBoxOffset(null);
      return;
    }

    if (isShadowToolOpen) {
      handleBrushEnd();
    }
  };

  // 실행 취소 (Undo)
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const prevUrl = historyStack[historyStack.length - 1];
    setHistoryStack(prev => prev.slice(0, -1));

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      currentImageRef.current = img;
      renderPreviewCanvas();
    };
    img.src = prevUrl;
  };

  // 보정된 최종 이미지 Canvas Blob 생성 (네이버 블로그 20MB 이하 자동 최적화)
  const generateEnhancedBlob = async (forClipboard = false): Promise<{ blob: Blob | null; ext: string }> => {
    const srcCanvas = previewCanvasRef.current;
    if (!srcCanvas) return { blob: null, ext: 'jpg' };

    // 가로/세로 최대 2560px로 안전 조절하여 용량 폭증 방지 (블로그 최적)
    const maxDim = 2560;
    let targetW = srcCanvas.width;
    let targetH = srcCanvas.height;

    if (targetW > maxDim || targetH > maxDim) {
      if (targetW >= targetH) {
        targetH = Math.round((targetH * maxDim) / targetW);
        targetW = maxDim;
      } else {
        targetW = Math.round((targetW * maxDim) / targetH);
        targetH = maxDim;
      }
    }

    const outCanvas = document.createElement('canvas');
    outCanvas.width = targetW;
    outCanvas.height = targetH;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return { blob: null, ext: 'jpg' };

    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = 'high';
    outCtx.drawImage(srcCanvas, 0, 0, targetW, targetH);

    if (forClipboard) {
      // 클립보드는 브라우저 표준상 image/png 필수
      const blob = await new Promise<Blob | null>((resolve) => {
        outCanvas.toBlob((b) => resolve(b), 'image/png');
      });
      return { blob, ext: 'png' };
    }

    // 파일 다운로드는 고품질 JPG(92%)로 저장하여 20MB 제한 완벽 통과 (보통 2~3MB)
    const blob = await new Promise<Blob | null>((resolve) => {
      outCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
    });
    return { blob, ext: 'jpg' };
  };

  const handleDownloadEnhanced = async () => {
    setIsExporting(true);
    try {
      const { blob, ext } = await generateEnhancedBlob(false);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gifty-studio-enhanced-${Date.now()}.${ext}`;
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
      const { blob } = await generateEnhancedBlob(true);
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
      const { blob } = await generateEnhancedBlob(true);
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

  // 보정된 사진을 썸네일 디자인 탭으로 전송
  const handleTransferEnhancedToDesign = async () => {
    setIsExporting(true);
    try {
      const { blob } = await generateEnhancedBlob(false);
      if (!blob) return;
      const file = new File([blob], `enhanced-for-design-${Date.now()}.jpg`, { type: 'image/jpeg' });
      processDesignFile(file);
      setCurrentTab('design');
      setCopyFeedback('보정된 사진을 썸네일 디자인실로 불러왔습니다! 멋진 블로그 썸네일을 완성해보세요.');
      setTimeout(() => setCopyFeedback(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // ==========================================
  // [미리캔버스 썸네일 디자인 핸들러]
  // ==========================================
  const processDesignFile = (file: File) => {
    setDesignFile(file);
    const url = URL.createObjectURL(file);
    setDesignUrl(url);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      designImageRef.current = img;
      renderDesignCanvas();
    };
    img.src = url;
  };

  const handleDesignFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processDesignFile(file);
  };

  const handleDesignDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDesignDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processDesignFile(file);
  };

  const renderDesignCanvas = useCallback(() => {
    const canvas = designCanvasRef.current;
    const img = designImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nw = img.naturalWidth || img.width;
    const nh = img.naturalHeight || img.height;

    let cw = 1080;
    let ch = 1080;

    if (designRatio === '1:1') {
      cw = 1080;
      ch = 1080;
    } else if (designRatio === '4:3') {
      cw = 1080;
      ch = 810;
    } else if (designRatio === '16:9') {
      cw = 1280;
      ch = 720;
    } else {
      if (nw >= nh) {
        cw = Math.min(1280, nw);
        ch = Math.round((nh * cw) / nw);
      } else {
        ch = Math.min(1280, nh);
        cw = Math.round((nw * ch) / nh);
      }
    }

    canvas.width = cw;
    canvas.height = ch;

    // 1. 이미지 cover 렌더링
    const imgRatio = nw / nh;
    const canvasRatio = cw / ch;
    let sx = 0, sy = 0, sWidth = nw, sHeight = nh;

    if (imgRatio > canvasRatio) {
      sWidth = nh * canvasRatio;
      sx = (nw - sWidth) / 2;
    } else {
      sHeight = nw / canvasRatio;
      sy = (nh - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, cw, ch);

    // 2. 어두운 딤(Dim) 오버레이
    if (designDim > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${designDim / 100})`;
      ctx.fillRect(0, 0, cw, ch);
    }

    // 3. 미니멀 템플릿 테두리
    if (designTemplate === 'clean') {
      const pad = Math.round(cw * 0.035);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = Math.max(3, Math.round(cw * 0.005));
      ctx.strokeRect(pad, pad, cw - pad * 2, ch - pad * 2);
    }

    // 4. 블로그 뱃지(도장) 렌더링
    if (badgeType !== 'none') {
      let badgeText = '';
      let badgeBg = '#4f46e5';

      if (badgeType === 'nandn') {
        badgeText = '💰 100% 내돈내산';
        badgeBg = '#059669';
      } else if (badgeType === 'honest') {
        badgeText = '✨ 솔직 방문 후기';
        badgeBg = '#7c3aed';
      } else if (badgeType === 'best') {
        badgeText = '🔥 인생 BEST 추천';
        badgeBg = '#ea580c';
      } else if (badgeType === 'must') {
        badgeText = '📌 저장 & 필독 가이드';
        badgeBg = '#e11d48';
      }

      const bFontSize = Math.round(cw * 0.032);
      ctx.font = `bold ${bFontSize}px -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif`;
      const bMetrics = ctx.measureText(badgeText);
      const bPadX = Math.round(cw * 0.032);
      const bPadY = Math.round(ch * 0.016);
      const bWidth = bMetrics.width + bPadX * 2;
      const bHeight = bFontSize + bPadY * 2;

      const bx = Math.round(cw * 0.06);
      const by = Math.round(ch * 0.06);

      ctx.save();
      ctx.fillStyle = badgeBg;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx, by, bWidth, bHeight, Math.round(bHeight / 2));
      } else {
        ctx.rect(bx, by, bWidth, bHeight);
      }
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, bx + bWidth / 2, by + bHeight / 2 + 1);
    }

    // 5. 텍스트 위치 계산
    let centerY = ch / 2;
    if (textPosition === 'top') {
      centerY = ch * 0.28;
    } else if (textPosition === 'bottom') {
      centerY = ch * 0.74;
    }

    // 6. 정보성(info) 반투명 다크 바
    if (designTemplate === 'info') {
      const boxPadX = Math.round(cw * 0.06);
      const boxW = cw - boxPadX * 2;
      const boxH = Math.round(ch * 0.3);
      const boxY = centerY - boxH / 2;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(boxPadX, boxY, boxW, boxH, 20);
      } else {
        ctx.rect(boxPadX, boxY, boxW, boxH);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 7. 메인 타이틀 & 서브 타이틀 렌더링
    ctx.save();
    ctx.textAlign = 'center';

    const mainFontSize = Math.round(cw * 0.068);
    const subFontSize = Math.round(cw * 0.036);

    if (designTemplate === 'cafe') {
      ctx.font = `600 ${mainFontSize}px "Noto Serif KR", "Batang", -apple-system, serif`;
    } else {
      ctx.font = `900 ${mainFontSize}px -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif`;
    }

    const titleY = subTitle ? centerY - mainFontSize * 0.35 : centerY;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;

    if (hasOutline || designTemplate === 'food') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(4, Math.round(mainFontSize * 0.16));
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(mainTitle, cw / 2, titleY);
    }

    let mColor = titleColor;
    if (designTemplate === 'food' && titleColor === '#FFFFFF') {
      mColor = '#FDE047'; // 맛집 강조 옐로우
    }
    ctx.fillStyle = mColor;
    ctx.fillText(mainTitle, cw / 2, titleY);

    if (designTemplate === 'cafe') {
      const tMetrics = ctx.measureText(mainTitle);
      const lineW = tMetrics.width * 0.8;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cw / 2 - lineW / 2, titleY + mainFontSize * 0.45);
      ctx.lineTo(cw / 2 + lineW / 2, titleY + mainFontSize * 0.45);
      ctx.stroke();
    }

    if (subTitle) {
      const subY = titleY + mainFontSize * 0.98;
      ctx.font = `600 ${subFontSize}px -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif`;

      if (hasOutline || designTemplate === 'food') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(3, Math.round(subFontSize * 0.14));
        ctx.lineJoin = 'round';
        ctx.strokeText(subTitle, cw / 2, subY);
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(subTitle, cw / 2, subY);
    }

    ctx.restore();
  }, [designRatio, designDim, mainTitle, subTitle, designTemplate, textPosition, badgeType, titleColor, hasOutline]);

  useEffect(() => {
    if (designUrl && currentTab === 'design') {
      renderDesignCanvas();
    }
  }, [designUrl, currentTab, renderDesignCanvas]);

  const handleDownloadDesign = async () => {
    const canvas = designCanvasRef.current;
    if (!canvas) return;
    setIsExportingDesign(true);
    try {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gifty-studio-thumbnail-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.92);
    } finally {
      setIsExportingDesign(false);
    }
  };

  const handleCopyDesignClipboard = async () => {
    const canvas = designCanvasRef.current;
    if (!canvas) return;
    setIsExportingDesign(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopyFeedback('썸네일이 클립보드에 복사되었습니다! 블로그 에디터에 바로 붙여넣으세요.');
        setTimeout(() => setCopyFeedback(''), 3500);
      }, 'image/png');
    } catch (e) {
      console.error(e);
      alert('클립보드 복사에 실패했습니다. [이미지로 저장] 버튼을 이용해주세요.');
    } finally {
      setIsExportingDesign(false);
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
              : currentTab === 'enhance'
              ? '물리 조명 역보정으로 질감을 살리며 그림자를 싹 지우고, 화사하게 톤보정하세요.'
              : '사진 위에 감성 타이틀과 블로그 뱃지를 얹어 네이버 1등 대표 썸네일을 1초 만에 완성하세요.'}
          </p>
        </div>

        {/* 상단 탭 전환 스위처 */}
        <div className="w-full max-w-xl bg-slate-200/80 p-1.5 rounded-2xl flex items-center mb-7 shadow-inner">
          <button
            type="button"
            onClick={() => setCurrentTab('remove-bg')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
              currentTab === 'remove-bg'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scissors size={16} />
            <span>AI 누끼</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('enhance')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
              currentTab === 'enhance'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders size={16} />
            <span>사진 보정</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('design')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
              currentTab === 'design'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette size={16} />
            <span>썸네일 디자인 (미리캔버스) 🎨</span>
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
                        <span>누끼 딴 피사체로 보정 또는 썸네일을 만드시겠어요?</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTransferToEnhance}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black shadow-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95"
                        >
                          <Sliders size={13} />
                          <span>사진 보정실 &rarr;</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleTransferToDesign}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black shadow-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95"
                        >
                          <Palette size={13} />
                          <span>썸네일 만들기 &rarr;</span>
                        </button>
                      </div>
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
                        <span>{selectedBgId === 'transparent' ? '투명 PNG로 저장 (20MB 이하)' : '블로그 최적화 저장 (JPG)'}</span>
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
        {/* 탭 2: 사진 보정 & 물리 조명 그림자 복원 스튜디오 */}
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
                  <SunMedium className="text-indigo-600" size={36} />
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-700">
                  {isEnhanceDragging ? '파일을 여기에 놓아주세요' : '클릭하거나 보정 & 그림자 복원할 사진을 끌어다 놓으세요'}
                </p>
                <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                  <span>💡 캡처 후</span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs text-indigo-600 font-extrabold">Ctrl + V</kbd>
                  <span>로 바로 붙여넣기도 가능해요!</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">질감 뭉개짐 없이 조명만 역계산하여 그림자를 완벽 복원합니다.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* 메인 미리보기 및 조작 툴바 */}
                <div className="w-full mb-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">스튜디오 미리보기</span>
                      {activePresetId !== 'original' && (
                        <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          {PHOTO_PRESETS.find(p => p.id === activePresetId)?.name || '사용자 톤'}
                        </span>
                      )}
                      {isShadowToolOpen && (
                        <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                          ☀️ 조명 역보정 모드
                        </span>
                      )}
                      {isMosaicToolOpen && (
                        <span className="text-[11px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-300">
                          🔲 모자이크·블러 모드
                        </span>
                      )}
                    </div>
                    {/* 상단 보조 도구 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* 원클릭 그림자 지우기 버튼 */}
                      <button
                        type="button"
                        onClick={() => applyAutoShadowRemoval('natural')}
                        disabled={isAutoShadowProcessing}
                        className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                        title="클릭 한 번으로 전체 사진의 그림자를 자연스럽게 걷어냅니다"
                      >
                        <Sparkles size={13} />
                        <span>원클릭 그림자 지우기</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsShadowToolOpen(!isShadowToolOpen);
                          setIsPipetteMode(false);
                          if (!isShadowToolOpen) setIsMosaicToolOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                          isShadowToolOpen
                            ? 'bg-amber-500 text-white shadow-amber-200 ring-2 ring-amber-400/40'
                            : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300/80 font-bold'
                        }`}
                        title="물리 조명 역보정 브러시로 특정 구역을 직접 문질러 복원"
                      >
                        <SunMedium size={14} className={isShadowToolOpen ? 'animate-spin' : ''} />
                        <span>{isShadowToolOpen ? '브러시 닫기' : '🖌️ 수동 브러시'}</span>
                      </button>

                      {/* 모자이크 & 블러 마스킹 도구 버튼 */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsMosaicToolOpen(!isMosaicToolOpen);
                          if (!isMosaicToolOpen) {
                            setIsShadowToolOpen(false);
                            setIsPipetteMode(false);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                          isMosaicToolOpen
                            ? 'bg-purple-600 text-white shadow-purple-200 ring-2 ring-purple-400/40'
                            : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-300/80 font-bold'
                        }`}
                        title="초상권 및 개인정보 가리기 (픽셀 모자이크 / 가우시안 블러 / 스티커)"
                      >
                        <Grid size={14} className={isMosaicToolOpen ? 'animate-pulse' : ''} />
                        <span>{isMosaicToolOpen ? '모자이크 닫기' : '🔲 모자이크·블러'}</span>
                      </button>

                      {historyStack.length > 0 && (
                        <button
                          type="button"
                          onClick={handleUndo}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                          title="이전 단계로 되돌리기"
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

                  {/* ========================================== */}
                  {/* [원클릭 스마트 그림자 지우기 전용 배너 & 컨트롤] */}
                  {/* ========================================== */}
                  <div className="w-full bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 mb-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20 shrink-0">
                        <Sun size={22} className={isAutoShadowProcessing ? 'animate-spin' : ''} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black text-amber-950">
                            원클릭 자연스러운 그림자 지우기
                          </span>
                          <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                            ONE-CLICK
                          </span>
                          {hasAutoShadowApplied && (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={11} /> 적용됨
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-amber-800/80 mt-0.5">
                          주변의 밝은 곳은 그대로 보존하고, 어두운 그림자 영역만 <b>클릭 한 번</b>으로 감쪽같이 밝혀줍니다.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                      {/* 강도 선택 칩 */}
                      <div className="flex items-center bg-white/90 border border-amber-200 rounded-xl p-1 gap-1 shadow-2xs">
                        {(['soft', 'natural', 'strong'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => applyAutoShadowRemoval(lvl)}
                            disabled={isAutoShadowProcessing}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              shadowStrengthLevel === lvl && hasAutoShadowApplied
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-amber-100/60'
                            }`}
                          >
                            {lvl === 'soft' ? '은은하게' : lvl === 'natural' ? '자연스럽게 ✨' : '강력하게'}
                          </button>
                        ))}
                      </div>

                      {/* 실행 메인 버튼 */}
                      <button
                        type="button"
                        disabled={isAutoShadowProcessing}
                        onClick={() => applyAutoShadowRemoval(shadowStrengthLevel)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-amber-500/25 transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        {isAutoShadowProcessing ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>그림자 걷어내는 중...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>{hasAutoShadowApplied ? '강도 재적용' : '그림자 한 번에 지우기'}</span>
                          </>
                        )}
                      </button>

                      {/* 복원 취소 버튼 */}
                      {hasAutoShadowApplied && (
                        <button
                          type="button"
                          onClick={handleResetAutoShadow}
                          className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          title="그림자 제거 효과를 취소하고 원본으로 되돌립니다"
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ========================================== */}
                  {/* 정밀 조명 역보정 (Shadow Matte) 컨트롤 패널 */}
                  {/* ========================================== */}
                  {isShadowToolOpen && (
                    <div className="w-full bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border border-amber-300 rounded-2xl p-4 mb-3 space-y-3 shadow-xs animate-in fade-in">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2.5 border-b border-amber-200/80">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                            <SunMedium size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                              물리 조명 역보정 시스템 (Shadow Matte)
                              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">질감 100% 보존</span>
                            </span>
                            <p className="text-[11px] text-amber-800/80 mt-0.5">
                              {isPipetteMode
                                ? '👉 그림자 바로 옆의 [빛을 잘 받는 밝은 바닥/배경]을 사진에서 콕 찍어주세요!'
                                : '스포이드로 기준 조명을 찍은 뒤, 그림자 부분을 슥슥 문지르면 조명만 원래대로 복원됩니다.'}
                            </p>
                          </div>
                        </div>

                        {/* 스포이드 버튼 & 기준 조명 표시 */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setIsPipetteMode(!isPipetteMode)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                              isPipetteMode
                                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 animate-pulse'
                                : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60'
                            }`}
                          >
                            <Pipette size={14} />
                            <span>{isPipetteMode ? '사진 클릭하여 추출 중...' : '빛 기준점 스포이드 🎯'}</span>
                          </button>

                          <div 
                            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-200 rounded-xl text-[11px] font-bold text-slate-700 shadow-xs"
                            title="현재 추출된 기준 조명 색상"
                          >
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-black/20"
                              style={{ backgroundColor: `rgb(${referenceLight.r}, ${referenceLight.g}, ${referenceLight.b})` }}
                            />
                            <span>조명: {referenceLight.luma}</span>
                          </div>
                        </div>
                      </div>

                      {/* 브러시 크기 & 복원 강도 슬라이더 */}
                      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-amber-950 pt-1">
                        <div className="flex items-center gap-2">
                          <span>브러시 크기:</span>
                          {[
                            { label: '소 (25px)', size: 25 },
                            { label: '보통 (45px)', size: 45 },
                            { label: '대 (80px)', size: 80 }
                          ].map((b) => (
                            <button
                              key={b.size}
                              type="button"
                              onClick={() => setBrushSize(b.size)}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition-all ${
                                brushSize === b.size
                                  ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                                  : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-100/50'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <span>복원 세기:</span>
                          <span className="text-amber-700 font-extrabold">{shadowRestoreStrength}%</span>
                          <input
                            type="range"
                            min="40"
                            max="100"
                            value={shadowRestoreStrength}
                            onChange={(e) => setShadowRestoreStrength(Number(e.target.value))}
                            className="w-24 accent-amber-600 cursor-pointer h-1.5 bg-amber-200 rounded-lg"
                          />
                        </div>

                        <div className="text-[11px] text-amber-800/80">
                          <span>💡 뭉개지지 않고 바닥의 나무결이나 글씨가 그대로 살아납니다!</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================== */}
                  {/* 모자이크 & 블러 마스킹 컨트롤 패널 */}
                  {/* ========================================== */}
                  {isMosaicToolOpen && (
                    <div className="w-full bg-gradient-to-r from-purple-50/95 via-indigo-50/80 to-purple-50/95 border border-purple-300 rounded-2xl p-4 mb-3 space-y-3.5 shadow-xs animate-in fade-in">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2.5 border-b border-purple-200/80">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                            <Grid size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                              초상권 & 개인정보 모자이크 스튜디오
                              <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-extrabold">100% 로컬 프라이버시 보호</span>
                            </span>
                            <p className="text-[11px] text-purple-800/80 mt-0.5">
                              {mosaicMode === 'box'
                                ? '👉 마우스나 손가락으로 가릴 영역을 드래그하세요 (얼굴, 번호판, 영수증, 택배 송장)'
                                : '👉 브러시로 슥슥 문지르면 해당 부위만 자연스럽게 마스킹됩니다.'}
                            </p>
                          </div>
                        </div>

                        {/* 방식 선택 (사각형 드래그 vs 브러시 문지르기) */}
                        <div className="flex items-center bg-white border border-purple-200 rounded-xl p-1 gap-1 shadow-2xs self-stretch sm:self-auto justify-center">
                          <button
                            type="button"
                            onClick={() => setMosaicMode('box')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                              mosaicMode === 'box'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-purple-50'
                            }`}
                          >
                            <Square size={13} />
                            <span>사각형 선택</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMosaicMode('brush')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                              mosaicMode === 'brush'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-purple-50'
                            }`}
                          >
                            <Paintbrush size={13} />
                            <span>브러시 문지르기</span>
                          </button>
                        </div>
                      </div>

                      {/* 모자이크 스타일 선택 (픽셀 vs 블러 vs 이모지) & 세부 슬라이더 */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-purple-950 pt-0.5">
                        {/* 스타일 탭 */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-semibold mr-1">스타일:</span>
                          {[
                            { id: 'pixel', label: '⬛ 픽셀 모자이크' },
                            { id: 'blur', label: '💧 부드러운 블러' },
                            { id: 'emoji', label: '😊 스티커 가리기' },
                          ].map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setMosaicStyle(s.id as 'pixel' | 'blur' | 'emoji')}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-black transition-all ${
                                mosaicStyle === s.id
                                  ? 'bg-purple-700 border-purple-700 text-white shadow-xs'
                                  : 'bg-white border-purple-200 text-slate-700 hover:bg-purple-100/50'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>

                        {/* 세부 옵션 컨트롤 */}
                        {mosaicStyle === 'pixel' && (
                          <div className="flex items-center gap-2">
                            <span>픽셀 크기:</span>
                            <span className="text-purple-700 font-extrabold">{mosaicPixelSize}px</span>
                            <input
                              type="range"
                              min="6"
                              max="36"
                              value={mosaicPixelSize}
                              onChange={(e) => setMosaicPixelSize(Number(e.target.value))}
                              className="w-24 accent-purple-600 cursor-pointer h-1.5 bg-purple-200 rounded-lg"
                            />
                          </div>
                        )}

                        {mosaicStyle === 'blur' && (
                          <div className="flex items-center gap-2">
                            <span>흐림 강도:</span>
                            <span className="text-purple-700 font-extrabold">{mosaicBlurRadius}px</span>
                            <input
                              type="range"
                              min="4"
                              max="32"
                              value={mosaicBlurRadius}
                              onChange={(e) => setMosaicBlurRadius(Number(e.target.value))}
                              className="w-24 accent-purple-600 cursor-pointer h-1.5 bg-purple-200 rounded-lg"
                            />
                          </div>
                        )}

                        {mosaicStyle === 'emoji' && (
                          <div className="flex items-center gap-1 bg-white border border-purple-200 rounded-xl px-2 py-1 overflow-x-auto max-w-full">
                            <span className="text-[11px] text-slate-500 font-normal mr-1">이모지:</span>
                            {MOSAIC_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => setSelectedEmoji(emoji)}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-transform ${
                                  selectedEmoji === emoji
                                    ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                                    : 'hover:bg-slate-100'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}

                        {mosaicMode === 'brush' && (
                          <div className="flex items-center gap-2">
                            <span>브러시 크기:</span>
                            {[
                              { label: '소 (20px)', size: 20 },
                              { label: '보통 (40px)', size: 40 },
                              { label: '대 (70px)', size: 70 },
                            ].map((b) => (
                              <button
                                key={b.size}
                                type="button"
                                onClick={() => setMosaicBrushSize(b.size)}
                                className={`px-2 py-1 rounded-lg border text-[11px] font-black transition-all ${
                                  mosaicBrushSize === b.size
                                    ? 'bg-purple-700 border-purple-700 text-white shadow-xs'
                                    : 'bg-white border-purple-200 text-slate-700 hover:bg-purple-100/50'
                                }`}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 캔버스/이미지 미리보기 창 */}
                  <div 
                    className={`w-full h-80 sm:h-96 bg-slate-900/5 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center p-2 shadow-inner select-none ${
                      isPipetteMode ? 'cursor-crosshair' : isShadowToolOpen || isMosaicToolOpen ? 'cursor-crosshair' : 'cursor-default'
                    }`}
                    style={{ touchAction: isMosaicToolOpen || isShadowToolOpen ? 'none' : 'auto' }}
                  >
                    <canvas 
                      ref={previewCanvasRef}
                      onClick={handleCanvasPointerDown}
                      onMouseDown={handleCanvasPointerDown}
                      onMouseMove={handleCanvasPointerMove}
                      onMouseUp={handleCanvasPointerUp}
                      onMouseLeave={handleCanvasPointerUp}
                      onTouchStart={handleCanvasPointerDown}
                      onTouchMove={handleCanvasPointerMove}
                      onTouchEnd={handleCanvasPointerUp}
                      className="max-w-full max-h-full object-contain transition-all duration-75 shadow-sm"
                    />

                    {/* 사각형 드래그 가이드라인 점선 박스 */}
                    {isMosaicToolOpen && mosaicMode === 'box' && mosaicBoxOffset && (
                      <div
                        className="absolute border-2 border-dashed border-purple-600 bg-purple-500/25 pointer-events-none rounded-xs z-20 transition-none"
                        style={{
                          left: Math.min(mosaicBoxOffset.startX, mosaicBoxOffset.curX),
                          top: Math.min(mosaicBoxOffset.startY, mosaicBoxOffset.curY),
                          width: Math.abs(mosaicBoxOffset.curX - mosaicBoxOffset.startX),
                          height: Math.abs(mosaicBoxOffset.curY - mosaicBoxOffset.startY)
                        }}
                      />
                    )}

                    {isMosaicToolOpen && (
                      <div className="absolute top-3 left-3 bg-purple-700/95 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5">
                        <Grid size={13} />
                        <span>{mosaicMode === 'box' ? '영역을 드래그하여 모자이크' : '문질러서 모자이크 마스킹'}</span>
                      </div>
                    )}

                    {isPipetteMode && (
                      <div className="absolute top-3 left-3 bg-indigo-600/90 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5 animate-bounce">
                        <Target size={14} />
                        <span>사진에서 빛을 잘 받는 밝은 곳을 클릭하세요!</span>
                      </div>
                    )}

                    {isComparingOriginal && (
                      <div className="absolute top-3 left-3 bg-black/75 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                        원본 사진 확인 중
                      </div>
                    )}
                  </div>
                </div>

                {/* 컨트롤 패널 1: 원클릭 감성 프리셋 */}
                <div className="w-full bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Sparkles size={15} className="text-indigo-600" />
                        <span>원클릭 감성 톤 프리셋</span>
                        <span className="text-[11px] font-normal text-slate-400">({PHOTO_PRESETS.length}종 맞춤 프리셋)</span>
                      </div>
                      {activePresetId !== 'original' && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw size={11} />
                          <span>기본값 초기화</span>
                        </button>
                      )}
                    </div>

                    {/* 카테고리 칩 탭 바 */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin">
                      {PRESET_CATEGORIES.map((cat) => {
                        const isCatSelected = presetCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setPresetCategory(cat.id as PresetCategory)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                              isCatSelected
                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 ring-2 ring-indigo-500/20'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* 프리셋 카드 그리드 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {PHOTO_PRESETS.filter(
                        (p) => presetCategory === 'all' || p.category === presetCategory
                      ).map((p) => {
                        const IconComponent = p.icon;
                        const isSelected = activePresetId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => applyPreset(p)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between group relative ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-sm ring-2 ring-indigo-500/25'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-xs font-black truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                  {p.name}
                                </span>
                                <IconComponent
                                  size={15}
                                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                                    isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                                  }`}
                                />
                              </div>
                              <p className="text-[10.5px] text-slate-400 leading-snug line-clamp-2">
                                {p.desc}
                              </p>
                            </div>
                            {p.badge && (
                              <div className="mt-2 flex items-center">
                                <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded-md ${
                                  isSelected
                                    ? 'bg-indigo-200/70 text-indigo-800'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                }`}>
                                  {p.badge}
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 컨트롤 패널 2: 정밀 슬라이더 */}
                  <div className="pt-3 border-t border-slate-200/80">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <SlidersHorizontal size={15} className="text-indigo-600" />
                        <span>세부 톤 & 밝기 정밀 조절</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
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

                  {/* 누끼 및 썸네일 탭 연동 팁 배너 */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-xl border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <Sparkles size={16} className="text-purple-600 shrink-0" />
                      <span>보정한 이 사진으로 누끼를 따거나 대표 썸네일을 만드시겠어요?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTransferToNukki}
                        disabled={isExporting}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black shadow-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <Scissors size={13} />
                        <span>누끼따기 &rarr;</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleTransferEnhancedToDesign}
                        disabled={isExporting}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black shadow-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <Palette size={13} />
                        <span>썸네일 만들기 &rarr;</span>
                      </button>
                    </div>
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
                    <span>블로그 최적화 저장 (20MB 이하 JPG)</span>
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

        {/* ========================================================= */}
        {/* 탭 3: 미리캔버스 모드 (블로그 썸네일 & 타이포 디자인) */}
        {/* ========================================================= */}
        {currentTab === 'design' && (
          <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-8 animate-in fade-in">
            {!designUrl ? (
              <div 
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  isDesignDragging 
                    ? 'border-rose-500 bg-rose-50/50 scale-[0.99]' 
                    : 'border-slate-300 hover:border-rose-400 hover:bg-slate-50/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDesignDragging(true); }}
                onDragLeave={() => setIsDesignDragging(false)}
                onDrop={handleDesignDrop}
                onClick={() => designFileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Palette size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">
                  썸네일로 만들 사진을 업로드하세요
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                  클릭하거나 사진을 드래그하세요. 네이버 1등 블로그 스타일의 대표 썸네일을 1초 만에 완성합니다.
                </p>
                <div className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm shadow-sm transition-transform active:scale-95">
                  <Upload size={16} />
                  <span>사진 선택하기</span>
                </div>

                {/* 템플릿 소개 카드 프리뷰 */}
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span className="text-base">🔥</span>
                    <p className="text-xs font-black text-slate-800 mt-1">맛집/리뷰 썸네일</p>
                    <p className="text-[11px] text-slate-500">노란 볼드 타이틀 + 외곽선</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span className="text-base">☕</span>
                    <p className="text-xs font-black text-slate-800 mt-1">감성 카페/여행</p>
                    <p className="text-[11px] text-slate-500">감성 세리프 + 언더라인</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span className="text-base">💡</span>
                    <p className="text-xs font-black text-slate-800 mt-1">정보/꿀팁 IT</p>
                    <p className="text-[11px] text-slate-500">가독성 100% 다크 박스</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span className="text-base">💰</span>
                    <p className="text-xs font-black text-slate-800 mt-1">내돈내산 인증</p>
                    <p className="text-[11px] text-slate-500">100% 내돈내산 뱃지 부착</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* 좌측: 실시간 캔버스 미리보기 */}
                  <div className="lg:col-span-7 flex flex-col items-center bg-slate-100/80 p-4 sm:p-6 rounded-2xl border border-slate-200">
                    {/* 상단 캔버스 비율 전환 칩 */}
                    <div className="w-full flex items-center justify-between mb-4 flex-wrap gap-2">
                      <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                        <LayoutTemplate size={14} className="text-rose-600" /> 캔버스 비율
                      </span>
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
                        <button
                          type="button"
                          onClick={() => setDesignRatio('1:1')}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            designRatio === '1:1' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          1:1 정방형 (권장)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignRatio('4:3')}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            designRatio === '4:3' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          4:3
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignRatio('16:9')}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            designRatio === '16:9' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          16:9 와이드
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignRatio('orig')}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            designRatio === 'orig' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          원본
                        </button>
                      </div>
                    </div>

                    {/* 실시간 캔버스 */}
                    <div className="w-full flex items-center justify-center min-h-[320px] max-h-[460px] overflow-hidden rounded-xl bg-slate-900/5 relative shadow-inner">
                      <canvas 
                        ref={designCanvasRef} 
                        className="max-h-[440px] max-w-full object-contain rounded-xl shadow-md border border-white"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium mt-3 text-center">
                      ⚡ 네이버 블로그 20MB 업로드 제한을 완벽히 통과하는 고화질(JPG)로 자동 최적화됩니다.
                    </p>
                  </div>

                  {/* 우측: 미리캔버스 스타일 디자인 설정 패널 */}
                  <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                    {/* 1. 디자인 템플릿 프리셋 */}
                    <div>
                      <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-2">
                        <Sparkles size={14} className="text-rose-600" /> 템플릿 프리셋 (원클릭)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setDesignTemplate('food');
                            setHasOutline(true);
                            setTitleColor('#FFFFFF');
                            setDesignDim(35);
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                            designTemplate === 'food'
                              ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="block text-sm">🔥</span>
                          <span>맛집/먹방</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDesignTemplate('cafe');
                            setHasOutline(false);
                            setTitleColor('#FFFFFF');
                            setDesignDim(30);
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                            designTemplate === 'cafe'
                              ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="block text-sm">☕</span>
                          <span>감성 카페</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDesignTemplate('info');
                            setHasOutline(false);
                            setTitleColor('#FFFFFF');
                            setDesignDim(20);
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                            designTemplate === 'info'
                              ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="block text-sm">💡</span>
                          <span>정보/꿀팁</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDesignTemplate('nandn');
                            setHasOutline(true);
                            setBadgeType('nandn');
                            setDesignDim(35);
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                            designTemplate === 'nandn'
                              ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="block text-sm">💰</span>
                          <span>내돈내산</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDesignTemplate('clean');
                            setHasOutline(false);
                            setTitleColor('#FFFFFF');
                            setDesignDim(30);
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border text-left transition-all col-span-2 sm:col-span-1 ${
                            designTemplate === 'clean'
                              ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="block text-sm">✨</span>
                          <span>미니멀 보더</span>
                        </button>
                      </div>
                    </div>

                    {/* 2. 텍스트 입력창 */}
                    <div className="flex flex-col gap-2.5">
                      <div>
                        <label className="text-[11px] font-extrabold text-slate-700 mb-1 block">메인 타이틀 (제목)</label>
                        <input
                          type="text"
                          value={mainTitle}
                          onChange={(e) => setMainTitle(e.target.value)}
                          placeholder="제목을 입력하세요"
                          className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-extrabold text-slate-700 mb-1 block">서브 카피 (부제 / 생략 가능)</label>
                        <input
                          type="text"
                          value={subTitle}
                          onChange={(e) => setSubTitle(e.target.value)}
                          placeholder="소제목 또는 꿀팁 요약"
                          className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    </div>

                    {/* 3. 텍스트 위치 & 스타일 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-extrabold text-slate-700 mb-1 block">글씨 위치</label>
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setTextPosition('top')}
                            className={`flex-1 py-1 rounded-lg text-center ${
                              textPosition === 'top' ? 'bg-rose-100 text-rose-700' : 'text-slate-600'
                            }`}
                          >
                            상단
                          </button>
                          <button
                            type="button"
                            onClick={() => setTextPosition('center')}
                            className={`flex-1 py-1 rounded-lg text-center ${
                              textPosition === 'center' ? 'bg-rose-100 text-rose-700' : 'text-slate-600'
                            }`}
                          >
                            중앙
                          </button>
                          <button
                            type="button"
                            onClick={() => setTextPosition('bottom')}
                            className={`flex-1 py-1 rounded-lg text-center ${
                              textPosition === 'bottom' ? 'bg-rose-100 text-rose-700' : 'text-slate-600'
                            }`}
                          >
                            하단
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-slate-700 mb-1 block">검은 외곽선</label>
                        <button
                          type="button"
                          onClick={() => setHasOutline(!hasOutline)}
                          className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                            hasOutline ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'
                          }`}
                        >
                          {hasOutline ? '외곽선 켜짐 ✓' : '외곽선 없음'}
                        </button>
                      </div>
                    </div>

                    {/* 4. 블로그 인증 뱃지 */}
                    <div>
                      <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
                        <BookmarkCheck size={14} className="text-emerald-600" /> 블로그 인증 뱃지 (원클릭 부착)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setBadgeType('none')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            badgeType === 'none' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          없음
                        </button>
                        <button
                          type="button"
                          onClick={() => setBadgeType('nandn')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            badgeType === 'nandn' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-200'
                          }`}
                        >
                          💰 내돈내산
                        </button>
                        <button
                          type="button"
                          onClick={() => setBadgeType('honest')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            badgeType === 'honest' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-700 border-purple-200'
                          }`}
                        >
                          ✨ 솔직후기
                        </button>
                        <button
                          type="button"
                          onClick={() => setBadgeType('best')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            badgeType === 'best' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-700 border-orange-200'
                          }`}
                        >
                          🔥 인생BEST
                        </button>
                        <button
                          type="button"
                          onClick={() => setBadgeType('must')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            badgeType === 'must' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-700 border-rose-200'
                          }`}
                        >
                          📌 필독가이드
                        </button>
                      </div>
                    </div>

                    {/* 5. 배경 어두운 딤(Dim) 조절 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-extrabold text-slate-700">배경 어둡기 (글씨 가독성)</label>
                        <span className="text-[11px] font-bold text-slate-500">{designDim}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="70"
                        value={designDim}
                        onChange={(e) => setDesignDim(Number(e.target.value))}
                        className="w-full accent-rose-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 하단 액션 버튼 그룹 */}
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-center w-full pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleCopyDesignClipboard}
                    disabled={isExportingDesign}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isExportingDesign ? <Loader2 className="animate-spin" size={16} /> : <Copy size={16} />}
                    <span>클립보드 복사 (Ctrl+V)</span>
                  </button>

                  <button 
                    onClick={handleDownloadDesign}
                    disabled={isExportingDesign}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isExportingDesign ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                    <span>블로그 최적화 썸네일 저장 (JPG)</span>
                  </button>

                  <button 
                    onClick={() => {
                      setDesignFile(null);
                      setDesignUrl(null);
                      if (designFileInputRef.current) designFileInputRef.current.value = '';
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
              ref={designFileInputRef} 
              onChange={handleDesignFileChange} 
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
