import { environment } from '../../../environments/environment';

export const mapConfig = {
  style: environment.mapStyleUrl,
  defaultCenter: [30.0752488, -26.0722042] as [number, number],
  defaultZoom: 8
};
