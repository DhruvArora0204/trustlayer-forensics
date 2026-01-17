import { useState, useCallback, useEffect } from 'react';
import { AuthUser } from '../types';

const USER_STORAGE_KEY = 'trustlayer-auth-user';
const USER_DB_KEY = 'trustlayer-user-database';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setIsInitialized(true);
  }, []);

  const login = useCallback((userToLogin: AuthUser) => {
    // This is the core login function that sets the session
    setUser(userToLogin);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToLogin));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Optional: If you want google to forget the user for one-tap sign-in
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  const getStoredUsers = (): (AuthUser & { password?: string })[] => {
    try {
      const db = localStorage.getItem(USER_DB_KEY);
      return db ? JSON.parse(db) : [];
    } catch {
      return [];
    }
  };

  const signup = useCallback((name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      return { success: false, message: 'All fields are required.' };
    }
    const users = getStoredUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    
    // WARNING: Storing plaintext passwords in localStorage is highly insecure.
    // This is for demonstration purposes only in a backend-less environment.
    // In a real application, NEVER do this. Use a secure backend with password hashing.
    const newUser = { name, email, password };
    const updatedUsers = [...users, newUser];
    localStorage.setItem(USER_DB_KEY, JSON.stringify(updatedUsers));

    const userToLogin: AuthUser = { name, email };
    login(userToLogin);

    return { success: true, message: 'Signup successful!' };
  }, [login]);

  const loginWithPassword = useCallback((email: string, password: string) => {
    const users = getStoredUsers();
    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      return { success: false, message: 'No account found with this email.' };
    }
    
    // WARNING: Comparing plaintext passwords. See warning in signup function.
    if (foundUser.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    const userToLogin: AuthUser = { name: foundUser.name, email: foundUser.email };
    login(userToLogin);
    
    return { success: true, message: 'Login successful!' };
  }, [login]);

  return { user, login, logout, signup, loginWithPassword, isInitialized };
};