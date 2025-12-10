import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

type Account = {
  phone: string;
  name: string;
  avatar?: string;
};

type AccountSwitcherProps = {
  currentAccount: Account;
  accounts: Account[];
  onSwitch: (phone: string) => void;
  onAddAccount: () => void;
  onClose: () => void;
};

export const AccountSwitcher = ({ 
  currentAccount, 
  accounts, 
  onSwitch, 
  onAddAccount,
  onClose 
}: AccountSwitcherProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md m-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Аккаунты</h2>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Управление несколькими аккаунтами
          </p>
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="p-3 space-y-2">
            {accounts.map((account) => {
              const isActive = account.phone === currentAccount.phone;
              
              return (
                <button
                  key={account.phone}
                  onClick={() => {
                    if (!isActive) {
                      onSwitch(account.phone);
                    }
                  }}
                  className={`w-full p-4 rounded-xl flex items-center space-x-3 transition-all ${
                    isActive 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'hover:bg-muted border-2 border-transparent'
                  }`}
                >
                  <Avatar className="w-12 h-12">
                    {account.avatar ? (
                      <AvatarImage src={account.avatar} alt={account.name} />
                    ) : (
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">
                        {account.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 text-left">
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground">{account.phone}</div>
                  </div>
                  
                  {isActive && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Icon name="Check" size={14} className="text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onAddAccount();
              onClose();
            }}
          >
            <Icon name="Plus" size={18} />
            Добавить аккаунт
          </Button>
        </div>
      </div>
    </div>
  );
};
