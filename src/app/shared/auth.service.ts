import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly TOKEN_KEY = 'userToken';

    constructor(private router: Router) { }

    // ✅ Save token (usually from login API)
    // login(token: string): void {
    //     localStorage.setItem(this.TOKEN_KEY, token);
    // }

    // // ✅ Remove token and redirect to login
    // logout(): void {
    //     localStorage.removeItem(this.TOKEN_KEY);
    //     this.router.navigate(['/login']);
    // }

    // ✅ Check if user is logged in
    isLoggedIn(): boolean {
        return !!sessionStorage.getItem(this.TOKEN_KEY);
    }

    // ✅ Get stored token (for API calls)
    // getToken(): string | null {
    //     return localStorage.getItem(this.TOKEN_KEY);
    // }
}
