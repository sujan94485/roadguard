import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from '../components/auth/AuthModal';
import { supabase } from '../lib/supabase';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const {
    isPasswordRecovery,
    updatePassword,
    isDemoAuth
  } = useAuth();

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check for recovery session on mount (Requirements 5 & 10)
  useEffect(() => {
    let mounted = true;

    const verifyRecoverySession = async () => {
      if (isDemoAuth) {
        if (mounted) {
          setHasValidSession(true);
          setCheckingSession(false);
        }
        return;
      }

      if (!supabase) {
        if (mounted) {
          setHasValidSession(false);
          setCheckingSession(false);
        }
        return;
      }

      const hasRecoveryActive =
        isPasswordRecovery ||
        (typeof sessionStorage !== 'undefined' &&
          sessionStorage.getItem('roadguard_recovery_active') === 'true');

      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!mounted) return;

        // Requirements 4, C & D: Only valid when session exists AND recovery session was active
        if (session && hasRecoveryActive) {
          setHasValidSession(true);
        } else {
          setHasValidSession(false);
        }
      } catch (err) {
        console.warn('[Auth] Error verifying recovery session:', err);
        if (!mounted) return;
        setHasValidSession(false);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    verifyRecoverySession();

    return () => {
      mounted = false;
    };
  }, [isDemoAuth, isPasswordRecovery]);

  // Automatic redirect countdown on successful update (Requirement 9)
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onNavigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation (Requirement 7)
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setLocalError('Please enter both your new password and the confirmation password.');
      return;
    }

    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePassword(newPassword.trim());
      setIsSuccess(true);

      // Clean recovery tokens from URL address bar (Requirement 9)
      try {
        window.history.replaceState(null, '', window.location.pathname + '#/');
      } catch {}
    } catch (err: any) {
      const msg = err?.message || 'Failed to update password. Your recovery link may have expired.';
      setLocalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Verifying Recovery Session
  if (checkingSession) {
    return (
      <div className="container" style={{ padding: '80px 16px', maxWidth: '520px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center', borderColor: '#38BDF8' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', color: '#38BDF8' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Verifying Password Recovery Session</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
            Checking your secure recovery link credentials...
          </p>
        </div>
      </div>
    );
  }

  // State 2: Successful Password Reset (Requirement 9)
  if (isSuccess) {
    return (
      <div className="container" style={{ padding: '80px 16px', maxWidth: '520px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center', borderColor: '#10B981' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#10B981'
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#F8FAFC' }}>
            Password Updated Successfully!
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', marginBottom: '20px', lineHeight: 1.5 }}>
            Your new password has been established and your RoadGuard account session is now fully authenticated.
          </p>
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              fontSize: '0.8125rem',
              color: '#94A3B8'
            }}
          >
            Redirecting to home in <strong style={{ color: '#38BDF8' }}>{countdown}</strong> second{countdown === 1 ? '' : 's'}...
          </div>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('/')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>Proceed to RoadGuard</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // State 3: Invalid or Missing Recovery Session (Requirement 10)
  if (!hasValidSession) {
    return (
      <div className="container" style={{ padding: '80px 16px', maxWidth: '540px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center', borderColor: '#EF4444' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#EF4444'
            }}
          >
            <AlertTriangle size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#F8FAFC' }}>
            Invalid or Expired Recovery Link
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', marginBottom: '16px', lineHeight: 1.5 }}>
            This password recovery link is either invalid, has expired, or has already been used. For your security, password reset links are single-use and expire after a short time.
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.8125rem', marginBottom: '28px', lineHeight: 1.5 }}>
            You can easily request a new reset link below or return to the citizen portal.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => onNavigate('/')}>
              Return to Citizen Portal
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsAuthModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <KeyRound size={16} />
              <span>Request New Reset Link</span>
            </button>
          </div>
        </div>
        <AuthModal isOpen={isAuthModalOpen} initialMode="forgot" onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  // State 4: Form to Set New Password (Requirements 6, 7, 8)
  return (
    <div className="container" style={{ padding: '60px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '32px 24px', borderColor: '#334155' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#38BDF8'
            }}
          >
            <KeyRound size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#F8FAFC' }}>
            Create New Password
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.4 }}>
            Enter and confirm your new password below. Make sure it is at least 6 characters long.
          </p>
        </div>

        {/* Demo Notice if in Demo Mode (Requirement 14) */}
        {isDemoAuth && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #D97706',
              borderRadius: '8px',
              marginBottom: '18px',
              fontSize: '0.8125rem',
              color: '#FCD34D'
            }}
          >
            <strong>Demo Mode:</strong> Password updates in Demo Mode are simulated and do not modify cloud credentials.
          </div>
        )}

        {/* Error Alert */}
        {localError && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #DC2626',
              borderRadius: '6px',
              padding: '10px 12px',
              marginBottom: '18px',
              fontSize: '0.8125rem',
              color: '#FCA5A5',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* New Password Field */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#94A3B8" />
              <span>New Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#94A3B8" />
              <span>Confirm New Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Real-time Validation Hints */}
          <div
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: '6px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.75rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: newPassword.length >= 6 ? '#10B981' : '#94A3B8'
              }}
            >
              <ShieldCheck size={14} />
              <span>Minimum 6 characters</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: newPassword && newPassword === confirmPassword ? '#10B981' : '#94A3B8'
              }}
            >
              <ShieldCheck size={14} />
              <span>Passwords match</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Save & Sign In</span>
            )}
          </button>
        </form>

        {/* Cancel Action */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            Cancel and return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
