import { User } from '@/auth/interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const BACKEND_URL = environment.BACKEND_URL;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  private http = inject(HttpClient);

  checkStatusResource = rxResource({
    loader: () => this.checkStatus(),
  }); 

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) {
      return 'authenticated';
    }

    return 'not-authenticated';
  });

  user = computed<User | null>(() => {
    return this._user();
  });

  token = computed<string | null>(() => {
    return this._token();
  });

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${BACKEND_URL}/api/auth/login`, { email, password })
      .pipe(
        tap((response) => this.authSuccess(response)),
        map(() => true),
        catchError((error: any) => this.authError(error))
      );
  }

  checkStatus(): Observable<boolean> {

    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of(false);
    }

    return this.http
      .get<AuthResponse>(`${BACKEND_URL}/api/auth/check-status`, {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      })
      .pipe(
        map((response) => this.authSuccess(response)),
        catchError((error: any) => this.authError(error))
      );
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    // localStorage.removeItem('token');
  }

  private authSuccess({ user, token }: AuthResponse) {
    this._authStatus.set('authenticated');
    this._user.set(user);
    this._token.set(token);

    localStorage.setItem('token', token);

    return true;
  }

  private authError(error: any) {
    this.logout();
    return of(false);
  }
}
