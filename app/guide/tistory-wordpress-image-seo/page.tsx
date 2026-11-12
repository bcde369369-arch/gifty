import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Zap, Search, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: '티스토리·워드프레스 구글 SEO를 위한 GIF 이미지 최적화 및 LCP 개선 가이드 - Gifty',
  description: '구글 코어 웹 바이탈(Core Web Vitals)의 LCP 점수를 깎지 않으면서도 방문자 체류시간을 높이는 블로그 이미지 SEO와 파일 최적화 실전 전략입니다.',
};

export default function TistoryWordpressSeoGuide() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-full mb-4">
              <Globe size={14} /> 구글 SEO · 코어 웹 바이탈 최적화
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              티스토리·워드프레스 구글 SEO를 위한 GIF 이미지 최적화 및 LCP 개선 비법
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-11-05 · 작성자: Gifty SEO 엔지니어링팀</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              구글 검색 엔진(Google Search)에서 상위 노출을 노리는 티스토리 및 워드프레스 블로거에게 페이지 로딩 속도는 매우 민감한 문제입니다.
              구글은 2021년부터 <strong>코어 웹 바이탈(Core Web Vitals)</strong>을 검색 랭킹 핵심 알고리즘으로 채택했으며,
              그중에서도 가장 큰 시각적 요소의 렌더링 완료 시간을 측정하는 <strong>LCP (Largest Contentful Paint)</strong>는 순위 결정에 지대한 영향을 미칩니다.
              본 글에서는 움짤의 매력적인 체류시간 확보 효과는 누리면서도 LCP 점수를 완벽하게 방어하는 테크니컬 SEO 팁을 다룹니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Zap size={22} className="text-violet-600" />
              1. 고용량 GIF가 구글 검색 순위를 깎아먹는 이유
            </h2>
            <p>
              블로그 본문 상단(Above the fold)에 20MB가 넘는 무거운 GIF 파일을 그대로 배치하면 다음과 같은 연쇄적인 SEO 악영향이 일어납니다:
            </p>
            <ul className="list-disc list-inside space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm">
              <li><strong>LCP 시간 초과:</strong> 구글 권장 기준인 2.5초 이내에 로딩되지 못하고 4~5초 이상 지연되어 감점 처리됩니다.</li>
              <li><strong>모바일 이탈률 급증:</strong> LTE/5G 데이터 환경에서 화면이 하얗게 멈추며 방문자의 50% 이상이 뒤로가기를 누릅니다.</li>
              <li><strong>구글봇 크롤링 버짓 낭비:</strong> 구글 검색 로봇이 사이트를 색인할 때 할당된 대역폭을 소진하여 신규 글 색인이 지연됩니다.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Search size={22} className="text-violet-600" />
              2. 이미지 SEO 4대 실전 수칙
            </h2>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 text-base mb-1">① 본문 최상단 배치 피하기</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  LCP 요소로 측정되는 첫 화면 대표 이미지 자리에는 가벼운 정지 이미지(WebP/JPEG)를 두고,
                  GIF 움짤은 스크롤을 1~2번 내린 본문 중간 이후에 배치하는 것이 속도 점수를 지키는 가장 쉬운 방법입니다.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 text-base mb-1">② 레이지 로딩(Lazy Loading) 적용</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  이미지 태그에 <code>loading=&quot;lazy&quot;</code> 속성을 부여하여, 사용자의 스크롤이 해당 위치에 도달하기 전까지는 다운로드를 보류하도록 설정합니다.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 text-base mb-1">③ 검색 로봇을 위한 ALT 태그 작성</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  구글 봇은 이미지의 움직임을 직접 보지 못합니다. <code>alt=&quot;네이버 블로그 썸네일 움짤 만드는 과정 시연&quot;</code>처럼 구체적인 키워드를 포함한 대체 텍스트를 반드시 기입하세요.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-600" />
              3. 구글 코어 웹 바이탈 권장 규격 요약
            </h2>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• <strong>파일 용량:</strong> 1개당 <strong>3MB ~ 5MB 이하</strong> 유지</li>
                <li>• <strong>가로 해상도:</strong> 모바일 반응형 기준 <strong>500px ~ 640px</strong></li>
                <li>• <strong>초당 프레임:</strong> <strong>10 fps</strong> (움직임은 부드럽고 파일 크기는 70% 감소)</li>
              </ul>
            </div>

            <p>
              Gifty는 브라우저 내에서 용량과 프레임을 자유롭게 조절할 수 있는 프리셋을 기본 지원하므로,
              티스토리나 워드프레스에 업로드하기 전 단 5초의 최적화만으로도 완벽한 구글 100점 점수를 유지할 수 있습니다.
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
