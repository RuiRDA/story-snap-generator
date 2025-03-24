
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TooltipProvider } from "@/components/ui/tooltip";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/story-snap-generator/">
      {/* Wrap the application content with TooltipProvider */}
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster />
        <Sonner
          position="top-center"
          closeButton
          richColors
          expand
          theme="light"
        />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
