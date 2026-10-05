import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { first } from 'rxjs/operators';
import { LeasedProperty } from 'src/app/models/leased-property.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LeasedPropertiesService } from 'src/app/services/leased-property/leased-property.service';
import { SharedService } from 'src/app/services/shared.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: false,
  selector: 'app-lease-management',
  templateUrl: './lease-management.component.html',
  styleUrls: ['./lease-management.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class LeaseManagementComponent implements OnInit, AfterViewInit {
  @Input() leasedProperties: Array<LeasedProperty>;
  @ViewChild('exportLP') myDiv: ElementRef<HTMLElement>;
  showLMDDialog: boolean = false;
  loading = false;
  loadError = '';
  deletingLeasedProperty = false;
  dataIsLoaded: boolean = false;
  showComfirmaDelete: boolean = false;
  doExport: boolean = false;
  isBusy: boolean;
  options: google.maps.MapOptions = {};
  dialogHeader = '';
  center: google.maps.LatLngLiteral;
  markers = [];
  zoom = 8;
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

  constructor(
    private leasedPropertiesService: LeasedPropertiesService,
    private sharedService: SharedService,
    private authenticationService: AuthenticationService,
    private datePipe: DatePipe,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
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

  codeAddress(address) {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ 'address': address }, (results, status) => {
        console.log(results);
        var latLng = {lat: results[0].geometry.location.lat (), lng: results[0].geometry.location.lng ()};
        console.log (latLng);
        if (status == 'OK') {
            var marker = new google.maps.Marker({
                position: latLng,
                //map: map
            });
            //console.log (map);
        } else {
            this.toastService.showError('Unable to find this address. Please check it and try again.');
        }
    });
}

  getLeasedProperties() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.loadError = '';
    this.center = {
      lat: -26.0722042,
      lng: 30.0752488,
    };
    this.markers = [this.center];
    this.leasedPropertiesService.getLeasedProperties().pipe(first()).subscribe(properties => {
      this.loading = false;
      if (!Array.isArray(properties)) {
        this.loadError = 'Unable to load leased properties. Please try again.';
        this.toastService.showError(this.loadError);
        return;
      }
      properties.forEach(element => {
       
        let maker = {
          position: {
            lat: Number(element.latitude),
            lng: Number(element.longitude),
          },
          title: element.propertyCode + ": " + element.facilityName,
          //options: { animation: google.maps.Animation.BOUNCE },
        };
        this.markers.push(maker);
        const terminationDateCheck = this.monthDiff(new Date(element.terminationDate), new Date());
        element.status = new Date(element.terminationDate) < new Date() ? "red" : terminationDateCheck <= -6 ? "green" : terminationDateCheck > -6 ? "yellow" : "";
        element.createdDate = this.datePipe.transform(element.createdDate, "yyyy-MM-dd");
        element.modifiedDate = this.datePipe.transform(element.modifiedDate, "yyyy-MM-dd");
        element.startingDate = this.datePipe.transform(element.startingDate, "EEEE, d MMMM, y");
        element.terminationDate = this.datePipe.transform(element.terminationDate, "EEEE, d MMMM, y");
        element.userDepartment = this.currentUser?.department || element.userDepartment;
      });
      this.leasedProperties = properties;
      this.dataSource.data = properties;
      this.dataIsLoaded = true;
    }, error => {
      this.loading = false;
      this.loadError = 'Unable to load leased properties. Please try again.';
      this.toastService.showError(this.toastService.getApiErrorMessage(error));
    });
  }

  monthDiff(d1: Date, d2: Date) {
    var months;
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
  selectProperty(leasedProperty: LeasedProperty, index: Number) {
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
          this.leasedProperties.splice(index, 1);
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
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.leasedProperties);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "products");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then(FileSaver => {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
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
      let el: HTMLElement = this.myDiv.nativeElement;
      el.click();
    });
  }

  getAddress(address: string){
      var bounds = new google.maps.LatLngBounds();
      // This is making the Geocode request
      var geocoder = new google.maps.Geocoder();
      //geocoder.geocode({ 'latLng': latlng },  (results, status) =>{
          if (status !== google.maps.GeocoderStatus.OK) {
              this.toastService.showError('Unable to find this address. Please try again.');
          }
          // This is checking to see if the Geoeode Status is OK before proceeding
          if (status == google.maps.GeocoderStatus.OK) {
         //     console.log(results);
        //      var address = (results[0].formatted_address);
          }
      //});
  }
}
