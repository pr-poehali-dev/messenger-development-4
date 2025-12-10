import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const APP_VERSION = '1.0.0';
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000;

export const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    checkForUpdates();
    
    const interval = setInterval(() => {
      checkForUpdates();
    }, VERSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const response = await fetch('/version.json?t=' + Date.now());
      const data = await response.json();
      
      const storedVersion = localStorage.getItem('app_version');
      
      if (storedVersion && storedVersion !== data.version) {
        setShowUpdate(true);
      }
      
      if (!storedVersion) {
        localStorage.setItem('app_version', APP_VERSION);
      }
    } catch (error) {
      console.log('Version check failed:', error);
    }
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    localStorage.setItem('app_version', APP_VERSION);
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="RefreshCw" size={20} className="text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">Доступно обновление</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Новая версия приложения готова к установке
            </p>
            
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Обновление...
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={16} />
                    Обновить
                  </>
                )}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleDismiss}
                disabled={isUpdating}
              >
                Позже
              </Button>
            </div>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 flex-shrink-0"
            onClick={handleDismiss}
            disabled={isUpdating}
          >
            <Icon name="X" size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
