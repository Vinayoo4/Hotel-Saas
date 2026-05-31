import { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-800 text-white p-4 rounded shadow-lg z-50 flex items-center gap-4">
      <div>
        <p className="font-bold">Install EcoWise</p>
        <p className="text-sm">Get the app on your device for easier access.</p>
      </div>
      <button
        onClick={handleInstallClick}
        className="bg-white text-green-800 px-3 py-1 rounded font-semibold hover:bg-gray-100"
      >
        Install
      </button>
      <button
        onClick={() => setShowPrompt(false)}
        className="text-white hover:text-gray-200"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default InstallPrompt;
