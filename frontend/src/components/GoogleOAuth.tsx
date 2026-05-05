import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EnhancedButton from './EnhancedButton';
import './GoogleOAuth.css';

const GoogleOAuth: React.FC = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      // Google OAuth configuration
      const CLIENT_ID = 'your-google-client-id';
      const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;
      
      // Build Google OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      authUrl.searchParams.set('access_type', 'offline');
      
      // Open Google OAuth in popup
      const popup = window.open(
        authUrl.toString(),
        'googleSignIn',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth callback
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          const { token, user } = event.data.payload;
          login(token, user);
          showSuccess('Successfully signed in with Google! 🎉');
          popup?.close();
          window.removeEventListener('message', messageHandler);
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          showError(event.data.message || 'Google sign-in failed');
          popup?.close();
          window.removeEventListener('message', messageHandler);
        }
      };

      window.addEventListener('message', messageHandler);
      
      // Fallback: Check popup closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
        }
      }, 1000);

    } catch (error) {
      showError('Failed to initiate Google sign-in');
    }
  };

  return (
    <div className="google-oauth">
      <EnhancedButton
        variant="glass"
        size="md"
        className="google-btn"
        onClick={handleGoogleSignIn}
      >
        <svg className="google-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </EnhancedButton>
    </div>
  );
};

export default GoogleOAuth;
