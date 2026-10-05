import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OpenStreetMapGeocodingService } from './openstreetmap-geocoding.service';

describe('OpenStreetMapGeocodingService', () => {
  let service: OpenStreetMapGeocodingService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(OpenStreetMapGeocodingService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('limits address lookup to South Africa and returns candidate locations', () => {
    let result: Array<{ display_name: string; lat: string; lon: string }>;
    service.searchAddress('Mbombela').subscribe(locations => result = locations);
    const request = httpTestingController.expectOne(request =>
      request.url === 'https://nominatim.openstreetmap.org/search' &&
      request.params.get('q') === 'Mbombela'
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('format')).toBe('jsonv2');
    expect(request.request.params.get('countrycodes')).toBe('za');
    expect(request.request.params.get('limit')).toBe('5');
    request.flush([{ place_id: 1, display_name: 'Mbombela, South Africa', lat: '-25.47', lon: '30.98' }]);

    expect(result[0].display_name).toBe('Mbombela, South Africa');
    expect(result[0].lon).toBe('30.98');
  });
});
