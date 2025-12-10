import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

type Story = {
  id: number;
  userId: number;
  userName: string;
  avatar: string;
  hasViewed: boolean;
};

type StoriesProps = {
  stories: Story[];
  onStoryClick: (story: Story) => void;
};

export const Stories = ({ stories, onStoryClick }: StoriesProps) => {
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <ScrollArea className="w-full">
        <div className="flex space-x-4">
          <button className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-dashed border-primary">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Icon name="Plus" size={24} />
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-muted-foreground">Ваша история</span>
          </button>

          {stories.map(story => (
            <button
              key={story.id}
              onClick={() => onStoryClick(story)}
              className="flex flex-col items-center space-y-1 flex-shrink-0"
            >
              <div className="relative">
                <Avatar className={`w-16 h-16 border-2 ${story.hasViewed ? 'border-gray-300' : 'border-primary'}`}>
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {story.userName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-foreground truncate max-w-[64px]">{story.userName}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
