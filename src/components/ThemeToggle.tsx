import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useEffect } from 'react';

type ThemeToggleProps = {
  theme: 'light' | 'dark';
  onToggle: () => void;
};

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="rounded-xl"
    >
      <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
    </Button>
  );
};
