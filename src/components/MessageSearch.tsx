import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type Message = {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
};

type MessageSearchProps = {
  messages: Message[];
  onMessageSelect: (messageId: number) => void;
  onClose: () => void;
};

export const MessageSearch = ({ messages, onMessageSelect, onClose }: MessageSearchProps) => {
  const [query, setQuery] = useState('');

  const filteredMessages = messages.filter(msg =>
    msg.text.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="absolute top-0 left-0 right-0 bg-card border-b border-border shadow-lg z-20 p-4">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <Input
          placeholder="Поиск в сообщениях..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          autoFocus
        />
        <span className="text-sm text-muted-foreground">
          {filteredMessages.length} найдено
        </span>
      </div>

      {query && (
        <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
          {filteredMessages.map(msg => (
            <button
              key={msg.id}
              onClick={() => {
                onMessageSelect(msg.id);
                onClose();
              }}
              className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <p className="text-sm truncate">{msg.text}</p>
              <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
