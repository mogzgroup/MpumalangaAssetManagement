import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, Output, AfterViewInit, EventEmitter, Input, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { first } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { HiringRegisterService } from '../../services/hiring-register/hiring-register.service';
import { MenuItem, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { ConfirmationService } from 'primeng/api';
import { FormControl } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { HiredProperty } from 'src/app/models/hired-property';
import { DatePipe } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-hiring',
  templateUrl: './hiring.component.html',
  styleUrls: ['./hiring.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService, ConfirmationService]
})

export class HiringComponent implements OnInit {
  address: any = {};
  formattedAddress: string;
  formattedEstablishmentAddress: string;


  loading = false;
  isAdding = false;
  hiringForm: FormGroup;
  types: any = [];
  userDepartments: any[] = [];
  districts: any[] = [];
  buildingConditions: any[] = [];
  hiredProperty: HiredProperty;
  currentUser: User;
  hiredProperties: HiredProperty[] = [];
  isView: boolean = false;
  files: any[] = [];
  center: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {};
  markers = [];
  zoom = 8;
  showComfirmaDelete = false;
  showResetPasswordComfirmation: boolean = false;
  clonedHiredProperties: HiredProperty[] = [];
  printItems: MenuItem[];

  cols: any[];
  items: MenuItem[];
  home: MenuItem;
  submitted = false;
  error = '';
  emailExsist: boolean = false;
  selectedHiredProperty: HiredProperty;


  index: any;
  showDialog: boolean = false;
  showConfirmResetPassword: boolean = false;
  msgs: any[] = [];
  newUserError: string = '';
  errorMsg: string = 'error';
  departments: any[] = [];
  selectedRole: Number = 0;
  buttonItems: MenuItem[];
  header: string = 'Add Candidate';
  dialogHeader = '';

  constructor(private hiringRegisterService: HiringRegisterService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private authenticationService: AuthenticationService,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private sharedService: SharedService,
    public zone: NgZone) { }
  roles: any[];

