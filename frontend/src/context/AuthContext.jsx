import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we have a token but no user, try to fetch the user profile
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axiosInstance.get('/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // If token is invalid/expired, clear it
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token: newToken, data } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
