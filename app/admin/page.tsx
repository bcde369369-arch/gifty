'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSiteSettings } from '@/lib/settings';
import { getAdminVisitorStats, VisitorStatsSummary } from '@/lib/visitorStats';
import { Save, LogOut, LayoutDashboard, Link as LinkIcon, Type, Sparkles, Users, Eye, TrendingUp, RefreshCw } from 'lucide-react';
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
                  <LayoutDashboard size={20} /> 실시간 방문자 통계 (일방문자 · 누적 방문자)
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  한국 시간(KST) 자정 기준으로 집계되는 일방문자(UV) 및 누적 방문자 현황입니다.
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

              {/* 3. 오늘 페이지뷰 */}
              <div className="bg-slate-50 border border-slate-200/80 p-4 md:p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-600">👀 오늘 페이지뷰</span>
                  <Eye size={16} className="text-slate-400" />
                </div>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-slate-200 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl md:text-3xl font-black text-slate-800">
                    {(visitorStats?.todayPageviews ?? 0).toLocaleString()}
                    <span className="text-sm font-bold text-slate-500 ml-1">회</span>
                  </div>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-2">
                  오늘 총 접속 세션 수
                </p>
              </div>

              {/* 4. 누적 총 페이지뷰 */}
              <div className="bg-slate-50 border border-slate-200/80 p-4 md:p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-600">📈 누적 페이지뷰</span>
                  <Sparkles size={16} className="text-slate-400" />
                </div>
                {isLoadingStats ? (
                  <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-lg my-1" />
                ) : (
                  <div className="text-2xl md:text-3xl font-black text-slate-800">
                    {(visitorStats?.totalPageviews ?? 0).toLocaleString()}
                    <span className="text-sm font-bold text-slate-500 ml-1">회</span>
                  </div>
                )}
                <p className="text-[11px] font-medium text-slate-400 mt-2">
                  지금까지 총 열람 수(PV)
                </p>
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
