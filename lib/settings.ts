import { useState, useEffect } from 'react';

export interface SiteSettings {
  heroTagline: string;
  affiliateTitle: string;
  affiliateSubtitle: string;
  affiliateLink: string;
}

const defaultSettings: SiteSettings = {
  heroTagline: '100% 무료 GIF 메이커',
  affiliateTitle: '더 화려한 영상 편집이 필요하신가요?',
  affiliateSubtitle: 'Canva Pro로 워터마크 없이 수만 개의 템플릿과 텍스트 효과를 활용해 보세요.',
  affiliateLink: 'https://www.canva.com',
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
