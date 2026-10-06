import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, TemplateRef, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { first } from 'rxjs/operators';
import { LeasedProperty } from 'src/app/models/leased-property.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LeasedPropertiesService } from 'src/app/services/leased-property/leased-property.service';
import { SharedService } from 'src/app/services/shared.service';
import { ToastService } from 'src/app/services/toast.service';
import { OpenStreetMapGeocodingService } from 'src/app/services/openstreetmap-geocoding.service';
import { mapConfig } from 'src/app/shared/map/map-config';
import { MapMarkerData, validCoordinates } from 'src/app/shared/map/map-marker.model';
import { MapLibreMapComponent } from '../../shared/map/maplibre-map.component';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { LeasedPropertyComponent } from './leasedproperty/leased-property.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-lease-management',
    templateUrl: './lease-management.component.html',
    styleUrls: ['./lease-management.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MapLibreMapComponent, MatFormField, MatLabel, MatIcon, MatPrefix, MatInput, MatButton, MatMenuTrigger, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatIconButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, MatProgressBar, MatPaginator, MatMenu, MatMenuItem, MatCard, MatCardHeader, MatCardTitle, MatCardContent, LeasedPropertyComponent, MatCardActions, MatProgressSpinner]
})
export class LeaseManagementComponent implements OnInit, AfterViewInit {
  private leasedPropertiesService = inject(LeasedPropertiesService);
  private sharedService = inject(SharedService);
  private authenticationService = inject(AuthenticationService);
  private datePipe = inject(DatePipe);
  private toastService = inject(ToastService);
  private geocodingService = inject(OpenStreetMapGeocodingService);
  private dialog = inject(MatDialog);

  @Input() leasedProperties: LeasedProperty[];
  @ViewChild('exportLP') myDiv: ElementRef<HTMLElement>;
  showLMDDialog = false;
  loading = false;
  loadError = '';
  deletingLeasedProperty = false;
  dataIsLoaded = false;
  showComfirmaDelete = false;
  doExport = false;
  isBusy: boolean;
  dialogHeader = '';
  center: [number, number] = mapConfig.defaultCenter;
  markers: MapMarkerData[] = [];
  zoom = mapConfig.defaultZoom;
  selectedLeasedProperty: LeasedProperty;
  index: any;
  currentUser: User;
  cols = [      
      { field: 'fileReference', header: 'File Reference' },
      { field: 'propertyCode', header: 'Property code' },      
      { field: 'district', header: 'District' },
      { field: 'type', header: 'Type' },      
      { field: 'startingDate', header: 'Start Date' },
      { field: 'terminationDate', header: 'Termination Date' },
      { field: 'userDepartment', header: 'User Department' },
      { field: 'status', header: 'Status' }
    ];
  displayedColumns = this.cols.map(col => col.field).concat('actions');
  dataSource = new MatTableDataSource<LeasedProperty>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('leasedPropertyDialog') leasedPropertyDialog: TemplateRef<unknown>;
  @ViewChild('deletePropertyDialog') deletePropertyDialog: TemplateRef<unknown>;
  private leasedPropertyDialogRef: MatDialogRef<unknown> | null = null;
  private deletePropertyDialogRef: MatDialogRef<unknown> | null = null;

