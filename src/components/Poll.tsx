import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type PollOption = {
  id: number;
  text: string;
  votes: number;
};

type PollProps = {
  question: string;
  options: PollOption[];
  isOwn: boolean;
  totalVotes: number;
  userVoted?: number;
};

export const Poll = ({ question, options, isOwn, totalVotes, userVoted }: PollProps) => {
  const [selectedOption, setSelectedOption] = useState<number | undefined>(userVoted);

  const handleVote = (optionId: number) => {
    if (!selectedOption) {
      setSelectedOption(optionId);
    }
  };

  return (
    <div className={`px-4 py-3 rounded-2xl ${isOwn ? 'bg-primary/20' : 'bg-muted'} min-w-[280px]`}>
      <div className="flex items-start space-x-2 mb-3">
        <Icon name="BarChart3" size={18} className="text-primary mt-0.5" />
        <h4 className="font-medium text-sm">{question}</h4>
      </div>

      <div className="space-y-2">
        {options.map(option => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!!selectedOption}
              className={`w-full text-left p-3 rounded-lg relative overflow-hidden transition-all ${
                isSelected ? 'bg-primary/30 ring-2 ring-primary' : 'bg-background hover:bg-muted'
              } ${selectedOption ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {selectedOption && (
                <div
                  className="absolute inset-0 bg-primary/10"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <span className="text-sm">{option.text}</span>
                {selectedOption && (
                  <span className="text-xs font-medium">{percentage}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <p className="text-xs text-muted-foreground mt-3">
          {totalVotes} {totalVotes === 1 ? 'голос' : 'голосов'}
        </p>
      )}
    </div>
  );
};
