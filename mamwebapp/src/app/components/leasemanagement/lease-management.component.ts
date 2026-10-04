import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { LeasedProperty } from 'src/app/models/leased-property.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LeasedPropertiesService } from 'src/app/services/leased-property/leased-property.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  standalone: false,
  selector: 'app-lease-management',
  templateUrl: './lease-management.component.html',
  styleUrls: ['./lease-management.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService,]
})
export class LeaseManagementComponent implements OnInit {
  @Input() leasedProperties: Array<LeasedProperty>;
  @ViewChild('exportLP') myDiv: ElementRef<HTMLElement>;
  showLMDDialog: boolean = false;
  loading: boolean;
  dataIsLoaded: boolean = false;
  showComfirmaDelete: boolean = false;
  doExport: boolean = false;
  isBusy: boolean;
  errorMsg: string; 
  error = '';
  options: google.maps.MapOptions = {};
  dialogHeader = '';
  center: google.maps.LatLngLiteral;
  markers = [];
  zoom = 8;
  selectedLeasedProperty: LeasedProperty;
  buttonItems: MenuItem[];
  index: any;
  printItems: MenuItem[];
  currentUser: User;
  items = [
    { icon: 'pi pi-home', url: 'dashboard' },
    { label: 'Letting' }];
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

  constructor(private leasedPropertiesService: LeasedPropertiesService, private sharedService: SharedService, 
    private authenticationService: AuthenticationService, private datePipe: DatePipe,private messageService: MessageService,) {
    this.selectedLeasedProperty = this.sharedService.initLeasedProperty();
    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
    });
  }

  ngOnInit() {
    this.buttonItems = [
      {
        label: 'View', icon: 'pi pi-eye', command: () =>
          this.viewLeasedProperty()
      }, {
        label: 'Delete', icon: 'pi pi-trash', command: () =>
          this.showComfirmaDeleteProperty()
      }
    ];
    this.printItems = [
      {
        label: 'PDF', icon: 'pi pi-file-pdf', command: () =>
          this.exportPdf()
      }, {
        label: 'Excel', icon: 'pi pi-file-excel', command: () =>
          this.exportExcel()
      }
    ];
    this.getLeasedProperties();
  }

  codeAddress(address) {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ 'address': address }, function (results, status) {
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
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

  getLeasedProperties() {
    this.center = {
      lat: -26.0722042,
      lng: 30.0752488,
    };
    this.markers.push( this.center );
    this.leasedPropertiesService.getLeasedProperties().pipe(first()).subscribe(properties => {
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
        element.userDepartment = this.currentUser.department;
      });
      this.leasedProperties = properties;
      this.dataIsLoaded = true;
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
    });
  }

  showComfirmaDeleteProperty() {
    this.showComfirmaDelete = true;
  }
  selectProperty(leasedProperty: LeasedProperty, index: Number) {
    this.selectedLeasedProperty = leasedProperty;
    this.index = index;
  }

  deleteLeasedProperty() {
    this.leasedPropertiesService.getLeasedPropertyDetails(this.selectedLeasedProperty).pipe(first()).subscribe(leasedProperty => {
      this.leasedPropertiesService.deleteLeasedProperty(leasedProperty).pipe(first()).subscribe(isDeleted => {
        if (isDeleted) {
          this.messageService.add({ severity: 'warn', summary: 'Delete Property', detail: 'Property has been deleted successful.' });
          const index = this.leasedProperties.indexOf(this.selectedLeasedProperty);
          this.leasedProperties.splice(index, 1);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Delete Property', detail: 'Property is not deleted successful.' });
        }
        this.loading = false;
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Error Occurred', detail: 'An error occurred while processing your request. please try again!' });
      });
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
              alert(status);
          }
          // This is checking to see if the Geoeode Status is OK before proceeding
          if (status == google.maps.GeocoderStatus.OK) {
         //     console.log(results);
        //      var address = (results[0].formatted_address);
          }
      //});
  }
}
