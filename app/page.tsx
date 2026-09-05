'use client';

import React, { useState } from 'react';
import Dropzone from '@/components/Dropzone';
import VideoEditor from '@/components/VideoEditor';
import ShareButton from '@/components/ShareButton';
import { Sparkles, Video, Wand2, DownloadCloud, Menu, Coffee, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '@/lib/settings';

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { settings, isLoaded } = useSiteSettings();

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200">
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
            <a href="#" className="hover:text-indigo-600 transition-colors">홈</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">기능</a>
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-full transition-colors font-bold">
              <Coffee size={16} /> 커피 후원하기
            </button>
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-800">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Top Banner Ad Placeholder */}
      <div className="w-full bg-slate-100 border-b border-slate-200 py-3 hidden md:block">
        <div className="max-w-[728px] h-[90px] mx-auto bg-slate-200 border border-slate-300 border-dashed rounded flex flex-col items-center justify-center text-slate-400">
          <span className="text-xs uppercase tracking-widest font-bold mb-1">Advertisement</span>
          <span className="text-sm">구글 애드센스 가로형 배너 영역 (728x90)</span>
        </div>
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
          
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative min-h-[400px]">
            {!videoFile ? (
              <Dropzone onFileSelect={setVideoFile} />
            ) : (
              <VideoEditor videoFile={videoFile} onReset={() => setVideoFile(null)} />
            )}
          </div>
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

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-6 opacity-50">
            <Sparkles size={16} /> <span className="font-bold tracking-widest text-slate-200">GIFTY</span>
          </div>
          <div className="flex justify-center gap-6 mb-6 text-sm font-medium">
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
