import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuthResponseDto } from '@/types';

interface AuthState {
  token: string | null;
  user: Omit<AuthResponseDto, 'token'> | null;
}

interface AuthContextValue extends AuthState {
  login: (data: AuthResponseDto) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStateManager: boolean;
  isLaboratory: boolean;
  isPharmacist: boolean;
  facilityId: string | null;
  state: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadInitial(): AuthState {
  try {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    if (token && raw) return { token, user: JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadInitial);

  const login = useCallback((data: AuthResponseDto) => {
    const { token, ...user } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ token: null, user: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAuthenticated: !!state.token,
        isAdmin: state.user?.role === 'Admin',
        isStateManager: state.user?.role === 'StateManager',
        isLaboratory: state.user?.role === 'Laboratory',
        isPharmacist: state.user?.role === 'Pharmacist',
        facilityId: state.user?.facilityId ?? null,
        state: state.user?.state ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
