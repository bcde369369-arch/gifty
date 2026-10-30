'use client';

import React, { useState, useEffect } from 'react';
import Dropzone from '@/components/Dropzone';
import VideoEditor from '@/components/VideoEditor';
import ShareButton from '@/components/ShareButton';
import UpdateModal from '@/components/UpdateModal';
import CoupangBanner from '@/components/CoupangBanner';
import AdSenseBanner from '@/components/AdSenseBanner';
import { Sparkles, Video, Wand2, DownloadCloud, Menu, ExternalLink, X, AlertTriangle, CheckCircle2, HelpCircle, ShieldCheck, Layers, BookOpen } from 'lucide-react';
import { useSiteSettings } from '@/lib/settings';
import CommunityPreview from '@/components/CommunityPreview';

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [showInAppWarning, setShowInAppWarning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, isLoaded } = useSiteSettings();

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/kakaotalk|instagram|facebook|line|band/.test(userAgent)) {
      setShowInAppWarning(true);
    }
  }, []);

  const handleOpenExternal = () => {
    const targetUrl = window.location.href;
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.match(/kakaotalk/i)) {
      window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(targetUrl)}`;
    } else if (ua.match(/line/i)) {
      window.location.href = targetUrl.includes('?') ? targetUrl + '&openExternalBrowser=1' : targetUrl + '?openExternalBrowser=1';
    } else {
      navigator.clipboard.writeText(targetUrl).then(() => {
        alert('링크가 복사되었습니다. Safari 또는 Chrome 앱을 열고 주소창에 붙여넣어 주세요!');
      }).catch(() => {
        alert('화면의 [︙] 메뉴를 눌러 [다른 브라우저로 열기]를 선택해주세요.');
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200">
      <UpdateModal />
      
      {/* In-App Browser Warning Banner */}
      {showInAppWarning && (
        <div className="bg-red-500 text-white px-4 py-4 text-sm font-bold flex flex-col items-center justify-center gap-3 relative z-50">
          <div className="flex items-center gap-2 text-center text-base">
            <AlertTriangle size={20} />
            <span>현재 브라우저에서는 움짤 다운로드가 안 됩니다!</span>
          </div>
          <p className="text-xs opacity-90 font-medium text-center">
            정상적인 저장을 위해 반드시 기본 브라우저(Safari/Chrome)로 이동해주세요.
          </p>
          <button 
            onClick={handleOpenExternal}
            className="bg-white text-red-600 px-6 py-2.5 rounded-full font-black text-sm shadow-md hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            🚀 기본 브라우저로 이동하기
          </button>
          <button 
            onClick={() => setShowInAppWarning(false)}
            className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Announcement Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 relative">
          <span className="animate-pulse">✨</span>
          <span>
            [신규 업데이트] <strong>⚡ 리뷰노트·당첨톡 1초 자동등록</strong> &amp; <strong>🎨 네이버 블로그 스티커 제작소</strong>가 오픈되었어요!
          </span>
          <button 
            onClick={() => setShowBanner(false)}
            className="absolute right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl transform rotate-3">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800">
              Gifty<span className="text-indigo-600">.</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="/" className="hover:text-indigo-600 transition-colors">홈</a>
            <a href="/community" className="text-indigo-600 font-extrabold hover:text-indigo-700 transition-colors flex items-center gap-1">커뮤니티 💬</a>
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

      {/* Mobile Quick Links (Category Bar) */}
      <div className="md:hidden w-full bg-white border-b border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-sm z-40 relative">
        <div className="px-4 py-3 flex gap-2.5">
          <a href="/community" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50/80 text-indigo-700 font-extrabold text-[13px] rounded-full border border-indigo-200/50 shadow-sm active:scale-95 transition-transform">
            💬 커뮤니티
          </a>
          <a href="/experience-diary" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50/80 text-blue-700 font-extrabold text-[13px] rounded-full border border-blue-200/50 shadow-sm active:scale-95 transition-transform">
            📓 체험단 다이어리
          </a>
          <a href="/sticker" className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-50/80 text-pink-700 font-extrabold text-[13px] rounded-full border border-pink-200/50 shadow-sm active:scale-95 transition-transform">
            🎨 블로그 스티커
          </a>
          <a href="/remove-bg" className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-50/80 text-purple-700 font-extrabold text-[13px] rounded-full border border-purple-200/50 shadow-sm active:scale-95 transition-transform">
            ✂️ 누끼따기(AI)
          </a>
        </div>
      </div>

      {/* Top Affiliate Banner */}
      <div className="w-full bg-slate-900 border-b border-slate-800 py-0 hidden md:block">
        <a 
          href={isLoaded ? settings.affiliateLink : '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center gap-4 text-white hover:bg-slate-800 transition-colors py-3 group"
        >
          <span className="bg-indigo-500 text-xs font-bold px-2 py-0.5 rounded text-white">SPONSOR</span>
          <span className="text-sm font-medium">{isLoaded ? settings.affiliateTitle : '스폰서 배너 불러오는 중...'} <strong className="text-indigo-400 group-hover:text-indigo-300">&rarr;</strong></span>
        </a>
      </div>

      {/* Hero Section */}
      <section className="relative w-full max-w-6xl mx-auto px-6 pt-16 pb-24 flex flex-col md:flex-row items-center gap-12">
        {/* Text Area */}
        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-6 tracking-wide uppercase">
            <Wand2 size={14} /> {isLoaded ? settings.heroTagline : '로딩 중...'}
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            동영상을 올리면 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-500">
              마법처럼 움짤로!
            </span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
            무거운 프로그램 설치 없이, 브라우저에서 바로 고화질 GIF를 만들어 보세요. 내 기기의 영상을 안전하고 빠르게 변환합니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">A</div>
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">B</div>
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">C</div>
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  +2k
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 hidden sm:block">완전 무료!</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
            <ShareButton />
          </div>
        </div>

        {/* Upload/Editor Area */}
        <div className="flex-1 w-full relative z-10 mt-8 md:mt-0">
          {/* Decorative Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-fuchsia-200 blur-3xl opacity-50 rounded-full transform -translate-x-10 translate-y-10 -z-10"></div>
          
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-4 sm:p-6 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative min-h-[300px]">
            {!videoFile ? (
              <Dropzone onFileSelect={setVideoFile} />
            ) : (
              <VideoEditor videoFile={videoFile} onReset={() => setVideoFile(null)} />
            )}
          </div>

          {/* Global Coupang Partners Banner (업로드 상자 바로 밑에 밀착 배치) */}
          {isLoaded && (
            <div className="mt-3.5 flex flex-col justify-center items-center">
              {/* PC Banner */}
              {settings.coupangBannerHtml && (
                <div className="hidden md:flex max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-2">
                  <CoupangBanner htmlCode={settings.coupangBannerHtml} />
                </div>
              )}
              {/* Mobile Banner */}
              {settings.coupangBannerHtmlMobile && (
                <div className="flex md:hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm p-2 justify-center">
                  <CoupangBanner htmlCode={settings.coupangBannerHtmlMobile} />
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-white border-t border-slate-200 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">왜 Gifty를 선택해야 할까요?</h2>
            <p className="text-slate-500 mt-4">단순하지만 강력한 기능들로 가득 차 있습니다.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Video size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">초고속 로컬 변환</h3>
              <p className="text-slate-600 leading-relaxed">
                서버로 파일을 전송하지 않습니다. 최신 WebAssembly 기술로 여러분의 브라우저 안에서 즉시 변환됩니다.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Wand2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">직관적인 구간 편집</h3>
              <p className="text-slate-600 leading-relaxed">
                복잡한 타임라인 대신, 직관적인 양방향 슬라이더로 원하는 15초 구간을 정확하고 쉽게 잘라낼 수 있습니다.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <DownloadCloud size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">스마트 용량 최적화</h3>
              <p className="text-slate-600 leading-relaxed">
                커뮤니티와 메신저에 바로 업로드할 수 있도록 화질은 유지하면서 용량은 가볍게 압축해 줍니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Marketing Banner */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <a href={settings.affiliateLink} target="_blank" rel="noopener noreferrer" className="block group">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl transform transition-transform group-hover:-translate-y-1">
            <div>
              <div className="text-blue-200 text-sm font-bold tracking-widest uppercase mb-2">Sponsor</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">{isLoaded ? settings.affiliateTitle : '로딩 중...'}</h3>
              <p className="text-blue-100 text-lg">{isLoaded ? settings.affiliateSubtitle : ''}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="px-6 py-3 bg-white text-indigo-700 font-extrabold rounded-full flex items-center gap-2 group-hover:bg-blue-50 transition-colors shadow-lg">
                무료 체험하기 <ExternalLink size={18} />
              </div>
            </div>
          </div>
        </a>
      </section>

      {/* Community Preview */}
      <CommunityPreview />

      {/* Comprehensive SEO Content & Educational Guide Section (Google AdSense High Value Content) */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        {/* 1. Step-by-Step Tutorial */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-3">
              <BookOpen size={14} /> 초보자 완벽 매뉴얼
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              누구나 1초 만에 만드는 초고화질 GIF 움짤 4단계 가이드
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              복잡한 포토샵이나 무거운 인코딩 프로그램 없이, 웹 브라우저에서 가장 깨끗하고 선명한 움짤을 만드는 정석 방법입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center mb-4 text-base">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">동영상 드래그 &amp; 업로드</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  스마트폰이나 PC에 저장된 MP4, MOV, WebM 등 모든 형식의 비디오를 화면 상단 점선 영역에 끌어다 놓으세요.
                </p>
              </div>
              <p className="text-[11px] font-semibold text-indigo-600 mt-4">✓ 모든 포맷 무설치 지원</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-purple-600 text-white font-black rounded-xl flex items-center justify-center mb-4 text-base">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">하이라이트 구간 선택</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  직관적인 양방향 슬라이더를 밀어 가장 시선을 끄는 3초~5초 내외의 핵심 동작 구간을 정밀하게 지정합니다.
                </p>
              </div>
              <p className="text-[11px] font-semibold text-purple-600 mt-4">✓ 0.1초 단위 프레임 트리밍</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-pink-600 text-white font-black rounded-xl flex items-center justify-center mb-4 text-base">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">목적별 최적화 프리셋</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  네이버 블로그 업로드용(480px, 10fps), SNS 고화질용(600px, 15fps) 중 원하는 사용처에 맞는 옵션을 클릭합니다.
                </p>
              </div>
              <p className="text-[11px] font-semibold text-pink-600 mt-4">✓ 20MB 용량 자동 세이프</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-emerald-600 text-white font-black rounded-xl flex items-center justify-center mb-4 text-base">
                  04
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">초고속 로컬 다운로드</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  [GIF 변환하기] 버튼을 누르면 브라우저의 고성능 엔진이 256색 스마트 팔레트를 생성하여 무손실로 저장합니다.
                </p>
              </div>
              <p className="text-[11px] font-semibold text-emerald-600 mt-4">✓ 워터마크 없는 100% 원본</p>
            </div>
          </div>
        </div>

        {/* 2. Platform Specification Table */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-3">
              <Layers size={14} /> 규격 가이드
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
              주요 플랫폼별 권장 GIF 업로드 규격 표
            </h2>
            <p className="text-slate-500 text-sm">
              각 커뮤니티와 SNS의 제한 용량을 미리 확인하여 업로드 튕김 현상을 완벽히 방지하세요.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-slate-50 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-slate-200/80 text-slate-700 text-left font-bold text-xs uppercase tracking-wider">
                  <th className="p-4">플랫폼</th>
                  <th className="p-4">권장 가로 폭 (Width)</th>
                  <th className="p-4">권장 프레임 (FPS)</th>
                  <th className="p-4">최대 파일 제한</th>
                  <th className="p-4">특징 및 꿀팁</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600">
                <tr className="hover:bg-slate-100/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">네이버 블로그</td>
                  <td className="p-4">480px ~ 640px</td>
                  <td className="p-4">10 ~ 12 fps</td>
                  <td className="p-4 font-bold text-rose-600">20MB 이하 엄수</td>
                  <td className="p-4 text-xs">20MB 초과 시 업로드 실패. 480px에 10fps 권장</td>
                </tr>
                <tr className="hover:bg-slate-100/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">티스토리 / 워드프레스</td>
                  <td className="p-4">600px ~ 720px</td>
                  <td className="p-4">12 ~ 15 fps</td>
                  <td className="p-4">20MB (서버 권장 10MB)</td>
                  <td className="p-4 text-xs">검색엔진 SEO 속도 유지를 위해 5~8MB 내외 압축 권장</td>
                </tr>
                <tr className="hover:bg-slate-100/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">인스타그램 스토리/DM</td>
                  <td className="p-4">500px ~ 600px</td>
                  <td className="p-4">15 fps</td>
                  <td className="p-4">15MB 이하</td>
                  <td className="p-4 text-xs">스티커 기능 및 DM 전송 시 끊김 없는 15fps 적합</td>
                </tr>
                <tr className="hover:bg-slate-100/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">카카오톡 채팅방</td>
                  <td className="p-4">360px ~ 480px</td>
                  <td className="p-4">10 fps</td>
                  <td className="p-4">5MB 이하 (자동재생)</td>
                  <td className="p-4 text-xs">5MB 이하로 제작해야 대화창에서 클릭 없이 자동 재생</td>
                </tr>
                <tr className="hover:bg-slate-100/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">커뮤니티 (디시·펨코 등)</td>
                  <td className="p-4">480px</td>
                  <td className="p-4">12 fps</td>
                  <td className="p-4">10MB ~ 20MB</td>
                  <td className="p-4 text-xs">모바일 이용자 데이터 절약을 위해 10fps 추천</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Comprehensive FAQ Section (Schema/AdSense Friendly) */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full mb-3">
              <HelpCircle size={14} /> 궁금증 해결
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              자주 묻는 질문 (FAQ)
            </h2>
            <p className="text-slate-500 text-sm">
              Gifty 이용 중 이용자분들께서 가장 자주 문의하시는 핵심 내용들을 모았습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                Gifty는 정말 평생 100% 무료인가요?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                네, 그렇습니다. 회원가입이나 결제, 유료 플랜 유도 없이 누구나 무제한으로 무료 이용할 수 있습니다. 상업적 용도의 블로그나 유튜브 리뷰 등에 쓰이는 GIF도 아무런 저작권 제한 없이 자유롭게 제작하실 수 있습니다.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                업로드한 영상이 외부로 유출될 위험은 없나요?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                전혀 없습니다. Gifty는 최신 웹 표준 기술인 WebAssembly를 활용하여 사용자의 웹 브라우저 메모리 안에서만 100% 로컬 연산으로 처리합니다. 동영상이나 변환된 파일이 당사의 서버로 단 1바이트도 전송되지 않으므로 사생활이 안전하게 보호됩니다.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                생성된 결과물에 로고나 워터마크가 찍히나요?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                어떠한 워터마크나 광고 로고도 강제로 삽입하지 않습니다. 원본 영상 그대로의 깨끗한 고화질 움짤을 순수하게 다운로드받으실 수 있습니다.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                네이버 블로그에서 용량 초과가 뜰 땐 어떻게 하나요?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                네이버 블로그는 파일 1개당 20MB의 엄격한 용량 제한이 있습니다. 변환 시 [블로그용(480px, 10fps)] 프리셋을 선택하시고, 재생 구간을 5초 이내로 맞춰주시면 무조건 20MB 이하로 안전하게 제작됩니다.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                아이폰 라이브포토(Live Photo)도 변환할 수 있나요?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                네! 아이폰 사진 앱에서 라이브포토를 연 뒤 [공유] &gt; [비디오로 저장]을 누르면 동영상으로 저장됩니다. 그 비디오를 Gifty에 올려주시면 화질 깨짐 없는 선명한 움짤로 즉시 변환할 수 있습니다.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                동영상(MP4) 대신 왜 GIF 움짤을 사용해야 하나요?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                일반 비디오는 사용자가 [재생] 버튼을 눌러야 하지만, GIF는 웹페이지를 여는 순간 무한 반복 자동 재생됩니다. 음식의 지글지글 끓는 장면이나 제품 사용감 등을 즉시 보여주어 독자의 평균 체류시간을 2배 이상 높여주는 핵심 시각 자료입니다.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Latest Blog Tips Grid */}
        <div className="bg-slate-100/70 p-8 md:p-10 rounded-3xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">📚 블로그 &amp; 움짤 꿀팁 백과사전</h2>
              <p className="text-xs text-slate-500 mt-1">블로그 트래픽과 애드센스 체류시간을 늘려주는 전문 가이드를 읽어보세요.</p>
            </div>
            <a href="/guide" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 shrink-0 flex items-center gap-1">
              전체 팁 모아보기 &rarr;
            </a>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <a href="/guide/iphone-livephoto-to-gif" className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
              <span className="text-xs font-bold text-indigo-600 mb-2 block">📱 모바일 팁</span>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug mb-2">
                아이폰 라이브포토 고화질 GIF 변환 완벽 가이드
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2">갤러리 기본 변환의 화질 저하를 해결하고 3초 만에 선명한 움짤을 만드는 노하우.</p>
            </a>

            <a href="/guide/gif-size-reduction-tips" className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
              <span className="text-xs font-bold text-emerald-600 mb-2 block">⚡ 용량 최적화</span>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug mb-2">
                화질 저하 없이 GIF 움짤 용량 10MB 이하로 줄이는 법
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2">웹페이지 로딩 속도를 높이고 모바일 이탈률을 절반으로 낮추는 5가지 압축 공식.</p>
            </a>

            <a href="/guide/blog-thumbnail-gif" className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
              <span className="text-xs font-bold text-violet-600 mb-2 block">🎯 클릭률 극대화</span>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug mb-2">
                클릭률 3배 높이는 네이버 블로그 대표 썸네일 움짤 비법
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2">검색 피드에서 정지된 사진들 사이 시선을 사로잡는 1:1 정사각형 썸네일 제작법.</p>
            </a>
          </div>
        </div>

        {/* Bottom AdSense Banner */}
        <div className="w-full max-w-4xl mx-auto pt-4">
          <AdSenseBanner className="rounded-2xl overflow-hidden" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-6 opacity-50">
            <Sparkles size={16} /> <span className="font-bold tracking-widest text-slate-200">GIFTY</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm font-medium">
            <a href="/guide" className="hover:text-white transition-colors">움짤·블로그 꿀팁 가이드</a>
            <a href="/legal" className="hover:text-white transition-colors">이용약관 및 개인정보처리방침</a>
            <a href="mailto:contact@gifty.run" className="hover:text-white transition-colors">문의하기</a>
            <a href="/admin" className="text-slate-700 hover:text-white transition-colors">관리자</a>
          </div>
          <p className="text-sm mb-4">© 2026 Gifty. All rights reserved. Build your awesome meme.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">이 서비스는 영상 처리를 위해 오픈소스 엔진인 FFmpeg(ffmpeg.org) 기술을 활용하여 제작되었습니다.</p>
        </div>
      </footer>
    </main>
  );
}
