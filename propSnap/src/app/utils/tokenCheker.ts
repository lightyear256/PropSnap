export function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Invalid token', error);
        return true; 
    }
}

export function isLoggedIn(token: string | null): boolean {
    if (!token) return false;
    return !isTokenExpired(token);
}