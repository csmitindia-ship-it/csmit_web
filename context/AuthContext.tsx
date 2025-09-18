import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: { email: string; role: 'admin' | 'student' | null; name?: string } | null;
  login: (email: string, role: 'admin' | 'student', name?: string) => void;
  logout: () => void;
  loading: boolean; // Add loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; role: 'admin' | 'student' | null; name?: string } | null>(() => {
    // Initialize user from sessionStorage
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true); // Initialize loading to true

  useEffect(() => {
    // Persist user to sessionStorage whenever it changes
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
    setLoading(false); // Set loading to false after user is initialized/persisted
  }, [user]);

  const login = (email: string, role: 'admin' | 'student', name?: string) => {
    setUser({ email, role, name });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
