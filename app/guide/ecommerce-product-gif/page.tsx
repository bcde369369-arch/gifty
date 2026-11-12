import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, TrendingUp, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const metadata = {
  title: '쇼핑몰·스마트스토어 상세페이지 구매 전환율 2배 올리는 제품 GIF 제작법 - Gifty',
  description: '쿠팡, 스마트스토어, 와디즈 등 이커머스 상세페이지에서 정지된 사진보다 고객의 스크롤을 멈추고 구매를 유도하는 실전 GIF 제작 가이드입니다.',
};

export default function EcommerceProductGifGuide() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full mb-4">
              <ShoppingBag size={14} /> 이커머스 매출 증대 전략
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              쇼핑몰·스마트스토어 상세페이지 구매 전환율 2배 올리는 제품 GIF 제작 비법
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-11-02 · 작성자: Gifty 마케팅팀</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              온라인 쇼핑몰 상세페이지에서 소비자가 머무는 평균 시간은 <strong>단 7초</strong>에 불과합니다.
              긴 설명 글과 정지된 사진만으로는 고객의 빠른 스크롤을 멈출 수 없습니다.
              실제로 제품의 기능성이나 사용감을 생생하게 보여주는 GIF 움짤을 배치했을 때 <strong>구매 전환율(CVR)이 평균 35%에서 최대 120%까지 상승</strong>한다는 통계가 있습니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Sparkles size={22} className="text-rose-500" />
              1. 소비자의 지갑을 여는 3대 핵심 GIF 연출법
            </h2>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <h3 className="font-bold text-slate-800 text-base">① Before &amp; After (극적인 비교 장면)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  청소용품, 화장품, 의류 주름 개선 등 효과가 눈에 보이는 제품에 필수적입니다.
                  오염된 바닥이 한 번의 걸레질로 깨끗해지는 2초짜리 연속 동작은 10장의 정지 사진보다 훨씬 강력한 설득력을 발휘합니다.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <h3 className="font-bold text-slate-800 text-base">② 탄성·질감·작동감의 클로즈업</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  소비자가 직접 만져볼 수 없다는 온라인 쇼핑의 한계를 극복해야 합니다.
                  매트리스나 베개가 푹신하게 눌렸다가 복원되는 텐션, 텀블러의 뚜껑이 원터치로 딸깍 열리는 조작감을 근접 촬영하여 3초 루프로 보여주세요.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <h3 className="font-bold text-slate-800 text-base">③ 360도 회전 및 착용 핏 (Fit)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  패션 의류나 가방, 신발의 경우 모델이 가볍게 턴을 하거나 걸어오는 자연스러운 동세를 보여주면 반품률을 획기적으로 낮출 수 있습니다.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <TrendingUp size={22} className="text-indigo-600" />
              2. 상세페이지 최적 규격: 용량과 로딩 속도의 균형
            </h2>
            <p>
              GIF가 아무리 좋아도 <strong>용량이 20MB를 초과하면 상세페이지 로딩 속도가 느려져 고객이 이탈</strong>합니다.
              이커머스 플랫폼별 권장 가이드라인을 준수해야 합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm">
              <li><strong>스마트스토어 권장 가로 폭:</strong> 860px (스마트폰 최적화)</li>
              <li><strong>쿠팡 상세페이지 권장 가로 폭:</strong> 780px ~ 800px</li>
              <li><strong>파일 1개당 최대 권장 용량:</strong> <strong>5MB ~ 8MB 이하</strong></li>
              <li><strong>권장 재생 길이:</strong> 2초 ~ 4초 (자연스럽게 무한 반복되는 심리스 루프)</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <AlertCircle size={22} className="text-amber-500" />
              3. 상세페이지 제작 시 흔히 저지르는 치명적 실수
            </h2>
            <p>
              움짤 10개를 상세페이지 상단부터 하단까지 무작정 도배하면 모바일 기기 메모리가 부족해져 브라우저가 강제 종료(튕김)될 수 있습니다.
              <strong>상세페이지 1개당 가장 핵심적인 기능 포인트 3~4개에만 선별적으로 GIF를 배치</strong>하고, 나머지 설명은 정지 이미지와 텍스트로 보완하는 것이 모바일 친화적인 레이아웃입니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-600" />
              4. Gifty를 활용한 원클릭 제작 팁
            </h2>
            <p>
              스마트폰으로 촬영한 4K 제품 영상을 Gifty에 올리고 [스마트스토어 최적화] 프리셋을 선택하면,
              불필요한 프레임을 자동으로 정리하여 5MB 안쪽의 초경량 고화질 GIF로 즉시 완성할 수 있습니다.
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
