import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const AuthGate = ({ children, user }) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg animate-slide-up z-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Install App</h3>
              <p className="text-sm opacity-90">Add to your home screen for quick access</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-3 py-1 text-sm bg-blue-700 rounded hover:bg-blue-800"
              >
                Later
              </button>
              <button
                onClick={handleInstallClick}
                className="px-3 py-1 text-sm bg-white text-blue-600 rounded hover:bg-gray-100"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthGate;
