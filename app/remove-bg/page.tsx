/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Film
} from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import CoupangBanner from '@/components/CoupangBanner';
import { useSiteSettings } from '@/lib/settings';

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

export default function RemoveBg() {
  const { settings, isLoaded } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 배경 및 스타일링 옵션
  const [selectedBgId, setSelectedBgId] = useState<string>('transparent');
  const [customBgColor, setCustomBgColor] = useState<string>('#FFFFFF');
  const [outlineMode, setOutlineMode] = useState<'none' | 'thin' | 'bold'>('none');
  const [outlineColor, setOutlineColor] = useState<string>('#FFFFFF');
  const [hasShadow, setHasShadow] = useState<boolean>(false);

  // 복사 피드백 토스트
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 단축키 Ctrl + V 클립보드 붙여넣기 지원
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

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
        model: 'medium' as const, // 누끼 품질 향상을 위해 medium 모델 사용
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

  // 현재 선택된 배경 스타일 계산
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

  // 미리보기 이미지 필터 스타일 (스티커 외곽선 + 그림자)
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

  // 합성된 최종 이미지 Blob 생성 (다운로드 및 클립보드 복사용)
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
          // d-offset 다방향 렌더링으로 부드러운 스티커 테두리 완성
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
          ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          ctx.shadowBlur = Math.max(12, Math.round(canvas.width * 0.02));
          ctx.shadowOffsetY = Math.max(8, Math.round(canvas.width * 0.012));
        }

        // 4. 본래 누끼 이미지 그리기
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };
      img.src = resultUrl;
    });
  };

  // 최종 이미지 파일 다운로드
  const handleDownload = async () => {
    const blob = await generateFinalBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gifty-nukki-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 클립보드로 복사 (블로그/카톡에 바로 Ctrl+V)
  const handleCopyClipboard = async () => {
    if (!resultUrl) return;
    try {
      const blob = await generateFinalBlob();
      if (!blob) return;
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopyFeedback('✨ 클립보드 복사 완료! 블로그나 카톡에 바로 Ctrl+V 하세요.');
        setTimeout(() => setCopyFeedback(''), 3000);
      } else {
        alert('현재 브라우저 환경에서는 클립보드 직접 복사를 지원하지 않습니다. 다운로드 버튼을 이용해 주세요!');
      }
    } catch (err) {
      console.warn('Clipboard write failed', err);
      alert('클립보드 복사 권한이 없거나 지원되지 않습니다. 다운로드 버튼을 이용해 주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 flex flex-col">
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl transform rotate-3">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800">
              Gifty<span className="text-indigo-600">.</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="/" className="hover:text-indigo-600 transition-colors">홈</a>
            <a href="/community" className="hover:text-indigo-600 transition-colors text-indigo-600 font-extrabold flex items-center gap-1">커뮤니티 💬</a>
            <a href="/experience-diary" className="hover:text-indigo-600 transition-colors text-blue-600">체험단 다이어리 📓</a>
            <a href="/sticker" className="hover:text-pink-700 transition-colors text-pink-600 font-extrabold">블로그 스티커 🎨</a>
            <a href="/remove-bg" className="hover:text-indigo-600 transition-colors text-purple-600 font-extrabold">누끼따기(AI) ✂️</a>
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
            <a href="/" className="text-slate-700 hover:text-indigo-600 p-3 rounded-xl hover:bg-slate-50">홈</a>
            <a href="/community" className="text-indigo-600 hover:bg-indigo-50 p-3 rounded-xl">커뮤니티 💬</a>
            <a href="/experience-diary" className="text-blue-600 hover:bg-blue-50 p-3 rounded-xl">체험단 다이어리 📓</a>
            <a href="/sticker" className="text-pink-600 hover:bg-pink-50 p-3 rounded-xl">블로그 스티커 🎨</a>
            <a href="/remove-bg" className="text-purple-600 hover:bg-purple-50 p-3 rounded-xl">누끼따기(AI) ✂️</a>
          </div>
        )}
      </nav>

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-bold mb-3">
            <Wand2 size={16} /> 100% 무료 AI 사진 누끼 & 배경 스튜디오
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            AI 배경 제거 (누끼따기)
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
            클릭 한 번으로 깔끔하게 누끼를 따고, 원하는 배경색이나 스티커 외곽선을 더해보세요!
          </p>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-8">
          {!originalUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`w-full h-80 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-50 scale-[0.99]' 
                  : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40'
              }`}
            >
              <div className="bg-indigo-50 p-4 rounded-2xl mb-3">
                <Upload className="text-indigo-600" size={36} />
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-700">
                {isDragging ? '파일을 여기에 놓아주세요' : '클릭하거나 사진을 끌어다 놓으세요'}
              </p>
              <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                <span>💡 캡처 후</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs text-indigo-600 font-extrabold">Ctrl + V</kbd>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      /* eslint-disable-next-line @next/next/no-img-element */
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
                <div className="w-full bg-indigo-50 text-indigo-700 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 mb-6 font-bold text-sm border border-indigo-100 shadow-xs animate-pulse">
                  <Loader2 className="animate-spin text-indigo-600" size={20} />
                  <span>{progressText}</span>
                </div>
              )}

              {/* 누끼 완료 후 스타일링 패널 (배경색, 스티커 외곽선, 그림자) */}
              {resultUrl && !isProcessing && (
                <div className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  {/* 1. 배경 선택 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Palette size={15} className="text-indigo-600" />
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
                                ? 'border-indigo-600 bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-500'
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
                                ? 'border-indigo-600 bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-500'
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

                  {/* 2. 외곽선(스티커 효과) & 그림자 효과 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200/70">
                    <div>
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                        <Layers size={14} className="text-indigo-600" />
                        <span>스티커 흰색 외곽선</span>
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
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
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
                        <Sparkles size={14} className="text-indigo-600" />
                        <span>입체 그림자 효과</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => setHasShadow(false)}
                          className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                            !hasShadow
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
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
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          자연스러운 그림자 ✨
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 복사 성공 안내 토스트 */}
              {copyFeedback && (
                <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 mb-4 animate-in fade-in">
                  <Check size={16} className="text-emerald-600" />
                  <span>{copyFeedback}</span>
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
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

        {/* Global Coupang Partners Banner */}
        {isLoaded && (settings.coupangBannerHtml || settings.coupangBannerHtmlMobile) && (
          <div className="max-w-4xl mx-auto px-4 mt-12 mb-8">
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

