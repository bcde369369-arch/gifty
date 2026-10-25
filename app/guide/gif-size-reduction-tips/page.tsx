import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, CheckCircle2, TrendingDown, Layers } from 'lucide-react';

export const metadata = {
  title: '화질 저하 없이 GIF 움짤 용량 10MB 이하로 줄이는 5가지 압축 비법 - Gifty',
  description: '웹페이지 로딩 속도를 높이고 모바일 데이터 낭비를 막는 전문적인 GIF 압축 노하우를 소개합니다. 해상도, 프레임, 구간 편집 최적화 가이드.',
};

export default function GifSizeReductionGuide() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-4">
              <TrendingDown size={14} /> 용량 최적화 테크닉
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              화질 저하 없이 GIF 움짤 용량 10MB 이하로 줄이는 5가지 전문 압축 비법
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-10-25 · 작성자: Gifty 에디터팀</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              블로그나 웹사이트에 고용량 움짤(30MB~50MB)을 여러 개 올려두면, 모바일 방문자의 페이지 로딩 속도가 3초 이상 지연되어 <strong>이탈률이 무려 50% 이상 치솟습니다.</strong> 또한 구글 코어 웹 바이탈(Core Web Vitals) 점수가 깎여 검색 순위가 하락하는 원인이 되기도 합니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Zap size={22} className="text-indigo-600" />
              1. 핵심은 &apos;재생 시간(Duration)&apos;의 미니멀리즘
            </h2>
            <p>
              GIF 포맷은 일반 비디오(MP4)와 달리 프레임 간 압축률이 매우 낮습니다. 즉, <strong>1초만 늘어나도 용량이 2~3MB씩 정직하게 증가</strong>합니다. 움짤에서 가장 매력적인 핵심 순간(하이라이트 3초~5초)만 남기고 과감히 앞뒤 불필요한 구간을 잘라내세요. 이것만으로도 파일 크기가 60% 이상 즉시 다이어트됩니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Layers size={22} className="text-indigo-600" />
              2. 60fps 욕심을 버리고 10~12fps로 타협하기
            </h2>
            <p>
              원본 비디오가 60fps나 30fps라고 해서 GIF까지 30fps로 만들 필요는 전혀 없습니다. 모바일 디스플레이에서는 <strong>10~12fps</strong>만 되어도 사람의 뇌는 부드러운 움직임으로 자연스럽게 인지합니다.
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
              <p className="font-bold text-slate-800">프레임별 용량 차이 예시 (5초 영상 기준):</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>30 fps: 약 28.5 MB (블로그 업로드 불가 ❌)</li>
                <li>15 fps: 약 14.2 MB (다소 무거움 ⚠️)</li>
                <li><strong>10 fps: 약 7.8 MB (체감 화질은 동일하면서 초고속 로딩! ✅)</strong></li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-indigo-600" />
              3. 가로 해상도(Width) 480px의 황금 비율
            </h2>
            <p>
              PC 모니터나 스마트폰 화면에서 블로그 본문의 콘텐츠 가로 폭은 대개 700px 내외입니다. GIF는 480px로 제작하여 본문에 100% 폭으로 채워도 레티나 디스플레이에서 충분히 선명하게 보입니다. 가로 해상도를 1080px에서 480px로 낮추면 픽셀 면적이 1/4로 줄어들어 용량이 드라마틱하게 감소합니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-indigo-600" />
              4. 불필요한 배경 떨림 및 카메라 흔들림 억제
            </h2>
            <p>
              카메라를 들고 걷거나 주변 배경이 쉴 새 없이 움직이는 영상은 GIF 인코더가 매 프레임마다 새로운 색상 팔레트를 재구성해야 하므로 용량이 폭발합니다. 삼각대에 거치하거나 피사체 중심의 고정 샷을 활용하면 같은 해상도에서도 용량이 절반 이하로 줄어듭니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-indigo-600" />
              5. Gifty의 스마트 256색 팔레트 생성 기술 활용
            </h2>
            <p>
              Gifty는 최신 FFmpeg 팔레트 생성 알고리즘(palettegen/paletteuse)을 탑재하여, 영상 전체를 스캔한 후 인간의 눈이 가장 민감하게 반응하는 256가지 핵심 색상만을 엄선하여 압축합니다. 노이즈는 없애면서 파일 크기를 극적으로 줄여주는 기술입니다.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg transition-all text-base"
            >
              지금 Gifty에서 10MB 이하 고화질 움짤 만들기 &rarr;
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
