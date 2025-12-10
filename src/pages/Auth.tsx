import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS, apiRequest } from '@/config/api';

type AuthProps = {
  onAuthComplete: (phone: string, name: string, userId: number) => void;
};

const Auth = ({ onAuthComplete }: AuthProps) => {
  const [step, setStep] = useState<'phone' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+${digits}`;
    if (digits.length <= 4) return `+${digits.slice(0, 1)} (${digits.slice(1)}`;
    if (digits.length <= 7) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length < 11) {
      setError('Введите корректный номер телефона');
      return;
    }
    
    setError('');
    setStep('profile');
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (err) {
      console.error('Failed to get IP:', err);
      return 'unknown';
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 2) {
      setError('Имя должно содержать минимум 2 символа');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const ipAddress = await getClientIP();
      
      const response = await apiRequest(API_ENDPOINTS.auth, {
        method: 'POST',
        body: JSON.stringify({ phone, name, ipAddress }),
      });
      
      onAuthComplete(phone, name, response.id);
    } catch (err) {
      setError('Ошибка подключения к серверу');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-2xl border border-border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageCircle" size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">What's ok</h1>
          <p className="text-muted-foreground">
            {step === 'phone' && 'Введите номер телефона для входа'}
            {step === 'profile' && 'Заполните профиль'}
          </p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Номер телефона</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+7 (999) 123-45-67"
                className="text-lg"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              Продолжить
            </Button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ваше имя</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                className="text-lg"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  Подключение...
                </>
              ) : (
                'Начать общение'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('phone');
                setName('');
                setError('');
              }}
            >
              Изменить номер
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Номер: {phone}
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;