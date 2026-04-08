import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  register: (email: string, firstName: string, lastName: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

interface BackendUser {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'user' | 'admin';
}

type LoginResponse = {
  accessToken?: string;
  token?: string;
  jwt?: string;
  user?: BackendUser;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getFullName = (user: BackendUser): string => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.email;
};

const mapBackendUser = (user: BackendUser): User => ({
  id: user._id || user.id || '',
  email: user.email,
  name: getFullName(user),
  role: user.role,
});

const getAuthToken = (response: LoginResponse): string | null =>
  response.accessToken || response.token || response.jwt || null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = apiClient.getToken();
    if (!savedToken) {
      setIsInitializing(false);
      return;
    }

    setToken(savedToken);
    apiClient.setToken(savedToken);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiClient.get<BackendUser>('/user');
      setUser(mapBackendUser(response));
    } catch {
      localStorage.removeItem('accessToken');
      setToken(null);
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  };

  const register = async (email: string, firstName: string, lastName: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/user/auth', {
        email,
        firstName,
        lastName,
        password,
      });
    } catch (err) {
      const errorMsg = (err as any).message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<LoginResponse>('/user/auth/login', { email, password });
      const authToken = getAuthToken(response);

      if (!authToken) {
        throw new Error('Login succeeded but no auth token was returned by the backend.');
      }

      setToken(authToken);
      apiClient.setToken(authToken);

      const userResponse = response.user ?? await apiClient.get<BackendUser>('/user');
      setUser(mapBackendUser(userResponse));
    } catch (err) {
      const errorMsg = (err as any).message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/user/logout');
    } catch {
      // Even if the API logout fails, we still clear the local session.
    } finally {
      setUser(null);
      setToken(null);
      apiClient.setToken(null);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    isInitializing,
    isLoading,
    error,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
