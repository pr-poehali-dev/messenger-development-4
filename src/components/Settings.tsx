import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

type SettingsProps = {
  userName: string;
  userPhone: string;
  userAvatar?: string;
  onUpdateProfile: (name: string, avatar?: string) => void;
  onLogout: () => void;
};

export const Settings = ({ userName, userPhone, userAvatar, onUpdateProfile, onLogout }: SettingsProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [tempAvatar, setTempAvatar] = useState<string | undefined>(userAvatar);

  const handleSaveName = () => {
    if (newName.trim().length >= 2) {
      onUpdateProfile(newName, tempAvatar);
      setIsEditingName(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setTempAvatar(result);
        onUpdateProfile(newName, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setTempAvatar(undefined);
    onUpdateProfile(newName, undefined);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-2">Настройки</h1>
        <p className="text-sm text-muted-foreground">Управление профилем и приложением</p>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6 space-y-6">
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Icon name="User" size={20} className="text-primary" />
            <span>Профиль</span>
          </h2>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                {tempAvatar ? (
                  <AvatarImage src={tempAvatar} alt={userName} />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 shadow-lg"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <Icon name="Camera" size={16} />
              </Button>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">Фото профиля</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Icon name="Upload" size={16} />
                  Загрузить
                </Button>
                {tempAvatar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                  >
                    <Icon name="Trash2" size={16} />
                    Удалить
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Имя</label>
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="icon" onClick={handleSaveName}>
                    <Icon name="Check" size={18} />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setNewName(userName);
                      setIsEditingName(false);
                    }}
                  >
                    <Icon name="X" size={18} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span>{userName}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Icon name="Pencil" size={18} />
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Номер телефона</label>
              <div className="p-3 rounded-lg bg-muted flex items-center justify-between">
                <span>{userPhone}</span>
                <Icon name="Lock" size={18} className="text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Номер телефона нельзя изменить
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Icon name="Bell" size={20} className="text-primary" />
            <span>Уведомления</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
              <div>
                <p className="font-medium">Звук уведомлений</p>
                <p className="text-sm text-muted-foreground">Воспроизводить звук при новых сообщениях</p>
              </div>
              <Button variant="outline" size="sm">
                Вкл
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
              <div>
                <p className="font-medium">Показ превью</p>
                <p className="text-sm text-muted-foreground">Показывать текст сообщения в уведомлении</p>
              </div>
              <Button variant="outline" size="sm">
                Вкл
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Icon name="Shield" size={20} className="text-primary" />
            <span>Приватность</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
              <div>
                <p className="font-medium">Последнее посещение</p>
                <p className="text-sm text-muted-foreground">Кто может видеть, когда вы были онлайн</p>
              </div>
              <Button variant="outline" size="sm">
                Все
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
              <div>
                <p className="font-medium">Фото профиля</p>
                <p className="text-sm text-muted-foreground">Кто может видеть ваше фото</p>
              </div>
              <Button variant="outline" size="sm">
                Все
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Icon name="Info" size={20} className="text-primary" />
            <span>О приложении</span>
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2">
              <span className="text-muted-foreground">Версия</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="text-muted-foreground">Платформа</span>
              <span className="font-medium">Web</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <Icon name="RefreshCw" size={18} />
            Проверить обновления
          </Button>
        </div>

        <Button
          variant="destructive"
          className="w-full"
          size="lg"
          onClick={onLogout}
        >
          <Icon name="LogOut" size={20} />
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
};