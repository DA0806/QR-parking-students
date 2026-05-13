import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

/**
 * User interface representing a user in the system
 */
export type User = {
  id: number;
  name: string;
  role: 'student' | 'admin';
  email: string;
};

/**
 * AuthContext type definition
 */
type AuthContextType = {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

/**
 * AuthContext for managing user authentication state
 * Provides login, logout, and user data across the application
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to access the AuthContext
 * @throws {Error} if used outside of AuthProvider
 * @returns {AuthContextType} The authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * AuthProvider component that wraps the application with authentication context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const db = useSQLiteContext();

  /**
   * Login function that authenticates a user by email
   * @param {string} email - User's email address
   * @returns {Promise<boolean>} True if login successful, false otherwise
   */
  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const result = await db.getFirstAsync<User>('SELECT * FROM Users WHERE email = ?', [email]);
      if (result) {
        setUser(result);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function that clears the current user session
   */
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
