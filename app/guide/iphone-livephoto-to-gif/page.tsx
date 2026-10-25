import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Smartphone, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export const metadata = {
  title: '아이폰 라이브포토 & 갤럭시 모션포토 고화질 GIF 변환 완벽 가이드 - Gifty',
  description: '스마트폰으로 촬영한 라이브포토와 짧은 모션 영상을 화질 깨짐 없이 1초 만에 고화질 움짤로 만드는 법을 상세히 알려드립니다.',
};

export default function IPhoneLivePhotoGuide() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-4">
              <Smartphone size={14} /> 모바일 촬영 꿀팁
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              아이폰 라이브포토 &amp; 갤럭시 모션포토를 화질 깨짐 없이 고화질 GIF로 변환하는 법
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-10-25 · 작성자: Gifty 에디터팀</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              아이폰의 <strong>라이브포토(Live Photo)</strong>나 갤럭시의 <strong>모션 포토(Motion Photo)</strong>는 사진을 찍는 순간 앞뒤 1.5초간의 생생한 순간을 담아내는 최고의 기능입니다. 하지만 카카오톡, 블로그, 인스타그램 스토리 등에 공유하려고 하면 정지된 일반 사진으로만 올라가 답답하셨던 경험이 있으실 텐데요.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-indigo-600" />
              1. 기본 앱 내장 GIF 기능의 치명적인 단점
            </h2>
            <p>
              스마트폰 기본 갤러리 앱에서도 GIF 변환 기능을 지원하지만, 다음과 같은 한계가 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <li><strong>색상 왜곡과 계단 현상:</strong> 256색 팔레트를 비효율적으로 사용하여 사람 피부톤이나 풍경에 깍두기 모양의 노이즈가 심하게 발생합니다.</li>
              <li><strong>부자연스러운 프레임 속도:</strong> 영상이 뚝뚝 끊기거나 너무 빠르게 재생되어 감성적인 느낌이 사라집니다.</li>
              <li><strong>용량 제어 불가:</strong> 파일 크기를 직접 설정할 수 없어 네이버 블로그 업로드 제한(20MB)을 초과하기 일쑤입니다.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-indigo-600" />
              2. 3초 만에 고화질 비디오로 내보내고 Gifty로 변환하기
            </h2>
            <p>
              가장 깨끗한 원본 화질을 유지하면서 움짤을 만드는 정석 방법은 라이브포토를 <strong>&apos;비디오로 저장&apos;</strong>한 뒤 변환 도구를 사용하는 것입니다:
            </p>
            <ol className="list-decimal list-inside space-y-3 pl-2">
              <li><strong>아이폰 사진 앱:</strong> 원하는 라이브포토를 열고, 우측 상단의 점 세 개(···) 또는 공유 아이콘을 눌러 <strong>[비디오로 저장]</strong>을 터치합니다.</li>
              <li><strong>갤럭시 갤러리 앱:</strong> 모션 포토를 열고 화면 하단의 <strong>[더보기] &gt; [동영상으로 저장]</strong>을 선택합니다.</li>
              <li><strong>Gifty 접속:</strong> 모바일 브라우저(Safari 또는 Chrome)에서 Gifty에 접속한 뒤 저장된 비디오를 선택합니다.</li>
              <li><strong>프리셋 선택:</strong> 블로그용(480px, 10fps) 또는 고화질용(600px, 15fps)을 선택하고 <strong>[GIF 변환하기]</strong>를 누르면 끝!</li>
            </ol>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <AlertCircle size={22} className="text-amber-600" />
              3. SNS 업로드 시 꼭 기억해야 할 최적 해상도 규격
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse bg-slate-50 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-200/70 text-slate-700 text-left">
                    <th className="p-3">플랫폼</th>
                    <th className="p-3">권장 가로 폭</th>
                    <th className="p-3">권장 프레임</th>
                    <th className="p-3">최대 용량</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold">네이버 블로그</td>
                    <td className="p-3">480px ~ 640px</td>
                    <td className="p-3">10 ~ 12 fps</td>
                    <td className="p-3 text-rose-600 font-bold">20MB 이하 (필수)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">티스토리 / 워드프레스</td>
                    <td className="p-3">600px ~ 720px</td>
                    <td className="p-3">12 ~ 15 fps</td>
                    <td className="p-3">10MB 이하 권장</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">카카오톡 채팅방</td>
                    <td className="p-3">360px ~ 480px</td>
                    <td className="p-3">10 fps</td>
                    <td className="p-3">5MB 이하 (자동재생)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <HelpCircle size={22} className="text-indigo-600" />
              자주 묻는 질문 (FAQ)
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="font-bold text-slate-800 mb-1">Q. 변환할 때 내 사진이 서버로 전송되어 유출될 위험은 없나요?</h3>
                <p className="text-sm text-slate-600">Gifty는 최신 WebAssembly 기술을 사용하여 100% 사용자의 스마트폰/PC 기기 안에서만 연산합니다. 어떠한 미디어도 서버로 전송되지 않으므로 사생활이 안전하게 보호됩니다.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="font-bold text-slate-800 mb-1">Q. 반복 재생(루프)이 계속되게 만들 수 있나요?</h3>
                <p className="text-sm text-slate-600">네, Gifty에서 생성되는 모든 GIF 파일은 표준 무한 반복(Infinite Loop) 메타데이터가 기본 적용되어 어디에 업로드하더라도 영구적으로 부드럽게 반복 재생됩니다.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg transition-all text-base"
            >
              지금 무료로 라이브포토 변환해보기 &rarr;
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
