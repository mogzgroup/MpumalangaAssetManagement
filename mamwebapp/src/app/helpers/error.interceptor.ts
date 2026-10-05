import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    private redirectingToLogin = false;

    constructor(
        private authenticationService: AuthenticationService,
        private router: Router
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError((error: HttpErrorResponse) => {
            const authenticationRequest = new URL(request.url, location.origin)
                .pathname.endsWith('/api/user/authenticate');
            if (error.status === 401 && !authenticationRequest && !this.redirectingToLogin) {
                this.redirectingToLogin = true;
                this.authenticationService.clearSession();
                if (!this.router.url.startsWith('/login')) {
                    void this.router.navigate(['/login']).then(
                        () => this.redirectingToLogin = false,
                        () => this.redirectingToLogin = false
                    );
                } else {
                    this.redirectingToLogin = false;
                }
            }
            return throwError(() => error);
        }));
    }
}
