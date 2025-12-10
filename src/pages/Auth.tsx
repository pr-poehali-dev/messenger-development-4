import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

type AuthProps = {
  onAuthComplete: (phone: string, name: string) => void;
};

const Auth = ({ onAuthComplete }: AuthProps) => {
  const [step, setStep] = useState<'phone' | 'code' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

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
    setStep('code');
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }
    
    setError('');
    setStep('profile');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 2) {
      setError('Имя должно содержать минимум 2 символа');
      return;
    }
    
    onAuthComplete(phone, name);
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
            {step === 'phone' && 'Введите номер телефона'}
            {step === 'code' && 'Введите код подтверждения'}
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
              Получить код
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Мы отправим SMS с кодом подтверждения на указанный номер
            </p>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Код из SMS</label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="text-lg text-center tracking-widest"
                maxLength={6}
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
              Подтвердить
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('phone');
                setCode('');
                setError('');
              }}
            >
              Изменить номер
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Код отправлен на {phone}
            </p>
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

            <Button type="submit" className="w-full" size="lg">
              Начать общение
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Это имя будут видеть ваши контакты
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
