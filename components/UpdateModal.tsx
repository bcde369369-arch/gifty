'use client';

import React, { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function UpdateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has dismissed the modal in the last 24 hours
    const hideUntil = localStorage.getItem('hideUpdateModal_v3');
    if (hideUntil) {
      const hideUntilTime = parseInt(hideUntil, 10);
      if (Date.now() < hideUntilTime) {
        return; // Still hiding
      }
    }
    // Show modal after a small delay for better UX
    const timer = setTimeout(() => setIsOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = (hideForToday: boolean) => {
    if (hideForToday) {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('hideUpdateModal_v3', tomorrow.toString());
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 p-6 text-white relative">
          <button 
            onClick={() => handleClose(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-yellow-300" size={24} />
            <h2 className="text-xl font-black">🎉 Gifty 대규모 업데이트!</h2>
          </div>
          <p className="text-indigo-100 text-sm font-medium">블로거와 크리에이터를 위한 신규 기능이 오픈되었어요!</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex gap-4 items-start p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100">
            <div className="bg-indigo-600 p-2.5 flex items-center justify-center rounded-xl text-white shrink-0 w-11 h-11 shadow-sm">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-slate-800 text-sm">Gifty 커뮤니티 오픈</h3>
                <span className="text-[10px] font-black px-1.5 py-0.2 bg-red-500 text-white rounded-full">NEW</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                가입 없이 3초 만에 글/댓글 작성! 체험단 정산 인증, 블로그 팁, 기능 건의를 자유롭게 나눠보세요.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
            <div className="bg-blue-600 p-2.5 flex items-center justify-center rounded-xl text-white shrink-0 w-11 h-11 shadow-sm">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-slate-800 text-sm">체험단별 횟수 & 총 건수 집계</h3>
                <span className="text-[10px] font-black px-1.5 py-0.2 bg-indigo-600 text-white rounded-full">UPGRADE</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                가계부에 레뷰, 리뷰노트 등 플랫폼별 진행 건수와 비중(%), 건당 평균 혜택이 한눈에 자동 정리됩니다.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-3 bg-purple-50/70 rounded-2xl border border-purple-100">
            <div className="bg-purple-600 p-2.5 flex items-center justify-center rounded-xl text-white shrink-0 w-11 h-11 shadow-sm">
              <span className="text-xl">✂️</span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">AI 사진 누끼따기 & 고화질 GIF</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                100% 무료! 서버 저장 없는 안전한 브라우저 변환과 배경 제거 도구도 계속 무료로 즐겨보세요.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500 hover:text-slate-700 font-medium">
            <input 
              type="checkbox" 
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              onChange={(e) => {
                if (e.target.checked) handleClose(true);
              }}
            />
            오늘 하루 보지 않기
          </label>
          <button 
            onClick={() => handleClose(false)}
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
