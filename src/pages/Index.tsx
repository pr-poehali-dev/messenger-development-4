import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS, apiRequest } from '@/config/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { VideoCall } from '@/components/VideoCall';
import { VoiceCall } from '@/components/VoiceCall';
import { Stories } from '@/components/Stories';
import { MessageActions } from '@/components/MessageActions';
import { EmojiPicker } from '@/components/EmojiPicker';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Contacts } from '@/components/Contacts';
import { Settings } from '@/components/Settings';
import { UpdateNotification } from '@/components/UpdateNotification';
import { FindUsers } from '@/components/FindUsers';
import { toast } from '@/hooks/use-toast';

type Chat = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup?: boolean;
  membersCount?: number;
};

type Message = {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
  isVoice?: boolean;
  voiceDuration?: string;
  isFile?: boolean;
  fileName?: string;
  fileSize?: string;
  reactions?: { emoji: string; count: number }[];
  replyTo?: { id: number; text: string; sender: string };
  isEdited?: boolean;
  isForwarded?: boolean;
  forwardedFrom?: string;
};

type Story = {
  id: number;
  userId: number;
  userName: string;
  avatar: string;
  hasViewed: boolean;
};

type IndexProps = {
  userName?: string;
  userAvatar?: string;
  userPhone: string;
  userId: string;
  onUpdateProfile: (name: string, avatar?: string) => void;
  onLogout: () => void;
  onSwitchAccount?: (phone: string) => void;
  onAddAccount?: () => void;
};

