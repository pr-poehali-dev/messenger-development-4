import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type VoiceCallProps = {
  contactName: string;
  onClose: () => void;
};

export const VoiceCall = ({ contactName, onClose }: VoiceCallProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 2000);

    const durationTimer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(durationTimer);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/90 to-primary z-50 flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <Avatar className="w-32 h-32 mx-auto">
          <AvatarFallback className="bg-white text-primary text-4xl">
            {contactName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-white text-2xl font-medium mb-2">{contactName}</h2>
          <p className="text-white/70">
            {isConnecting ? 'Соединение...' : formatDuration(callDuration)}
          </p>
        </div>

        <div className="flex justify-center items-center space-x-6 pt-12">
          <Button
            size="lg"
            variant="secondary"
            className={`rounded-full w-16 h-16 ${isSpeaker ? 'bg-white text-primary' : 'bg-white/20 text-white'}`}
            onClick={() => setIsSpeaker(!isSpeaker)}
          >
            <Icon name="Volume2" size={28} />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className={`rounded-full w-16 h-16 ${isMuted ? 'bg-red-500' : 'bg-white/20'} text-white`}
            onClick={() => setIsMuted(!isMuted)}
          >
            <Icon name={isMuted ? 'MicOff' : 'Mic'} size={28} />
          </Button>

          <Button
            size="lg"
            className="rounded-full w-20 h-20 bg-red-500 hover:bg-red-600"
            onClick={onClose}
          >
            <Icon name="PhoneOff" size={32} className="text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};
