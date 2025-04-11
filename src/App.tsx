
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from 'react';

const queryClient = new QueryClient();

const App = () => {
  // Initialize Capacitor-specific functionality
  useEffect(() => {
    // This would be where we set up any native Android functionality
    console.log("App initialized - ready for Capacitor integration");
    
    const handleBackButton = () => {
      // Handle Android back button press
      console.log("Back button pressed");
      // We would implement actual back button handling here in a real app
    };
    
    // In a real app, we'd use Capacitor plugins here
    // Example: App.addListener('backButton', handleBackButton);
    
    return () => {
      // Cleanup any listeners
      // Example: App.removeListener('backButton', handleBackButton);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
