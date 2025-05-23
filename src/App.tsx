
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VoiceProvider } from "./contexts/VoiceContext";
import { DocumentProvider } from "./contexts/DocumentContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DocumentEditor from "./pages/DocumentEditor";
import DocumentPreview from "./pages/DocumentPreview";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <VoiceProvider>
        <DocumentProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/editor/:documentId?" element={<DocumentEditor />} />
              <Route path="/preview/:documentId" element={<DocumentPreview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DocumentProvider>
      </VoiceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
