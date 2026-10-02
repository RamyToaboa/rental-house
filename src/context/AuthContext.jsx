import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('realEstateUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('realEstateUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('realEstateUser');
      }
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  }, [user]);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Demo credentials — you can change this
        if (email === 'admin@example.com' && password === 'admin123') {
          const userData = {
            id: 1,
            name: 'James Anderson',
            email: 'admin@example.com',
            role: 'Administrator',
            avatar: 'https://i.pravatar.cc/150?u=james',
          };
          setUser(userData);
          resolve(userData);
        } else {
          reject(new Error('Invalid email or password. Try admin@example.com / admin123'));
        }
      }, 800); // simulate network latency
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};