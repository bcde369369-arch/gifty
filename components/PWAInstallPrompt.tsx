'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function PWAInstallPrompt() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. 서비스 워커 등록 (PWA 필수 조건)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service Worker registration failed: ', err);
      });
    }

    // 이미 앱으로 설치해서 들어온 경우 (standalone) 아무것도 안 함
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      return;
    }

    // 만약 사용자가 전에 닫기(X)를 눌렀다면 안 보여줌
    if (localStorage.getItem('pwa-prompt-dismissed') === 'true') {
      return;
    }

    // 2. 안드로이드/크롬 환경: 설치 프롬프트 이벤트 가로채기
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // 기본 미니 인포바 숨기기
      setDeferredPrompt(e);
      setShowAndroidPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. 아이폰(iOS) 사파리 환경 감지
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua); // 크롬 등 다른 앱 제외
    const isInAppBrowser = /kakaotalk|instagram|facebook|line|band/.test(ua);

    // 인앱 브라우저가 아니고, iOS 사파리인데 아직 설치 안 된 경우
    if (isIos && isSafari && !isInAppBrowser) {
      // 약간의 지연 후 툴팁 표시
      setTimeout(() => {
        setShowIosPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // 프롬프트 표시
    deferredPrompt.prompt();
    
    // 사용자의 선택 결과 기다리기
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowAndroidPrompt(false);
  };

  const handleDismiss = () => {
    setShowAndroidPrompt(false);
    setShowIosPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <>
      {/* 안드로이드 설치 팝업 바텀 시트 */}
      {showAndroidPrompt && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-[100] animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🪄</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Gifty 홈 화면에 추가하기</h3>
                  <p className="text-xs text-slate-500 mt-0.5">앱처럼 빠르고 편하게 움짤을 만들어보세요!</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
            >
              <Download size={18} />
              앱 설치하기 (무료)
            </button>
          </div>
        </div>
      )}

      {/* iOS 사파리 설치 안내 툴팁 */}
      {showIosPrompt && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-sm z-[100] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 relative">
            <button onClick={handleDismiss} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1">
              <X size={16} />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <Share size={20} />
              </div>
              <div className="pr-4">
                <h3 className="font-bold text-slate-800 text-sm mb-1">아이폰에서 앱처럼 쓰려면?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  화면 맨 아래 <strong>[공유]</strong> 버튼을 누르고,<br/>
                  <span className="inline-flex items-center justify-center bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mx-0.5 font-bold">홈 화면에 추가 +</span> 를 선택해 보세요!
                </p>
              </div>
            </div>
            {/* 꼬리표 (말풍선 꼬리) */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-200 transform rotate-45"></div>
          </div>
        </div>
      )}
    </>
  );
}
