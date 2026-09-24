'use client';

import React, { useEffect, useState } from 'react';
import { X, Sparkles, Zap, Image as ImageIcon, Type } from 'lucide-react';

export default function UpdateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has dismissed the modal in the last 24 hours
    const hideUntil = localStorage.getItem('hideUpdateModal_v1');
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
      localStorage.setItem('hideUpdateModal_v1', tomorrow.toString());
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
            <h2 className="text-xl font-black">Gifty 대규모 업데이트!</h2>
          </div>
          <p className="text-indigo-100 text-sm font-medium">여러분의 피드백으로 완성된 킬러 기능들을 만나보세요.</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shrink-0">
              <Type size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">자막 (텍스트) 넣기</h3>
              <p className="text-sm text-slate-600 mt-1">"가즈아아!" 같은 재미있는 자막을 움짤에 바로 새겨 넣을 수 있어요.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-green-100 p-3 rounded-2xl text-green-600 shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">재생 속도 조절</h3>
              <p className="text-sm text-slate-600 mt-1">2배 빠르게, 또는 0.5배 느리게! 개그 짤이나 감성 짤을 쉽게 만들어보세요.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-purple-100 p-3 rounded-2xl text-purple-600 shrink-0">
              <ImageIcon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">내 블로그 로고 달기</h3>
              <p className="text-sm text-slate-600 mt-1">불펌 방지! 내 블로그 로고를 업로드하면 우측 하단에 예쁘게 박힙니다.</p>
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
