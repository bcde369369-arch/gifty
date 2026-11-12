import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Layers, BarChart3, CheckCircle2, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: '웹 환경에서 GIF vs WebP vs MP4 포맷별 장단점 및 로딩 속도 완벽 비교 - Gifty',
  description: '블로그와 웹사이트에서 애니메이션 미디어를 선택할 때 고려해야 할 파일 용량, 브라우저 호환성, 구글 SEO 및 코어 웹 바이탈 영향을 심층 분석합니다.',
};

export default function GifVsWebpMp4Guide() {
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
              <BarChart3 size={14} /> 기술 심층 분석 · 포맷 비교
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              웹 환경에서 GIF vs WebP vs MP4 포맷별 장단점 및 로딩 속도 완벽 비교
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-11-01 · 작성자: Gifty 테크 에디터팀</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              블로그, 쇼핑몰 상세페이지, 웹 매거진을 제작할 때 방문자의 시선을 사로잡는 핵심 요소는 단연 움직이는 시각 자료입니다.
              하지만 <strong>GIF, WebP, MP4</strong> 세 가지 포맷 중 어떤 것을 선택해야 파일 용량을 줄이면서도 최고의 호환성과 화질을 챙길 수 있을까요?
              이번 가이드에서는 실제 압축 효율과 플랫폼별 지원 현황을 구체적으로 비교해 드립니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Layers size={22} className="text-indigo-600" />
              1. 세 포맷의 핵심 기술 구조 차이점
            </h2>
            <p>
              각 포맷은 탄생 배경과 압축 알고리즘이 근본적으로 다릅니다:
            </p>
            <ul className="list-disc list-inside space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <li>
                <strong>GIF (Graphics Interchange Format):</strong> 1987년에 개발된 포맷으로, 최대 256색의 인덱스 컬러 팔레트만을 지원합니다. 프레임 간 예측 압축(인터프레임)이 없어 파일 크기가 크지만, <strong>전 세계 모든 브라우저, 이메일, 메신저에서 100% 무조건 자동 재생</strong>되는 압도적인 호환성을 자랑합니다.
              </li>
              <li>
                <strong>애니메이션 WebP (Animated WebP):</strong> 구글이 개발한 현대적인 웹 이미지 포맷으로, 24비트 트루컬러와 8비트 알파 투명도를 완벽 지원합니다. 동일 화질의 GIF 대비 <strong>용량이 약 50%~70% 이상 절감</strong>됩니다.
              </li>
              <li>
                <strong>MP4 (H.264/AAC):</strong> 비디오 스트리밍의 표준으로 모션 벡터를 활용한 고효율 압축을 수행합니다. 용량 대비 화질이 가장 뛰어나지만, 웹 브라우저 정책상 <code>autoplay muted playsinline</code> 속성을 명시해야만 자동 재생이 작동합니다.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Zap size={22} className="text-indigo-600" />
              2. 파일 크기 및 대역폭 벤치마크 (5초 길이 클립 기준)
            </h2>
            <p>
              1080p 해상도의 5초 분량 동영상을 각각의 포맷으로 480px 가로 폭 기준으로 인코딩했을 때의 실측 용량 차이는 다음과 같습니다:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-3 border border-slate-200 font-bold">포맷</th>
                    <th className="p-3 border border-slate-200 font-bold">평균 파일 용량</th>
                    <th className="p-3 border border-slate-200 font-bold">자동 재생 안정성</th>
                    <th className="p-3 border border-slate-200 font-bold">네이버 블로그 지원</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold text-indigo-600">GIF (Gifty 최적화)</td>
                    <td className="p-3 border border-slate-200">약 5.2 MB</td>
                    <td className="p-3 border border-slate-200 font-bold text-emerald-600">100% (클릭 불필요)</td>
                    <td className="p-3 border border-slate-200 text-emerald-600">완벽 지원 (20MB 이내)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold text-indigo-600">Animated WebP</td>
                    <td className="p-3 border border-slate-200">약 2.1 MB</td>
                    <td className="p-3 border border-slate-200 text-slate-600">95% (구형 일부 제외)</td>
                    <td className="p-3 border border-slate-200 text-amber-600">부분 제한 (대표 썸네일 미지원)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-bold text-indigo-600">MP4 동영상</td>
                    <td className="p-3 border border-slate-200">약 1.4 MB</td>
                    <td className="p-3 border border-slate-200 text-rose-600">사용자 재생 클릭 필요</td>
                    <td className="p-3 border border-slate-200 text-slate-600">동영상 플레이어로 삽입</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-indigo-600" />
              3. 언제 어떤 포맷을 선택해야 하는가?
            </h2>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 text-base mb-1">✅ GIF를 선택해야 하는 상황</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  네이버 블로그, 카페, 다음 티스토리, 혹은 이메일 뉴스레터에 시각 자료를 삽입할 때입니다.
                  방문자가 브라우저를 열자마자 아무런 상호작용 없이 무조건 움직여 시선을 사로잡아야 할 때 GIF는 대체 불가능한 표준입니다.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 text-base mb-1">✅ MP4를 선택해야 하는 상황</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  재생 시간이 10초를 넘어가거나 음성(오디오)이 함께 전달되어야 하는 긴 리뷰 영상인 경우입니다.
                  10초 이상의 긴 영상을 GIF로 변환하면 파일 크기가 30MB를 훌쩍 넘어가므로 반드시 비디오 형태로 삽입해야 합니다.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <ShieldCheck size={22} className="text-indigo-600" />
              4. 결론: 똑똑한 최적화 전략
            </h2>
            <p>
              결론적으로 블로그 포스팅이나 상세페이지 본문에는 <strong>핵심 하이라이트 구간을 3~5초 길이로 자르고, 480px 가로 폭과 10~12fps로 최적화한 GIF</strong>를 사용하는 것이 가장 높은 전환율과 체류시간 향상을 가져옵니다.
              Gifty는 브라우저 내부에서 이 복잡한 압축 파라미터를 자동으로 조율하여 10MB 이하의 안전한 고품질 GIF를 생성해 드립니다.
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