  constructor() {
    this.selectedLeasedProperty = this.sharedService.initLeasedProperty();
    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
    });
  }

  ngOnInit() {
    this.getLeasedProperties();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  getLeasedProperties() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.loadError = '';
    this.center = mapConfig.defaultCenter;
    this.markers = [];
    this.leasedPropertiesService.getLeasedProperties().pipe(first()).subscribe(properties => {
      this.loading = false;
      if (!Array.isArray(properties)) {
        this.loadError = 'Unable to load leased properties. Please try again.';
        this.toastService.showError(this.loadError);
        return;
      }
      properties.forEach(element => {
        const terminationDateCheck = this.monthDiff(new Date(element.terminationDate), new Date());
        element.status = new Date(element.terminationDate) < new Date() ? "red" : terminationDateCheck <= -6 ? "green" : terminationDateCheck > -6 ? "yellow" : "";
        element.createdDate = this.datePipe.transform(element.createdDate, "yyyy-MM-dd");
        element.modifiedDate = this.datePipe.transform(element.modifiedDate, "yyyy-MM-dd");
        element.startingDate = this.datePipe.transform(element.startingDate, "EEEE, d MMMM, y");
        element.terminationDate = this.datePipe.transform(element.terminationDate, "EEEE, d MMMM, y");
        element.userDepartment = this.currentUser?.department || element.userDepartment;
      });
      this.markers = this.buildPropertyMarkers(properties);
      this.leasedProperties = properties;
      this.dataSource.data = properties;
      this.dataIsLoaded = true;
    }, error => {
      this.loading = false;
      this.loadError = 'Unable to load leased properties. Please try again.';
      this.toastService.showError(this.toastService.getApiErrorMessage(error));
    });
  }

  private buildPropertyMarkers(properties: LeasedProperty[]): MapMarkerData[] {
    const propertyMarkers: MapMarkerData[] = [];
    properties.forEach((property, index) => {
      const coordinates = validCoordinates(property?.longitude, property?.latitude);
      if (coordinates) {
        propertyMarkers.push({
          id: property.fileReference || `${coordinates[0]}:${coordinates[1]}:${index}`,
          longitude: coordinates[0],
          latitude: coordinates[1],
          title: property.propertyCode + ': ' + property.facilityName,
          description: property.facilityName
        });
      }
    });
    return propertyMarkers;
  }

  monthDiff(d1: Date, d2: Date) {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months;
  }

  viewLeasedProperty() {
    this.selectedLeasedProperty.startingDate = null;
    this.selectedLeasedProperty.terminationDate = null;
    this.leasedPropertiesService.getLeasedPropertyDetails(this.selectedLeasedProperty).pipe(first()).subscribe(leasedProperty => {
      this.selectedLeasedProperty = leasedProperty;
      this.showLMDDialog = true;
      this.leasedPropertyDialogRef = this.dialog.open(this.leasedPropertyDialog);
      this.leasedPropertyDialogRef.afterClosed().subscribe(() => {
        this.showLMDDialog = false;
        this.leasedPropertyDialogRef = null;
      });
    });
  }

  showComfirmaDeleteProperty() {
    this.showComfirmaDelete = true;
    this.deletePropertyDialogRef = this.dialog.open(this.deletePropertyDialog, { width: '460px' });
    this.deletePropertyDialogRef.afterClosed().subscribe(() => {
      this.showComfirmaDelete = false;
      this.deletePropertyDialogRef = null;
    });
  }

  closeLeasedPropertyDialog() {
    this.leasedPropertyDialogRef?.close();
  }

  closeDeletePropertyDialog() {
    if (!this.deletingLeasedProperty) {
      this.deletePropertyDialogRef?.close();
    }
  }
  selectProperty(leasedProperty: LeasedProperty, index: number) {
    this.selectedLeasedProperty = leasedProperty;
    this.index = index;
  }

  deleteLeasedProperty() {
    if (this.deletingLeasedProperty || !this.selectedLeasedProperty) {
      return;
    }
    this.deletingLeasedProperty = true;
    if (this.deletePropertyDialogRef) {
      this.deletePropertyDialogRef.disableClose = true;
    }
    this.leasedPropertiesService.getLeasedPropertyDetails(this.selectedLeasedProperty).pipe(first()).subscribe(leasedProperty => {
      this.leasedPropertiesService.deleteLeasedProperty(leasedProperty).pipe(first()).subscribe(isDeleted => {
        if (isDeleted) {
          this.toastService.showSuccess('Leased property deleted successfully.');
          const index = this.leasedProperties.indexOf(this.selectedLeasedProperty);
          if (index >= 0) {
            this.leasedProperties.splice(index, 1);
          }
          this.markers = this.buildPropertyMarkers(this.leasedProperties);
          this.dataSource.data = this.leasedProperties;
          this.deletePropertyDialogRef?.close();
        } else {
          if (this.deletePropertyDialogRef) {
            this.deletePropertyDialogRef.disableClose = false;
          }
          this.toastService.showError('Unable to delete this leased property. Please try again.');
        }
        this.deletingLeasedProperty = false;
      }, error => {
        this.deletingLeasedProperty = false;
        if (this.deletePropertyDialogRef) {
          this.deletePropertyDialogRef.disableClose = false;
        }
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
    }, error => {
      this.deletingLeasedProperty = false;
      if (this.deletePropertyDialogRef) {
        this.deletePropertyDialogRef.disableClose = false;
      }
      this.toastService.showError(this.toastService.getApiErrorMessage(error));
    });
  }

  exportPdf() {
    import("jspdf").then(jsPDF => {
      import("jspdf-autotable").then(x => {
        const doc = new jsPDF.default();
        //doc.autoPrint(this.cols, this.leasedProperties);
        doc.save('Leased Properties.pdf');
      })
    })
  }

  exportExcel() {
    import('exceljs').then(async ExcelJS => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('data');
      const columns = new Set<string>();
      this.leasedProperties.forEach(property => Object.keys(property).forEach(key => columns.add(key)));
      worksheet.columns = Array.from(columns, key => ({ header: key, key }));
      this.leasedProperties.forEach(property => worksheet.addRow(property));
      const excelBuffer = await workbook.xlsx.writeBuffer();
      this.saveAsExcelFile(excelBuffer, 'products');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then(FileSaver => {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, 'Leased Properties' + new Date().getDate() + "-" + new Date().getMonth() + "-" + new Date().getFullYear() + EXCEL_EXTENSION);
    });
  }

  attachSnagList() {

  }

  attachFinalHandoverDocument() {

  }

  selectLeasedProperty(leasedProperty: LeasedProperty) {
    this.selectedLeasedProperty = leasedProperty;
  }

  openInfo(marker: any) {
    this.dialogHeader = marker.title;
  }

  addUpdateAsset(event: any) { }

  exportLeasedProperty() {
    this.leasedPropertiesService.getLeasedPropertyDetails(this.selectedLeasedProperty).pipe(first()).subscribe(leasedProperty => {
      this.selectedLeasedProperty = leasedProperty;
      this.doExport = true;
      const el: HTMLElement = this.myDiv.nativeElement;
      el.click();
    });
  }

  getAddress(address: string) {
    this.geocodingService.searchAddress(address).pipe(first()).subscribe({
      next: results => {
        const result = results?.[0];
        const coordinates = validCoordinates(result?.lon, result?.lat);
        if (!result || !coordinates) {
          this.toastService.showWarning('Unable to find valid coordinates for this address.');
          return;
        }
        this.markers = [...this.markers, {
          longitude: coordinates[0],
          latitude: coordinates[1],
          title: result.display_name,
          description: result.display_name
        }];
      },
      error: error => this.toastService.showError(this.toastService.getApiErrorMessage(error))
    });
  }
}
