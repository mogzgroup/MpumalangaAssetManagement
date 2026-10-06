import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor() {
        let storedUser: User = null;
        try {
            storedUser = JSON.parse(localStorage.getItem('currentUser')) as User;
        } catch {
            localStorage.removeItem('currentUser');
        }
        this.currentUserSubject = new BehaviorSubject<User>(storedUser);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public get isAuthenticated(): boolean {
        const user = this.currentUserValue;
        return !!user && user.id > 0 && typeof user.token === 'string' && user.token.trim().length > 0;
    }

    login(username: string, password: string) {
        const reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'No-Auth': 'True' });
        return this.http.post<any>(
            `${environment.apiUrl}/api/user/authenticate`,
            { username, password },
            { headers: reqHeader }
        )
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            }));
    }


    logout() {
        this.clearSession();
        void this.router.navigate(['/login']);
    }

    clearSession() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}
