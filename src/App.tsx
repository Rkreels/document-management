
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { VoiceProvider } from '@/contexts/VoiceContext';
import { DocumentProvider } from '@/contexts/DocumentContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
import { DocumentRouter } from '@/components/DocumentRouter';

function App() {
  return (
    <ErrorBoundary>
      <VoiceProvider>
        <DocumentProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Root redirect to document-management */}
                <Route path="/" element={<Navigate to="/document-management" replace />} />
                
                {/* Document Management Routes */}
                <Route path="/document-management" element={<Index />} />
                <Route path="/document-management/dashboard" element={
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/editor" element={
                  <ErrorBoundary>
                    <DocumentEditor />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/editor/:documentId" element={
                  <ErrorBoundary>
                    <DocumentEditor />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/preview/:documentId" element={
                  <ErrorBoundary>
                    <DocumentPreview />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/document/:documentId" element={
                  <ErrorBoundary>
                    <DocumentRouter />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/document/:documentId/:signerId" element={
                  <ErrorBoundary>
                    <DocumentRouter />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/settings" element={
                  <ErrorBoundary>
                    <Settings />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/templates" element={
                  <ErrorBoundary>
                    <Templates />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/template-editor" element={
                  <ErrorBoundary>
                    <TemplateEditor />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/template-editor/:templateId" element={
                  <ErrorBoundary>
                    <TemplateEditor />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/signing/:documentId/:signerId" element={
                  <ErrorBoundary>
                    <SigningPage />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/voice-training" element={
                  <ErrorBoundary>
                    <VoiceTrainingPage />
                  </ErrorBoundary>
                } />
                <Route path="/document-management/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/document-management/404" replace />} />
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