  ngOnInit() {
    const center = { lat: 50.064192, lng: -130.605469 };
    // Create a bounding box with sides ~10km away from the center point
    const defaultBounds = {
      north: center.lat + 0.1,
      south: center.lat - 0.1,
      east: center.lng + 0.1,
      west: center.lng - 0.1,
    };

    this.printItems = [
      {
        label: 'PDF', icon: 'pi pi-file-pdf', command: () =>
          this.exportPdf()
      }, {
        label: 'Excel', icon: 'pi pi-file-excel', command: () =>
          this.exportExcel()
      }
    ];
    this.center = {
      lat: -26.0722042,
      lng: 30.0752488,
    };
    this.markers.push(this.center);
    this.hiringRegisterService.getHiredProperties().pipe(first()).subscribe(properties => {
      this.markers = [];
      properties.forEach(element => {
        if (element.address && element.address != '') {
          var service = new google.maps.places.PlacesService(document.createElement('div'));
          var request = {
            query: element.address,
            fields: ['name', 'geometry'],
          };
          service.findPlaceFromQuery(request, (results, status) => {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              if (results[0].geometry) {
                let maker = {
                  position: {
                    lat: Number(results[0].geometry.location.lat()),
                    lng: Number(results[0].geometry.location.lng()),
                  },
                  title: element.propertyCode + ": " +element.address,
                };
                this.markers.push(maker);
              }
            }
          });
        }
        const terminationDateCheck = this.monthDiff(new Date(element.terminationDate), new Date());
        element.status = new Date(element.terminationDate) < new Date() ? "red" : terminationDateCheck <= -6 ? "green" : terminationDateCheck > -6 ? "yellow" : "";
        element.createdDate = this.datePipe.transform(element.createdDate, "yyyy-MM-dd");
        element.modifiedDate = this.datePipe.transform(element.modifiedDate, "yyyy-MM-dd");
        element.startingDate = this.datePipe.transform(element.startingDate, "EEEE, d MMMM, y");
        element.terminationDate = this.datePipe.transform(element.terminationDate, "EEEE, d MMMM, y");
      });
      this.loading = false;
      this.hiredProperties = properties;
      this.clonedHiredProperties = properties;
    });

    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
    });

    this.buttonItems = [
      {
        label: 'View', icon: 'pi pi-eye', command: () =>
          this.viewProperty()
      },
      {
        label: 'Update', icon: 'pi pi-pencil', command: () =>
          this.editProperty()
      }, {
        label: 'Delete', icon: 'pi pi-trash', command: () =>
          this.confirmDelete()
      }
    ];

    this.types = this.sharedService.getPropertyTypes();
    this.userDepartments = this.sharedService.getDepartments();
    this.districts = this.sharedService.getDistricts();
    this.buildingConditions = this.sharedService.getConditionRatings();



    this.items = [{ icon: 'pi pi-home', url: 'dashboard' },
    { label: 'Hiring' }];

    this.cols = [
      { field: 'id', header: 'File Reference' },
      { field: 'propertyCode', header: 'Property code' },
      { field: 'district', header: 'District' },
      { field: 'type', header: 'Type' },
      { field: 'startingDate', header: 'Start Date' },
      { field: 'terminationDate', header: 'Termination Date' },
      { field: 'userDepartment', header: 'User Department' },
      { field: 'status', header: 'Status' }
    ];

    this.loading = false;
    this.initForm();
  }

  handleAddressChange(address: any) {
    this.address.fullAddress = address.name
    this.address.latitude = address.geometry.location.lat()
    this.address.longitude = address.geometry.location.lng()
  }

  monthDiff(d1: Date, d2: Date) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months;
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
      const worksheet = xlsx.utils.json_to_sheet(this.hiredProperties);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer);
    });
  }

  saveAsExcelFile(buffer: any): void {
    import('file-saver').then(FileSaver => {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, 'Hired Properties' + new Date().getDate() + "-" + new Date().getMonth() + "-" + new Date().getFullYear() + EXCEL_EXTENSION);
    });
  }

  initForm() {
    this.hiringForm = this.formBuilder.group({
      district: new FormControl('', Validators.compose([Validators.required])),
      type: new FormControl('', Validators.compose([Validators.required])),
      propertyCode: new FormControl('', Validators.compose([Validators.required])),
      town: new FormControl('', Validators.compose([Validators.required])),
      rentalAmount: new FormControl('', Validators.compose([Validators.required])),
      startRentalAmount: new FormControl('', Validators.compose([Validators.required])),
      landlandAgentContactDetails: new FormControl('', Validators.compose([Validators.required])),
      startDate: new FormControl('', Validators.compose([Validators.required])),
      terminationDate: new FormControl('', Validators.compose([Validators.required])),
      address: new FormControl('', Validators.compose([Validators.required])),
      userDepartment: new FormControl('', Validators.compose([Validators.required])),
      staffNumber: new FormControl('', Validators.compose([Validators.required])),
      area: new FormControl('', Validators.compose([Validators.required])),
      escalationRate: new FormControl('', Validators.compose([Validators.required])),
      escalationDate: new FormControl('', Validators.compose([Validators.required])),
      buildingCondition: new FormControl('', Validators.compose([Validators.required])),
      landlandAgentName: new FormControl('', Validators.compose([Validators.required])),
    });
  }

  setProperty() {
    this.showDialog = true;
    const district = this.districts.filter(d => d.name == this.selectedHiredProperty.district)[0];
    const type = this.types.filter(d => d.name == this.selectedHiredProperty.type.trim())[0];
    const userDepartment = this.userDepartments.filter(d => d.name == this.selectedHiredProperty.userDepartment.trim())[0];
    const buildingCondition = this.buildingConditions.filter(d => d.name == this.selectedHiredProperty.buildingCondition.trim())[0];
    this.hiringForm = this.formBuilder.group({
      district: new FormControl(district, Validators.compose([Validators.required])),
      type: new FormControl(type, Validators.compose([Validators.required])),
      propertyCode: new FormControl(this.selectedHiredProperty.propertyCode, Validators.compose([Validators.required])),
      town: new FormControl(this.selectedHiredProperty.town, Validators.compose([Validators.required])),
      rentalAmount: new FormControl(this.selectedHiredProperty.monthlyRental, Validators.compose([Validators.required])),
      startRentalAmount: new FormControl(this.selectedHiredProperty.startRentalAmount, Validators.compose([Validators.required])),
      startDate: new FormControl(new Date(this.selectedHiredProperty.startingDate), Validators.compose([Validators.required])),
      terminationDate: new FormControl(new Date(this.selectedHiredProperty.terminationDate), Validators.compose([Validators.required])),
      address: new FormControl(this.selectedHiredProperty.address, Validators.compose([Validators.required])),
      userDepartment: new FormControl(userDepartment, Validators.compose([Validators.required])),
      staffNumber: new FormControl(this.selectedHiredProperty.numberofStaff, Validators.compose([Validators.required])),
      area: new FormControl(this.selectedHiredProperty.area, Validators.compose([Validators.required])),
      escalationRate: new FormControl(this.selectedHiredProperty.escalationRate, Validators.compose([Validators.required])),
      escalationDate: new FormControl(new Date(this.selectedHiredProperty.escalationDate), Validators.compose([Validators.required])),
      buildingCondition: new FormControl(buildingCondition, Validators.compose([Validators.required])),
      landlandAgentName: new FormControl(this.selectedHiredProperty.landlandAgentName, Validators.compose([Validators.required])),
      landlandAgentContactDetails: new FormControl(this.selectedHiredProperty.landlandAgentContactDetails, Validators.compose([Validators.required])),
    });
  }

  editProperty() {
    this.isView = false;
    this.header = "Edit Property";
    this.setProperty();
  }

  viewProperty() {
    this.isView = true;
    this.header = this.selectedHiredProperty.propertyCode;
    this.setProperty();
  }

  get f() { return this.hiringForm.controls; }
  get l() { return this.hiringForm.controls; }

  openInfo(marker: any) {
    this.dialogHeader = marker.title;
  }

  onSubmit() {

    const hiredProperty = new HiredProperty();//{
    hiredProperty.id = 0,
      hiredProperty.type = this.hiringForm.controls["type"].value != undefined ? this.hiringForm.controls["type"].value.name : null;
    hiredProperty.district = this.hiringForm.controls["district"].value != undefined ? this.hiringForm.controls["district"].value.name : null;
    hiredProperty.propertyCode = this.hiringForm.controls["propertyCode"].value;
    hiredProperty.startingDate = this.hiringForm.controls["startDate"].value;
    hiredProperty.terminationDate = this.hiringForm.controls["terminationDate"].value;
    hiredProperty.monthlyRental = this.hiringForm.controls["rentalAmount"].value;
    hiredProperty.startRentalAmount = this.hiringForm.controls["startRentalAmount"].value;
    hiredProperty.town = this.hiringForm.controls["town"].value;
    hiredProperty.userDepartment = this.hiringForm.controls["userDepartment"].value != undefined ? this.hiringForm.controls["userDepartment"].value.name : null;
    hiredProperty.buildingCondition = this.hiringForm.controls["buildingCondition"].value != undefined ? this.hiringForm.controls["buildingCondition"].value.name : null;
    hiredProperty.landlandAgentName = this.hiringForm.controls["landlandAgentName"].value;
    hiredProperty.landlandAgentContactDetails = this.hiringForm.controls["landlandAgentContactDetails"].value;
    hiredProperty.numberofStaff = this.hiringForm.controls["staffNumber"].value;
    hiredProperty.escalationRate = this.hiringForm.controls["escalationRate"].value;
    hiredProperty.escalationDate = this.hiringForm.controls["escalationDate"].value;
    hiredProperty.area = this.hiringForm.controls["area"].value;
    hiredProperty.address = this.address.fullAddress;
    hiredProperty.createdByUser = this.currentUser;
    hiredProperty.createdUserId = this.currentUser.id;
    hiredProperty.createdDate = new Date();
    hiredProperty.isDeleted = false;
    const terminationDateCheck = this.monthDiff(new Date(hiredProperty.terminationDate), new Date());
    hiredProperty.status = new Date(hiredProperty.terminationDate) < new Date() ? "red" : terminationDateCheck <= -6 ? "green" : terminationDateCheck > -6 ? "yellow" : "";

    this.addHiredProperty(hiredProperty);
  }

  onUpdate() {
    const hiredProperty = new HiredProperty();//{
    hiredProperty.id = this.selectedHiredProperty.id,
      hiredProperty.type = this.hiringForm.controls["type"].value != undefined ? this.hiringForm.controls["type"].value.name : null;
    hiredProperty.district = this.hiringForm.controls["district"].value != undefined ? this.hiringForm.controls["district"].value.name : null;
    hiredProperty.propertyCode = this.hiringForm.controls["propertyCode"].value;
    hiredProperty.startingDate = this.hiringForm.controls["startDate"].value;
    hiredProperty.terminationDate = this.hiringForm.controls["terminationDate"].value;
    hiredProperty.monthlyRental = this.hiringForm.controls["rentalAmount"].value;
    hiredProperty.startRentalAmount = this.hiringForm.controls["startRentalAmount"].value;
    hiredProperty.town = this.hiringForm.controls["town"].value;
    hiredProperty.userDepartment = this.hiringForm.controls["userDepartment"].value != undefined ? this.hiringForm.controls["userDepartment"].value.name : null;
    hiredProperty.buildingCondition = this.hiringForm.controls["buildingCondition"].value != undefined ? this.hiringForm.controls["buildingCondition"].value.name : null;
    hiredProperty.landlandAgentName = this.hiringForm.controls["landlandAgentName"].value;
    hiredProperty.landlandAgentContactDetails = this.hiringForm.controls["landlandAgentContactDetails"].value;
    hiredProperty.numberofStaff = this.hiringForm.controls["staffNumber"].value;
    hiredProperty.escalationRate = this.hiringForm.controls["escalationRate"].value;
    hiredProperty.escalationDate = this.hiringForm.controls["escalationDate"].value;
    hiredProperty.area = this.hiringForm.controls["area"].value;
    hiredProperty.address = this.address.fullAddress;
    hiredProperty.createdByUser = this.currentUser;
    hiredProperty.createdUserId = this.currentUser.id;
    hiredProperty.createdDate = new Date();
    hiredProperty.isDeleted = false;
    hiredProperty.modifiedDate = new Date();
    hiredProperty.modifiedByUser = this.currentUser;
    hiredProperty.modifiedUserId = this.currentUser.id;
    const terminationDateCheck = this.monthDiff(new Date(hiredProperty.terminationDate), new Date());
    hiredProperty.status = new Date(hiredProperty.terminationDate) < new Date() ? "red" : terminationDateCheck <= -6 ? "green" : terminationDateCheck > -6 ? "yellow" : "";

    this.updateHiredProperty(hiredProperty);
  }

  addHiredProperty(hiredProperty: HiredProperty) {
    this.hiringRegisterService.addHiredProperty(hiredProperty).pipe().subscribe(id => {
      if (id != 0) {
        hiredProperty.id = id;
        const _hiredProperty: any = hiredProperty;
        _hiredProperty.createdDate = this.datePipe.transform(hiredProperty.createdDate, "yyyy-MM-dd");
        _hiredProperty.modifiedDate = this.datePipe.transform(hiredProperty.modifiedDate, "yyyy-MM-dd");
        _hiredProperty.startingDate = this.datePipe.transform(hiredProperty.startingDate, "EEEE, d MMMM, y");
        _hiredProperty.terminationDate = this.datePipe.transform(hiredProperty.terminationDate, "EEEE, d MMMM, y");
        this.hiredProperties.push(_hiredProperty);
        this.showToast('Add Property', 'Property has been added successful');
      } else {
        this.messageService.add({ severity: 'error', summary: 'Add Property', detail: 'Property is not added successful.' });
      }
      this.showDialog = false;
      this.isAdding = false;
    },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error Occurred', detail: 'An error occurred while processing your request. please try again!' });
        this.error = error;
        this.isAdding = false;
      });
  }

  updateHiredProperty(hiredProperty: HiredProperty) {
    this.hiringRegisterService.updateHiredProperty(hiredProperty).pipe(first()).subscribe(isUpdated => {
      if (isUpdated) {
        this.showToast('Update Property', 'Property has been updated successful.');
        this.loading = false;
        const _hiredProperty: any = hiredProperty;
        _hiredProperty.createdDate = this.datePipe.transform(hiredProperty.createdDate, "yyyy-MM-dd");
        _hiredProperty.modifiedDate = this.datePipe.transform(hiredProperty.modifiedDate, "yyyy-MM-dd");
        _hiredProperty.startingDate = this.datePipe.transform(hiredProperty.startingDate, "EEEE, d MMMM, y");
        _hiredProperty.terminationDate = this.datePipe.transform(hiredProperty.terminationDate, "EEEE, d MMMM, y");
        this.hiredProperties[this.index] = hiredProperty;
        this.showDialog = false;
      } else {
        this.showErrorToast('Update Property', 'Property has not been updated successful.');
        this.loading = false;
      }
    });
  }

  validProperty(propertyCode: string, id: number) {
    var _propertyCode = propertyCode == undefined ? this.f.email.value : propertyCode;
    if (id != undefined) {//for edit
      if (propertyCode === undefined || propertyCode === '')
        return false
      else
        return this.hiredProperties.filter(u => u.propertyCode.toLowerCase() == _propertyCode.toLowerCase() && u.id != id).length > 0;
    } else { //for add      
      return this.hiredProperties.filter(u => u.propertyCode.toLowerCase() == _propertyCode.toLowerCase()).length > 0 ? this.emailExsist = true : this.emailExsist = false;
    }
  }

  onRemoveFile(event: any) { }
  onSelectFile(files: any) { }
  showToast(summary: string, detail: string) {
    this.messageService.add({ severity: 'success', summary: summary, detail: detail });
  }
  showErrorToast(summary: string, detail: string) {
    this.messageService.add({ severity: 'error', summary: summary, detail: detail });
  }

  setRole(e) {
    this.selectedRole = e.value.factor
  }

  onRowEditInit(e) { }




  deleteHiredProperty() {
    this.selectedHiredProperty.createdDate = new Date(this.selectedHiredProperty.createdDate);
    this.selectedHiredProperty.modifiedDate = new Date(this.selectedHiredProperty.modifiedDate);
    this.selectedHiredProperty.startingDate = new Date(this.selectedHiredProperty.startingDate);
    this.selectedHiredProperty.terminationDate = new Date(this.selectedHiredProperty.terminationDate);
    this.hiringRegisterService.deleteHiredProperty(this.selectedHiredProperty).pipe(first()).subscribe(isDeleted => {
      if (isDeleted) {
        this.messageService.add({ severity: 'warn', summary: 'Delete Property', detail: 'Property has been deleted successful.' });
        this.hiredProperties.splice(this.index, 1);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Delete Property', detail: 'Property is not deleted successful.' });
      }
      this.loading = false;
    }, error => {
      this.messageService.add({ severity: 'error', summary: 'Error Occurred', detail: 'An error occurred while processing your request. please try again!' });
    });
  }

  confirmDelete() {
    this.showComfirmaDelete = true;
  }

  selectProperty(hiredProperty: HiredProperty, index: Number) {
    this.selectedHiredProperty = hiredProperty;
    this.index = index;
  }
}
