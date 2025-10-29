import { User } from '../types';

// In a real application, this would be an API call.
// Here, we simulate a user database in localStorage.
const USERS_DB_KEY = 'agriconnect-users';
const SESSION_KEY = 'agriconnect-session';

export const loginUser = async (email: string, pass: string): Promise<User> => {
    const usersJson = localStorage.getItem(USERS_DB_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];
    const foundUser = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

    // NOTE: In a real app, password would be hashed and checked on the backend.
    if (foundUser) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
        return foundUser;
    } else {
        throw new Error('User not found or password incorrect.');
    }
};

export const signupUser = async (name: string, email: string, pass: string): Promise<User> => {
    const usersJson = localStorage.getItem(USERS_DB_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];
    const existingUser = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
        throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
};

export const logoutUser = (): void => {
    localStorage.removeItem(SESSION_KEY);
};

export const checkSession = (): User | null => {
    try {
        const sessionUserJson = localStorage.getItem(SESSION_KEY);
        if (sessionUserJson) {
            return JSON.parse(sessionUserJson);
        }
        return null;
    } catch (error) {
        console.error("Failed to parse session user from localStorage", error);
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
};