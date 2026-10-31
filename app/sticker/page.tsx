'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Copy,
  Download,
  Upload,
  Loader2,
  Menu,
  X,
  Type,
  Scissors,
  Check,
  BookOpen,
  Wand2,
} from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import CoupangBanner from '@/components/CoupangBanner';
import CoupangSupportCard from '@/components/CoupangSupportCard';
import { useSiteSettings } from '@/lib/settings';

type StickerShape = 'pill' | 'SpeechBubble' | 'highlighter' | 'stamp' | 'nametag' | 'rating';

interface PresetItem {
  category: string;
  text: string;
  subText: string;
  shape: StickerShape;
  themeId: string;
}

const PRESETS: PresetItem[] = [
  { category: '소제목', text: '📍 찾아가는 길 & 위치 안내', subText: '방문 전 위치와 교통편을 확인하세요', shape: 'pill', themeId: 'indigo' },
  { category: '소제목', text: '🕒 영업시간 및 브레이크타임', subText: '방문 전 휴무일 체크 필수!', shape: 'pill', themeId: 'blue' },
  { category: '소제목', text: '🚗 주차장 및 이용 안내', subText: '편리한 주차 꿀팁 정리', shape: 'pill', themeId: 'green' },
  { category: '소제목', text: '🍽️ 오늘의 주문 메뉴 & 가격', subText: '직접 먹어본 메뉴 솔직 리뷰', shape: 'highlighter', themeId: 'amber' },
  { category: '소제목', text: '✨ 매장 외부 & 내부 분위기', subText: '깔끔하고 감성 넘치는 공간', shape: 'highlighter', themeId: 'pink' },
  { category: '소제목', text: '💡 총평 & 재방문 의사', subText: '한눈에 보는 핵심 요약', shape: 'SpeechBubble', themeId: 'indigo' },
  { category: '별점/총평', text: '⭐ 솔직 방문 별점 총평', subText: '재방문 의사 100%! 자신 있게 추천하는 곳', shape: 'rating', themeId: 'amber' },
  { category: '공정위/인증', text: '⚖️ 공정위 문구 준수 포스팅', subText: '업체로부터 서비스를 제공받아 솔직하게 작성함', shape: 'pill', themeId: 'indigo' },
  { category: '공정위/인증', text: '🧾 영수증 인증 내돈내산', subText: '내 돈 내고 직접 사먹은 100% 리얼 솔직 리뷰', shape: 'stamp', themeId: 'green' },
  { category: '인증도장', text: '💯 100% 내돈내산 솔직후기', subText: '직접 결제하고 솔직하게 작성했습니다', shape: 'stamp', themeId: 'pink' },
  { category: '인증도장', text: '🎁 체험단 협찬 솔직 리뷰', subText: '서비스를 제공받아 솔직하게 작성함', shape: 'stamp', themeId: 'blue' },
  { category: '인증도장', text: '👍 재방문 의사 200% 강추!', subText: '지인에게도 자신 있게 추천하는 곳', shape: 'stamp', themeId: 'green' },
  { category: '네임택', text: '💬 공감과 댓글은 큰 힘이 됩니다 ♥', subText: '방문해 주셔서 감사합니다!', shape: 'nametag', themeId: 'pink' },
  { category: '네임택', text: '🤝 서로이웃 추가 언제나 환영해요!', subText: '함께 소통하며 지내요 :)', shape: 'nametag', themeId: 'indigo' },
  { category: '네임택', text: '📸 사진·글 무단 도용 및 불펌 금지', subText: 'All rights reserved.', shape: 'nametag', themeId: 'dark' },
];

const COLOR_THEMES = [
  { id: 'indigo', label: '퍼플 인디고', primary: '#4f46e5', secondary: '#7c3aed', light: '#eef2ff', text: '#ffffff', darkText: '#312e81' },
  { id: 'green', label: '네이버 그린', primary: '#03c75a', secondary: '#059669', light: '#ecfdf5', text: '#ffffff', darkText: '#065f46' },
  { id: 'pink', label: '러블리 핑크', primary: '#ec4899', secondary: '#f43f5e', light: '#fdf2f8', text: '#ffffff', darkText: '#831843' },
  { id: 'amber', label: '감성 옐로우', primary: '#f59e0b', secondary: '#ea580c', light: '#fffbeb', text: '#ffffff', darkText: '#78350f' },
  { id: 'blue', label: '스카이 블루', primary: '#2563eb', secondary: '#0284c7', light: '#eff6ff', text: '#ffffff', darkText: '#1e3a8a' },
  { id: 'dark', label: '모던 블랙', primary: '#1e293b', secondary: '#0f172a', light: '#f1f5f9', text: '#ffffff', darkText: '#0f172a' },
];

