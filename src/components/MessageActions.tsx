import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

type MessageActionsProps = {
  messageId: number;
  isOwn: boolean;
  onReply: () => void;
  onEdit: () => void;
  onForward: () => void;
  onDelete: () => void;
  onReact: () => void;
  onClose: () => void;
};

export const MessageActions = ({
  isOwn,
  onReply,
  onEdit,
  onForward,
  onDelete,
  onReact,
  onClose,
}: MessageActionsProps) => {
  return (
    <div className="absolute bottom-full mb-2 right-0 bg-card border border-border rounded-xl shadow-lg py-2 z-10 min-w-[200px]">
      <button
        onClick={onReact}
        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-muted transition-colors text-left"
      >
        <Icon name="Smile" size={18} className="text-primary" />
        <span className="text-sm">Реакция</span>
      </button>
      
      <button
        onClick={onReply}
        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-muted transition-colors text-left"
      >
        <Icon name="Reply" size={18} className="text-primary" />
        <span className="text-sm">Ответить</span>
      </button>

      {isOwn && (
        <button
          onClick={onEdit}
          className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-muted transition-colors text-left"
        >
          <Icon name="Pencil" size={18} className="text-primary" />
          <span className="text-sm">Редактировать</span>
        </button>
      )}

      <button
        onClick={onForward}
        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-muted transition-colors text-left"
      >
        <Icon name="Forward" size={18} className="text-primary" />
        <span className="text-sm">Переслать</span>
      </button>

      <button
        onClick={onDelete}
        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-muted transition-colors text-left text-red-500"
      >
        <Icon name="Trash2" size={18} />
        <span className="text-sm">Удалить</span>
      </button>
    </div>
  );
};
