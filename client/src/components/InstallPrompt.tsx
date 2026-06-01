import { useState, useEffect, useRef } from 'react';
import { X, Share2, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const dismissed = localStorage.getItem('pwa-dismissed');

    setIsIOS(ios);

    if (standalone || dismissed) return;

    // Chrome / Edge / Android: capture the native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari: no beforeinstallprompt — show manual instructions after delay
    if (ios) {
      const t = setTimeout(() => setShow(true), 3000);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem('pwa-dismissed', '1');
    setShow(false);
  };

  const install = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt.current = null;
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed z-50 left-3 right-3 bg-blue-900 text-white rounded-2xl shadow-2xl p-4"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)' }}
      role="dialog"
      aria-label="Install app prompt"
    >
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-blue-300 hover:text-white p-1 rounded-full hover:bg-blue-800 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-3 pr-6">
        {/* App icon */}
        <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-inner">
          Rx
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-0.5">Install PSCMS App</p>

          {isIOS ? (
            /* iOS: manual "Add to Home Screen" instructions */
            <p className="text-blue-200 text-xs leading-relaxed">
              Tap{' '}
              <Share2 size={11} className="inline mx-0.5 -mt-0.5" />{' '}
              then <strong className="text-white">"Add to Home Screen"</strong> for quick, offline access.
            </p>
          ) : deferredPrompt.current ? (
            /* Android / Chrome / Edge: native install button */
            <p className="text-blue-200 text-xs leading-relaxed">
              Install for fast, offline access — no app store needed.
            </p>
          ) : (
            /* Fallback: browser-menu instruction */
            <p className="text-blue-200 text-xs leading-relaxed">
              Open your browser menu and tap{' '}
              <strong className="text-white">"Add to Home Screen"</strong>.
            </p>
          )}
        </div>
      </div>

      {/* Native install button for supporting browsers */}
      {!isIOS && deferredPrompt.current && (
        <button
          onClick={install}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-white text-blue-900 font-semibold text-sm py-2 px-4 rounded-xl hover:bg-blue-50 active:scale-95 transition-all"
        >
          <Download size={15} />
          Install App
        </button>
      )}
    </div>
  );
}
