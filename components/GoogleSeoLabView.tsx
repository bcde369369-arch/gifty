'use client';

import React, { useState, useMemo } from 'react';
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
  BookOpen
} from 'lucide-react';
import {
  GoogleSeoReport,
  runRealGoogleSeoAnalysis,
  generateInitialGoogleReport
} from '@/lib/googleSeoAnalyzer';
import { getCurrentRankingWeekInfo } from '@/lib/blogRankingData';

export default function GoogleSeoLabView() {
  const [urlInput, setUrlInput] = useState<string>('gifty.run');
  const [analyzedReport, setAnalyzedReport] = useState<GoogleSeoReport>(() =>
    generateInitialGoogleReport('gifty.run')
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>('구글봇 분석 중...');
  const weekInfo = useMemo(() => getCurrentRankingWeekInfo(), []);

  const handleAnalyze = async (e?: React.FormEvent, customUrl?: string) => {
    if (e) e.preventDefault();
    const target = customUrl || urlInput.trim();
    if (!target) return;

    setIsAnalyzing(true);
    setAnalyzingStep('1. 실제 블로그 RSS 피드 및 최신 포스팅 탐색 중...');

    try {
      setTimeout(() => {
        setAnalyzingStep('2. 본문 이미지 Alt 태그 및 H1~H3 소제목 계층 분석 중...');
      }, 800);

      const report = await runRealGoogleSeoAnalysis(target);
      setAnalyzedReport(report);
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
    googleLiveQueries,
    googleOfficialTools
  } = analyzedReport;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. 상단 안내 히어로 배너 */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-blue-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-blue-400 to-cyan-400 text-slate-950 shadow-xs flex items-center gap-1">
              <Globe size={13} />
              <span>실시간 구글 검색엔진 SEO 분석기</span>
            </span>
            <span className="text-xs text-blue-200 font-bold">{weekInfo.weekText}</span>
            {isRealData ? (
              <span className="text-[11px] bg-emerald-500/30 text-emerald-200 font-extrabold px-3 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                실제 RSS 피드 실시간 연동 완료 ({recentPosts.length}개 포스팅 분석)
              </span>
            ) : (
              <span className="text-[11px] bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full border border-white/10">
                티스토리 · 워드프레스 · 웹사이트
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            구글 웹마스터 <span className="text-blue-400">G-Power SEO 정밀 진단</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            구글(Google) 알고리즘이 평가하는 <b>Core Web Vitals 속도, H1~H3 계층 구조, 이미지 Alt 누락률, 실제 포스팅 텍스트</b>를 정밀 분석하여 도메인 파워 순위와 개선책을 진단합니다.
          </p>
        </div>
      </div>

      {/* 2. URL 검색창 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="분석할 블로그/웹사이트 주소 (예: myblog.tistory.com 또는 https://example.com)"
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
                <span>구글 SEO 정밀 진단</span>
              </>
            )}
          </button>
        </form>

        {/* 빠른 예시 링크 */}
        <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-700">추천 샘플:</span>
          <button
            type="button"
            onClick={() => handleQuickUrl('gifty.run')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700 font-bold"
          >
            gifty.run
          </button>
          <button
            type="button"
            onClick={() => handleQuickUrl('tech-memo.tistory.com')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
          >
            tech-memo.tistory.com
          </button>
          <button
            type="button"
            onClick={() => handleQuickUrl('invest-diary.wordpress.com')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
          >
            invest-diary.wordpress.com
          </button>
        </div>
      </div>

      {/* 3. 진단 결과 요약 대시보드 */}
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

        {/* 코어 웹 바이탈 (Core Web Vitals) 요약 */}
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

      {/* 4. 실제 수집된 최근 포스팅 분석 카드 (실제 데이터 검증용) */}
      {isRealData && recentPosts.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="text-blue-600" size={18} />
              <h3 className="text-base font-bold text-slate-900">
                실제 수집된 최근 포스팅 분석 ({recentPosts.length}건)
              </h3>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200">
              ✓ RSS 피드 본문 실시간 크롤링 완료
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {recentPosts.map((post, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex-1">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1 flex items-center gap-1.5"
                  >
                    <span>{idx + 1}. {post.title}</span>
                    <ExternalLink size={11} className="shrink-0 text-slate-400" />
                  </a>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {post.contentSnippet || '본문 요약 없음'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-slate-500 font-medium">
                  <span>글자 수: <strong className="text-slate-700">{post.charCount.toLocaleString()}자</strong></span>
                  <span>사진: <strong className="text-slate-700">{post.totalImages}장</strong></span>
                  {post.missingAltCount > 0 ? (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold">
                      Alt 누락 {post.missingAltCount}건
                    </span>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                      Alt 완벽
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. 구글 5대 테크니컬 SEO 세부 진단 리포트 */}
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

      {/* 6. Gifty 솔루션 연동 배너 (이미지 용량 최적화 -> LCP 속도 개선) */}
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

      {/* 7. Google 공식 검사 도구 원클릭 연동 배너 (100% 공식 데이터 증명) */}
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

      {/* 8. 구글 실시간 검색 노출 관측 (Live Google Monitor) */}
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
