import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount (Session Persistence)
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      let restored = null;
      if (savedUser) {
        try {
          restored = JSON.parse(savedUser);
          setUser(restored);
        } catch (e) {}
      }

      if (token && token !== 'demo_token_phone') {
        try {
          const res = await api.get('/users/me');
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Backend session restore notice:', err);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password, expectedRole) => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      if (expectedRole) {
        params.append('expected_role', expectedRole);
      }

      const loginRes = await api.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, user: loggedUser } = loginRes.data;

      // Strict role check: if an expectedRole was required, confirm it matches
      if (expectedRole && loggedUser?.role && loggedUser.role.toLowerCase() !== expectedRole.toLowerCase()) {
        const actualRoleFormatted = loggedUser.role.charAt(0).toUpperCase() + loggedUser.role.slice(1);
        const expectedRoleFormatted = expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1);
        const roleMismatchMsg = `Access Denied: This account is registered as a ${actualRoleFormatted}. You cannot log in via the ${expectedRoleFormatted} portal tab. Please select the ${actualRoleFormatted} tab.`;
        setLoading(false);
        setError(roleMismatchMsg);
        throw new Error(roleMismatchMsg);
      }

      localStorage.setItem('token', access_token);
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setLoading(false);
      return loggedUser;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.detail || err.message || 'Authentication failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };


  const loginWithPin = async (identifier, pin, expectedRole = 'elder') => {
    setError(null);
    setLoading(true);
    try {
      const loginRes = await api.post('/auth/pin-login', {
        identifier,
        pin,
        expected_role: expectedRole,
      });

      const { access_token, user: loggedUser, profile } = loginRes.data;

      // Strict role check
      if (expectedRole && loggedUser?.role && loggedUser.role.toLowerCase() !== expectedRole.toLowerCase()) {
        const actualRoleFormatted = loggedUser.role.charAt(0).toUpperCase() + loggedUser.role.slice(1);
        const expectedRoleFormatted = expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1);
        const roleMismatchMsg = `Access Denied: This account is registered as a ${actualRoleFormatted}. You cannot log in via the ${expectedRoleFormatted} portal tab.`;
        setLoading(false);
        setError(roleMismatchMsg);
        throw new Error(roleMismatchMsg);
      }

      if (access_token) {
        localStorage.setItem('token', access_token);
      }
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      if (profile) {
        const existing = JSON.parse(localStorage.getItem('elder_profile') || '{}');
        localStorage.setItem('elder_profile', JSON.stringify({
          ...existing,
          ...profile,
          careCode: profile.care_code || profile.careCode || existing.careCode,
          name: profile.name || loggedUser.name,
          phone: profile.phone || loggedUser.phone,
          pin: profile.pin || pin,
          isCompleted: true,
        }));
        if (profile.care_code) {
          localStorage.setItem('elder_care_code', profile.care_code);
        }
      }

      // Update registered users cache with the authenticated credentials
      const regUsers = JSON.parse(localStorage.getItem('hs_registered_users') || '[]');
      const userIndex = regUsers.findIndex(u => 
        (u.phone && u.phone === loggedUser.phone) || 
        (u.email && u.email.toLowerCase() === loggedUser.email?.toLowerCase())
      );
      if (userIndex >= 0) {
        regUsers[userIndex] = { ...regUsers[userIndex], ...loggedUser, pin };
      } else {
        regUsers.push({ ...loggedUser, pin });
      }
      localStorage.setItem('hs_registered_users', JSON.stringify(regUsers));

      setLoading(false);
      return { user: loggedUser, profile };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.detail || err.message || 'PIN verification failed. Please check your PIN or identifier.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (email, password, firstName, lastName, role, phone = '', pin = '') => {
    setError(null);
    setLoading(true);
    try {
      const regRes = await api.post('/auth/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
        phone,
        pin,
      });
      const { access_token, user: loggedUser } = regRes.data || {};
      if (access_token && loggedUser) {
        localStorage.setItem('token', access_token);
        setUser(loggedUser);
        localStorage.setItem('user', JSON.stringify(loggedUser));
      }
      setLoading(false);
      return regRes.data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.detail || 'Registration failed. Please check inputs.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const token = localStorage.getItem('token');

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, error, login, loginWithPin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
