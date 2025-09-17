import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: { email: string; role: 'admin' | 'student' | null; name?: string } | null;
  login: (email: string, role: 'admin' | 'student', name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; role: 'admin' | 'student' | null; name?: string } | null>(() => {
    // Initialize user from localStorage
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Persist user to localStorage whenever it changes
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
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
