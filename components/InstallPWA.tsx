'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.log('SW registration failed: ', err);
        });
      });
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for the install prompt (Chrome, Edge, Android)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  if (isStandalone || isDismissed) {
    return null;
  }

  // If not iOS and no prompt available yet, we will show an alert when clicked instead of hiding

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("웹 브라우저 주소창 우측의 '앱 설치' 아이콘(모니터+화살표 모양)을 클릭하거나, 브라우저 메뉴에서 '설치'를 선택해 주세요.");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Inline Action Button */}
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          <span className="font-semibold text-xs whitespace-nowrap">앱 설치</span>
        </button>
      </div>

      {/* iOS Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center relative">
            <button 
              onClick={() => setShowIOSPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">아이폰/아이패드 앱 설치</h3>
            <p className="text-gray-600 mb-6 text-sm">
              아이폰 및 아이패드에서는 사파리 브라우저의 아래쪽 <strong>공유</strong> 버튼을 통해 설치할 수 있습니다.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex flex-col gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold">1</span>
                <span>화면 아래의 <Share size={16} className="inline mx-1 text-blue-500" /> 공유 버튼을 누르세요.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold">2</span>
                <span><strong>'홈 화면에 추가'</strong>를 선택하세요.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold">3</span>
                <span>오른쪽 위의 <strong>'추가'</strong>를 누르세요.</span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
