import { HttpHandler, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../services/authentication.service';
import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  it('adds the bearer token to API requests', () => {
    const authenticationService = {
      currentUserValue: { token: 'signed-token' }
    } as AuthenticationService;
    TestBed.configureTestingModule({
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });
    const interceptor = TestBed.runInInjectionContext(() => new JwtInterceptor());
    let interceptedRequest: HttpRequest<unknown> | undefined;
    const handler: HttpHandler = {
      handle: request => {
        interceptedRequest = request;
        return of(new HttpResponse());
      }
    };

    interceptor.intercept(
      new HttpRequest('GET', `${environment.apiUrl}/api/facility/getallfacilities`),
      handler
    ).subscribe();

    expect(interceptedRequest?.headers.get('Authorization')).toBe('Bearer signed-token');
  });

  it('does not send the token or No-Auth marker with the login request', () => {
    const authenticationService = {
      currentUserValue: { token: 'signed-token' }
    } as AuthenticationService;
    TestBed.configureTestingModule({
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });
    const interceptor = TestBed.runInInjectionContext(() => new JwtInterceptor());
    let interceptedRequest: HttpRequest<unknown> | undefined;
    const handler: HttpHandler = {
      handle: request => {
        interceptedRequest = request;
        return of(new HttpResponse());
      }
    };
    const loginRequest = new HttpRequest(
      'POST',
      `${environment.apiUrl}/api/user/authenticate`,
      {},
      { headers: new HttpHeaders({ 'No-Auth': 'True' }) }
    );

    interceptor.intercept(loginRequest, handler).subscribe();

    expect(interceptedRequest?.headers.has('Authorization')).toBe(false);
    expect(interceptedRequest?.headers.has('No-Auth')).toBe(false);
  });
});
