import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, Lock, Mail, User, Phone, ShieldCheck, AlertCircle, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin'
}) => {
  const { signIn, signUp, resetPassword, authError, clearAuthError, loadingAuth, isDemoAuth } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (mode === 'forgot') {
      if (!email.trim()) {
        setLocalError('Please enter your email address.');
        return;
      }
      try {
        await resetPassword(email.trim());
        setResetSent(true);
      } catch (err: any) {
        setLocalError(err?.message || 'Failed to request password reset.');
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, fullName.trim(), phone.trim() || undefined);
      }
      onClose();
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication operation failed.');
    }
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setLocalError(null);
    setResetSent(false);
    clearAuthError();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1F2937',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '24px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mode === 'forgot' ? (
              <KeyRound size={20} color="#F59E0B" />
            ) : (
              <ShieldCheck size={20} color="#38BDF8" />
            )}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {mode === 'signin' && 'Sign In to RoadGuard'}
              {mode === 'signup' && 'Create Citizen Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Notification */}
        {(localError || authError) && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #DC2626',
              borderRadius: '6px',
              padding: '10px 12px',
              marginBottom: '16px',
              fontSize: '0.8125rem',
              color: '#FCA5A5',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Mode: Forgot Password - Sent Confirmation */}
        {mode === 'forgot' && resetSent ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h4 style={{ fontSize: '1.125rem', marginBottom: '8px', color: '#F8FAFC' }}>
              Reset Link Sent
            </h4>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '20px' }}>
              If an account exists for <strong style={{ color: '#F8FAFC' }}>{email}</strong>, a password reset link has been dispatched. Please check your inbox and click the recovery link to set a new password.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => switchMode('signin')}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'forgot' && (
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                Enter your registered RoadGuard email address below. We'll send you a secure link to choose a new password.
              </p>
            )}

            {mode === 'forgot' && isDemoAuth && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #D97706',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#FCD34D'
                }}
              >
                Demo Mode Active: Real password reset emails require Connected Mode with Supabase.
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="#94A3B8" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="#94A3B8" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <Lock size={14} color="#94A3B8" />
                    <span>Password</span>
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#38BDF8',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: 500
                      }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#94A3B8" />
                  <span>Phone (Optional)</span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loadingAuth}
              style={{ width: '100%', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loadingAuth && <Loader2 size={16} className="animate-spin" />}
              <span>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Register Citizen Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </span>
            </button>
          </form>
        )}

        {/* Switch Mode Footer */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8125rem', color: '#94A3B8' }}>
          {mode === 'signin' && (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', fontWeight: 600 }}
              >
                Create Account
              </button>
            </span>
          )}
          {mode === 'signup' && (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign In
              </button>
            </span>
          )}
          {mode === 'forgot' && (
            <span>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', fontWeight: 600 }}
              >
                Back to Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
