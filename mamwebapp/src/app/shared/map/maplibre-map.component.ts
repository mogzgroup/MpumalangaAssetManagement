import {
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent, Popup } from 'maplibre-gl';
import type { Feature, FeatureCollection, Point } from 'geojson';
import { mapConfig } from './map-config';
import { MapMarkerData, validCoordinates } from './map-marker.model';

const LOCATION_SOURCE = 'mam-locations';
const LOCATION_LAYER = 'mam-location-points';
const CLUSTER_LAYER = 'mam-location-clusters';
const CLUSTER_COUNT_LAYER = 'mam-location-cluster-count';

@Component({
  standalone: false,
  selector: 'app-maplibre-map',
  template: `
    <div #mapContainer class="maplibre-container" role="application" aria-label="Interactive map"></div>
    <div class="maplibre-message" *ngIf="mapError" role="status">{{ mapError }}</div>
    <div class="maplibre-loading" *ngIf="!mapReady && !mapError" role="status">Loading map...</div>
  `,
  styleUrls: ['./maplibre-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapLibreMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() markers: MapMarkerData[] = [];
  @Input() center: [number, number] = mapConfig.defaultCenter;
  @Input() zoom = mapConfig.defaultZoom;
  @Input() interactive = true;
  @Output() markerSelected = new EventEmitter<MapMarkerData>();
  @Output() mapClicked = new EventEmitter<[number, number]>();
  @ViewChild('mapContainer', { static: true }) private mapContainer: ElementRef<HTMLDivElement>;

  mapReady = false;
  mapError = '';

  private map: MapLibreMap | null = null;
  private maplibre: typeof import('maplibre-gl') | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private activePopup: Popup | null = null;
  private readonly markersById = new Map<string, MapMarkerData>();
  private destroyed = false;

  constructor(
    private zone: NgZone,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    void this.initializeMap();
  }

  private async initializeMap(): Promise<void> {
    try {
      const maplibre = await import('maplibre-gl');
      if (this.destroyed) {
        return;
      }
      this.maplibre = maplibre;
      maplibre.setWorkerUrl(new URL('assets/maplibre-gl/maplibre-gl-worker.mjs', document.baseURI).href);
      this.map = new maplibre.Map({
        container: this.mapContainer.nativeElement,
        style: mapConfig.style,
        center: this.center || mapConfig.defaultCenter,
        zoom: this.zoom ?? mapConfig.defaultZoom,
        attributionControl: { compact: false },
        cooperativeGestures: true,
        interactive: this.interactive
      });
      this.map.addControl(new maplibre.NavigationControl(), 'top-right');
      this.map.on('load', () => {
        this.zone.run(() => {
          try {
            this.addMarkerLayers();
            this.mapReady = true;
            this.mapError = '';
            this.updateMarkers();
            this.map?.resize();
          } catch {
            this.mapError = 'The map could not be initialized.';
          }
          this.changeDetector.markForCheck();
        });
      });
      this.map.on('error', () => {
        this.zone.run(() => {
          this.mapError = 'The map could not be loaded. Check your connection and try again.';
          this.changeDetector.markForCheck();
        });
      });
      this.map.on('click', event => {
        this.zone.run(() => this.mapClicked.emit([event.lngLat.lng, event.lngLat.lat]));
      });

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.map?.resize());
        this.resizeObserver.observe(this.mapContainer.nativeElement);
      }
      window.addEventListener('resize', this.resizeMap);
    } catch {
      this.zone.run(() => {
        this.mapError = 'The map could not be initialized.';
        this.changeDetector.markForCheck();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) {
      return;
    }
    if (changes['center'] || changes['zoom']) {
      this.map.flyTo({
        center: this.center || mapConfig.defaultCenter,
        zoom: this.zoom ?? mapConfig.defaultZoom
      });
    }
    if (changes['markers']) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    window.removeEventListener('resize', this.resizeMap);
    this.resizeObserver?.disconnect();
    this.activePopup?.remove();
    this.map?.remove();
    this.map = null;
    this.markersById.clear();
  }

  private readonly resizeMap = (): void => {
    this.map?.resize();
  };

  private addMarkerLayers(): void {
    if (!this.map) {
      return;
    }
    this.map.addSource(LOCATION_SOURCE, {
      type: 'geojson',
      data: this.createFeatureCollection(),
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 48
    });
    this.map.addLayer({
      id: CLUSTER_LAYER,
      type: 'circle',
      source: LOCATION_SOURCE,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#17633f',
        'circle-radius': ['step', ['get', 'point_count'], 17, 25, 21, 100, 26],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    });
    this.map.addLayer({
      id: CLUSTER_COUNT_LAYER,
      type: 'symbol',
      source: LOCATION_SOURCE,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: { 'text-color': '#ffffff' }
    });
    this.map.addLayer({
      id: LOCATION_LAYER,
      type: 'circle',
      source: LOCATION_SOURCE,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#17633f',
        'circle-radius': 7,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    });

    this.map.on('click', CLUSTER_LAYER, event => {
      void this.zoomIntoCluster(event);
    });
    this.map.on('click', LOCATION_LAYER, event => {
      this.zone.run(() => this.selectMarker(event));
    });
    this.map.on('mouseenter', CLUSTER_LAYER, this.setPointerCursor);
    this.map.on('mouseleave', CLUSTER_LAYER, this.clearPointerCursor);
    this.map.on('mouseenter', LOCATION_LAYER, this.setPointerCursor);
    this.map.on('mouseleave', LOCATION_LAYER, this.clearPointerCursor);
  }

  private updateMarkers(): void {
    const source = this.map?.getSource(LOCATION_SOURCE) as GeoJSONSource | undefined;
    if (!source) {
      return;
    }
    this.markersById.clear();
    source.setData(this.createFeatureCollection());
    if (this.activePopup && !this.markersById.has(String(this.activePopup.getElement().dataset['markerId']))) {
      this.activePopup.remove();
      this.activePopup = null;
    }
  }

  private createFeatureCollection(): FeatureCollection<Point, GeoJSON.GeoJsonProperties> {
    const features: Feature<Point, GeoJSON.GeoJsonProperties>[] = [];
    this.markers.forEach((marker, index) => {
      const coordinates = validCoordinates(marker.longitude, marker.latitude);
      if (!coordinates) {
        return;
      }
      const baseId = String(marker.id ?? `${coordinates[0]}:${coordinates[1]}:${marker.title}`);
      const markerId = this.markersById.has(baseId) ? `${baseId}:${index}` : baseId;
      this.markersById.set(markerId, marker);
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates },
        properties: {
          markerId,
          title: marker.title,
          description: marker.description || ''
        }
      });
    });
    return { type: 'FeatureCollection', features };
  }

  private async zoomIntoCluster(event: MapLayerMouseEvent): Promise<void> {
    const feature = event.features?.[0];
    const clusterId = Number(feature?.properties?.['cluster_id']);
    const source = this.map?.getSource(LOCATION_SOURCE) as GeoJSONSource | undefined;
    if (!feature || !Number.isFinite(clusterId) || !source) {
      return;
    }

    try {
      const zoom = await source.getClusterExpansionZoom(clusterId);
      const coordinates = (feature.geometry as Point).coordinates as [number, number];
      this.map?.easeTo({ center: coordinates, zoom });
    } catch {
      this.zone.run(() => {
        this.mapError = 'The selected map locations could not be expanded.';
        this.changeDetector.markForCheck();
      });
    }
  }

  private selectMarker(event: MapLayerMouseEvent): void {
    const feature = event.features?.[0];
    const markerId = String(feature?.properties?.['markerId'] ?? '');
    const marker = this.markersById.get(markerId);
    if (!feature || !marker) {
      return;
    }

    const coordinates = (feature.geometry as Point).coordinates as [number, number];
    this.activePopup?.remove();
    const content = marker.description
      ? `${marker.title} — ${marker.description}`
      : marker.title;
    if (!this.maplibre) {
      return;
    }
    this.activePopup = new this.maplibre.Popup({ offset: 12, closeButton: true })
      .setLngLat(coordinates)
      .setText(content)
      .addTo(this.map);
    this.activePopup.getElement().dataset['markerId'] = markerId;
    this.markerSelected.emit(marker);
  }

  private readonly setPointerCursor = (): void => {
    if (this.map) {
      this.map.getCanvas().style.cursor = 'pointer';
    }
  };

  private readonly clearPointerCursor = (): void => {
    if (this.map) {
      this.map.getCanvas().style.cursor = '';
    }
  };
}
