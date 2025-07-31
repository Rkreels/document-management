
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { VoiceProvider } from '@/contexts/VoiceContext';
import { DocumentProvider } from '@/contexts/DocumentContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RealDataLoader } from '@/components/RealDataLoader';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import DocumentEditor from '@/pages/DocumentEditor';
import DocumentPreview from '@/pages/DocumentPreview';
import Settings from '@/pages/Settings';
import Templates from '@/pages/Templates';
import TemplateEditor from '@/pages/TemplateEditor';
import SigningPage from '@/pages/SigningPage';
import TemplatePreview from '@/pages/TemplatePreview';
import VoiceTrainingPage from '@/pages/VoiceTraining';
import NotFound from '@/pages/NotFound';
import { DocumentRouter } from '@/components/DocumentRouter';

function App() {
  return (
    <ErrorBoundary>
      <VoiceProvider>
        <DocumentProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Root route */}
                <Route path="/" element={<Index />} />
                
                {/* Document Management Routes */}
                <Route path="/dashboard" element={
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                } />
                <Route path="/editor" element={
                  <ErrorBoundary>
                    <DocumentEditor />
                  </ErrorBoundary>
                } />
                <Route path="/editor/:documentId" element={
                  <ErrorBoundary>
                    <DocumentEditor />
                  </ErrorBoundary>
                } />
                <Route path="/preview/:documentId" element={
                  <ErrorBoundary>
                    <DocumentPreview />
                  </ErrorBoundary>
                } />
                <Route path="/document/:documentId" element={
                  <ErrorBoundary>
                    <DocumentRouter />
                  </ErrorBoundary>
                } />
                <Route path="/document/:documentId/:signerId" element={
                  <ErrorBoundary>
                    <DocumentRouter />
                  </ErrorBoundary>
                } />
                <Route path="/settings" element={
                  <ErrorBoundary>
                    <Settings />
                  </ErrorBoundary>
                } />
                <Route path="/templates" element={
                  <ErrorBoundary>
                    <Templates />
                  </ErrorBoundary>
                } />
                <Route path="/template-editor" element={
                  <ErrorBoundary>
                    <TemplateEditor />
                  </ErrorBoundary>
                } />
                <Route path="/template-editor/:templateId" element={
                  <ErrorBoundary>
                    <TemplateEditor />
                  </ErrorBoundary>
                } />
                <Route path="/signing/:documentId/:signerId" element={
                  <ErrorBoundary>
                    <SigningPage />
                  </ErrorBoundary>
                } />
                <Route path="/voice-training" element={
                  <ErrorBoundary>
                    <VoiceTrainingPage />
                  </ErrorBoundary>
                } />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </DocumentProvider>
      </VoiceProvider>
    </ErrorBoundary>
  );
}

export default App;
