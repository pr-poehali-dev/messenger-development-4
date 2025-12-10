import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [currentAccountPhone, setCurrentAccountPhone] = useState<string>('');

  useEffect(() => {
    const activePhone = localStorage.getItem('whatsok_active_account');
    const storedAccounts = localStorage.getItem('whatsok_accounts');
    
    if (activePhone && storedAccounts) {
      const accounts = JSON.parse(storedAccounts);
      const activeAccount = accounts.find((acc: any) => acc.phone === activePhone);
      
      if (activeAccount) {
        setIsAuthenticated(true);
        setUserName(activeAccount.name);
        setUserPhone(activeAccount.phone);
        setUserAvatar(activeAccount.avatar);
        setCurrentAccountPhone(activeAccount.phone);
      }
    }
  }, []);

  const handleAuthComplete = (phone: string, name: string) => {
    const storedAccounts = localStorage.getItem('whatsok_accounts');
    const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
    
    const existingAccountIndex = accounts.findIndex((acc: any) => acc.phone === phone);
    
    if (existingAccountIndex !== -1) {
      accounts[existingAccountIndex] = { phone, name, avatar: accounts[existingAccountIndex].avatar };
    } else {
      accounts.push({ phone, name });
    }
    
    localStorage.setItem('whatsok_accounts', JSON.stringify(accounts));
    localStorage.setItem('whatsok_active_account', phone);
    
    setIsAuthenticated(true);
    setUserName(name);
    setUserPhone(phone);
    setCurrentAccountPhone(phone);
  };

  const handleUpdateProfile = (name: string, avatar?: string) => {
    const storedAccounts = localStorage.getItem('whatsok_accounts');
    const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
    
    const accountIndex = accounts.findIndex((acc: any) => acc.phone === userPhone);
    if (accountIndex !== -1) {
      accounts[accountIndex] = { phone: userPhone, name, avatar };
      localStorage.setItem('whatsok_accounts', JSON.stringify(accounts));
    }
    
    setUserName(name);
    setUserAvatar(avatar);
  };

  const handleSwitchAccount = (phone: string) => {
    const storedAccounts = localStorage.getItem('whatsok_accounts');
    if (storedAccounts) {
      const accounts = JSON.parse(storedAccounts);
      const account = accounts.find((acc: any) => acc.phone === phone);
      
      if (account) {
        localStorage.setItem('whatsok_active_account', phone);
        setUserName(account.name);
        setUserPhone(account.phone);
        setUserAvatar(account.avatar);
        setCurrentAccountPhone(account.phone);
      }
    }
  };

  const handleAddAccount = () => {
    setIsAuthenticated(false);
    setUserName('');
    setUserPhone('');
    setUserAvatar(undefined);
  };

  const handleLogout = () => {
    const storedAccounts = localStorage.getItem('whatsok_accounts');
    if (storedAccounts) {
      const accounts = JSON.parse(storedAccounts);
      const updatedAccounts = accounts.filter((acc: any) => acc.phone !== userPhone);
      
      if (updatedAccounts.length > 0) {
        localStorage.setItem('whatsok_accounts', JSON.stringify(updatedAccounts));
        handleSwitchAccount(updatedAccounts[0].phone);
      } else {
        localStorage.removeItem('whatsok_accounts');
        localStorage.removeItem('whatsok_active_account');
        setIsAuthenticated(false);
        setUserName('');
        setUserPhone('');
        setUserAvatar(undefined);
        setCurrentAccountPhone('');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Auth onAuthComplete={handleAuthComplete} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index userName={userName} userAvatar={userAvatar} userPhone={userPhone} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} onSwitchAccount={handleSwitchAccount} onAddAccount={handleAddAccount} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;