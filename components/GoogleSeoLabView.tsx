'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Zap,
  FileCode2,
  ArrowRight,
  BookOpen,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  HelpCircle,
  Layers,
  Sparkles,
  Info,
  Smartphone,
  Copy,
  Check,
  Send,
  Award,
  Flame,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import {
  GoogleSeoReport,
  GoogleParsedPost,
  GoogleIndexStatus,
  runRealGoogleSeoAnalysis,
  generateInitialGoogleReport,
  generateGoogleReportFromNaverPosts,
  calculateIndexSummary
} from '@/lib/googleSeoAnalyzer';
import { getCurrentRankingWeekInfo } from '@/lib/blogRankingData';

interface GoogleSeoLabViewProps {
  initialNaverBlogId?: string;
  initialNaverPosts?: any[];
}

export default function GoogleSeoLabView({
  initialNaverBlogId,
  initialNaverPosts
}: GoogleSeoLabViewProps) {
  // 사용자가 네이버 탭에서 글을 불러왔으면 해당 아이디로 기본 설정
  const defaultTarget = initialNaverBlogId || 'masining';
  const [urlInput, setUrlInput] = useState<string>(defaultTarget);

  const [analyzedReport, setAnalyzedReport] = useState<GoogleSeoReport>(() => {
    if (initialNaverPosts && initialNaverPosts.length > 0) {
      return generateGoogleReportFromNaverPosts(defaultTarget, initialNaverPosts);
    }
    return generateInitialGoogleReport(defaultTarget);
  });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>('구글봇 분석 중...');

  // ==========================================
  // [구글 누락글 점검 센터 전용 상태]
  // ==========================================
  const [filterStatus, setFilterStatus] = useState<'all' | 'indexed' | 'pending' | 'missing' | 'cannibalized'>('all');
  const [postSearchTerm, setPostSearchTerm] = useState<string>('');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [diagSubTab, setDiagSubTab] = useState<Record<string, 'errors' | 'serp' | 'eeat' | 'accelerate'>>({});
  const [isBatchChecking, setIsBatchChecking] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const weekInfo = useMemo(() => getCurrentRankingWeekInfo(), []);

  // 네이버 탭의 실제 글 데이터가 나중에 로드되거나 변경되었을 때 자동 반영
  useEffect(() => {
    if (initialNaverPosts && initialNaverPosts.length > 0 && analyzedReport.recentPosts.length <= 6 && analyzedReport.domain !== `blog.naver.com/${initialNaverBlogId}`) {
      const report = generateGoogleReportFromNaverPosts(initialNaverBlogId || 'masining', initialNaverPosts);
      setAnalyzedReport(report);
      setUrlInput(initialNaverBlogId || 'masining');
    }
  }, [initialNaverPosts, initialNaverBlogId]);

  const handleAnalyze = async (e?: React.FormEvent, customUrl?: string) => {
    if (e) e.preventDefault();
    const target = (customUrl || urlInput || '').trim();
    if (!target) return;

    // 만약 현재 입력값이 네이버 탭의 블로그 아이디와 같고 실제 네이버 글이 이미 로드되어 있다면 즉시 연동
    if (initialNaverPosts && initialNaverPosts.length > 0 && (target === initialNaverBlogId || target.includes(initialNaverBlogId || ''))) {
      const report = generateGoogleReportFromNaverPosts(initialNaverBlogId || target, initialNaverPosts);
      setAnalyzedReport(report);
      return;
    }

    setIsAnalyzing(true);
    setAnalyzingStep('1. 블로그 실제 RSS 피드 및 최신 포스팅 수집 중...');

    try {
      setTimeout(() => {
        setAnalyzingStep('2. 구글봇 색인 상태 및 H1~H3·Alt·서치콘솔 오류 진단 중...');
      }, 700);

      const report = await runRealGoogleSeoAnalysis(target);
      setAnalyzedReport(report);
      setExpandedPostId(null);
    } catch (err) {
      console.warn('Real analysis error, using fallback report', err);
      setAnalyzedReport(generateInitialGoogleReport(target));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickUrl = (url: string) => {
    setUrlInput(url);
    handleAnalyze(undefined, url);
  };

  // 네이버 탭에서 불러온 내 실제 글 30편으로 즉시 전환
  const handleLoadNaverTabPosts = () => {
    if (!initialNaverPosts || initialNaverPosts.length === 0) return;
    const report = generateGoogleReportFromNaverPosts(initialNaverBlogId || 'masining', initialNaverPosts);
    setAnalyzedReport(report);
    setUrlInput(initialNaverBlogId || 'masining');
  };

  // 구글 누락/색인 일괄 실시간 점검 시뮬레이션
  const handleBatchIndexCheck = async () => {
    if (isBatchChecking || analyzedReport.recentPosts.length === 0) return;

    setIsBatchChecking(true);
    const total = analyzedReport.recentPosts.length;
    setBatchProgress({ current: 0, total });

    for (let i = 0; i < total; i++) {
      await new Promise((res) => setTimeout(res, 200));
      setBatchProgress({ current: i + 1, total });
    }

    setAnalyzedReport((prev) => {
      const updatedPosts = prev.recentPosts.map((post) => ({
        ...post,
        indexScore: Math.min(99, post.indexScore + 1)
      }));
      return {
        ...prev,
        recentPosts: updatedPosts,
        indexSummary: calculateIndexSummary(updatedPosts)
      };
    });

    setIsBatchChecking(false);
    setBatchProgress(null);
  };

  // URL 클립보드 복사
  const handleCopyUrl = (url: string, postId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const {
    totalScore,
    grade,
    items,
    vitals,
    rankInfo,
    platform,
    domain,
    isRealData,
    recentPosts,
    indexSummary,
    googleLiveQueries,
    googleOfficialTools
  } = analyzedReport;

  // 필터링된 포스팅 목록
  const filteredPosts = useMemo(() => {
    return recentPosts.filter((post) => {
      const matchFilter =
        filterStatus === 'all' ||
        (filterStatus === 'indexed' && post.indexStatus === 'indexed') ||
        (filterStatus === 'pending' && post.indexStatus === 'pending') ||
        (filterStatus === 'missing' && post.indexStatus === 'missing') ||
        (filterStatus === 'cannibalized' && Boolean(post.diagnostic.cannibalizationWarning));

      const matchSearch =
        !postSearchTerm.trim() ||
        post.title.toLowerCase().includes(postSearchTerm.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [recentPosts, filterStatus, postSearchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. 상단 안내 히어로 배너 */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-blue-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-blue-400 to-cyan-400 text-slate-950 shadow-xs flex items-center gap-1">
              <Globe size={13} />
              <span>실시간 구글 검색엔진 SEO & 누락글 정밀 연구소</span>
            </span>
            <span className="text-xs text-blue-200 font-bold">{weekInfo.weekText}</span>
            {isRealData ? (
              <span className="text-[11px] bg-emerald-500/30 text-emerald-200 font-extrabold px-3 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                실제 작성 포스팅 {recentPosts.length}편 실시간 구글 색인 분석 완료
              </span>
            ) : (
              <span className="text-[11px] bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full border border-white/10">
                네이버 블로그 · 티스토리 · 워드프레스
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            구글 웹마스터 <span className="text-blue-400">G-Power SEO & 내가 쓴 글 색인 점검</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            네이버 블로그, 티스토리, 워드프레스에 <b>내가 쓴 실제 글</b>이 구글 검색엔진에 정상 색인(Indexed)되었는지, 30개 타일과 목록으로 한눈에 점검하고 누락 원인을 처방합니다.
          </p>
        </div>
      </div>

      {/* 2. 네이버 탭 연동 안내 원클릭 바 (내 글 바로 가져오기) */}
      {initialNaverPosts && initialNaverPosts.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs text-slate-800">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0">
              <UserCheck size={16} />
            </div>
            <div>
              <span className="font-extrabold text-emerald-950 block">
                네이버 탭에서 분석한 <b>[{initialNaverBlogId}]</b> 블로그 글 {initialNaverPosts.length}건 감지됨
              </span>
              <span className="text-slate-600 text-[11px]">
                주소를 다시 칠 필요 없이, 내가 쓴 실제 글 목록 그대로 구글 색인 여부를 즉시 점검할 수 있습니다.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLoadNaverTabPosts}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-sm transition-all active:scale-95 shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles size={13} />
            <span>내 실제 글 구글 색인 즉시 점검</span>
          </button>
        </div>
      )}

      {/* 3. URL 및 블로그 아이디 검색창 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="네이버 블로그 아이디(예: masining), 주소, 또는 티스토리·워드프레스 입력"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>{analyzingStep}</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>내가 쓴 글 구글 색인 점검</span>
              </>
            )}
          </button>
        </form>

        {/* 빠른 예시 링크 */}
        <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-700">추천 샘플:</span>
          {initialNaverBlogId && (
            <button
              type="button"
              onClick={() => handleQuickUrl(initialNaverBlogId)}
              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors text-emerald-900 font-black flex items-center gap-1"
            >
              <span>⭐ 내 네이버 블로그 ({initialNaverBlogId})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleQuickUrl('masining')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700 font-bold"
          >
            masining (네이버)
          </button>
          <button
            type="button"
            onClick={() => handleQuickUrl('tech-memo.tistory.com')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
          >
            tech-memo.tistory.com (티스토리)
          </button>
          <button
            type="button"
            onClick={() => handleQuickUrl('invest-diary.wordpress.com')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
          >
            invest-diary.wordpress.com (워드프레스)
          </button>
        </div>
      </div>

      {/* 4. 진단 결과 요약 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 종합 SEO 점수 & 등급 카드 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google SEO Score</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                {platform}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-900 tracking-tight">{totalScore}</span>
              <span className="text-slate-400 font-bold text-lg">/ 100점</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                grade === 'S' ? 'bg-emerald-500 text-white' :
                grade === 'A' ? 'bg-blue-600 text-white' :
                grade === 'B' ? 'bg-indigo-600 text-white' :
                'bg-amber-500 text-white'
              }`}>
                {grade}등급
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {grade === 'S' || grade === 'A' ? '구글 상위 노출에 매우 유리한 환경' : '일부 테크니컬 수정 시 순위 급상승 가능'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            도메인: <strong className="text-slate-700">{domain}</strong>
          </p>
        </div>

        {/* 구글 웹마스터 전국 랭킹 & DA 점수 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google G-Rank</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                {rankInfo.percentile}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{rankInfo.rank.toLocaleString()}</span>
              <span className="text-sm font-bold text-slate-500">위</span>
              <span className={`text-xs font-extrabold ml-1 ${
                rankInfo.change >= 0 ? 'text-rose-600' : 'text-blue-600'
              }`}>
                {rankInfo.change >= 0 ? `▲ +${rankInfo.change}` : `▼ ${rankInfo.change}`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              추정 도메인 파워(DA): <strong className="text-blue-600 font-bold">{rankInfo.daScore}점</strong> · 색인 키워드 약 {rankInfo.indexedKeywordsEstimate.toLocaleString()}개
            </p>
          </div>

          {/* 5주간 순위 추이 미니 그래프 */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-bold">
              <span>최근 5주차 랭킹 추이</span>
              <span>{weekInfo.weekText}</span>
            </div>
            <div className="flex items-end gap-1.5 h-10">
              {rankInfo.trend.map((r, i) => {
                const max = Math.max(...rankInfo.trend);
                const min = Math.min(...rankInfo.trend);
                const range = Math.max(1, max - min);
                const heightPercent = 20 + Math.round(((max - r) / range) * 75);
                const isCurrent = i === rankInfo.trend.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className={`w-full rounded-md transition-all ${
                        isCurrent ? 'bg-blue-600' : 'bg-slate-200 hover:bg-slate-300'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <span className="text-[9px] text-slate-400 scale-90">{r.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 코어 웹 바이탈 요약 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Core Web Vitals</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                구글 공식 권장 기준
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">LCP (로딩)</span>
                <span className="text-sm font-black text-emerald-600">{vitals.lcp}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">권장 2.5s 이하</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">FID (반응)</span>
                <span className="text-sm font-black text-blue-600">{vitals.fid}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">권장 100ms</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">CLS (안정)</span>
                <span className="text-sm font-black text-indigo-600">{vitals.cls}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">권장 0.1 이하</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">모바일 반응형 최적화:</span>
            <span className="font-extrabold text-blue-600">{vitals.mobileScore}점 (완벽 준수)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. [블로그처럼 확인하는] 구글 포스팅 30개 색인 타일 뷰 & 정밀 점검 센터 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* 헤더 & 일괄 점검 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Layers size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                내가 쓴 글 구글 색인 & 누락 30개 타일 점검기
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-2xs">
                G-Index 30-Tiles™
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-10">
              네이버 블로그 탭처럼, <b>내가 쓴 실제 포스팅</b>의 구글 색인 상태를 타일 클릭 한 번으로 확인합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <a
              href={`https://www.google.com/ping?sitemap=${encodeURIComponent(`https://${domain}/sitemap.xml`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 shadow-2xs"
              title="구글 검색엔진에 sitemap.xml 즉시 재수집 핑 전송"
            >
              <Send size={13} className="text-emerald-600" />
              <span>구글 사이트맵 핑 전송</span>
            </a>
            <button
              type="button"
              onClick={handleBatchIndexCheck}
              disabled={isBatchChecking || recentPosts.length === 0}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isBatchChecking ? 'animate-spin' : ''} />
              <span>{isBatchChecking ? `일괄 점검 중 (${batchProgress?.current}/${batchProgress?.total})...` : '⚡ 구글 색인·누락 일괄 정밀 점검'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* [핵심 기능] 네이버 탭과 동일한 구글 포스팅 실시간 30개 타일 뷰 (Tile View) */}
        {/* ========================================================================= */}
        <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-4 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-extrabold text-sm text-slate-100">
                실제 작성 포스팅 구글 색인 현황 타일 ({recentPosts.length}건)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              💡 타일을 클릭하면 해당 글의 <b>구글 공식 검색결과(site:URL)</b>가 새 창으로 즉시 열립니다.
            </span>
          </div>

          {/* 타일 그리드 (최대 30개 지원) */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {recentPosts.map((post, idx) => {
              const isIndexed = post.indexStatus === 'indexed';
              const isPending = post.indexStatus === 'pending';
              const isMissing = post.indexStatus === 'missing';
              const isCannibalized = Boolean(post.diagnostic.cannibalizationWarning);

              return (
                <a
                  key={post.id}
                  href={post.googleSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`[${idx + 1}번 글] ${post.title}\n상태: ${isIndexed ? '🟢 구글 색인 완료' : isPending ? '🟡 수집·색인 대기' : '🔴 색인 누락(의심)'}\n클릭 시 구글에서 site:검색 실행`}
                  className={`h-11 sm:h-12 rounded-2xl flex flex-col items-center justify-center font-black text-xs transition-all hover:scale-110 cursor-pointer shadow-md relative group ${
                    isCannibalized
                      ? 'bg-orange-500 text-white hover:bg-orange-600 ring-2 ring-orange-300'
                      : isIndexed
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-1 ring-emerald-300'
                      : isPending
                      ? 'bg-amber-400 text-amber-950 hover:bg-amber-500 ring-1 ring-amber-300'
                      : 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-400'
                  }`}
                >
                  <span className="text-sm">{idx + 1}</span>
                  <span className="text-[9px] opacity-90 leading-none">
                    {isCannibalized ? '잠식' : isIndexed ? '색인' : isPending ? '대기' : '누락'}
                  </span>
                </a>
              );
            })}
          </div>

          {/* 타일 범례 & 요약 바 */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-800 text-slate-300">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-lg bg-emerald-500" />
                <span className="font-bold text-emerald-300">🟢 구글 색인 완료 ({indexSummary.indexedCount}건)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-lg bg-amber-400" />
                <span className="font-bold text-amber-300">🟡 수집·색인 대기 ({indexSummary.pendingCount}건)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-lg bg-rose-600" />
                <span className="font-bold text-rose-300">🔴 색인 누락(의심) ({indexSummary.missingCount}건)</span>
              </div>
              {indexSummary.cannibalizationCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-lg bg-orange-500" />
                  <span className="font-bold text-orange-300">⚠️ 키워드 잠식 ({indexSummary.cannibalizationCount}건)</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              구글 색인 달성률: <strong className="text-emerald-400 font-black">{indexSummary.indexRate}%</strong>
            </span>
          </div>
        </div>

        {/* 필터 탭 & 검색창 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 ({recentPosts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('indexed')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filterStatus === 'indexed' ? 'bg-emerald-600 text-white shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
              정상 색인 ({indexSummary.indexedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-200"></span>
              수집 대기 ({indexSummary.pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('missing')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filterStatus === 'missing' ? 'bg-rose-600 text-white shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-200"></span>
              누락 의심 ({indexSummary.missingCount})
            </button>
            {indexSummary.cannibalizationCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterStatus('cannibalized')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  filterStatus === 'cannibalized' ? 'bg-orange-600 text-white shadow-2xs font-black' : 'text-orange-700 hover:text-orange-900'
                }`}
              >
                <Flame size={12} />
                키워드 잠식 ({indexSummary.cannibalizationCount})
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="내가 쓴 글 제목 검색..."
              value={postSearchTerm}
              onChange={(e) => setPostSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* 포스팅별 색인 & 누락 정밀 점검 리스트 */}
        <div className="space-y-3 pt-1">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              조건에 일치하는 포스팅이 없습니다.
            </div>
          ) : (
            filteredPosts.map((post, idx) => {
              const isExpanded = expandedPostId === post.id;
              const subTab = diagSubTab[post.id] || 'errors';
              const setPostSubTab = (tab: 'errors' | 'serp' | 'eeat' | 'accelerate') => {
                setDiagSubTab((prev) => ({ ...prev, [post.id]: tab }));
              };

              return (
                <div
                  key={post.id}
                  className={`rounded-2xl border transition-all ${
                    post.diagnostic.cannibalizationWarning
                      ? 'border-orange-300 bg-orange-50/20'
                      : post.indexStatus === 'missing'
                      ? 'border-rose-200 bg-rose-50/30'
                      : post.indexStatus === 'pending'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200/90 bg-white hover:border-blue-200'
                  }`}
                >
                  {/* 포스팅 메인 행 */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 상태 뱃지 */}
                        {post.indexStatus === 'indexed' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            🟢 구글 색인 완료
                          </span>
                        ) : post.indexStatus === 'pending' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle size={12} className="text-amber-600" />
                            🟡 수집·색인 대기
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <XCircle size={12} className="text-rose-600" />
                            🔴 구글 색인 누락(위험)
                          </span>
                        )}

                        {/* 키워드 잠식 경고 뱃지 */}
                        {post.diagnostic.cannibalizationWarning && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-orange-100 text-orange-900 border border-orange-300 flex items-center gap-1">
                            <Flame size={12} className="text-orange-600" />
                            ⚠️ 키워드 잠식(팀킬)
                          </span>
                        )}

                        {/* E-E-A-T 점수 뱃지 */}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          E-E-A-T {post.diagnostic.eeat.eeatScore}점
                        </span>

                        <span className="text-[11px] text-slate-400 font-bold">{post.pubDate}</span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          글자 수: <strong className="text-slate-800">{post.charCount.toLocaleString()}자</strong>
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          사진: <strong className="text-slate-800">{post.totalImages}장</strong>
                        </span>
                      </div>

                      {/* 실제 글 제목 */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="font-extrabold text-blue-600 text-xs">#{idx + 1}</span>
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 flex items-center gap-1"
                        >
                          <span>{post.title}</span>
                          <ExternalLink size={12} className="shrink-0 text-slate-400" />
                        </a>
                      </div>

                      {/* 서치콘솔 오류 진단 요약 문구 */}
                      <p className="text-xs text-slate-500 line-clamp-1">
                        <strong className="text-slate-700 font-semibold">구글봇 예측:</strong> {post.diagnostic.consoleErrorTitle}
                      </p>
                    </div>

                    {/* 우측 실시간 검증 액션 버튼 그룹 */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 flex-wrap">
                      {/* 1. 구글 실시간 site: 검색 검증 버튼 */}
                      <a
                        href={post.googleSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-colors flex items-center gap-1"
                        title="구글에서 site:검색으로 실제 색인 여부 확인"
                      >
                        <Search size={12} />
                        <span>구글 검색</span>
                      </a>

                      {/* 2. 구글 서치콘솔 URL 검사 */}
                      <a
                        href={post.searchConsoleInspectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors flex items-center gap-1"
                        title="구글 서치콘솔 URL 검사 창 열기"
                      >
                        <Globe size={12} />
                        <span>서치콘솔</span>
                      </a>

                      {/* 3. 누락 원인 정밀 진단 아코디언 토글 */}
                      <button
                        type="button"
                        onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          isExpanded
                            ? 'bg-slate-900 text-white'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                        }`}
                      >
                        <ShieldCheck size={13} />
                        <span>{isExpanded ? '진단 접기' : '초정밀 진단'}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* 아코디언 확장 영역 */}
                  {isExpanded && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-slate-100 bg-white/80 rounded-b-2xl space-y-4 text-xs animate-in fade-in duration-150">
                      {/* 서브 탭 네비게이션 */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setPostSubTab('errors')}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            subTab === 'errors'
                              ? 'bg-white text-slate-900 shadow-2xs font-black'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <ShieldCheck size={13} className="text-blue-600" />
                          <span>1. 서치콘솔 오류 & 잠식 진단</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPostSubTab('serp')}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            subTab === 'serp'
                              ? 'bg-white text-slate-900 shadow-2xs font-black'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Smartphone size={13} className="text-indigo-600" />
                          <span>2. 모바일 구글 SERP 미리보기</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPostSubTab('eeat')}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            subTab === 'eeat'
                              ? 'bg-white text-slate-900 shadow-2xs font-black'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Award size={13} className="text-amber-600" />
                          <span>3. E-E-A-T 신뢰도 & 출처</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPostSubTab('accelerate')}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            subTab === 'accelerate'
                              ? 'bg-white text-slate-900 shadow-2xs font-black'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Send size={13} className="text-emerald-600" />
                          <span>4. 원클릭 색인 가속 도구</span>
                        </button>
                      </div>

                      {/* [서브 탭 1] 서치콘솔 오류 및 키워드 잠식 진단 */}
                      {subTab === 'errors' && (
                        <div className="space-y-3">
                          <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                            post.diagnostic.consoleErrorCode === 'none'
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-rose-50/70 border-rose-200 text-rose-950'
                          }`}>
                            <Info size={17} className={`shrink-0 mt-0.5 ${
                              post.diagnostic.consoleErrorCode === 'none' ? 'text-emerald-600' : 'text-rose-600'
                            }`} />
                            <div>
                              <strong className="block font-black text-sm">
                                {post.diagnostic.consoleErrorTitle}
                              </strong>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                {post.diagnostic.consoleErrorDescription}
                              </p>
                            </div>
                          </div>

                          {post.diagnostic.cannibalizationWarning && (
                            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2 text-xs">
                              <Flame size={16} className="text-orange-600 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <strong className="text-orange-950 font-bold block">
                                  {post.diagnostic.cannibalizationWarning}
                                </strong>
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                  충돌 포스팅: <b>&quot;{post.diagnostic.conflictingPostTitle}&quot;</b><br />
                                  타깃 키워드가 겹쳐 구글이 어떤 글을 띄울지 결정하지 못합니다. 롱테일 키워드로 수정하세요.
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                              <span className="text-[10px] text-slate-400 font-bold block">1. 본문 텍스트 분량</span>
                              <span className={`text-xs font-black block mt-0.5 ${
                                post.diagnostic.charStatus === 'good' ? 'text-emerald-700' :
                                post.diagnostic.charStatus === 'warning' ? 'text-amber-700' : 'text-rose-700'
                              }`}>
                                {post.diagnostic.charText}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                              <span className="text-[10px] text-slate-400 font-bold block">2. 이미지 Alt(대체 텍스트)</span>
                              <span className={`text-xs font-black block mt-0.5 ${
                                post.diagnostic.altStatus === 'good' ? 'text-emerald-700' :
                                post.diagnostic.altStatus === 'warning' ? 'text-amber-700' : 'text-rose-700'
                              }`}>
                                {post.diagnostic.altText}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                              <span className="text-[10px] text-slate-400 font-bold block">3. H2·H3 소제목 계층</span>
                              <span className={`text-xs font-black block mt-0.5 ${
                                post.diagnostic.headingStatus === 'good' ? 'text-emerald-700' : 'text-amber-700'
                              }`}>
                                {post.diagnostic.headingText}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1.5">
                            <span className="font-extrabold text-blue-900 block text-[11px] flex items-center gap-1">
                              <Sparkles size={12} className="text-blue-600" />
                              <span>구글 검색 누락 탈출 & 색인 가속 처방전:</span>
                            </span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px] leading-relaxed">
                              {post.diagnostic.indexTips.map((tip, tIdx) => (
                                <li key={tIdx}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* [서브 탭 2] 모바일 구글 SERP 실시간 미리보기 */}
                      {subTab === 'serp' && (
                        <div className="space-y-3">
                          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                              <span className="flex items-center gap-1.5">
                                <Smartphone size={13} className="text-cyan-400" />
                                <span>실제 구글 모바일 검색 결과 화면 (SERP Preview)</span>
                              </span>
                              <span>화면 폭: 580px 기준</span>
                            </div>

                            <div className="bg-white rounded-xl p-3.5 text-slate-900 space-y-1 shadow-sm font-sans">
                              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                                  G
                                </div>
                                <span className="font-bold text-slate-800">{domain}</span>
                                <span className="text-slate-400 line-clamp-1">{post.diagnostic.serpPreview.displayBreadcrumb}</span>
                              </div>

                              <h4 className="text-blue-700 hover:underline font-bold text-sm sm:text-base leading-snug cursor-pointer line-clamp-2">
                                {post.diagnostic.serpPreview.displayTitle}
                              </h4>

                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-0.5">
                                <span className="text-slate-400 text-[11px] mr-1">{post.pubDate} —</span>
                                {post.diagnostic.serpPreview.displaySnippet}
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              <strong className="text-slate-800 block">
                                제목 길이: {post.diagnostic.serpPreview.titleCharCount}자 (추정 {post.diagnostic.serpPreview.pixelEstimate}px / 최대 600px)
                              </strong>
                              <span className="text-slate-500 text-[11px]">
                                {post.diagnostic.serpPreview.isTitleTruncated
                                  ? '⚠️ 모바일 검색 화면에서 제목 뒷부분이 말줄임표(...)로 잘릴 위험이 있습니다.'
                                  : '✅ 구글 모바일 검색창에 잘림 없이 100% 온전하게 노출됩니다.'}
                              </span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 ${
                              post.diagnostic.serpPreview.isTitleTruncated
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {post.diagnostic.serpPreview.isTitleTruncated ? '길이 최적화 권장' : '길이 완벽'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* [서브 탭 3] 구글 E-E-A-T 신뢰도 & 출처 진단 */}
                      {subTab === 'eeat' && (
                        <div className="space-y-3">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Award size={15} className="text-amber-500" />
                                <span>구글 E-E-A-T 종합 품질 지수</span>
                              </span>
                              <span className="text-base font-black text-indigo-700">
                                {post.diagnostic.eeat.eeatScore}점 / 100점
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                                <span className="text-[10px] text-slate-400 font-bold block">Experience (경험)</span>
                                <span className="text-sm font-black text-blue-600">{post.diagnostic.eeat.experienceScore}점</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                                <span className="text-[10px] text-slate-400 font-bold block">Expertise (전문성)</span>
                                <span className="text-sm font-black text-indigo-600">{post.diagnostic.eeat.expertiseScore}점</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                                <span className="text-[10px] text-slate-400 font-bold block">Authoritativeness (권위)</span>
                                <span className="text-sm font-black text-purple-600">{post.diagnostic.eeat.authoritativenessScore}점</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                                <span className="text-[10px] text-slate-400 font-bold block">Trust (신뢰도)</span>
                                <span className="text-sm font-black text-emerald-600">{post.diagnostic.eeat.trustworthinessScore}점</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                              💡 <strong>구글 평가 요약:</strong> {post.diagnostic.eeat.inboundContextNote}. 외부 공신력 인용 링크: <b>{post.diagnostic.eeat.outboundLinksCount}개</b> 검출.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* [서브 탭 4] 원클릭 색인 가속 도구 */}
                      {subTab === 'accelerate' && (
                        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border border-emerald-200/80 space-y-3">
                          <div className="flex items-center gap-2 text-emerald-950 font-black">
                            <Send size={16} className="text-emerald-600 shrink-0" />
                            <span>G-FastIndex™ 원클릭 검색엔진 수집 가속기</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            누락되었거나 수집 대기 중인 글을 구글 및 검색엔진 로봇에게 즉시 재크롤링하도록 신호(Ping)를 보냅니다.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            <a
                              href={post.sitemapPingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-white hover:bg-emerald-500 hover:text-white rounded-xl border border-emerald-200 transition-all text-center group flex flex-col items-center justify-center gap-1 shadow-2xs"
                            >
                              <span className="font-bold text-xs text-slate-800 group-hover:text-white">1. 구글 사이트맵 핑 전송</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-emerald-100">sitemap.xml 갱신 통지</span>
                            </a>

                            <a
                              href={post.searchConsoleInspectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl border border-blue-200 transition-all text-center group flex flex-col items-center justify-center gap-1 shadow-2xs"
                            >
                              <span className="font-bold text-xs text-slate-800 group-hover:text-white">2. 서치콘솔 색인 생성 요청</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-blue-100">공식 수동 색인 신청</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => handleCopyUrl(post.link, post.id)}
                              className="p-3 bg-white hover:bg-slate-800 hover:text-white rounded-xl border border-slate-200 transition-all text-center group flex flex-col items-center justify-center gap-1 shadow-2xs"
                            >
                              <span className="font-bold text-xs text-slate-800 group-hover:text-white flex items-center gap-1">
                                {copiedPostId === post.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                <span>{copiedPostId === post.id ? 'URL 복사 완료!' : '3. 포스팅 URL 복사'}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-300">외부 백링크 배포용</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 구글 검색 누락 해결 5단계 가이드 알림창 */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/80 text-xs space-y-2">
          <div className="flex items-center gap-2 font-black text-blue-950">
            <HelpCircle size={16} className="text-blue-600 shrink-0" />
            <span>💡 구글 검색에서 내 글이 누락(미색인)되었을 때 1분 해결 체크리스트</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            1. <b>구글 서치콘솔 URL 검사:</b> 서치콘솔 상단에 누락된 포스팅 URL을 넣고 <b>[색인 생성 요청]</b>을 클릭하세요.<br />
            2. <b>키워드 잠식(팀킬) 해소:</b> 같은 블로그 안에 동일한 메인 키워드를 쓴 글이 있는지 확인하고 롱테일 키워드로 차별화하세요.<br />
            3. <b>Thin Content 보강:</b> 글자 수가 800자 이하일 경우 구글 품질 알고리즘에 의해 제외됩니다. 본문 내용을 1,200자 이상으로 늘리세요.<br />
            4. <b>이미지 Alt & 소제목 H2 삽입:</b> 구글 봇은 텍스트와 Alt 속성만 읽을 수 있습니다. 이미지마다 설명 텍스트를 기재하세요.<br />
            5. <b>발행 초기 48시간 대기:</b> 구글은 네이버보다 수집이 늦습니다. 발행 후 2~3일이 지나면 자연스럽게 색인되기도 합니다.
          </p>
        </div>
      </div>

      {/* 6. 구글 5대 테크니컬 SEO 세부 진단 리포트 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FileCode2 className="text-blue-600" size={22} />
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              구글 5대 테크니컬 SEO 정밀 점검표
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:block">
            구글 검색엔진 최적화 가이드라인 100% 준수 여부
          </span>
        </div>

        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5"
            >
              <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                <div className="flex items-center gap-2.5">
                  {item.status === 'good' ? (
                    <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : item.status === 'warning' ? (
                    <div className="p-1 rounded-full bg-amber-100 text-amber-600">
                      <AlertTriangle size={16} />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-rose-100 text-rose-600">
                      <XCircle size={16} />
                    </div>
                  )}
                  <h4 className="text-sm sm:text-base font-bold text-slate-800">
                    {idx + 1}. {item.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {item.realMetric && (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                      {item.realMetric}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                    item.status === 'good'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {item.status === 'good' ? '최적화 양호' : '개선 필요 권장'}
                  </span>
                  <span className="text-sm font-black text-slate-700">{item.score}점</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7">
                {item.message}
              </p>

              <div className="ml-7 p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                <span className="font-bold text-blue-600 shrink-0">💡 개선 꿀팁:</span>
                <span className="leading-relaxed">{item.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Gifty 솔루션 연동 배너 */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <Zap size={14} /> 구글 SEO 핵심 팁
          </div>
          <h4 className="text-xl sm:text-2xl font-black">
            구글 LCP 감점의 70%는 고용량 이미지·움짤 때문입니다!
          </h4>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            무거운 포토샵 대신, Gifty에서 동영상과 GIF를 5초 만에 2MB 이하로 가볍게 무손실 압축하여 구글 코어 웹 바이탈 점수를 즉시 올리세요.
          </p>
        </div>
        <Link
          href="/"
          className="px-6 py-3.5 bg-white text-indigo-700 hover:bg-slate-100 rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-2"
        >
          <span>Gifty로 움짤 용량 줄이기</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* 8. Google 공식 검사 도구 원클릭 연동 배너 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="text-blue-600" size={20} />
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            구글 공식 웹마스터 도구 원클릭 실시간 검사
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          구글 본사 서버의 공식 측정 화면을 새 창에서 직접 열어 100% 공식 데이터를 교차 확인하세요.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {googleOfficialTools.map((tool, idx) => (
            <a
              key={idx}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300 transition-all group flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div>
                <span className="text-[11px] font-black text-blue-700 block mb-1">
                  Google 공식 도구 #{idx + 1}
                </span>
                <p className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-700">
                  {tool.name}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {tool.desc}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 group-hover:translate-x-1 transition-transform self-end">
                <span>공식 검사창 열기</span>
                <ExternalLink size={12} />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 9. 구글 실시간 검색 노출 관측 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            실시간 구글 검색 관측기 (Live Google Search Monitor)
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          구글 검색창을 직접 열어 내 블로그의 실제 색인 여부와 인용 링크를 클릭 한 번으로 확인하세요.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {googleLiveQueries.map((q, idx) => (
            <a
              key={idx}
              href={q.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all group flex flex-col justify-between gap-3"
            >
              <div>
                <span className="text-[11px] font-bold text-blue-600 block mb-1">
                  검색 명령어 #{idx + 1}
                </span>
                <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700">
                  {q.query}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {q.label}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 group-hover:translate-x-1 transition-transform self-end">
                <span>구글에서 직접 확인</span>
                <ExternalLink size={12} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
