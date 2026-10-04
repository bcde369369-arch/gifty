'use client';

import React, { useEffect, useState } from 'react';
import { X, Sparkles, Zap, Image as ImageIcon, Type } from 'lucide-react';

export default function UpdateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has dismissed the modal in the last 24 hours
    const hideUntil = localStorage.getItem('hideUpdateModal_v2');
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
      localStorage.setItem('hideUpdateModal_v2', tomorrow.toString());
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white relative">
          <button 
            onClick={() => handleClose(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-yellow-300" size={24} />
            <h2 className="text-xl font-black">Gifty 신규 기능 업데이트!</h2>
          </div>
          <p className="text-indigo-100 text-sm font-medium">블로거 여러분의 불편함을 덜어드릴 강력한 툴들이 추가되었어요!</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 p-3 flex items-center justify-center rounded-2xl text-blue-600 shrink-0 w-12 h-12">
              <span className="text-2xl">📓</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">체험단 다이어리 (가계부 연동)</h3>
              <p className="text-sm text-slate-600 mt-1">방문/마감일정 관리는 물론, 제공 혜택과 지원금(원고료)까지 자동으로 합산해 순수익을 알려줍니다.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-purple-100 p-3 flex items-center justify-center rounded-2xl text-purple-600 shrink-0 w-12 h-12">
              <span className="text-2xl">✂️</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">AI 사진 누끼따기 (무료)</h3>
              <p className="text-sm text-slate-600 mt-1">회원가입 없이, 100% 무료로 이미지 배경을 제거해 드립니다. 블로그 썸네일 만들 때 필수!</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-emerald-100 p-3 flex items-center justify-center rounded-2xl text-emerald-600 shrink-0 w-12 h-12">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">체험단 사이트 & 움짤 꿀팁</h3>
              <p className="text-sm text-slate-600 mt-1">블로거라면 꼭 알아야 할 꿀팁과 알짜배기 체험단 사이트들을 한 곳에 모아두었습니다.</p>
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
