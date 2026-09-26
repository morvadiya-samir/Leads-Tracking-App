import { ToastProvider, AuthProvider, LeadsProvider } from './context';
import { Header } from './components/Header';
import { LeadsDashboard } from './components/LeadsDashboard';
import { AuthModal } from './components/AuthModal';

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LeadsProvider>
          <div className="app-container">
            {/* Main App Header */}
            <Header />

            {/* Unified Leads Dashboard Component */}
            <LeadsDashboard />

            {/* Basic Auth Modal */}
            <AuthModal />
          </div>
        </LeadsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
