import { useState, useEffect } from 'react';

export interface SiteSettings {
  heroTagline: string;
  affiliateTitle: string;
  affiliateSubtitle: string;
  affiliateLink: string;
}

const defaultSettings: SiteSettings = {
  heroTagline: '100% 무료 GIF 메이커',
  affiliateTitle: '요즘 대세 필수 AI 앱, 에이닷 🚀',
  affiliateSubtitle: '통화 녹음부터 일정 관리까지! 나만의 똑똑한 AI 비서 A. 무료로 시작하기',
  affiliateLink: 'http://searchcategory.co.kr/ad/cpc_open.php?app=205&custom=16&domain=adot.ai&type=1&aid=8291&browser=chrome&guid=202311057VpLO8',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gifty_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    localStorage.setItem('gifty_settings', JSON.stringify(newSettings));
  };

  return { settings, saveSettings, isLoaded };
}
