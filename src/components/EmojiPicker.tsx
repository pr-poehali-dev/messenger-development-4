type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

export const EmojiPicker = ({ onSelect }: EmojiPickerProps) => {
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏', '🎉', '💯'];

  return (
    <div className="absolute bottom-full mb-2 right-0 bg-card border border-border rounded-xl shadow-lg p-3 z-20">
      <div className="grid grid-cols-5 gap-2">
        {emojis.map(emoji => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-muted rounded-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
