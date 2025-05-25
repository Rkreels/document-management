
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { VoiceProvider } from '@/contexts/VoiceContext';
import { DocumentProvider } from '@/contexts/DocumentContext';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import DocumentEditor from '@/pages/DocumentEditor';
import DocumentPreview from '@/pages/DocumentPreview';
import Settings from '@/pages/Settings';
import Templates from '@/pages/Templates';
import TemplateEditor from '@/pages/TemplateEditor';
import SigningPage from '@/pages/SigningPage';
import VoiceTrainingPage from '@/pages/VoiceTraining';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <VoiceProvider>
      <DocumentProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/editor" element={<DocumentEditor />} />
              <Route path="/editor/:documentId" element={<DocumentEditor />} />
              <Route path="/preview/:documentId" element={<DocumentPreview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/template-editor" element={<TemplateEditor />} />
              <Route path="/template-editor/:templateId" element={<TemplateEditor />} />
              <Route path="/signing/:documentId/:signerId" element={<SigningPage />} />
              <Route path="/voice-training" element={<VoiceTrainingPage />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </DocumentProvider>
    </VoiceProvider>
  );
}

export default App;
