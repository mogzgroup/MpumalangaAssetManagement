import {
  HttpContext,
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';
import { HTTP_CACHE_TTL } from './http-cache';
import { HttpCacheInterceptor } from './http-cache.interceptor';

class CountingHttpHandler extends HttpHandler {
  requestCount = 0;

  handle(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    this.requestCount++;
    return of(new HttpResponse({
      body: { requestCount: this.requestCount },
      url: request.url
    }));
  }
}

describe('HttpCacheInterceptor', () => {
  let interceptor: HttpCacheInterceptor;
  let handler: CountingHttpHandler;

  beforeEach(() => {
    const currentUser = { id: 7, token: 'test-token' };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    interceptor = new HttpCacheInterceptor(new AuthenticationService(null));
    handler = new CountingHttpHandler();
  });

  afterEach(() => localStorage.removeItem('currentUser'));

  it('reuses cached GET responses for the same signed-in user', () => {
    const request = new HttpRequest('GET', '/api/lookups', null, {
      context: new HttpContext().set(HTTP_CACHE_TTL, 30_000)
    });
    const responses: HttpResponse<unknown>[] = [];

    interceptor.intercept(request, handler).subscribe(event => {
      if (event instanceof HttpResponse) {
        responses.push(event);
      }
    });
    interceptor.intercept(request, handler).subscribe(event => {
      if (event instanceof HttpResponse) {
        responses.push(event);
      }
    });

    expect(handler.requestCount).toBe(1);
    expect(responses.length).toBe(2);
    expect(responses[1].body).toEqual({ requestCount: 1 });
    expect(responses[1].body).not.toBe(responses[0].body);
  });

  it('invalidates cached GET responses after a successful write', () => {
    const getRequest = new HttpRequest('GET', '/api/lookups', null, {
      context: new HttpContext().set(HTTP_CACHE_TTL, 30_000)
    });
    let response: HttpResponse<unknown>;

    interceptor.intercept(getRequest, handler).subscribe(event => {
      if (event instanceof HttpResponse) {
        response = event;
      }
    });
    interceptor.intercept(new HttpRequest('POST', '/api/update', {}), handler).subscribe();
    interceptor.intercept(getRequest, handler).subscribe(event => {
      if (event instanceof HttpResponse) {
        response = event;
      }
    });

    expect(handler.requestCount).toBe(3);
    expect(response.body).toEqual({ requestCount: 3 });
  });
});
