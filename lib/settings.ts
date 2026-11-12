import { useState, useEffect } from 'react';

export interface SiteSettings {
  heroTagline: string;
  affiliateTitle: string;
  affiliateSubtitle: string;
  affiliateLink: string;
  coupangBannerHtml: string;
  coupangBannerHtmlMobile: string;
  showCoupangAds: boolean; // 구글 애드센스 심사용 클린 모드 제어 (false: 제휴/쿠팡 전체 숨김, true: 노출)
}

const defaultSettings: SiteSettings = {
  heroTagline: '100% 무료 GIF 메이커',
  affiliateTitle: '요즘 대세 필수 AI 앱, 에이닷 🚀',
  affiliateSubtitle: '통화 무제한 녹음부터 일정 관리까지! 나만의 똑똑한 AI 비서 A. 무료로 시작하기',
  affiliateLink: 'http://searchcategory.co.kr/ad/cpc_open.php?app=205&custom=16&domain=adot.ai&type=1&aid=8291&browser=chrome&guid=202311057VpLO8',
  coupangBannerHtml: '<iframe src="https://ads-partners.coupang.com/widgets.html?id=1035486&template=carousel&trackingCode=AF9715762&subId=&width=680&height=140&tsource=" width="680" height="140" frameborder="0" scrolling="no" referrerpolicy="unsafe-url"></iframe>', 
  coupangBannerHtmlMobile: '<iframe src="https://ads-partners.coupang.com/widgets.html?id=1035486&template=carousel&trackingCode=AF9715762&subId=&width=320&height=100&tsource=" width="320" height="100" frameborder="0" scrolling="no" referrerpolicy="unsafe-url"></iframe>', 
  showCoupangAds: false, // 구글 애드센스 심사를 위해 기본값은 안전하게 숨김(클린 모드) 상태로 설정
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gifty_settings_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    localStorage.setItem('gifty_settings_v2', JSON.stringify(newSettings));
  };

  return { settings, saveSettings, isLoaded };
}

