import { useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type NotificationProps = {
  title: string;
  message: string;
  avatar?: string;
  onClose: () => void;
};

export const Notification = ({ title, message, avatar, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: avatar || '/favicon.svg',
    });
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-card border border-border rounded-xl shadow-2xl p-4 min-w-[320px] animate-fade-in">
      <div className="flex items-start space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/20 text-primary">
            {title[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{title}</h4>
          <p className="text-sm text-muted-foreground truncate">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};
