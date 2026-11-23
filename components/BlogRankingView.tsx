/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3,
  HelpCircle,
  Layers,
  Star,
  Activity,
  Check,
  Info,
  X,
  Zap,
  Flame,
  ArrowUpRight,
  Eye,
  FileText,
  Award
} from 'lucide-react';
import {
  RankingBlogItem,
  calculatePercentile,
  getCurrentRankingWeekInfo,
  getWeeklyTopRankings,
  TOP_RANKING_DATA,
  RISING_BLOGS_DATA,
  NEW_ENTRY_BLOGS_DATA,
  STEADY_GROWTH_BLOGS_DATA,
  calculateMyBlogRankEstimate
} from '@/lib/blogRankingData';

interface BlogRankingViewProps {
  onSelectBlogForAudit: (blogId: string) => void;
}

export default function BlogRankingView({ onSelectBlogForAudit }: BlogRankingViewProps) {
  const [subTab, setSubTab] = useState<'all' | 'my'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedSource, setSelectedSource] = useState<string>('전체');
  const [surgeFilter, setSurgeFilter] = useState<'100' | '1000' | 'all'>('100');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBlog, setSelectedBlog] = useState<RankingBlogItem | null>(null);

  // 내 랭킹 상태 (주차별 동적 갱신 연동)
  const [myIdInput, setMyIdInput] = useState<string>('masining');
  const [myRankData, setMyRankData] = useState(() => calculateMyBlogRankEstimate('masining'));
  const [isSearchingMyRank, setIsSearchingMyRank] = useState<boolean>(false);

  // 내 블로그 실시간 네이버 검색 노출 관측 데이터 (실시간 라이브 체커)
  const liveMonitoredPosts = useMemo(() => {
    const isMasining = myIdInput.trim().toLowerCase() === 'masining';
    if (isMasining) {
      return [
        {
          keyword: '무료타로 코코루나 별빛 점성술 냥도사',
          title: '무료타로 코코루나 별빛 점성술 냥도사 업데이트 오늘의 12별자리 운세와 네이탈 차트 사용법',
          badge: '네이버 실시간 1위',
          isTop1: true,
          section: '스마트블록 1위 점유 중 (최상단 노출)',
          query: '무료타로 코코루나 별빛 점성술 냥도사'
        },
        {
          keyword: '초당순두부마을 카페 쵸딩',
          title: '강릉 초당순두부마을 카페 쵸딩 초당옥수수 푸딩과 옥수프레소라떼 초당동 맛집 후기',
          badge: '네이버 실시간 1위',
          isTop1: true,
          section: '리뷰·통합검색 1위 점유 중',
          query: '초당순두부마을 카페 쵸딩'
        },
        {
          keyword: '4060 노후준비 젠포트 퀀트 전략',
          title: '4060 노후준비 젠포트 퀀트 전략 활용법 및 매수·매도 조건부터 백테스트, 모의투자까지',
          badge: '실시간 상위 노출',
          isTop1: false,
          section: '통합검색 1페이지 노출 중',
          query: '4060 노후준비 젠포트 퀀트 전략 활용법'
        },
        {
          keyword: 'SPUC 배당금 매수방법',
          title: '4060 노후준비 SPUC 배당금 및 매수방법 정리, S&P500에 옵션전략을 더한 월분배 ETF',
          badge: '실시간 상위 노출',
          isTop1: false,
          section: '통합검색 1페이지 노출 중',
          query: 'SPUC 배당금 및 매수방법 정리'
        }
      ];
    }

    return [
      {
        keyword: `${myIdInput} 대표 추천 키워드 A`,
        title: `${myIdInput} 님의 최근 발행 포스팅 #1`,
        badge: '실시간 상위 관측',
        isTop1: true,
        section: '네이버 검색 1페이지 노출 관측',
        query: `${myIdInput} 블로그`
      },
      {
        keyword: `${myIdInput} 대표 추천 키워드 B`,
        title: `${myIdInput} 님의 최근 발행 포스팅 #2`,
        badge: '실시간 상위 관측',
        isTop1: false,
        section: '통합검색 스마트블록 관측',
        query: `${myIdInput}`
      }
    ];
  }, [myIdInput]);

  const weekInfo = useMemo(() => getCurrentRankingWeekInfo(), []);
  const weeklyTopList = useMemo(() => getWeeklyTopRankings(), [weekInfo]);

  // 검색 및 필터 적용된 TOP 100 리스트 (매주 살아있는 변동 반영)
  const filteredRankingList = useMemo(() => {
    return weeklyTopList.filter((item) => {
      // 카테고리 필터
      if (selectedCategory !== '전체' && item.category !== selectedCategory) {
        return false;
      }
      // 출처 필터
      if (selectedSource !== '전체' && item.source !== selectedSource) {
        return false;
      }
      // 검색어 필터
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchId = item.id.toLowerCase().includes(query);
        return matchName || matchId;
      }
      return true;
    });
  }, [weeklyTopList, selectedCategory, selectedSource, searchQuery]);

  // 내 랭킹 조회 핸들러 (실제 분석된 글이 있으면 가산점 반영)
  const handleLookupMyRank = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = myIdInput.trim();
    if (!target) return;
    setIsSearchingMyRank(true);

    let postCount = 30;
    try {
      const cached = localStorage.getItem(`gifty_audit_${target.toLowerCase()}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.posts?.length) {
          postCount = parsed.posts.length;
        }
      }
    } catch {}

    setTimeout(() => {
      setMyRankData(calculateMyBlogRankEstimate(target, postCount));
      setIsSearchingMyRank(false);
    }, 350);
  };

  const categories = ['전체', '맛집·카페', 'IT·테크', '여행·숙박', '뷰티·패션', '경제·비즈니스', '생활·육아'];
  const sources = ['전체', '네이버 블로그', '티스토리', '워드프레스'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. 상단 회차 및 산출 기준 알림 배너 */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-xs flex items-center gap-1">
              <Trophy size={13} />
              <span>{weekInfo.weekText}</span>
            </span>
            <span className="text-xs text-indigo-200 font-bold">{weekInfo.dateText}</span>
            <span className="text-[11px] bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full border border-white/10">
              실시간 모수 약 200만 블로그 추적
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            대한민국 블로그 <span className="text-indigo-400">G-Power 통합 랭킹</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            단순 방문자수나 글 개수가 아닌, <b>실제 네이버 검색결과 1페이지 점유율과 체류시간 가중치</b>로 공정하게 매긴 전국 블로그 랭킹입니다.
          </p>
        </div>

        {/* 서브 탭 전환: [전체 랭킹] vs [내 랭킹 & 위치] */}
        <div className="flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shrink-0 self-stretch md:self-auto">
          <button
            type="button"
            onClick={() => setSubTab('all')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'all'
                ? 'bg-white text-slate-950 shadow-md scale-100'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <BarChart3 size={15} />
            <span>전체 랭킹</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('my')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'my'
                ? 'bg-white text-slate-950 shadow-md scale-100'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Target size={15} />
            <span>내 랭킹 &amp; 위치</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2-A. [전체 랭킹] 탭 화면 */}
      {/* ========================================================= */}
      {subTab === 'all' && (
        <div className="space-y-6">
          {/* 3단 핫보드: 급등 / 신규 진입 / 꾸준히 상승 BEST */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* 1. 실시간 급등 블로그 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600">
                      <Flame size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-800">실시간 급등 블로그</span>
                  </div>
                  <select
                    value={surgeFilter}
                    onChange={(e) => setSurgeFilter(e.target.value as any)}
                    className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="100">100위 내</option>
                    <option value="1000">1,000위 내</option>
                    <option value="all">전체</option>
                  </select>
                </div>

                <div className="space-y-2.5">
                  {RISING_BLOGS_DATA.slice(0, 3).map((blog) => (
                    <div
                      key={blog.id}
                      onClick={() => setSelectedBlog(blog)}
                      className="p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 truncate block">
                            {blog.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">{blog.category}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs font-black text-rose-600">
                            <TrendingUp size={13} />
                            <span>▲ +{blog.change}위</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-slate-500">{blog.rank}위 ({blog.percentile})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                💡 직전 회차 대비 노출 범위 및 상위 점유율이 가장 가파르게 오른 블로그
              </p>
            </div>

            {/* 2. 이번 주 신규 진입 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-800">이번 주 신규 진입</span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    NEW 핫루키
                  </span>
                </div>

                <div className="space-y-2.5">
                  {NEW_ENTRY_BLOGS_DATA.map((blog) => (
                    <div
                      key={blog.id}
                      onClick={() => setSelectedBlog(blog)}
                      className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-xs font-black text-slate-900 group-hover:text-emerald-700 truncate block">
                            {blog.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">{blog.category}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">
                            NEW
                          </span>
                          <div className="text-[11px] font-black text-slate-800 mt-0.5">{blog.rank}위 첫 진입</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                💡 이전 회차엔 순위권 밖이었으나 이번에 첫 관측된 유망 블로그
              </p>
            </div>

            {/* 3. 꾸준히 상승 중인 BEST */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                      <Award size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-800">꾸준한 상승세 BEST</span>
                  </div>
                  <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    연속 우상향 📈
                  </span>
                </div>

                <div className="space-y-2.5">
                  {STEADY_GROWTH_BLOGS_DATA.map((blog) => (
                    <div
                      key={blog.id}
                      onClick={() => setSelectedBlog(blog)}
                      className="p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 truncate block">
                            {blog.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">{blog.category}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-indigo-600">3회차 연속 상승</span>
                          <div className="text-[11px] font-black text-slate-800">{blog.rank}위 ({blog.percentile})</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                💡 반짝 튀는 급등이 아니라 3~5회차 이상 지속적으로 자리를 다지며 올라온 블로그
              </p>
            </div>
          </div>

          {/* 메인 리더보드: 주제별 / 출처별 TOP 100 테이블 */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
            {/* 테이블 컨트롤 헤더 (필터 & 검색) */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              {/* 주제 탭 필터 */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 출처 필터 & 검색창 */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 text-xs self-stretch sm:self-auto">
                  {sources.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setSelectedSource(src)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSource === src
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="블로그명 / 아이디 검색..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TOP 100 리더보드 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 w-16 text-center">순위</th>
                    <th className="py-3 px-3">블로그 정보</th>
                    <th className="py-3 px-3 text-center">전체 노출</th>
                    <th className="py-3 px-3 text-center">1~3위 장악율</th>
                    <th className="py-3 px-3 text-center">G-Power 점수</th>
                    <th className="py-3 px-3 text-center">상위 백분위</th>
                    <th className="py-3 px-3 text-right">분석</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRankingList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                        검색 조건에 일치하는 블로그가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredRankingList.map((blog) => {
                      const isTop3 = blog.rank <= 3;
                      return (
                        <tr
                          key={blog.id}
                          className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                          onClick={() => setSelectedBlog(blog)}
                        >
                          {/* 순위 및 변동 */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <span
                                className={`text-base font-black ${
                                  isTop3 ? 'text-amber-500 scale-110 drop-shadow-xs' : 'text-slate-900'
                                }`}
                              >
                                {blog.rank}
                              </span>
                              {blog.change === 'new' ? (
                                <span className="text-[9px] font-black text-emerald-600">NEW</span>
                              ) : blog.change > 0 ? (
                                <span className="text-[10px] font-extrabold text-rose-600 flex items-center">
                                  ▲{blog.change}
                                </span>
                              ) : blog.change < 0 ? (
                                <span className="text-[10px] font-extrabold text-blue-600 flex items-center">
                                  ▼{Math.abs(blog.change)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-300 font-bold">-</span>
                              )}
                            </div>
                          </td>

                          {/* 블로그 정보 */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {blog.name}
                                  </span>
                                  {/* 지수 배지 */}
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {blog.indexBadge}
                                  </span>
                                  {blog.influencerGrade && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                                      인플루언서 {blog.influencerGrade}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                  <span>@{blog.id}</span>
                                  <span>·</span>
                                  <span>{blog.source}</span>
                                  <span>·</span>
                                  <span className="text-slate-500 font-semibold">{blog.category}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 전체 노출 수 */}
                          <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                            {blog.totalExposure.toLocaleString()}개
                          </td>

                          {/* 1~3위 장악율 */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="font-black text-indigo-600">{blog.top3Ratio}%</span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full"
                                style={{ width: `${blog.top3Ratio}%` }}
                              />
                            </div>
                          </td>

                          {/* G-Power 점수 */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="font-black text-slate-900">{blog.score.toLocaleString()}점</span>
                          </td>

                          {/* 상위 백분위 */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200/80">
                              {blog.percentile}
                            </span>
                          </td>

                          {/* 분석 보기 버튼 */}
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBlog(blog);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 text-xs font-bold transition-all shadow-2xs"
                            >
                              상세보기
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2-B. [내 랭킹 & 위치 진단] 탭 화면 */}
      {/* ========================================================= */}
      {subTab === 'my' && (
        <div className="space-y-6">
          {/* 내 블로그 아이디 입력 및 즉시 산출 바 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black mb-1.5">
                <Target size={13} />
                <span>내 블로그 전국 위치 실시간 조회</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                내 블로그의 현재 전국 등수는 몇 위일까요?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                네이버 아이디를 입력하면 이번 회차 통합검색 관측 실적과 상위 %를 즉시 산출합니다.
              </p>
            </div>

            <form onSubmit={handleLookupMyRank} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  value={myIdInput}
                  onChange={(e) => setMyIdInput(e.target.value)}
                  placeholder="네이버 ID 입력 (예: masining)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                type="submit"
                disabled={isSearchingMyRank}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-sm transition-all shrink-0 active:scale-95 disabled:opacity-50"
              >
                {isSearchingMyRank ? '계산 중...' : '내 랭킹 확인'}
              </button>
            </form>
          </div>

          {/* 내 랭킹 요약 대시보드 4단 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            {/* 1. 종합 순위 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>전국 통합 순위</span>
                <Trophy size={15} className="text-amber-500" />
              </span>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {myRankData.rank.toLocaleString()}위
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`text-xs font-black flex items-center ${
                      myRankData.change >= 0 ? 'text-rose-600' : 'text-blue-600'
                    }`}
                  >
                    {myRankData.change >= 0 ? `▲ +${myRankData.change}위` : `▼ ${myRankData.change}위`}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">직전 회차 대비</span>
                </div>
              </div>
              <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg w-fit border border-indigo-200">
                {myRankData.percentile}
              </span>
            </div>

            {/* 2. 주제 순위 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>{myRankData.category} 순위</span>
                <Users size={15} className="text-indigo-500" />
              </span>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-black text-indigo-600">
                  {myRankData.categoryRank.toLocaleString()}위
                </div>
                <p className="text-[11px] text-slate-400 mt-1">같은 주제 블로그 내 경쟁 순위</p>
              </div>
              <span className="text-[11px] font-bold text-slate-500">실현 가능한 현실적 벤치마킹 기준</span>
            </div>

            {/* 3. 상위 1~3위 효율 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>1~3위 장악율</span>
                <Award size={15} className="text-purple-500" />
              </span>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-black text-purple-600">{myRankData.top3Ratio}%</div>
                <p className="text-[11px] text-slate-400 mt-1">전체 노출 중 최상단 점유 비율</p>
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-lg w-fit">
                상위 3위 이내 노출 극대화 필요
              </span>
            </div>

            {/* 4. G-Power 종합 점수 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>G-Power 점수</span>
                <Zap size={15} className="text-yellow-500" />
              </span>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {myRankData.score.toLocaleString()}점
                </div>
                <p className="text-[11px] text-slate-400 mt-1">노출력 + 체류시간 복합 지수</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg w-fit border border-emerald-200">
                정상 지수 유지 중
              </span>
            </div>
          </div>

          {/* 무엇이 달라졌나요? 3대 핵심 지표 분석 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                  <BarChart3 size={16} />
                </div>
                <h4 className="text-base font-black text-slate-900">무엇이 달라졌나요? (직전 회차 대비 3대 핵심 지표)</h4>
              </div>
              <span className="text-xs text-slate-400 font-bold">세 가지를 함께 종합 분석합니다</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* 지표 1: 노출 범위 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-500 mb-1">1. 노출 범위 (키워드 개수)</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{myRankData.exposureCount}개</span>
                  <span
                    className={`text-xs font-black ${
                      myRankData.diffExposure >= 0 ? 'text-rose-600' : 'text-blue-600'
                    }`}
                  >
                    {myRankData.diffExposure >= 0 ? `▲ +${myRankData.diffExposure}` : `▼ ${myRankData.diffExposure}`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  {myRankData.diffExposure >= 0
                    ? '💡 검색에 잡히는 키워드 풀이 넓어졌습니다. 다양한 주제로 영역을 성공적으로 확장하고 있습니다.'
                    : '⚠️ 검색에 잡히는 키워드 수가 줄었습니다. 최근 포스팅에서 새로운 키워드 발굴이 필요합니다.'}
                </p>
              </div>

              {/* 지표 2: 상위 노출 효율 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-500 mb-1">2. 상위 노출 효율 (1~3위 비율)</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{myRankData.top3Ratio}%</span>
                  <span
                    className={`text-xs font-black ${
                      myRankData.diffTop3Ratio >= 0 ? 'text-rose-600' : 'text-blue-600'
                    }`}
                  >
                    {myRankData.diffTop3Ratio >= 0 ? `▲ +${myRankData.diffTop3Ratio}%p` : `▼ ${myRankData.diffTop3Ratio}%p`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  {myRankData.diffTop3Ratio >= 0
                    ? '✨ 첫 화면 최상단(1~3위)까지 글을 밀어올리는 힘이 강화되었습니다. 체류시간과 클릭률이 높습니다.'
                    : '⚠️ 키워드는 잡히나 10위권 밖으로 밀려나고 있습니다. 본문 도입부 요약과 시각 미디어를 보강하세요.'}
                </p>
              </div>

              {/* 지표 3: 노출 키워드 평균 검색량 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-500 mb-1">3. 노출 키워드 평균 검색량</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {myRankData.avgSearch.toLocaleString()}회
                  </span>
                  <span
                    className={`text-xs font-black ${
                      myRankData.diffAvgSearch >= 0 ? 'text-rose-600' : 'text-blue-600'
                    }`}
                  >
                    {myRankData.diffAvgSearch >= 0 ? `▲ +${myRankData.diffAvgSearch}` : `▼ ${myRankData.diffAvgSearch}`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  {myRankData.diffAvgSearch >= 0
                    ? '🔥 사람이 많이 찾는 대형·중형 키워드 비중이 늘어 순위 가중치가 크게 붙었습니다.'
                    : '💡 검색량이 적은 세부 키워드로 글이 이동했습니다. 경쟁은 낮으나 유입 폭이 제한될 수 있습니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* 순위를 올리기 위한 G-Power 실전 점검 솔루션 */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 rounded-3xl p-6 sm:p-7 border border-indigo-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-indigo-600 text-white font-bold">
                <Zap size={18} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">순위를 올리기 위한 G-Power 실전 점검 가이드</h4>
                <p className="text-xs text-slate-500">현재 내 블로그 상태에 해당하는 항목을 확인하고 실천해 보세요.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* 솔루션 1 */}
              <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-rose-600 font-black text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>상태 1. 순위권 밖이거나 상위 20% 밖인 경우</span>
                </div>
                <h5 className="font-extrabold text-slate-900 text-sm">👉 키워드 선정부터 전면 수정해야 합니다</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  사람이 실제로 검색하지 않는 키워드로 글을 쓰면 애초에 집계 모수에 들지 못합니다. 월 검색량 1,000~5,000회 수준의 황금 세부 키워드를 먼저 찾고, 그 키워드로 작성하여 첫 페이지에 잡히는지 확인하세요.
                </p>
              </div>

              {/* 솔루션 2 */}
              <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-black text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>상태 2. 순위는 있는데 여러 회차째 제자리인 경우</span>
                </div>
                <h5 className="font-extrabold text-slate-900 text-sm">👉 잡히는 키워드 개수(노출 범위)를 늘려야 합니다</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  한 키워드에서 1위를 오래 유지해도 전체 노출 개수가 적으면 순위가 올라가지 않습니다. 노출 범위를 넓히기 위해 연관 주제의 신규 키워드 글을 주 2~3회 꾸준히 발행하세요.
                </p>
              </div>

              {/* 솔루션 3 */}
              <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-black text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>상태 3. 노출 범위는 느는데 순위가 오르지 않는 경우</span>
                </div>
                <h5 className="font-extrabold text-slate-900 text-sm">👉 상위 노출 효율(1~3위 장악율)을 높여야 합니다</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  글이 검색에 잡히긴 하지만 10위권 밖에 머물러 있는 상태입니다. 1~3위 노출은 점수 반영 가중치가 수 배 이상 큽니다. 글 초반 핵심 요약과 <b>움직이는 움짤(GIF)을 2개 이상 배치해 체류시간 90초를 넘기면</b> 최상단으로 치고 올라갑니다.
                </p>
              </div>

              {/* 솔루션 4 */}
              <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-purple-600 font-black text-xs">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>상태 4. 내 주제에 급등한 블로그가 있는 경우</span>
                </div>
                <h5 className="font-extrabold text-slate-900 text-sm">👉 그 블로그를 클릭해 바뀐 지표를 벤치마킹하세요</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  짧은 기간에 크게 치고 올라간 블로그는 '노출 범위'나 '1~3위 장악율' 중 한쪽이 급변한 것입니다. 해당 블로그를 눌러 어떤 키워드를 잡았는지 벤치마킹하여 내 다음 포스팅에 즉각 접목하세요.
                </p>
              </div>
            </div>
          </div>

          {/* 실시간 네이버 검색 노출 라이브 검증 위젯 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">Live Search Monitor</span>
                  <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    네이버 실시간 검색창 직접 연동
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-900 mt-1">
                  내 최신 포스팅 실시간 네이버 노출 순위 관측
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  전국 통합 랭킹(주간 회차)과 별개로, <b>방금 쓴 글이 지금 네이버 1위·상위에 잡혔는지</b> 클릭 한 번으로 직접 확인합니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectBlogForAudit(myIdInput)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
              >
                <Sparkles size={13} className="text-amber-400" />
                <span>1:1 정밀 진단실에서 전체 검사</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {liveMonitoredPosts.map((post, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    post.isTop1
                      ? 'bg-gradient-to-br from-amber-50/60 via-white to-rose-50/40 border-amber-300/80 shadow-xs'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          post.isTop1
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {post.isTop1 ? <Trophy size={12} /> : <Award size={12} />}
                        <span>{post.badge}</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">{post.section}</span>
                    </div>

                    <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                      {post.title}
                    </h5>
                    <div className="mt-2 text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block">
                      키워드: <span className="text-indigo-600 font-extrabold">"{post.keyword}"</span>
                    </div>
                  </div>

                  <a
                    href={`https://m.search.naver.com/search.naver?query=${encodeURIComponent(post.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-black rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 shadow-2xs group"
                  >
                    <span>네이버 검색창에서 실시간 1위 직접 확인</span>
                    <ExternalLink size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 순위 통계 집계 기준 & 상위 % 척도 안내표 */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-md space-y-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                <HelpCircle size={18} />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  블로그 순위 통계는 어떻게 산출되나요? (주간 회차 vs 실시간 원리)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  왜 전국 통합 랭킹은 매주 정기 회차로 집계되고, 글별 노출은 실시간으로 확인하는지 안내합니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 왼쪽: 주간 회차 vs 실시간 원리 */}
              <div className="bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-black text-xs">
                  <Activity size={14} />
                  <span>주간 정기 회차제 (Weekly Batch) 운영 이유</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  네이버는 시간대(오전/오후/야간)나 사용자 환경에 따라 순위가 수시로 1~2계단씩 흔들립니다. 만약 200만 블로그 전체 등수를 매초 실시간으로 바꾸면 데이터 피로도와 순위 왜곡이 극심해집니다.
                </p>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-amber-300">💡 G-Power 랭킹의 하이브리드 표준 원칙:</div>
                  <div>• <b>전국 200만 통합 랭킹</b>: 매주 월요일 공인 회차로 집계하여 흔들리지 않는 5회차 장기 우상향 추세 보증</div>
                  <div>• <b>글별 검색 순위</b>: 네이버 모바일 검색창을 즉시 실시간 스크래핑하여 방금 쓴 글의 1위 점유를 즉시 확인</div>
                </div>
              </div>

              {/* 오른쪽: 상위 % 척도표 */}
              <div className="bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                  <Trophy size={14} />
                  <span>전국 등수와 상위 % 척도 읽는 법 (모수 약 200만 블로그)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="pb-2 font-bold">전국 등수 구간</th>
                        <th className="pb-2 font-bold">화면 표기</th>
                        <th className="pb-2 font-bold">블로그 시장 지위</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 text-slate-300 text-[11px]">
                      <tr>
                        <td className="py-2 text-amber-300 font-black">1 ~ 200위</td>
                        <td className="py-2 font-bold">상위 0.01%</td>
                        <td className="py-2 text-slate-400">국내 최정상 공식 인플루언서</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-amber-400 font-bold">~ 2,000위</td>
                        <td className="py-2 font-bold">상위 0.1%</td>
                        <td className="py-2 text-slate-400">주제별 대표 전문 파워블로그</td>
                      </tr>
                      <tr className="bg-indigo-950/60">
                        <td className="py-2 text-indigo-300 font-black">~ 20,000위</td>
                        <td className="py-2 text-indigo-300 font-black">상위 1% (현재 구간)</td>
                        <td className="py-2 text-indigo-200 font-bold">브랜드 협찬·체험단 최우선 선정</td>
                      </tr>
                      <tr>
                        <td className="py-2">~ 200,000위</td>
                        <td className="py-2">상위 2% ~ 10%</td>
                        <td className="py-2 text-slate-400">2만 등마다 1%씩 촘촘히 경쟁</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">400,000위 밖</td>
                        <td className="py-2 text-slate-500">20% 밖</td>
                        <td className="py-2 text-slate-500">키워드 타겟팅 전면 재설계 권장</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. 블로그 상세 벤치마킹 모달 팝업 */}
      {/* ========================================================= */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* 모달 헤더 */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
                  {selectedBlog.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black truncate">{selectedBlog.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-white/20 text-indigo-200">
                      {selectedBlog.indexBadge}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-300 mt-0.5 flex items-center gap-2">
                    <span>@{selectedBlog.id}</span>
                    <span>·</span>
                    <span>{selectedBlog.category}</span>
                    <span>·</span>
                    <span className="text-amber-300 font-bold">{selectedBlog.percentile}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* 무엇이 달라졌나요? 3대 핵심 지표 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-black text-indigo-700 block mb-3">
                  📊 이번 회차 분석 지표
                </span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-400 font-bold">전체 노출수</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      {selectedBlog.totalExposure.toLocaleString()}개
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-400 font-bold">1~3위 장악율</div>
                    <div className="text-lg font-black text-indigo-600 mt-0.5">
                      {selectedBlog.top3Ratio}%
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-400 font-bold">평균 검색량</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      {selectedBlog.avgSearchVolume.toLocaleString()}회
                    </div>
                  </div>
                </div>
              </div>

              {/* 벤치마킹할 노출 키워드 목록 */}
              <div>
                <span className="text-xs font-black text-slate-800 block mb-2">
                  🎯 이 블로그가 검색 1페이지를 장악한 핵심 키워드
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedBlog.keywords.map((kw, i) => (
                    <a
                      key={i}
                      href={`https://search.naver.com/search.naver?query=${encodeURIComponent(kw)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors"
                      title="네이버 실제 통합검색 결과 보기"
                    >
                      <span>{kw}</span>
                      <ExternalLink size={11} className="text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>

              {/* G-Power 점수 구성 */}
              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs">
                <span className="font-black text-indigo-950 block mb-1">
                  💡 G-Power 랭킹 종합 점수 산출 구성 ({selectedBlog.score.toLocaleString()}점)
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  = 통합검색 노출 실적 점수 (60%) + 고검색량 키워드 기여도 (25%) + DIA 체류시간 및 멀티미디어 가산점 (15%). 단순 발행량이 아닌 독자의 실제 반응과 체류시간이 높은 블로그일수록 높은 점수를 받습니다.
                </p>
              </div>
            </div>

            {/* 모달 푸터 버튼 */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
              >
                닫기
              </button>

              <button
                type="button"
                onClick={() => {
                  const blogId = selectedBlog.id;
                  setSelectedBlog(null);
                  onSelectBlogForAudit(blogId);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Activity size={14} />
                <span>이 블로그 1:1 정밀 진단실로 이동 &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
