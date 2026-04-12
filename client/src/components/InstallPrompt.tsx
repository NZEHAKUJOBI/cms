import { useState, useEffect } from 'react';
import { X, Share2 } from 'lucide-react';

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = sessionStorage.getItem('pwa-dismissed');

    setIsIOS(ios);

    if (!standalone && !dismissed) {
      // Delay slightly so it doesn't clash with page load
      const t = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed z-50 left-3 right-3 bg-blue-900 text-white rounded-2xl shadow-2xl p-4"
      style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-blue-300 hover:text-white p-1"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-3 pr-6">
        <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          Rx
        </div>
        <div>
          <p className="font-semibold text-sm mb-0.5">Install PSCMS App</p>
          {isIOS ? (
            <p className="text-blue-200 text-xs leading-relaxed">
              Tap <Share2 size={11} className="inline mx-0.5 -mt-0.5" /> then{' '}
              <strong className="text-white">"Add to Home Screen"</strong> for quick access offline.
            </p>
          ) : (
            <p className="text-blue-200 text-xs leading-relaxed">
              Tap <strong className="text-white">Install</strong> in your browser's menu to add this app to your home screen.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
