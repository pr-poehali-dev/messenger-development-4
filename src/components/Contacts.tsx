import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS, apiRequest } from '@/config/api';

type Contact = {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
  isPhoneContact?: boolean;
};

type ContactsProps = {
  onChatStart: (contactId: number) => void;
  onNewChat?: (name: string, phone: string, contactId: number) => void;
  userPhone: string;
  userId: string;
  refreshTrigger?: number;
};

export const Contacts = ({ onChatStart, onNewChat, userPhone, userId, refreshTrigger }: ContactsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [phoneContacts, setPhoneContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);

  useEffect(() => {
    loadContacts();
    checkContactsPermission();
  }, [userPhone, refreshTrigger]);

  const checkContactsPermission = () => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      setHasContactsPermission(true);
    }
  };

  const loadPhoneContacts = async () => {
    try {
      console.log('Requesting phone contacts access...');
      
      if (!('contacts' in navigator) || !('ContactsManager' in window)) {
        alert('Ваш браузер не поддерживает доступ к контактам.\n\nИспользуйте Chrome на Android или Safari на iOS.');
        return;
      }
      
      const props = ['name', 'tel'];
      const opts = { multiple: true };
      
      const contactsFromPhone = await (navigator as any).contacts.select(props, opts);
      
      console.log('Selected contacts:', contactsFromPhone.length);
      
      const formatted: Contact[] = contactsFromPhone.map((contact: any, index: number) => ({
        id: -1 - index,
        name: contact.name?.[0] || 'Без имени',
        phone: contact.tel?.[0] || '',
        avatar: '',
        online: false,
        isPhoneContact: true
      }));
      
      setPhoneContacts(formatted);
    } catch (err: any) {
      console.error('Failed to load phone contacts:', err);
      if (err.name === 'NotSupportedError') {
        alert('Доступ к контактам не поддерживается на этом устройстве');
      } else if (err.name === 'NotAllowedError') {
        console.log('User cancelled contact picker');
      } else {
        alert('Не удалось загрузить контакты: ' + err.message);
      }
    }
  };

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest(API_ENDPOINTS.contacts, {
        method: 'GET'
      }, userId);
      
      const formattedContacts: Contact[] = (data.contacts || []).map((contact: any) => ({
        id: contact.id,
        name: contact.name || contact.phone,
        phone: contact.phone,
        avatar: contact.avatar || '',
        online: contact.online || false,
        lastSeen: contact.last_seen
      }));
      
      setContacts(formattedContacts);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const allContacts = [...contacts, ...phoneContacts];
  
  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const onlineContacts = filteredContacts.filter(c => c.online && !c.isPhoneContact);
  const offlineContacts = filteredContacts.filter(c => !c.online && !c.isPhoneContact);
  const phoneContactsList = filteredContacts.filter(c => c.isPhoneContact);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 space-y-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Контакты</h1>
          {hasContactsPermission && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl"
              onClick={loadPhoneContacts}
              title="Загрузить контакты телефона"
            >
              <Icon name="Smartphone" size={20} />
            </Button>
          )}
        </div>

        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск контактов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{allContacts.length} контактов</span>
          <span>{onlineContacts.length} онлайн</span>
        </div>
        
        {hasContactsPermission && phoneContacts.length === 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={loadPhoneContacts}
          >
            <Icon name="Smartphone" size={16} />
            Показать контакты телефона
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Icon name="Users" size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Контактов пока нет</p>
              <p className="text-sm text-muted-foreground mt-1">
                Добавьте друзей через поиск или QR-код
              </p>
            </div>
          ) : (
            <>
              {onlineContacts.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                    ОНЛАЙН ({onlineContacts.length})
                  </div>
                  {onlineContacts.map(contact => (
                    <ContactItem
                      key={contact.id}
                      contact={contact}
                      onChatStart={onChatStart}
                    />
                  ))}
                </>
              )}

              {offlineContacts.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground mt-4">
                    ВСЕ КОНТАКТЫ ({offlineContacts.length})
                  </div>
                  {offlineContacts.map(contact => (
                    <ContactItem
                      key={contact.id}
                      contact={contact}
                      onChatStart={onChatStart}
                    />
                  ))}
                </>
              )}
              
              {phoneContactsList.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground mt-4">
                    КОНТАКТЫ ТЕЛЕФОНА ({phoneContactsList.length})
                  </div>
                  {phoneContactsList.map(contact => (
                    <PhoneContactItem
                      key={contact.id}
                      contact={contact}
                      onNewChat={onNewChat}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const ContactItem = ({ contact, onChatStart }: { contact: Contact; onChatStart: (id: number) => void }) => {
  return (
    <div className="w-full p-3 rounded-xl mb-1 flex items-center justify-between hover:bg-muted transition-colors group">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/20 text-primary font-medium">
              {contact.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {contact.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{contact.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {contact.online ? 'В сети' : contact.lastSeen || 'Был(а) давно'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-9 w-9"
          onClick={() => onChatStart(contact.id)}
        >
          <Icon name="MessageCircle" size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-9 w-9"
        >
          <Icon name="Phone" size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-9 w-9"
        >
          <Icon name="Video" size={18} />
        </Button>
      </div>
    </div>
  );
};

const PhoneContactItem = ({ contact, onNewChat }: { contact: Contact; onNewChat?: (name: string, phone: string, contactId: number) => void }) => {
  const handleMessage = () => {
    if (onNewChat) {
      onNewChat(contact.name, contact.phone, contact.id);
    }
  };

  return (
    <div className="w-full p-3 rounded-xl mb-1 flex items-center justify-between hover:bg-muted/50 transition-colors group">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-muted text-muted-foreground font-medium">
            {contact.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{contact.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{contact.phone}</p>
        </div>
      </div>

      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-9 w-9"
          onClick={handleMessage}
        >
          <Icon name="MessageCircle" size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-9 w-9"
          title="Пригласить в мессенджер"
        >
          <Icon name="UserPlus" size={18} />
        </Button>
      </div>
    </div>
  );
};