import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  signup(data: { name: string; email: string; phone: string; password: string }) {
    return this.http.post<{ msg: string; phone: string }>(`${this.api}/signup`, data);
  }

  verifyOtp(phone: string, otp: string) {
    return this.http.post<{ msg: string; token: string }>(
      `${this.api}/verify-otp`, { phone, otp }
    ).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  login(email: string, password: string) {
    return this.http.post<{ msg: string; token: string }>(
      `${this.api}/login`, { email, password }
    ).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
