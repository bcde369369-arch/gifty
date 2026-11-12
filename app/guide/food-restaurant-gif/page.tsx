import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Utensils, Flame, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export const metadata = {
  title: '맛집 블로거 필수! 보글보글 찌개·치즈 폭포 고화질 움짤 촬영 공식 - Gifty',
  description: '네이버 블로그 맛집 리뷰의 체류시간을 3배 높이고 체험단 선정률을 높여주는 지글지글 고기 굽기, 치즈 늘어남 등 핵심 음식 움짤 촬영 테크닉입니다.',
};

export default function FoodRestaurantGifGuide() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full mb-4">
              <Utensils size={14} /> 맛집 리뷰 노하우 · 체류시간 UP
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              맛집 블로거 필수! 보글보글 찌개·치즈 폭포 고화질 움짤 촬영 공식
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-11-04 · 작성자: Gifty 푸드 에디터</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              맛집 블로그 포스팅에서 독자가 글을 멈추고 몰입하게 만드는 가장 결정적인 킬러 콘텐츠는 바로 <strong>&apos;음식의 생동감이 느껴지는 고화질 움짤&apos;</strong>입니다.
              김이 모락모락 피어오르는 국물, 불판 위에서 육즙을 뿜으며 지글지글 끓는 고기 한 점은 백 줄의 미사여구보다 즉각적인 식욕을 자극합니다.
              체험단 선정 확률을 높이고 네이버 블로그 검색 체류시간을 폭발시키는 실전 촬영 기법을 공개합니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Flame size={22} className="text-amber-500" />
              1. 맛집 포스팅 필수 3대 시그니처 씬
            </h2>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 text-base mb-1">① 지글지글 ASMR 씬 (고기/전/튀김)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  고기를 불판에 처음 올리는 순간 치이익 소리와 함께 연기가 피어오르는 3초 구간, 그리고 고기를 뒤집었을 때 갈색으로 완벽하게 마이야르 반응이 일어난 단면을 클로즈업하세요.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 text-base mb-1">② 보글보글 끓는 씬 (찌개/탕/라멘)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  국물이 센 불에서 맹렬하게 끓어오를 때 숟가락으로 건더기를 듬뿍 떠올려 화면 앞으로 가져오는 45도 각도 무빙샷을 연출합니다.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 text-base mb-1">③ 쭈욱 늘어나는 씬 (치즈/면치기/노른자)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  피자 한 조각을 들어 올릴 때 끝없이 늘어나는 치즈나, 반숙 계란의 노른자가 톡 터지며 흘러내리는 찰나를 슬로우 모션처럼 담아냅니다.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Sparkles size={22} className="text-indigo-600" />
              2. 흔들림 없는 촬영을 위한 3가지 황금 규칙
            </h2>
            <ul className="list-disc list-inside space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm">
              <li>
                <strong>양 팔꿈치를 테이블에 고정하기:</strong> 삼각대가 없는 식당에서는 양 팔꿈치를 테이블에 단단히 밀착시키면 짐벌 못지않은 흔들림 억제 효과를 얻을 수 있습니다.
              </li>
              <li>
                <strong>역광 피하기:</strong> 창가나 식당 조명을 등지고 앉아 음식에 그림자가 지지 않도록 촬영 각도를 잡으세요.
              </li>
              <li>
                <strong>2배율 줌 활용:</strong> 1배율로 음식에 너무 바짝 다가가면 왜곡이 생깁니다. 2배 광학 줌을 켜고 살짝 뒤에서 찍으면 아웃포커싱이 극대화되어 음식에만 시선이 집중됩니다.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Clock size={22} className="text-indigo-600" />
              3. 움짤 길이와 프레임 최적화 공식
            </h2>
            <p>
              음식 움짤의 이상적인 재생 길이는 <strong>2.5초 ~ 4초</strong>입니다.
              국물이 끓는 동작이나 치즈가 늘어나는 순간을 포착한 뒤, Gifty의 [블로그용 480px, 12fps] 프리셋으로 저장하면 파일 크기 6MB 안쪽으로 네이버 20MB 제한을 가볍게 통과합니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-600" />
              4. 노란색 예능 자막으로 주목도 200% 만들기
            </h2>
            <p>
              Gifty에 탑재된 [주아체 노란 예능 자막] 옵션을 활용해 &apos;육즙 팡팡!&apos;, &apos;치즈 폭포 실화?&apos; 같은 문구를 넣어주면 블로그 썸네일로도 최고의 클릭률을 이끌어낼 수 있습니다.
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
