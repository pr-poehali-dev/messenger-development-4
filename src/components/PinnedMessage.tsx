import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

type PinnedMessageProps = {
  text: string;
  onJump: () => void;
  onClose: () => void;
};

export const PinnedMessage = ({ text, onJump, onClose }: PinnedMessageProps) => {
  return (
    <div className="bg-primary/10 border-b border-border px-4 py-2 flex items-center justify-between">
      <button
        onClick={onJump}
        className="flex items-center space-x-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
      >
        <Icon name="Pin" size={18} className="text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-primary">Закрепленное сообщение</div>
          <div className="text-sm truncate">{text}</div>
        </div>
      </button>
      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClose}>
        <Icon name="X" size={16} />
      </Button>
    </div>
  );
};
