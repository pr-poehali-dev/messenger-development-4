import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

type QRScannerProps = {
  onScan: (userId: string) => void;
  onClose: () => void;
};

export const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          setScannedData(result.data);
          onScan(result.data);
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setHasCamera(true);
      setIsScanning(true);
    } catch (err) {
      console.error('QR Scanner error:', err);
      setHasCamera(false);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const handleManualInput = () => {
    const userId = prompt('Введите ID пользователя:');
    if (userId) {
      onScan(userId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="h-16 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-xl"
        >
          <Icon name="X" size={20} />
        </Button>
        <h2 className="text-lg font-semibold">Сканировать QR-код</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleManualInput}
          className="rounded-xl"
        >
          <Icon name="Keyboard" size={20} />
        </Button>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {hasCamera ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 border-2 border-primary rounded-3xl" />
                
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  {isScanning && (
                    <div className="w-full h-1 bg-primary/50 animate-scan" />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Icon name="CameraOff" size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Камера недоступна</h3>
            <p className="text-muted-foreground mb-6">
              Разрешите доступ к камере в настройках браузера
            </p>
            <Button onClick={startScanner}>
              <Icon name="Camera" size={18} />
              Попробовать снова
            </Button>
          </div>
        )}
      </div>

      <div className="bg-background/95 backdrop-blur border-t border-border p-6">
        <div className="max-w-md mx-auto text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Наведите камеру на QR-код друга для добавления в контакты
          </p>
          <Button
            variant="outline"
            onClick={handleManualInput}
            className="w-full"
          >
            <Icon name="Hash" size={18} />
            Ввести ID вручную
          </Button>
        </div>
      </div>
    </div>
  );
};