const Index = ({ userName = 'Вы', userAvatar, userPhone, userId, onUpdateProfile, onLogout, onSwitchAccount, onAddAccount }: IndexProps) => {
  const [activeSection, setActiveSection] = useState<'chats' | 'contacts' | 'archive' | 'profile' | 'settings'>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showStories, setShowStories] = useState(true);
  const [showFindUsers, setShowFindUsers] = useState(false);
  const [contactsRefreshTrigger, setContactsRefreshTrigger] = useState(0);
  const [newChatContact, setNewChatContact] = useState<{ name: string; phone: string; contactId?: number } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const chats: Chat[] = [];

  const stories: Story[] = [];

  const loadMessages = useCallback(async () => {
    if (!selectedChat && !newChatContact) return;
    if (!userId) {
      console.warn('Cannot load messages: userId is empty');
      setMessages([]);
      return;
    }
    
    setIsLoadingMessages(true);
    try {
      let url = API_ENDPOINTS.messages;
      
      if (currentChatId) {
        url += `?chatId=${currentChatId}`;
      } else if (newChatContact?.contactId) {
        url += `?contactId=${newChatContact.contactId}`;
      } else if (selectedChat) {
        url += `?contactId=${selectedChat}`;
      }
      
      const response = await apiRequest(url, { method: 'GET' }, userId);
      
      if (response.chatId) {
        setCurrentChatId(response.chatId);
      }
      
      const loadedMessages: Message[] = (response.messages || []).map((msg: any) => {
        const msgTime = new Date(msg.createdAt);
        const timeString = `${msgTime.getHours()}:${msgTime.getMinutes().toString().padStart(2, '0')}`;
        
        return {
          id: msg.id,
          text: msg.text || '',
          time: timeString,
          isOwn: msg.isOwn,
          isVoice: msg.isVoice,
          voiceDuration: msg.voiceDuration,
          isFile: msg.isFile,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          isEdited: msg.isEdited,
          isForwarded: msg.isForwarded,
          forwardedFrom: msg.forwardedFrom,
          replyTo: msg.replyToId ? { id: msg.replyToId, text: '', sender: '' } : undefined,
        };
      });
      
      setMessages(loadedMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [selectedChat, newChatContact, currentChatId, userId]);

  useEffect(() => {
    if (selectedChat || newChatContact) {
      loadMessages();
    }
  }, [selectedChat, newChatContact, loadMessages]);

  const handleSendMessage = async () => {
    console.log('handleSendMessage START', { messageInput, trimmed: messageInput.trim(), userId });
    if (!messageInput.trim()) {
      console.log('Message input is empty, returning');
      return;
    }
    if (!userId) {
      console.warn('Cannot send message: userId is empty');
      toast({
        title: "Ошибка авторизации",
        description: "Пожалуйста, выйдите и войдите заново",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    console.log('handleSendMessage called', { selectedChat, newChatContact, currentChatId, messagesCount: messages.length });
    
    const currentTime = new Date();
    const timeString = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    if (editingMessage) {
      try {
        await apiRequest(API_ENDPOINTS.messages, {
          method: 'PUT',
          body: JSON.stringify({ messageId: editingMessage.id, text: messageInput })
        }, userId);
        
        setMessages(messages.map(msg => 
          msg.id === editingMessage.id 
            ? { ...msg, text: messageInput, isEdited: true }
            : msg
        ));
        setEditingMessage(null);
        setMessageInput('');
      } catch (err) {
        console.error('Failed to edit message:', err);
      }
      return;
    }
    
    const chatName = newChatContact ? newChatContact.name : (currentChat?.name || '');
    const tempId = Date.now();
    const messageText = messageInput;
    const currentReplyTo = replyingTo;
    
    const optimisticMessage: Message = {
      id: tempId,
      text: messageText,
      time: timeString,
      isOwn: true,
      replyTo: currentReplyTo ? { id: currentReplyTo.id, text: currentReplyTo.text, sender: currentReplyTo.isOwn ? 'Вы' : chatName } : undefined,
    };
    
    console.log('Adding optimistic message:', optimisticMessage);
    setMessages([...messages, optimisticMessage]);
    setMessageInput('');
    setReplyingTo(null);
    
    console.log('Messages after adding optimistic:', messages.length + 1);
    
    try {
      const body: any = { text: messageText };
      
      if (currentChatId) {
        body.chatId = currentChatId;
      } else if (newChatContact?.contactId) {
        body.contactId = newChatContact.contactId;
      } else if (selectedChat) {
        body.contactId = selectedChat;
      }
      
      if (currentReplyTo) {
        body.replyToId = currentReplyTo.id;
      }
      
      const response = await apiRequest(API_ENDPOINTS.messages, {
        method: 'POST',
        body: JSON.stringify(body)
      }, userId);
      
      console.log('Message sent successfully, response:', response);
      
      if (response.chatId && !currentChatId) {
        setCurrentChatId(response.chatId);
      }
      
      if (newChatContact) {
        console.log('Clearing newChatContact');
        setNewChatContact(null);
      }
      
      setMessages(prevMessages => {
        const updated = prevMessages.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: response.id }
            : msg
        );
        console.log('Updated messages with real ID:', updated.length);
        return updated;
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId));
    }
  };

  const handleReaction = (messageId: number, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions?.map(r =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            ),
          };
        }
        return {
          ...msg,
          reactions: [...(msg.reactions || []), { emoji, count: 1 }],
        };
      }
      return msg;
    }));
    setShowEmojiPicker(null);
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await apiRequest(`${API_ENDPOINTS.messages}?messageId=${messageId}`, {
        method: 'DELETE'
      }, userId);
      
      setMessages(messages.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleForwardMessage = (messageId: number) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      const newMessage: Message = {
        ...msg,
        id: messages.length + 1,
        isForwarded: true,
        forwardedFrom: currentChat?.name || 'Unknown',
      };
      setMessages([...messages, newMessage]);
    }
    setSelectedMessage(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (type: 'image' | 'document' | 'video') => {
    const currentTime = new Date();
    const timeString = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    const fileNames = {
      image: 'Фото.jpg',
      document: 'Документ.pdf',
      video: 'Видео.mp4'
    };
    
    const fileSizes = {
      image: '2.4 МБ',
      document: '1.8 МБ',
      video: '15.3 МБ'
    };
    
    const newMessage: Message = {
      id: messages.length + 1,
      text: '',
      time: timeString,
      isOwn: true,
      isFile: true,
      fileName: fileNames[type],
      fileSize: fileSizes[type]
    };
    
    setMessages([...messages, newMessage]);
    setShowFileMenu(false);
  };

  const currentChat = chats.find(c => c.id === selectedChat);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarItems = [
    { id: 'chats', icon: 'MessageSquare', label: 'Чаты' },
    { id: 'contacts', icon: 'Users', label: 'Контакты' },
    { id: 'archive', icon: 'Archive', label: 'Архив' },
    { id: 'settings', icon: 'Settings', label: 'Настройки' },
  ];

  return (
    <>
      <UpdateNotification />
      {showFindUsers && (
        <FindUsers 
          onAddContact={async (contactUserId) => {
            try {
              console.log('Adding contact:', contactUserId, 'for user:', userId);
              
              await apiRequest(API_ENDPOINTS.contacts, {
                method: 'POST',
                body: JSON.stringify({ contactId: contactUserId })
              }, userId);
              
              console.log('Contact added successfully');
              
              toast({
                title: "Контакт добавлен",
                description: "Пользователь успешно добавлен в ваши контакты",
                duration: 3000,
              });
              
              setContactsRefreshTrigger(prev => prev + 1);
              setShowFindUsers(false);
            } catch (err) {
              console.error('Failed to add contact:', err);
              
              toast({
                title: "Ошибка",
                description: "Не удалось добавить контакт. Попробуйте снова.",
                variant: "destructive",
                duration: 3000,
              });
            }
          }}
          onClose={() => setShowFindUsers(false)}
          currentUserId={userId}
          currentUserName={userName}
        />
      )}
      {isVideoCall && currentChat && (
        <VideoCall 
          contactName={currentChat.name} 
          onClose={() => setIsVideoCall(false)} 
        />
      )}
      {isVoiceCall && currentChat && (
        <VoiceCall 
          contactName={currentChat.name} 
          onClose={() => setIsVoiceCall(false)} 
        />
      )}
      <div className="flex h-screen bg-background">
      <div className="w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 space-y-6">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Icon name="MessageCircle" size={24} className="text-primary-foreground" />
        </div>
        
        <Separator className="w-8" />
        
        <nav className="flex-1 flex flex-col space-y-4">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon name={item.icon as any} size={22} />
            </button>
          ))}
        </nav>

        <button 
          className="w-12 h-12 rounded-full overflow-hidden border-2 border-sidebar-border hover:border-primary transition-colors"
          onClick={() => setActiveSection('settings')}
        >
          <Avatar>
            {userAvatar ? (
              <AvatarImage src={userAvatar} alt={userName} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </button>
      </div>

      <div className="w-96 border-r border-border bg-card flex flex-col">
        {activeSection === 'chats' && showStories && stories.length > 0 && <Stories stories={stories} onStoryClick={() => {}} />}
        
        {activeSection === 'contacts' ? (
          <Contacts 
            userPhone={userPhone}
            userId={userId}
            refreshTrigger={contactsRefreshTrigger}
            onChatStart={(contactId) => {
              setSelectedChat(contactId);
              setCurrentChatId(null);
              setNewChatContact(null);
              setActiveSection('chats');
            }}
            onNewChat={(name, phone, contactId) => {
              setNewChatContact({ name, phone, contactId });
              setSelectedChat(null);
              setCurrentChatId(null);
              setActiveSection('chats');
            }}
          />
        ) : activeSection === 'settings' ? (
          <Settings 
            userName={userName} 
            userPhone={userPhone} 
            userAvatar={userAvatar}
            onUpdateProfile={onUpdateProfile}
            onLogout={onLogout}
          />
        ) : (
          <>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                  {activeSection === 'chats' ? 'Чаты' : activeSection === 'archive' ? 'Архив' : 'Настройки'}
                </h1>
            <div className="flex items-center space-x-2">
              <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl"
                onClick={() => setShowFindUsers(true)}
              >
                <Icon name="UserPlus" size={20} />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-input"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-3">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Icon name="MessageSquare" size={32} className="text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Нет чатов</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Начните общение, добавив контакты
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveSection('contacts')}
                  className="rounded-xl"
                >
                  <Icon name="Users" size={16} className="mr-2" />
                  Перейти к контактам
                </Button>
              </div>
            ) : (
              filteredChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-3 rounded-xl mb-1 flex items-center space-x-3 transition-all duration-200 ${
                    selectedChat === chat.id
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">
                        {chat.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>

                  {chat.unread > 0 && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs text-primary-foreground font-medium">{chat.unread}</span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
          </>
        )}
      </div>

      {activeSection === 'settings' ? null : selectedChat || newChatContact ? (
        <div className="flex-1 flex flex-col">
          <div className="h-20 border-b border-border px-6 flex items-center justify-between bg-card">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-11 h-11">
                  <AvatarFallback className="bg-primary/20 text-primary font-medium">
                    {newChatContact 
                      ? newChatContact.name.split(' ').map(n => n[0]).join('')
                      : currentChat?.isGroup ? <Icon name="Users" size={20} /> : currentChat?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {!newChatContact && !currentChat?.isGroup && currentChat?.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>
              <div>
                <h2 className="font-semibold">{newChatContact ? newChatContact.name : currentChat?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {newChatContact 
                    ? newChatContact.phone
                    : currentChat?.isGroup 
                      ? `${currentChat.membersCount} участников` 
                      : currentChat?.online ? 'В сети' : 'Был(а) недавно'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!newChatContact && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsVoiceCall(true)}
                  >
                    <Icon name="Phone" size={20} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsVideoCall(true)}
                  >
                    <Icon name="Video" size={20} />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Icon name="MoreVertical" size={20} />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 px-6 py-6">
            {newChatContact && messages.length === 0 && !isLoadingMessages && (
              <div className="text-center py-8 mb-4">
                <div className="w-24 h-24 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="MessageCircle" size={40} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Новый чат с {newChatContact.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {newChatContact.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  Напишите первое сообщение, чтобы начать общение
                </p>
              </div>
            )}
            <div className="space-y-4 max-w-3xl mx-auto">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
                </div>
              ) : messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} animate-fade-in group`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`max-w-md ${message.isOwn ? 'order-2' : 'order-1'} relative`}>
                    {message.isForwarded && (
                      <div className="text-xs text-muted-foreground mb-1 flex items-center space-x-1">
                        <Icon name="Forward" size={12} />
                        <span>Переслано от {message.forwardedFrom}</span>
                      </div>
                    )}
                    {message.replyTo && (
                      <div className={`mb-2 px-3 py-2 rounded-lg border-l-2 ${
                        message.isOwn ? 'border-primary-foreground/50 bg-primary-foreground/10' : 'border-primary bg-primary/10'
                      }`}>
                        <div className="text-xs font-medium">{message.replyTo.sender}</div>
                        <div className="text-xs opacity-70 truncate">{message.replyTo.text}</div>
                      </div>
                    )}
                    {message.isFile ? (
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        } flex items-center space-x-3 min-w-[200px]`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          message.isOwn ? 'bg-primary-foreground/20' : 'bg-background'
                        }`}>
                          <Icon name="File" size={20} className={message.isOwn ? 'text-primary-foreground' : 'text-foreground'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${message.isOwn ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {message.fileName}
                          </p>
                          <p className={`text-xs ${message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {message.fileSize}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`rounded-full h-8 w-8 ${
                            message.isOwn
                              ? 'hover:bg-primary-foreground/20 text-primary-foreground'
                              : 'hover:bg-background'
                          }`}
                        >
                          <Icon name="Download" size={16} />
                        </Button>
                      </div>
                    ) : message.isVoice ? (
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        } flex items-center space-x-3`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`rounded-full h-8 w-8 ${
                            message.isOwn
                              ? 'hover:bg-primary-foreground/20 text-primary-foreground'
                              : 'hover:bg-background'
                          }`}
                        >
                          <Icon name="Play" size={16} />
                        </Button>
                        <div className="flex-1">
                          <div className={`h-1 rounded-full ${message.isOwn ? 'bg-primary-foreground/30' : 'bg-foreground/20'}`}>
                            <div className={`h-1 rounded-full w-1/3 ${message.isOwn ? 'bg-primary-foreground' : 'bg-foreground'}`} />
                          </div>
                        </div>
                        <span className={`text-xs ${message.isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {message.voiceDuration}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                        onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                      >
                        <p className="text-sm">{message.text}</p>
                        {message.isEdited && (
                          <span className="text-xs opacity-60 ml-2">(изменено)</span>
                        )}
                      </div>
                    )}
                    
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {message.reactions.map((reaction, idx) => (
                          <div key={idx} className="bg-card border border-border rounded-full px-2 py-0.5 text-xs flex items-center space-x-1">
                            <span>{reaction.emoji}</span>
                            <span className="text-muted-foreground">{reaction.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className={`text-xs text-muted-foreground mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                      {message.time}
                    </p>
                    
                    {selectedMessage === message.id && (
                      <MessageActions
                        messageId={message.id}
                        isOwn={message.isOwn}
                        onReply={() => {
                          setReplyingTo(message);
                          setSelectedMessage(null);
                        }}
                        onEdit={() => {
                          setEditingMessage(message);
                          setMessageInput(message.text);
                          setSelectedMessage(null);
                        }}
                        onForward={() => handleForwardMessage(message.id)}
                        onDelete={() => handleDeleteMessage(message.id)}
                        onReact={() => {
                          setShowEmojiPicker(message.id);
                          setSelectedMessage(null);
                        }}
                        onClose={() => setSelectedMessage(null)}
                      />
                    )}
                    
                    {showEmojiPicker === message.id && (
                      <EmojiPicker
                        onSelect={(emoji) => handleReaction(message.id, emoji)}
                        onClose={() => setShowEmojiPicker(null)}
                      />
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="max-w-md">
                    <div className="px-4 py-3 rounded-2xl bg-muted flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-left">Печатает...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4 bg-card">
            {replyingTo && (
              <div className="max-w-3xl mx-auto mb-2 bg-muted px-4 py-2 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Reply" size={16} className="text-primary" />
                  <div>
                    <div className="text-xs font-medium">{replyingTo.isOwn ? 'Вы' : (newChatContact ? newChatContact.name : currentChat?.name)}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{replyingTo.text}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                  <Icon name="X" size={14} />
                </Button>
              </div>
            )}
            {editingMessage && (
              <div className="max-w-3xl mx-auto mb-2 bg-primary/10 px-4 py-2 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Pencil" size={16} className="text-primary" />
                  <div className="text-sm">Редактирование сообщения</div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingMessage(null); setMessageInput(''); }}>
                  <Icon name="X" size={14} />
                </Button>
              </div>
            )}
            <div className="max-w-3xl mx-auto flex items-end space-x-3 relative">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-primary/10 hover:text-primary"
                  onClick={() => setShowFileMenu(!showFileMenu)}
                >
                  <Icon name="Plus" size={22} />
                </Button>
                
                {showFileMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[180px] animate-fade-in">
                    <button
                      onClick={() => handleFileUpload('image')}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Icon name="Image" size={18} className="text-primary" />
                      <span className="text-sm">Изображение</span>
                    </button>
                    <button
                      onClick={() => handleFileUpload('document')}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Icon name="FileText" size={18} className="text-primary" />
                      <span className="text-sm">Документ</span>
                    </button>
                    <button
                      onClick={() => handleFileUpload('video')}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Icon name="Video" size={18} className="text-primary" />
                      <span className="text-sm">Видео</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex items-end space-x-2 bg-muted rounded-2xl px-4 py-2">
                <Input
                  placeholder="Написать сообщение..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-background h-8 w-8">
                  <Icon name="Smile" size={20} />
                </Button>
              </div>

              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                <Icon name="Mic" size={22} />
              </Button>
              
              <Button 
                className="rounded-xl h-10 w-10" 
                size="icon" 
                onClick={() => {
                  console.log('Send button clicked!');
                  handleSendMessage();
                }}
              >
                <Icon name="Send" size={18} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="MessageSquare" size={40} className="text-primary" />
            </div>
            <p className="text-lg">Выберите чат для начала общения</p>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Index;