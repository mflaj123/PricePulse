import { User } from '../types';

const BACKEND_URL = 'https://shopping-backend-635452941137.europe-west2.run.app';

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for passing the session cookie
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            return null;
        }
      throw new Error(`Error fetching user: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        id: data.id || 'unknown',
        name: data.name || 'User',
        email: data.email || '',
        avatar: data.picture || data.avatar || '', // Google usually returns 'picture'
    };
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
};