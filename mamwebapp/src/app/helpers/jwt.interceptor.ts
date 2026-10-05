import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const explicitlyAnonymous = request.headers.has('No-Auth');
        if (explicitlyAnonymous) {
            request = request.clone({ headers: request.headers.delete('No-Auth') });
        }

        const target = new URL(request.url, location.origin);
        const apiOrigin = environment.apiUrl
            ? new URL(environment.apiUrl, location.origin).origin
            : location.origin;
        const isApiRequest = target.origin === apiOrigin && target.pathname.startsWith('/api/');
        const isAuthenticationRequest = target.pathname.endsWith('/api/user/authenticate');
        const token = this.authenticationService.currentUserValue?.token;
        if (!explicitlyAnonymous && isApiRequest && !isAuthenticationRequest && token) {
            request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }

        return next.handle(request);
    }
}
