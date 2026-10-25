'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { settings, saveSettings, isLoaded } = useSiteSettings();
  
  // Local state for the form
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Visitor stats state
  const [visitorStats, setVisitorStats] = useState<VisitorStatsSummary | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [pageRankMode, setPageRankMode] = useState<'today' | 'total'>('today');

  // CounterAPI v2 configuration state
  const [showCounterConfig, setShowCounterConfig] = useState(false);
  const [counterWorkspace, setCounterWorkspace] = useState('');
  const [counterApiKey, setCounterApiKey] = useState('');
  const [isTestingCounter, setIsTestingCounter] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const config = getCounterConfig();
    setCounterWorkspace(config.workspace);
    setCounterApiKey(config.apiKey);
  }, []);

  const handleTestCounter = async () => {
    setIsTestingCounter(true);
    setTestResult(null);
    const res = await testCounterApiConnection(counterWorkspace, counterApiKey);
    setTestResult(res);
    setIsTestingCounter(false);
  };

  const handleSaveCounterConfig = () => {
    saveCounterConfig(counterWorkspace, counterApiKey);
    alert('CounterAPI 설정이 저장되었습니다! 통계를 새로고침합니다.');
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
        <div className="flex justify-between items-end mb-8">
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

        <div className="space-y-8">
          {/* Visitor Stats Section */}
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-1">
                  <LayoutDashboard size={20} /> 실시간 방문자 및 인기 페이지 통계
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  한국 시간(KST) 자정 기준으로 집계되는 일방문자(UV), 누적 방문자, 카테고리별 클릭 순위입니다.
                  {visitorStats?.updatedAt && (
                    <span className="ml-2 text-xs text-slate-400">
                      (업데이트: {visitorStats.updatedAt})
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
                  카운터 API 설정
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl shadow-sm transition-colors text-xs flex items-center gap-1.5"
                >
                  구글 애널리틱스 &rarr;
                </a>
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
                  입력 후 아래 &apos;연동 테스트&apos;로 바로 확인하실 수 있습니다.
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

            {/* 4대 핵심 방문자 지표 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* 1. 오늘 일방문자 */}
              <div className="bg-indigo-50/80 border border-indigo-100 p-4 md:p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-indigo-700">🟢 오늘 일방문자</span>
                  <Users size={16} className="text-indigo-500" />
                </div>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-indigo-200/60 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl md:text-3xl font-black text-indigo-950">
                    {(visitorStats?.todayVisitors ?? 0).toLocaleString()}
                    <span className="text-sm font-bold text-indigo-600 ml-1">명</span>
                  </div>
                )}
                <p className="text-[11px] font-semibold text-indigo-600/80 mt-2">
                  어제 방문자: {(visitorStats?.yesterdayVisitors ?? 0).toLocaleString()}명
                </p>
              </div>

              {/* 2. 누적 총 방문자 */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 md:p-5 rounded-2xl shadow-md flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-indigo-100">🔥 누적 총 방문자</span>
                  <TrendingUp size={16} className="text-indigo-200" />
                </div>
                {isLoadingStats ? (
                  <div className="h-8 w-24 bg-white/20 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl md:text-3xl font-black text-white">
                    {(visitorStats?.totalVisitors ?? 0).toLocaleString()}
                    <span className="text-sm font-bold text-indigo-100 ml-1">명</span>
                  </div>
                )}
                <p className="text-[11px] font-medium text-indigo-100/90 mt-2">
                  순수 누적 방문자(UV) 합계
                </p>
              </div>

              {/* 3. 오늘 페이지뷰 (클릭 시 오늘 순위 탭 활성화) */}
              <button
                type="button"
                onClick={() => setPageRankMode('today')}
                className={`text-left p-4 md:p-5 rounded-2xl flex flex-col justify-between transition-all ${
                  pageRankMode === 'today'
                    ? 'bg-pink-50/80 border-2 border-pink-400 shadow-sm'
                    : 'bg-slate-50 border border-slate-200/80 hover:border-pink-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2 w-full">
                  <span className="text-xs font-extrabold text-slate-700">👀 오늘 페이지뷰</span>
                  <Eye size={16} className={pageRankMode === 'today' ? 'text-pink-500' : 'text-slate-400'} />
                </div>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-slate-200 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl md:text-3xl font-black text-slate-800">
                    {(visitorStats?.todayPageviews ?? 0).toLocaleString()}
                    <span className="text-sm font-bold text-slate-500 ml-1">회</span>
                  </div>
                )}
                <p className="text-[11px] font-bold text-pink-600 mt-2 flex items-center gap-1">
                  오늘 클릭 순위 보기 ▾
                </p>
              </button>

              {/* 4. 누적 총 페이지뷰 (클릭 시 누적 순위 탭 활성화) */}
              <button
                type="button"
                onClick={() => setPageRankMode('total')}
                className={`text-left p-4 md:p-5 rounded-2xl flex flex-col justify-between transition-all ${
                  pageRankMode === 'total'
                    ? 'bg-indigo-50/80 border-2 border-indigo-400 shadow-sm'
                    : 'bg-slate-50 border border-slate-200/80 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2 w-full">
                  <span className="text-xs font-extrabold text-slate-700">📈 누적 페이지뷰</span>
                  <Sparkles size={16} className={pageRankMode === 'total' ? 'text-indigo-500' : 'text-slate-400'} />
                </div>
                {isLoadingStats ? (
                  <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl md:text-3xl font-black text-slate-800">
                    {(visitorStats?.totalPageviews ?? 0).toLocaleString()}
                    <span className="text-sm font-bold text-slate-500 ml-1">회</span>
                  </div>
                )}
                <p className="text-[11px] font-bold text-indigo-600 mt-2 flex items-center gap-1">
                  누적 클릭 순위 보기 ▾
                </p>
              </button>
            </div>

            {/* 🔥 카테고리별 인기 페이지 클릭 순위 보드 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <MousePointerClick size={16} className="text-pink-600" />
                    어떤 페이지를 가장 많이 클릭했을까요? (인기 카테고리 TOP 6)
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
                  Array.from({ length: 6 }).map((_, i) => (
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

          {/* Main Hero Section Settings */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
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
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
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
