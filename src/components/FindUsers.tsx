import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QRScanner } from '@/components/QRScanner';
import { QRCode } from '@/components/QRCode';
import { API_ENDPOINTS, apiRequest } from '@/config/api';

type User = {
  id: number;
  name: string;
  phone: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
};

type FindUsersProps = {
  onAddContact: (userId: number) => void;
  onClose: () => void;
  currentUserId?: string;
  currentUserName?: string;
};

export const FindUsers = ({ onAddContact, onClose, currentUserId = '1', currentUserName = 'Вы' }: FindUsersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedUsers, setAddedUsers] = useState<Set<number>>(new Set());
  const [showScanner, setShowScanner] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const data = await apiRequest(
        `${API_ENDPOINTS.users}?query=${encodeURIComponent(searchQuery)}`,
        { method: 'GET' },
        currentUserId
      );
      
      const formattedUsers: User[] = (data.users || []).map((user: any) => ({
        id: user.id,
        name: user.name || user.phone,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline || false
      }));
      
      setSearchResults(formattedUsers);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUser = (userId: number) => {
    onAddContact(userId);
    setAddedUsers(new Set(addedUsers).add(userId));
  };

  const handleQRScan = (scannedUserId: string) => {
    const userId = parseInt(scannedUserId);
    if (!isNaN(userId)) {
      handleAddUser(userId);
    }
    setShowScanner(false);
  };

  const handleCopyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/?invite=${currentUserId}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setShowInviteLink(true);
      setTimeout(() => setShowInviteLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (showScanner) {
    return <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />;
  }

  if (showQRCode) {
    return <QRCode userId={currentUserId} userName={currentUserName} onClose={() => setShowQRCode(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[80vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Найти пользователей</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Поиск по имени, номеру телефона или описанию
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Имя, телефон или интересы..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <Icon name="Loader2" size={18} className="animate-spin" />
                ) : (
                  <Icon name="Search" size={18} />
                )}
                Найти
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowScanner(true)}
                variant="outline"
                className="flex-1"
              >
                <Icon name="QrCode" size={18} />
                Сканировать QR
              </Button>
              <Button
                onClick={() => setShowQRCode(true)}
                variant="outline"
                className="flex-1"
              >
                <Icon name="QrCode" size={18} />
                Мой QR-код
              </Button>
            </div>
            
            <div className="relative">
              <Button
                onClick={handleCopyInviteLink}
                variant="default"
                className="w-full"
              >
                <Icon name="Link" size={18} />
                Пригласить в мессенджер
              </Button>
              {showInviteLink && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-primary text-primary-foreground text-sm rounded-lg text-center animate-fade-in">
                  ✓ Ссылка скопирована
                </div>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {searchResults.length === 0 && !isSearching && searchQuery && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Icon name="SearchX" size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Пользователи не найдены</p>
              <p className="text-sm text-muted-foreground mt-1">
                Попробуйте изменить запрос
              </p>
            </div>
          )}

          {searchResults.length === 0 && !searchQuery && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Users" size={32} className="text-primary" />
              </div>
              <p className="text-muted-foreground">Начните поиск</p>
              <p className="text-sm text-muted-foreground mt-1">
                Введите имя, номер телефона или интересы
              </p>
            </div>
          )}

          <div className="space-y-2">
            {searchResults.map((user) => {
              const isAdded = addedUsers.has(user.id);
              
              return (
                <div
                  key={user.id}
                  className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-14 h-14">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/20 text-primary font-medium text-lg">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold truncate">{user.name}</h3>
                        {user.isOnline && (
                          <span className="text-xs text-green-500 font-medium">Онлайн</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">{user.bio}</p>
                      )}
                    </div>

                    {isAdded ? (
                      <Button variant="outline" size="sm" disabled>
                        <Icon name="Check" size={16} />
                        Добавлен
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => handleAddUser(user.id)}
                      >
                        <Icon name="UserPlus" size={16} />
                        Добавить
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {searchResults.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              Найдено пользователей: {searchResults.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};