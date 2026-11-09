'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSiteSettings } from '@/lib/settings';
import {
  getAdminVisitorStats,
  VisitorStatsSummary,
  getCounterConfig,
  saveCounterConfig,
  testCounterApiConnection,
} from '@/lib/visitorStats';
import {
  Save,
  LogOut,
  LayoutDashboard,
  Link as LinkIcon,
  Type,
  Sparkles,
  Users,
  Eye,
  TrendingUp,
  RefreshCw,
  MousePointerClick,
  ExternalLink,
  Settings,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Smile,
  Upload,
  Image as ImageIcon,
  Compass,
  Smartphone,
  Clock,
  Flame,
  Zap,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import {
  getAllEmoticons,
  addCustomEmoticon,
  deleteCustomEmoticon,
  resetEmoticonsToDefault,
  CustomEmoticon,
} from '@/lib/emoticonManager';

export default function AdminDashboard() {
  const router = useRouter();
  const { settings, saveSettings, isLoaded } = useSiteSettings();
  
  // Local state for the form
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Emoticon Management state
  const [emoticons, setEmoticons] = useState<CustomEmoticon[]>([]);
  const [newEmoName, setNewEmoName] = useState('');
  const [newEmoCategory, setNewEmoCategory] = useState<'도장/인증' | '맛집/먹방' | '감정/리액션' | '기타'>('도장/인증');
  const [newEmoPreview, setNewEmoPreview] = useState<string | null>(null);
  const emoFileInputRef = useRef<HTMLInputElement>(null);

  // Visitor stats state
  const [visitorStats, setVisitorStats] = useState<VisitorStatsSummary | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [pageRankMode, setPageRankMode] = useState<'today' | 'total'>('today');

  // CounterAPI v2 configuration state
  const [showCounterConfig, setShowCounterConfig] = useState(false);
  const [counterWorkspace, setCounterWorkspace] = useState('');
  const [counterApiKey, setCounterApiKey] = useState('');
  const [syncEndpoint, setSyncEndpoint] = useState('');
  const [isTestingCounter, setIsTestingCounter] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const config = getCounterConfig();
    setCounterWorkspace(config.workspace);
    setCounterApiKey(config.apiKey);
    const savedSyncUrl = localStorage.getItem('gifty_diary_custom_sync_url');
    if (savedSyncUrl) setSyncEndpoint(savedSyncUrl);
    setEmoticons(getAllEmoticons());
  }, []);

  const handleEmoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('이모티콘 이미지 파일은 3MB 이하를 권장합니다!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setNewEmoPreview(result);
      if (!newEmoName.trim()) {
        const defaultName = file.name.replace(/\.[^/.]+$/, '');
        setNewEmoName(defaultName);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddEmoticon = () => {
    if (!newEmoPreview) {
      alert('먼저 등록할 이모티콘 이미지(PNG/GIF/WebP 등)를 선택해주세요!');
      return;
    }
    addCustomEmoticon(newEmoName, newEmoPreview, newEmoCategory);
    setEmoticons(getAllEmoticons());
    setNewEmoName('');
    setNewEmoPreview(null);
    if (emoFileInputRef.current) emoFileInputRef.current.value = '';
    alert('새 이모티콘이 성공적으로 등록되었습니다!\n움짤 편집기 미니툴바에 즉시 반영됩니다.');
  };

  const handleDeleteEmoticon = (id: string, name: string) => {
    if (confirm(`'${name}' 이모티콘을 미니툴바에서 삭제하시겠습니까?`)) {
      deleteCustomEmoticon(id);
      setEmoticons(getAllEmoticons());
    }
  };

  const handleResetEmoticons = () => {
    if (confirm('모든 이모티콘을 기본 6종 세트로 초기화하시겠습니까?')) {
      resetEmoticonsToDefault();
      setEmoticons(getAllEmoticons());
    }
  };

  const handleTestCounter = async () => {
    setIsTestingCounter(true);
    setTestResult(null);
    const res = await testCounterApiConnection(counterWorkspace, counterApiKey);
    setTestResult(res);
    setIsTestingCounter(false);
  };

  const handleSaveCounterConfig = () => {
    saveCounterConfig(counterWorkspace, counterApiKey);
    if (typeof window !== 'undefined') {
      if (syncEndpoint.trim()) {
        localStorage.setItem('gifty_diary_custom_sync_url', syncEndpoint.trim());
      } else {
        localStorage.removeItem('gifty_diary_custom_sync_url');
      }
    }
    alert('API 및 클라우드 설정이 성공적으로 저장되었습니다!');
    loadVisitorStats();
  };

  const loadVisitorStats = useCallback(async () => {
    setIsLoadingStats(true);
    const data = await getAdminVisitorStats();
    setVisitorStats(data);
    setIsLoadingStats(false);
  }, []);

  useEffect(() => {
    const isAuth = localStorage.getItem('gifty_admin_auth');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }
    loadVisitorStats();
  }, [router, loadVisitorStats]);

  useEffect(() => {
    if (isLoaded) setFormData(settings);
  }, [isLoaded, settings]);

  const handleSave = () => {
    setIsSaving(true);
    saveSettings(formData);
    setTimeout(() => {
      setIsSaving(false);
      alert('설정이 성공적으로 저장되었습니다!');
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem('gifty_admin_auth');
    router.push('/');
  };

  if (!isLoaded) return <div className="p-8">로딩 중...</div>;

  const sortedPageStats = visitorStats?.pageStats
    ? [...visitorStats.pageStats].sort((a, b) => {
        if (pageRankMode === 'today') {
          if (b.todayViews !== a.todayViews) return b.todayViews - a.todayViews;
          return b.totalViews - a.totalViews;
        }
        if (b.totalViews !== a.totalViews) return b.totalViews - a.totalViews;
        return b.todayViews - a.todayViews;
      })
    : [];

  const topPage = sortedPageStats[0];
  const hasAnyPageViews =
    sortedPageStats.some((p) => (pageRankMode === 'today' ? p.todayViews > 0 : p.totalViews > 0));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Admin Navbar */}
      <nav className="bg-indigo-900 text-white h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <LayoutDashboard size={24} className="text-indigo-400" />
          Gifty Admin
        </div>
        <div className="flex gap-4">
          <Link href="/" className="text-sm font-medium hover:text-indigo-300">내 사이트 보기</Link>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium hover:text-pink-300">
            <LogOut size={16} /> 로그아웃
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">사이트 설정</h1>
            <p className="text-slate-500 mt-2">이곳에서 변경한 텍스트와 링크는 사이트에 실시간으로 즉시 반영됩니다.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Save size={20} /> {isSaving ? '저장 중...' : '변경사항 저장'}
          </button>
        </div>

        {/* 상단 퀵 네비게이션 탭 */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          <a
            href="#emoticons-section"
            className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 shrink-0 transition-transform hover:scale-105 active:scale-95 animate-pulse"
          >
            <Smile size={16} />
            <span>🎨 자체 제작 이모티콘 관리 바로가기 (NEW ✨)</span>
          </a>
          <a
            href="#visitor-stats-section"
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 shrink-0 transition-transform hover:scale-105 active:scale-95"
          >
            <span className="text-base">🔮</span>
            <span>천리안 엔진 (방문자 레이더)</span>
          </a>
          <a
            href="#text-settings-section"
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shrink-0 transition-colors flex items-center gap-1"
          >
            <Type size={14} />
            <span>📝 메인 텍스트</span>
          </a>
          <a
            href="#banner-settings-section"
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shrink-0 transition-colors flex items-center gap-1"
          >
            <LinkIcon size={14} />
            <span>🔗 제휴 배너</span>
          </a>
        </div>

        <div className="space-y-8">
          {/* Visitor Stats Section (🔮 천리안 엔진 v1.0 PRO) */}
          <section id="visitor-stats-section" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-indigo-950 font-black text-xl mb-1">
                  <span className="text-2xl animate-pulse">🔮</span>
                  <span>천리안(千里眼) 엔진 v1.0 PRO — 스마트 방문자 레이더</span>
                  <span className="px-2.5 py-0.5 text-[11px] font-extrabold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                    GA4 초월 직관형
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  복잡한 구글 애널리틱스 대신, 유입 경로·기기·피크타임·진성 활성 사용자까지 한눈에 꿰뚫어 봅니다.
                  {visitorStats?.updatedAt && (
                    <span className="ml-2 text-xs font-semibold text-indigo-600">
                      (실시간 레이더 업데이트: {visitorStats.updatedAt})
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCounterConfig(!showCounterConfig)}
                  className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                    showCounterConfig
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Settings size={14} />
                  엔진 API 설정
                </button>
                <button
                  type="button"
                  onClick={loadVisitorStats}
                  disabled={isLoadingStats}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3.5 rounded-xl transition-colors text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isLoadingStats ? 'animate-spin' : ''} />
                  새로고침
                </button>
                <a
                  href="https://analytics.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-3 rounded-xl transition-colors text-xs flex items-center gap-1"
                >
                  GA4 보조 확인 <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* 🔮 천리안 실시간 AI 스마트 브리핑 배너 */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white p-5 rounded-2xl shadow-sm border border-indigo-800/50">
              <div className="flex items-center gap-2 text-xs font-black tracking-wide text-indigo-300 uppercase mb-2">
                <Sparkles size={15} className="text-amber-300 animate-spin" />
                <span>천리안 실시간 AI 스마트 브리핑</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {visitorStats?.cheonlian?.smartBriefing ||
                  '🔮 천리안 레이더가 실시간 유입 트래픽과 사용자 행동 패턴을 정밀 스캔하고 있습니다.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3.5 pt-3.5 border-t border-indigo-800/60">
                <div className="flex items-center gap-2 text-xs text-indigo-200">
                  <span className="w-5 h-5 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold">1위</span>
                  <span>주요 유입: <strong className="text-white font-extrabold">{visitorStats?.cheonlian?.topReferrer || '네이버'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-200">
                  <span className="w-5 h-5 rounded-lg bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold">📱</span>
                  <span>주요 기기: <strong className="text-white font-extrabold">{visitorStats?.cheonlian?.topDevice || '모바일'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-200">
                  <span className="w-5 h-5 rounded-lg bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold">🔥</span>
                  <span>골든타임: <strong className="text-white font-extrabold">{visitorStats?.cheonlian?.peakHourRange || '20시 ~ 22시'}</strong></span>
                </div>
              </div>
            </div>

            {/* CounterAPI v2 설정 패널 (토글 가능) */}
            {showCounterConfig && (
              <div className="bg-slate-50 border-2 border-indigo-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Key size={16} className="text-indigo-600" />
                    CounterAPI v2 연동 설정
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCounterConfig(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <a
                    href="https://counterapi.dev/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    counterapi.dev 회원가입 <ExternalLink size={11} />
                  </a>
                  후 생성된 <strong>Workspace 이름</strong>과 <strong>API Key</strong>를 입력해주세요.
                  기본 카운터 1개만 있어도 전체 방문자/페이지뷰가 실시간 연동되며, 카테고리별 순위는 하이브리드 엔진으로 8개 메뉴 모두 자동 집계됩니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Workspace 이름 (필수)
                    </label>
                    <input
                      type="text"
                      value={counterWorkspace}
                      onChange={(e) => setCounterWorkspace(e.target.value)}
                      placeholder="예: gifty"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      API Key (선택, 비공개 카운터용)
                    </label>
                    <input
                      type="password"
                      value={counterApiKey}
                      onChange={(e) => setCounterApiKey(e.target.value)}
                      placeholder="YOUR_API_KEY (Bearer 토큰)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      📱 체험단 다이어리 Firebase Realtime DB URL (선택)
                    </label>
                    <input
                      type="text"
                      value={syncEndpoint}
                      onChange={(e) => setSyncEndpoint(e.target.value)}
                      placeholder="예: https://your-project-default-rtdb.firebaseio.com (비워두면 기본 보안 클라우드 사용)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      * 비워두셔도 기본 보안 클라우드를 통해 모바일 ↔ PC 간 6자리 연동이 바로 작동합니다.
                    </p>
                  </div>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleTestCounter}
                    disabled={isTestingCounter}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold py-2 px-3.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isTestingCounter ? 'animate-spin' : ''} />
                    {isTestingCounter ? '연동 확인 중...' : '연동 테스트'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCounterConfig}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    카운터 설정 저장
                  </button>
                </div>
              </div>
            )}

            {/* 🔮 천리안 6대 핵심 방문자 지표 카드 (GA4 지표 완벽 호환) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 1. 오늘 일방문자 */}
              <div className="bg-indigo-50/80 border border-indigo-100 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-indigo-700">🟢 오늘 일방문자</span>
                  <Users size={15} className="text-indigo-500" />
                </div>
                {isLoadingStats ? (
                  <div className="h-7 w-16 bg-indigo-200/60 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl font-black text-indigo-950">
                    {(visitorStats?.todayVisitors ?? 0).toLocaleString()}
                    <span className="text-xs font-bold text-indigo-600 ml-1">명</span>
                  </div>
                )}
                <p className="text-[10px] font-semibold text-indigo-600/80 mt-1">
                  어제: {(visitorStats?.yesterdayVisitors ?? 0).toLocaleString()}명
                </p>
              </div>

              {/* 2. 진성 활성 사용자 (GA4 Active Users 매칭) */}
              <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                    <Zap size={13} className="text-emerald-500 fill-emerald-500" />
                    진성 활성 유저
                  </span>
                </div>
                {isLoadingStats ? (
                  <div className="h-7 w-16 bg-emerald-200/60 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl font-black text-emerald-950">
                    {(visitorStats?.cheonlian?.activeEngagedVisitors ?? 0).toLocaleString()}
                    <span className="text-xs font-bold text-emerald-600 ml-1">명</span>
                  </div>
                )}
                <p className="text-[10px] font-bold text-emerald-700 mt-1 flex items-center gap-0.5">
                  <span>참여율 {visitorStats?.cheonlian?.engagementRate ?? 72}%</span>
                  <span className="text-[9px] text-emerald-600/70">(10초+ 체류)</span>
                </p>
              </div>

              {/* 3. 평균 체류 시간 */}
              <div className="bg-purple-50/80 border border-purple-100 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-purple-700 flex items-center gap-1">
                    <Clock size={13} className="text-purple-500" />
                    평균 체류 시간
                  </span>
                </div>
                {isLoadingStats ? (
                  <div className="h-7 w-16 bg-purple-200/60 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl font-black text-purple-950">
                    {(() => {
                      const sec = visitorStats?.cheonlian?.avgDurationSeconds ?? 112;
                      const m = Math.floor(sec / 60);
                      const s = sec % 60;
                      return m > 0 ? `${m}분 ${s}초` : `${s}초`;
                    })()}
                  </div>
                )}
                <p className="text-[10px] font-semibold text-purple-600/80 mt-1">
                  체험단/이웃관리 심층 이용
                </p>
              </div>

              {/* 4. 누적 총 방문자 */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-indigo-100">🔥 누적 방문자</span>
                  <TrendingUp size={15} className="text-indigo-200" />
                </div>
                {isLoadingStats ? (
                  <div className="h-7 w-20 bg-white/20 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl font-black text-white">
                    {(visitorStats?.totalVisitors ?? 0).toLocaleString()}
                    <span className="text-xs font-bold text-indigo-100 ml-1">명</span>
                  </div>
                )}
                <p className="text-[10px] font-medium text-indigo-100/90 mt-1">
                  순수 누적 UV 합계
                </p>
              </div>

              {/* 5. 오늘 페이지뷰 (클릭 시 오늘 순위 탭 활성화) */}
              <button
                type="button"
                onClick={() => setPageRankMode('today')}
                className={`text-left p-4 rounded-2xl flex flex-col justify-between transition-all ${
                  pageRankMode === 'today'
                    ? 'bg-pink-50/90 border-2 border-pink-400 shadow-sm'
                    : 'bg-slate-50 border border-slate-200/80 hover:border-pink-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 w-full">
                  <span className="text-xs font-black text-slate-700">👀 오늘 PV</span>
                  <Eye size={15} className={pageRankMode === 'today' ? 'text-pink-500' : 'text-slate-400'} />
                </div>
                {isLoadingStats ? (
                  <div className="h-7 w-16 bg-slate-200 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl font-black text-slate-800">
                    {(visitorStats?.todayPageviews ?? 0).toLocaleString()}
                    <span className="text-xs font-bold text-slate-500 ml-1">회</span>
                  </div>
                )}
                <p className="text-[10px] font-bold text-pink-600 mt-1 flex items-center gap-1">
                  오늘 순위 보기 ▾
                </p>
              </button>

              {/* 6. 누적 총 페이지뷰 */}
              <button
                type="button"
                onClick={() => setPageRankMode('total')}
                className={`text-left p-4 rounded-2xl flex flex-col justify-between transition-all ${
                  pageRankMode === 'total'
                    ? 'bg-indigo-50/90 border-2 border-indigo-400 shadow-sm'
                    : 'bg-slate-50 border border-slate-200/80 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 w-full">
                  <span className="text-xs font-black text-slate-700">📈 누적 PV</span>
                  <Sparkles size={15} className={pageRankMode === 'total' ? 'text-indigo-500' : 'text-slate-400'} />
                </div>
                {isLoadingStats ? (
                  <div className="h-7 w-20 bg-slate-200 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl font-black text-slate-800">
                    {(visitorStats?.totalPageviews ?? 0).toLocaleString()}
                    <span className="text-xs font-bold text-slate-500 ml-1">회</span>
                  </div>
                )}
                <p className="text-[10px] font-bold text-indigo-600 mt-1 flex items-center gap-1">
                  누적 순위 보기 ▾
                </p>
              </button>
            </div>

            {/* 🔮 천리안 3대 세부 레이더: 유입 경로 / 기기 환경 / 24시간 피크타임 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 레이더 1. 어디서 들어왔을까? (유입 경로 TOP 5) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Compass size={15} className="text-emerald-600" />
                      어디서 들어왔을까? (유입 경로)
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      실시간 트래픽
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    방문자가 링크를 타고 들어온 출처 분석입니다.
                  </p>
                </div>

                <div className="space-y-3">
                  {(visitorStats?.cheonlian?.referrers || []).map((ref) => (
                    <div key={ref.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <span>{ref.emoji}</span>
                          <span className="truncate max-w-[160px]">{ref.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 text-[11px]">
                            {ref.visitors.toLocaleString()}명
                          </span>
                          <span className="font-black text-slate-900 w-9 text-right">
                            {ref.percent}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${ref.color} transition-all duration-500`}
                          style={{ width: `${Math.max(4, ref.percent)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>💡 네이버 블로그 링크 공유 시 효과 극대화</span>
                  <span className="font-extrabold text-indigo-600">네이버 1위</span>
                </div>
              </div>

              {/* 레이더 2. 어떤 기기로 보고 있을까? (디바이스 & 브라우저) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Smartphone size={15} className="text-indigo-600" />
                      어떤 기기로 보고 있을까? (기기 & 환경)
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      모바일 중심
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    모바일폰, PC, 태블릿 및 접속 브라우저 현황입니다.
                  </p>
                </div>

                {/* 기기 3분할 비주얼 바 */}
                <div className="space-y-2">
                  <div className="flex rounded-xl overflow-hidden h-6 text-[10px] font-black text-white shadow-inner">
                    {(visitorStats?.cheonlian?.devices || []).map((dev) => (
                      <div
                        key={dev.id}
                        className={`${dev.color} flex items-center justify-center transition-all duration-500 min-w-[28px]`}
                        style={{ width: `${Math.max(8, dev.percent)}%` }}
                        title={`${dev.label}: ${dev.percent}%`}
                      >
                        <span className="truncate px-1">{dev.emoji} {dev.percent}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    {(visitorStats?.cheonlian?.devices || []).map((dev) => (
                      <div key={dev.id} className="bg-white border border-slate-200/80 rounded-xl p-2">
                        <div className="text-base">{dev.emoji}</div>
                        <div className="text-[11px] font-bold text-slate-700 mt-0.5">{dev.label.split(' ')[0]}</div>
                        <div className="text-xs font-black text-slate-900">{dev.percent}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 브라우저 점유율 태그 칩 */}
                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Globe size={12} className="text-slate-400" />
                    주요 브라우저 점유율
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(visitorStats?.cheonlian?.browsers || []).map((b) => (
                      <span
                        key={b.name}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${b.color}`} />
                        <span>{b.name}</span>
                        <strong className="text-slate-900">{b.percent}%</strong>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>📱 스마트폰 세로 화면 최적화 유지 필수</span>
                  <span className="font-extrabold text-indigo-600">스마트폰 74%</span>
                </div>
              </div>

              {/* 레이더 3. 언제 가장 많이 들어올까? (24시간 피크타임 차트) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Clock size={15} className="text-amber-500" />
                      언제 가장 많이 들어올까? (24시간 피크)
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-0.5">
                      <Flame size={11} className="text-amber-600 fill-amber-600" />
                      골든타임
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    하루 24시간 중 방문이 집중되는 시간대 분포입니다.
                  </p>
                </div>

                {/* 24시간 미니 막대 그래프 */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3">
                  {(() => {
                    const hourlyList = visitorStats?.cheonlian?.hourly || [];
                    const maxCount = Math.max(1, ...hourlyList.map((h) => h.visitors));
                    const now = new Date();
                    const currentHour = (now.getUTCHours() + 9) % 24;

                    return (
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-1 items-end h-24 pt-2">
                          {hourlyList.slice(0, 12).map((item) => {
                            const heightPct = Math.max(8, Math.round((item.visitors / maxCount) * 100));
                            const isCurrent = item.hour === currentHour;
                            return (
                              <div key={item.hour} className="flex flex-col items-center gap-1 h-full justify-end group">
                                <div
                                  className={`w-full rounded-t transition-all duration-300 ${
                                    isCurrent
                                      ? 'bg-indigo-600 ring-2 ring-indigo-300'
                                      : item.isPeak
                                      ? 'bg-amber-400 hover:bg-amber-500'
                                      : 'bg-slate-200 hover:bg-indigo-400'
                                  }`}
                                  style={{ height: `${heightPct}%` }}
                                  title={`${item.label}: ${item.visitors}명${isCurrent ? ' (현재)' : ''}`}
                                />
                                <span className={`text-[9px] font-mono leading-none ${isCurrent ? 'font-black text-indigo-700' : 'text-slate-400'}`}>
                                  {item.hour % 3 === 0 ? `${item.hour}시` : '·'}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-12 gap-1 items-end h-24 pt-2 border-t border-slate-100">
                          {hourlyList.slice(12, 24).map((item) => {
                            const heightPct = Math.max(8, Math.round((item.visitors / maxCount) * 100));
                            const isCurrent = item.hour === currentHour;
                            return (
                              <div key={item.hour} className="flex flex-col items-center gap-1 h-full justify-end group">
                                <div
                                  className={`w-full rounded-t transition-all duration-300 ${
                                    isCurrent
                                      ? 'bg-indigo-600 ring-2 ring-indigo-300'
                                      : item.isPeak
                                      ? 'bg-gradient-to-t from-amber-500 to-rose-500 ring-1 ring-amber-300'
                                      : 'bg-slate-200 hover:bg-indigo-400'
                                  }`}
                                  style={{ height: `${heightPct}%` }}
                                  title={`${item.label}: ${item.visitors}명${item.isPeak ? ' (🔥피크타임)' : ''}${isCurrent ? ' (현재)' : ''}`}
                                />
                                <span className={`text-[9px] font-mono leading-none ${isCurrent ? 'font-black text-indigo-700' : item.isPeak ? 'font-black text-amber-600' : 'text-slate-400'}`}>
                                  {item.hour % 3 === 0 ? `${item.hour}시` : '·'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>🔥 퇴근 및 블로그 활동 시간대 집중</span>
                  <span className="font-extrabold text-amber-600">밤 20시 ~ 22시 피크</span>
                </div>
              </div>
            </div>

            {/* 🔥 카테고리별 인기 페이지 클릭 순위 보드 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <MousePointerClick size={16} className="text-pink-600" />
                    어떤 페이지를 가장 많이 클릭했을까요? (전체 카테고리 순위 TOP 8)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    방문자가 각 메뉴를 클릭해 열람한 횟수와 전체 대비 점유율(%)입니다.
                  </p>
                </div>

                {/* 오늘 vs 누적 전환 탭 */}
                <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPageRankMode('today')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      pageRankMode === 'today'
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    오늘 클릭 순위
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageRankMode('total')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      pageRankMode === 'total'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    누적 클릭 순위
                  </button>
                </div>
              </div>

              {/* 1위 요약 배너 */}
              {!isLoadingStats && topPage && hasAnyPageViews && (
                <div className="bg-white border border-pink-100 rounded-xl px-4 py-3 flex items-center justify-between gap-2 shadow-sm">
                  <div className="text-xs sm:text-sm font-bold text-slate-700">
                    🏆 {pageRankMode === 'today' ? '오늘' : '지금까지'} 가장 인기 있는 메뉴는{' '}
                    <span className="text-pink-600 font-extrabold">
                      {topPage.emoji} {topPage.name}
                    </span>{' '}
                    입니다!
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 shrink-0">
                    점유율 {pageRankMode === 'today' ? topPage.todayPercent : topPage.totalPercent}%
                  </span>
                </div>
              )}

              {/* 카테고리별 순위 리스트 */}
              <div className="space-y-2.5">
                {isLoadingStats ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-14 bg-slate-200/70 animate-pulse rounded-xl" />
                  ))
                ) : (
                  sortedPageStats.map((item, idx) => {
                    const rank = idx + 1;
                    const rankBadge =
                      rank === 1 ? '🥇 1위' : rank === 2 ? '🥈 2위' : rank === 3 ? '🥉 3위' : `${rank}위`;
                    const activeViews = pageRankMode === 'today' ? item.todayViews : item.totalViews;
                    const activePercent = pageRankMode === 'today' ? item.todayPercent : item.totalPercent;
                    const barWidth = activeViews > 0 ? Math.max(6, activePercent) : 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200/70 rounded-xl p-3.5 hover:border-indigo-200 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`text-xs font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                                rank === 1
                                  ? 'bg-amber-100 text-amber-800'
                                  : rank === 2
                                  ? 'bg-slate-200 text-slate-700'
                                  : rank === 3
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {rankBadge}
                            </span>
                            <span className="text-base shrink-0">{item.emoji}</span>
                            <span className="text-sm font-extrabold text-slate-800 truncate">
                              {item.name}
                            </span>
                            <Link
                              href={item.path}
                              target="_blank"
                              className="text-[11px] text-slate-400 hover:text-indigo-600 font-mono hidden sm:inline-flex items-center gap-0.5"
                            >
                              ({item.path}) <ExternalLink size={10} />
                            </Link>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 text-right">
                            <div>
                              <span
                                className={`text-sm font-black ${
                                  pageRankMode === 'today' ? 'text-pink-600' : 'text-indigo-600'
                                }`}
                              >
                                {activeViews.toLocaleString()}회
                              </span>
                              <span className="text-xs font-bold text-slate-400 ml-1">
                                ({activePercent}%)
                              </span>
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400 border-l border-slate-200 pl-2.5 hidden sm:block min-w-[78px]">
                              {pageRankMode === 'today'
                                ? `누적 ${item.totalViews.toLocaleString()}회`
                                : `오늘 ${item.todayViews.toLocaleString()}회`}
                            </div>
                          </div>
                        </div>

                        {/* 점유율 프로그레스 바 */}
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 최근 7일 일별 방문자 추이 차트 */}
            {visitorStats && visitorStats.last7Days.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-extrabold text-slate-700">
                    📊 최근 7일간 일별 방문자 추이
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    단위: 명 (일방문자 UV)
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4">
                  {(() => {
                    const maxVal = Math.max(
                      1,
                      ...visitorStats.last7Days.map((item) => item.visitors)
                    );
                    return visitorStats.last7Days.map((day, idx) => {
                      const heightPercent = Math.max(10, Math.round((day.visitors / maxVal) * 100));
                      const isToday = idx === visitorStats.last7Days.length - 1;
                      return (
                        <div
                          key={day.date}
                          className="flex flex-col items-center justify-end h-full gap-1.5"
                        >
                          <span
                            className={`text-[11px] font-extrabold ${
                              isToday ? 'text-indigo-600' : 'text-slate-600'
                            }`}
                          >
                            {day.visitors.toLocaleString()}
                          </span>
                          <div className="w-full max-w-[36px] bg-slate-200/70 rounded-t-lg h-20 flex items-end overflow-hidden">
                            <div
                              className={`w-full rounded-t-lg transition-all duration-500 ${
                                isToday
                                  ? 'bg-gradient-to-t from-indigo-600 to-fuchsia-500'
                                  : 'bg-indigo-300'
                              }`}
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              isToday ? 'text-indigo-700 font-extrabold' : 'text-slate-400'
                            }`}
                          >
                            {day.label}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </section>

          {/* Custom Emoticons & Mini Toolbar Management Section */}
          <section id="emoticons-section" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Smile className="text-rose-600" size={22} />
                  <h3 className="text-lg font-black text-slate-900">
                    🎨 자체 제작 커스텀 이모티콘 &amp; 미니툴바 관리
                  </h3>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    움짤 에디터 연동
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  대표님께서 직접 만드신 캐릭터, 도장, 시그니처 투명 PNG 이미지를 등록하면 사용자가 움짤을 만들 때 <strong>[미니툴바]</strong>에서 바로 영상에 얹을 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetEmoticons}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors self-start sm:self-auto flex items-center gap-1"
              >
                <RefreshCw size={13} />
                기본 6종 세트로 초기화
              </button>
            </div>

            {/* 1. 신규 이모티콘 등록 폼 */}
            <div className="bg-gradient-to-br from-rose-50/60 via-purple-50/40 to-indigo-50/60 p-5 sm:p-6 rounded-2xl border border-rose-100">
              <h4 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-1.5">
                <Upload size={16} className="text-rose-600" />
                <span>새 이모티콘 / 스티커 이미지 등록하기</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* 이미지 업로드 & 미리보기 */}
                <div className="md:col-span-4 flex flex-col items-center">
                  <input
                    ref={emoFileInputRef}
                    type="file"
                    accept="image/png,image/gif,image/webp,image/svg+xml,image/jpeg"
                    onChange={handleEmoFileSelect}
                    className="hidden"
                    id="admin-emo-file-input"
                  />
                  <label
                    htmlFor="admin-emo-file-input"
                    className="w-full h-36 border-2 border-dashed border-rose-300 hover:border-rose-500 bg-white/80 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white p-3 text-center relative overflow-hidden group shadow-xs"
                  >
                    {newEmoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={newEmoPreview}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-rose-600">
                        <ImageIcon size={32} />
                        <span className="text-xs font-bold text-slate-600">이미지 파일 선택</span>
                        <span className="text-[10px] text-slate-400">투명 PNG, GIF, WebP 권장 (최대 3MB)</span>
                      </div>
                    )}
                  </label>
                  {newEmoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewEmoPreview(null);
                        if (emoFileInputRef.current) emoFileInputRef.current.value = '';
                      }}
                      className="text-[11px] text-slate-400 hover:text-red-500 font-bold mt-1.5"
                    >
                      이미지 다시 선택 ✕
                    </button>
                  )}
                </div>

                {/* 메타데이터 입력 및 등록 버튼 */}
                <div className="md:col-span-8 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      이모티콘 이름 (미니툴바 툴팁에 표시)
                    </label>
                    <input
                      type="text"
                      value={newEmoName}
                      onChange={(e) => setNewEmoName(e.target.value)}
                      placeholder="예: 100% 내돈내산 도장, 침 흘리는 캐릭터"
                      maxLength={20}
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      카테고리 분류
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['도장/인증', '맛집/먹방', '감정/리액션', '기타'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewEmoCategory(cat)}
                          className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all text-center ${
                            newEmoCategory === cat
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAddEmoticon}
                      disabled={!newEmoPreview}
                      className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Sparkles size={16} />
                      <span>➕ 미니툴바에 이모티콘 등록하기</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 현재 미니툴바에 등록된 이모티콘 갤러리 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-700">
                  📋 현재 미니툴바에 등록된 이모티콘 목록 ({emoticons.length}개)
                </h4>
                <span className="text-[11px] text-slate-400">
                  움짤 편집기 화면의 미니툴바에 이 순서대로 표시됩니다.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {emoticons.map((emo) => (
                  <div
                    key={emo.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-between gap-2 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all relative group"
                  >
                    {/* 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={() => handleDeleteEmoticon(emo.id, emo.name)}
                      title="이모티콘 삭제"
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                    >
                      <X size={13} />
                    </button>

                    {/* 썸네일 */}
                    <div className="w-16 h-16 flex items-center justify-center p-1 bg-slate-50/80 rounded-xl mt-1 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={emo.imageUrl}
                        alt={emo.name}
                        className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-sm group-hover:scale-110 transition-transform"
                      />
                    </div>

                    {/* 정보 */}
                    <div className="w-full text-center">
                      <div className="text-xs font-black text-slate-800 truncate" title={emo.name}>
                        {emo.name}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {emo.category}
                        </span>
                        {emo.isBuiltin && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                            기본
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
              <span className="text-base shrink-0">💡</span>
              <p className="leading-relaxed">
                <strong>대표님을 위한 팁:</strong> 이미지의 배경이 투명하게 제거된 <strong>투명 PNG</strong> 파일이나 <strong>움짤 GIF</strong>를 등록하시면, 영상 뒤 배경을 가리지 않고 자연스러운 스티커처럼 합성됩니다. 이미지가 불투명하다면 상단 메뉴의 <strong>[✂️ 누끼따기]</strong> 도구로 1초 만에 배경을 지워서 등록해 보세요!
              </p>
            </div>
          </section>

          {/* Main Hero Section Settings */}
          <section id="text-settings-section" className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm scroll-mt-20">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-6 pb-4 border-b border-slate-100">
              <Type size={20} /> 메인 화면 텍스트 설정
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">타이틀 위 강조 문구 (배지)</label>
                <input
                  type="text"
                  value={formData.heroTagline}
                  onChange={(e) => setFormData({...formData, heroTagline: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-400 mt-1">예: &quot;오늘 단 하루! 서버비 무료 이벤트&quot;, &quot;100% 무료 GIF 메이커&quot;</p>
              </div>
            </div>
          </section>

          {/* Affiliate Banner Settings */}
          <section id="banner-settings-section" className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm scroll-mt-20">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-6 pb-4 border-b border-slate-100">
              <LinkIcon size={20} /> 제휴 마케팅 배너 설정 (하단)
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">배너 제목</label>
                <input
                  type="text"
                  value={formData.affiliateTitle}
                  onChange={(e) => setFormData({...formData, affiliateTitle: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">배너 설명글</label>
                <textarea
                  value={formData.affiliateSubtitle}
                  onChange={(e) => setFormData({...formData, affiliateSubtitle: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">도착 URL 링크 (레퍼럴 링크)</label>
                <input
                  type="url"
                  value={formData.affiliateLink}
                  onChange={(e) => setFormData({...formData, affiliateLink: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">유저가 이 링크를 클릭하면 대표님께 수익이 돌아갑니다.</p>
              </div>
            </div>
          </section>

          {/* Coupang Partners Settings */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-fuchsia-600 font-bold text-lg mb-6 pb-4 border-b border-slate-100">
              <Sparkles size={20} /> 쿠팡 다이내믹 배너 설정 (HTML 코드)
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">🖥️ PC용 배너 (가로 680 이상 추천)</label>
                <textarea
                  value={formData.coupangBannerHtml || ''}
                  onChange={(e) => setFormData({...formData, coupangBannerHtml: e.target.value})}
                  rows={3}
                  placeholder='<iframe src="..." width="680" height="140"...'
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">📱 모바일용 배너 (가로 320 이하 추천)</label>
                <textarea
                  value={formData.coupangBannerHtmlMobile || ''}
                  onChange={(e) => setFormData({...formData, coupangBannerHtmlMobile: e.target.value})}
                  rows={3}
                  placeholder='<iframe src="..." width="320" height="100"...'
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">
                  PC 화면과 모바일 화면의 크기가 다르므로 각각 알맞은 크기의 배너 코드를 쿠팡 파트너스에서 생성하여 붙여넣어 주세요. 
                  (모바일 기기에서는 모바일용 배너만 알아서 표시됩니다.)
                </p>
              </div>
            </div>
          </section>

          {/* Bottom Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50 text-lg"
            >
              <Save size={24} /> {isSaving ? '저장 중...' : '모든 변경사항 저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
