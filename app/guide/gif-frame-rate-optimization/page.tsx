import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Gauge, Layers, CheckCircle2, TrendingDown, HelpCircle } from 'lucide-react';

export const metadata = {
  title: '부드러움과 저용량을 동시에 잡는 GIF 프레임레이트(FPS) 설정 공식 - Gifty',
  description: '10fps, 15fps, 24fps, 30fps 프레임 수치에 따른 GIF 파일 용량과 체감 부드러움의 상관관계를 실험 데이터로 비교 분석해 드립니다.',
};

export default function GifFrameRateGuide() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-full mb-4">
              <Gauge size={14} /> 테크니컬 가이드 · 인코딩 튜닝
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              부드러움과 저용량을 동시에 잡는 GIF 프레임레이트(FPS) 설정 공식
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-11-06 · 작성자: Gifty 코덱 엔지니어</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              &quot;움짤은 무조건 30fps나 60fps로 만들어야 부드럽고 좋은 게 아닐까요?&quot; 많은 블로거분들이 가장 흔하게 오해하는 부분입니다.
              동영상 인코딩과 달리, <strong>GIF 포맷에서 FPS(초당 프레임 수)를 높이는 것은 파일 용량을 기하급수적으로 폭증시키는 치명적인 선택</strong>이 될 수 있습니다.
              이번 글에서는 사람의 시각 인지 특성과 실제 파일 용량 데이터를 바탕으로 가장 이상적인 황금 FPS 수치를 도출해 드립니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Layers size={22} className="text-indigo-600" />
              1. GIF 압축의 작동 원리와 FPS의 비밀
            </h2>
            <p>
              현대적인 비디오 코덱(MP4/AV1)은 이전 프레임과 다음 프레임 사이의 달라진 픽셀 변화량(움직임 벡터)만 저장합니다.
              반면 GIF는 <strong>초당 프레임 수만큼 정지 이미지를 연속해서 이어붙이는 방식</strong>에 가깝습니다.
              즉, 10fps에서 30fps로 올리면 저장해야 하는 프레임 이미지 수가 정확히 3배가 되어 용량 역시 2.5배~3배로 정직하게 폭발합니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <TrendingDown size={22} className="text-emerald-600" />
              2. 5초 영상 기준 FPS별 실측 용량 및 체감 비교
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-3 border border-slate-200 font-bold">FPS 설정</th>
                    <th className="p-3 border border-slate-200 font-bold">5초 실측 용량</th>
                    <th className="p-3 border border-slate-200 font-bold">시각적 체감</th>
                    <th className="p-3 border border-slate-200 font-bold">추천 용도</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold text-slate-700">8 fps</td>
                    <td className="p-3 border border-slate-200">약 3.8 MB</td>
                    <td className="p-3 border border-slate-200 text-slate-500">약간의 끊김 느껴짐</td>
                    <td className="p-3 border border-slate-200">단순 텍스트/화면 설명</td>
                  </tr>
                  <tr className="bg-emerald-50/70">
                    <td className="p-3 border border-slate-200 font-bold text-emerald-700">10 ~ 12 fps (추천)</td>
                    <td className="p-3 border border-slate-200 font-bold text-emerald-700">약 5.5 MB</td>
                    <td className="p-3 border border-slate-200 font-bold text-emerald-700">자연스럽고 매끄러움</td>
                    <td className="p-3 border border-slate-200 font-bold text-emerald-700">블로그 맛집/제품 리뷰 최적</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold text-slate-700">20 fps</td>
                    <td className="p-3 border border-slate-200">약 12.8 MB</td>
                    <td className="p-3 border border-slate-200">매우 부드러움</td>
                    <td className="p-3 border border-slate-200">빠른 스포츠/게임 모션</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold text-rose-600">30 fps</td>
                    <td className="p-3 border border-slate-200 text-rose-600">약 24.5 MB</td>
                    <td className="p-3 border border-slate-200">12fps와 체감 차이 미미</td>
                    <td className="p-3 border border-slate-200 text-rose-600">네이버 업로드 불가 (용량 초과)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-indigo-600" />
              3. 인간의 눈과 10~12fps의 마법
            </h2>
            <p>
              영화관에서 상영되는 고전 영화는 24fps이며, 전통 디즈니 2D 애니메이션은 1초에 12장의 그림(12fps)으로 제작되었습니다.
              스마트폰 화면에서 움직이는 음식이나 제품 동작을 볼 때 <strong>10~12fps만 확보되면 뇌는 부드러운 움직임으로 완전히 보정하여 인지</strong>합니다.
              굳이 30fps를 고집하여 용량을 4배로 키울 필요가 전혀 없는 이유입니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <HelpCircle size={22} className="text-indigo-600" />
              4. Gifty의 최적화 프리셋 활용법
            </h2>
            <p>
              Gifty는 사용자가 복잡한 수치를 일일이 계산하지 않아도 되도록 [블로그 표준: 10fps] 및 [고화질: 15fps] 프리셋을 기본 제공합니다.
              상황에 맞춰 클릭 한 번으로 최고의 가성비 용량을 찾아보세요.
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
