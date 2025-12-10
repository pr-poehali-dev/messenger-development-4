import { useEffect, useRef } from 'react';
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

  const generateQRCode = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 256;
    const cellSize = size / 25;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    
    const pattern = generatePattern(userId);
    
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if (pattern[i][j]) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }
  };

  const generatePattern = (data: string): boolean[][] => {
    const size = 25;
    const pattern: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
    
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          pattern[i][j] = true;
          pattern[i][size - 1 - j] = true;
          pattern[size - 1 - i][j] = true;
        }
      }
    }
    
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash = hash & hash;
    }
    
    for (let i = 8; i < size - 8; i++) {
      for (let j = 8; j < size - 8; j++) {
        hash = (hash * 1103515245 + 12345) & 0x7fffffff;
        pattern[i][j] = (hash % 2) === 0;
      }
    }
    
    return pattern;
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
          <canvas
            ref={canvasRef}
            width={256}
            height={256}
            className="w-full h-auto"
          />
        </div>

        <div className="text-center mb-6">
          <p className="font-semibold text-lg mb-1">{userName}</p>
          <p className="text-sm text-muted-foreground">ID: {userId}</p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleShare}
            className="w-full"
          >
            <Icon name="Share2" size={18} />
            Поделиться QR-кодом
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="w-full"
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
