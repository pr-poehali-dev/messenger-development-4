import { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

type QRCodeProps = {
  userId: string;
  userName: string;
  onClose: () => void;
};

export const QRCode = ({ userId, userName, onClose }: QRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [userId]);

  const generateQRCode = async () => {
    if (!canvasRef.current || !userId) return;

    try {
      await QRCodeLib.toCanvas(canvasRef.current, userId, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
    } catch (err) {
      console.error('QR Code generation error:', err);
    }
  };

  const handleShare = async () => {
    if (canvasRef.current) {
      try {
        const blob = await new Promise<Blob>((resolve) => {
          canvasRef.current!.toBlob((blob) => resolve(blob!), 'image/png');
        });
        
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        
        if (navigator.share) {
          await navigator.share({
            title: 'Мой QR-код What\'s ok',
            text: `Добавь меня в What's ok: ${userName}`,
            files: [file]
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'whatsok-qrcode.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error('Share error:', err);
      }
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'whatsok-qrcode.png';
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md m-4 p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Мой QR-код</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6">
          {userId ? (
            <canvas
              ref={canvasRef}
              width={256}
              height={256}
              className="w-full h-auto"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center">
              <div className="text-center">
                <Icon name="AlertCircle" size={48} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">ID пользователя не найден</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <p className="font-semibold text-lg mb-1">{userName}</p>
          <p className="text-sm text-muted-foreground">ID: {userId || 'Не задан'}</p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleShare}
            className="w-full"
            disabled={!userId}
          >
            <Icon name="Share2" size={18} />
            Поделиться QR-кодом
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="w-full"
            disabled={!userId}
          >
            <Icon name="Download" size={18} />
            Сохранить изображение
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Покажите этот QR-код друзьям, чтобы они могли быстро добавить вас в контакты
        </p>
      </div>
    </div>
  );
};