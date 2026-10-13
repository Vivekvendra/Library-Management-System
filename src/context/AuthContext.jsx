/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

const USERS_STORAGE_KEY = 'librax_users';
const CURRENT_USER_STORAGE_KEY = 'librax_current_user';
const REMEMBERED_LOGIN_KEY = 'librax_remembered_identifier';

const DEFAULT_USERS = [
  {
    id: 'usr-101',
    fullName: 'Eleanor Vance',
    username: 'librarian',
    email: 'admin@librax.com',
    password: 'password123',
    role: 'Chief Librarian',
    department: 'Central Archive & Collections',
    joinedDate: '2024-01-15',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-102',
    fullName: 'Arthur Pendelton',
    username: 'arthur',
    email: 'arthur@librax.com',
    password: 'password123',
    role: 'Senior Curator',
    department: 'Rare Manuscripts',
    joinedDate: '2024-06-10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  },
];

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

function getStoredCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => getStoredUsers());
  const [user, setUser] = useState(() => getStoredCurrentUser());
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (err) {
      console.error('Failed to persist users list in localStorage:', err);
    }
  }, [users]);

  const saveSessionUser = (userObj) => {
    const safeUser = {
      id: userObj.id,
      fullName: userObj.fullName,
      username: userObj.username,
      email: userObj.email,
      role: userObj.role || 'Librarian',
      department: userObj.department || 'General Collections',
      joinedDate: userObj.joinedDate || new Date().toISOString().split('T')[0],
      avatar: userObj.avatar || null,
      lastLoginAt: new Date().toISOString(),
    };
    setUser(safeUser);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(safeUser));
    return safeUser;
  };

  const login = async ({ identifier, password, rememberMe }) => {
    setAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));

    const cleanId = (identifier || '').trim().toLowerCase();
    const currentUsers = getStoredUsers();

    const matchedUser = currentUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId
    );

    if (!matchedUser) {
      setAuthLoading(false);
      toast.error('No account found with that Email or Username.');
      return {
        success: false,
        message: 'No account found with that Email or Username.',
      };
    }

    if (matchedUser.password !== password) {
      setAuthLoading(false);
      toast.error('Invalid password. Please check your credentials and try again.');
      return {
        success: false,
        message: 'Incorrect password. Please try again.',
      };
    }

    if (rememberMe) {
      localStorage.setItem(REMEMBERED_LOGIN_KEY, identifier.trim());
    } else {
      localStorage.removeItem(REMEMBERED_LOGIN_KEY);
    }

    const sessionUser = saveSessionUser(matchedUser);
    setAuthLoading(false);
    toast.success(`Welcome back to LibraX, ${sessionUser.fullName}!`);
    return { success: true, user: sessionUser };
  };

  const register = async ({ fullName, username, email, password, role }) => {
    setAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const currentUsers = getStoredUsers();

    const emailExists = currentUsers.some(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (emailExists) {
      setAuthLoading(false);
      toast.error('An account with this email address is already registered.');
      return {
        success: false,
        message: 'An account with this email address already exists.',
      };
    }

    const usernameExists = currentUsers.some(
      (u) => u.username.toLowerCase() === cleanUsername
    );
    if (usernameExists) {
      setAuthLoading(false);
      toast.error('That username is already taken. Please choose another.');
      return {
        success: false,
        message: 'That username is already taken.',
      };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      fullName: fullName.trim(),
      username: username.trim(),
      email: cleanEmail,
      password,
      role: role || 'Librarian',
      department: 'Main Library Branch',
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: null,
    };

    const updatedUsers = [newUser, ...currentUsers];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    const sessionUser = saveSessionUser(newUser);
    setAuthLoading(false);
    toast.success(`Account created! Welcome to LibraX, ${sessionUser.fullName}.`);
    return { success: true, user: sessionUser };
  };

  const resetPassword = async ({ email, newPassword }) => {
    setAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));

    const cleanEmail = (email || '').trim().toLowerCase();
    const currentUsers = getStoredUsers();
    const idx = currentUsers.findIndex(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        u.username.toLowerCase() === cleanEmail
    );

    if (idx === -1) {
      setAuthLoading(false);
      toast.error('We could not find an account matching that email or username.');
      return {
        success: false,
        message: 'No registered account matches that email or username.',
      };
    }

    const updatedUsers = [...currentUsers];
    updatedUsers[idx] = {
      ...updatedUsers[idx],
      password: newPassword,
    };
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    setAuthLoading(false);
    toast.success('Password updated! You can now log in with your new password.');
    return { success: true, email: updatedUsers[idx].email };
  };

  const socialLogin = async (providerName) => {
    setAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const providerProfiles = {
      Google: {
        id: 'usr-google',
        fullName: 'Eleanor Vance',
        username: 'eleanor.google',
        email: 'eleanor.vance@gmail.com',
        role: 'Head Librarian',
        department: 'Digital & Print Archives',
      },
      Microsoft: {
        id: 'usr-microsoft',
        fullName: 'Julian Sterling',
        username: 'julian.ms',
        email: 'julian.sterling@outlook.com',
        role: 'Library Administrator',
        department: 'Academic Collections',
      },
      GitHub: {
        id: 'usr-github',
        fullName: 'Clara Oswald',
        username: 'clara-dev',
        email: 'clara@github.io',
        role: 'Systems Librarian',
        department: 'Catalog Engineering',
      },
    };

    const profile = providerProfiles[providerName] || providerProfiles.Google;
    const sessionUser = saveSessionUser(profile);
    setAuthLoading(false);
    toast.success(`Signed in with ${providerName} as ${sessionUser.fullName}`);
    return { success: true, user: sessionUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    toast.info('You have been securely logged out of LibraX.');
  };

  const getRememberedIdentifier = useCallback(() => {
    return localStorage.getItem(REMEMBERED_LOGIN_KEY) || '';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: Boolean(user),
        authLoading,
        login,
        register,
        resetPassword,
        socialLogin,
        logout,
        getRememberedIdentifier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
