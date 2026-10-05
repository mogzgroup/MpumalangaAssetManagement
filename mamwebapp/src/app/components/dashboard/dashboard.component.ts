import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TimeoutError } from 'rxjs';
import { finalize, first, timeout } from 'rxjs/operators';
import { FacilityService } from '../../services/facility/facility.service';
import { FacilityType } from 'src/app/models/facility-type.model';
import { DashboardWedge } from 'src/app/models/dashboard-wedge.model';
import { ToastService } from 'src/app/services/toast.service';
import { mapConfig } from 'src/app/shared/map/map-config';
import { MapMarkerData, validCoordinates } from 'src/app/shared/map/map-marker.model';
import { MapCoordinate } from 'src/app/models/map-oordinate.model';


@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class DashboardComponent implements OnInit {
  @ViewChild('assetDialog') assetDialog: TemplateRef<{
    $implicit: { header: string; asset: any };
  }>;
  loadingZonings = true;
  loadingWedges = true;
  zoningsLoadError = '';
  wedgesLoadError = '';
  mapLoadError = '';
  facilityType: FacilityType;
  readonly zoningColumns = ['name', 'signedOff', 'total'];
  nonResidentialBuildings?: DashboardWedge;
  dwellings?: DashboardWedge;
  land?: DashboardWedge;
  zoom = mapConfig.defaultZoom;
  dialogHeader = ''
  markers: MapMarkerData[] = [];
  center: [number, number] = mapConfig.defaultCenter;

  constructor(
    private facilityService: FacilityService,
    private dialog: MatDialog,
    private toastService: ToastService) { }

  ngOnInit() {
    this.loadMapLocations();
    this.loadZonings();
    this.loadWedges();
  }

  loadWedges(): void {
    this.loadingWedges = true;
    this.wedgesLoadError = '';
    this.facilityService.getDashboardWedges().pipe(first()).subscribe(wedges => {
      this.loadingWedges = false;
      this.setDashboardWedges(wedges);
    }, error => {
      this.loadingWedges = false;
      this.wedgesLoadError = this.toastService.getApiErrorMessage(error);
      this.toastService.showError(this.wedgesLoadError);
    });
  }

  loadZonings(): void {
    this.loadingZonings = true;
    this.zoningsLoadError = '';
    this.facilityService.getFacilityZonings().pipe(
      first(),
      timeout(30000),
      finalize(() => {
        this.loadingZonings = false;
      })
    ).subscribe(zonings => {
      if (!Array.isArray(zonings)) {
        this.facilityType = undefined;
        this.zoningsLoadError = 'Zoning information could not be loaded because the server returned invalid data.';
        return;
      }
      const facilityType = zonings[0];
      if (!facilityType || !Array.isArray(facilityType.facilityZonings)) {
        this.facilityType = undefined;
        return;
      }
      this.facilityType = {
        ...facilityType,
        facilityZonings: facilityType.facilityZonings.filter(zoning =>
          typeof zoning?.name === 'string' && zoning.name.trim().length > 0)
      };
    }, error => {
      this.zoningsLoadError = error instanceof TimeoutError
        ? 'Zoning information is taking too long to load.'
        : this.toastService.getApiErrorMessage(error);
      this.toastService.showError(this.zoningsLoadError);
    });
  }

  private setDashboardWedges(wedges: Array<DashboardWedge>): void {
    if (!Array.isArray(wedges)) {
      this.setWedgesLoadError('Dashboard totals could not be loaded because the server returned invalid data.');
      return;
    }
    this.nonResidentialBuildings = wedges.find(w => w?.name === 'Non Residential Buildings');
    this.dwellings = wedges.find(w => w?.name === 'Dwellings');
    this.land = wedges.find(w => w?.name === 'Land');

    const requiredWedges = [
      this.nonResidentialBuildings,
      this.dwellings,
      this.land
    ];
    if (requiredWedges.some(wedge => !wedge || !Number.isFinite(Number(wedge.total)))) {
      this.setWedgesLoadError('Dashboard totals could not be loaded because the server returned incomplete data.');
    }
  }

  private setWedgesLoadError(message: string): void {
    this.wedgesLoadError = message;
    this.toastService.showError(message);
  }

  openInfo(marker: MapMarkerData) {
    const coordinate = marker.data as MapCoordinate;
    this.dialogHeader = marker.title;
    const selectedAsset = {
      mode: 'ViewTODO',
      facilityId: coordinate.facilityId,
      facilityType: coordinate.facilityType
    };
    this.dialog.open(this.assetDialog, {
      width: '90vw',
      data: { header: this.dialogHeader, asset: selectedAsset }
    });
  }

  private loadMapLocations(): void {
    this.facilityService.getMapCoordinates().pipe(first()).subscribe(mapCoordinates => {
      if (!Array.isArray(mapCoordinates)) {
        this.mapLoadError = 'Map locations could not be loaded.';
        return;
      }
      const nextMarkers: MapMarkerData[] = [];
      mapCoordinates.forEach((element, index) => {
        const coordinates = validCoordinates(element?.longitude, element?.latitude);
        if (!coordinates) {
          return;
        }
        nextMarkers.push({
          id: element.facilityId ?? `${coordinates[0]}:${coordinates[1]}:${index}`,
          longitude: coordinates[0],
          latitude: coordinates[1],
          data: element,
          title: element.description,
          description: element.address
        });
      });
      this.markers = nextMarkers;
    }, error => {
      this.mapLoadError = this.toastService.getApiErrorMessage(error);
      this.toastService.showError(this.mapLoadError);
    });
  }

  retryMapLocations(): void {
    this.mapLoadError = '';
    this.markers = [];
    this.loadMapLocations();
  }
}
