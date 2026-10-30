'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight, ThumbsUp, MessageCircle, PenTool } from 'lucide-react';
import { Post, getPosts, CATEGORY_LABELS } from '@/lib/community';

export default function CommunityPreview() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    const all = getPosts();
    setRecentPosts(all.slice(0, 3));
  }, []);

  return (
    <section className="max-w-4xl mx-auto mt-16 mb-20 px-4 md:px-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm">
              <MessageSquare size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                  실시간 커뮤니티 소통방 💬
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                  HOT
                </span>
              </div>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5">
                체험단 정산 후기, 블로그 팁을 나누고 Gifty에 자유롭게 의견을 남겨보세요!
              </p>
            </div>
          </div>
          <Link
            href="/community"
            className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm transition-all shadow-sm active:scale-95"
          >
            <PenTool size={14} /> 커뮤니티 바로가기 <ArrowRight size={14} />
          </Link>
        </div>

        {/* Recent Posts Cards */}
        <div className="p-4 md:p-6 divide-y divide-slate-100">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href="/community"
              className="block p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {CATEGORY_LABELS[post.category] || post.category}
                    </span>
                    {post.badge && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-red-100 text-red-600">
                        {post.badge}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {post.author}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm md:text-base text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {post.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold flex-shrink-0">
                  <span className="flex items-center gap-1 text-pink-500">
                    <ThumbsUp size={12} /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                    <MessageCircle size={12} /> {post.comments.length}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Link */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
          <Link
            href="/community"
            className="text-xs md:text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
          >
            더 많은 글 보러가기 & 글쓰기 <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
