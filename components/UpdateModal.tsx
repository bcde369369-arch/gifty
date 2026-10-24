'use client';

import React, { useEffect, useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const MODAL_STORAGE_KEY = 'hideUpdateModal_v4';

export default function UpdateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem(MODAL_STORAGE_KEY);
    if (hideUntil) {
      const hideUntilTime = parseInt(hideUntil, 10);
      if (Date.now() < hideUntilTime) {
        return;
      }
    }
    const timer = setTimeout(() => setIsOpen(true), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = (hideForToday: boolean) => {
    if (hideForToday) {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(MODAL_STORAGE_KEY, tomorrow.toString());
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative shrink-0">
          <button 
            onClick={() => handleClose(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-yellow-200 text-xs font-extrabold mb-2">
            <Sparkles size={13} /> NEW UPDATE 안내
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            🎉 블로거 필수 기능 대규모 업데이트!
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm font-medium mt-1">
            더 빠르고 편리해진 Gifty의 새로운 기능들을 지금 바로 만나보세요.
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3 overflow-y-auto">
          {/* 1. 리뷰노트·카톡 1초 자동등록 */}
          <Link
            href="/experience-diary"
            onClick={() => setIsOpen(false)}
            className="flex gap-3.5 items-start p-3.5 bg-amber-50/80 hover:bg-amber-100/70 rounded-2xl border border-amber-200/80 transition-all group"
          >
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 flex items-center justify-center rounded-xl text-white shrink-0 w-11 h-11 shadow-sm">
              <span className="text-xl">⚡</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-slate-800 text-sm group-hover:text-amber-700 transition-colors">
                    체험단 당첨 카톡 1초 자동등록 오픈!
                  </h3>
                  <span className="text-[10px] font-black px-1.5 py-0.5 bg-red-500 text-white rounded-full">
                    HOT
                  </span>
                </div>
                <ArrowRight size={14} className="text-amber-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong>리뷰노트 · 강남맛집 · 디너의여왕 · 레뷰 · 포포몬</strong> 당첨 카톡이나 내역을 복사·붙여넣기만 하면 업체명, 마감일, 식사권 금액, 포인트까지 1초 만에 자동 입력됩니다!
              </p>
            </div>
          </Link>

          {/* 2. 네이버 블로그 스티커 & 칼선 누끼 메이커 */}
          <Link
            href="/sticker"
            onClick={() => setIsOpen(false)}
            className="flex gap-3.5 items-start p-3.5 bg-pink-50/80 hover:bg-pink-100/70 rounded-2xl border border-pink-200/80 transition-all group"
          >
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2.5 flex items-center justify-center rounded-xl text-white shrink-0 w-11 h-11 shadow-sm">
              <span className="text-xl">🎨</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-slate-800 text-sm group-hover:text-pink-700 transition-colors">
                    네이버 블로그 스티커 제작소 오픈
                  </h3>
                  <span className="text-[10px] font-black px-1.5 py-0.5 bg-pink-600 text-white rounded-full">
                    NEW
                  </span>
                </div>
                <ArrowRight size={14} className="text-pink-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                내돈내산·솔직후기·별점 배지부터 내 사진 AI 누끼 + 흰색 칼선 스티커까지! 복사 후 블로그 에디터에 바로 붙여넣기(Ctrl+V) 하세요.
              </p>
            </div>
          </Link>

          {/* 3. 월간 정산 SNS 리포트 카드 공유 */}
          <Link
            href="/experience-diary"
            onClick={() => setIsOpen(false)}
            className="flex gap-3.5 items-start p-3.5 bg-indigo-50/80 hover:bg-indigo-100/70 rounded-2xl border border-indigo-200/80 transition-all group"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 flex items-center justify-center rounded-xl text-white shrink-0 w-11 h-11 shadow-sm">
              <span className="text-xl">📊</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
                    월간 정산 SNS 리포트 카드 & 블로그 표 공유
                  </h3>
                  <span className="text-[10px] font-black px-1.5 py-0.5 bg-indigo-600 text-white rounded-full">
                    NEW
                  </span>
                </div>
                <ArrowRight size={14} className="text-indigo-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                매달 체험단 총 수익과 완주 건수를 인스타 감성 리포트 카드 이미지 및 네이버 블로그용 HTML 정산표로 1초 만에 공유해 보세요.
              </p>
            </div>
          </Link>

          {/* 4. 동영상 구간 선택 필름스트립 타임라인 */}
          <div className="flex gap-3.5 items-start p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="bg-slate-800 p-2.5 flex items-center justify-center rounded-xl text-white shrink-0 w-11 h-11 shadow-sm">
              <span className="text-xl">🎬</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-slate-800 text-sm">
                  동영상 구간 선택 필름스트립 & 0.1초 정밀 편집
                </h3>
                <span className="text-[10px] font-black px-1.5 py-0.5 bg-slate-700 text-white rounded-full">
                  UPGRADE
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                8프레임 썸네일 타임라인과 실시간 화면 동기화, ±0.1초 미세 조절 버튼으로 원하는 하이라이트 구간을 정확하게 움짤로 만들 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between shrink-0">
          <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-500 hover:text-slate-700 font-semibold select-none">
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
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-extrabold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
          >
            확인했어요!
          </button>
        </div>
      </div>
    </div>
  );
}
