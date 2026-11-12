import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export const metadata = {
  title: '블로그·SNS 움짤 만들 때 꼭 알아야 할 저작권과 공정이용(Fair Use) 법적 상식 - Gifty',
  description: '영화, 드라마, 예능, 스포츠 경기 장면을 캡처하여 GIF 움짤로 만들 때 저작권 침해를 피하고 안전하게 활용하는 공정이용 및 법률 상식을 총정리합니다.',
};

export default function GifCopyrightGuide() {
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full mb-4">
              <Scale size={14} /> 저작권 가이드 · 법률 상식
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              블로그·SNS 움짤 만들 때 꼭 알아야 할 저작권과 공정이용 법적 상식
            </h1>
            <p className="text-sm text-slate-400">발행일: 2026-11-08 · 작성자: Gifty 법무 가이드팀</p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              드라마나 영화, 예능 방송의 명장면, 혹은 야구·축구 스포츠 경기의 하이라이트를 GIF로 만들어 블로그나 커뮤니티에 올리는 활동은 일상화되어 있습니다.
              하지만 <strong>저작권법 제28조(인용)와 제35조의5(공정이용)</strong>의 경계를 명확히 알지 못하고 사용하면 원저작권자로부터 게시 중단(게시글 블라인드) 요청이나 법적 분쟁을 겪을 수 있습니다.
              창작자로서 안전하게 움짤을 활용하는 핵심 기준을 짚어드립니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Scale size={22} className="text-indigo-600" />
              1. 정당한 인용(Fair Use)과 단순 복제의 차이
            </h2>
            <p>
              저작권법에서 타인의 저작물을 허락 없이 일부 인용할 수 있는 핵심 요건은 <strong>&apos;주종 관계(Primary vs Secondary)&apos;</strong>입니다:
            </p>
            <ul className="list-disc list-inside space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm">
              <li>
                <strong>안전한 경우 (정당한 인용):</strong> 내가 작성한 리뷰, 비평, 교육적 분석 글이 &apos;주(主)&apos;가 되고, 그 내용을 설명하기 위한 보조 자료로서 2~3초짜리 짧은 움짤이 &apos;종(從)&apos;으로 사용될 때
              </li>
              <li>
                <strong>위험한 경우 (저작권 침해):</strong> 내 글이나 비평은 거의 없이 방송 하이라이트 영상만 수십 개 연속으로 캡처해 올려 원본 콘텐츠를 대체하는 수준에 이를 때
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <AlertTriangle size={22} className="text-amber-500" />
              2. 상업적 광고 목적의 무단 사용은 절대 금지
            </h2>
            <p>
              영화 명대사 짤이나 유명 연예인의 리액션 짤을 내 스마트스토어 상품 상세페이지에 넣어 <strong>특정 제품을 판매하거나 홍보하는 상업적 용도로 사용하면 저작권 침해뿐 아니라 퍼블리시티권(초상사용권) 침해</strong>가 성립합니다.
              상업적 목적의 상세페이지나 스폰서 광고에는 반드시 직접 촬영한 영상이나 라이선스를 구매한 스톡 미디어만을 사용해야 합니다.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-600" />
              3. 안전한 움짤 작성을 위한 4가지 체크리스트
            </h2>
            <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span><strong>출처 명시:</strong> 화면 하단이나 캡션에 [출처: 방송사명/작품명]을 명확히 표기했는가?</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span><strong>분량 최소화:</strong> 결말 스포일러나 전체 줄거리를 대체하지 않고 3~4초 내외의 핵심 부분만 잘랐는가?</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span><strong>독창적인 비평 추가:</strong> 움짤 아래에 나의 감상평이나 분석적 코멘터리를 충분히 서술했는가?</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span><strong>스포츠 중계권 주의:</strong> 프로야구(KBO), 올림픽 등 독점 중계권 계약이 걸려 있는 공식 경기는 전용 가이드라인을 확인했는가?</span>
              </p>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 pt-4 border-t border-slate-100 flex items-center gap-2">
              <FileText size={22} className="text-indigo-600" />
              4. Gifty의 프라이버시 보호 원칙
            </h2>
            <p>
              Gifty는 사용자가 제작하는 결과물을 서버에 저장하지 않는 100% 로컬 클라이언트 도구입니다.
              사용자 여러분의 창작물에 불필요한 간섭을 하지 않으며, 안심하고 법률적 가이드라인 안에서 창의적인 콘텐츠를 만드실 수 있도록 최적의 인코딩 환경을 제공합니다.
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
