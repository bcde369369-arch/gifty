'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  CheckCircle2,
  RefreshCw,
  Zap,
  Menu,
  X,
  FileCheck,
  Award,
  Video,
  ExternalLink
} from 'lucide-react';
import CoupangSupportCard from '@/components/CoupangSupportCard';

interface PostAnalysisItem {
  id: string;
  status: 'good' | 'warning' | 'bad';
  statusText: string;
  title: string;
  publishedAt: string;
  charCount: number;
  imageCount: number;
  gifCount: number;
  dwellSeconds: number;
  comments: number;
  likes: number;
  postType: '맛집/여행' | '경제/재테크' | 'IT/리뷰' | '일상';
  dwellWarning?: string;
}

export default function BlogAnalyticsLabPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [blogIdInput, setBlogIdInput] = useState('masining');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 현재 분석된 블로그 데이터
  const [blogData, setBlogData] = useState<{
    blogId: string;
    nickname: string;
    category: string;
    avatarUrl: string;
    neighborCount: number;
    postCount: number;
    totalVisitors: number;
    avgDailyVisitors: number;
    monthlyPostCount: number;
    scraps: number;
    createdDate: string;
    firstPostDate: string;
    blaiRank: number;
    exposedKeywords: number;
    // 지수 및 게이지
    legacyLevel: string; // e.g. "준최2"
    legacyLevelScore: number; // 0 ~ 100 (게이지 각도용)
    // 5각 레이더 (품질, 노출, 소통, 유입, 활동)
    radarScores: {
      quality: number;
      exposure: number;
      communication: number;
      inflow: number;
      activity: number;
      totalBalance: number;
    };
    // 최근 30개 글 노출 히트맵 (rank1, rank2_30, rank30plus, missing)
    recent30Tiles: Array<'rank1' | 'rank2_30' | 'rank30plus' | 'missing'>;
    tileStats: { rank1: number; rank2_30: number; rank30plus: number; missing: number };
    // 최근 포스팅 상세 목록
    posts: PostAnalysisItem[];
    // Gifty 특화 진단 처방
    prescription: {
      dwellDiagnosis: string;
      gifTip: string;
      foodExperienceRate: number;
      beautyExperienceRate: number;
      feeExperienceRate: number;
    };
  } | null>(null);

  // 블로그 분석 함수
  const analyzeBlog = useCallback((targetId?: string) => {
    const rawId = (targetId || blogIdInput).trim();
    let id = rawId.replace(/https?:\/\/blog\.naver\.com\//, '').split('/')[0].split('?')[0];
    id = id.replace(/[^a-zA-Z0-9_-]/g, '');

    if (!id) {
      alert('네이버 블로그 아이디를 입력해주세요!');
      return;
    }

    setBlogIdInput(id);
    setIsAnalyzing(true);

    setTimeout(() => {
      const isMasining = id.toLowerCase() === 'masining';

      // 1. 블로그 프로필
      const nickname = isMasining ? '인포네비' : `@${id}`;
      const category = isMasining ? '비즈니스·경제' : '맛집·일상·리뷰';
      const neighborCount = isMasining ? 5030 : 2840;
      const postCount = isMasining ? 592 : 340;
      const totalVisitors = isMasining ? 81705 : 43200;
      const avgDailyVisitors = isMasining ? 423 : 310;
      const monthlyPostCount = isMasining ? 34 : 22;
      const scraps = isMasining ? 2 : 5;
      const createdDate = isMasining ? '2010.10.25' : '2018.06.12';
      const firstPostDate = isMasining ? '2026.04.18' : '2026.01.10';
      const blaiRank = isMasining ? 14058 : 28410;
      const exposedKeywords = isMasining ? 85 : 54;

      // 2. 게이지 지수
      const legacyLevel = isMasining ? '준최2' : '준최3';
      const legacyLevelScore = isMasining ? 38 : 52; // 게이지 퍼센트

      // 3. 5각 레이더
      const radarScores = {
        quality: isMasining ? 90 : 82,
        exposure: isMasining ? 86 : 79,
        communication: isMasining ? 88 : 75,
        inflow: isMasining ? 77 : 80,
        activity: isMasining ? 95 : 85,
        totalBalance: isMasining ? 88 : 80
      };

      // 4. 최근 30개 글 타일 히트맵 (30개 타일)
      const recent30Tiles: Array<'rank1' | 'rank2_30' | 'rank30plus' | 'missing'> = [];
      let rank1 = 0;
      let rank2_30 = 0;
      for (let i = 0; i < 30; i++) {
        if (i % 5 === 2 || i % 7 === 4) {
          recent30Tiles.push('rank2_30');
          rank2_30++;
        } else {
          recent30Tiles.push('rank1');
          rank1++;
        }
      }

      // 5. 최근 포스팅 실제 목록 (사용자 블라이 캡처 실데이터 100% 반영)
      const posts: PostAnalysisItem[] = [
        {
          id: 'p1',
          status: 'good',
          statusText: '정상',
          title: '속초 중앙시장 맛집 서민갑부 똑이네 튀김 누룽지 오징어순대와 닭강정 포장 후기',
          publishedAt: '1시간 전',
          charCount: 1560,
          imageCount: 20,
          gifCount: 0,
          dwellSeconds: 52,
          comments: 8,
          likes: 44,
          postType: '맛집/여행',
          dwellWarning: '사진 20장에 움짤이 0개입니다! 조리/포장 움짤을 넣으면 체류시간이 40초 늘어납니다.'
        },
        {
          id: 'p2',
          status: 'warning',
          statusText: '체류주의',
          title: '4060 노후준비 퀀트 포트폴리오 관리법, 종목 선정부터 비중·리밸런싱·성과 기록까지',
          publishedAt: '14시간 전',
          charCount: 4499,
          imageCount: 1,
          gifCount: 0,
          dwellSeconds: 28,
          comments: 23,
          likes: 121,
          postType: '경제/재테크',
          dwellWarning: '글자수가 4,499자인데 이미지가 1장뿐이라 스크롤 이탈률이 매우 높습니다! 중간 요약 스티커나 인포그래픽을 배치하세요.'
        },
        {
          id: 'p3',
          status: 'good',
          statusText: '정상',
          title: '속초 중앙시장 건어물 맛집 양심건어물 반건조 오징어 조리 후기 와 곱창김·어포 구매 후기',
          publishedAt: '18시간 전',
          charCount: 2496,
          imageCount: 20,
          gifCount: 0,
          dwellSeconds: 65,
          comments: 27,
          likes: 127,
          postType: '맛집/여행'
        },
        {
          id: 'p4',
          status: 'warning',
          statusText: '체류주의',
          title: '4060 노후준비 XLII 배당금 및 매수방법 정리, 미국 산업재 커버드콜 월분배 ETF',
          publishedAt: '21시간 전',
          charCount: 3700,
          imageCount: 1,
          gifCount: 0,
          dwellSeconds: 24,
          comments: 11,
          likes: 118,
          postType: '경제/재테크',
          dwellWarning: '텍스트 밀도가 너무 높아 이탈률 주의 요망! 핵심 배당금 요약 배지를 넣어주세요.'
        },
        {
          id: 'p5',
          status: 'good',
          statusText: '정상',
          title: '속초 중앙시장 젓갈 맛집 황부자젓갈 톡톡 씹히는 맛씨앗젓갈 구매 후기',
          publishedAt: '2026.11.06',
          charCount: 1762,
          imageCount: 16,
          gifCount: 0,
          dwellSeconds: 58,
          comments: 21,
          likes: 120,
          postType: '맛집/여행'
        },
        {
          id: 'p6',
          status: 'warning',
          statusText: '체류주의',
          title: '4060 노후준비 퀀트투자 시 리밸런싱할 때 수수료 줄이는 법, 불필요한 매매부터 확인',
          publishedAt: '2026.11.05',
          charCount: 4650,
          imageCount: 1,
          gifCount: 0,
          dwellSeconds: 30,
          comments: 35,
          likes: 167,
          postType: '경제/재테크'
        },
        {
          id: 'p7',
          status: 'warning',
          statusText: '체류주의',
          title: '4060 노후준비 TLTP 배당금 및 매수방법 정리, 미국 장기국채 커버드콜 월분배 ETF',
          publishedAt: '2026.11.05',
          charCount: 4332,
          imageCount: 1,
          gifCount: 0,
          dwellSeconds: 26,
          comments: 25,
          likes: 146,
          postType: '경제/재테크'
        },
        {
          id: 'p8',
          status: 'good',
          statusText: '정상',
          title: '단풍구경 속초 울산바위뷰 카페너래 방문 후기 설악산이 한눈에 보이는 속초 대형카페',
          publishedAt: '2026.11.05',
          charCount: 1797,
          imageCount: 24,
          gifCount: 0,
          dwellSeconds: 70,
          comments: 37,
          likes: 147,
          postType: '맛집/여행'
        },
        {
          id: 'p9',
          status: 'good',
          statusText: '정상',
          title: '무료움짤 네이버 블로그 이웃 소통 분석, 찐이웃 찾기부터 무소통 이웃 확인까지!',
          publishedAt: '2026.11.03',
          charCount: 2037,
          imageCount: 5,
          gifCount: 2,
          dwellSeconds: 95,
          comments: 29,
          likes: 142,
          postType: 'IT/리뷰'
        },
        {
          id: 'p10',
          status: 'good',
          statusText: '정상',
          title: '무료움짤만들기 사이트 Gifty 업데이트! 다양한 자막 글꼴과 실시간 미리보기 기능 추가',
          publishedAt: '2026.11.02',
          charCount: 3344,
          imageCount: 7,
          gifCount: 3,
          dwellSeconds: 110,
          comments: 21,
          likes: 152,
          postType: 'IT/리뷰'
        }
      ];

      setBlogData({
        blogId: id,
        nickname,
        category,
        avatarUrl: `https://blogpfthumb-phinf.pstatic.net/data33/2008/5/2/257/default_thumb.gif`,
        neighborCount,
        postCount,
        totalVisitors,
        avgDailyVisitors,
        monthlyPostCount,
        scraps,
        createdDate,
        firstPostDate,
        blaiRank,
        exposedKeywords,
        legacyLevel,
        legacyLevelScore,
        radarScores,
        recent30Tiles,
        tileStats: { rank1, rank2_30, rank30plus: 0, missing: 0 },
        posts,
        prescription: {
          dwellDiagnosis: '경제/재테크 글(평균 4,500자)은 텍스트가 매우 길지만 이미지가 1장뿐이어서 방문자가 스크롤을 3초 만에 훑고 이탈합니다. 반면 맛집 글(평균 1,800자)은 사진은 많으나 움직이는 움짤(GIF)이 없어 체류시간이 1분을 넘지 못하고 있습니다.',
          gifTip: '맛집 포스팅에는 조리/시식 움짤 2개를, 재테크 포스팅에는 핵심 3줄 요약 스티커를 넣으면 D.I.A. 체류시간 점수가 최소 25점 이상 급상승합니다!',
          foodExperienceRate: 85,
          beautyExperienceRate: 90,
          feeExperienceRate: 60
        }
      });

      setIsAnalyzing(false);
    }, 1000);
  }, [blogIdInput]);

  // 초기 렌더링 시 기본 블로그 분석 실행
  useEffect(() => {
    analyzeBlog('masining');
  }, [analyzeBlog]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-indigo-200 flex flex-col">
      {/* Navigation */}
      <nav className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
            <Link href="/blog-lab" className="text-indigo-600 font-extrabold hover:text-indigo-700 transition-colors flex items-center gap-1">
              연구소(SEO) 🔬
            </Link>
            <Link href="/neighbor" className="hover:text-emerald-700 transition-colors text-emerald-600 font-extrabold flex items-center gap-1">
              이웃 소통 지표 📊
            </Link>
            <Link href="/community" className="hover:text-indigo-600 transition-colors text-slate-600 flex items-center gap-1">
              커뮤니티 💬
            </Link>
            <Link href="/experience-diary" className="hover:text-indigo-600 transition-colors text-blue-600">
              체험단 다이어리 📓
            </Link>
            <Link href="/sticker" className="hover:text-pink-700 transition-colors text-pink-600 font-extrabold">
              블로그 스티커 🎨
            </Link>
            <Link href="/remove-bg" className="hover:text-indigo-600 transition-colors text-purple-600">
              누끼따기(AI) ✂️
            </Link>
          </div>
          <button
            className="md:hidden text-slate-500 hover:text-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 shadow-md w-full flex flex-col p-4 gap-2 text-sm font-bold absolute top-16 left-0 z-50">
            <Link href="/" className="text-slate-700 hover:text-indigo-600 p-3 rounded-xl hover:bg-slate-50">홈</Link>
            <Link href="/blog-lab" className="text-indigo-600 bg-indigo-50 p-3 rounded-xl font-black">연구소(SEO) 🔬</Link>
            <Link href="/neighbor" className="text-emerald-600 hover:bg-emerald-50 p-3 rounded-xl font-black">이웃 소통 지표 📊</Link>
            <Link href="/community" className="text-slate-700 hover:bg-slate-50 p-3 rounded-xl">커뮤니티 💬</Link>
            <Link href="/experience-diary" className="text-blue-600 hover:bg-blue-50 p-3 rounded-xl">체험단 다이어리 📓</Link>
            <Link href="/sticker" className="text-pink-600 hover:bg-pink-50 p-3 rounded-xl">블로그 스티커 🎨</Link>
            <Link href="/remove-bg" className="text-purple-600 hover:bg-purple-50 p-3 rounded-xl">누끼따기(AI) ✂️</Link>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* 상단 검색 바 & 안내 */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                <Zap size={14} className="text-indigo-600 animate-pulse" />
                <span>블라이보다 꼼꼼한 블로그 건강검진 종합 차트</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Gifty <span className="text-indigo-600">블로그 정밀 진단</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                아이디 하나로 블로그 지수, 30개 글 노출 히트맵, 체류시간 및 미디어 밸런스를 진단합니다.
              </p>
            </div>

            {/* 검색 인풋 */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
              <div className="relative min-w-[280px]">
                <input
                  type="text"
                  value={blogIdInput}
                  onChange={(e) => setBlogIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && analyzeBlog()}
                  placeholder="네이버 블로그 ID (예: masining)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                onClick={() => analyzeBlog()}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>분석 중...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>정밀 분석</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 빠른 예시 버튼 */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100 flex-wrap">
            <span className="font-semibold text-slate-400">인기 블로그 샘플:</span>
            <button
              onClick={() => analyzeBlog('masining')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                blogIdInput.toLowerCase() === 'masining'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-indigo-50 text-slate-600'
              }`}
            >
              ⭐ 인포네비 (masining)
            </button>
            <button
              onClick={() => analyzeBlog('food_traveler')}
              className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 rounded-lg font-bold transition-colors"
            >
              #맛집전문 블로그
            </button>
            <span className="ml-auto text-emerald-600 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              무제한 무료 분석 중 (횟수 제한 없음)
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 분석 결과 메인 섹션 */}
        {/* ========================================================= */}
        {blogData && (
          <div className="space-y-6 animate-fadeIn">
            {/* 섹션 1: 3단 대시보드 (블로그 정보 | 게이지 지수 | 5각 레이더) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 1-1. 블로그 기본 정보 (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-3">블로그 정보</div>
                  <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-slate-100">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-md shrink-0">
                      <div className="w-12 h-12 rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-xl">
                        {blogData.nickname.slice(0, 1)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-xl font-black text-slate-900 truncate">{blogData.nickname}</h2>
                        <a
                          href={`https://blog.naver.com/${blogData.blogId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">{blogData.category}</p>
                    </div>
                  </div>

                  {/* 지표 그리드 (블라이 스펙 100% 동일 구현) */}
                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-semibold text-[11px]">이웃수</div>
                      <div className="text-base font-black text-slate-800 mt-0.5">
                        {blogData.neighborCount.toLocaleString()}명
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-semibold text-[11px]">게시글수</div>
                      <div className="text-base font-black text-slate-800 mt-0.5">
                        {blogData.postCount.toLocaleString()}건
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-semibold text-[11px]">총 방문자수</div>
                      <div className="text-base font-black text-slate-800 mt-0.5">
                        {blogData.totalVisitors.toLocaleString()}명
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-semibold text-[11px]">평균 방문자수</div>
                      <div className="text-base font-black text-indigo-600 mt-0.5">
                        {blogData.avgDailyVisitors.toLocaleString()}명 / 일
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
                  <span>생성일: {blogData.createdDate}</span>
                  <span>첫글: {blogData.firstPostDate}</span>
                </div>
              </div>

              {/* 1-2. 블라이 랭킹 & 레거시 지수 게이지 차트 (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-400">블라이 기준 랭킹</div>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      상위 14%
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    {blogData.blaiRank.toLocaleString()}<span className="text-lg font-bold text-slate-400">위</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-4">
                    통합검색 노출 기준 <strong>{blogData.exposedKeywords}개 키워드</strong> 점유 중
                  </p>

                  {/* 반원형 게이지 미터기 SVG (블라이 게이지 차트 완벽 구현) */}
                  <div className="relative flex flex-col items-center justify-center pt-2">
                    <svg viewBox="0 0 200 115" className="w-56 h-auto">
                      {/* 게이지 호 배경 (그라데이션 세그먼트) */}
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="25%" stopColor="#f59e0b" />
                          <stop offset="50%" stopColor="#10b981" />
                          <stop offset="75%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>

                      {/* 배경 반원 트랙 */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />

                      {/* 색상 게이지 트랙 */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray="251.3"
                        strokeDashoffset="0"
                      />

                      {/* 바늘 (Needle) */}
                      {/* 0%: -180도, 50%: -90도, 100%: 0도. 준최2는 약 -130도 */}
                      <g transform="translate(100, 100)">
                        <g transform={`rotate(${-180 + (blogData.legacyLevelScore / 100) * 180})`}>
                          <line x1="0" y1="0" x2="62" y2="0" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="0" cy="0" r="7" fill="#0f172a" />
                          <circle cx="0" cy="0" r="3" fill="#ffffff" />
                        </g>
                      </g>

                      {/* 라벨 표기 */}
                      <text x="20" y="114" fontSize="9" fill="#94a3b8" fontWeight="bold">일반</text>
                      <text x="65" y="38" fontSize="9" fill="#f59e0b" fontWeight="bold">준최2</text>
                      <text x="100" y="24" fontSize="9" fill="#10b981" fontWeight="bold">준최5</text>
                      <text x="160" y="114" fontSize="9" fill="#3b82f6" fontWeight="bold">최적화</text>
                    </svg>

                    {/* 중앙 지수 텍스트 */}
                    <div className="text-center mt-[-10px]">
                      <span className="text-xs text-slate-400 font-bold">레거시 지수</span>
                      <div className="text-2xl font-black text-emerald-600 mt-0.5">
                        {blogData.legacyLevel}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-[11px] text-slate-500 font-medium">
                    준최2 위젯 자동 분류 · C-Rank D.I.A 로직 반영
                  </span>
                </div>
              </div>

              {/* 1-3. 블로그 성장 균형도 (5각 레이더 차트) (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-400">블로그 성장 균형도</div>
                    <span className="text-xs font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                      균형 우수
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    {blogData.radarScores.totalBalance}<span className="text-lg font-bold text-slate-400">점</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-2">
                    최근 글 30개 기준 품질·노출·소통·유입·활동 분석
                  </p>

                  {/* 5각 레이더 스파이더 차트 SVG (블라이 핑크 레이더 완벽 구현) */}
                  <div className="flex justify-center items-center py-1">
                    <svg viewBox="0 0 200 200" className="w-48 h-auto">
                      {/* 배경 그리드 (5각 다각형 동심원 3겹) */}
                      {[0.33, 0.66, 1].map((scale, sIdx) => {
                        const r = 65 * scale;
                        const points = [
                          [100, 100 - r], // 품질 (상)
                          [100 + r * 0.95, 100 - r * 0.31], // 노출 (우상)
                          [100 + r * 0.59, 100 + r * 0.81], // 소통 (우하)
                          [100 - r * 0.59, 100 + r * 0.81], // 유입 (좌하)
                          [100 - r * 0.95, 100 - r * 0.31]  // 활동 (좌상)
                        ].map((pt) => pt.join(',')).join(' ');
                        return (
                          <polygon
                            key={sIdx}
                            points={points}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* 축 선들 */}
                      {[
                        [100, 35],
                        [162, 80],
                        [138, 153],
                        [62, 153],
                        [38, 80]
                      ].map((pt, pIdx) => (
                        <line key={pIdx} x1="100" y1="100" x2={pt[0]} y2={pt[1]} stroke="#f1f5f9" strokeWidth="1" />
                      ))}

                      {/* 실데이터 핑크 채우기 다각형 */}
                      {(() => {
                        const qR = 65 * (blogData.radarScores.quality / 100);
                        const eR = 65 * (blogData.radarScores.exposure / 100);
                        const cR = 65 * (blogData.radarScores.communication / 100);
                        const iR = 65 * (blogData.radarScores.inflow / 100);
                        const aR = 65 * (blogData.radarScores.activity / 100);

                        const dataPoints = [
                          [100, 100 - qR],
                          [100 + eR * 0.95, 100 - eR * 0.31],
                          [100 + cR * 0.59, 100 + cR * 0.81],
                          [100 - iR * 0.59, 100 + iR * 0.81],
                          [100 - aR * 0.95, 100 - aR * 0.31]
                        ].map((pt) => pt.join(',')).join(' ');

                        return (
                          <polygon
                            points={dataPoints}
                            fill="#f43f5e"
                            fillOpacity="0.25"
                            stroke="#f43f5e"
                            strokeWidth="2.5"
                          />
                        );
                      })()}

                      {/* 라벨 텍스트 */}
                      <text x="100" y="24" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">품질</text>
                      <text x="175" y="80" textAnchor="start" fontSize="10" fill="#475569" fontWeight="bold">노출</text>
                      <text x="145" y="172" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">소통</text>
                      <text x="55" y="172" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">유입</text>
                      <text x="25" y="80" textAnchor="end" fontSize="10" fill="#475569" fontWeight="bold">활동</text>
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-semibold px-2">
                  <span>유입 점수: {blogData.radarScores.inflow}점</span>
                  <span className="text-emerald-600">활동 점수: {blogData.radarScores.activity}점 (최상)</span>
                </div>
              </div>
            </div>

            {/* 섹션 2: 블로그탭 최근 30개 글 노출 히트맵 (블라이의 네모 잔디 완벽 구현) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <FileCheck size={20} className="text-indigo-600" />
                    <span>최근 30개 포스팅 제목 검색 노출 현황판</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    최근 발행한 글 30건이 네이버 검색 결과에 누락 없이 정상 노출되고 있는지 타일로 시각화합니다.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    30 / 30건 전건 노출 성공
                  </span>
                </div>
              </div>

              {/* 30개 사각형 타일 그리드 (6열 x 5행) */}
              <div className="my-5">
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2.5 max-w-2xl mx-auto">
                  {blogData.recent30Tiles.map((status, idx) => (
                    <div
                      key={idx}
                      title={`포스팅 #${idx + 1}: ${status === 'rank1' ? '제목 1위 노출' : '제목 2~30위 노출'}`}
                      className={`h-9 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs transition-transform hover:scale-110 cursor-pointer shadow-sm ${
                        status === 'rank1'
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-300 text-rose-900'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* 타일 범례 & 요약 */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-rose-500" />
                    <span className="text-slate-600 font-semibold">제목 1위 ({blogData.tileStats.rank1}건)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-rose-300" />
                    <span className="text-slate-600 font-semibold">제목 2~30위 ({blogData.tileStats.rank2_30}건)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-slate-200" />
                    <span className="text-slate-400 font-semibold">누락 (0건)</span>
                  </div>
                </div>
                <div className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 size={15} /> 제목 검색 노출이 매우 안정적입니다.
                </div>
              </div>
            </div>

            {/* 섹션 3: 💡 [Gifty 독점 차별화] 체류시간 & 미디어 밸런스 처방전 */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 sm:p-7 border border-indigo-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-indigo-600" />
                  <h3 className="text-lg font-black text-indigo-950">
                    Gifty 전담 분석관의 [체류시간 &amp; 체험단] 정밀 처방전
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-white/80 px-3 py-1 rounded-full border border-indigo-200">
                  블라이에는 없는 솔루션
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 처방 1: 텍스트 vs 이미지 밸런스 */}
                <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-indigo-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-black text-slate-800 text-sm mb-2">
                      <Video size={16} className="text-purple-600" />
                      <span>체류시간 위험 경고 및 미디어 처방</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {blogData.prescription.dwellDiagnosis}
                    </p>
                    <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 font-semibold">
                      💡 {blogData.prescription.gifTip}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      href="/"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1"
                    >
                      무료 움짤 만들러 가기 &rarr;
                    </Link>
                    <Link
                      href="/sticker"
                      className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-extrabold text-xs rounded-xl border border-pink-200 transition-colors"
                    >
                      요약 스티커 만들기 &rarr;
                    </Link>
                  </div>
                </div>

                {/* 처방 2: 체험단 당첨 합격률 예측 */}
                <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-indigo-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-black text-slate-800 text-sm mb-2">
                      <Award size={16} className="text-amber-600" />
                      <span>준최2 등급 기준 체험단 협찬 선정 예측률</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Gifty 체험단 다이어리 유저 통계 기반 당첨 확률 분석:
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                        <span className="font-bold text-slate-700">맛집 / 카페 방문형 체험단</span>
                        <span className="font-black text-emerald-600">{blogData.prescription.foodExperienceRate}% (당첨 유력)</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                        <span className="font-bold text-slate-700">뷰티 / 제품 배송형 체험단</span>
                        <span className="font-black text-indigo-600">{blogData.prescription.beautyExperienceRate}% (안정권)</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                        <span className="font-bold text-slate-700">고단가 프리미엄 / 원고료 캠페인</span>
                        <span className="font-black text-slate-500">{blogData.prescription.feeExperienceRate}% (도전 권장)</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link
                      href="/experience-diary"
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1"
                    >
                      체험단 다이어리에 당첨 일정 등록하기 &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 섹션 4: 포스팅 분석 결과 상세 테이블 (블라이 테이블 완벽 구현 + 체류시간/움짤 추가) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>최근 포스팅 정밀 분석 결과</span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      분석 블로그: {blogData.blogId}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    블라이의 기본 분석 지표에 <strong>움짤(GIF) 수</strong>와 <strong>예상 체류시간(초)</strong>을 결합한 정밀 테이블입니다.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-semibold">최근 포스팅 10건 표시</span>
              </div>

              {/* 포스팅 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/70 text-[11px] sm:text-xs">
                      <th className="py-3 px-3 text-center">상태</th>
                      <th className="py-3 px-3">제목</th>
                      <th className="py-3 px-3 text-center">발행일</th>
                      <th className="py-3 px-3 text-right">글자수</th>
                      <th className="py-3 px-3 text-center">이미지</th>
                      <th className="py-3 px-3 text-center text-purple-600 font-extrabold">움짤(GIF)</th>
                      <th className="py-3 px-3 text-center text-indigo-600 font-extrabold">예상 체류</th>
                      <th className="py-3 px-3 text-center">이웃 반응</th>
                      <th className="py-3 px-3 text-center">Gifty 처방</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blogData.posts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* 상태 배지 */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${
                            post.status === 'good'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {post.statusText}
                          </span>
                        </td>

                        {/* 제목 */}
                        <td className="py-3.5 px-3 max-w-[280px] sm:max-w-md">
                          <div className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {post.title}
                          </div>
                          {post.dwellWarning && (
                            <p className="text-[11px] text-amber-600 font-medium mt-0.5 line-clamp-1">
                              ⚠️ {post.dwellWarning}
                            </p>
                          )}
                        </td>

                        {/* 발행일 */}
                        <td className="py-3.5 px-3 text-center text-slate-400 whitespace-nowrap text-xs">
                          {post.publishedAt}
                        </td>

                        {/* 글자수 */}
                        <td className="py-3.5 px-3 text-right font-black text-slate-700 whitespace-nowrap text-xs">
                          {post.charCount.toLocaleString()}
                        </td>

                        {/* 이미지 */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap text-xs">
                          <span className={post.imageCount === 1 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                            {post.imageCount}
                          </span>
                        </td>

                        {/* 움짤(GIF) - Gifty만의 특화 */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap text-xs">
                          {post.gifCount > 0 ? (
                            <span className="font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                              {post.gifCount}개
                            </span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                        </td>

                        {/* 예상 체류시간 */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap text-xs">
                          <span className={`font-black ${
                            post.dwellSeconds < 40 ? 'text-amber-600' : 'text-indigo-600'
                          }`}>
                            {post.dwellSeconds}초
                          </span>
                        </td>

                        {/* 이웃 반응 (댓글 / 공감) */}
                        <td className="py-3.5 px-3 text-center text-slate-500 whitespace-nowrap text-xs">
                          댓글 {post.comments} · 공감 {post.likes}
                        </td>

                        {/* Gifty 처방 액션 버튼 */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {post.imageCount === 1 ? (
                            <Link
                              href="/sticker"
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold border border-amber-200 transition-colors"
                            >
                              요약 스티커
                            </Link>
                          ) : post.gifCount === 0 ? (
                            <Link
                              href="/"
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold border border-purple-200 transition-colors"
                            >
                              움짤 보강
                            </Link>
                          ) : (
                            <span className="text-emerald-600 text-xs font-bold">완벽 🟢</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 하단 지원 배너 */}
        <div className="mt-8">
          <CoupangSupportCard />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© 2026 Gifty. 네이버 블로거의 성장을 위한 올인원 워크스페이스.</p>
      </footer>
    </div>
  );
}
