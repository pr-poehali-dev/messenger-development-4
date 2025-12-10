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

  useEffect(() => {
    const storedAuth = localStorage.getItem('whatsok_auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      setIsAuthenticated(true);
      setUserName(authData.name);
      setUserPhone(authData.phone);
      setUserAvatar(authData.avatar);
    }
  }, []);

  const handleAuthComplete = (phone: string, name: string) => {
    localStorage.setItem('whatsok_auth', JSON.stringify({ phone, name }));
    setIsAuthenticated(true);
    setUserName(name);
    setUserPhone(phone);
  };

  const handleUpdateProfile = (name: string, avatar?: string) => {
    const authData = { phone: userPhone, name, avatar };
    localStorage.setItem('whatsok_auth', JSON.stringify(authData));
    setUserName(name);
    setUserAvatar(avatar);
  };

  const handleLogout = () => {
    localStorage.removeItem('whatsok_auth');
    setIsAuthenticated(false);
    setUserName('');
    setUserPhone('');
    setUserAvatar(undefined);
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
            <Route path="/" element={<Index userName={userName} userAvatar={userAvatar} userPhone={userPhone} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;