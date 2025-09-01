import { User } from '../types';

const USERS_KEY = 'scfhs_users';
const SESSION_KEY = 'scfhs_session';

// Helper to get users from localStorage
const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (e) {
        return [];
    }
};

// Helper to save users to localStorage
const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Seed an admin user if none exists
const seedAdmin = () => {    
    const users = getUsers();
    const adminExists = users.some(u => u.role === 'admin');
    if (!adminExists) {
        const adminUser: User = {
            id: Date.now(),
            name: 'Admin',
            email: 'admin@scfhs.com',
            password: 'admin', // In a real app, this should be hashed
            age: 0,
            phone: '000-000-0000',
            role: 'admin',
        };
        users.push(adminUser);
        saveUsers(users);
    }
};

// Initialize
seedAdmin();

export const signup = async (userData: Omit<User, 'id' | 'role'>): Promise<User> => {
    const users = getUsers();
    const userExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());

    if (userExists) {
        throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
        ...userData,
        id: Date.now(),
        role: 'user',
    };

    users.push(newUser);
    saveUsers(users);
    return newUser;
};

export const login = async (email: string, password: string): Promise<User> => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        throw new Error('Invalid email or password.');
    }

    if (user.password !== password) { // Plain text comparison for this simulation
        throw new Error('Invalid email or password.');
    }
    
    // Set session
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));

    return user;
};

export const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
    try {
        const user = sessionStorage.getItem(SESSION_KEY);
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
};

export const getAllUsers = (): User[] => {
    return getUsers().filter(u => u.role === 'user'); // Return only regular users to the admin
};
