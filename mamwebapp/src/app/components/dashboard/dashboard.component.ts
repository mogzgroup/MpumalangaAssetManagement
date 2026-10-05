import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user/user.service';
import { FacilityService } from '../../services/facility/facility.service';
import { AuthenticationService } from '../../services/authentication.service';
//import { FacilityZoning } from 'src/app/models/Facility-zoning';
import { FacilityType } from 'src/app/models/facility-type.model';
import { DashboardWedge } from 'src/app/models/dashboard-wedge.model';
import { facilitySummaryChart } from 'src/app/models/facility-summary-chart.model';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ToastService } from 'src/app/services/toast.service';
import { mapConfig } from 'src/app/shared/map/map-config';
import { MapMarkerData, validCoordinates } from 'src/app/shared/map/map-marker.model';
import { MapCoordinate } from 'src/app/models/map-oordinate.model';


@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  animations: [
    trigger('animation', [
      state('visible', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('void => *', [
        style({ transform: 'translateX(50%)', opacity: 0 }),
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate(('250ms ease-in'), style({
          height: 0,
          opacity: 0,
          transform: 'translateX(50%)'
        }))
      ])
    ])
  ],
  styleUrls: ['./dashboard.component.css']
  , changeDetection: ChangeDetectionStrategy.Eager
})
export class DashboardComponent implements OnInit {
  @ViewChild('assetDialog') assetDialog: TemplateRef<{
    $implicit: { header: string; asset: any };
  }>;
  loadingZonings = true;
  loadingWedges = true;
  loadingFacilitySummaries = true;
  zoningsLoadError = '';
  wedgesLoadError = '';
  mapLoadError = '';
  zonings: Array<FacilityType> = [];
  facilityType: FacilityType;
  wedges: Array<DashboardWedge> = [];
  currentUser: User;
  userFromApi: User;
  zoningColumns = ['name', 'signedOff', 'total'];
  data: any;
  nonResidentialBuildings: any;
  dwellings: any;
  land: any;
  barChartdata: any;
  lineChartdata: any;
  numberofProperties: any;
  signedoffProperties: any;
  facilitySummaries: Array<facilitySummaryChart> = [];
  zoom = mapConfig.defaultZoom;
  dialogHeader = ''
  markers: MapMarkerData[] = [];
  center: [number, number] = mapConfig.defaultCenter;

  constructor(
    private userService: UserService,
    private facilityService: FacilityService,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog,
    private toastService: ToastService) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {

    this.addMarker();

    this.loadZonings();

    this.facilityService.getFacilitySummaries().pipe(first()).subscribe(facilitySummaries => {
      this.loadingFacilitySummaries = false;
      this.facilitySummaries = Array.isArray(facilitySummaries) ? facilitySummaries : [];
      const summaries = this.facilitySummaries[1]?.facilitySummaries;
      if (!Array.isArray(summaries) || summaries.length < 3) {
        this.toastService.showError('Facility summaries could not be loaded because the server returned incomplete data.');
        return;
      }
      this.lineChartdata = {
        labels: ['Opening Balance', 'Additions', 'PPeaIn', 'PPeaOut', 'Disposals', 'Closing Balance'],
        datasets: [
          {
            label: summaries[0].facilityType,
            backgroundColor: '#ed3c76',
            borderColor: '#1E88E5',
            data: [summaries[0].openingBalance, summaries[0].additions, summaries[0].ppeaIn,
              summaries[0].ppeaOut, summaries[0].disposals, summaries[0].closingBalance]

          },
          {
            label: summaries[1].facilityType,
            data: [summaries[1].openingBalance, summaries[1].additions, summaries[1].ppeaIn,
              summaries[1].ppeaOut, summaries[1].disposals, summaries[1].closingBalance],
            fill: false,
            backgroundColor: '#42A5F5',
            borderColor: '#7CB342',
          },
          {
            label: summaries[2].facilityType,
            data: [summaries[2].openingBalance, summaries[2].additions, summaries[2].ppeaIn,
              summaries[2].ppeaOut, summaries[2].disposals, summaries[2].closingBalance],
            fill: false,
            backgroundColor: '#599597',
            borderColor: '#599597'
          }
        ]
      };
    }, error => {
      this.loadingFacilitySummaries = false;
      this.toastService.showError(this.toastService.getApiErrorMessage(error));
    });

    this.facilityService.getDashboardWedges().pipe(first()).subscribe(wedges => {
      this.loadingWedges = false;
      this.setDashboardWedges(wedges);
    }, error => {
      this.loadingWedges = false;
      this.wedgesLoadError = this.toastService.getApiErrorMessage(error);
      this.toastService.showError(this.wedgesLoadError);
    });
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
    this.facilityService.getFacilityZonings().pipe(first()).subscribe(zonings => {
      this.loadingZonings = false;
      this.zonings = Array.isArray(zonings) ? zonings : [];
      this.facilityType = this.zonings[0];
    }, error => {
      this.loadingZonings = false;
      this.zoningsLoadError = this.toastService.getApiErrorMessage(error);
      this.toastService.showError(this.zoningsLoadError);
    });
  }

  private setDashboardWedges(wedges: Array<DashboardWedge>): void {
    if (!Array.isArray(wedges)) {
      this.setWedgesLoadError('Dashboard totals could not be loaded because the server returned invalid data.');
      return;
    }
    this.wedges = wedges;
    this.nonResidentialBuildings = this.wedges.find(w => w?.name === 'Non Residential Buildings');
    this.dwellings = this.wedges.find(w => w?.name === 'Dwellings');
    this.land = this.wedges.find(w => w?.name === 'Land');
    this.signedoffProperties = this.wedges.find(w => w?.name === 'Signed off properties');
    this.numberofProperties = this.wedges.find(w => w?.name === 'Number of properties');

    const requiredWedges = [
      this.nonResidentialBuildings,
      this.dwellings,
      this.land,
      this.signedoffProperties,
      this.numberofProperties
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

  addMarker() {
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
    this.addMarker();
  }
}
