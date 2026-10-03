import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, BookOpen } from 'lucide-react';


export const metadata = {
  title: '?吏?轅??諛깃낵?ъ쟾 - Gifty',
  description: '釉붾줈洹??몃옒?쎌쓣 ?섎젮二쇰뒗 ?吏?留덉??? 怨좏솕吏?GIF ?쒖옉 鍮꾨쾿 ?깆쓣 ?뚮젮?쒕┰?덈떎.',
};

const POSTS = [
  {
    slug: 'naver-blog-limit',
    title: '?ㅼ씠踰?釉붾줈洹??吏?GIF) ?⑸웾 20MB ?쒗븳, ?붿쭏 源⑥쭚 ?놁씠 ?щ━???꾨꼍 媛?대뱶',
    desc: '釉붾줈洹몄뿉 20MB媛 ?섎뒗 ?吏ㅼ쓣 ?щ━?ㅻ떎 ?ㅽ뙣?섏떊 ???덈굹?? ?꾨젅?꾧낵 ?ъ씠利덈? 議곗젅???붿쭏 ?먯떎 ?놁씠 ?⑸웾留???以꾩씠??鍮꾨???怨듦컻?⑸땲??',
    date: '2026-10-03',
  },
  {
    slug: 'gif-marketing-seo',
    title: '釉붾줈洹?泥대쪟?쒓컙??2諛??섎젮二쇰뒗 \'?吏?留덉???' 寃?됱뿏吏?理쒖쟻??SEO) ?꾨왂',
    desc: '?щ엺?ㅼ? 湲?⑤쭔 ?덈뒗 釉붾줈洹몃? 湲덈갑 ?댄깉?⑸땲?? ?吏ㅼ쓣 ?쒖슜???낆옄???쒖꽑???щ줈?↔퀬 ?좊뱶?쇱뒪 ?섏씡???믪씠??轅??',
    date: '2026-10-02',
  },
  {
    slug: 'high-quality-gif',
    title: '?숈쁺?곸쓣 4K 怨좏솕吏?GIF濡?蹂?섑븯??媛??鍮좊Ⅸ 諛⑸쾿 (?ㅼ튂 vs 臾댁꽕移?',
    desc: '?ы넗?듭씠??臾닿굅???꾨줈洹몃옩 ?ㅼ튂 ?놁씠, ??釉뚮씪?곗?留뚯쑝濡?珥덇퀬??怨좏솕吏?GIF瑜?留뚮뱶??理쒖떊 WebAssembly 湲곗닠???뚭컻?⑸땲??',
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
              <ArrowLeft size={16} /> ?덉쑝濡??뚯븘媛湲?            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-4">
            <BookOpen size={16} /> 釉붾줈嫄??꾩닔 ??          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            ?吏?轅??諛깃낵?ъ쟾
          </h1>
          <p className="text-lg text-slate-500">
            ?뱀떊??釉붾줈洹몃? ???④퀎 ?낃렇?덉씠?쒗빐 以?GIF ?쒖슜 鍮꾨쾿??紐⑥븯?듬땲??
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
                  湲 ?쎄린 &rarr;
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>

      
    </div>
  );
}