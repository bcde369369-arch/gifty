import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, BookOpen } from 'lucide-react';


export const metadata = {
  title: '?€ì§?ê¿€??ë°±ê³¼?¬ì „ - Gifty',
  description: 'ë¸”ë¡œê·??¸ë˜?½ì„ ?˜ë ¤ì£¼ëŠ” ?€ì§?ë§ˆì??? ê³ í™”ì§?GIF ?œì‘ ë¹„ë²• ?±ì„ ?Œë ¤?œë¦½?ˆë‹¤.',
};

const POSTS = [
  {
    slug: 'naver-blog-limit',
    title: '?¤ì´ë²?ë¸”ë¡œê·??€ì§?GIF) ?©ëŸ‰ 20MB ?œí•œ, ?”ì§ˆ ê¹¨ì§ ?†ì´ ?¬ë¦¬???„ë²½ ê°€?´ë“œ',
    desc: 'ë¸”ë¡œê·¸ì— 20MBê°€ ?˜ëŠ” ?€ì§¤ì„ ?¬ë¦¬?¤ë‹¤ ?¤íŒ¨?˜ì‹  ???ˆë‚˜?? ?„ë ˆ?„ê³¼ ?¬ì´ì¦ˆë? ì¡°ì ˆ???”ì§ˆ ?ì‹¤ ?†ì´ ?©ëŸ‰ë§???ì¤„ì´??ë¹„ë???ê³µê°œ?©ë‹ˆ??',
    date: '2026-10-03',
  },
  {
    slug: 'gif-marketing-seo',
    title: 'ë¸”ë¡œê·?ì²´ë¥˜?œê°„??2ë°??˜ë ¤ì£¼ëŠ” \'?€ì§?ë§ˆì???' ê²€?‰ì—”ì§?ìµœì ??SEO) ?„ëµ',
    desc: '?¬ëŒ?¤ì? ê¸€?¨ë§Œ ?ˆëŠ” ë¸”ë¡œê·¸ë? ê¸ˆë°© ?´íƒˆ?©ë‹ˆ?? ?€ì§¤ì„ ?œìš©???…ì???œì„ ???¬ë¡œ?¡ê³  ? ë“œ?¼ìŠ¤ ?˜ìµ???’ì´??ê¿€??',
    date: '2026-10-02',
  },
  {
    slug: 'high-quality-gif',
    title: '?™ì˜?ì„ 4K ê³ í™”ì§?GIFë¡?ë³€?˜í•˜??ê°€??ë¹ ë¥¸ ë°©ë²• (?¤ì¹˜ vs ë¬´ì„¤ì¹?',
    desc: '?¬í† ?µì´??ë¬´ê±°???„ë¡œê·¸ë¨ ?¤ì¹˜ ?†ì´, ??ë¸Œë¼?°ì?ë§Œìœ¼ë¡?ì´ˆê³ ??ê³ í™”ì§?GIFë¥?ë§Œë“œ??ìµœì‹  WebAssembly ê¸°ìˆ ???Œê°œ?©ë‹ˆ??',
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
              <ArrowLeft size={16} /> ?ˆìœ¼ë¡??Œì•„ê°€ê¸?            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-4">
            <BookOpen size={16} /> ë¸”ë¡œê±??„ìˆ˜ ??          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            ?€ì§?ê¿€??ë°±ê³¼?¬ì „
          </h1>
          <p className="text-lg text-slate-500">
            ?¹ì‹ ??ë¸”ë¡œê·¸ë? ???¨ê³„ ?…ê·¸?ˆì´?œí•´ ì¤?GIF ?œìš© ë¹„ë²•??ëª¨ì•˜?µë‹ˆ??
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
                  ê¸€ ?½ê¸° &rarr;
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>

      
    </div>
  );
}
