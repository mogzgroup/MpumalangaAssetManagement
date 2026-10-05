import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
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
        return this.http.get<any>(`${environment.apiUrl}/api/user/login/${username}/${password}`, {headers: reqHeader})
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            }));
    }


    logout() {
        // remove user from local storage to log user out
        this.clearSession();
        location.reload();
    }

    clearSession() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}
