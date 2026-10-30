'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Calendar as CalendarIcon, Calculator, Link as LinkIcon, ArrowLeft, ArrowRight, Laptop, Plus, X, ChevronLeft, ChevronRight, Menu, Download, Upload, Share2, Copy, Image as ImageIcon, EyeOff, Eye, MessageSquareHeart, Zap, ClipboardPaste, CheckCircle2, Smartphone, RefreshCw, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CoupangBanner from '@/components/CoupangBanner';
import SyncModal from '@/components/SyncModal';
import {
  getSavedSyncCode,
  saveSyncCode,
  formatSyncCode,
  normalizeSyncCode,
  pushSchedulesToCloud,
  pullSchedulesFromCloud,
  decompressSchedules,
} from '@/lib/syncService';
import { useSiteSettings } from '@/lib/settings';
import {
  parseCampaignsFromText,
  parseSingleCampaignBlock,
  getQuickImportBookmarklet,
  getSampleCampaignText,
  toDateInputString,
  getOffsetDateString,
  getThisSaturdayString,
  ParsedCampaign,
} from '@/lib/campaignParser';

interface Schedule {
  id: string;
  title: string;
  platform?: string;      // 체험단 플랫폼/출처 (예: 레뷰, 리뷰노트 등 또는 '식비', '부수입' 등)
  visitDate: string;      // 방문일 또는 지출/수입 날짜
  deadlineDate: string;   // 마감일
  benefitAmount?: number; // 제공받은 혜택 (식사권/제품 등 - 생활비 방어)
  cashAmount?: number;    // 원고료/지원금 또는 부수입 (현금)
  extraExpense?: number;  // 추가 지출 또는 일상 지출 (현금)
  isCompleted?: boolean;  // 리뷰 작성 완료 여부
  entryType?: 'campaign' | 'expense' | 'income'; // 항목 유형 (기본값: 'campaign')
  category?: string;      // 카테고리 라벨
}

