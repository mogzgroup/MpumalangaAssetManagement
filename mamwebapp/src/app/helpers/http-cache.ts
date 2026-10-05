import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Observable } from 'rxjs';

export const HTTP_CACHE_TTL = new HttpContextToken<number>(() => 0);

export function cachedGet<T>(
  http: HttpClient,
  url: string,
  ttlMilliseconds = 30_000
): Observable<T> {
  return http.get<T>(url, {
    context: new HttpContext().set(HTTP_CACHE_TTL, ttlMilliseconds)
  });
}
