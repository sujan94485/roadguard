import React, { useState, useEffect } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { ReportsProvider } from './hooks/useReports';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { ReportHazardPage } from './pages/ReportHazardPage';
import { SafetyMapPage } from './pages/SafetyMapPage';
import { TrackReportPage } from './pages/TrackReportPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { Loader2 } from 'lucide-react';

const getRouteFromUrl = (): string => {
  if (typeof window === 'undefined') return '/';

  const hash = window.location.hash;

  // Case B: Recovery callback or error callback from Supabase
  // e.g. http://localhost:5173/#access_token=...&type=recovery or #error=access_denied...
  if (
    hash.startsWith('#access_token=') ||
    hash.includes('type=recovery') ||
    hash.startsWith('#error=') ||
    window.location.search.includes('type=recovery')
  ) {
    return 'recovery_callback';
  }

  // Case C & D: Explicit reset password route
  if (window.location.pathname === '/reset-password') {
    return '/reset-password';
  }

  const cleanHash = hash.replace(/^#/, '');
  if (cleanHash.startsWith('/reset-password')) {
    return '/reset-password';
  }

  // Case A: Normal route or home
  return cleanHash || '/';
};

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return getRouteFromUrl();
  });

  useEffect(() => {
    const handleHashChange = () => {
      const path = getRouteFromUrl();
      setCurrentRoute(path);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Safety timer for recovery callback: allows Supabase client to finish processing before navigating
  useEffect(() => {
    if (currentRoute === 'recovery_callback') {
      const safetyTimer = setTimeout(() => {
        if (
          window.location.hash.startsWith('#access_token=') ||
          window.location.hash.startsWith('#error=') ||
          window.location.hash.includes('type=recovery')
        ) {
          window.location.hash = '/reset-password';
        }
      }, 1500);
      return () => clearTimeout(safetyTimer);
    }
  }, [currentRoute]);

  const navigateTo = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  const renderCurrentPage = () => {
    if (currentRoute === 'recovery_callback') {
      return (
        <div className="container" style={{ padding: '80px 16px', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: '40px 24px', borderColor: '#38BDF8' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', color: '#38BDF8' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#F8FAFC' }}>
              Validating Recovery Session
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
              Authenticating your password recovery link with Supabase...
            </p>
          </div>
        </div>
      );
    }
    if (currentRoute === '/') {
      return <LandingPage onNavigate={navigateTo} />;
    }
    if (currentRoute.startsWith('/reset-password')) {
      return <ResetPasswordPage onNavigate={navigateTo} />;
    }
    if (currentRoute === '/report') {
      return <ReportHazardPage onNavigate={navigateTo} />;
    }
    if (currentRoute === '/map') {
      return <SafetyMapPage onNavigate={navigateTo} />;
    }
    if (currentRoute.startsWith('/track')) {
      const parts = currentRoute.split('/');
      const code = parts[2] ? decodeURIComponent(parts[2]) : undefined;
      return <TrackReportPage initialReportCode={code} onNavigate={navigateTo} />;
    }
    if (currentRoute.startsWith('/admin')) {
      return <AdminDashboardPage onNavigate={navigateTo} />;
    }
    return <LandingPage onNavigate={navigateTo} />;
  };

  return (
    <AuthProvider>
      <ReportsProvider>
        <div className="app-container">
          <Navbar currentRoute={currentRoute} onNavigate={navigateTo} />
          <main className="main-content">{renderCurrentPage()}</main>
          {currentRoute !== '/map' && <Footer />}
        </div>
      </ReportsProvider>
    </AuthProvider>
  );
}

export default App;
