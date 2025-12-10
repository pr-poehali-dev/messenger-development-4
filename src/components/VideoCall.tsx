import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type VideoCallProps = {
  contactName: string;
  onClose: () => void;
};

export const VideoCall = ({ contactName, onClose }: VideoCallProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 2000);

    const durationTimer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    startLocalVideo();

    return () => {
      clearTimeout(timer);
      clearInterval(durationTimer);
      stopLocalVideo();
    };
  }, []);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopLocalVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="absolute top-6 left-6 z-10 flex items-center space-x-4">
        <h2 className="text-white text-xl font-medium">{contactName}</h2>
        <div className="text-white/70 text-sm">
          {isConnecting ? 'Соединение...' : formatDuration(callDuration)}
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          {isConnecting ? (
            <div className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {contactName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <p className="text-white/70">Подключение...</p>
            </div>
          ) : (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23374151' width='400' height='400'/%3E%3C/svg%3E"
            />
          )}
        </div>

        <div className="absolute bottom-24 right-6 w-48 h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
          {isVideoOff ? (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  ВЫ
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}
        </div>
      </div>

      <div className="p-8 flex justify-center items-center space-x-6">
        <Button
          size="lg"
          variant="secondary"
          className={`rounded-full w-14 h-14 ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={toggleMute}
        >
          <Icon name={isMuted ? 'MicOff' : 'Mic'} size={24} className="text-white" />
        </Button>

        <Button
          size="lg"
          variant="secondary"
          className={`rounded-full w-14 h-14 ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={toggleVideo}
        >
          <Icon name={isVideoOff ? 'VideoOff' : 'Video'} size={24} className="text-white" />
        </Button>

        <Button
          size="lg"
          className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
          onClick={onClose}
        >
          <Icon name="PhoneOff" size={28} className="text-white" />
        </Button>

        <Button
          size="lg"
          variant="secondary"
          className="rounded-full w-14 h-14 bg-gray-700 hover:bg-gray-600"
        >
          <Icon name="MoreVertical" size={24} className="text-white" />
        </Button>
      </div>
    </div>
  );
};
