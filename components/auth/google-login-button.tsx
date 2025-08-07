'use client';

import { type CredentialResponse, useGoogleLogin } from '@react-oauth/google';
import { LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: () => void;
  className?: string;
  variant?: 'icon' | 'standard';
  'data-google-login'?: boolean;
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  className,

  'data-google-login': dataGoogleLogin,
}: GoogleLoginButtonProps) {
  const { login, setError, setLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use the OAuth flow instead of the one-tap sign-in for Drive API access
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);

        // Get user info using the access token
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userInfo = await userInfoResponse.json();

        // Store user info with the access token
        login({
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          accessToken: tokenResponse.access_token,
          refreshToken:
            (tokenResponse as { refresh_token?: string }).refresh_token || '',
          expiresAt: Date.now() + tokenResponse.expires_in * 1000,
        });

        onSuccess?.();
      } catch (_error) {
        setError('Failed to login with Google');
        onError?.();
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed');
      onError?.();
    },
    scope:
      'email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
    flow: 'implicit',
  });

  const _handleSuccess = (_credentialResponse: CredentialResponse) => {
    // This is for the one-tap sign-in, but we need OAuth flow for Drive API
    // So we'll trigger the OAuth flow instead
    googleLogin();
  };

  const _handleError = () => {
    setError('Google login failed');
    onError?.();
  };

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <Button className={className} disabled variant="outline">
        <LogIn className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  // Use the OAuth flow button instead of the one-tap sign-in
  // This gives us proper access tokens for the Drive API
  return (
    <Button
      className={cn('w-full', className)}
      data-google-login={dataGoogleLogin}
      disabled={!mounted}
      onClick={() => googleLogin()}
      variant="outline"
    >
      <svg
        aria-label="Google logo"
        className="mr-2 h-4 w-4"
        viewBox="0 0 24 24"
      >
        <title>Google logo</title>
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="currentColor"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="currentColor"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="currentColor"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="currentColor"
        />
      </svg>
      Sign in with Google
    </Button>
  );
}

export function GoogleLoginFallback({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button className={className} onClick={onClick} variant="outline">
      <LogIn className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  );
}
