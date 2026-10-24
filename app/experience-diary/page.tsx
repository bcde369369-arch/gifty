'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Calendar as CalendarIcon, Calculator, Link as LinkIcon, ArrowLeft, Plus, X, ChevronLeft, ChevronRight, Menu, Download, Upload, Share2, Copy, Image as ImageIcon, EyeOff, Eye, MessageSquareHeart, Zap, ClipboardPaste, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CoupangBanner from '@/components/CoupangBanner';
import { useSiteSettings } from '@/lib/settings';
import {
  parseCampaignsFromText,
  parseSingleCampaignBlock,
  getQuickImportBookmarklet,
  getSampleCampaignText,
  ParsedCampaign,
} from '@/lib/campaignParser';

interface Schedule {
  id: string;
  title: string;
  platform?: string;      // 체험단 플랫폼/출처 (예: 레뷰, 리뷰노트, 강남맛집, 포포몬 등)
  visitDate: string;
  deadlineDate: string;
  benefitAmount?: number; // 제공받은 혜택 (식사권/제품 등)
  cashAmount?: number;    // 원고료/지원금 (현금 수익)
  extraExpense?: number;  // 추가 지출 (내돈내산)
}

const POPULAR_PLATFORMS = ['리뷰노트', '강남맛집', '디너의여왕', '레뷰', '포포몬', '미블', '포블로그', '서울오빠', '인스타협찬', '기타'];

