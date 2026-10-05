import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, Output, AfterViewInit, EventEmitter, Input, NgZone, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { first } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { HiringRegisterService } from '../../services/hiring-register/hiring-register.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { FormControl } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { HiredProperty } from 'src/app/models/hired-property';
import { DatePipe } from '@angular/common';
import { ToastService } from 'src/app/services/toast.service';
import { OpenStreetMapGeocodingService, GeocodingResult } from 'src/app/services/openstreetmap-geocoding.service';
import { mapConfig } from 'src/app/shared/map/map-config';
import { MapMarkerData, validCoordinates } from 'src/app/shared/map/map-marker.model';

@Component({
  standalone: false,
  selector: 'app-hiring',
  templateUrl: './hiring.component.html',
  styleUrls: ['./hiring.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})

export class HiringComponent implements OnInit {
  address: any = {};
  formattedAddress: string;
  formattedEstablishmentAddress: string;


  loadingProperties = false;
  propertiesLoadError = '';
  isGeocodingAddress = false;
  addressSearchError = '';
  addressResults: GeocodingResult[] = [];
  isAdding = false;
  isUpdating = false;
  deletingHiredProperty = false;
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
  center: [number, number] = mapConfig.defaultCenter;
  markers: MapMarkerData[] = [];
  zoom = mapConfig.defaultZoom;
  showResetPasswordComfirmation: boolean = false;
  clonedHiredProperties: HiredProperty[] = [];
  cols: any[];
  pagedHiredProperties: HiredProperty[] = [];
  filteredPropertyCount = 0;
  filterText = '';
  pageIndex = 0;
  pageSize = 10;
  sortField = '';
  sortAscending = true;
  submitted = false;
  emailExsist: boolean = false;
  selectedHiredProperty: HiredProperty;


  index: any;
  showConfirmResetPassword: boolean = false;
  msgs: any[] = [];
  newUserError: string = '';
  departments: any[] = [];
  selectedRole: Number = 0;
  header: string = 'Add Candidate';
  dialogHeader = '';
  @ViewChild('propertyDialog') propertyDialog: TemplateRef<unknown>;
  @ViewChild('deletePropertyDialog') deletePropertyDialog: TemplateRef<unknown>;
  private propertyDialogRef: MatDialogRef<unknown> | null = null;
  private deleteDialogRef: MatDialogRef<unknown> | null = null;
  @ViewChild(MatAutocompleteTrigger) private addressAutocompleteTrigger: MatAutocompleteTrigger;

  constructor(private hiringRegisterService: HiringRegisterService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private datePipe: DatePipe,
    private toastService: ToastService,
    private geocodingService: OpenStreetMapGeocodingService,
    private dialog: MatDialog,
    private sharedService: SharedService,
    public zone: NgZone) { }
  roles: any[];

  ngOnInit() {
    this.loadHiredProperties();

    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
    });

    this.types = this.sharedService.getPropertyTypes();
    this.userDepartments = this.sharedService.getDepartments();
    this.districts = this.sharedService.getDistricts();
    this.buildingConditions = this.sharedService.getConditionRatings();

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

    this.initForm();
  }

  loadHiredProperties() {
    if (this.loadingProperties) {
      return;
    }
    this.loadingProperties = true;
    this.propertiesLoadError = '';
    this.hiringRegisterService.getHiredProperties().pipe(first()).subscribe(properties => {
      this.loadingProperties = false;
      if (!Array.isArray(properties)) {
        this.propertiesLoadError = 'Unable to load hired properties. Please try again.';
        this.toastService.showError(this.propertiesLoadError);
        return;
      }
      properties.forEach(element => {
        const terminationDateCheck = this.monthDiff(new Date(element.terminationDate), new Date());
        element.status = new Date(element.terminationDate) < new Date() ? "red" : terminationDateCheck <= -6 ? "green" : terminationDateCheck > -6 ? "yellow" : "";
        element.createdDate = this.datePipe.transform(element.createdDate, "yyyy-MM-dd");
        element.modifiedDate = this.datePipe.transform(element.modifiedDate, "yyyy-MM-dd");
        element.startingDate = this.datePipe.transform(element.startingDate, "EEEE, d MMMM, y");
        element.terminationDate = this.datePipe.transform(element.terminationDate, "EEEE, d MMMM, y");
      });
      this.hiredProperties = properties;
      this.clonedHiredProperties = properties;
      this.syncPropertyMarkers();
      this.updateVisibleProperties();
    }, error => {
      this.loadingProperties = false;
      this.propertiesLoadError = 'Unable to load hired properties. Please try again.';
      this.toastService.showError(this.toastService.getApiErrorMessage(error));
    });
  }

  searchAddressCoordinates(): void {
    const address = String(this.f.address.value ?? '').trim();
    if (!address || this.isGeocodingAddress) {
      return;
    }

    this.isGeocodingAddress = true;
    this.addressSearchError = '';
    this.addressResults = [];
    this.geocodingService.searchAddress(address).pipe(first()).subscribe({
      next: results => {
        this.isGeocodingAddress = false;
        this.addressResults = Array.isArray(results) ? results : [];
        if (!this.addressResults.length) {
          this.addressSearchError = 'No matching location was found. You can keep the address without map coordinates.';
        } else {
          this.addressAutocompleteTrigger?.openPanel();
        }
      },
      error: error => {
        this.isGeocodingAddress = false;
        this.addressSearchError = 'Address lookup is unavailable. You can still enter the address manually.';
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      }
    });
  }

  onAddressInputChanged(): void {
    this.addressResults = [];
    this.addressSearchError = '';
  }

  selectAddressResult(event: MatAutocompleteSelectedEvent): void {
    const result = event.option.value as GeocodingResult;
    const coordinates = validCoordinates(result?.lon, result?.lat);
    if (!coordinates) {
      this.addressSearchError = 'The selected result did not contain valid coordinates.';
      return;
    }
    this.f.address.setValue(result.display_name);
    this.address = {
      fullAddress: result.display_name,
      longitude: coordinates[0],
      latitude: coordinates[1]
    };
    this.addressResults = [];
    this.addressSearchError = '';
    this.addressAutocompleteTrigger?.closePanel();
  }

  private syncPropertyMarkers(): void {
    this.markers = this.hiredProperties.reduce((markers: MapMarkerData[], property) => {
      const coordinates = validCoordinates(property.longitude, property.latitude);
      if (coordinates) {
        markers.push({
          id: property.id,
          longitude: coordinates[0],
          latitude: coordinates[1],
          title: property.propertyCode + ': ' + (property.address || property.propertyCode),
          description: property.address
        });
      }
      return markers;
    }, []);
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
    import('exceljs').then(async ExcelJS => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('data');
      const columns = new Set<string>();
      this.hiredProperties.forEach(property => Object.keys(property).forEach(key => columns.add(key)));
      worksheet.columns = Array.from(columns, key => ({ header: key, key }));
      this.hiredProperties.forEach(property => worksheet.addRow(property));
      const excelBuffer = await workbook.xlsx.writeBuffer();
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

  updateVisibleProperties() {
    const filter = this.filterText.trim().toLowerCase();
    let properties = this.hiredProperties.filter(property =>
      !filter || Object.values(property).some(value => String(value ?? '').toLowerCase().includes(filter))
    );
    if (this.sortField) {
      const field = this.sortField;
      properties = properties.sort((left, right) => {
        const a = this.propertyValue(left, field).toLowerCase();
        const b = this.propertyValue(right, field).toLowerCase();
        return (a.localeCompare(b, undefined, { numeric: true }) * (this.sortAscending ? 1 : -1));
      });
    }
    this.filteredPropertyCount = properties.length;
    const lastPage = Math.max(0, Math.ceil(properties.length / this.pageSize) - 1);
    this.pageIndex = Math.min(this.pageIndex, lastPage);
    const start = this.pageIndex * this.pageSize;
    this.pagedHiredProperties = properties.slice(start, start + this.pageSize);
  }

  propertyValue(property: HiredProperty, field: string): string {
    const value = Object.entries(property).find(([key]) => key === field)?.[1];
    return String(value ?? '');
  }

  filterProperties(value: string) {
    this.filterText = value;
    this.pageIndex = 0;
    this.updateVisibleProperties();
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortField = field;
      this.sortAscending = true;
    }
    this.updateVisibleProperties();
  }

  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateVisibleProperties();
  }

  initForm() {
    this.submitted = false;
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

  openAddPropertyDialog() {
    this.header = 'Add Property';
    this.isView = false;
    this.address = {};
    this.addressResults = [];
    this.addressSearchError = '';
    this.initForm();
    this.openPropertyDialog();
  }

  private openPropertyDialog() {
    this.propertyDialogRef = this.dialog.open(this.propertyDialog, {
      width: 'min(92vw, 1100px)',
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'calc(100dvh - 24px)',
      panelClass: 'hiring-property-dialog'
    });
    this.propertyDialogRef.afterClosed().subscribe(() => {
      this.propertyDialogRef = null;
    });
  }

  closePropertyDialog() {
    if (this.isAdding || this.isUpdating) {
      return;
    }
    this.propertyDialogRef?.close();
  }

  setProperty() {
    this.submitted = false;
    this.address = {
      fullAddress: this.selectedHiredProperty.address,
      latitude: this.selectedHiredProperty.latitude,
      longitude: this.selectedHiredProperty.longitude
    };
    this.addressResults = [];
    this.addressSearchError = '';
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
    this.openPropertyDialog();
  }

  viewProperty() {
    this.isView = true;
    this.header = this.selectedHiredProperty.propertyCode;
    this.setProperty();
    this.openPropertyDialog();
  }

  get f() { return this.hiringForm.controls; }
  get l() { return this.hiringForm.controls; }

  openInfo(marker: MapMarkerData) {
    this.dialogHeader = marker.title;
  }

  onSubmit() {
    this.submitted = true;
    if (this.isAdding || this.isView || !this.hiringForm) {
      return;
    }
    this.hiringForm.markAllAsTouched();
    if (this.hiringForm.invalid) {
      return;
    }
    if (this.validProperty(this.f.propertyCode.value, undefined)) {
      this.toastService.showError('A property with this code already exists.');
      return;
    }
    if (!this.currentUser) {
      this.toastService.showError('Your session is unavailable. Please sign in and try again.');
      return;
    }

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
    hiredProperty.address = this.f.address.value;
    hiredProperty.latitude = this.address.fullAddress === hiredProperty.address && this.address.latitude != null
      ? String(this.address.latitude) : '';
    hiredProperty.longitude = this.address.fullAddress === hiredProperty.address && this.address.longitude != null
      ? String(this.address.longitude) : '';
    hiredProperty.createdByUser = this.currentUser;
    hiredProperty.createdUserId = this.currentUser.id;
    hiredProperty.createdDate = new Date();
    hiredProperty.isDeleted = false;
    const terminationDateCheck = this.monthDiff(new Date(hiredProperty.terminationDate), new Date());
    hiredProperty.status = new Date(hiredProperty.terminationDate) < new Date() ? "red" : terminationDateCheck <= -6 ? "green" : terminationDateCheck > -6 ? "yellow" : "";

    this.addHiredProperty(hiredProperty);
  }

  onUpdate() {
    this.submitted = true;
    if (this.isUpdating || this.isView || !this.hiringForm || !this.selectedHiredProperty) {
      return;
    }
    this.hiringForm.markAllAsTouched();
    if (this.hiringForm.invalid) {
      return;
    }
    if (this.validProperty(this.f.propertyCode.value, this.selectedHiredProperty.id)) {
      this.toastService.showError('A property with this code already exists.');
      return;
    }
    if (!this.currentUser) {
      this.toastService.showError('Your session is unavailable. Please sign in and try again.');
      return;
    }

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
    hiredProperty.address = this.f.address.value;
    const coordinatesSelectedForAddress = this.address.fullAddress === hiredProperty.address;
    hiredProperty.latitude = coordinatesSelectedForAddress && this.address.latitude != null
      ? String(this.address.latitude) : '';
    hiredProperty.longitude = coordinatesSelectedForAddress && this.address.longitude != null
      ? String(this.address.longitude) : '';
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
    if (this.isAdding) {
      return;
    }

    this.isAdding = true;
    if (this.propertyDialogRef) {
      this.propertyDialogRef.disableClose = true;
    }
    this.hiringRegisterService.addHiredProperty(hiredProperty).pipe().subscribe(id => {
      if (id != 0) {
        hiredProperty.id = id;
        const _hiredProperty: any = hiredProperty;
        _hiredProperty.createdDate = this.datePipe.transform(hiredProperty.createdDate, "yyyy-MM-dd");
        _hiredProperty.modifiedDate = this.datePipe.transform(hiredProperty.modifiedDate, "yyyy-MM-dd");
        _hiredProperty.startingDate = this.datePipe.transform(hiredProperty.startingDate, "EEEE, d MMMM, y");
        _hiredProperty.terminationDate = this.datePipe.transform(hiredProperty.terminationDate, "EEEE, d MMMM, y");
        this.hiredProperties.push(_hiredProperty);
        this.syncPropertyMarkers();
        this.updateVisibleProperties();
        this.toastService.showSuccess('Property added successfully.');
        this.propertyDialogRef?.close();
      } else {
        if (this.propertyDialogRef) {
          this.propertyDialogRef.disableClose = false;
        }
        this.toastService.showError('Unable to add this property. Please try again.');
      }
      this.isAdding = false;
    }, error => {
        if (this.propertyDialogRef) {
          this.propertyDialogRef.disableClose = false;
        }
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isAdding = false;
      });
  }

  updateHiredProperty(hiredProperty: HiredProperty) {
    if (this.isUpdating) {
      return;
    }
    this.isUpdating = true;
    if (this.propertyDialogRef) {
      this.propertyDialogRef.disableClose = true;
    }
    this.hiringRegisterService.updateHiredProperty(hiredProperty).pipe(first()).subscribe(isUpdated => {
      if (isUpdated) {
        this.toastService.showSuccess('Property updated successfully.');
        const _hiredProperty: any = hiredProperty;
        _hiredProperty.createdDate = this.datePipe.transform(hiredProperty.createdDate, "yyyy-MM-dd");
        _hiredProperty.modifiedDate = this.datePipe.transform(hiredProperty.modifiedDate, "yyyy-MM-dd");
        _hiredProperty.startingDate = this.datePipe.transform(hiredProperty.startingDate, "EEEE, d MMMM, y");
        _hiredProperty.terminationDate = this.datePipe.transform(hiredProperty.terminationDate, "EEEE, d MMMM, y");
        this.hiredProperties[this.index] = hiredProperty;
        this.syncPropertyMarkers();
        this.updateVisibleProperties();
        this.propertyDialogRef?.close();
      } else {
        if (this.propertyDialogRef) {
          this.propertyDialogRef.disableClose = false;
        }
        this.toastService.showError('Unable to update this property. Please try again.');
      }
      this.isUpdating = false;
    }, error => {
      this.isUpdating = false;
      if (this.propertyDialogRef) {
        this.propertyDialogRef.disableClose = false;
      }
      this.toastService.showError(this.toastService.getApiErrorMessage(error));
    });
  }

  validProperty(propertyCode: string, id: number) {
    var _propertyCode = propertyCode == undefined ? this.f.email.value : propertyCode;
    if (id != undefined) {//for edit
      if (propertyCode === undefined || propertyCode === '')
        return false
      else
        return this.hiredProperties.filter(u => (u.propertyCode || '').toLowerCase() == _propertyCode.toLowerCase() && u.id != id).length > 0;
    } else { //for add      
      return this.hiredProperties.filter(u => (u.propertyCode || '').toLowerCase() == _propertyCode.toLowerCase()).length > 0 ? this.emailExsist = true : this.emailExsist = false;
    }
  }

  onRemoveFile(event: any) { }
  onSelectFile(files: any) { }
  setRole(e) {
    this.selectedRole = e.value.factor
  }

  onRowEditInit(e) { }




  deleteHiredProperty() {
    if (this.deletingHiredProperty || !this.selectedHiredProperty) {
      return;
    }
    this.deletingHiredProperty = true;
    if (this.deleteDialogRef) {
      this.deleteDialogRef.disableClose = true;
    }
    this.selectedHiredProperty.createdDate = new Date(this.selectedHiredProperty.createdDate);
    this.selectedHiredProperty.modifiedDate = new Date(this.selectedHiredProperty.modifiedDate);
    this.selectedHiredProperty.startingDate = new Date(this.selectedHiredProperty.startingDate);
    this.selectedHiredProperty.terminationDate = new Date(this.selectedHiredProperty.terminationDate);
    this.hiringRegisterService.deleteHiredProperty(this.selectedHiredProperty).pipe(first()).subscribe(isDeleted => {
      if (isDeleted) {
        this.toastService.showSuccess('Property deleted successfully.');
        this.hiredProperties.splice(this.index, 1);
        this.syncPropertyMarkers();
        this.updateVisibleProperties();
        this.deleteDialogRef?.close();
      } else {
        if (this.deleteDialogRef) {
          this.deleteDialogRef.disableClose = false;
        }
        this.toastService.showError('Unable to delete this property. Please try again.');
      }
      this.deletingHiredProperty = false;
    }, error => {
      this.deletingHiredProperty = false;
      if (this.deleteDialogRef) {
        this.deleteDialogRef.disableClose = false;
      }
      this.toastService.showError(this.toastService.getApiErrorMessage(error));
    });
  }

  confirmDelete() {
    this.deleteDialogRef = this.dialog.open(this.deletePropertyDialog, {
      width: 'min(92vw, 480px)'
    });
    const dialogRef = this.deleteDialogRef;
    dialogRef.afterClosed().subscribe(() => {
      if (this.deleteDialogRef === dialogRef) {
        this.deleteDialogRef = null;
      }
    });
  }

  closeDeleteDialog() {
    if (!this.deletingHiredProperty) {
      this.deleteDialogRef?.close();
    }
  }

  selectProperty(hiredProperty: HiredProperty) {
    this.selectedHiredProperty = hiredProperty;
    this.index = this.hiredProperties.indexOf(hiredProperty);
  }
}
