import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, BookOpen } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata = {
  title: '움짤 꿀팁 백과사전 - Gifty',
  description: '블로그 트래픽을 늘려주는 움짤 마케팅, 고화질 GIF 제작 비법 등을 알려드립니다.',
};

const POSTS = [
  {
    slug: 'naver-blog-limit',
    title: '네이버 블로그 움짤(GIF) 용량 20MB 제한, 화질 깨짐 없이 올리는 완벽 가이드',
    desc: '블로그에 20MB가 넘는 움짤을 올리려다 실패하신 적 있나요? 프레임과 사이즈를 조절해 화질 손실 없이 용량만 쏙 줄이는 비밀을 공개합니다.',
    date: '2026-10-03',
  },
  {
    slug: 'gif-marketing-seo',
    title: '블로그 체류시간을 2배 늘려주는 \'움짤 마케팅\' 검색엔진 최적화(SEO) 전략',
    desc: '사람들은 글씨만 있는 블로그를 금방 이탈합니다. 움짤을 활용해 독자의 시선을 사로잡고 애드센스 수익을 높이는 꿀팁!',
    date: '2026-10-02',
  },
  {
    slug: 'high-quality-gif',
    title: '동영상을 4K 고화질 GIF로 변환하는 가장 빠른 방법 (설치 vs 무설치)',
    desc: '포토샵이나 무거운 프로그램 설치 없이, 웹 브라우저만으로 초고속 고화질 GIF를 만드는 최신 WebAssembly 기술을 소개합니다.',
    date: '2026-10-01',
  }
];

export default function GuideIndex() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 flex flex-col">
      {/* Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl transform rotate-3">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800">
              Gifty<span className="text-indigo-600">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={16} /> 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-4">
            <BookOpen size={16} /> 블로거 필수 팁
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            움짤 꿀팁 백과사전
          </h1>
          <p className="text-lg text-slate-500">
            당신의 블로그를 한 단계 업그레이드해 줄 GIF 활용 비법을 모았습니다.
          </p>
        </div>

        <div className="space-y-6">
          {POSTS.map(post => (
            <Link key={post.slug} href={`/guide/${post.slug}`} className="block group">
              <article className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                <div className="text-sm text-slate-400 font-medium mb-3">{post.date}</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {post.desc}
                </p>
                <div className="mt-6 text-indigo-600 font-bold text-sm flex items-center gap-1">
                  글 읽기 &rarr;
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
