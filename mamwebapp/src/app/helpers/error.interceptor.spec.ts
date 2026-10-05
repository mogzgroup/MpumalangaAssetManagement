import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { ErrorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  it('clears the session and redirects to login after an unauthorized API response', () => {
    const authenticationService = {
      clearSession: jasmine.createSpy('clearSession')
    } as unknown as AuthenticationService;
    const router = {
      url: '/dashboard',
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
    } as unknown as Router;
    const interceptor = new ErrorInterceptor(authenticationService, router);
    const handler: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 401 }))
    };

    interceptor.intercept(
      new HttpRequest('GET', '/api/facility/getallfacilities'),
      handler
    ).subscribe({ error: () => undefined });

    expect(authenticationService.clearSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not redirect or clear the session for a rejected login', () => {
    const authenticationService = {
      clearSession: jasmine.createSpy('clearSession')
    } as unknown as AuthenticationService;
    const router = {
      url: '/login',
      navigate: jasmine.createSpy('navigate')
    } as unknown as Router;
    const interceptor = new ErrorInterceptor(authenticationService, router);
    const handler: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 401 }))
    };

    interceptor.intercept(
      new HttpRequest('POST', '/api/user/authenticate', {}),
      handler
    ).subscribe({ error: () => undefined });

    expect(authenticationService.clearSession).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
