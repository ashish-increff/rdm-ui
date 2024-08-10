// utils/auth.ts

export const isAuthenticated = (): boolean => {
    const sessionId = getCookie('sessionId');
    const authToken = getCookie('authToken');
    return Boolean(sessionId && authToken);
};


  
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };