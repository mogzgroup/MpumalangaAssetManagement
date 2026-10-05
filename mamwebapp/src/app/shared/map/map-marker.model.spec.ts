import { mapConfig } from './map-config';
import { validCoordinates } from './map-marker.model';

describe('MapLibre configuration and coordinates', () => {
  it('uses the OpenFreeMap Liberty style and the existing Mpumalanga map view', () => {
    expect(mapConfig.style).toBe('https://tiles.openfreemap.org/styles/liberty');
    expect(mapConfig.defaultCenter).toEqual([30.0752488, -26.0722042]);
    expect(mapConfig.defaultZoom).toBe(8);
  });

  it('normalizes valid coordinates to longitude-first order', () => {
    expect(validCoordinates('30.0752', '-26.0722')).toEqual([30.0752, -26.0722]);
  });

  it('rejects absent, out-of-range, non-numeric, and empty coordinates', () => {
    expect(validCoordinates(null, -26)).toBeNull();
    expect(validCoordinates('', '-26')).toBeNull();
    expect(validCoordinates('181', '-26')).toBeNull();
    expect(validCoordinates('30', '91')).toBeNull();
    expect(validCoordinates('not-a-number', '-26')).toBeNull();
    expect(validCoordinates('0', '0')).toBeNull();
  });

  it('allows valid coordinates on the equator or prime meridian', () => {
    expect(validCoordinates(0, -26)).toEqual([0, -26]);
    expect(validCoordinates(30, 0)).toEqual([30, 0]);
  });
});
