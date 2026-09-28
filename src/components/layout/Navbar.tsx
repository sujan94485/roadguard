import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AuthModal } from '../auth/AuthModal';
import {
  Shield,
  MapPin,
  PlusCircle,
  Search,
  LayoutDashboard,
  UserCheck,
  ShieldAlert,
  LogIn,
  LogOut,
  Database,
  Radio
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const {
    user,
    role,
    isAuthenticated,
    isAdmin,
    isDemoAuth,
    isSupabaseConnected,
    loginAsDemo,
    signOut,
    toggleDemoMode
  } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/');
  };

  const navLinks = [
    { id: 'landing', label: 'Overview', icon: Shield, route: '/' },
    { id: 'report', label: 'Report Hazard', icon: PlusCircle, route: '/report' },
    { id: 'map', label: 'Safety Map', icon: MapPin, route: '/map' },
    { id: 'track', label: 'Track Report', icon: Search, route: '/track' },
    { id: 'admin', label: 'Authority Portal', icon: LayoutDashboard, route: '/admin' }
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Top Status & Mode Banner */}
      <div
        className="demo-banner"
        style={{
          backgroundColor: isSupabaseConnected ? '#064E3B' : '#78350F',
          borderBottom: isSupabaseConnected ? '1px solid #059669' : '1px solid #D97706',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 16px',
          fontSize: '0.75rem',
          color: '#F8FAFC'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.6875rem',
              backgroundColor: isSupabaseConnected ? '#10B981' : '#F59E0B',
              color: '#000000',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isSupabaseConnected ? <Database size={11} /> : <Radio size={11} />}
            {isSupabaseConnected ? 'CONNECTED MODE' : 'DEMO MODE'}
          </span>
          <span>
            {isSupabaseConnected
              ? 'Supabase Cloud Database & Storage Active — Live PostgreSQL persistence'
              : 'Sample Road Safety Data — Drive Safe Hackathon Prototype (Simulated Karnataka Records)'}
          </span>
        </div>

        {/* Mode Toggle Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSupabaseConfigured && (
            <button
              onClick={() => toggleDemoMode(!isDemoAuth)}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '4px',
                color: '#F8FAFC',
                padding: '2px 8px',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {isDemoAuth ? 'Connect to Cloud' : 'Switch to Offline Demo'}
            </button>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div
        style={{
          backgroundColor: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #1F2937'
        }}
      >
        <div
          className="container app-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '64px',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '8px',
            paddingBottom: '8px'
          }}
        >
          {/* Brand */}
          <div
            onClick={() => onNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8'
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
                  Road<span style={{ color: '#38BDF8' }}>Guard</span>
                </span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38BDF8',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  Prototype
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>Drive Safe Hackathon</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = currentRoute === link.route || (link.route !== '/' && currentRoute.startsWith(link.route));
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.route)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isActive ? '#1E293B' : 'transparent',
                    color: isActive ? '#38BDF8' : '#CBD5E1',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={15} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Condition 1: Demo Mode -> Isolated Demo Role Switch */}
            {isDemoAuth && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#0F172A',
                  border: '1px solid #1E293B',
                  borderRadius: '8px',
                  padding: '2px',
                  gap: '2px'
                }}
                title="Demo Role Switch: Strictly for presentation demonstration"
              >
                <span style={{ fontSize: '0.6875rem', color: '#64748B', padding: '0 6px', fontWeight: 600 }}>
                  Demo Role:
                </span>
                <button
                  onClick={() => loginAsDemo('citizen')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: role === 'citizen' ? '#2563EB' : 'transparent',
                    color: role === 'citizen' ? '#FFFFFF' : '#94A3B8',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <UserCheck size={12} />
                  Citizen
                </button>
                <button
                  onClick={() => {
                    loginAsDemo('admin');
                    onNavigate('/admin');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: role === 'admin' ? '#D97706' : 'transparent',
                    color: role === 'admin' ? '#FFFFFF' : '#94A3B8',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Shield size={12} />
                  Admin
                </button>
              </div>
            )}

            {/* Condition 2: Connected Mode with Real Supabase Auth */}
            {isSupabaseConnected && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isAuthenticated ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        backgroundColor: '#1E293B',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{user?.full_name}</span>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: isAdmin ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                          color: isAdmin ? '#F59E0B' : '#38BDF8',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}
                      >
                        {role}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="btn btn-secondary btn-sm"
                      title="Sign Out"
                      style={{ padding: '6px 8px', display: 'flex', alignItems: 'center' }}
                    >
                      <LogOut size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}
                  >
                    <LogIn size={14} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}

            {/* Primary Action Button */}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('/report')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', padding: '6px 12px' }}
            >
              <PlusCircle size={14} />
              <span>Report Hazard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};
