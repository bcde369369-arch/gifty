'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'Gifty - 마법처럼 움짤로!',
      text: '가입 없이 브라우저에서 바로 동영상을 고화질 GIF로 변환해 보세요. 100% 무료입니다!',
      url: 'https://gifty.run',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('공유가 취소되었거나 지원하지 않습니다.', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('클립보드 복사 실패', err);
        alert('주소 복사에 실패했습니다.');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full font-bold transition-all shadow-sm active:scale-95"
    >
      {copied ? <Check size={18} /> : <Share2 size={18} />}
      {copied ? '주소가 복사되었습니다!' : 'SNS에 공유하기'}
    </button>
  );
}
