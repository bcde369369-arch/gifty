import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, CheckCircle2, Target, Eye } from 'lucide-react';

export const metadata = {
  title: '네이버 블로그 클릭률(CTR)을 3배 높이는 대표 썸네일 움짤 제작 비법 - Gifty',
  description: '정적인 사진 대신 시선을 사로잡는 움직이는 대표 이미지(GIF)를 제작하여 피드 검색 노출 시 방문자 클릭을 극대화하는 실전 노하우를 공개합니다.',
};

export default function BlogThumbnailGuide() {
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
              <Target size={14} /> 블로그 유입 극대화
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              클릭률(CTR)을 3배 높이는 네이버 블로그 대표 썸네일 움짤 제작 비법
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-10-25 · 작성자: Gifty 에디터팀</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              수많은 검색 결과 피드 속에서 내 글이 상위 노출되더라도, <strong>독자가 클릭하지 않으면 아무런 의미가 없습니다.</strong> 같은 키워드로 검색했을 때 정지된 사진들 사이에 혼자만 부드럽게 움직이는 &apos;움짤 썸네일&apos;이 있다면 시선이 갈 수밖에 없습니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Eye size={22} className="text-indigo-600" />
              1. 네이버 블로그 검색 탭에서 움짤 썸네일의 원리
            </h2>
            <p>
              네이버 모바일 앱과 통합검색 탭에서는 글의 가장 첫 번째 첨부된 대표 이미지가 GIF 파일일 경우, 피드 목록에서 <strong>자동으로 1~2회 반복 재생</strong>되는 기능을 지원합니다.
            </p>
            <ul className="list-disc list-inside space-y-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <li><strong>맛집/카페 블로그:</strong> 찌개가 보글보글 끓는 순간, 고기가 지글지글 익는 순간, 치즈가 쭉 늘어나는 순간</li>
              <li><strong>IT/테크 블로그:</strong> 신제품 언박싱, 화면 터치 반응속도, LED 조명 효과</li>
              <li><strong>뷰티/패션 블로그:</strong> 립스틱 발색 샷, 옷 착용 후 핏 회전 샷</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-indigo-600" />
              2. 썸네일 전용 1:1 정사각형 움짤 제작 공식
            </h2>
            <p>
              블로그 썸네일은 모바일 뷰에서 1:1 비율로 크롭되어 보입니다. 따라서 다음 규칙을 지키는 것이 중요합니다:
            </p>
            <ol className="list-decimal list-inside space-y-3 pl-2">
              <li><strong>핵심 피사체를 중앙에 배치:</strong> 좌우 여백이 잘려도 문제가 없도록 중심부에 동작을 배치합니다.</li>
              <li><strong>재생 길이는 2~3초로 짧게:</strong> 사용자가 스크롤을 내리는 찰나의 순간에 1회의 완결된 동작이 끝나야 인상이 강하게 남습니다.</li>
              <li><strong>가로 크기 400x400 내외 권장:</strong> 썸네일은 작은 크기로 노출되므로 굳이 큰 해상도를 쓸 필요가 없습니다. 파일 용량도 1~2MB 내외로 가볍게 만드세요.</li>
            </ol>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Sparkles size={22} className="text-indigo-600" />
              3. 네이버 에디터에서 첫 번째 대표 이미지로 지정하기
            </h2>
            <p>
              글을 작성할 때 가장 맨 위나 도입부에 제작한 GIF를 업로드하고, 네이버 에디터 사진 목록에서 해당 움짤에 <strong>[대표]</strong> 체크가 켜져 있는지 반드시 확인하세요. 글을 발행한 뒤 모바일로 검색창에 글 제목을 검색해 피드에서 정상 재생되는지 모니터링하면 완성입니다!
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg transition-all text-base"
            >
              지금 Gifty에서 썸네일 움짤 만들어보기 &rarr;
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
