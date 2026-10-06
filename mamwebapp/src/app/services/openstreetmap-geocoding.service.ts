import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, defer, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

@Injectable({ providedIn: 'root' })
export class OpenStreetMapGeocodingService {
  private http = inject(HttpClient);

  private readonly searchUrl = 'https://nominatim.openstreetmap.org/search';
  private nextRequestAt = 0;

  searchAddress(address: string): Observable<GeocodingResult[]> {
    const params = new HttpParams()
      .set('format', 'jsonv2')
      .set('countrycodes', 'za')
      .set('limit', '5')
      .set('q', address);
    return defer(() => {
      const now = Date.now();
      const delay = Math.max(0, this.nextRequestAt - now);
      this.nextRequestAt = Math.max(now, this.nextRequestAt) + 1000;
      return delay > 0
        ? timer(delay).pipe(switchMap(() => this.http.get<GeocodingResult[]>(this.searchUrl, { params })))
        : this.http.get<GeocodingResult[]>(this.searchUrl, { params });
    });
  }
}
