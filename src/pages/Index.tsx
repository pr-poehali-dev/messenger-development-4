import { useState } from 'react';
import Icon from '@/components/ui/icon';
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
  onUpdateProfile: (name: string, avatar?: string) => void;
  onLogout: () => void;
};

const Index = ({ userName = 'Вы', userAvatar, userPhone, onUpdateProfile, onLogout }: IndexProps) => {
  const [activeSection, setActiveSection] = useState<'chats' | 'contacts' | 'archive' | 'profile' | 'settings'>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
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
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Привет! Как дела?', time: '14:20', isOwn: false },
    { id: 2, text: 'Отлично! Работаю над проектом', time: '14:25', isOwn: true },
    { id: 3, text: '', time: '14:28', isOwn: false, isVoice: true, voiceDuration: '0:45' },
    { id: 4, text: 'Звучит здорово! Может созвонимся завтра?', time: '14:30', isOwn: true },
    { id: 5, text: 'Отлично, встретимся завтра!', time: '14:32', isOwn: false },
  ]);

  const chats: Chat[] = [
    { id: 1, name: 'Анна Смирнова', avatar: '', lastMessage: 'Отлично, встретимся завтра!', time: '14:32', unread: 2, online: true },
    { id: 2, name: 'Дмитрий Петров', avatar: '', lastMessage: 'Голосовое сообщение', time: '13:15', unread: 0, online: false },
    { id: 3, name: 'Команда проекта', avatar: '', lastMessage: 'Марина: Документы готовы', time: '12:48', unread: 5, online: true, isGroup: true, membersCount: 12 },
    { id: 4, name: 'Елена Козлова', avatar: '', lastMessage: 'Спасибо за помощь!', time: '11:20', unread: 0, online: false },
    { id: 5, name: 'Игорь Новиков', avatar: '', lastMessage: 'Созвон в 15:00', time: '10:05', unread: 1, online: true },
    { id: 6, name: 'Разработка сайта', avatar: '', lastMessage: 'Посмотри эти файлы', time: 'Вчера', unread: 0, online: false, isGroup: true, membersCount: 8 },
    { id: 7, name: 'Семейный чат', avatar: '', lastMessage: 'Мама: Ужин готов!', time: 'Вчера', unread: 3, online: true, isGroup: true, membersCount: 5 },
  ];

  const stories: Story[] = [
    { id: 1, userId: 1, userName: 'Анна', avatar: '', hasViewed: false },
    { id: 2, userId: 2, userName: 'Дмитрий', avatar: '', hasViewed: true },
    { id: 3, userId: 5, userName: 'Игорь', avatar: '', hasViewed: false },
    { id: 4, userId: 4, userName: 'Елена', avatar: '', hasViewed: true },
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const currentTime = new Date();
    const timeString = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    if (editingMessage) {
      setMessages(messages.map(msg => 
        msg.id === editingMessage.id 
          ? { ...msg, text: messageInput, isEdited: true }
          : msg
      ));
      setEditingMessage(null);
      setMessageInput('');
      return;
    }
    
    const newMessage: Message = {
      id: messages.length + 1,
      text: messageInput,
      time: timeString,
      isOwn: true,
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.isOwn ? 'Вы' : currentChat?.name || '' } : undefined,
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput('');
    setReplyingTo(null);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 3000);
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

  const handleDeleteMessage = (messageId: number) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
    setSelectedMessage(null);
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
        {activeSection === 'chats' && showStories && <Stories stories={stories} onStoryClick={() => {}} />}
        
        {activeSection === 'contacts' ? (
          <Contacts onChatStart={(contactId) => {
            setSelectedChat(contactId);
            setActiveSection('chats');
          }} />
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
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Icon name="Plus" size={20} />
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
            {filteredChats.map(chat => (
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
            ))}
          </div>
        </ScrollArea>
          </>
        )}
      </div>

      {activeSection === 'settings' ? null : selectedChat ? (
        <div className="flex-1 flex flex-col">
          <div className="h-20 border-b border-border px-6 flex items-center justify-between bg-card">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-11 h-11">
                  <AvatarFallback className="bg-primary/20 text-primary font-medium">
                    {currentChat?.isGroup ? <Icon name="Users" size={20} /> : currentChat?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {!currentChat?.isGroup && currentChat?.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>
              <div>
                <h2 className="font-semibold">{currentChat?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {currentChat?.isGroup 
                    ? `${currentChat.membersCount} участников` 
                    : currentChat?.online ? 'В сети' : 'Был(а) недавно'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
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
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Icon name="MoreVertical" size={20} />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message, index) => (
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
                    <div className="text-xs font-medium">{replyingTo.isOwn ? 'Вы' : currentChat?.name}</div>
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
              
              <Button className="rounded-xl h-10 w-10" size="icon" onClick={handleSendMessage}>
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