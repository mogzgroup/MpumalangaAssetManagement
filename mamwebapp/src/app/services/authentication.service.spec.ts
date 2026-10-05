import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('currentUser');
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)) }
        }
      ]
    });
    service = TestBed.inject(AuthenticationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('currentUser');
  });

  it('stores the user and JWT returned by the anonymous login request', () => {
    const user = { id: 42, username: 'test-user', token: 'signed-token' };
    let response: typeof user;

    service.login(user.username, 'password').subscribe(result => response = result);
    const request = httpTestingController.expectOne(`${environment.apiUrl}/api/user/authenticate`);

    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('No-Auth')).toBe('True');
    request.flush(user);

    expect(response?.token).toBe(user.token);
    expect(service.currentUserValue?.id).toBe(user.id);
    expect(JSON.parse(localStorage.getItem('currentUser')).token).toBe(user.token);
  });

  it('clears the stored token and current user on logout', () => {
    localStorage.setItem('currentUser', JSON.stringify({ id: 42, token: 'signed-token' }));
    service.clearSession();

    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(service.currentUserValue).toBeNull();
  });
});
