import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type Chat = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

type Message = {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
  isVoice?: boolean;
  voiceDuration?: string;
};

const Index = () => {
  const [activeSection, setActiveSection] = useState<'chats' | 'contacts' | 'archive' | 'profile' | 'settings'>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
    { id: 3, name: 'Команда проекта', avatar: '', lastMessage: 'Марина: Документы готовы', time: '12:48', unread: 5, online: true },
    { id: 4, name: 'Елена Козлова', avatar: '', lastMessage: 'Спасибо за помощь!', time: '11:20', unread: 0, online: false },
    { id: 5, name: 'Игорь Новиков', avatar: '', lastMessage: 'Созвон в 15:00', time: '10:05', unread: 1, online: true },
    { id: 6, name: 'Ольга Иванова', avatar: '', lastMessage: 'Посмотри эти файлы', time: 'Вчера', unread: 0, online: false },
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const currentTime = new Date();
    const timeString = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    const newMessage: Message = {
      id: messages.length + 1,
      text: messageInput,
      time: timeString,
      isOwn: true,
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput('');
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
    <div className="flex h-screen bg-background">
      <div className="w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 space-y-6">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Icon name="Send" size={24} className="text-primary-foreground" />
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

        <button className="w-12 h-12 rounded-full overflow-hidden border-2 border-sidebar-border hover:border-primary transition-colors">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">ВЫ</AvatarFallback>
          </Avatar>
        </button>
      </div>

      <div className="w-96 border-r border-border bg-card flex flex-col">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Чаты</h1>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Icon name="Plus" size={20} />
            </Button>
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
      </div>

      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <div className="h-20 border-b border-border px-6 flex items-center justify-between bg-card">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-11 h-11">
                  <AvatarFallback className="bg-primary/20 text-primary font-medium">
                    {currentChat?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {currentChat?.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>
              <div>
                <h2 className="font-semibold">{currentChat?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {currentChat?.online ? 'В сети' : 'Был(а) недавно'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                <Icon name="Phone" size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
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
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                    {message.isVoice ? (
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
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    )}
                    <p className={`text-xs text-muted-foreground mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                      {message.time}
                    </p>
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
            <div className="max-w-3xl mx-auto flex items-end space-x-3">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                <Icon name="Plus" size={22} />
              </Button>
              
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
  );
};

export default Index;