const PHOTO_CAPTION_PRESETS = [
  '내돈내산 👍',
  '진짜 존맛탱 ✨',
  '완전 강추 💯',
  '솔직 후기 📝',
  '재방문 각 ❤️',
  '포스팅 끝! 🙌',
  '',
];

export default function StickerMakerPage() {
  const { settings, isLoaded } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'photo'>('text');

  // === 탭 1: 텍스트/배지 스티커 상태 ===
  const [mainText, setMainText] = useState('💯 100% 내돈내산 솔직후기');
  const [subText, setSubText] = useState('직접 결제하고 솔직하게 작성했습니다');
  const [shape, setShape] = useState<StickerShape>('pill');
  const [themeId, setThemeId] = useState('indigo');
  const [stickerFont, setStickerFont] = useState<'Jua' | 'Gaegu' | 'BlackHanSans' | 'NanumGothic'>('Jua');
  const [presetCategory, setPresetCategory] = useState<string>('전체');
  const [textStickerUrl, setTextStickerUrl] = useState<string>('');
  const [copiedTextSticker, setCopiedTextSticker] = useState(false);
  const textCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 별점 스티커 전용 상태
  const [ratingTaste, setRatingTaste] = useState<number>(5);
  const [ratingPrice, setRatingPrice] = useState<number>(4);
  const [ratingMood, setRatingMood] = useState<number>(5);

  // === 탭 2: AI 사진 칼선 스티커 상태 ===
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cutoutImage, setCutoutImage] = useState<HTMLImageElement | null>(null);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiProgressText, setAiProgressText] = useState('');
  const [outlineSize, setOutlineSize] = useState<number>(14);
  const [photoCaption, setPhotoCaption] = useState<string>('내돈내산 👍');
  const [photoThemeId, setPhotoThemeId] = useState<string>('indigo');
  const [photoStickerUrl, setPhotoStickerUrl] = useState<string>('');
  const [copiedPhotoSticker, setCopiedPhotoSticker] = useState(false);
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const drawRoundRectOnCtx = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // === 탭 1: 텍스트 스티커 Canvas 렌더링 ===
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 740;
    canvas.height = 240;
    textCanvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) =>
      drawRoundRectOnCtx(ctx, x, y, w, h, r);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const theme = COLOR_THEMES.find((t) => t.id === themeId) || COLOR_THEMES[0];
    const hasSub = subText.trim().length > 0;

    if (shape === 'pill') {
      const boxX = 30;
      const boxY = 38;
      const boxW = 680;
      const boxH = 164;
      const radius = 82;

      // 그림자 + 두꺼운 흰색 칼선 테두리
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
      drawRoundRect(boxX - 10, boxY - 10, boxW + 20, boxH + 20, radius + 10);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // 메인 그라데이션 배지
      const grad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
      grad.addColorStop(0, theme.primary);
      grad.addColorStop(1, theme.secondary);
      drawRoundRect(boxX, boxY, boxW, boxH, radius);
      ctx.fillStyle = grad;
      ctx.fill();

      // 텍스트
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 38px ${stickerFont}, sans-serif`;
      ctx.fillText(mainText || '문구를 입력하세요', 370, hasSub ? 112 : 134);

      if (hasSub) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.font = `bold 22px ${stickerFont}, sans-serif`;
        ctx.fillText(subText, 370, 156);
      }
    } else if (shape === 'SpeechBubble') {
      const boxX = 40;
      const boxY = 26;
      const boxW = 660;
      const boxH = 156;
      const radius = 44;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 8;

      // 말풍선 본체 + 꼬리 (흰색 외곽선)
      drawRoundRect(boxX - 10, boxY - 10, boxW + 20, boxH + 20, radius + 8);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(340, boxY + boxH + 6);
      ctx.lineTo(370, boxY + boxH + 40);
      ctx.lineTo(400, boxY + boxH + 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 내부 채우기
      const grad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
      grad.addColorStop(0, theme.primary);
      grad.addColorStop(1, theme.secondary);
      drawRoundRect(boxX, boxY, boxW, boxH, radius);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(348, boxY + boxH - 2);
      ctx.lineTo(370, boxY + boxH + 26);
      ctx.lineTo(392, boxY + boxH - 2);
      ctx.closePath();
      ctx.fillStyle = theme.secondary;
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 36px ${stickerFont}, sans-serif`;
      ctx.fillText(mainText || '문구를 입력하세요', 370, hasSub ? 96 : 118);

      if (hasSub) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `bold 21px ${stickerFont}, sans-serif`;
        ctx.fillText(subText, 370, 140);
      }
    } else if (shape === 'highlighter') {
      const boxX = 36;
      const boxY = 36;
      const boxW = 668;
      const boxH = 168;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.14)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;
      drawRoundRect(boxX, boxY, boxW, boxH, 32);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      drawRoundRect(boxX, boxY, boxW, boxH, 32);
      ctx.lineWidth = 4;
      ctx.strokeStyle = theme.primary;
      ctx.stroke();

      // 왼쪽 컬러 포인트 바
      drawRoundRect(boxX + 18, boxY + 22, 14, boxH - 44, 7);
      ctx.fillStyle = theme.primary;
      ctx.fill();

      // 형광펜 밑줄 효과
      drawRoundRect(boxX + 54, hasSub ? 94 : 112, boxW - 90, 26, 12);
      ctx.fillStyle = theme.light;
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = theme.darkText;
      ctx.font = `900 36px ${stickerFont}, sans-serif`;
      ctx.fillText(mainText || '문구를 입력하세요', boxX + 58, hasSub ? 110 : 130);

      if (hasSub) {
        ctx.fillStyle = '#64748b';
        ctx.font = `bold 21px ${stickerFont}, sans-serif`;
        ctx.fillText(subText, boxX + 58, 158);
      }
    } else if (shape === 'stamp') {
      const boxX = 50;
      const boxY = 32;
      const boxW = 640;
      const boxH = 176;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;
      drawRoundRect(boxX - 8, boxY - 8, boxW + 16, boxH + 16, 30);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      drawRoundRect(boxX, boxY, boxW, boxH, 24);
      ctx.fillStyle = theme.light;
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = theme.primary;
      ctx.stroke();

      // 안쪽 점선 테두리 (스탬프 느낌)
      ctx.save();
      ctx.setLineDash([10, 8]);
      drawRoundRect(boxX + 14, boxY + 14, boxW - 28, boxH - 28, 16);
      ctx.lineWidth = 3;
      ctx.strokeStyle = theme.primary;
      ctx.stroke();
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.fillStyle = theme.primary;
      ctx.font = `900 36px ${stickerFont}, sans-serif`;
      ctx.fillText(mainText || '문구를 입력하세요', 370, hasSub ? 110 : 132);

      if (hasSub) {
        ctx.fillStyle = theme.darkText;
        ctx.font = `bold 21px ${stickerFont}, sans-serif`;
        ctx.fillText(subText, 370, 154);
      }
    } else if (shape === 'rating') {
      const boxX = 30;
      const boxY = 22;
      const boxW = 680;
      const boxH = 196;
      const radius = 28;

      // 흰색 외곽선 + 부드러운 그림자
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 8;
      drawRoundRect(boxX - 8, boxY - 8, boxW + 16, boxH + 16, radius + 8);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // 메인 카드 배경
      drawRoundRect(boxX, boxY, boxW, boxH, radius);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = theme.primary;
      ctx.stroke();

      // 상단 헤더 띠
      drawRoundRect(boxX, boxY, boxW, 52, radius);
      ctx.fillStyle = theme.light;
      ctx.fill();
      ctx.fillRect(boxX, boxY + 28, boxW, 24);

      // 상단 메인 타이틀
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.darkText;
      ctx.font = `900 24px ${stickerFont}, sans-serif`;
      ctx.fillText(mainText || '⭐ 솔직 방문 별점 총평', 370, boxY + 36);

      // 3개 별점 점수 항목 (맛 / 가성비 / 분위기)
      const items = [
        { label: '맛 / 퀄리티', score: ratingTaste },
        { label: '가격 / 가성비', score: ratingPrice },
        { label: '분위기 / 서비스', score: ratingMood },
      ];
      const colWidth = boxW / 3;
      items.forEach((item, idx) => {
        const cx = boxX + colWidth * idx + colWidth / 2;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#64748b';
        ctx.font = `bold 16px ${stickerFont}, sans-serif`;
        ctx.fillText(item.label, cx, boxY + 84);

        // 노란 별점 아이콘
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 20px sans-serif';
        const stars = '★'.repeat(item.score) + '☆'.repeat(5 - item.score);
        ctx.fillText(stars, cx, boxY + 112);

        // 점수 숫자
        ctx.fillStyle = '#1e293b';
        ctx.font = `900 17px ${stickerFont}, sans-serif`;
        ctx.fillText(`${item.score}.0 점`, cx, boxY + 135);
      });

      // 하단 한 줄 총평 배지
      if (hasSub) {
        const badgeY = boxY + 150;
        drawRoundRect(boxX + 24, badgeY, boxW - 48, 34, 17);
        ctx.fillStyle = theme.light;
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.fillStyle = theme.primary;
        ctx.font = `900 16px ${stickerFont}, sans-serif`;
        ctx.fillText(`💬 "${subText}"`, 370, badgeY + 23);
      }
    } else {
      // nametag
      const boxX = 36;
      const boxY = 44;
      const boxW = 668;
      const boxH = 152;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 6;
      drawRoundRect(boxX - 8, boxY - 8, boxW + 16, boxH + 16, 40);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      drawRoundRect(boxX, boxY, boxW, boxH, 34);
      ctx.fillStyle = theme.light;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = theme.primary;
      ctx.stroke();

      // 상단 리본 탭
      drawRoundRect(260, boxY - 20, 220, 40, 20);
      ctx.fillStyle = theme.primary;
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 18px ${stickerFont}, sans-serif`;
      ctx.fillText('✨ BLOG STICKER ✨', 370, boxY + 6);

      ctx.fillStyle = theme.darkText;
      ctx.font = `900 34px ${stickerFont}, sans-serif`;
      ctx.fillText(mainText || '문구를 입력하세요', 370, hasSub ? 118 : 136);

      if (hasSub) {
        ctx.fillStyle = '#475569';
        ctx.font = `bold 20px ${stickerFont}, sans-serif`;
        ctx.fillText(subText, 370, 158);
      }
    }

    setTextStickerUrl(canvas.toDataURL('image/png'));
  }, [mainText, subText, shape, themeId, stickerFont, ratingTaste, ratingPrice, ratingMood]);

  // === 탭 2: AI 사진 칼선 스티커 렌더링 (740x640 OGQ & 블로그 규격) ===
  const renderPhotoSticker = useCallback(() => {
    if (!cutoutImage) return;

    const canvas = document.createElement('canvas');
    canvas.width = 740;
    canvas.height = 640;
    photoCanvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hasCaption = photoCaption.trim().length > 0;
    const maxDrawW = 540;
    const maxDrawH = hasCaption ? 440 : 500;
    const scale = Math.min(maxDrawW / cutoutImage.width, maxDrawH / cutoutImage.height);
    const drawW = Math.round(cutoutImage.width * scale);
    const drawH = Math.round(cutoutImage.height * scale);
    const drawX = Math.round((canvas.width - drawW) / 2);
    const drawY = Math.round(( (hasCaption ? 500 : canvas.height) - drawH) / 2) + 15;

    // 1. 실루엣 마스크 생성 (흰색 칼선용)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = drawW;
    maskCanvas.height = drawH;
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.drawImage(cutoutImage, 0, 0, drawW, drawH);
      maskCtx.globalCompositeOperation = 'source-in';
      maskCtx.fillStyle = '#ffffff';
      maskCtx.fillRect(0, 0, drawW, drawH);
    }

    // 2. 칼선 외곽선 + 그림자 레이어 생성
    const outlineCanvas = document.createElement('canvas');
    outlineCanvas.width = canvas.width;
    outlineCanvas.height = canvas.height;
    const outlineCtx = outlineCanvas.getContext('2d');

    if (outlineCtx && maskCtx) {
      const steps = 28;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const ox = drawX + Math.cos(angle) * outlineSize;
        const oy = drawY + Math.sin(angle) * outlineSize;
        outlineCtx.drawImage(maskCanvas, ox, oy);
      }
      // 안쪽 빈틈 메우기
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const ox = drawX + Math.cos(angle) * (outlineSize * 0.5);
        const oy = drawY + Math.sin(angle) * (outlineSize * 0.5);
        outlineCtx.drawImage(maskCanvas, ox, oy);
      }
    }

    // 3. 메인 캔버스에 그림자와 함께 칼선 합성
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.28)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.drawImage(outlineCanvas, 0, 0);
    ctx.restore();

    // 4. 원본 누끼 이미지 그리기
    ctx.drawImage(cutoutImage, drawX, drawY, drawW, drawH);

    // 5. 하단 캡션 스티커 배지 그리기
    if (hasCaption) {
      const theme = COLOR_THEMES.find((t) => t.id === photoThemeId) || COLOR_THEMES[0];
      ctx.font = '900 44px sans-serif';
      const textWidth = ctx.measureText(photoCaption.trim()).width;
      const badgeW = Math.min(660, Math.max(260, textWidth + 90));
      const badgeH = 92;
      const badgeX = (canvas.width - badgeW) / 2;
      const badgeY = 515;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      drawRoundRectOnCtx(ctx, badgeX - 8, badgeY - 8, badgeW + 16, badgeH + 16, 54);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      grad.addColorStop(0, theme.primary);
      grad.addColorStop(1, theme.secondary);
      drawRoundRectOnCtx(ctx, badgeX, badgeY, badgeW, badgeH, 46);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 42px ${stickerFont}, sans-serif`;
      ctx.fillText(photoCaption.trim(), canvas.width / 2, badgeY + 61);
    }

    setPhotoStickerUrl(canvas.toDataURL('image/png'));
  }, [cutoutImage, outlineSize, photoCaption, photoThemeId, stickerFont]);

  // 단축키 Ctrl + V 클립보드 이미지 붙여넣기 지원
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setActiveTab('photo');
            handlePhotoUpload(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  useEffect(() => {
    renderPhotoSticker();
  }, [renderPhotoSticker]);

  // 사진 업로드 및 AI 배경 제거 실행
  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG 등)만 업로드 가능합니다!');
      return;
    }
    setSelectedFile(file);
    setIsProcessingAi(true);
    setAiProgressText('AI 스티커 엔진 준비 중...');

    try {
      const config = {
        model: 'medium' as const,
        progress: (key: string, current: number, total: number) => {
          const percent = Math.round((current / total) * 100);
          if (key.includes('fetch')) {
            setAiProgressText(`AI 모델 불러오는 중... ${percent}%`);
          } else {
            setAiProgressText('배경 오려내고 흰색 칼선 입히는 중... ✂️');
          }
        },
        publicPath: 'https://unpkg.com/@imgly/background-removal-data@1.4.5/dist/',
      };

      const resultBlob = await removeBackground(file, config);
      const url = URL.createObjectURL(resultBlob);
      const img = new window.Image();
      img.onload = () => {
        setCutoutImage(img);
        setIsProcessingAi(false);
        setAiProgressText('');
      };
      img.src = url;
    } catch (err) {
      console.error(err);
      alert('배경 제거 중 오류가 발생했습니다. 다른 사진으로 다시 시도해 주세요.');
      setIsProcessingAi(false);
      setAiProgressText('');
    }
  };

  // 클립보드에 투명 PNG 스티커 복사 (네이버 블로그 Ctrl+V 바로 붙여넣기용)
  const copyCanvasToClipboard = async (
    canvas: HTMLCanvasElement | null,
    setCopied: (v: boolean) => void
  ) => {
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (!blob) throw new Error('Blob creation failed');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      alert(
        '✨ 스티커가 클립보드에 복사되었습니다!\n네이버 블로그 글쓰기 화면에서 그대로 붙여넣기(Ctrl+V) 해보세요!'
      );
    } catch {
      alert(
        '현재 브라우저에서는 이미지 직접 복사가 제한되어 파일로 다운로드합니다.\n다운로드된 PNG 파일을 블로그에 올려주세요!'
      );
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `gifty-sticker-${Date.now()}.png`;
      a.click();
    }
  };

  const downloadDataUrl = (url: string, filename: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredPresets =
    presetCategory === '전체'
      ? PRESETS
      : PRESETS.filter((p) => p.category === presetCategory);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 flex flex-col">
      {/* Navigation */}
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
            <a href="/sticker" className="text-pink-600 font-extrabold hover:text-pink-700 transition-colors">블로그 스티커 🎨</a>
            <a href="/remove-bg" className="hover:text-indigo-600 transition-colors text-purple-600">누끼따기(AI) ✂️</a>
          </div>
          <button
            className="md:hidden text-slate-500 hover:text-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 shadow-md w-full flex flex-col p-4 gap-2 text-sm font-bold absolute top-16 left-0">
            <a href="/" className="text-slate-700 hover:text-indigo-600 p-3 rounded-xl hover:bg-slate-50">홈</a>
            <a href="/community" className="text-indigo-600 hover:bg-indigo-50 p-3 rounded-xl">커뮤니티 💬</a>
            <a href="/experience-diary" className="text-blue-600 hover:bg-blue-50 p-3 rounded-xl">체험단 다이어리 📓</a>
            <a href="/sticker" className="text-pink-600 bg-pink-50 p-3 rounded-xl">블로그 스티커 🎨</a>
            <a href="/remove-bg" className="text-purple-600 hover:bg-purple-50 p-3 rounded-xl">누끼따기(AI) ✂️</a>
          </div>
        )}
      </nav>

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-extrabold mb-3">
            <Wand2 size={14} /> 네이버 블로그 · OGQ 맞춤 규격 지원
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            블로그 스티커 메이커 🎨
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto">
            포토샵 없이 1초 만에 소제목 배지·인증 도장·내 사진 칼선 스티커를 만들고,{' '}
            <strong className="text-indigo-600">복사(Ctrl+V)</strong>해서 네이버 블로그 본문에 바로 붙여넣으세요!
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-slate-200/70 p-1.5 rounded-2xl max-w-xl mx-auto mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'text'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type size={17} />
            1초 완성 소제목 · 도장 스티커
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'photo'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scissors size={17} />
            AI 내 사진 칼선(흰 테두리) 스티커
          </button>
        </div>

        {/* === 탭 1: 텍스트/배지/소제목 스티커 === */}
        {activeTab === 'text' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
            {/* 왼쪽: 미리보기 & 복사/다운로드 */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  실시간 스티커 미리보기 (투명 배경)
                </span>
                <span className="text-[11px] font-bold text-slate-400">740 × 240 px</span>
              </div>

              {/* 투명 체크무늬 배경 */}
              <div
                className="w-full rounded-2xl border border-slate-200 p-4 flex items-center justify-center min-h-[160px] overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              >
                {textStickerUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={textStickerUrl}
                    alt="블로그 스티커 미리보기"
                    className="w-full h-auto object-contain drop-shadow-sm"
                  />
                )}
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => copyCanvasToClipboard(textCanvasRef.current, setCopiedTextSticker)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  {copiedTextSticker ? <Check size={18} /> : <Copy size={18} />}
                  {copiedTextSticker
                    ? '복사 완료! 블로그에 Ctrl+V 하세요'
                    : '클립보드 복사 (블로그에 바로 Ctrl+V)'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadDataUrl(textStickerUrl, `gifty-blog-sticker-${Date.now()}.png`)
                  }
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Download size={15} />
                  투명 배경 PNG 파일로 저장
                </button>
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-3">
                💡 복사 버튼을 누른 뒤 네이버 블로그 글쓰기 창에서 <strong>Ctrl + V</strong>를 누르면 스티커가 바로 들어갑니다!
              </p>
            </div>

            {/* 오른쪽: 프리셋 & 커스텀 설정 */}
            <div className="lg:col-span-7 space-y-6">
              {/* 인기 문구 원클릭 프리셋 */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="text-sm font-extrabold text-slate-800">
                    ⚡ 블로거 단골 스티커 1초 선택
                  </h3>
                  <div className="flex gap-1">
                    {['전체', '소제목', '인증도장', '네임택'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPresetCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          presetCategory === cat
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMainText(preset.text);
                        setSubText(preset.subText);
                        setShape(preset.shape);
                        setThemeId(preset.themeId);
                      }}
                      className={`text-left p-3 rounded-2xl border transition-all hover:border-indigo-300 hover:bg-indigo-50/40 ${
                        mainText === preset.text
                          ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <p className="text-xs font-extrabold text-slate-800 truncate">{preset.text}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{preset.subText}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 문구 및 디자인 직접 수정 */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-sm font-extrabold text-slate-800">🎨 내 마음대로 문구 · 글꼴 · 디자인 바꾸기</h3>

                {/* 1. 감성 글꼴(폰트) 선택 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    스티커 글꼴 (폰트)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Jua' as const, label: '둥글 귀염', fontFam: 'Jua' },
                      { id: 'Gaegu' as const, label: '감성 손글씨', fontFam: 'Gaegu' },
                      { id: 'BlackHanSans' as const, label: '예능 볼드', fontFam: 'BlackHanSans' },
                      { id: 'NanumGothic' as const, label: '깔끔 기본', fontFam: 'NanumGothic' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setStickerFont(f.id)}
                        style={{ fontFamily: f.fontFam }}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          stickerFont === f.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-sm">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 빠른 이모지 클릭 바 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-500">빠른 이모지 삽입 (클릭 시 문구 뒤에 추가)</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['📍', '🕒', '🚗', '🍽️', '✨', '💡', '⭐', '💯', '🎁', '👍', '💬', '📸', '☕', '🍔', '🧾', '⚖️'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setMainText((prev) => `${prev} ${emoji}`.trim())}
                        className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-sm transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      메인 스티커 문구
                    </label>
                    <input
                      type="text"
                      maxLength={24}
                      value={mainText}
                      onChange={(e) => setMainText(e.target.value)}
                      placeholder="예: 📍 찾아가는 길 & 위치"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {shape === 'rating' ? '총평 한 줄 코멘트' : '보조 문구 / 블로그 이름'} <span className="text-slate-400 font-normal">(비워두면 생략)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={32}
                      value={subText}
                      onChange={(e) => setSubText(e.target.value)}
                      placeholder={shape === 'rating' ? '예: 재방문 의사 100%! 강추' : '예: by. 맛동산블로거'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 모양 선택 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">스티커 모양 (6종)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {[
                      { id: 'pill', label: '💊 캡슐 배지' },
                      { id: 'highlighter', label: '📝 형광펜 노트' },
                      { id: 'SpeechBubble', label: '💬 말풍선' },
                      { id: 'stamp', label: '📮 인증 도장' },
                      { id: 'nametag', label: '🎀 리본 네임택' },
                      { id: 'rating', label: '⭐ 별점 총평' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setShape(s.id as StickerShape);
                          if (s.id === 'rating' && !mainText.includes('별점')) {
                            setMainText('⭐ 솔직 방문 별점 총평');
                            setSubText('재방문 의사 100%! 자신 있게 추천');
                          }
                        }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          shape === s.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 별점 스티커 전용 항목 점수 조절 */}
                {shape === 'rating' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <span>⭐ 항목별 별점 점수 설정 (클릭하여 조절)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: '맛 / 퀄리티', score: ratingTaste, setScore: setRatingTaste },
                        { label: '가격 / 가성비', score: ratingPrice, setScore: setRatingPrice },
                        { label: '분위기 / 서비스', score: ratingMood, setScore: setRatingMood },
                      ].map((item, i) => (
                        <div key={i} className="bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-2xs">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                            <span>{item.label}</span>
                            <span className="text-amber-600 font-extrabold">{item.score}.0점</span>
                          </div>
                          <div className="flex gap-1 justify-center">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => item.setScore(val)}
                                className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center transition-all ${
                                  item.score >= val
                                    ? 'bg-amber-400 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 컬러 테마 선택 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">컬러 테마</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {COLOR_THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setThemeId(t.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                          themeId === t.id
                            ? 'border-slate-900 ring-2 ring-slate-900/15 bg-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: t.primary }}
                        />
                        <span className="truncate">{t.label.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === 탭 2: AI 내 사진 칼선(흰 테두리) 굿즈 스티커 === */}
        {activeTab === 'photo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
            {/* 왼쪽: 업로드 또는 스티커 미리보기 */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-600" />
                  나만의 사진 칼선 스티커 (OGQ 740×640 규격)
                </span>
                {selectedFile && !isProcessingAi && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    다른 사진 올리기
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhotoUpload(f);
                }}
                className="hidden"
              />

              {!cutoutImage && !isProcessingAi ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-80 border-4 border-dashed border-pink-200 hover:border-pink-400 bg-pink-50/30 hover:bg-pink-50/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all p-6 text-center"
                >
                  <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Upload size={30} />
                  </div>
                  <p className="text-base font-extrabold text-slate-800 mb-1">
                    스티커로 만들 사진을 올려주세요!
                  </p>
                  <div className="flex items-center gap-1.5 my-2 px-3 py-1 bg-white border border-pink-200 rounded-full text-xs font-semibold text-slate-600 shadow-2xs">
                    <span>💡 캡처 후</span>
                    <kbd className="px-1.5 py-0.5 bg-pink-50 border border-pink-300 rounded text-pink-600 font-extrabold">Ctrl + V</kbd>
                    <span>로 바로 붙여넣기도 가능해요!</span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs">
                    반려동물, 내 캐릭터, 음식, 제품 사진을 올리면 AI가 배경을 지우고 도톰한 흰색 칼선 테두리를 자동으로 입혀줍니다.
                  </p>
                </div>
              ) : isProcessingAi ? (
                <div className="w-full h-80 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
                  <Loader2 className="animate-spin text-pink-600 mb-3" size={36} />
                  <p className="text-sm font-extrabold text-slate-800">{aiProgressText}</p>
                  <p className="text-xs text-slate-400 mt-1">최초 실행 시 AI 모델 로드에 몇 초 정도 걸릴 수 있습니다.</p>
                </div>
              ) : (
                <>
                  <div
                    className="w-full rounded-2xl border border-slate-200 p-4 flex items-center justify-center min-h-[300px] overflow-hidden"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    }}
                  >
                    {photoStickerUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoStickerUrl}
                        alt="사진 칼선 스티커"
                        className="max-h-[320px] w-auto object-contain"
                      />
                    )}
                  </div>

                  <div className="mt-5 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => copyCanvasToClipboard(photoCanvasRef.current, setCopiedPhotoSticker)}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      {copiedPhotoSticker ? <Check size={18} /> : <Copy size={18} />}
                      {copiedPhotoSticker
                        ? '복사 완료! 블로그에 Ctrl+V 하세요'
                        : '사진 스티커 복사 (블로그에 바로 Ctrl+V)'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadDataUrl(photoStickerUrl, `gifty-photo-sticker-${Date.now()}.png`)
                      }
                      className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Download size={15} />
                      투명 PNG 저장 (네이버 OGQ 740×640 규격)
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 오른쪽: 칼선 두께 & 하단 캡션 문구 설정 */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-sm font-extrabold text-slate-800">✂️ 칼선 테두리 & 스티커 문구 꾸미기</h3>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>흰색 스티커 칼선 두께</span>
                  <span className="text-pink-600">{outlineSize}px</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={28}
                  step={2}
                  value={outlineSize}
                  onChange={(e) => setOutlineSize(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  스티커 하단 캡션 문구 <span className="text-slate-400 font-normal">(비워두면 사진만 표시)</span>
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="예: 내돈내산 👍"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {PHOTO_CAPTION_PRESETS.map((cap, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPhotoCaption(cap)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        photoCaption === cap
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cap === '' ? '문구 없음' : cap}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">캡션 배지 컬러</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COLOR_THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPhotoThemeId(t.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        photoThemeId === t.id
                          ? 'border-slate-900 ring-2 ring-slate-900/15 bg-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: t.primary }}
                      />
                      <span className="truncate">{t.label.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 블로그 감성 소품 & 무료 운영 응원 쿠팡 카드 */}
        <div className="mt-8">
          <CoupangSupportCard category="sticker" />
        </div>

        {/* 쿠팡 파트너스 배너 */}
        {isLoaded && (settings.coupangBannerHtml || settings.coupangBannerHtmlMobile) && (
          <div className="mt-10 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center overflow-hidden">
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
        )}

        {/* SEO 보존용: 하단 블로그 & 움짤 꿀팁 가이드 링크 영역 */}
        <section className="mt-12 pt-8 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
              <BookOpen size={16} className="text-indigo-600" />
              함께 읽으면 좋은 블로거 필수 꿀팁 가이드
            </h2>
            <Link href="/guide" className="text-xs font-bold text-indigo-600 hover:underline">
              전체 보기 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/guide/naver-blog-limit"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors"
            >
              <p className="text-xs font-extrabold text-slate-800 line-clamp-1">
                네이버 블로그 움짤 20MB 제한 완벽 해결법
              </p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                화질 깨짐 없이 용량만 쏙 줄이는 비법
              </p>
            </Link>
            <Link
              href="/guide/gif-marketing-seo"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors"
            >
              <p className="text-xs font-extrabold text-slate-800 line-clamp-1">
                블로그 체류시간 2배 늘리는 움짤 SEO 전략
              </p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                독자의 시선을 사로잡고 상위노출 확률 높이기
              </p>
            </Link>
            <Link
              href="/guide/high-quality-gif"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors"
            >
              <p className="text-xs font-extrabold text-slate-800 line-clamp-1">
                무설치로 동영상을 고화질 GIF로 바꾸는 방법
              </p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                최신 WebAssembly 로컬 변환 기술 소개
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
