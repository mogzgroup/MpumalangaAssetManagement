import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, shareReplay, tap } from 'rxjs/operators';

import { HTTP_CACHE_TTL } from './http-cache';
import { AuthenticationService } from '../services/authentication.service';

interface CacheEntry {
  expiresAt: number;
  response: HttpResponse<unknown>;
}

@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {
  private authenticationService = inject(AuthenticationService);

  private static readonly MAX_CACHE_ENTRIES = 100;
  private readonly responses = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Observable<HttpEvent<unknown>>>();
  private currentUserId: number | null = null;
  private currentUserToken: string | null = null;
  private cacheRevision = 0;

  constructor() {
    const currentUser = this.authenticationService.currentUserValue;
    this.currentUserId = currentUser?.id ?? null;
    this.currentUserToken = currentUser?.token ?? null;
    this.authenticationService.currentUser.subscribe(user => {
      this.clearForIdentityChange(user?.id ?? null, user?.token ?? null);
    });
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const userId = this.authenticationService.currentUserValue?.id ?? null;
    this.clearForIdentityChange(userId, this.authenticationService.currentUserValue?.token ?? null);

    if (request.method !== 'GET') {
      return next.handle(request).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            this.clearCache();
          }
        })
      );
    }

    const ttl = request.context.get(HTTP_CACHE_TTL);
    if (ttl <= 0 || userId === null) {
      return next.handle(request);
    }

    const key = `${userId}:${request.urlWithParams}:${request.responseType}:${request.headers.get('Accept') ?? ''}`;
    const cached = this.responses.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return of(this.cloneResponse(cached.response));
    }
    if (cached) {
      this.responses.delete(key);
    }

    const existingRequest = this.inFlight.get(key);
    if (existingRequest) {
      return existingRequest;
    }

    const requestRevision = this.cacheRevision;
    let sharedRequest: Observable<HttpEvent<unknown>>;
    sharedRequest = next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse && requestRevision === this.cacheRevision) {
          this.removeExpiredEntries();
          if (this.responses.size >= HttpCacheInterceptor.MAX_CACHE_ENTRIES) {
            const oldestKey = this.responses.keys().next().value;
            if (oldestKey !== undefined) {
              this.responses.delete(oldestKey);
            }
          }
          this.responses.set(key, {
            expiresAt: Date.now() + ttl,
            response: this.cloneResponse(event)
          });
        }
      }),
      finalize(() => {
        if (this.inFlight.get(key) === sharedRequest) {
          this.inFlight.delete(key);
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.inFlight.set(key, sharedRequest);

    return sharedRequest;
  }

  private clearForIdentityChange(userId: number | null, token: string | null): void {
    if (this.currentUserId !== userId || this.currentUserToken !== token) {
      this.currentUserId = userId;
      this.currentUserToken = token;
      this.clearCache();
    }
  }

  private removeExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.responses) {
      if (entry.expiresAt <= now) {
        this.responses.delete(key);
      }
    }
  }

  private clearCache(): void {
    this.cacheRevision++;
    this.responses.clear();
    this.inFlight.clear();
  }

  private cloneResponse(response: HttpResponse<unknown>): HttpResponse<unknown> {
    const body = response.body;
    const clonedBody = body !== null && typeof body === 'object'
      ? JSON.parse(JSON.stringify(body))
      : body;
    return response.clone({ body: clonedBody });
  }
}
