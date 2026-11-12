import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Sparkles, CheckCircle2, Smartphone, Zap } from 'lucide-react';

export const metadata = {
  title: '인스타그램 스토리·스레드·X(트위터) 무손실 움짤 업로드 최적 규격 총정리 - Gifty',
  description: 'SNS 플랫폼별 GIF 지원 여부와 업로드 시 자동 압축으로 인한 화질 저하 및 멈춤 현상을 방지하는 최적 규격 및 변환 팁을 안내합니다.',
};

export default function SnsGifUploadSpecGuide() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-full mb-4">
              <Share2 size={14} /> 소셜 미디어 · SNS 최적 규격
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              인스타그램 스토리·스레드·X(트위터) 무손실 움짤 업로드 최적 규격 총정리
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-11-09 · 작성자: Gifty SNS 랩</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              인스타그램, 스레드(Threads), X(구 트위터) 등 주요 SNS 플랫폼마다 움직이는 이미지(GIF)를 처리하는 내부 규격과 허용 용량이 완전히 다릅니다.
              어떤 플랫폼은 순수 GIF를 지원하는 반면, 어떤 플랫폼은 업로드 시 자동으로 MP4 비디오로 재인코딩하여 화질이 심각하게 깨지거나 멈춰버리는 현상이 발생합니다.
              주요 SNS별 무손실 업로드 가이드라인을 한눈에 정리해 드립니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Smartphone size={22} className="text-pink-600" />
              1. 주요 SNS 플랫폼별 GIF 지원 규격 비교
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-3 border border-slate-200 font-bold">플랫폼</th>
                    <th className="p-3 border border-slate-200 font-bold">최대 용량</th>
                    <th className="p-3 border border-slate-200 font-bold">권장 해상도 비율</th>
                    <th className="p-3 border border-slate-200 font-bold">업로드 방식</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold">X (구 트위터)</td>
                    <td className="p-3 border border-slate-200">웹: 15MB / 모바일: 5MB</td>
                    <td className="p-3 border border-slate-200">16:9 또는 1:1</td>
                    <td className="p-3 border border-slate-200 text-emerald-600">GIF 직접 첨부 완벽 지원</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold">스레드 (Threads)</td>
                    <td className="p-3 border border-slate-200">약 10MB 이하</td>
                    <td className="p-3 border border-slate-200">1:1 정사각형 또는 4:5</td>
                    <td className="p-3 border border-slate-200 text-emerald-600">GIPHY 연동 및 GIF 첨부</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold">인스타그램 스토리</td>
                    <td className="p-3 border border-slate-200">제한 없음 (MP4 권장)</td>
                    <td className="p-3 border border-slate-200">9:16 세로 풀스크린</td>
                    <td className="p-3 border border-slate-200 text-amber-600">GIF 스티커 기능 또는 비디오</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Zap size={22} className="text-indigo-600" />
              2. X(트위터) 업로드 시 화질 저하 방지 팁
            </h2>
            <p>
              X는 사용자가 올린 GIF 파일을 서버에서 자동으로 H.264 기반의 모바일 비디오(MP4)로 변환하여 재생합니다.
              이때 해상도가 홀수 픽셀(예: 481x271)이면 서버 인코더 오류로 화질이 뭉개지거나 깜빡거릴 수 있습니다.
              <strong>가로와 세로 해상도를 반드시 짝수(2의 배수, 예: 480x270, 600x600)</strong>로 맞춰서 내보내야 원본의 쨍한 화질을 유지할 수 있습니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Sparkles size={22} className="text-pink-600" />
              3. 인스타그램 피드 &amp; 릴스에 움짤 올리는 법
            </h2>
            <p>
              인스타그램 일반 피드 글에는 GIF 포맷을 직접 올리면 첫 번째 프레임만 정지 사진으로 박제되는 문제가 있습니다.
              인스타그램 피드나 릴스에 올리실 때는 Gifty에서 비디오 구간을 편집한 뒤 <strong>GIF 대신 MP4 동영상 파일로 저장</strong>하거나, 스토리 작성 창에서 [사진 스티커 추가] 기능을 통해 투명 배경 GIF를 오버레이하는 방식을 활용하세요.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-600" />
              4. Gifty의 SNS 프리셋
            </h2>
            <p>
              Gifty는 X(트위터), 스레드, 인스타그램 등 각 SNS의 화면 비율에 맞춰 1:1 정방형 및 16:9 와이드 비율 크롭과 짝수 픽셀 자동 보정을 지원합니다.
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
