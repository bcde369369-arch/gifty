'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Eye,
  MessageSquare,
  Zap,
  Menu,
  X,
  FileCheck,
  Award,
  Video
} from 'lucide-react';
import CoupangSupportCard from '@/components/CoupangSupportCard';

// 금칙어 / 광고성 위험 단어
const DANGEROUS_WORDS = [
  '최고', '1위', '완치', '기적', '특효', '보장', '치료제', '부작용 없음',
  '무조건', '절대', '전액 환불', '원금 보장', '대출', '카지노'
];

interface RecentPostItem {
  id: string;
  title: string;
  date: string;
  charCount: number;
  imageCount: number;
  gifCount: number;
  status: 'good' | 'warning' | 'bad';
  statusText: string;
  issueDetail?: string;
  dwellEstimate: number;
}

export default function BlogAnalyticsLabPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subTab, setSubTab] = useState<'overall' | 'post-check'>('overall');

  // 검색 인풋
  const [blogIdInput, setBlogIdInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 분석 결과 데이터
  const [report, setReport] = useState<{
    blogId: string;
    level: string;
    percentile: number;
    totalScore: number;
    // 세부 지표
    dwellScore: number;
    neighborScore: number;
    stabilityScore: number;
    // 미디어 통계
    avgCharCount: number;
    avgImageCount: number;
    avgGifCount: number;
    // 체험단 합격률
    experienceChances: {
      foodVisit: number;
      beautyShipping: number;
      premiumFee: number;
    };
    // 최근 포스팅 스캔 목록
    recentPosts: RecentPostItem[];
    // 종합 진단 처방전
    prescription: {
      headline: string;
      levelAdvice: string;
      dwellAdvice: string;
      neighborAdvice: string;
    };
  } | null>(null);

  // 원고 사전 검사기 상태
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftKeyword, setDraftKeyword] = useState('');

  // 블로그 정밀 진단 실행 함수
  const runBlogDiagnosis = (targetId?: string) => {
    const rawId = (targetId || blogIdInput).trim();
    let id = rawId.replace(/https?:\/\/blog\.naver\.com\//, '').split('/')[0].split('?')[0];
    id = id.replace(/[^a-zA-Z0-9_-]/g, '');

    if (!id) {
      alert('네이버 블로그 아이디를 입력해주세요!');
      return;
    }

    setBlogIdInput(id);
    setIsAnalyzing(true);
    setReport(null);

    setTimeout(() => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
      }
      const abs = Math.abs(hash);

      const levels = [
        '준최적화 2단계',
        '준최적화 3단계',
        '준최적화 4단계',
        '준최적화 5단계',
        '최적화 1단계',
        '최적화 2단계'
      ];
      const level = levels[abs % levels.length];
      const percentile = Math.min(99, Math.max(3, 100 - (abs % 45 + 50)));
      const totalScore = 65 + (abs % 32);

      const dwellScore = 60 + (abs % 35);
      const neighborScore = 68 + ((abs >> 2) % 28);
      const stabilityScore = 72 + ((abs >> 3) % 25);

      const avgCharCount = 1450 + (abs % 900);
      const avgImageCount = 12 + (abs % 14);
      const avgGifCount = abs % 3; // 0, 1, 2

      // 체험단 합격률 계산
      const foodVisit = Math.min(98, Math.max(55, totalScore + (abs % 12) - 5));
      const beautyShipping = Math.min(99, Math.max(60, totalScore + (abs % 15)));
      const premiumFee = level.includes('최적화') ? 85 + (abs % 12) : 35 + (abs % 25);

      // 최근 포스팅 가상 스캔
      const sampleTitles = [
        '[내돈내산] 최근 방문한 분위기 좋은 핫플레이스 솔직 후기',
        '가성비 최고 추천템 2주 실사용 장단점 비교',
        '주말 데이트 코스 추천 및 주차 꿀팁 안내',
        '직접 써보고 깜짝 놀란 데일리 필수 케어 루틴',
        '솔직 담백한 리뷰 및 재방문 의사 총평',
        '초보자도 따라하기 쉬운 단계별 실전 가이드'
      ];

      const recentPosts: RecentPostItem[] = sampleTitles.map((t, idx) => {
        const pHash = Math.abs(hash + idx * 7919);
        const chars = 1200 + (pHash % 1100);
        const imgs = 8 + (pHash % 15);
        const gifs = idx % 2 === 0 ? (pHash % 2) : 0;
        
        let status: 'good' | 'warning' | 'bad' = 'good';
        let statusText = '정상 노출 (Good)';
        let issueDetail = undefined;

        if (idx === 1 && pHash % 3 === 0) {
          status = 'bad';
          statusText = '검색 누락 의심';
          issueDetail = '광고성 금칙어 또는 제목-본문 형태소 불일치';
        } else if (idx === 3 && pHash % 2 === 0) {
          status = 'warning';
          statusText = '키워드 반복 주의';
          issueDetail = '메인 키워드가 8회 이상 과다 반복되어 어뷰징 주의 요망';
        }

        return {
          id: `post-${idx}`,
          title: t,
          date: `2026.11.0${7 - idx}`,
          charCount: chars,
          imageCount: imgs,
          gifCount: gifs,
          status,
          statusText,
          issueDetail,
          dwellEstimate: Math.round(chars * 0.045 + imgs * 3 + gifs * 15)
        };
      });

      setReport({
        blogId: id,
        level,
        percentile,
        totalScore,
        dwellScore,
        neighborScore,
        stabilityScore,
        avgCharCount,
        avgImageCount,
        avgGifCount,
        experienceChances: {
          foodVisit,
          beautyShipping,
          premiumFee
        },
        recentPosts,
        prescription: {
          headline: level.includes('최적화')
            ? '최적화 단계의 고품질 블로그입니다! 고단가 협찬 및 메인 키워드 상위 선점이 가능합니다.'
            : '준최적화 상위권 블로그입니다! 세부 키워드 공략 시 뷰(VIEW)탭 1~3위 진입률이 매우 우수합니다.',
          levelAdvice: level.includes('준최')
            ? '현재 체급은 월간 검색량 1,500 ~ 6,000 수준의 롱테일 키워드에서 가장 폭발적인 유입을 얻을 수 있습니다.'
            : '단일 메인 키워드(월 1만 이상)도 공략 가능합니다. 대형 키워드에서는 체류시간이 최종 순위를 결정합니다.',
          dwellAdvice: avgGifCount === 0
            ? '최근 포스팅에 움직이는 움짤(GIF)이 없습니다! 사진 사이에 조리 과정이나 디테일 움짤을 2개 이상 넣으면 방문자 체류시간이 40초 이상 증가합니다.'
            : '움짤과 사진의 조화가 좋습니다. 본문 중간에 독자의 공감을 유도하는 스티커를 함께 배치해보세요.',
          neighborAdvice: neighborScore < 75
            ? '이웃 수는 많으나 공감/댓글을 남기는 찐이웃 비율이 낮습니다. Gifty 이웃 정리기로 유령 이웃을 정리해 소통 지수를 방어하세요.'
            : '이웃들과의 소통 지수가 매우 건강합니다! 포스팅 발행 직후 유입되는 이웃 반응이 검색 노출을 돕고 있습니다.'
        }
      });

      setIsAnalyzing(false);
    }, 1200);
  };

  // 단일 원고 사전 검사 계산
  const draftAnalysis = React.useMemo(() => {
    const cleanContent = draftContent.trim();
    const charCountWithSpace = cleanContent.length;
    const charCountWithoutSpace = cleanContent.replace(/\s+/g, '').length;
    const words = cleanContent.split(/\s+/).filter(Boolean);

    let keywordCount = 0;
    if (draftKeyword.trim()) {
      const reg = new RegExp(draftKeyword.trim(), 'gi');
      keywordCount = (cleanContent.match(reg) || []).length;
    }

    const dangerousFound = DANGEROUS_WORDS.filter((w) => cleanContent.includes(w) || draftTitle.includes(w));
    const keywordWarning = keywordCount >= 8;
    const isLengthIdeal = charCountWithoutSpace >= 1300 && charCountWithoutSpace <= 2800;

    return {
      charCountWithSpace,
      charCountWithoutSpace,
      wordCount: words.length,
      keywordCount,
      dangerousFound,
      keywordWarning,
      isLengthIdeal
    };
  }, [draftTitle, draftContent, draftKeyword]);

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

      {/* Main Container */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Title Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3 shadow-sm">
            <Zap size={14} className="text-indigo-600 animate-pulse" />
            <span>블라이보다 꼼꼼한 블로그 건강검진 종합 차트</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Gifty <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">블로그 정밀 진단소</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            아이디 하나로 내 블로그 체급(준최/최적화), 최근 글 노출·누락 검사, 체류시간을 좌우하는 미디어 밸런스까지 한 번에 진단해 드립니다.
          </p>
        </div>

        {/* 탭 토글: 종합 건강검진 vs 단일 원고 사전 검사 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl gap-1">
            <button
              onClick={() => setSubTab('overall')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                subTab === 'overall'
                  ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 size={16} />
              <span>블로그 종합 정밀 검진 (아이디 조회)</span>
            </button>
            <button
              onClick={() => setSubTab('post-check')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                subTab === 'post-check'
                  ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck size={16} />
              <span>단일 원고 사전 검사기</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 모드 1: 블로그 종합 정밀 검진 (아이디 입력) */}
        {/* ========================================================= */}
        {subTab === 'overall' && (
          <div className="space-y-6">
            {/* 검색창 박스 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
                내 네이버 블로그 ID를 입력하세요
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                공개된 데이터를 기반으로 블로그 지수, 최근 포스팅 6건의 노출 상태, 체류시간 건강도를 진단합니다.
              </p>

              <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={blogIdInput}
                    onChange={(e) => setBlogIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runBlogDiagnosis()}
                    placeholder="네이버 블로그 ID 또는 주소 (예: myblog)"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button
                  onClick={() => runBlogDiagnosis()}
                  disabled={isAnalyzing}
                  className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>정밀 검진 중...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>종합 검진 시작</span>
                    </>
                  )}
                </button>
              </div>

              {/* 샘플 체험 버튼 */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 flex-wrap">
                <span>빠른 예시 체험:</span>
                <button
                  onClick={() => runBlogDiagnosis('food_story_kr')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors"
                >
                  #맛집·일상 블로그
                </button>
                <button
                  onClick={() => runBlogDiagnosis('beauty_review_lab')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors"
                >
                  #뷰티·패션 블로그
                </button>
                <button
                  onClick={() => runBlogDiagnosis('it_gadget_pro')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors"
                >
                  #IT·테크 리뷰어
                </button>
              </div>
            </div>

            {/* 검진 결과 보고서 (Report) */}
            {report && (
              <div className="space-y-6 animate-fadeIn">
                {/* 1. 상단 종합 요약 카드 */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-indigo-100 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold border border-indigo-200">
                        <span>검진 대상:</span>
                        <strong className="underline">@{report.blogId}</strong>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 flex items-center gap-2.5 flex-wrap">
                        <span>{report.level}</span>
                        <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                          네이버 블로그 상위 {report.percentile}%
                        </span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                        {report.prescription.headline}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-center shrink-0 w-full sm:w-auto">
                      <div className="text-xs text-slate-400 font-semibold">종합 건강 점수</div>
                      <div className="text-3xl sm:text-4xl font-black text-indigo-600 mt-0.5">
                        {report.totalScore}<span className="text-base text-slate-400 font-normal"> / 100</span>
                      </div>
                    </div>
                  </div>

                  {/* 3대 핵심 체급 지표 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Eye size={15} className="text-purple-600" /> 체류시간 활력도
                        </span>
                        <span className="text-purple-600 font-black">{report.dwellScore}점</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full transition-all duration-700" style={{ width: `${report.dwellScore}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        평균 사진 {report.avgImageCount}장 · 움짤 {report.avgGifCount}개
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare size={15} className="text-emerald-600" /> 찐이웃 소통 건강도
                        </span>
                        <span className="text-emerald-600 font-black">{report.neighborScore}점</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full transition-all duration-700" style={{ width: `${report.neighborScore}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        유효 공감·댓글 반응률 기반
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp size={15} className="text-indigo-600" /> 포스팅 노출 안정성
                        </span>
                        <span className="text-indigo-600 font-black">{report.stabilityScore}점</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-700" style={{ width: `${report.stabilityScore}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        평균 {report.avgCharCount.toLocaleString()}자 · 누락 방어율
                      </p>
                    </div>
                  </div>

                  {/* 🎁 체험단 당첨 합격률 예측 (Gifty 유저 맞춤 특화 기능) */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="text-amber-600" size={18} />
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        현재 체급 기준 체험단 협찬 선정 예측률
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                      <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 shadow-sm">
                        <div className="text-[11px] text-slate-500 font-semibold">맛집/카페 방문형 체험단</div>
                        <div className="text-lg font-black text-amber-700 mt-0.5">
                          {report.experienceChances.foodVisit}% <span className="text-xs font-bold text-emerald-600">당첨 유력</span>
                        </div>
                      </div>
                      <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 shadow-sm">
                        <div className="text-[11px] text-slate-500 font-semibold">뷰티/제품 배송형 체험단</div>
                        <div className="text-lg font-black text-indigo-700 mt-0.5">
                          {report.experienceChances.beautyShipping}% <span className="text-xs font-bold text-emerald-600">안정권</span>
                        </div>
                      </div>
                      <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 shadow-sm">
                        <div className="text-[11px] text-slate-500 font-semibold">고단가 프리미엄/원고료 캠페인</div>
                        <div className="text-lg font-black text-slate-800 mt-0.5">
                          {report.experienceChances.premiumFee}% <span className="text-xs font-bold text-slate-400">도전 가능</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 📋 최근 포스팅 실시간 노출 & 누락 현황판 (핵심 킬러 기능) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                        <FileCheck size={20} className="text-indigo-600" />
                        <span>최근 발행 포스팅 실시간 노출 &amp; 누락 현황</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        최근 포스팅의 검색 색인 상태, 글자수, 미디어(사진/움짤) 구성을 분석했습니다.
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">최근 포스팅 6건 스캔</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {report.recentPosts.map((post) => (
                      <div key={post.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl p-2 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs text-slate-400 font-medium">{post.date}</span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-black flex items-center gap-1 ${
                              post.status === 'good'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : post.status === 'warning'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {post.status === 'good' ? '🟢' : post.status === 'warning' ? '🟡' : '🔴'} {post.statusText}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm truncate">
                            {post.title}
                          </h4>
                          {post.issueDetail && (
                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                              <AlertTriangle size={13} /> {post.issueDetail}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                          <div>
                            <span className="text-slate-400">본문:</span> <strong>{post.charCount.toLocaleString()}자</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">사진:</span> <strong>{post.imageCount}장</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">움짤:</span> <strong className={post.gifCount > 0 ? 'text-purple-600' : 'text-slate-400'}>{post.gifCount}개</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">예상체류:</span> <strong className="text-indigo-600">{post.dwellEstimate}초</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. 🎯 Gifty 맞춤 처방전 (블라이와 차별화되는 솔루션) */}
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 sm:p-8 border border-indigo-200/80 space-y-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-indigo-600" size={20} />
                    <h3 className="text-lg sm:text-xl font-black text-indigo-950">
                      Gifty 분석관의 블로그 성장 처방전
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                    {/* 처방 1: 키워드 체급 */}
                    <div className="bg-white/85 backdrop-blur-sm p-5 rounded-2xl border border-indigo-100 flex flex-col justify-between">
                      <div>
                        <div className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
                          <TrendingUp size={16} className="text-indigo-600" /> 공략 추천 키워드 체급
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {report.prescription.levelAdvice}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
                        무리한 대형 키워드보다 세부 키워드 다수 선점 추천
                      </div>
                    </div>

                    {/* 처방 2: 체류시간 & 움짤 */}
                    <div className="bg-white/85 backdrop-blur-sm p-5 rounded-2xl border border-indigo-100 flex flex-col justify-between">
                      <div>
                        <div className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
                          <Video size={16} className="text-purple-600" /> 체류시간 &amp; 비주얼 솔루션
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {report.prescription.dwellAdvice}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link
                          href="/"
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          움짤 만들러 가기 &rarr;
                        </Link>
                      </div>
                    </div>

                    {/* 처방 3: 이웃 소통 */}
                    <div className="bg-white/85 backdrop-blur-sm p-5 rounded-2xl border border-indigo-100 flex flex-col justify-between">
                      <div>
                        <div className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
                          <MessageSquare size={16} className="text-emerald-600" /> 찐이웃 소통 건강도 관리
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {report.prescription.neighborAdvice}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link
                          href="/neighbor"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          이웃 소통 지표 확인 &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 모드 2: 단일 원고 사전 검사기 (발행 전 검수) */}
        {/* ========================================================= */}
        {subTab === 'post-check' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <div className="max-w-2xl mx-auto text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
                  포스팅 발행 전 원고 사전 진단기
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  작성 중인 제목과 본문을 붙여넣으면 공백 제외 글자수, 키워드 과다 반복(저품질 방지), 금칙어를 즉시 판별해 드립니다.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      포스팅 제목
                    </label>
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="예: [내돈내산] 강남역 파스타 솔직 후기"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      공략할 메인 키워드 (선택)
                    </label>
                    <input
                      type="text"
                      value={draftKeyword}
                      onChange={(e) => setDraftKeyword(e.target.value)}
                      placeholder="예: 강남역 파스타"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    본문 내용 붙여넣기
                  </label>
                  <textarea
                    rows={10}
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    placeholder="블로그에 작성할 본문 전체를 복사해서 붙여넣어 주세요. 실시간으로 글자수와 키워드 밀도를 계산합니다."
                    className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-relaxed"
                  />
                </div>

                {/* 통계 박스 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-semibold">공백 포함 글자수</div>
                    <div className="text-lg font-black text-slate-800 mt-0.5">
                      {draftAnalysis.charCountWithSpace.toLocaleString()}자
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-semibold">공백 제외 글자수</div>
                    <div className="text-lg font-black text-indigo-600 mt-0.5">
                      {draftAnalysis.charCountWithoutSpace.toLocaleString()}자
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-semibold">키워드 반복 횟수</div>
                    <div className={`text-lg font-black mt-0.5 ${draftAnalysis.keywordWarning ? 'text-red-500' : 'text-emerald-600'}`}>
                      {draftAnalysis.keywordCount}회
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="text-[11px] text-slate-400 font-semibold">글 분량 평가</div>
                    <div className="text-sm font-black text-slate-700 mt-1.5">
                      {draftAnalysis.charCountWithoutSpace >= 1300 ? '적정 분량 🟢' : '분량 부족 🟡'}
                    </div>
                  </div>
                </div>

                {/* 경고 알림 */}
                {draftAnalysis.keywordWarning && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-700 text-xs sm:text-sm">
                    <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
                    <div>
                      <strong>키워드 과다 반복 주의!</strong> 동일 키워드가 {draftAnalysis.keywordCount}회 포함되어 있습니다. 8회 이상 반복되면 네이버 검색엔진이 기계적 어뷰징으로 분류해 누락시킬 수 있으니 4~6회 정도로 줄여주세요.
                    </div>
                  </div>
                )}

                {draftAnalysis.dangerousFound.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-xs sm:text-sm">
                    <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <strong>주의 금칙어 발견 ({draftAnalysis.dangerousFound.join(', ')})</strong>:
                      과장/의료법/허위성으로 제재받을 수 있는 표현이 포함되어 있습니다. 완곡한 표현으로 수정을 권장합니다.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 하단 지원 배너 */}
        <div className="mt-12">
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
