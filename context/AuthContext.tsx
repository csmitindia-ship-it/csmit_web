import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: { email: string; role: 'admin' | 'student' | null; name?: string } | null;
  login: (email: string, role: 'admin' | 'student', name?: string) => void;
  logout: () => void;
  loading: boolean;
  isLoggedIn: boolean;
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
    console.log('AuthContext: useEffect - user state changed:', user);
    // Persist user to sessionStorage whenever it changes
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      console.log('AuthContext: User stored in sessionStorage.');
    } else {
      sessionStorage.removeItem('user');
      console.log('AuthContext: User removed from sessionStorage.');
    }
    setLoading(false); // Set loading to false after user is initialized/persisted
  }, [user]);

  const login = (email: string, role: 'admin' | 'student', name?: string) => {
    console.log('AuthContext: login function called with user:', { email, role, name });
    setUser({ email, role, name });
  };

  const logout = () => {
    console.log('AuthContext: logout function called.');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isLoggedIn: !!user }}>
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
