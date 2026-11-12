import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Smartphone, Zap, CheckCircle2, ShieldCheck, Film } from 'lucide-react';

export const metadata = {
  title: '삼성 갤럭시 모션포토 및 화면 녹화 고화질 GIF 변환 완벽 가이드 - Gifty',
  description: '갤럭시 스마트폰 갤러리의 모션포토(Motion Photo)와 화면 녹화 비디오를 화질 저하 없이 선명하고 가벼운 GIF 움짤로 변환하는 실전 팁을 소개합니다.',
};

export default function GalaxyMotionPhotoGuide() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 flex flex-col">
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/guide" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-semibold text-sm">
            <ArrowLeft size={16} /> 꿀팁 목록으로 돌아가기
          </Link>
          <Link href="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
            Gifty 메이커 바로가기 &rarr;
          </Link>
        </div>
      </nav>

      <main className="flex-grow max-w-3xl mx-auto px-6 py-12 w-full">
        <article className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full mb-4">
              <Smartphone size={14} /> 안드로이드 · 갤럭시 팁
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              삼성 갤럭시 모션포토 및 화면 녹화 고화질 GIF 변환 완벽 가이드
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-11-03 · 작성자: Gifty 모바일 연구소</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              삼성 갤럭시 스마트폰에는 셔터를 누르기 전 1~2초의 순간을 동영상으로 함께 기록해 주는 <strong>모션포토(Motion Photo)</strong> 기능이 기본 탑재되어 있습니다.
              하지만 갤럭시 기본 갤러리 앱에서 제공하는 &apos;GIF 만들기&apos; 기능으로 내보내면 색상이 깨지고 자글자글한 노이즈가 생겨 아쉬움을 느끼는 블로거들이 많습니다.
              이번 글에서는 원본 색감을 100% 보존하면서 초고화질 움짤로 만드는 방법을 정리해 드립니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Film size={22} className="text-sky-600" />
              1. 갤럭시 갤러리 기본 GIF 변환 기능의 한계
            </h2>
            <p>
              갤럭시 기본 갤러리의 GIF 변환 기능은 빠른 저장을 위해 컬러 팔레트 연산(디더링)을 간소화합니다.
              그 결과, 어두운 배경이나 그라데이션이 들어간 사진에서 색상이 층져 보이는 밴딩 현상과 거친 모자이크가 발생하게 됩니다.
              이를 해결하려면 <strong>모션포토를 먼저 무손실 비디오(MP4)로 추출한 뒤 전문 인코더(Gifty)를 거치는 것</strong>이 정석입니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Zap size={22} className="text-sky-600" />
              2. 모션포토를 깨끗한 비디오로 저장하는 3초 루틴
            </h2>
            <ol className="list-decimal list-inside space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm">
              <li>
                갤럭시 <strong>갤러리 앱</strong>을 열고 변환할 모션포토 사진을 선택합니다.
              </li>
              <li>
                하단의 <strong>[모션포토 보기]</strong> 버튼을 누릅니다.
              </li>
              <li>
                우측 상단 또는 하단의 <strong>[더보기(점 3개)]</strong> 아이콘을 누르고 <strong>[비디오로 저장]</strong>을 클릭합니다.
              </li>
              <li>
                갤러리에 1~2초 분량의 깨끗한 고화질 MP4 영상이 별도로 생성됩니다.
              </li>
            </ol>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-sky-600" />
              3. 갤럭시 화면 녹화 영상 최적화 팁
            </h2>
            <p>
              스마트폰 설정 방법이나 앱 사용법을 리뷰할 때 갤럭시의 [화면 녹화] 기능을 많이 사용합니다.
              화면 녹화 영상을 블로그용 GIF로 만들 때는 다음 두 가지만 기억하세요:
            </p>
            <ul className="list-disc list-inside space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm">
              <li>
                <strong>불필요한 대기 시간 잘라내기:</strong> 앱이 로딩되거나 손가락이 멈춰 있는 구간을 잘라내고 핵심 동작만 3~5초로 압축합니다.
              </li>
              <li>
                <strong>세로 긴 화면 폭 최적화:</strong> 1080x2400 세로 화면 그대로 GIF를 만들면 용량이 40MB에 육박합니다. 가로 폭을 480px 이하로 리사이즈하면 5MB 이하로 가벼워집니다.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <ShieldCheck size={22} className="text-emerald-600" />
              4. Gifty에서 변환하면 좋은 이유
            </h2>
            <p>
              추출된 비디오를 Gifty에 업로드하면, 고급 2단계 팔레트 분석(Palettegen &amp; Paletteuse) 알고리즘이 가동되어 갤럭시 카메라의 뛰어난 원본 색감을 한 프레임도 왜곡 없이 고스란히 GIF로 담아냅니다.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-indigo-600">
            <Link href="/guide" className="hover:underline">&larr; 가이드 목록으로</Link>
            <Link href="/" className="hover:underline">지금 무료로 GIF 만들기 &rarr;</Link>
          </div>
        </article>
      </main>
    </div>
  );
}
