import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Zap, Lock, Heart, Award, ArrowLeft, Mail, FileText } from 'lucide-react';

export const metadata = {
  title: '서비스 소개 (About Us) - Gifty',
  description: 'Gifty의 개발 철학과 비전, 그리고 100% 브라우저 로컬 프라이버시 보호 기술을 소개합니다.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 flex flex-col">
      {/* Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors font-bold text-sm">
            <ArrowLeft size={16} /> 메인으로 돌아가기
          </Link>
          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-slate-600">
            <Link href="/guide" className="hover:text-indigo-600 transition-colors">꿀팁 가이드</Link>
            <Link href="/contact" className="hover:text-indigo-600 transition-colors">문의하기</Link>
            <Link href="/legal" className="hover:text-indigo-600 transition-colors">이용약관</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full space-y-12">
        {/* Header Hero */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-bold rounded-full">
            <Sparkles size={16} /> 서비스 소개 · About Gifty
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            세상에서 가장 안전하고 빠른<br />
            <span className="text-indigo-600">무료 GIF 메이커</span>의 탄생
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Gifty는 사용자의 소중한 개인 미디어가 외부 서버로 유출되지 않도록,
            최신 웹 표준 기술(WebAssembly)을 통해 100% 브라우저 내부에서만 동작하는 혁신적인 미디어 유틸리티 플랫폼입니다.
          </p>
        </section>

        {/* 3 Core Values */}
        <section className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">100% 로컬 보안</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              업로드한 영상과 이미지는 단 1바이트도 서버로 전송되지 않습니다. 내 컴퓨터·스마트폰 브라우저 메모리 안에서만 모든 연산이 진행됩니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">무설치·초고속 변환</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              복잡한 프로그램 설치나 번거로운 회원가입 절차 없이, 웹 브라우저를 켜자마자 3초 만에 고화질 움짤을 완성할 수 있습니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">워터마크 없는 자유</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              강제 광고 로고나 화질 제한 유료 플랜이 전혀 없습니다. 블로그, SNS, 상업적 리뷰 등 모든 창작 활동에 순수한 결과물을 제공합니다.
            </p>
          </div>
        </section>

        {/* Mission Story */}
        <section className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award size={22} className="text-indigo-600" />
            Gifty가 해결하고자 하는 문제 (Our Mission)
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4 text-sm sm:text-base">
            <p>
              블로그나 소셜 미디어 활동을 하는 수많은 창작자들은 생동감 넘치는 콘텐츠를 위해 동영상을 GIF로 변환합니다.
              하지만 기존의 수많은 온라인 변환 툴들은 다음과 같은 심각한 불편함을 가지고 있었습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <li><strong>개인정보 침해 위험:</strong> 내 일상과 얼굴이 담긴 동영상이 알 수 없는 해외 서버에 무단 업로드 및 보관되는 불안감</li>
              <li><strong>강제 워터마크:</strong> 완성된 움짤 구석에 거대한 서비스 로고가 찍혀 상업적 활용이 불가능한 한계</li>
              <li><strong>과도한 용량과 화질 저하:</strong> 네이버 블로그의 20MB 제한을 맞추지 못해 모바일 로딩이 극도로 지연되는 문제</li>
            </ul>
            <p>
              Gifty 팀은 이러한 창작자들의 고충을 기술적으로 해결하기 위해 시작되었습니다.
              우리는 세계 최고의 오픈소스 비디오 프로세싱 엔진인 <strong>FFmpeg</strong>를 웹 표준 <strong>WebAssembly(WASM)</strong> 기술로 브라우저 상에 이식하여,
              서버 없이도 완벽한 성능과 보안을 동시에 구현해냈습니다.
            </p>
          </div>
        </section>

        {/* Technology Stack & Trust */}
        <section className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lock size={22} className="text-indigo-400" />
            기술적 투명성과 신뢰성 (Technology &amp; E-E-A-T)
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Gifty는 검증된 최첨단 오픈소스 생태계와의 협력을 바탕으로 구축되었습니다.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <h3 className="font-bold text-indigo-300 mb-1">FFmpeg &amp; FFmpeg.wasm</h3>
              <p className="text-xs text-slate-300">
                전 세계 미디어 표준인 FFmpeg 라이브러리를 웹 어셈블리로 컴파일하여 사용자의 로컬 CPU/GPU 자원으로 인코딩합니다.
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <h3 className="font-bold text-indigo-300 mb-1">클라우드 제로 (Zero Server Storage)</h3>
              <p className="text-xs text-slate-300">
                변환 서버를 두지 않기 때문에 데이터베이스 유출이나 해킹 사고의 가능성이 원천적으로 0%입니다.
              </p>
            </div>
          </div>
        </section>

        {/* Operation Team & Contact */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-800">문의 및 피드백</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Gifty는 창작자분들의 피드백을 통해 매주 새로운 기능과 최적화를 적용하고 있습니다.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/contact"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-colors flex items-center gap-2"
            >
              <Mail size={16} /> 문의 페이지 이동
            </Link>
            <Link
              href="/legal"
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition-colors flex items-center gap-2"
            >
              <FileText size={16} /> 이용약관 보기
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs space-y-3">
          <div className="flex justify-center gap-6 font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">홈</Link>
            <Link href="/about" className="text-indigo-400 font-bold">서비스 소개</Link>
            <Link href="/guide" className="hover:text-white transition-colors">꿀팁 가이드</Link>
            <Link href="/contact" className="hover:text-white transition-colors">문의하기</Link>
            <Link href="/legal" className="hover:text-white transition-colors">이용약관 및 개인정보처리방침</Link>
          </div>
          <p>© 2026 Gifty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
