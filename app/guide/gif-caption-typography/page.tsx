import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Type, Sparkles, CheckCircle2, Palette, Eye } from 'lucide-react';

export const metadata = {
  title: '움짤 자막 가독성 200% 높이는 예능 폰트 및 외곽선 배색 디자인 가이드 - Gifty',
  description: '블로그 썸네일과 인스타 짤에서 어떤 배경색에서도 눈에 확 띄는 예능 자막 스타일(두꺼운 테두리, 그림자, 주아체 폰트) 적용 노하우입니다.',
};

export default function GifCaptionTypographyGuide() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 text-xs font-bold rounded-full mb-4">
              <Type size={14} /> 타이포그래피 · 디자인 테크닉
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              움짤 자막 가독성 200% 높이는 예능 폰트 및 외곽선 배색 디자인 가이드
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-11-07 · 작성자: Gifty 디자인 연구팀</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              정지된 사진과 달리, <strong>움짤의 배경은 1초에도 수십 번씩 색상과 밝기가 격렬하게 변화</strong>합니다.
              흰색 자막을 넣었더니 배경의 밝은 조명이나 국물 김에 묻혀 전혀 보이지 않거나, 검은 자막을 넣었더니 어두운 고기나 배경에 파묻혀버린 경험이 있으실 겁니다.
              어떤 배경 영상 위에서도 1초 만에 뇌리에 꽂히는 예능 방송 스타일의 타이포그래피 비법을 정리해 드립니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Eye size={22} className="text-amber-500" />
              1. 가독성을 결정짓는 핵심: &apos;두꺼운 외곽선(Stroke)&apos;
            </h2>
            <p>
              지상파 예능 프로그램(런닝맨, 무한도전, 놀면 뭐하니)의 자막을 유심히 살펴보면 한 가지 공통점이 있습니다.
              글자 테두리에 <strong>최소 3px 이상의 두꺼운 대비 외곽선(Stroke)</strong>이 둘러져 있다는 점입니다:
            </p>
            <ul className="list-disc list-inside space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm">
              <li><strong>밝은 노란 글씨 + 묵직한 검은 테두리:</strong> 맛집 리뷰의 전설적인 치트키 조합입니다. 어두운 배경에서는 노란색이 튀고, 밝은 배경에서는 검은 테두리가 글자를 보호합니다.</li>
              <li><strong>흰 글씨 + 검은 테두리 + 부드러운 그림자:</strong> 브이로그나 감성적인 일상 리뷰에 가장 단정하고 깔끔한 클래식 조합입니다.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Palette size={22} className="text-indigo-600" />
              2. 움짤에 최적화된 추천 폰트 스타일
            </h2>
            <p>
              움짤은 모바일에서 작은 썸네일 크기로 소비되는 경우가 많습니다.
              따라서 획이 얇은 명조체나 가는 고딕체는 축소 시 선이 뭉개집니다. <strong>두껍고 둥글둥글한 볼드 계열 서체</strong>를 선택해야 합니다:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-1">배달의민족 주아체 (Jua)</h3>
                <p className="text-xs text-slate-500">친근하고 유쾌한 붓글씨 느낌으로 음식 움짤이나 웃긴 밈(Meme)에 찰떡궁합입니다.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-1">에스코어 드림 (S-Core Dream 8/9)</h3>
                <p className="text-xs text-slate-500">꽉 찬 사각형 구조의 단단한 고딕으로 IT 기기 리뷰나 전문적인 정보 가이드에 추천합니다.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Sparkles size={22} className="text-indigo-600" />
              3. 자막 위치의 황금존 (Safe Zone)
            </h2>
            <p>
              자막을 화면 최하단에 너무 바짝 붙이면 네이버 블로그 앱의 재생 컨트롤 바나 UI에 가려질 위험이 있습니다.
              <strong>화면 하단에서 10%~15% 정도 띄운 중앙 위치</strong>에 배치하는 것이 스마트폰 전체 화면 및 피드 노출 시 가장 완벽한 시각 안정감을 제공합니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-600" />
              4. Gifty에서 1초 만에 예능 자막 넣기
            </h2>
            <p>
              Gifty 비디오 에디터에는 포토샵 없이도 누구나 클릭 한 번으로 적용할 수 있는 [방송 예능 스타일], [감성 핑크], [클래식 화이트] 프리셋이 내장되어 있습니다.
              원하는 문구만 입력하고 원하는 위치로 드래그하면 끝납니다.
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