export default function ExperienceDiary() {
  const { settings, isLoaded } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<'schedule' | 'ledger' | 'sites'>('schedule');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 폼 상태
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);
  const [newVisitDate, setNewVisitDate] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newCash, setNewCash] = useState('');
  const [newExpense, setNewExpense] = useState('');

  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string | null>(null);

  // ⚡ 리뷰노트/카톡 당첨 1초 자동등록 모달 상태
  const [isAutoImportModalOpen, setIsAutoImportModalOpen] = useState(false);
  const [autoImportText, setAutoImportText] = useState('');
  const [parsedPreviewList, setParsedPreviewList] = useState<ParsedCampaign[]>([]);
  const [quickPasteFeedback, setQuickPasteFeedback] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('gifty_schedules');
    if (saved) {
      setSchedules(JSON.parse(saved));
    }
    // 기본 선택을 빈 값('')으로 두어 접속 시 전체 일정이 바로 보이도록 설정
    setSelectedDate('');

    // URL 파라미터(?autoImport=...)로 전달된 당첨 내역이 있으면 즉시 자동분석 모달 오픈
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const importedText = params.get('autoImport');
      if (importedText && importedText.trim()) {
        setAutoImportText(importedText);
        setParsedPreviewList(parseCampaignsFromText(importedText));
        setIsAutoImportModalOpen(true);
        window.history.replaceState({}, '', '/experience-diary');
      }
    }
  }, []);

  // 자동등록 텍스트 변경 시 실시간 분석
  const handleAutoImportTextChange = (text: string) => {
    setAutoImportText(text);
    setParsedPreviewList(parseCampaignsFromText(text));
  };

  // 클립보드에서 바로 읽어와 자동 분석
  const handlePasteFromClipboard = async (applyDirectlyToForm = false) => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText || !clipText.trim()) {
        alert('클립보드에 복사된 텍스트가 없습니다.\n리뷰노트 당첨 카톡이나 마이페이지 내역을 먼저 복사해 주세요!');
        return;
      }
      if (applyDirectlyToForm) {
        const parsed = parseSingleCampaignBlock(clipText);
        if (parsed) {
          applyParsedCampaignToForm(parsed);
          setQuickPasteFeedback(`✨ '${parsed.title}' 정보가 자동으로 채워졌습니다!`);
          setTimeout(() => setQuickPasteFeedback(''), 4000);
        }
      } else {
        handleAutoImportTextChange(clipText);
      }
    } catch {
      alert('브라우저 권한 설정으로 인해 아래 입력창에 직접 붙여넣기(Ctrl+V 또는 길게 눌러 붙여넣기) 해주세요!');
    }
  };

  // 파싱된 단일 캠페인 데이터를 등록 모달 폼에 채우기
  const applyParsedCampaignToForm = (parsed: ParsedCampaign) => {
    setNewTitle(parsed.title);
    if (parsed.platform && !POPULAR_PLATFORMS.includes(parsed.platform)) {
      setNewPlatform('');
      setCustomPlatform(parsed.platform);
      setIsCustomPlatform(true);
    } else {
      setNewPlatform(parsed.platform || '리뷰노트');
      setCustomPlatform('');
      setIsCustomPlatform(false);
    }
    if (parsed.visitDate) setNewVisitDate(parsed.visitDate);
    if (parsed.deadlineDate) setNewDeadlineDate(parsed.deadlineDate);
    if (parsed.benefitAmount > 0) setNewBenefit(String(parsed.benefitAmount));
    if (parsed.cashAmount > 0) setNewCash(String(parsed.cashAmount));
  };

  // 플랫폼별 알림톡 샘플 예시 채우기
  const handleFillSample = (plat = 'all') => {
    handleAutoImportTextChange(getSampleCampaignText(plat));
  };

  // 분석된 캠페인 목록을 내 일정에 원클릭 일괄 등록
  const handleConfirmAutoImport = () => {
    if (parsedPreviewList.length === 0) {
      alert('먼저 당첨 카톡 메시지나 리뷰노트 당첨 내역을 붙여넣어 주세요!');
      return;
    }

    const nowTs = Date.now();
    const newItems: Schedule[] = parsedPreviewList.map((item, idx) => ({
      id: `${nowTs}_${idx}`,
      title: item.title,
      platform: item.platform || '리뷰노트',
      visitDate: item.visitDate || '',
      deadlineDate: item.deadlineDate,
      benefitAmount: item.benefitAmount || 0,
      cashAmount: item.cashAmount || 0,
      extraExpense: 0,
    }));

    const updated = [...newItems, ...schedules];
    setSchedules(updated);
    localStorage.setItem('gifty_schedules', JSON.stringify(updated));

    setAutoImportText('');
    setParsedPreviewList([]);
    setIsAutoImportModalOpen(false);
    alert(`🎉 총 ${newItems.length}건의 체험단 당첨 내역이 다이어리와 가계부에 자동 등록되었습니다!`);
  };

  // 1. 데이터 백업 (JSON 파일 다운로드)
  const handleExportBackup = () => {
    if (schedules.length === 0) {
      alert('백업할 일정 데이터가 없습니다.');
      return;
    }
    const dataStr = JSON.stringify(schedules, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    a.href = url;
    a.download = `gifty-schedules-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`총 ${schedules.length}개의 일정이 백업 파일로 안전하게 다운로드되었습니다!\n브라우저를 변경하거나 폰을 바꿀 때 [복원하기]로 불러올 수 있습니다.`);
  };

  // 2. 데이터 복원 (JSON 파일 불러오기 & 병합)
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          throw new Error('올바른 백업 파일 형식이 아닙니다.');
        }

        const validSchedules: Schedule[] = parsed.filter(item => item && item.id && item.title && item.deadlineDate);

        if (validSchedules.length === 0) {
          alert('가져올 유효한 일정이 백업 파일에 없습니다.');
          return;
        }

        // 기존 데이터와 중복되지 않는 것만 병합
        const merged = [...validSchedules, ...schedules.filter(s => !validSchedules.some(v => v.id === s.id))];

        setSchedules(merged);
        localStorage.setItem('gifty_schedules', JSON.stringify(merged));
        alert(`🎉 총 ${merged.length}개의 일정이 성공적으로 복원/병합되었습니다!`);
      } catch (err: unknown) {
        console.error(err);
        alert('파일을 불러오는 중 오류가 발생했습니다. gifty 백업(.json) 파일인지 확인해 주세요.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewTitle('');
    setNewPlatform('');
    setCustomPlatform('');
    setIsCustomPlatform(false);
    setNewVisitDate('');
    setNewDeadlineDate('');
    setNewBenefit('');
    setNewCash('');
    setNewExpense('');
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setNewTitle(schedule.title);
    const plat = schedule.platform || '';
    if (plat && !POPULAR_PLATFORMS.includes(plat)) {
      setNewPlatform('');
      setCustomPlatform(plat);
      setIsCustomPlatform(true);
    } else {
      setNewPlatform(plat);
      setCustomPlatform('');
      setIsCustomPlatform(false);
    }
    setNewVisitDate(schedule.visitDate || '');
    setNewDeadlineDate(schedule.deadlineDate || '');
    setNewBenefit(schedule.benefitAmount ? String(schedule.benefitAmount) : '');
    setNewCash(schedule.cashAmount ? String(schedule.cashAmount) : '');
    setNewExpense(schedule.extraExpense ? String(schedule.extraExpense) : '');
    setIsModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDeadlineDate) return alert('캠페인 이름과 포스팅 마감일은 필수입니다!');

    const benefitAmount = newBenefit ? parseInt(newBenefit.replace(/,/g, ''), 10) : 0;
    const cashAmount = newCash ? parseInt(newCash.replace(/,/g, ''), 10) : 0;
    const extraExpense = newExpense ? parseInt(newExpense.replace(/,/g, ''), 10) : 0;
    const platformToSave = isCustomPlatform ? customPlatform.trim() : newPlatform.trim();

    let updated;
    if (editingId) {
      updated = schedules.map(s => s.id === editingId ? {
        ...s,
        title: newTitle,
        platform: platformToSave || undefined,
        visitDate: newVisitDate,
        deadlineDate: newDeadlineDate,
        benefitAmount,
        cashAmount,
        extraExpense
      } : s);
    } else {
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        title: newTitle,
        platform: platformToSave || undefined,
        visitDate: newVisitDate,
        deadlineDate: newDeadlineDate,
        benefitAmount,
        cashAmount,
        extraExpense,
      };
      updated = [newSchedule, ...schedules];
    }

    setSchedules(updated);
    localStorage.setItem('gifty_schedules', JSON.stringify(updated));
    
    // 초기화
    setEditingId(null);
    setNewTitle('');
    setNewPlatform('');
    setCustomPlatform('');
    setIsCustomPlatform(false);
    setNewVisitDate('');
    setNewDeadlineDate('');
    setNewBenefit('');
    setNewCash('');
    setNewExpense('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    localStorage.setItem('gifty_schedules', JSON.stringify(updated));
  };

  // 캘린더 로직
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const formatDateString = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const filteredSchedules = selectedDate 
    ? schedules.filter(s => s.visitDate === selectedDate || s.deadlineDate === selectedDate)
    : schedules;

  // 금액 계산 (전체 일정 기준 - 상단 요약용)
  const totalBenefit = schedules.reduce((acc, cur) => acc + (cur.benefitAmount || 0), 0);
  const totalCash = schedules.reduce((acc, cur) => acc + (cur.cashAmount || 0), 0);
  const totalExpense = schedules.reduce((acc, cur) => acc + (cur.extraExpense || 0), 0);
  const netTotal = totalBenefit + totalCash - totalExpense;

  // 금액 및 건수 계산 (선택된 월 기준 - 가계부 탭용)
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthlySchedules = schedules.filter(s => {
    const d = s.visitDate || s.deadlineDate;
    return d && d.startsWith(currentMonthStr);
  });
  const monthlyCount = monthlySchedules.length;
  const monthlyBenefit = monthlySchedules.reduce((acc, cur) => acc + (cur.benefitAmount || 0), 0);
  const monthlyCash = monthlySchedules.reduce((acc, cur) => acc + (cur.cashAmount || 0), 0);
  const monthlyExpense = monthlySchedules.reduce((acc, cur) => acc + (cur.extraExpense || 0), 0);
  const monthlyNetProfit = monthlyBenefit + monthlyCash - monthlyExpense;
  const avgPerCase = monthlyCount > 0 ? Math.round((monthlyBenefit + monthlyCash) / monthlyCount) : 0;

  // 플랫폼별 횟수 집계
  const platformStats = monthlySchedules.reduce((acc, cur) => {
    const p = cur.platform?.trim() || '미지정';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedPlatformStats = Object.entries(platformStats).sort((a, b) => b[1] - a[1]);

  // 플랫폼 필터 적용된 가계부 목록
  const displayedMonthlySchedules = selectedPlatformFilter
    ? monthlySchedules.filter(s => (s.platform?.trim() || '미지정') === selectedPlatformFilter)
    : monthlySchedules;

  // SNS 정산 공유 모달 상태
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareNickname, setShareNickname] = useState('');
  const [shareTheme, setShareTheme] = useState<'indigo' | 'receipt' | 'dark'>('indigo');
  const [hideAmounts, setHideAmounts] = useState(false);
  const [shareCardUrl, setShareCardUrl] = useState<string>('');
  const shareCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const formatMoney = useCallback(
    (amount: number, prefix = '') => {
      if (hideAmounts) return `${prefix}***,***원`;
      return `${prefix}${amount.toLocaleString()}원`;
    },
    [hideAmounts]
  );

  // 정산 요약 텍스트 생성 (카톡 / 스레드 / 인스타 캡션용)
  const getShareTextSummary = useCallback(() => {
    const ownerPrefix = shareNickname.trim() ? `${shareNickname.trim()}님의 ` : '';
    const topPlatforms =
      sortedPlatformStats.length > 0
        ? sortedPlatformStats
            .slice(0, 4)
            .map(([name, cnt]) => `${name}(${cnt}건)`)
            .join(', ')
        : '기록 없음';

    const lines = [
      `📊 [${ownerPrefix}${year}년 ${month + 1}월 체험단 정산 결산]`,
      ``,
      `🎯 총 완주 캠페인: ${monthlyCount}건${!hideAmounts && monthlyCount > 0 ? ` (건당 평균 ${avgPerCase.toLocaleString()}원)` : ''}`,
      `🎁 방어한 식비·제품 혜택: ${formatMoney(monthlyBenefit, '+')}`,
      `💸 받은 원고료·지원금: ${formatMoney(monthlyCash, '+')}`,
      ...(monthlyExpense > 0 ? [`💳 내돈내산 추가 지출: ${formatMoney(monthlyExpense, '-')}`] : []),
      `🏷️ 진행 플랫폼: ${topPlatforms}`,
      `✨ 이번 달 순이득: ${
        hideAmounts
          ? `총 ${monthlyCount}건 완주 성공! 🔥`
          : monthlyNetProfit >= 0
          ? `+${monthlyNetProfit.toLocaleString()}원`
          : `-${Math.abs(monthlyNetProfit).toLocaleString()}원`
      }`,
      ``,
      `📓 블로거 무료 체험단 가계부 & 움짤 제작 👉 https://gifty.run/experience-diary`,
    ];
    return lines.join('\n');
  }, [
    shareNickname,
    sortedPlatformStats,
    year,
    month,
    monthlyCount,
    hideAmounts,
    avgPerCase,
    formatMoney,
    monthlyBenefit,
    monthlyCash,
    monthlyExpense,
    monthlyNetProfit,
  ]);

  // Canvas로 정산 리포트 카드 이미지(1080x1350) 생성
  useEffect(() => {
    if (!isShareModalOpen) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    shareCanvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // 1. 배경 그리기
    if (shareTheme === 'indigo') {
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
      bgGrad.addColorStop(0, '#312e81');
      bgGrad.addColorStop(0.5, '#4f46e5');
      bgGrad.addColorStop(1, '#9333ea');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      // 장식 빛망울
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(920, 180, 260, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(160, 1180, 300, 0, Math.PI * 2);
      ctx.fill();
    } else if (shareTheme === 'receipt') {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, 1080, 1350);
    } else {
      const darkGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
      darkGrad.addColorStop(0, '#090d16');
      darkGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, 1080, 1350);
    }

    // 2. 메인 카드 프레임
    const cardX = 70;
    const cardY = 80;
    const cardW = 940;
    const cardH = 1190;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 45;
    ctx.shadowOffsetY = 20;
    drawRoundRect(cardX, cardY, cardW, cardH, 48);
    ctx.fillStyle = shareTheme === 'dark' ? '#111827' : '#ffffff';
    ctx.fill();
    ctx.restore();

    if (shareTheme === 'dark') {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 3;
      drawRoundRect(cardX, cardY, cardW, cardH, 48);
      ctx.stroke();
    }

    const textPrimary = shareTheme === 'dark' ? '#f8fafc' : '#0f172a';
    const textSecondary = shareTheme === 'dark' ? '#94a3b8' : '#64748b';

    // 3. 상단 배지 & 타이틀
    drawRoundRect(cardX + 60, cardY + 60, 320, 52, 26);
    ctx.fillStyle = shareTheme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : '#eef2ff';
    ctx.fill();

    ctx.fillStyle = shareTheme === 'dark' ? '#818cf8' : '#4f46e5';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ GIFTY MONTHLY REPORT', cardX + 220, cardY + 94);

    ctx.textAlign = 'left';
    ctx.fillStyle = textSecondary;
    ctx.font = 'bold 30px sans-serif';
    const nickLabel = shareNickname.trim()
      ? `${shareNickname.trim()}님의 월간 체험단 리포트`
      : '블로거 월간 체험단 정산 리포트';
    ctx.fillText(nickLabel, cardX + 60, cardY + 175);

    ctx.fillStyle = textPrimary;
    ctx.font = '900 60px sans-serif';
    ctx.fillText(`${year}년 ${month + 1}월 정산 결산`, cardX + 60, cardY + 250);

    // 4. 메인 하이라이트 박스 (순이득)
    drawRoundRect(cardX + 60, cardY + 295, cardW - 120, 210, 32);
    const heroGrad = ctx.createLinearGradient(cardX + 60, cardY + 295, cardX + cardW - 60, cardY + 505);
    heroGrad.addColorStop(0, '#4f46e5');
    heroGrad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = heroGrad;
    ctx.fill();

    ctx.fillStyle = '#e0e7ff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(hideAmounts ? '🎯 이번 달 체험단 완주 기록' : '💰 이번 달 총 순이득 (혜택 + 원고료 - 지출)', cardX + 100, cardY + 358);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 72px sans-serif';
    const heroValueText = hideAmounts
      ? `총 ${monthlyCount}건 완주 성공! 🔥`
      : monthlyNetProfit >= 0
      ? `+${monthlyNetProfit.toLocaleString()}원`
      : `-${Math.abs(monthlyNetProfit).toLocaleString()}원`;
    ctx.fillText(heroValueText, cardX + 100, cardY + 455);

    // 5. 4대 핵심 지표 그리드 (2x2)
    const boxes = [
      {
        label: '🎯 총 체험 건수',
        value: `${monthlyCount}건`,
        sub: !hideAmounts && monthlyCount > 0 ? `건당 평균 ${avgPerCase.toLocaleString()}원` : '꾸준한 리뷰 기록',
        bg: shareTheme === 'dark' ? '#1e293b' : '#f8fafc',
        color: shareTheme === 'dark' ? '#a5b4fc' : '#4338ca',
      },
      {
        label: '🎁 제공 혜택 (식비/제품)',
        value: formatMoney(monthlyBenefit, '+'),
        sub: '방어한 생활비·식비',
        bg: shareTheme === 'dark' ? '#1e293b' : '#f0fdf4',
        color: shareTheme === 'dark' ? '#4ade80' : '#15803d',
      },
      {
        label: '💸 현금 지원금 (원고료)',
        value: formatMoney(monthlyCash, '+'),
        sub: '현금 수익·페이백',
        bg: shareTheme === 'dark' ? '#1e293b' : '#eff6ff',
        color: shareTheme === 'dark' ? '#60a5fa' : '#1d4ed8',
      },
      {
        label: '💳 내돈내산 추가 지출',
        value: formatMoney(monthlyExpense, '-'),
        sub: '초과 결제 금액',
        bg: shareTheme === 'dark' ? '#1e293b' : '#fef2f2',
        color: shareTheme === 'dark' ? '#f87171' : '#b91c1c',
      },
    ];

    const boxW = (cardW - 150) / 2;
    const boxH = 185;
    boxes.forEach((b, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = cardX + 60 + col * (boxW + 30);
      const by = cardY + 540 + row * (boxH + 25);

      drawRoundRect(bx, by, boxW, boxH, 28);
      ctx.fillStyle = b.bg;
      ctx.fill();

      ctx.fillStyle = textSecondary;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(b.label, bx + 32, by + 52);

      ctx.fillStyle = b.color;
      ctx.font = '900 44px sans-serif';
      ctx.fillText(b.value, bx + 32, by + 115);

      ctx.fillStyle = textSecondary;
      ctx.font = '600 20px sans-serif';
      ctx.fillText(b.sub, bx + 32, by + 155);
    });

    // 6. 플랫폼별 진행 통계 바
    const platBoxY = cardY + 965;
    drawRoundRect(cardX + 60, platBoxY, cardW - 120, 125, 24);
    ctx.fillStyle = shareTheme === 'dark' ? '#1e293b' : '#f8fafc';
    ctx.fill();

    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('🏷️ 이번 달 주요 플랫폼', cardX + 90, platBoxY + 46);

    const topPlats =
      sortedPlatformStats.length > 0
        ? sortedPlatformStats
            .slice(0, 4)
            .map(([name, cnt]) => `${name} ${cnt}건 (${Math.round((cnt / Math.max(1, monthlyCount)) * 100)}%)`)
            .join('   |   ')
        : '등록된 플랫폼 내역이 없습니다';

    ctx.fillStyle = shareTheme === 'dark' ? '#cbd5e1' : '#475569';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(topPlats, cardX + 90, platBoxY + 92);

    // 7. 하단 Gifty 브랜딩 워터마크
    ctx.fillStyle = textSecondary;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪄 블로거 필수 움짤 변환기 & 체험단 다이어리  •  gifty.run', 540, cardY + cardH - 35);

    setShareCardUrl(canvas.toDataURL('image/png'));
  }, [
    isShareModalOpen,
    shareNickname,
    shareTheme,
    hideAmounts,
    year,
    month,
    monthlyCount,
    monthlyNetProfit,
    avgPerCase,
    monthlyBenefit,
    monthlyCash,
    monthlyExpense,
    sortedPlatformStats,
    formatMoney,
  ]);

  // 이미지 다운로드 핸들러
  const handleDownloadShareCard = () => {
    if (!shareCardUrl) return;
    const a = document.createElement('a');
    a.href = shareCardUrl;
    a.download = `gifty-report-${year}-${String(month + 1).padStart(2, '0')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 모바일/브라우저 네이티브 SNS 공유 (이미지 + 텍스트)
  const handleNativeShare = async () => {
    const summaryText = getShareTextSummary();
    try {
      if (shareCanvasRef.current && navigator.share) {
        const blob = await new Promise<Blob | null>((resolve) =>
          shareCanvasRef.current?.toBlob((b) => resolve(b), 'image/png')
        );
        if (blob) {
          const file = new File([blob], `gifty-report-${year}-${month + 1}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${year}년 ${month + 1}월 체험단 정산 결산`,
              text: summaryText,
              files: [file],
            });
            return;
          }
        }
        await navigator.share({
          title: `${year}년 ${month + 1}월 체험단 정산 결산`,
          text: summaryText,
          url: 'https://gifty.run/experience-diary',
        });
        return;
      }
    } catch (err) {
      console.warn('Native share cancelled or failed:', err);
      return;
    }

    // PC 등 Web Share 미지원 시 이미지 다운로드 + 텍스트 복사 동시 수행
    handleDownloadShareCard();
    await navigator.clipboard.writeText(summaryText).catch(() => {});
    alert('정산 리포트 이미지가 다운로드되었고, SNS 공유 문구가 복사되었습니다!\n인스타그램·스레드·블로그·단톡방에 바로 붙여넣어 보세요 ✨');
  };

  // 카톡 / 스레드 / 인스타용 텍스트 복사
  const handleCopyShareText = () => {
    const text = getShareTextSummary();
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 SNS용 정산 요약 문구가 복사되었습니다!\n카카오톡, 스레드(Threads), 인스타그램 등에 바로 붙여넣기(Ctrl+V) 해보세요.');
    });
  };

  // 네이버 블로그 에디터용 HTML 디자인 표 복사
  const handleCopyNaverBlogHtml = () => {
    const ownerPrefix = shareNickname.trim() ? `${shareNickname.trim()}님의 ` : '';
    const topPlats =
      sortedPlatformStats.length > 0
        ? sortedPlatformStats.map(([name, cnt]) => `${name} ${cnt}건`).join(', ')
        : '-';
    const netText = hideAmounts
      ? `총 ${monthlyCount}건 완주 성공!`
      : `${monthlyNetProfit >= 0 ? '+' : '-'}${Math.abs(monthlyNetProfit).toLocaleString()}원`;

    const htmlString = `
<div style="max-width:560px;margin:24px auto;padding:24px;border:2px solid #e0e7ff;border-radius:20px;background-color:#f8fafc;font-family:sans-serif;">
  <p style="margin:0 0 6px 0;font-size:12px;font-weight:bold;color:#4f46e5;">✨ GIFTY MONTHLY REPORT</p>
  <h3 style="margin:0 0 16px 0;font-size:20px;font-weight:800;color:#0f172a;">📊 ${ownerPrefix}${year}년 ${month + 1}월 체험단 정산 결산</h3>
  <table style="width:100%;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <tbody>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:14px;font-weight:bold;">🎯 총 완주 건수</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:15px;font-weight:800;text-align:right;">${monthlyCount}건</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:14px;font-weight:bold;">🎁 제공 혜택 (식비/협찬)</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#15803d;font-size:15px;font-weight:800;text-align:right;">${formatMoney(monthlyBenefit, '+')}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:14px;font-weight:bold;">💸 지원금 (원고료/페이백)</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#1d4ed8;font-size:15px;font-weight:800;text-align:right;">${formatMoney(monthlyCash, '+')}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:14px;font-weight:bold;">🏷️ 진행 플랫폼</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14px;font-weight:bold;text-align:right;">${topPlats}</td>
      </tr>
      <tr style="background-color:#eef2ff;">
        <td style="padding:14px 16px;color:#312e81;font-size:15px;font-weight:800;">💰 이번 달 순이득</td>
        <td style="padding:14px 16px;color:#4f46e5;font-size:18px;font-weight:900;text-align:right;">${netText}</td>
      </tr>
    </tbody>
  </table>
  <p style="margin:14px 0 0 0;text-align:center;font-size:12px;color:#64748b;">
    이 정산표는 블로거 필수 도구 <a href="https://gifty.run/experience-diary" target="_blank" style="color:#4f46e5;font-weight:bold;text-decoration:underline;">Gifty 체험단 다이어리</a>에서 자동 계산되었습니다.
  </p>
</div>`;

    try {
      const htmlBlob = new Blob([htmlString], { type: 'text/html' });
      const textBlob = new Blob([getShareTextSummary()], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
      navigator.clipboard.write([item]).then(() => {
        alert('💚 네이버 블로그용 정산 요약표(HTML)가 복사되었습니다!\n블로그 글쓰기 에디터에 그대로 붙여넣기(Ctrl+V) 하시면 표가 예쁘게 들어갑니다.');
      });
    } catch {
      handleCopyShareText();
    }
  };

  // Gifty 커뮤니티에 1초 자랑하기 (자동 초안 전달)
  const handleShareToCommunity = () => {
    const topPlats =
      sortedPlatformStats.length > 0
        ? sortedPlatformStats.map(([name, cnt]) => `- ${name}: ${cnt}건`).join('\n')
        : '- 플랫폼 미지정';

    const draft = {
      category: 'settlement',
      author: shareNickname.trim() || '',
      title: `🎉 ${year}년 ${month + 1}월 체험단 ${monthlyCount}건 완주! ${
        hideAmounts ? '월간 결산 후기' : `순이득 +${monthlyNetProfit.toLocaleString()}원 정산 후기`
      }`,
      content: `안녕하세요! Gifty 체험단 가계부로 정리한 ${year}년 ${month + 1}월 정산 결산 공유합니다 :)\n\n📊 [${month + 1}월 정산 요약]\n- 총 완주 건수: ${monthlyCount}건\n- 제공받은 혜택(식사/제품): ${formatMoney(monthlyBenefit, '+')}\n- 현금 원고료/지원금: ${formatMoney(monthlyCash, '+')}\n- 내돈내산 추가 지출: ${formatMoney(monthlyExpense, '-')}\n- ✨ 이번 달 순이득: ${
        hideAmounts ? '비공개' : `+${monthlyNetProfit.toLocaleString()}원`
      }\n\n🏷️ [플랫폼별 진행 내역]\n${topPlats}\n\n다들 이번 달 체험단 정산 어떠셨나요? 모두 파이팅하세요! 🔥`,
    };

    sessionStorage.setItem('gifty_community_draft', JSON.stringify(draft));
    router.push('/community');
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 pb-20">
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-800">
                체험단 다이어리 📓
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="/" className="hover:text-indigo-600 transition-colors">홈</a>
            <a href="/community" className="hover:text-indigo-600 transition-colors text-indigo-600 font-extrabold flex items-center gap-1">커뮤니티 💬</a>
            <a href="/experience-diary" className="hover:text-indigo-600 transition-colors text-blue-600">체험단 다이어리 📓</a>
            <a href="/sticker" className="hover:text-pink-700 transition-colors text-pink-600 font-extrabold">블로그 스티커 🎨</a>
            <a href="/remove-bg" className="hover:text-indigo-600 transition-colors text-purple-600">누끼따기(AI) ✂️</a>
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

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">블로거를 위한 체험단 다이어리</h1>
            <p className="text-slate-500">일정 관리부터 가계부 작성, 유용한 사이트 모음까지 한 번에 해결하세요!</p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-5 py-4 rounded-2xl flex items-center gap-4 border border-indigo-100">
            <div className="bg-white p-3 rounded-xl shadow-sm"><Sparkles size={24} className="text-indigo-500"/></div>
            <div className="text-left">
              <p className="text-sm font-bold text-indigo-500 mb-0.5">총 이득 금액 (순수익)</p>
              <p className="text-2xl font-black">{netTotal.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarIcon size={18} /> 내 일정
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'ledger' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calculator size={18} /> 가계부
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'sites' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon size={18} /> 체험단 모음
          </button>
        </div>

        {/* 데이터 안심 백업 & 복원 유틸리티 바 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200/80 px-5 py-3.5 rounded-2xl mb-6 shadow-sm">
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold">🛡️</span>
            <div>
              <p className="font-bold text-slate-800">데이터 유실 방지 안심 보관함</p>
              <p className="text-[11px] text-slate-500">브라우저 캐시 삭제나 폰/PC 기기 변경에 대비해 내 컴퓨터/스마트폰에 백업해두세요.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleExportBackup}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <Download size={14} /> 데이터 백업 📥
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <Upload size={14} /> 데이터 복원 📤
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-[400px]">
          
          {/* 1. Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
                <h2 className="text-xl font-bold text-slate-800">📅 내 일정</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAutoImportModalOpen(true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-extrabold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
                  >
                    <Zap size={15} /> 당첨 카톡·내역 1초 자동등록
                  </button>
                  <button 
                    onClick={openAddModal}
                    className="flex items-center gap-1 bg-indigo-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl hover:bg-indigo-700 transition active:scale-95"
                  >
                    <Plus size={16} /> 직접 추가
                  </button>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8 select-none">
                <div className="flex justify-between items-center mb-4 px-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><ChevronLeft size={20}/></button>
                  <h3 className="font-bold text-lg text-slate-800">{year}년 {month + 1}월</h3>
                  <button onClick={nextMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><ChevronRight size={20}/></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                  <div className="text-red-400">일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div className="text-blue-400">토</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((d, i) => {
                    if (!d) return <div key={i} className="aspect-square"></div>;
                    const dateStr = formatDateString(d);
                    const isSelected = selectedDate === dateStr;
                    const isToday = formatDateString(new Date()) === dateStr;
                    
                    const hasVisit = schedules.some(s => s.visitDate === dateStr);
                    const hasDeadline = schedules.some(s => s.deadlineDate === dateStr);

                    return (
                      <button 
                        key={i} 
                        onClick={() => setSelectedDate(isSelected ? '' : dateStr)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all relative ${
                          isSelected ? 'bg-indigo-600 text-white shadow-md' 
                          : isToday ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold' 
                          : 'hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {d.getDate()}
                        <div className="flex gap-1 mt-1">
                          {hasVisit && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`}></div>}
                          {hasDeadline && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-pink-400'}`}></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700">
                    {selectedDate 
                      ? `${selectedDate.split('-')[1]}월 ${selectedDate.split('-')[2]}일 일정 (${filteredSchedules.length}건)` 
                      : `전체 일정 (${schedules.length}건)`}
                  </h3>
                  {selectedDate && (
                    <button onClick={() => setSelectedDate('')} className="text-xs text-indigo-600 font-bold hover:underline bg-indigo-50 px-2.5 py-1 rounded-lg">
                      전체 보기
                    </button>
                  )}
                </div>

                {filteredSchedules.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl py-12 text-center text-slate-400 text-sm border border-slate-100 flex flex-col items-center justify-center gap-2">
                    <p className="font-bold text-slate-500">
                      {selectedDate 
                        ? `${selectedDate}에 등록된 일정이 없습니다.` 
                        : '아직 등록된 체험단 일정이 없습니다.'}
                    </p>
                    {selectedDate ? (
                      <button onClick={() => setSelectedDate('')} className="text-xs text-indigo-600 underline font-semibold mt-1">
                        전체 일정 보러가기
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setIsAutoImportModalOpen(true)}
                          className="text-xs text-white bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-xl font-extrabold shadow-sm flex items-center gap-1"
                        >
                          <Zap size={14} /> 리뷰노트·당첨톡 1초 자동등록
                        </button>
                        <button onClick={openAddModal} className="text-xs text-white bg-indigo-600 px-4 py-2 rounded-xl font-bold shadow-sm">
                          + 직접 일정 추가하기
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredSchedules.map((schedule) => {
                      const isDeadlineToday = schedule.deadlineDate === selectedDate;
                      return (
                        <div key={schedule.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all group">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {isDeadlineToday && <span className="bg-pink-100 text-pink-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full">마감일</span>}
                              {schedule.platform && (
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                  {schedule.platform}
                                </span>
                              )}
                              <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{schedule.title}</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-2">
                              {schedule.visitDate && (
                                <span className={`flex items-center gap-1 ${schedule.visitDate === selectedDate ? 'text-indigo-600 font-bold' : ''}`}>
                                  <CalendarIcon size={12} /> 방문: {schedule.visitDate}
                                </span>
                              )}
                              <span className={`flex items-center gap-1 ${schedule.deadlineDate === selectedDate ? 'text-pink-600 font-bold' : ''}`}>
                                <CalendarIcon size={12} /> 마감: {schedule.deadlineDate}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 md:mt-0">
                            <button 
                              onClick={() => handleEdit(schedule)}
                              className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-indigo-100 hover:bg-indigo-50"
                            >
                              수정
                            </button>
                            <button 
                              onClick={() => handleDelete(schedule.id)}
                              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-red-100 hover:bg-red-50"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Ledger Tab */}
          {activeTab === 'ledger' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
                <h2 className="text-xl font-bold text-slate-800">💰 쏠쏠한 체험단 가계부</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white text-xs sm:text-sm font-extrabold px-3.5 py-2 rounded-xl hover:opacity-95 transition shadow-sm active:scale-95"
                  >
                    <Share2 size={15} />
                    <span>SNS 정산 공유 ✨</span>
                  </button>
                  <button 
                    onClick={openAddModal}
                    className="bg-indigo-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl hover:bg-indigo-700 transition"
                  >
                    + 내역 추가
                  </button>
                </div>
              </div>
              
              {/* 월 선택 필터 */}
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-2 mb-6 shadow-sm">
                <button onClick={prevMonth} className="p-3 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                   <ChevronLeft size={20}/>
                </button>
                <div className="text-center">
                  <div className="font-bold text-slate-800 text-lg">
                    {year}년 {month + 1}월 정산
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    월 순이득: <span className={monthlyNetProfit >= 0 ? "text-indigo-600 font-bold" : "text-red-500 font-bold"}>
                      {monthlyNetProfit >= 0 ? `+${monthlyNetProfit.toLocaleString()}원` : `-${Math.abs(monthlyNetProfit).toLocaleString()}원`}
                    </span>
                  </div>
                </div>
                <button onClick={nextMonth} className="p-3 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                   <ChevronRight size={20}/>
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="bg-indigo-50/80 p-4 md:p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-indigo-700 text-xs font-bold mb-1">🎯 총 체험 건수</p>
                    <p className="text-xl md:text-2xl font-black text-indigo-900">{monthlyCount}건</p>
                  </div>
                  {monthlyCount > 0 && (
                    <p className="text-[11px] text-indigo-600 font-semibold mt-2">
                      건당 약 {avgPerCase.toLocaleString()}원
                    </p>
                  )}
                </div>
                <div className="bg-green-50 p-4 md:p-5 rounded-2xl border border-green-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-green-700 text-xs font-bold mb-1">🎁 월 혜택 (현물)</p>
                    <p className="text-xl md:text-2xl font-black text-green-700">+{monthlyBenefit.toLocaleString()}원</p>
                  </div>
                  <p className="text-[11px] text-green-600 font-medium mt-2">식사권/협찬품</p>
                </div>
                <div className="bg-blue-50 p-4 md:p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-blue-700 text-xs font-bold mb-1">💸 월 지원금 (현금)</p>
                    <p className="text-xl md:text-2xl font-black text-blue-700">+{monthlyCash.toLocaleString()}원</p>
                  </div>
                  <p className="text-[11px] text-blue-600 font-medium mt-2">원고료/교통비</p>
                </div>
                <div className="bg-red-50 p-4 md:p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-red-700 text-xs font-bold mb-1">💳 초과 지출</p>
                    <p className="text-xl md:text-2xl font-black text-red-700">-{monthlyExpense.toLocaleString()}원</p>
                  </div>
                  <p className="text-[11px] text-red-600 font-medium mt-2">내돈내산 추가금</p>
                </div>
              </div>

              {/* SNS 리포트 카드 & 커뮤니티 자랑하기 배너 */}
              {monthlyCount > 0 && (
                <div className="mb-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <p className="font-extrabold text-sm md:text-base">이번 달 {monthlyCount}건 완주! 정산 리포트 카드로 SNS에 공유해보세요</p>
                      <p className="text-xs text-indigo-100 opacity-90">인스타 스토리·스레드·네이버 블로그용 정산 카드 이미지와 요약 표를 1초 만에 만들어 드려요.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center">
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-white text-indigo-700 font-black rounded-xl text-xs hover:bg-indigo-50 transition-colors shadow-sm whitespace-nowrap active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Share2 size={14} /> SNS 정산 카드 만들기
                    </button>
                    <button
                      onClick={handleShareToCommunity}
                      className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-indigo-950/40 text-white border border-white/25 font-bold rounded-xl text-xs hover:bg-indigo-950/60 transition-colors whitespace-nowrap active:scale-95"
                    >
                      커뮤니티 자랑 📢
                    </button>
                  </div>
                </div>
              )}

              {/* 체험단별 진행 횟수 통계 */}
              {monthlyCount > 0 && (
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 md:p-5 mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <span>🏷️ 체험단별 진행 횟수</span>
                      </h4>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        총 {monthlyCount}건
                      </span>
                    </div>
                    {selectedPlatformFilter && (
                      <button 
                        onClick={() => setSelectedPlatformFilter(null)} 
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                      >
                        전체 보기
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {sortedPlatformStats.map(([platName, count]) => {
                      const percent = Math.round((count / monthlyCount) * 100);
                      const isSelected = selectedPlatformFilter === platName;
                      return (
                        <button
                          key={platName}
                          onClick={() => setSelectedPlatformFilter(isSelected ? null : platName)}
                          className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200 scale-105' 
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 shadow-sm'
                          }`}
                        >
                          <span>{platName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                            {count}건
                          </span>
                          <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                            ({percent}%)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedPlatformFilter && (
                    <p className="text-xs text-indigo-600 font-medium mt-3">
                      * <strong>{selectedPlatformFilter}</strong> ({displayedMonthlySchedules.length}건) 내역만 필터링되어 표시 중입니다.
                    </p>
                  )}
                </div>
              )}

              {/* 가계부 리스트 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700">
                    {month + 1}월 상세 내역 {selectedPlatformFilter ? `(${selectedPlatformFilter} ${displayedMonthlySchedules.length}건)` : `(총 ${monthlyCount}건)`}
                  </h3>
                  {selectedPlatformFilter && (
                    <button onClick={() => setSelectedPlatformFilter(null)} className="text-xs text-indigo-600 font-semibold hover:underline">
                      필터 해제
                    </button>
                  )}
                </div>

                {displayedMonthlySchedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                    <p className="text-slate-400 text-sm">
                      {selectedPlatformFilter 
                        ? `'${selectedPlatformFilter}'에 해당하는 내역이 없습니다.` 
                        : '해당 월에 기록된 내역이 없습니다.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {displayedMonthlySchedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 transition-colors">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {schedule.platform && (
                              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                {schedule.platform}
                              </span>
                            )}
                            <p className="font-bold text-slate-800">{schedule.title}</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <CalendarIcon size={12} /> {schedule.visitDate || schedule.deadlineDate}
                          </p>
                        </div>
                        <div className="text-right flex flex-col gap-0.5">
                          {(schedule.benefitAmount || 0) > 0 && (
                            <p className="text-xs font-bold text-green-600">혜택 +{schedule.benefitAmount?.toLocaleString()}원</p>
                          )}
                          {(schedule.cashAmount || 0) > 0 && (
                            <p className="text-xs font-bold text-blue-600">지원금 +{schedule.cashAmount?.toLocaleString()}원</p>
                          )}
                          {(schedule.extraExpense || 0) > 0 && (
                            <p className="text-xs font-bold text-red-500">지출 -{schedule.extraExpense?.toLocaleString()}원</p>
                          )}
                          {!schedule.benefitAmount && !schedule.extraExpense && !schedule.cashAmount && (
                            <p className="text-xs text-slate-400 font-medium">금액 미입력</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Sites List Tab */}
          {activeTab === 'sites' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">🔗 체험단 사이트 모음</h2>
                <p className="text-slate-500 text-sm mt-1">매일 새로운 캠페인을 확인하고 신청해보세요!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://www.revu.net/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-indigo-50 group-hover:text-indigo-500">
                    REVU
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600">레뷰 (REVU)</h3>
                    <p className="text-xs text-slate-500 mt-1">국내 최대 규모, 맛집/뷰티/제품</p>
                  </div>
                </a>

                <a href="https://dinnerqueen.net/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-pink-50 group-hover:text-pink-500">
                    디너
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-pink-600">디너의여왕</h3>
                    <p className="text-xs text-slate-500 mt-1">맛집 체험단 최강자</p>
                  </div>
                </a>
                
                <a href="https://www.seoulouba.co.kr/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-500">
                    서울
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600">서울오빠</h3>
                    <p className="text-xs text-slate-500 mt-1">초보 블로거도 당첨률 높은 곳</p>
                  </div>
                </a>
                
                <a href="https://강남맛집.net/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-orange-50 group-hover:text-orange-500">
                    강남
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-orange-600">강남맛집</h3>
                    <p className="text-xs text-slate-500 mt-1">블로거 필수 맛집 체험단</p>
                  </div>
                </a>

                <a href="https://www.supermembers.co.kr/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-emerald-50 group-hover:text-emerald-500">
                    슈퍼
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-emerald-600">슈퍼멤버스</h3>
                    <p className="text-xs text-slate-500 mt-1">예약 없이 앱으로 바로 할인 혜택</p>
                  </div>
                </a>

                <a href="https://www.reviewnote.co.kr/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-sky-50 group-hover:text-sky-500">
                    리뷰
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-sky-600">리뷰노트</h3>
                    <p className="text-xs text-slate-500 mt-1">최근 가장 핫한 신흥 체험단</p>
                  </div>
                </a>

                <a href="https://popomon.com/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-purple-50 group-hover:text-purple-500">
                    포포몬
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-purple-600">포포몬 (POPOMON)</h3>
                    <p className="text-xs text-slate-500 mt-1">맛집·핫플·제품 알짜 캠페인 체험단</p>
                  </div>
                </a>

                <a href="https://mrblog.net/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-rose-50 group-hover:text-rose-500">
                    미블
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-rose-600">미블 (미스터블로그)</h3>
                    <p className="text-xs text-slate-500 mt-1">전국 지역 맛집·뷰티·배송형 체험단</p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 쿠팡 파트너스 광고 배너 영역 */}
        {isLoaded && (settings.coupangBannerHtml || settings.coupangBannerHtmlMobile) && (
          <div className="mt-10 mb-8 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center overflow-hidden">
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
      </div>

      {/* 일정 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? '체험단 일정 수정' : '새 체험단 등록'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSchedule} className="flex flex-col gap-4">
              {/* ⚡ 당첨 카톡/내역 1초 자동완성 바 (신규 등록 시) */}
              {!editingId && (
                <div className="bg-amber-50/90 border border-amber-200 p-3.5 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1">
                      <Zap size={14} className="text-amber-600" />
                      리뷰노트·강남맛집·디너·레뷰·포포몬 당첨톡 복사하셨나요?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setIsAutoImportModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-amber-700 underline hover:text-amber-900 shrink-0"
                    >
                      여러 건 일괄등록 &rarr;
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePasteFromClipboard(true)}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                      <ClipboardPaste size={14} /> 복사한 당첨톡으로 빈칸 1초 자동채우기
                    </button>
                  </div>
                  {quickPasteFeedback && (
                    <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {quickPasteFeedback}
                    </p>
                  )}
                </div>
              )}

              {/* 기본 정보 */}
              <div className="bg-slate-50 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-indigo-500 mb-3 tracking-wide">기본 정보</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">체험단(캠페인) 이름 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="예: 강남역 OOO 맛집"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>

                  {/* 플랫폼 선택 */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      체험단 플랫폼 / 출처 <span className="text-slate-400 font-normal text-xs">(선택)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {POPULAR_PLATFORMS.map((plat) => {
                        const isSelected = newPlatform === plat && !isCustomPlatform;
                        return (
                          <button
                            key={plat}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setNewPlatform('');
                              } else {
                                setNewPlatform(plat);
                                setIsCustomPlatform(false);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isSelected 
                                ? 'bg-indigo-600 text-white shadow-sm' 
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            {plat}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomPlatform(!isCustomPlatform);
                          setNewPlatform('');
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isCustomPlatform 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        직접 입력 ✎
                      </button>
                    </div>
                    {isCustomPlatform && (
                      <input 
                        type="text" 
                        placeholder="체험단 이름을 직접 입력해주세요 (예: 오마이블로그, 카카오뷰)"
                        className="w-full px-3 py-2 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-xs font-medium"
                        value={customPlatform}
                        onChange={(e) => setCustomPlatform(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">방문/예약일</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                        value={newVisitDate}
                        onChange={(e) => setNewVisitDate(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">포스팅 마감일 <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                        value={newDeadlineDate}
                        onChange={(e) => setNewDeadlineDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 가계부 정보 */}
              <div className="bg-green-50/50 p-4 rounded-2xl border border-green-50">
                <h4 className="text-xs font-bold text-green-600 mb-3 tracking-wide">가계부 정보 (선택)</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">제공 혜택(현물) <span className="text-slate-400 font-normal">원</span></label>
                      <input 
                        type="number" 
                        placeholder="예: 30000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">지원금(원고료) <span className="text-slate-400 font-normal">원</span></label>
                      <input 
                        type="number" 
                        placeholder="예: 10000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                        value={newCash}
                        onChange={(e) => setNewCash(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">초과 지출 내돈내산 <span className="text-slate-400 font-normal">원</span></label>
                    <input 
                      type="number" 
                      placeholder="예: 5000"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all text-sm"
                      value={newExpense}
                      onChange={(e) => setNewExpense(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 월간 정산 SNS 공유 모달 */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-extrabold mb-1">
                  <Sparkles size={12} /> SNS · 블로그 정산 리포트
                </span>
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
                  {year}년 {month + 1}월 정산 공유하기
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* 왼쪽: 실시간 리포트 카드 이미지 미리보기 */}
              <div className="flex flex-col items-center bg-slate-100 p-4 rounded-2xl border border-slate-200/80">
                {shareCardUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shareCardUrl}
                    alt="월간 정산 리포트 카드"
                    className="w-full max-w-[280px] rounded-xl shadow-md border border-slate-200/60"
                  />
                ) : (
                  <div className="w-full max-w-[280px] aspect-[4/5] bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-500 font-bold">
                    카드 생성 중...
                  </div>
                )}
                <p className="text-[11px] text-slate-500 font-medium mt-2.5 text-center">
                  💡 인스타 스토리·피드·블로그 썸네일에 최적화된 고화질(1080×1350) 이미지입니다.
                </p>
              </div>

              {/* 오른쪽: 커스텀 옵션 & 공유/복사 버튼 */}
              <div className="flex flex-col gap-4">
                {/* 1. 카드 꾸미기 옵션 */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      블로그명 / 닉네임 넣기 <span className="text-slate-400 font-normal">(선택)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="예: 맛동산블로거"
                      value={shareNickname}
                      onChange={(e) => setShareNickname(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">카드 배경 테마</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShareTheme('indigo')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          shareTheme === 'indigo'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        💎 퍼플
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareTheme('receipt')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          shareTheme === 'receipt'
                            ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        🧾 화이트
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareTheme('dark')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          shareTheme === 'dark'
                            ? 'bg-slate-950 text-indigo-300 border-slate-900 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        🌙 다크
                      </button>
                    </div>
                  </div>

                  {/* 프라이버시(금액 가리기) 토글 */}
                  <button
                    type="button"
                    onClick={() => setHideAmounts(!hideAmounts)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                      hideAmounts
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {hideAmounts ? <EyeOff size={14} /> : <Eye size={14} />}
                      상세 금액 가리기 (건수만 공개)
                    </span>
                    <span className="text-[11px] font-extrabold">
                      {hideAmounts ? '켜짐 🔒' : '꺼짐'}
                    </span>
                  </button>
                </div>

                {/* 2. 공유 및 복사 액션 버튼들 */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Share2 size={16} />
                    SNS로 바로 보내기 (인스타·카톡·스레드)
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadShareCard}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <ImageIcon size={14} />
                      카드 이미지 저장
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyShareText}
                      className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Copy size={14} />
                      요약 텍스트 복사
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNaverBlogHtml}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Copy size={14} />
                    💚 네이버 블로그 포스팅용 요약표(HTML) 복사
                  </button>

                  <button
                    type="button"
                    onClick={handleShareToCommunity}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <MessageSquareHeart size={14} />
                    💬 Gifty 블로거 커뮤니티에 1초 자랑하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ 전 플랫폼 체험단 당첨 1초 자동등록 모달 */}
      {isAutoImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold mb-1">
                  <Zap size={12} /> 리뷰노트 · 강남맛집 · 디너의여왕 · 레뷰 · 포포몬 완벽 지원!
                </span>
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
                  체험단 당첨 카톡·내역 1초 자동 등록기
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  어느 체험단 사이트든 카카오톡 당첨 알림톡·문자·마이페이지 내역을 복사해 붙여넣으면 플랫폼·캠페인명·마감일·제공혜택·포인트를 자동으로 추출합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              {/* 1. 클립보드 붙여넣기 & 텍스트 입력 영역 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-extrabold text-slate-700">
                    1️⃣ 당첨 카톡 메시지 또는 마이페이지 텍스트 붙여넣기
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePasteFromClipboard(false)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1 shadow-sm transition active:scale-95"
                    >
                      <ClipboardPaste size={13} /> 클립보드 붙여넣기
                    </button>
                    {autoImportText && (
                      <button
                        type="button"
                        onClick={() => handleAutoImportTextChange('')}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs font-bold transition"
                      >
                        비우기
                      </button>
                    )}
                  </div>
                </div>

                {/* 지원 플랫폼별 원클릭 예시 테스트 버튼 */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">플랫폼별 예시 테스트:</span>
                  {['리뷰노트', '강남맛집', '디너의여왕', '레뷰', '포포몬'].map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => handleFillSample(plat)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-800 border border-slate-200 hover:border-amber-300 text-[11px] font-bold transition"
                    >
                      {plat} 예시
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleFillSample('all')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-extrabold transition"
                  >
                    ✨ 3건 동시 등록 예시
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={autoImportText}
                  onChange={(e) => handleAutoImportTextChange(e.target.value)}
                  placeholder={`여기에 카카오톡 당첨 알림톡이나 각 체험단 사이트(리뷰노트, 강남맛집, 디너의여왕, 레뷰, 포포몬, 미블 등) 선정 내역을 붙여넣기(Ctrl+V) 해주세요!\n\n예시:\n[강남맛집] 리뷰어 선정 안내\n▶ 매장명 : [강남] 숙성 한우 오마카세\n▶ 제공내역 : 80,000원 식사권\n▶ 리뷰마감일 : 2026.11.07`}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 leading-relaxed"
                />
              </div>

              {/* 2. 실시간 자동 추출 미리보기 & 수정 */}
              {parsedPreviewList.length > 0 && (
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-extrabold text-indigo-900 flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-indigo-600" />
                      자동 분석 결과 ({parsedPreviewList.length}건 감지됨 — 클릭하여 바로 수정 가능)
                    </h4>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {parsedPreviewList.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-indigo-100 rounded-xl p-3.5 shadow-sm space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={item.platform}
                            onChange={(e) => {
                              const next = [...parsedPreviewList];
                              next[idx] = { ...next[idx], platform: e.target.value };
                              setParsedPreviewList(next);
                            }}
                            className="w-full sm:w-28 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700 font-extrabold text-xs"
                            placeholder="플랫폼"
                          />
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const next = [...parsedPreviewList];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setParsedPreviewList(next);
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-xs sm:text-sm text-slate-800"
                            placeholder="캠페인 제목"
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">마감일 *</span>
                            <input
                              type="date"
                              value={item.deadlineDate}
                              onChange={(e) => {
                                const next = [...parsedPreviewList];
                                next[idx] = { ...next[idx], deadlineDate: e.target.value };
                                setParsedPreviewList(next);
                              }}
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold text-slate-700"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">방문예약일</span>
                            <input
                              type="date"
                              value={item.visitDate}
                              onChange={(e) => {
                                const next = [...parsedPreviewList];
                                next[idx] = { ...next[idx], visitDate: e.target.value };
                                setParsedPreviewList(next);
                              }}
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 font-semibold text-slate-700"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-emerald-600 mb-0.5">제공 혜택(원)</span>
                            <input
                              type="number"
                              value={item.benefitAmount || ''}
                              placeholder="0"
                              onChange={(e) => {
                                const next = [...parsedPreviewList];
                                next[idx] = { ...next[idx], benefitAmount: Number(e.target.value) || 0 };
                                setParsedPreviewList(next);
                              }}
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 font-bold text-emerald-700"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-blue-600 mb-0.5">포인트/원고료(원)</span>
                            <input
                              type="number"
                              value={item.cashAmount || ''}
                              placeholder="0"
                              onChange={(e) => {
                                const next = [...parsedPreviewList];
                                next[idx] = { ...next[idx], cashAmount: Number(e.target.value) || 0 };
                                setParsedPreviewList(next);
                              }}
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 font-bold text-blue-700"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmAutoImport}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Zap size={16} />
                    🎉 총 {parsedPreviewList.length}건 다이어리 & 가계부에 즉시 등록하기
                  </button>
                </div>
              )}

              {/* 3. PC 크롬 사용자를 위한 1클릭 북마클릿 안내 */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-slate-800">
                    💻 PC에서 체험단 사이트 화면을 보고 계신가요? (전 사이트 1클릭 전송 버튼)
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    오른쪽 <strong>[⚡ 체험단→Gifty 자동전송]</strong> 버튼을 마우스로 끌어다 브라우저 상단 <strong>즐겨찾기(북마크) 바</strong>에 놓으세요. 리뷰노트·강남맛집·디너의여왕·레뷰·포포몬 당첨 화면에서 누르면 플랫폼까지 자동 인식해 넘어옵니다!
                  </p>
                </div>
                <a
                  ref={(el) => {
                    if (el && typeof window !== 'undefined') {
                      el.setAttribute('href', getQuickImportBookmarklet(window.location.origin));
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    alert('이 버튼을 클릭하지 마시고, 마우스로 끌어다(드래그) 브라우저 상단 즐겨찾기 바에 놓아주세요!\n이후 리뷰노트·강남맛집·디너의여왕·레뷰·포포몬 당첨 페이지에서 그 즐겨찾기를 누르면 자동 전송됩니다.');
                  }}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs shadow-sm cursor-grab active:cursor-grabbing select-none"
                  title="즐겨찾기 바로 드래그하세요"
                >
                  ⚡ 체험단→Gifty 자동전송
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
