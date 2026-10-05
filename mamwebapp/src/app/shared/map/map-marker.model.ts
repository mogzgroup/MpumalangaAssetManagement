export interface MapMarkerData {
  id?: string | number;
  longitude: number | string;
  latitude: number | string;
  title: string;
  description?: string;
  data?: unknown;
}

export function validCoordinates(
  longitude: number | string | null | undefined,
  latitude: number | string | null | undefined
): [number, number] | null {
  if (longitude === null || longitude === undefined || String(longitude).trim() === '' ||
      latitude === null || latitude === undefined || String(latitude).trim() === '') {
    return null;
  }

  const lng = Number(longitude);
  const lat = Number(latitude);
  if (!Number.isFinite(lng) || !Number.isFinite(lat) ||
      lng < -180 || lng > 180 || lat < -90 || lat > 90 ||
      (lng === 0 && lat === 0)) {
    return null;
  }

  return [lng, lat];
}
