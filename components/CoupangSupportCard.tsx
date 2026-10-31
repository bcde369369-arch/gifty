'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search, ExternalLink, Heart, Sparkles } from 'lucide-react';

interface CoupangSupportCardProps {
  category?: 'gif' | 'nukki' | 'diary' | 'sticker' | 'general';
  className?: string;
}

const CONTEXT_TIPS = {
  gif: {
    badge: '🎬 블로그 움짤 촬영 꿀팁',
    title: '흔들림 없는 고화질 맛집 짤 찍는 블로거 필수템!',
    tags: ['스마트폰 미니 삼각대', '음식 촬영용 포켓 조명', '스마트폰 짐벌'],
    searchKeyword: '스마트폰 촬영 삼각대',
  },
  nukki: {
    badge: '📸 스튜디오급 상품 사진 꿀팁',
    title: '집에서도 쇼핑몰처럼 깔끔하게! 누끼용 촬영 소품',
    tags: ['촬영용 포토 배경지', '미니 스튜디오 조명 박스', '제품 촬영 받침대'],
    searchKeyword: '제품 촬영 배경지',
  },
  diary: {
    badge: '📓 인플루언서 필수템',
    title: '체험단 방문 갈 때 가방 속 필수 준비물!',
    tags: ['고속 충전 대용량 보조배터리', '휴대용 링라이트', '영수증 포켓 바인더'],
    searchKeyword: '대용량 보조배터리',
  },
  sticker: {
    badge: '🎨 블로그 퀄리티 UP',
    title: '블로그 감성 포스팅을 위한 추천 소품 모음',
    tags: ['감성 카페 테이블 매트', '우드 트레이', '촬영 소품 오브제'],
    searchKeyword: '블로그 촬영 소품',
  },
  general: {
    badge: '☕ Gifty 100% 무료 유지 응원',
    title: '오늘 쿠팡에서 생필품이나 장보실 물건이 있으신가요?',
    tags: ['생수 로켓배송', '라면/간편식', '영양제/비타민', '생활용품'],
    searchKeyword: '생필품 로켓배송',
  },
};

export default function CoupangSupportCard({
  category = 'general',
  className = '',
}: CoupangSupportCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const info = CONTEXT_TIPS[category] || CONTEXT_TIPS.general;

  // 쿠팡 파트너스 트래킹이 적용된 검색 바로가기
  // 사용자의 트래킹 코드(AF9715762)가 쿠팡 세션에 걸리도록 위젯 게이트웨이 또는 쿠팡 검색 URL 생성
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim() || info.searchKeyword;
    // 쿠팡 파트너스 경유 검색 페이지
    const targetUrl = `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(query)}&channel=user`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleQuickTagClick = (tag: string) => {
    const targetUrl = `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(tag)}&channel=user`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCoupangDirect = () => {
    window.open('https://www.coupang.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`w-full bg-gradient-to-br from-white to-amber-50/40 border border-amber-200/80 rounded-3xl p-5 sm:p-6 shadow-xs ${className}`}>
      {/* 상단 뱃지 & 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
          <Sparkles size={13} className="text-amber-600" />
          {info.badge}
        </span>
        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
          <Heart size={12} className="text-rose-500 fill-rose-500" />
          <span>추가 비용 0원 · 서버 운영 응원</span>
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
        {info.title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
        Gifty는 별도 가입 없이 <strong>100% 무료</strong>로 운영됩니다. 혹시 오늘 쿠팡에서 살 물건이 있으시다면, 아래 검색창이나 바로가기를 통해 방문해 주시면 서버를 유지하는 데 큰 힘이 됩니다! ❤️
      </p>

      {/* 실시간 쿠팡 로켓배송 검색창 */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`예: ${info.searchKeyword}, 생수, 커피, 에어팟...`}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1 shrink-0"
        >
          <span>쿠팡 검색</span>
          <ExternalLink size={14} />
        </button>
      </form>

      {/* 추천 인기 검색 태그 칩 */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[11px] font-bold text-slate-400 mr-1">추천 꿀템:</span>
        {info.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickTagClick(tag)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 transition-all shadow-2xs"
          >
            #{tag}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCoupangDirect}
          className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all ml-auto flex items-center gap-1"
        >
          <ShoppingBag size={12} />
          <span>쿠팡 홈 바로가기 🚀</span>
        </button>
      </div>

      {/* 필수 공정위 문구 */}
      <div className="pt-2.5 border-t border-amber-200/50">
        <p className="text-[10px] text-slate-400 text-center sm:text-left leading-tight">
          ※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다. (구매자에게 추가 비용이 전혀 발생하지 않습니다)
        </p>
      </div>
    </div>
  );
}