const EXPENSE_CATEGORIES = [
  { id: 'food', label: '🍔 식비/외식', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'cafe', label: '☕ 카페/디저트', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { id: 'shopping', label: '🛍️ 쇼핑/뷰티', color: 'bg-pink-50 text-pink-800 border-pink-200' },
  { id: 'transport', label: '🚗 교통/차량', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'leisure', label: '🎬 문화/여가', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'living', label: '🏠 생활/주거', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'blog', label: '💻 블로그/장비', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: 'etc', label: '✏️ 기타 지출', color: 'bg-slate-50 text-slate-800 border-slate-200' },
];

const INCOME_CATEGORIES = [
  { id: 'ad', label: '📈 블로그 원고료', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: 'adsense', label: '💵 애드센스 수익', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'secondhand', label: '📦 당근/중고판매', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'apptech', label: '📱 앱테크/포인트', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  { id: 'salary', label: '💼 알바/보너스', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'etc_income', label: '💰 기타 부수입', color: 'bg-violet-50 text-violet-800 border-violet-200' },
];

/** 달력 칸에 들어갈 짧은 업체명 라벨 추출 (예: "[성수/맛집] 성수동 화덕피자" -> "성수동 화덕피자") */
function getShortCampaignLabel(title: string): string {
  const withoutBracket = title.replace(/^\[[^\]]+\]\s*/, '').trim();
  const base = withoutBracket.length >= 2 ? withoutBracket : title.trim();
  return base.length > 7 ? `${base.slice(0, 7)}..` : base;
}

/** 마감일 기준 D-Day 계산 및 배지 스타일 반환 */
function getDDayInfo(deadlineDate: string, isCompleted?: boolean) {
  if (isCompleted) {
    return {
      label: '리뷰완료',
      style: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      daysLeft: 999,
    };
  }
  const todayStr = toDateInputString(new Date());
  const todayTime = new Date(`${todayStr}T00:00:00`).getTime();
  const targetTime = new Date(`${deadlineDate}T00:00:00`).getTime();
  if (isNaN(targetTime)) {
    return {
      label: '일정확인',
      style: 'bg-slate-100 text-slate-600 border border-slate-200',
      daysLeft: 99,
    };
  }
  const daysLeft = Math.round((targetTime - todayTime) / 86400000);
  if (daysLeft === 0) {
    return {
      label: '오늘마감!',
      style: 'bg-rose-600 text-white shadow-sm animate-pulse',
      daysLeft: 0,
    };
  }
  if (daysLeft > 0 && daysLeft <= 3) {
    return {
      label: `D-${daysLeft} 마감임박`,
      style: 'bg-rose-100 text-rose-700 border border-rose-200',
      daysLeft,
    };
  }
  if (daysLeft > 3) {
    return {
      label: `D-${daysLeft}`,
      style: 'bg-slate-100 text-slate-600 border border-slate-200',
      daysLeft,
    };
  }
  return {
    label: `마감지남(D+${Math.abs(daysLeft)})`,
    style: 'bg-amber-100 text-amber-800 border border-amber-300',
    daysLeft,
  };
}

const POPULAR_PLATFORMS = ['리뷰노트', '강남맛집', '디너의여왕', '레뷰', '포포몬', '슈퍼멤버스', '미블', '포블로그', '서울오빠', '인스타협찬', '기타'];

export default function ExperienceDiary() {
  const { settings, isLoaded } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<'schedule' | 'ledger' | 'sites'>('schedule');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<'campaign' | 'expense' | 'income'>('campaign');
  const [newCategory, setNewCategory] = useState<string>('food');
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'campaign' | 'expense' | 'income'>('all');
  
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
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'uncompleted' | 'deadline'>('all');

  // ⚡ 리뷰노트/카톡 당첨 1초 자동등록 모달 상태
  const [isAutoImportModalOpen, setIsAutoImportModalOpen] = useState(false);
  const [autoImportText, setAutoImportText] = useState('');
  const [parsedPreviewList, setParsedPreviewList] = useState<ParsedCampaign[]>([]);
  const [quickPasteFeedback, setQuickPasteFeedback] = useState('');

  // 📱 모바일 ↔ PC 간편 연동 상태
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [activeSyncCode, setActiveSyncCode] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const isInitialLoadedRef = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 일정(schedules) 변경 시 연동 코드가 있으면 클라우드에 실시간 자동 동기화
  useEffect(() => {
    if (!isInitialLoadedRef.current) return;
    const syncCode = getSavedSyncCode();
    if (syncCode) {
      pushSchedulesToCloud(schedules, syncCode).catch(() => {});
    }
  }, [schedules]);

  useEffect(() => {
    let localList: Schedule[] = [];
    const saved = localStorage.getItem('gifty_schedules');
    if (saved) {
      try {
        localList = JSON.parse(saved);
        setSchedules(localList);
      } catch {
        // ignore
      }
    }
    // 기본 선택을 빈 값('')으로 두어 접속 시 전체 일정이 바로 보이도록 설정
    setSelectedDate('');

    // 1) 스마트폰 카메라(QR)나 URL 링크(?syncCode=123456)로 접속한 경우 즉시 자동 연동
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSyncCode = params.get('syncCode');
      const urlSyncData = params.get('syncData');

      if (urlSyncCode && normalizeSyncCode(urlSyncCode).length === 6) {
        const norm = normalizeSyncCode(urlSyncCode);
        saveSyncCode(norm);
        setActiveSyncCode(norm);
        isInitialLoadedRef.current = true;

        // A. QR 코드 URL에 압축 일정이 직접 실려있는 경우 -> 외부 서버 없이 0초 만에 100% 즉시 복원
        if (urlSyncData) {
          const directRestored = decompressSchedules(urlSyncData);
          if (directRestored && Array.isArray(directRestored) && directRestored.length > 0) {
            setSchedules(directRestored as Schedule[]);
            localStorage.setItem('gifty_schedules', JSON.stringify(directRestored));
            alert(`🎉 PC와 스마트폰이 성공적으로 연동되었습니다! (코드: ${formatSyncCode(norm)})\nPC의 일정 ${directRestored.length}건을 스마트폰에 완벽하게 가져왔습니다!`);
            window.history.replaceState({}, '', '/experience-diary');
            return;
          }
        }

        // B. 클라우드에서 조회 시도
        setIsSyncing(true);
        pullSchedulesFromCloud<Schedule[]>(norm).then((res) => {
          setIsSyncing(false);
          if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
            setSchedules(res.data);
            localStorage.setItem('gifty_schedules', JSON.stringify(res.data));
            alert(`🎉 PC와 스마트폰이 성공적으로 연동되었습니다! (코드: ${formatSyncCode(norm)})\n클라우드의 최신 일정 ${res.data.length}건을 동기화했습니다.`);
          } else {
            alert(`연동 코드(${formatSyncCode(norm)})가 설정되었습니다. 이제 PC와 모바일이 실시간으로 동기화됩니다.`);
          }
        });
        window.history.replaceState({}, '', '/experience-diary');
        return;
      }
    }

    // 2) 이미 연동 코드가 등록되어 있다면 클라우드의 최신 변경사항을 백그라운드 자동 동기화
    const savedCode = getSavedSyncCode();
    if (savedCode) {
      setActiveSyncCode(savedCode);
      setIsSyncing(true);
      pullSchedulesFromCloud<Schedule[]>(savedCode).then((res) => {
        setIsSyncing(false);
        isInitialLoadedRef.current = true;
        if (res.success && res.data && Array.isArray(res.data)) {
          if (res.data.length > 0 || localList.length === 0) {
            setSchedules(res.data);
            localStorage.setItem('gifty_schedules', JSON.stringify(res.data));
          }
        }
      });
    } else {
      isInitialLoadedRef.current = true;
    }

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

    // 3) 연동 중일 때 15초 주기 및 창 포커스(화면 돌아올 때) 자동 실시간 동기화
    const syncInterval = setInterval(() => {
      const code = getSavedSyncCode();
      if (code) {
        pullSchedulesFromCloud<Schedule[]>(code).then((res) => {
          if (res.success && res.data && Array.isArray(res.data)) {
            setSchedules((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(res.data)) {
                localStorage.setItem('gifty_schedules', JSON.stringify(res.data));
                return res.data as Schedule[];
              }
              return prev;
            });
          }
        });
      }
    }, 15000);

    const handleWindowFocus = () => {
      const code = getSavedSyncCode();
      if (code) {
        pullSchedulesFromCloud<Schedule[]>(code).then((res) => {
          if (res.success && res.data && Array.isArray(res.data)) {
            setSchedules((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(res.data)) {
                localStorage.setItem('gifty_schedules', JSON.stringify(res.data));
                return res.data as Schedule[];
              }
              return prev;
            });
          }
        });
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleWindowFocus);
    };
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

  const openAddModal = (typeOrEvent?: 'campaign' | 'expense' | 'income' | React.MouseEvent) => {
    const type = (typeof typeOrEvent === 'string' ? typeOrEvent : 'campaign') as 'campaign' | 'expense' | 'income';
    const defaultStart = selectedDate || toDateInputString(new Date());
    setEditingId(null);
    setEntryType(type);
    setNewCategory(type === 'expense' ? 'food' : type === 'income' ? 'ad' : '');
    setNewTitle('');
    setNewPlatform('');
    setCustomPlatform('');
    setIsCustomPlatform(false);
    setNewVisitDate(defaultStart);
    setNewDeadlineDate(getOffsetDateString(10, defaultStart));
    setNewBenefit('');
    setNewCash('');
    setNewExpense('');
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    const type = schedule.entryType || 'campaign';
    setEditingId(schedule.id);
    setEntryType(type);
    setNewCategory(schedule.category || (type === 'expense' ? 'food' : type === 'income' ? 'ad' : ''));
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

    // 1) 일상 지출 저장 분기
    if (entryType === 'expense') {
      if (!newTitle.trim()) return alert('지출 내용을 입력해주세요! (예: 점심 식사, 마트 장보기)');
      const expenseAmount = newExpense ? parseInt(newExpense.replace(/,/g, ''), 10) : 0;
      if (!expenseAmount || expenseAmount <= 0) return alert('지출 금액을 입력해주세요!');
      const dateToSave = newVisitDate || toDateInputString(new Date());
      const catObj = EXPENSE_CATEGORIES.find(c => c.id === newCategory);
      const catLabel = catObj ? catObj.label : '기타 지출';

      let updated: Schedule[];
      if (editingId) {
        updated = schedules.map(s => s.id === editingId ? {
          ...s,
          title: newTitle.trim(),
          entryType: 'expense',
          category: newCategory || 'etc',
          platform: catLabel,
          visitDate: dateToSave,
          deadlineDate: dateToSave,
          benefitAmount: 0,
          cashAmount: 0,
          extraExpense: expenseAmount,
          isCompleted: true,
        } : s);
      } else {
        const newItem: Schedule = {
          id: Date.now().toString(),
          title: newTitle.trim(),
          entryType: 'expense',
          category: newCategory || 'etc',
          platform: catLabel,
          visitDate: dateToSave,
          deadlineDate: dateToSave,
          benefitAmount: 0,
          cashAmount: 0,
          extraExpense: expenseAmount,
          isCompleted: true,
        };
        updated = [newItem, ...schedules];
      }
      setSchedules(updated);
      localStorage.setItem('gifty_schedules', JSON.stringify(updated));
      setIsModalOpen(false);
      return;
    }

    // 2) 부수입 저장 분기
    if (entryType === 'income') {
      if (!newTitle.trim()) return alert('부수입 내용을 입력해주세요! (예: 블로그 원고료, 당근 중고 판매)');
      const incomeAmount = newCash ? parseInt(newCash.replace(/,/g, ''), 10) : 0;
      if (!incomeAmount || incomeAmount <= 0) return alert('수입 금액을 입력해주세요!');
      const dateToSave = newVisitDate || toDateInputString(new Date());
      const catObj = INCOME_CATEGORIES.find(c => c.id === newCategory);
      const catLabel = catObj ? catObj.label : '기타 부수입';

      let updated: Schedule[];
      if (editingId) {
        updated = schedules.map(s => s.id === editingId ? {
          ...s,
          title: newTitle.trim(),
          entryType: 'income',
          category: newCategory || 'etc_income',
          platform: catLabel,
          visitDate: dateToSave,
          deadlineDate: dateToSave,
          benefitAmount: 0,
          cashAmount: incomeAmount,
          extraExpense: 0,
          isCompleted: true,
        } : s);
      } else {
        const newItem: Schedule = {
          id: Date.now().toString(),
          title: newTitle.trim(),
          entryType: 'income',
          category: newCategory || 'etc_income',
          platform: catLabel,
          visitDate: dateToSave,
          deadlineDate: dateToSave,
          benefitAmount: 0,
          cashAmount: incomeAmount,
          extraExpense: 0,
          isCompleted: true,
        };
        updated = [newItem, ...schedules];
      }
      setSchedules(updated);
      localStorage.setItem('gifty_schedules', JSON.stringify(updated));
      setIsModalOpen(false);
      return;
    }

    // 3) 기존 체험단 캠페인 저장
    if (!newTitle || !newDeadlineDate) return alert('캠페인 이름과 포스팅 마감일은 필수입니다!');

    const benefitAmount = newBenefit ? parseInt(newBenefit.replace(/,/g, ''), 10) : 0;
    const cashAmount = newCash ? parseInt(newCash.replace(/,/g, ''), 10) : 0;
    const extraExpense = newExpense ? parseInt(newExpense.replace(/,/g, ''), 10) : 0;
    const platformToSave = isCustomPlatform ? customPlatform.trim() : newPlatform.trim();

    let updated: Schedule[];
    if (editingId) {
      updated = schedules.map((s): Schedule => s.id === editingId ? {
        ...s,
        title: newTitle,
        entryType: 'campaign',
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
        entryType: 'campaign',
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

  // 리뷰 작성 완료 / 미완료 원클릭 토글
  const handleToggleComplete = (id: string) => {
    const updated = schedules.map((s) =>
      s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
    );
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

  // 달력 및 목록 필터 적용
  const baseCalendarSchedules = schedules.filter((s) => {
    if (calendarFilter === 'uncompleted') return !s.isCompleted;
    return true;
  });

  const filteredSchedules = (
    selectedDate
      ? baseCalendarSchedules.filter((s) =>
          calendarFilter === 'deadline'
            ? s.deadlineDate === selectedDate
            : s.visitDate === selectedDate || s.deadlineDate === selectedDate
        )
      : baseCalendarSchedules
  ).sort((a, b) => {
    if (Boolean(a.isCompleted) !== Boolean(b.isCompleted)) {
      return a.isCompleted ? 1 : -1;
    }
    return a.deadlineDate.localeCompare(b.deadlineDate);
  });

  // 3일 이내 마감 임박 미완료 캠페인 브리핑 목록
  const urgentSchedules = schedules
    .filter((s) => {
      if (s.isCompleted) return false;
      const info = getDDayInfo(s.deadlineDate, false);
      return info.daysLeft >= 0 && info.daysLeft <= 3;
    })
    .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));

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
  
  const monthlyCampaigns = monthlySchedules.filter(s => (s.entryType || 'campaign') === 'campaign');
  const monthlyExpenses = monthlySchedules.filter(s => s.entryType === 'expense');
  const monthlyIncomes = monthlySchedules.filter(s => s.entryType === 'income');

  const monthlyCount = monthlySchedules.length;
  const monthlyCampaignCount = monthlyCampaigns.length;
  const monthlyBenefit = monthlySchedules.reduce((acc, cur) => acc + (cur.benefitAmount || 0), 0);
  const monthlyCash = monthlySchedules.reduce((acc, cur) => acc + (cur.cashAmount || 0), 0);
  const monthlyExpense = monthlySchedules.reduce((acc, cur) => acc + (cur.extraExpense || 0), 0);
  const monthlyNetProfit = monthlyBenefit + monthlyCash - monthlyExpense;
  const monthlyNetCash = monthlyCash - monthlyExpense;
  const avgPerCase = monthlyCampaignCount > 0 ? Math.round((monthlyBenefit + monthlyCampaigns.reduce((acc, cur) => acc + (cur.cashAmount || 0), 0)) / monthlyCampaignCount) : 0;

  // 지출 카테고리별 통계
  const expenseCategoryStats = EXPENSE_CATEGORIES.map(cat => {
    const amount = monthlyExpenses
      .filter(e => (e.category || 'etc') === cat.id)
      .reduce((acc, cur) => acc + (cur.extraExpense || 0), 0);
    return { ...cat, amount };
  }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  const totalPureExpense = monthlyExpenses.reduce((acc, cur) => acc + (cur.extraExpense || 0), 0);

  // 플랫폼별 횟수 집계 (체험단 위주)
  const platformStats = monthlyCampaigns.reduce((acc, cur) => {
    const p = cur.platform?.trim() || '기타';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedPlatformStats = Object.entries(platformStats).sort((a, b) => b[1] - a[1]);

  // 통합 가계부 필터 적용된 목록
  const displayedMonthlySchedules = monthlySchedules.filter(s => {
    const itemType = s.entryType || 'campaign';
    if (ledgerFilter !== 'all' && itemType !== ledgerFilter) return false;
    if (selectedPlatformFilter && (s.platform?.trim() || '미지정') !== selectedPlatformFilter) return false;
    return true;
  });

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

        {/* 데이터 안심 백업 & 복원 & 모바일 연동 유틸리티 바 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white border border-slate-200/80 px-5 py-3.5 rounded-2xl mb-6 shadow-sm">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 w-full md:w-auto">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold">🛡️</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-800">모바일 연동 & 데이터 안심 보관함</p>
                {activeSyncCode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    연동중 ({formatSyncCode(activeSyncCode)})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">6자리 코드로 스마트폰과 실시간 연동하거나, 백업 파일로 안전하게 보관하세요.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm ${
                activeSyncCode
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white'
              }`}
            >
              <Smartphone size={15} />
              {activeSyncCode ? (
                <>
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  모바일 연동 관리
                </>
              ) : (
                '모바일 ↔ PC 간편 연동 📱'
              )}
            </button>
            <button
              onClick={handleExportBackup}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <Download size={14} /> 백업 📥
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <Upload size={14} /> 복원 📤
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
                    onClick={() => openAddModal('campaign')}
                    className="flex items-center gap-1 bg-indigo-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl hover:bg-indigo-700 transition active:scale-95"
                  >
                    <Plus size={16} /> 직접 추가
                  </button>
                </div>
              </div>

              {/* 🚨 마감 임박 D-Day 브리핑 바 */}
              {urgentSchedules.length > 0 && (
                <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-black shrink-0 animate-pulse">
                      🚨 마감 임박 {urgentSchedules.length}건
                    </span>
                    <span className="text-xs font-extrabold text-rose-900">
                      3일 이내에 리뷰를 올려야 하는 체험단이 있어요!
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {urgentSchedules.slice(0, 4).map((urg) => {
                      const dInfo = getDDayInfo(urg.deadlineDate, urg.isCompleted);
                      return (
                        <button
                          key={urg.id}
                          type="button"
                          onClick={() => setSelectedDate(urg.deadlineDate)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-extrabold shadow-sm transition"
                        >
                          <span className="text-rose-600">{dInfo.label.split(' ')[0]}</span>
                          <span>{getShortCampaignLabel(urg.title)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div className="bg-slate-50 p-3 sm:p-5 rounded-2xl border border-slate-100 mb-8 select-none">
                {/* 달력 상단: 월 이동 + 보기 필터 & 범례 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-200 rounded-xl text-slate-600 transition">
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 min-w-[110px] text-center">
                      {year}년 {month + 1}월
                    </h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-200 rounded-xl text-slate-600 transition">
                      <ChevronRight size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                        setSelectedDate(formatDateString(now));
                      }}
                      className="ml-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-xs font-bold text-slate-600 hover:text-indigo-600 shadow-sm"
                    >
                      오늘
                    </button>
                  </div>

                  {/* 보기 필터 & 색상 범례 */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                    <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-bold text-slate-500 mr-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" /> 방문/시작
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> 마감일
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> 완료됨
                      </span>
                    </div>

                    <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-[11px] font-extrabold">
                      <button
                        type="button"
                        onClick={() => setCalendarFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          calendarFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        전체
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarFilter('uncompleted')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          calendarFilter === 'uncompleted' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        미완료만
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarFilter('deadline')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          calendarFilter === 'deadline' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        마감일만
                      </button>
                    </div>
                  </div>
                </div>

                {/* 모바일용 색상 범례 */}
                <div className="flex lg:hidden items-center justify-end gap-3 text-[11px] font-bold text-slate-500 mb-2 px-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" /> 📍방문/시작
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-rose-500 inline-block" /> ⏰마감일
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> ✔완료
                  </span>
                </div>

                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-xs font-extrabold text-slate-400 mb-1.5">
                  <div className="text-red-400">일</div>
                  <div>월</div>
                  <div>화</div>
                  <div>수</div>
                  <div>목</div>
                  <div>금</div>
                  <div className="text-blue-400">토</div>
                </div>

                {/* 달력 그리드 (칸 안에 업체명 미니 배지 직접 표시) */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {days.map((d, i) => {
                    if (!d) {
                      return (
                        <div
                          key={i}
                          className="min-h-[68px] sm:min-h-[88px] rounded-xl bg-slate-100/40 border border-transparent"
                        />
                      );
                    }
                    const dateStr = formatDateString(d);
                    const isSelected = selectedDate === dateStr;
                    const isToday = formatDateString(new Date()) === dateStr;
                    const dayOfWeek = d.getDay();

                    // 해당 날짜에 걸린 방문/시작 일정, 마감 일정, 일상 지출, 부수입 추출
                    const dayEvents: {
                      id: string;
                      type: 'visit' | 'deadline' | 'expense' | 'income';
                      title: string;
                      platform?: string;
                      isCompleted?: boolean;
                      amount?: number;
                    }[] = [];

                    baseCalendarSchedules.forEach((s) => {
                      if (s.entryType === 'expense') {
                        if (calendarFilter !== 'deadline' && (s.visitDate === dateStr || s.deadlineDate === dateStr)) {
                          dayEvents.push({
                            id: `${s.id}_e`,
                            type: 'expense',
                            title: s.title,
                            platform: s.platform,
                            amount: s.extraExpense,
                            isCompleted: true,
                          });
                        }
                      } else if (s.entryType === 'income') {
                        if (calendarFilter !== 'deadline' && (s.visitDate === dateStr || s.deadlineDate === dateStr)) {
                          dayEvents.push({
                            id: `${s.id}_i`,
                            type: 'income',
                            title: s.title,
                            platform: s.platform,
                            amount: s.cashAmount,
                            isCompleted: true,
                          });
                        }
                      } else {
                        if (calendarFilter !== 'deadline' && s.visitDate === dateStr) {
                          dayEvents.push({
                            id: `${s.id}_v`,
                            type: 'visit',
                            title: s.title,
                            platform: s.platform,
                            isCompleted: s.isCompleted,
                          });
                        }
                        if (s.deadlineDate === dateStr) {
                          dayEvents.push({
                            id: `${s.id}_d`,
                            type: 'deadline',
                            title: s.title,
                            platform: s.platform,
                            isCompleted: s.isCompleted,
                          });
                        }
                      }
                    });

                    const visibleEvents = dayEvents.slice(0, 2);
                    const hiddenCount = dayEvents.length - visibleEvents.length;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedDate(isSelected ? '' : dateStr)}
                        className={`min-h-[68px] sm:min-h-[88px] p-1 sm:p-1.5 flex flex-col items-stretch justify-start rounded-xl transition-all text-left border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                            : isToday
                            ? 'bg-indigo-50/70 border-indigo-300 hover:border-indigo-400'
                            : dayEvents.length > 0
                            ? 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-sm'
                            : 'bg-white/60 border-slate-100 hover:bg-white hover:border-slate-200'
                        }`}
                      >
                        {/* 날짜 숫자 + 초과 건수 배지 */}
                        <div className="flex items-center justify-between w-full mb-1">
                          <span
                            className={`text-xs font-extrabold leading-none px-1 py-0.5 rounded-md ${
                              isSelected
                                ? 'text-white'
                                : isToday
                                ? 'bg-indigo-600 text-white'
                                : dayOfWeek === 0
                                ? 'text-red-500'
                                : dayOfWeek === 6
                                ? 'text-blue-500'
                                : 'text-slate-700'
                            }`}
                          >
                            {d.getDate()}
                          </span>
                          {hiddenCount > 0 && (
                            <span
                              className={`text-[9px] font-black px-1 rounded ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              +{hiddenCount}
                            </span>
                          )}
                        </div>

                        {/* 미니 일정 배지 리스트 (최대 2개 노출) */}
                        <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                          {visibleEvents.map((ev) => {
                            const shortName = getShortCampaignLabel(ev.title);
                            let badgeClass = '';
                            let iconPrefix = '';

                            if (ev.type === 'expense') {
                              iconPrefix = '💸';
                              badgeClass = isSelected
                                ? 'bg-rose-400/30 text-white'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/70';
                            } else if (ev.type === 'income') {
                              iconPrefix = '💰';
                              badgeClass = isSelected
                                ? 'bg-emerald-400/30 text-white'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70';
                            } else if (ev.isCompleted) {
                              iconPrefix = '✔';
                              badgeClass = isSelected
                                ? 'bg-emerald-400/30 text-white'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 line-through opacity-80';
                            } else if (ev.type === 'deadline') {
                              iconPrefix = '⏰';
                              badgeClass = isSelected
                                ? 'bg-rose-400/40 text-white'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/80';
                            } else {
                              iconPrefix = '📍';
                              badgeClass = isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80';
                            }

                            return (
                              <div
                                key={ev.id}
                                className={`w-full px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold truncate leading-tight ${badgeClass}`}
                                title={`${ev.type === 'expense' ? `[지출 -${ev.amount?.toLocaleString()}원]` : ev.type === 'income' ? `[부수입 +${ev.amount?.toLocaleString()}원]` : ev.type === 'deadline' ? '[마감]' : '[방문/시작]'} ${ev.title}`}
                              >
                                <span className="mr-0.5">{iconPrefix}</span>
                                {ev.type === 'expense'
                                  ? `-${ev.amount?.toLocaleString()}원`
                                  : ev.type === 'income'
                                  ? `+${ev.amount?.toLocaleString()}원`
                                  : shortName}
                              </div>
                            );
                          })}
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
                      : `전체 일정 (${filteredSchedules.length}건)`}
                  </h3>
                  {selectedDate && (
                    <button onClick={() => setSelectedDate('')} className="text-xs text-indigo-600 font-bold hover:underline bg-indigo-50 px-2.5 py-1 rounded-lg">
                      전체 일정 보기
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
                        <button onClick={() => openAddModal('campaign')} className="text-xs text-white bg-indigo-600 px-4 py-2 rounded-xl font-bold shadow-sm">
                          + 직접 일정 추가하기
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredSchedules.map((schedule) => {
                      const isExpense = schedule.entryType === 'expense';
                      const isIncome = schedule.entryType === 'income';

                      if (isExpense) {
                        return (
                          <div
                            key={schedule.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-rose-100 bg-rose-50/25 hover:border-rose-200 transition-all group shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-rose-100 text-rose-700 shrink-0 border border-rose-200">
                                💸 지출
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  {schedule.platform && (
                                    <span className="bg-white text-rose-800 border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                      {schedule.platform}
                                    </span>
                                  )}
                                  <h3 className="font-bold text-slate-800">{schedule.title}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                                  <span>📅 {schedule.visitDate}</span>
                                  <span className="text-rose-600 font-extrabold bg-white border border-rose-200 px-2.5 py-0.5 rounded-md text-xs shadow-xs">
                                    -{schedule.extraExpense?.toLocaleString()}원
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3 md:mt-0">
                              <button 
                                onClick={() => handleEdit(schedule)}
                                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 md:border-transparent hover:border-indigo-100 hover:bg-white"
                              >
                                수정
                              </button>
                              <button 
                                onClick={() => handleDelete(schedule.id)}
                                className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 md:border-transparent hover:border-red-100 hover:bg-white"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        );
                      }

                      if (isIncome) {
                        return (
                          <div
                            key={schedule.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-emerald-100 bg-emerald-50/25 hover:border-emerald-200 transition-all group shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200">
                                💰 부수입
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  {schedule.platform && (
                                    <span className="bg-white text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                      {schedule.platform}
                                    </span>
                                  )}
                                  <h3 className="font-bold text-slate-800">{schedule.title}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                                  <span>📅 {schedule.visitDate}</span>
                                  <span className="text-emerald-700 font-extrabold bg-white border border-emerald-200 px-2.5 py-0.5 rounded-md text-xs shadow-xs">
                                    +{schedule.cashAmount?.toLocaleString()}원
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3 md:mt-0">
                              <button 
                                onClick={() => handleEdit(schedule)}
                                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 md:border-transparent hover:border-indigo-100 hover:bg-white"
                              >
                                수정
                              </button>
                              <button 
                                onClick={() => handleDelete(schedule.id)}
                                className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 md:border-transparent hover:border-red-100 hover:bg-white"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        );
                      }

                      const dDayInfo = getDDayInfo(schedule.deadlineDate, schedule.isCompleted);
                      return (
                        <div
                          key={schedule.id}
                          className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all group ${
                            schedule.isCompleted
                              ? 'border-slate-100 bg-slate-50/70 opacity-75'
                              : 'border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* ✅ 원클릭 리뷰 완료 체크 버튼 */}
                            <button
                              type="button"
                              onClick={() => handleToggleComplete(schedule.id)}
                              className={`mt-0.5 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border shrink-0 transition active:scale-95 ${
                                schedule.isCompleted
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border-slate-200 hover:border-emerald-300'
                              }`}
                              title="클릭하여 리뷰 작성 완료 상태 변경"
                            >
                              {schedule.isCompleted ? '✔ 완료됨' : '⬜ 완료체크'}
                            </button>

                            <div>
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${dDayInfo.style}`}>
                                  {dDayInfo.label}
                                </span>
                                {schedule.platform && (
                                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                    {schedule.platform}
                                  </span>
                                )}
                                <h3
                                  className={`font-bold transition-colors ${
                                    schedule.isCompleted
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-800 group-hover:text-indigo-600'
                                  }`}
                                >
                                  {schedule.title}
                                </h3>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1.5">
                                {schedule.visitDate && (
                                  <span className={`flex items-center gap-1 ${schedule.visitDate === selectedDate ? 'text-indigo-600 font-extrabold' : ''}`}>
                                    📍 방문/시작: {schedule.visitDate}
                                  </span>
                                )}
                                <span className={`flex items-center gap-1 ${schedule.deadlineDate === selectedDate ? 'text-rose-600 font-extrabold' : ''}`}>
                                  ⏰ 마감: {schedule.deadlineDate}
                                </span>
                                {(schedule.benefitAmount || 0) > 0 && (
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                                    혜택 {schedule.benefitAmount?.toLocaleString()}원
                                  </span>
                                )}
                                {(schedule.cashAmount || 0) > 0 && (
                                  <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                                    원고료 {schedule.cashAmount?.toLocaleString()}원
                                  </span>
                                )}
                                {(schedule.extraExpense || 0) > 0 && (
                                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md text-[11px]">
                                    추가지출 -{schedule.extraExpense?.toLocaleString()}원
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-3 md:mt-0">
                            <button 
                              onClick={() => handleEdit(schedule)}
                              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 md:border-transparent hover:border-indigo-100 hover:bg-indigo-50"
                            >
                              수정
                            </button>
                            <button 
                              onClick={() => handleDelete(schedule.id)}
                              className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 md:border-transparent hover:border-red-100 hover:bg-red-50"
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
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span>💰 똑똑한 통합 가계부</span>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      체험단 + 일상지출 + 부수입
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">체험단으로 아낀 식비·생활비와 일상 지출, 부수입을 한눈에 정리해요!</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openAddModal('expense')}
                    className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl transition active:scale-95 shadow-xs"
                  >
                    <span>💸 지출 기록</span>
                  </button>
                  <button
                    onClick={() => openAddModal('income')}
                    className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl transition active:scale-95 shadow-xs"
                  >
                    <span>💰 부수입 기록</span>
                  </button>
                  <button 
                    onClick={() => openAddModal('campaign')}
                    className="bg-indigo-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-xs"
                  >
                    + 체험단 등록
                  </button>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white text-xs sm:text-sm font-extrabold px-3 py-2 rounded-xl hover:opacity-95 transition shadow-xs active:scale-95"
                  >
                    <Share2 size={14} />
                    <span>SNS 정산 ✨</span>
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
                  <div className="flex items-center justify-center gap-3 text-xs font-semibold mt-0.5">
                    <span className="text-slate-500">
                      총 경제적 이득: <span className={monthlyNetProfit >= 0 ? "text-indigo-600 font-bold" : "text-rose-500 font-bold"}>
                        {monthlyNetProfit >= 0 ? `+${monthlyNetProfit.toLocaleString()}원` : `-${Math.abs(monthlyNetProfit).toLocaleString()}원`}
                      </span>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">
                      순수 현금 흐름: <span className={monthlyNetCash >= 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                        {monthlyNetCash >= 0 ? `+${monthlyNetCash.toLocaleString()}원` : `-${Math.abs(monthlyNetCash).toLocaleString()}원`}
                      </span>
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
                    <p className="text-indigo-700 text-xs font-bold mb-1">🎯 총 경제적 이득</p>
                    <p className={`text-xl md:text-2xl font-black ${monthlyNetProfit >= 0 ? 'text-indigo-900' : 'text-rose-600'}`}>
                      {monthlyNetProfit >= 0 ? `+${monthlyNetProfit.toLocaleString()}원` : `-${Math.abs(monthlyNetProfit).toLocaleString()}원`}
                    </p>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-2">
                    방어혜택 + 현금수입 - 총지출
                  </p>
                </div>
                <div className="bg-emerald-50 p-4 md:p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-emerald-700 text-xs font-bold mb-1">🎁 방어한 생활비 (체험단)</p>
                    <p className="text-xl md:text-2xl font-black text-emerald-700">+{monthlyBenefit.toLocaleString()}원</p>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium mt-2">식사권·협찬품 생활비 절약</p>
                </div>
                <div className="bg-blue-50 p-4 md:p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-blue-700 text-xs font-bold mb-1">💵 총 현금 수입 (부수입+지원금)</p>
                    <p className="text-xl md:text-2xl font-black text-blue-700">+{monthlyCash.toLocaleString()}원</p>
                  </div>
                  <p className="text-[11px] text-blue-600 font-medium mt-2">원고료, 애드센스, 중고판매</p>
                </div>
                <div className="bg-rose-50 p-4 md:p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-rose-700 text-xs font-bold mb-1">💳 총 지출 (일상+초과금)</p>
                    <p className="text-xl md:text-2xl font-black text-rose-700">-{monthlyExpense.toLocaleString()}원</p>
                  </div>
                  <p className="text-[11px] text-rose-600 font-medium mt-2">식비/카페/쇼핑/추가지출</p>
                </div>
              </div>

              {/* 지출 카테고리별 비중 분석 바 */}
              {expenseCategoryStats.length > 0 && (
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 md:p-5 mb-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs md:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span>📊 이번 달 일상 지출 분석</span>
                    </h4>
                    <span className="text-xs font-bold text-rose-600">
                      총 {totalPureExpense.toLocaleString()}원
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden flex mb-3">
                    {expenseCategoryStats.map((cat, idx) => {
                      const pct = Math.max(3, Math.round((cat.amount / totalPureExpense) * 100));
                      const colors = [
                        'bg-amber-400', 'bg-orange-400', 'bg-pink-400', 'bg-blue-400',
                        'bg-purple-400', 'bg-emerald-400', 'bg-indigo-400', 'bg-slate-400'
                      ];
                      return (
                        <div
                          key={cat.id}
                          style={{ width: `${pct}%` }}
                          className={`${colors[idx % colors.length]} h-full transition-all`}
                          title={`${cat.label}: ${cat.amount.toLocaleString()}원 (${pct}%)`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {expenseCategoryStats.map((cat) => {
                      const pct = Math.round((cat.amount / totalPureExpense) * 100);
                      return (
                        <div
                          key={cat.id}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${cat.color}`}
                        >
                          <span>{cat.label}</span>
                          <span className="font-black">{cat.amount.toLocaleString()}원</span>
                          <span className="opacity-70 text-[10px]">({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SNS 리포트 카드 & 커뮤니티 자랑하기 배너 */}
              {monthlyCount > 0 && (
                <div className="mb-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <p className="font-extrabold text-sm md:text-base">이번 달 {monthlyCount}건 기록! 정산 리포트 카드로 SNS에 공유해보세요</p>
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
              {monthlyCampaignCount > 0 && (
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 md:p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <span>🏷️ 체험단별 진행 횟수</span>
                      </h4>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        총 {monthlyCampaignCount}건
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
                      const percent = Math.round((count / monthlyCampaignCount) * 100);
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

              {/* 가계부 리스트 헤더 및 유형 필터 */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => { setLedgerFilter('all'); setSelectedPlatformFilter(null); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        ledgerFilter === 'all'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      🔥 전체 ({monthlyCount}건)
                    </button>
                    <button
                      onClick={() => { setLedgerFilter('campaign'); setSelectedPlatformFilter(null); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        ledgerFilter === 'campaign'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      🎁 체험단 ({monthlyCampaignCount}건)
                    </button>
                    <button
                      onClick={() => { setLedgerFilter('expense'); setSelectedPlatformFilter(null); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        ledgerFilter === 'expense'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      💸 일상 지출 ({monthlyExpenses.length}건)
                    </button>
                    <button
                      onClick={() => { setLedgerFilter('income'); setSelectedPlatformFilter(null); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        ledgerFilter === 'income'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      💰 부수입 ({monthlyIncomes.length}건)
                    </button>
                  </div>

                  {selectedPlatformFilter && (
                    <button onClick={() => setSelectedPlatformFilter(null)} className="text-xs text-indigo-600 font-semibold hover:underline">
                      플랫폼 필터 해제 ({selectedPlatformFilter})
                    </button>
                  )}
                </div>

                {displayedMonthlySchedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                    <p className="text-slate-400 text-sm">
                      {selectedPlatformFilter 
                        ? `'${selectedPlatformFilter}'에 해당하는 내역이 없습니다.` 
                        : ledgerFilter === 'expense'
                        ? '이번 달에 기록된 일상 지출이 없습니다.'
                        : ledgerFilter === 'income'
                        ? '이번 달에 기록된 부수입이 없습니다.'
                        : '해당 월에 기록된 내역이 없습니다.'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => openAddModal('expense')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl"
                      >
                        + 지출 기록하기
                      </button>
                      <button
                        onClick={() => openAddModal('income')}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl"
                      >
                        + 부수입 기록하기
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {displayedMonthlySchedules.map((schedule) => {
                      const isExpense = schedule.entryType === 'expense';
                      const isIncome = schedule.entryType === 'income';

                      return (
                        <div key={schedule.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white shadow-xs hover:border-indigo-100 transition-colors gap-3">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isExpense ? (
                                <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                                  💸 지출
                                </span>
                              ) : isIncome ? (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                                  💰 부수입
                                </span>
                              ) : (
                                <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                                  🎁 체험단
                                </span>
                              )}
                              {schedule.platform && (
                                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                  {schedule.platform}
                                </span>
                              )}
                              <p className="font-bold text-slate-800">{schedule.title}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <CalendarIcon size={12} /> {schedule.visitDate || schedule.deadlineDate}
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <div className="text-right flex flex-col gap-0.5">
                              {isExpense && (
                                <p className="text-sm font-black text-rose-600">-{schedule.extraExpense?.toLocaleString()}원</p>
                              )}
                              {isIncome && (
                                <p className="text-sm font-black text-blue-600">+{schedule.cashAmount?.toLocaleString()}원</p>
                              )}
                              {!isExpense && !isIncome && (
                                <>
                                  {(schedule.benefitAmount || 0) > 0 && (
                                    <p className="text-xs font-bold text-green-600">혜택 +{schedule.benefitAmount?.toLocaleString()}원</p>
                                  )}
                                  {(schedule.cashAmount || 0) > 0 && (
                                    <p className="text-xs font-bold text-blue-600">지원금 +{schedule.cashAmount?.toLocaleString()}원</p>
                                  )}
                                  {(schedule.extraExpense || 0) > 0 && (
                                    <p className="text-xs font-bold text-red-500">초과 -{schedule.extraExpense?.toLocaleString()}원</p>
                                  )}
                                  {!schedule.benefitAmount && !schedule.extraExpense && !schedule.cashAmount && (
                                    <p className="text-xs text-slate-400 font-medium">금액 미입력</p>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1 border-l border-slate-100 pl-2">
                              <button
                                onClick={() => handleEdit(schedule)}
                                className="text-xs text-slate-400 hover:text-indigo-600 px-2 py-1 hover:bg-indigo-50 rounded-lg transition"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDelete(schedule.id)}
                                className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 hover:bg-red-50 rounded-lg transition"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

        {/* 📱 모바일 ↔ PC 간편 연동 3단계 가이드 카드 섹션 */}
        <div className="mt-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
          {/* 배경 데코레이션 블러 서클 */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* 섹션 상단 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold mb-2">
                  <Sparkles size={13} className="text-amber-300" />
                  <span>체험단 블로거 필수 기능</span>
                  <span className="w-1 h-1 rounded-full bg-indigo-300" />
                  <span className="text-emerald-300">회원가입 없음</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  스마트폰과 PC를 3초 만에 연결해보세요! 📱💻
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  PC에서 등록한 당첨 일정, 외출할 땐 스마트폰에서 실시간으로 확인하고 리뷰 완료 체크까지!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSyncModalOpen(true)}
                className="self-start sm:self-center shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-95"
              >
                <Smartphone size={16} />
                {activeSyncCode ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
                    연동 상태 확인하기
                  </>
                ) : (
                  '지금 바로 연동하기 📱'
                )}
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 3단계 가이드 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* STEP 1 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-xl bg-indigo-500 text-white text-xs font-black flex items-center justify-center shadow-sm">
                    1
                  </span>
                  <Laptop size={18} className="text-indigo-300" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                  PC에서 [연동하기] 클릭
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  버튼 한 번만 누르면 나만의 <strong>6자리 고유 코드</strong>와 <strong>연동용 QR 코드</strong>가 즉시 생성됩니다.
                </p>
              </div>

              {/* STEP 2 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-xl bg-purple-500 text-white text-xs font-black flex items-center justify-center shadow-sm">
                    2
                  </span>
                  <QrCode size={18} className="text-purple-300" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                  스마트폰 카메라로 QR 찰칵!
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  스마트폰 기본 카메라로 비추기만 하면 <strong>코드 입력 없이 1초 만에 자동 연결</strong>됩니다.
                </p>
              </div>

              {/* STEP 3 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow-sm">
                    3
                  </span>
                  <RefreshCw size={18} className="text-emerald-300" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                  실시간 자동 동기화 완료
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  PC든 스마트폰이든 한쪽에서 수정하면 <strong>양방향으로 자동 저장</strong>되어 언제나 최신 일정이 유지됩니다.
                </p>
              </div>
            </div>

            {/* 하단 안심 메시지 */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">🔒 강력한 개인정보 보호:</span>
                모든 일정은 6자리 코드로 기기 내에서 자체 암호화되어 안전하게 전송됩니다.
              </span>
              <span className="text-slate-400">
                기기를 변경하거나 캐시를 지워도 6자리 코드만 있으면 언제든 복구할 수 있어요!
              </span>
            </div>
          </div>
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
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId 
                  ? (entryType === 'expense' ? '지출 내역 수정' : entryType === 'income' ? '부수입 내역 수정' : '체험단 일정 수정') 
                  : (entryType === 'expense' ? '💸 새 지출 기록' : entryType === 'income' ? '💰 새 부수입 기록' : '🎁 새 체험단 등록')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            {/* 상단 유형 전환 탭 (신규 등록 시) */}
            {!editingId && (
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => setEntryType('campaign')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                    entryType === 'campaign'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  🎁 체험단
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryType('expense');
                    if (!newCategory) setNewCategory('food');
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                    entryType === 'expense'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  💸 일상 지출
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryType('income');
                    if (!newCategory) setNewCategory('ad');
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                    entryType === 'income'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  💰 부수입
                </button>
              </div>
            )}

            <form onSubmit={handleSaveSchedule} className="flex flex-col gap-4">
              {/* 💸 1. 일상 지출 폼 */}
              {entryType === 'expense' && (
                <div className="flex flex-col gap-4">
                  {/* 카테고리 선택 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">지출 카테고리</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {EXPENSE_CATEGORIES.map((cat) => {
                        const isSelected = (newCategory || 'food') === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNewCategory(cat.id)}
                            className={`p-2 rounded-xl text-xs font-bold transition-all text-center border ${
                              isSelected
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 지출 내용 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">지출 내용 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="예: 점심 쌀국수, 스타벅스 라떼, 마트 장보기"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all text-sm font-medium"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>

                  {/* 지출 금액 */}
                  <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
                    <label className="block text-xs font-bold text-rose-800 mb-1">지출 금액 (원) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      placeholder="예: 12000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all text-base font-black text-rose-600 bg-white"
                      value={newExpense}
                      onChange={(e) => setNewExpense(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[
                        { label: '+3천', val: 3000 },
                        { label: '+5천', val: 5000 },
                        { label: '+1만', val: 10000 },
                        { label: '+2만', val: 20000 },
                        { label: '+5만', val: 50000 },
                        { label: '+10만', val: 100000 },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => setNewExpense(String((Number(newExpense) || 0) + btn.val))}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold active:scale-95"
                        >
                          {btn.label}
                        </button>
                      ))}
                      {newExpense && (
                        <button
                          type="button"
                          onClick={() => setNewExpense('')}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-bold"
                        >
                          초기화
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 지출 날짜 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">지출 날짜</label>
                    <input
                      type="date"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all text-sm font-medium"
                      value={newVisitDate || toDateInputString(new Date())}
                      onChange={(e) => setNewVisitDate(e.target.value)}
                    />
                    <div className="flex gap-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setNewVisitDate(toDateInputString(new Date()))}
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-rose-300 text-[11px] font-bold text-slate-600 hover:text-rose-600"
                      >
                        오늘
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVisitDate(getOffsetDateString(-1))}
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-rose-300 text-[11px] font-bold text-slate-600 hover:text-rose-600"
                      >
                        어제
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 💰 2. 부수입 폼 */}
              {entryType === 'income' && (
                <div className="flex flex-col gap-4">
                  {/* 카테고리 선택 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">부수입 카테고리</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {INCOME_CATEGORIES.map((cat) => {
                        const isSelected = (newCategory || 'ad') === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNewCategory(cat.id)}
                            className={`p-2 rounded-xl text-xs font-bold transition-all text-center border ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 수입 내용 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">수입 내용 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="예: OOO브랜드 리뷰 원고료 입금, 구글 애드센스 정산, 당근 옷 판매"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>

                  {/* 수입 금액 */}
                  <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                    <label className="block text-xs font-bold text-emerald-800 mb-1">수입 금액 (원) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      placeholder="예: 50000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-base font-black text-emerald-700 bg-white"
                      value={newCash}
                      onChange={(e) => setNewCash(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[
                        { label: '+1만', val: 10000 },
                        { label: '+3만', val: 30000 },
                        { label: '+5만', val: 50000 },
                        { label: '+10만', val: 100000 },
                        { label: '+30만', val: 300000 },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => setNewCash(String((Number(newCash) || 0) + btn.val))}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold active:scale-95"
                        >
                          {btn.label}
                        </button>
                      ))}
                      {newCash && (
                        <button
                          type="button"
                          onClick={() => setNewCash('')}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-bold"
                        >
                          초기화
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 입금 날짜 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">입금/수익 날짜</label>
                    <input
                      type="date"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium"
                      value={newVisitDate || toDateInputString(new Date())}
                      onChange={(e) => setNewVisitDate(e.target.value)}
                    />
                    <div className="flex gap-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setNewVisitDate(toDateInputString(new Date()))}
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-600 hover:text-emerald-600"
                      >
                        오늘
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVisitDate(getOffsetDateString(-1))}
                        className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-600 hover:text-emerald-600"
                      >
                        어제
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 🎁 3. 기존 체험단 캠페인 폼 */}
              {entryType === 'campaign' && (
                <>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">방문/시작일</label>
                      <input 
                        type="date" 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                        value={newVisitDate}
                        onChange={(e) => setNewVisitDate(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <button
                          type="button"
                          onClick={() => setNewVisitDate(toDateInputString(new Date()))}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[11px] font-bold text-slate-600 hover:text-indigo-600"
                        >
                          오늘
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewVisitDate(getOffsetDateString(1))}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[11px] font-bold text-slate-600 hover:text-indigo-600"
                        >
                          내일
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewVisitDate(getThisSaturdayString())}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-[11px] font-bold text-slate-600 hover:text-indigo-600"
                        >
                          이번주 토
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">포스팅 마감일 <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                        value={newDeadlineDate}
                        onChange={(e) => setNewDeadlineDate(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[7, 10, 14].map((daysOffset) => (
                          <button
                            key={daysOffset}
                            type="button"
                            onClick={() => setNewDeadlineDate(getOffsetDateString(daysOffset, newVisitDate || undefined))}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-pink-300 text-[11px] font-bold text-slate-600 hover:text-pink-600"
                          >
                            +{daysOffset}일
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 가계부 정보 */}
              <div className="bg-green-50/50 p-4 rounded-2xl border border-green-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-green-700 tracking-wide">가계부 정보 (선택 — 버튼으로 1초 입력)</h4>
                </div>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">제공 혜택(식사권·제품) <span className="text-slate-400 font-normal">원</span></label>
                    <input 
                      type="number" 
                      placeholder="예: 30000"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm bg-white font-bold text-slate-800"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[
                        { label: '+1만', val: 10000 },
                        { label: '+2만', val: 20000 },
                        { label: '+3만', val: 30000 },
                        { label: '+5만', val: 50000 },
                        { label: '+10만', val: 100000 },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => setNewBenefit(String((Number(newBenefit) || 0) + btn.val))}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold transition active:scale-95"
                        >
                          {btn.label}
                        </button>
                      ))}
                      {newBenefit && (
                        <button
                          type="button"
                          onClick={() => setNewBenefit('')}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-bold"
                        >
                          초기화
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">지원금(원고료·포인트) <span className="text-slate-400 font-normal">원</span></label>
                      <input 
                        type="number" 
                        placeholder="예: 10000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm bg-white font-bold text-slate-800"
                        value={newCash}
                        onChange={(e) => setNewCash(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          { label: '+5천', val: 5000 },
                          { label: '+1만', val: 10000 },
                          { label: '+3만', val: 30000 },
                        ].map((btn) => (
                          <button
                            key={btn.label}
                            type="button"
                            onClick={() => setNewCash(String((Number(newCash) || 0) + btn.val))}
                            className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-extrabold"
                          >
                            {btn.label}
                          </button>
                        ))}
                        {newCash && (
                          <button
                            type="button"
                            onClick={() => setNewCash('')}
                            className="px-2 py-0.5 rounded-md bg-white text-slate-400 border border-slate-200 text-[11px] font-bold"
                          >
                            0
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">초과 지출 (내돈내산) <span className="text-slate-400 font-normal">원</span></label>
                      <input 
                        type="number" 
                        placeholder="예: 5000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all text-sm bg-white"
                        value={newExpense}
                        onChange={(e) => setNewExpense(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

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
                  className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors shadow-md ${
                    entryType === 'expense'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : entryType === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
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
                            <span className="block text-[10px] font-bold text-indigo-600 mb-0.5">방문/시작일 (자동)</span>
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
                            <span className="block text-[10px] font-bold text-pink-600 mb-0.5">포스팅 마감일 *</span>
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

                        {/* 원클릭 금액 & 날짜 빠른 조정 버튼 바 */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-slate-400 font-bold mr-0.5">💰 혜택 빠른입력:</span>
                            {[
                              { label: '+1만', val: 10000 },
                              { label: '+3만', val: 30000 },
                              { label: '+5만', val: 50000 },
                              { label: '+10만', val: 100000 },
                            ].map((btn) => (
                              <button
                                key={btn.label}
                                type="button"
                                onClick={() => {
                                  const next = [...parsedPreviewList];
                                  next[idx] = {
                                    ...next[idx],
                                    benefitAmount: (next[idx].benefitAmount || 0) + btn.val,
                                  };
                                  setParsedPreviewList(next);
                                }}
                                className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold transition active:scale-95"
                              >
                                {btn.label}
                              </button>
                            ))}
                            {item.benefitAmount > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...parsedPreviewList];
                                  next[idx] = { ...next[idx], benefitAmount: 0 };
                                  setParsedPreviewList(next);
                                }}
                                className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold"
                              >
                                0원
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-bold mr-0.5">📅 시작일:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...parsedPreviewList];
                                next[idx] = { ...next[idx], visitDate: toDateInputString(new Date()) };
                                setParsedPreviewList(next);
                              }}
                              className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold"
                            >
                              오늘
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...parsedPreviewList];
                                next[idx] = { ...next[idx], visitDate: getThisSaturdayString() };
                                setParsedPreviewList(next);
                              }}
                              className="px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold"
                            >
                              이번주 토
                            </button>
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

      {/* 📱 모바일 ↔ PC 간편 연동 모달 */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => {
          setIsSyncModalOpen(false);
          setActiveSyncCode(getSavedSyncCode());
        }}
        currentSchedules={schedules}
        onSchedulesSynced={(newSchedules) => {
          if (Array.isArray(newSchedules)) {
            setSchedules(newSchedules as Schedule[]);
            localStorage.setItem('gifty_schedules', JSON.stringify(newSchedules));
            setActiveSyncCode(getSavedSyncCode());
          }
        }}
      />
    </main>
  );
}
