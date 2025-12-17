import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { App } from './App';
import { StepAuth } from './components/StepAuth';

/**
 * Main wrapper component that handles authentication
 */
export function Root() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

/**
 * Component that displays appropriate UI based on auth state
 */
function AppWithAuth() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            ⏳
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Loading ZhCode IDE...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <StepAuth />;
  }

  return (
    <>
      <App />
    </>
  );
}
