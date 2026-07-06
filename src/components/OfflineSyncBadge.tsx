import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineSyncBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [showNotification, setShowNotification] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      setStatusMessage('Syncing Offline Entries...');
      setShowNotification(true);

      // Simulate fast background server sync
      setTimeout(() => {
        setSyncStatus('synced');
        setStatusMessage('All Offline Entries Synced!');
        setTimeout(() => {
          setShowNotification(false);
        }, 3500);
      }, 1800);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
      setStatusMessage('Offline Mode — Local Queue Active');
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={`px-3.5 py-2 rounded-full shadow-lg border text-xs font-bold flex items-center space-x-2 backdrop-blur-md transition-all ${
          !isOnline
            ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
            : syncStatus === 'syncing'
            ? 'bg-blue-950/90 text-blue-300 border-blue-500/40'
            : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
        }`}
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{statusMessage}</span>
          </>
        ) : syncStatus === 'syncing' ? (
          <>
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
            <span>{statusMessage}</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </>
        )}
      </div>
    </div>
  );
};
