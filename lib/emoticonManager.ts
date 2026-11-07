/**
 * Gifty 자체 제작 커스텀 이모티콘 & 스티커 매니저
 * (관리자 모드 등록 / 삭제 / 미니툴바 실시간 연동)
 */

export interface CustomEmoticon {
  id: string;
  name: string;
  imageUrl: string; // Base64 data:image/png or SVG data URI
  category: '도장/인증' | '맛집/먹방' | '감정/리액션' | '기타';
  createdAt: number;
  isBuiltin?: boolean;
}

const STORAGE_KEY = 'gifty_custom_emoticons_v1';

/** 기본 내장 고화질 시그니처 투명 스티커 6종 */
export const DEFAULT_BUILTIN_EMOTICONS: CustomEmoticon[] = [
  {
    id: 'builtin-naedon',
    name: '100% 내돈내산 도장',
    category: '도장/인증',
    createdAt: 1700000000000,
    isBuiltin: true,
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="%23fff" fill-opacity="0.9" stroke="%23f43f5e" stroke-width="7" stroke-dasharray="10 5"/><circle cx="100" cy="100" r="76" fill="none" stroke="%23f43f5e" stroke-width="2.5"/><text x="100" y="65" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="16" fill="%23f43f5e" text-anchor="middle">★ VERIFIED ★</text><text x="100" y="105" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="28" fill="%23e11d48" text-anchor="middle">100%</text><text x="100" y="138" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="20" fill="%23f43f5e" text-anchor="middle">내돈내산</text><text x="100" y="160" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="bold" font-size="12" fill="%23fda4af" text-anchor="middle">솔직 리얼 후기</text></svg>`,
  },
  {
    id: 'builtin-jmt',
    name: '존맛탱 JMT 뱃지',
    category: '맛집/먹방',
    createdAt: 1700000001000,
    isBuiltin: true,
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="120" viewBox="0 0 220 120"><rect x="10" y="10" width="200" height="100" rx="28" fill="%23fef08a" fill-opacity="0.95" stroke="%23ea580c" stroke-width="6"/><text x="110" y="52" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="18" fill="%23ea580c" text-anchor="middle">🔥 침샘폭발 🔥</text><text x="110" y="92" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="34" fill="%23c2410c" text-anchor="middle">존맛탱 ✨</text></svg>`,
  },
  {
    id: 'builtin-5stars',
    name: '별점 5개 만점',
    category: '도장/인증',
    createdAt: 1700000002000,
    isBuiltin: true,
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="110" viewBox="0 0 220 110"><rect x="8" y="8" width="204" height="94" rx="24" fill="%231e1b4b" fill-opacity="0.92" stroke="%23fbbf24" stroke-width="5"/><text x="110" y="44" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="20" fill="%23fbbf24" text-anchor="middle">⭐⭐⭐⭐⭐</text><text x="110" y="80" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="22" fill="%23ffffff" text-anchor="middle">5.0 만점 추천</text></svg>`,
  },
  {
    id: 'builtin-revisit',
    name: '재방문 각 200%',
    category: '감정/리액션',
    createdAt: 1700000003000,
    isBuiltin: true,
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="130" viewBox="0 0 200 130"><rect x="8" y="8" width="184" height="114" rx="30" fill="%23ecfdf5" fill-opacity="0.95" stroke="%23059669" stroke-width="6"/><text x="100" y="50" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="16" fill="%23059669" text-anchor="middle">❤️ 무조건 재방문 ❤️</text><text x="100" y="96" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="32" fill="%23047857" text-anchor="middle">재방문 200%</text></svg>`,
  },
  {
    id: 'builtin-meat',
    name: '지글지글 육즙',
    category: '맛집/먹방',
    createdAt: 1700000004000,
    isBuiltin: true,
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="%23fff1f2" fill-opacity="0.95" stroke="%23be123c" stroke-width="7"/><text x="100" y="60" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="18" fill="%23be123c" text-anchor="middle">🥩 고기러버 🥩</text><text x="100" y="106" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="28" fill="%23881337" text-anchor="middle">육즙 폭발</text><text x="100" y="148" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="bold" font-size="14" fill="%23fb7185" text-anchor="middle">겉바속촉 찐맛집</text></svg>`,
  },
  {
    id: 'builtin-cafe',
    name: '감성 카페 투어',
    category: '맛집/먹방',
    createdAt: 1700000005000,
    isBuiltin: true,
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="130" viewBox="0 0 200 130"><rect x="8" y="8" width="184" height="114" rx="26" fill="%23fdf4ff" fill-opacity="0.95" stroke="%23a855f7" stroke-width="6"/><text x="100" y="52" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="16" fill="%239333ea" text-anchor="middle">☕ 감성 한 스푼 🍰</text><text x="100" y="96" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="26" fill="%237e22ce" text-anchor="middle">인생 카페</text></svg>`,
  },
];

/** 등록된 모든 이모티콘 불러오기 (기본값 + 관리자 커스텀 등록본) */
export function getAllEmoticons(): CustomEmoticon[] {
  if (typeof window === 'undefined') return DEFAULT_BUILTIN_EMOTICONS;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BUILTIN_EMOTICONS));
      return DEFAULT_BUILTIN_EMOTICONS;
    }
    const parsed: CustomEmoticon[] = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_BUILTIN_EMOTICONS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load emoticons from localStorage', e);
    return DEFAULT_BUILTIN_EMOTICONS;
  }
}

/** 신규 커스텀 이모티콘 등록 (관리자용) */
export function addCustomEmoticon(
  name: string,
  imageUrl: string,
  category: '도장/인증' | '맛집/먹방' | '감정/리액션' | '기타' = '도장/인증'
): CustomEmoticon {
  const current = getAllEmoticons();
  const newEmoticon: CustomEmoticon = {
    id: `custom-emo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim() || '커스텀 스티커',
    imageUrl,
    category,
    createdAt: Date.now(),
    isBuiltin: false,
  };

  const updated = [newEmoticon, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gifty_emoticons_updated'));
  }

  return newEmoticon;
}

/** 이모티콘 삭제 (관리자용) */
export function deleteCustomEmoticon(id: string): boolean {
  if (typeof window === 'undefined') return false;

  const current = getAllEmoticons();
  const filtered = current.filter((emo) => emo.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('gifty_emoticons_updated'));
  return true;
}

/** 기본 내장 세트로 초기화 (관리자용) */
export function resetEmoticonsToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BUILTIN_EMOTICONS));
  window.dispatchEvent(new Event('gifty_emoticons_updated'));
}

/** 이미지/SVG를 FFmpeg 호환 투명 PNG Blob으로 변환 */
export async function convertToPngBlob(imageUrlOrDataUrl: string, targetSize = 256): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }
        ctx.clearRect(0, 0, targetSize, targetSize);
        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = imageUrlOrDataUrl;
  });
}
