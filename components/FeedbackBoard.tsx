'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';

export default function FeedbackBoard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Only load Disqus once
    if ((window as any).DISQUS) return;

    // Set configuration
    (window as any).disqus_config = function () {
      this.page.url = "https://gifty.run";
      this.page.identifier = "gifty-main-board";
    };

    // Inject the Disqus script
    const script = document.createElement('script');
    script.src = 'https://https-gifty-run.disqus.com/embed.js';
    script.setAttribute('data-timestamp', new Date().getTime().toString());
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup is usually not necessary for Disqus unless unmounting completely
    };
  }, []);

  return (
    <section className="max-w-4xl mx-auto mt-16 mb-24 px-4" id="feedback-board">
      <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm">
            <MessageSquarePlus size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Gifty에 바란다 ✍️</h2>
            <p className="text-slate-500 mt-1 text-sm md:text-base">기능 건의, 응원 한마디, 아쉬운 점 등 어떤 말씀이든 환영합니다!</p>
          </div>
        </div>
        <div className="p-6 md:p-8 min-h-[300px]">
          <div id="disqus_thread"></div>
          <noscript>게시판을 보려면 자바스크립트를 활성화해 주세요.</noscript>
        </div>
      </div>
    </section>
  );
}
