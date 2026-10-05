import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, TimeoutError, defer, from, of } from 'rxjs';
import { concatMap, finalize, first, map, tap, timeout, toArray } from 'rxjs/operators';
import { Facility } from 'src/app/models/facility.model';
import { FacilityService } from 'src/app/services/facility/facility.service';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: false,
  selector: 'app-addassetregister',
  templateUrl: './addassetregister.component.html',
  styleUrls: ['./addassetregister.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})

export class AddassetregisterComponent implements OnInit {
  @Output() newAsset = new EventEmitter<any>();
  @Input() selectedAsset: any;
  improvements = [];
  pagedImprovements: any[] = [];
  improvementFilter = '';
  improvementCount = 0;
  improvementPageIndex = 0;
  improvementPageSize = 5;
  improvementSortField = '';
  improvementSortAscending = true;
  uploadedImprovementFiles: any[] = [];
  uploadedFinanceFiles: any[] = [];
  uploadedLandFiles: any[] = [];
  myfile: any[] = [];
  landIsSubmitted: boolean = false;
  improvementIsSubmitted: boolean = false;
  financeIsSubmitted: boolean = false;
  isSubmitted: boolean = false;
  selectedImprovement: any;
  selectedDeedsOffice: any;
  generalInformation: {
    deedsOffice: '',
    class: '',
    type: ''
  };
  today = new Date();
  loading = true;
  loadError = false;
  filesLoading = false;
  filesError = false;
  uploadingFiles = false;
  fileSelectionError = '';
  incomeLeaseStatuses: any[];
  showHiredPropertyLink:boolean = false;
  facilityTypes: any[];
  natureOfLeases: any[];
  showDialog: boolean = false;
  titleDeedIsInvalid: boolean = false;
  activeIndex: number = 0;
  landForm: FormGroup;
  financialForm: FormGroup;
  improvementForm: FormGroup;
  deedsOffices: any[];
  typeOfImprovements: any[];
  potentialUseList: any[];
  classes: any[];
  landFiles: any[] = [];
  regions: any[];
  types: any[] = [];
  improvementFiles: any[] = [];
  lfiles: any[] = [];
  financeFiles: any[] = [];
  submitted = false;
  localAuthorities: any[];
  registrationDivisions: any[];
  magisterialDistricts: any[];
  districtMunicipalities: any[];
  conditionRatings: any[];
  vats: any[];
  userDepartments: any[];
  landRemainders: any[];
  howAcquireds: any[];
  //vestedTypes: any[];
  value5: string = 'Disabled';
  aFSs: any[];
  howAcquired: any = {
    name: undefined
  };
  facilityType: undefined;
  surveys: any[];
  provinces: any[];
  functionalPerformanceRatings: any[];
  ownershipCategories: any;
  errorMsg: string;
  mode: string = "Add";
  isViewOnly: boolean = false;
  province: { name: 'Mpumalanga', code: 'MP', factor: 6 };
  registrationDivision: { name: 'Mpumalanga', code: 'M', factor: 4 };
  savingLand: boolean = false;
  private pendingFinalAsset: Facility | null = null;
  improvementCols = [
    { field: 'buildingName', header: 'Building Name' },
    { field: 'type', header: 'Type' },
    { field: 'size', header: 'Size' },
    { field: 'potentialUse', header: 'Potential Use' },
    { field: 'usableArea', header: 'Usable Area' },
    { field: 'conditionRating', header: 'Condition Rating' }
  ];

  facility: any;
  filesAreLoaded:boolean = false;
  finance: {};
  improvement: {}
  currentUser: User;

  formattedAmount;
 amount;
  constructor(private router: Router,private sharedService: SharedService, private authenticationService: AuthenticationService, public facilityService: FacilityService, private formBuilder: FormBuilder, private toastService: ToastService) { }

  ngOnInit() {
    this.currentUser = this.authenticationService.currentUserValue;
    this.buildForm();

    if (this.selectedAsset.facilityId != undefined) {      
      this.mode = this.selectedAsset.mode;      
      if (this.mode == "Edit" || this.mode == "View") {
        this.loading = false;
        this.facility = this.selectedAsset.facility;
        this.initFacility();
        this.getFiles(this.facility.fileReference);
      } else {
        this.loadSelectedFacility();
      }

    } else {
      this.facility = {
        id: 0,
        name: 'Land T0IS00000000000700020',
        fileReference: undefined,
        type: undefined,
        clientCode: 'T0IS00000000000700020',
        userId: this.currentUser?.id,
        status: "New",
        capturerId: this.currentUser?.id,
        createdDate: new Date(),
        modifierId: this.currentUser?.id,
        modifiedDate: new Date(),
        land: {
          id: 0,
          geographicalLocation: {
            id: 0
          },
          propertyDescription: {
            id: 0
          },
          landUseManagementDetail: {
            id: 0
          },
          leaseStatus: {
            id: 0
          }
        },
        finance: {
          id: 0,
          secondaryInformationNote: {
            id: 0
          },
          valuation: {
            id: 0
          }
        },
        improvements: []
      }
      this.mode = this.selectedAsset.mode;
      this.loading = false;
    }   
    if([1, 4, 5].includes(this.currentUser?.roleId))
    {
        this.mode = 'View';
    }
    this.isViewOnly = this.mode === 'View';
  }

  get l() { return this.landForm.controls; }
  get f() { return this.financialForm.controls; }
  get I() { return this.improvementForm.controls; }

  private findOption<T extends { name: string }>(options: T[] | null | undefined, value: unknown): T | undefined {
    if (!Array.isArray(options) || typeof value !== 'string' || !value.trim()) {
      return undefined;
    }
    const normalizedValue = value.trim().toLocaleLowerCase();
    return options.find(option => option.name?.trim().toLocaleLowerCase() === normalizedValue);
  }

  loadSelectedFacility(): void {
    this.loading = true;
    this.loadError = false;
    this.errorMsg = '';
    defer(() => this.facilityService.getFacilityById(
      this.selectedAsset.facilityId,
      this.selectedAsset.facilityType
    ))
      .pipe(
        first(),
        timeout(30000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: facility => {
          if (!facility || typeof facility !== 'object') {
            this.loadError = true;
            this.errorMsg = 'The server returned incomplete asset details.';
            this.toastService.showError(this.errorMsg);
            return;
          }
          this.loadError = false;
          try {
            this.facility = facility;
            this.initFacility();
            this.getFiles(facility.fileReference);
          } catch {
            this.loadError = true;
            this.errorMsg = 'Asset details could not be displayed. Please try again.';
            this.toastService.showError(this.errorMsg);
          }
        },
        error: error => {
          this.loadError = true;
          this.errorMsg = error instanceof TimeoutError
            ? 'Loading asset details timed out. Please try again.'
            : 'Unable to load the asset. Please try again.';
          this.toastService.showError(this.errorMsg);
        }
      });
  }

  setLocalAuthorities(e) { }

  setDistrictMunicipality(e) {
    if (e != undefined) {
      if (e.value != undefined) {
        if (e.value.factor == 1) {
          let _magisterialDistricts =  [    
            { name: 'Barberton', code: 'B', factor: 1 },  
            { name: 'Nelspruit', code: 'N', factor: 2 },
            { name: 'Lydenburg', code: 'L', factor: 3 },
            { name: 'Mhala', code: 'M', factor: 4 },
            { name: 'Nsikazi', code: 'NS', factor: 5 },            
            { name: 'Whiteriver', code: 'W', factor: 6 },         
          ];
          let _localAuthorities = [
            { name: 'Bushbuckridge', code: 'B', factor: 1 },
            { name: 'Mbombela', code: 'M', factor: 2 },
            { name: 'Nkomazi', code: 'N', factor: 3 },
            { name: 'Thaba Chweu', code: 'TC', factor: 4},           
          ];
          this.magisterialDistricts = _magisterialDistricts;
          this.localAuthorities = _localAuthorities;
        } else if (e.value.factor == 2) {
          let _magisterialDistricts = [
            { name: 'Amersfoort', code: 'A', factor: 1 },
            { name: 'Belfast', code: 'BE', factor: 2 },
            { name: 'Balfour', code: 'BE', factor: 3 },
            { name: 'Bethal', code: 'B', factor: 4 },
            { name: 'Carolina', code: 'C', factor: 5 },
            { name: 'Eerstehoek', code: 'E', factor: 6 },
            { name: 'Ermelo', code: 'E', factor: 7 },   
            { name: 'Highveld Ridge', code: 'HR', factor: 8 }, 
            { name: 'Piet Retief', code: 'PR', factor: 9 },
            { name: 'Standerton', code: 'S', factor: 10 },                     
            { name: 'Standerton', code: 'ST', factor: 11 },             
            { name: 'Volksrust', code: 'V', factor: 12 },                  
            { name: 'Wakkerstroom', code: 'W', factor: 13 },
          ];
          let _localAuthorities = [
            { name: 'Albert Luthuli', code: 'AL', factor: 1 },
            { name: 'Dipaleseng', code: 'D', factor: 2 },
            { name: 'Govan Mbeki', code: 'GM', factor: 3 },
            { name: 'Lekwa', code: 'L', factor: 7 },
            { name: 'Mkhondo', code: 'M', factor: 4 },                     
            { name: 'Msukaligwa', code: 'MS', factor: 5 },
            { name: 'Mkhondo', code: 'MK', factor: 6 }, 
            { name: 'Pixley Ka Seme', code: 'PKS', factor: 8 },  
          ];
          this.magisterialDistricts = _magisterialDistricts;
          this.localAuthorities = _localAuthorities;
        } else if(e.value.factor == 3) {
          let _magisterialDistricts = [
            { name: 'Belfast', code: 'B', factor: 1 },
            { name: 'Delmas', code: 'D', factor: 2 },
            { name: 'Ermelo', code: 'E', factor: 3 },
            { name: 'Hendrina', code: 'H', factor: 4 },  
            { name: 'Kriel', code: 'K', factor: 5 },     
            { name: 'Kwamhlanga', code: 'K', factor: 6 },                  
            { name: 'Mbibana', code: 'MB', factor: 7 },
            { name: 'Mdutjana', code: 'MD', factor: 8 },
            { name: 'Middelburg', code: 'M', factor: 9 },
            { name: 'Mkobola', code: 'MK', factor: 10 },           
            { name: 'Waterval Boven', code: 'WB', factor: 11 },
            { name: 'Witbank', code: 'W', factor: 12 },
          ];
          
          let _localAuthorities = [
            { name: 'Dr. J.S. Moroka', code: 'JSM', factor: 1 },
            { name: 'eMalahleni', code: 'M', factor: 2 },
            { name: 'eMakhazeni', code: 'MK', factor: 3},           
            { name: 'Msukaligwa', code: 'MS', factor: 4 },
            { name: 'Steve Tshwete', code: 'ST', factor: 5 },
            { name: 'Thembisile Hani', code: 'TH', factor: 6 },
            { name: 'Victor Khanye', code: 'VK', factor: 7 },            
          ];

          this.magisterialDistricts = _magisterialDistricts;
          this.localAuthorities = _localAuthorities;
        }
        else {
          let _magisterialDistricts = [     
            { name: 'Bushbuckridge', code: 'B', factor: 1 },
            { name: 'Lydenburg', code: 'L', factor: 2 },
            { name: 'Mhala', code: 'M', factor: 3 },
            { name: 'Pilgrims Rest 2', code: 'PR', factor: 4 },
          ];

          let _localAuthorities = [
            { name: 'Bushbuckridge', code: 'B', factor: 1 },
            { name: 'Thaba Chweu', code: 'TC', factor: 2 },            
          ];          

          this.magisterialDistricts = _magisterialDistricts;
          this.localAuthorities = _localAuthorities;
        }
      }
    }
  }

  setDeedsOffice(e) {

  }

  setHowAcquired(e) {

  }

  setVat(e) { }

  setProvince(e) { }

  setMagisterialDistrict(e) { }

  setClass(e) {

  }

  setConditionRating(e) { }

  setType(e) {

  }

  onFinancialFormSubmit() {
    if (this.savingLand || this.isViewOnly) {
      return;
    }
    this.financeIsSubmitted = true;
    this.submitted = true;
    this.financialForm.markAllAsTouched();
    if (this.financialForm.invalid) {
      this.errorMsg = 'Please correct the financial information before saving.';
      return;
    }
    this.saveAssetStep('finance', false, true, false, 'Financial information saved successfully.');
  }

  onImprovementFormSubmit() {
    if (this.savingLand || this.isViewOnly) {
      return;
    }
    this.improvementIsSubmitted = true;
    this.submitted = true;
    this.improvementForm.markAllAsTouched();
    if (this.improvementForm.invalid) {
      this.errorMsg = 'Please complete the required improvement information before saving.';
      return;
    }
    this.saveAssetStep('improvement', false, false, true, 'Improvement information saved successfully.');
  }



  onLandFormSubmit() {
    if (this.savingLand || this.isViewOnly) {
      return;
    }
    this.landIsSubmitted = true;
    this.submitted = true;
    this.landForm.markAllAsTouched();
    if (this.landForm.invalid) {
      this.errorMsg = 'Please complete the required asset details before saving.';
      return;
    }
    this.saveAssetStep('land', true, false, false, 'Asset details saved successfully.');
  }

  onSubmit() {
    if (this.savingLand || this.isViewOnly) {
      return;
    }
    if (this.pendingFinalAsset) {
      this.retryPendingUploads();
      return;
    }
    this.errorMsg = '';
    this.isSubmitted = true;
    this.submitted = true;
    const improvementNeedsValidation = this.facility?.type !== 'Land' && this.improvementForm.dirty;
    this.landForm.markAllAsTouched();
    this.financialForm.markAllAsTouched();
    if (this.landForm.invalid || this.financialForm.invalid || (improvementNeedsValidation && this.improvementForm.invalid)) {
      this.errorMsg = 'Please complete the required asset information before submitting.';
      if (improvementNeedsValidation) {
        this.improvementForm.markAllAsTouched();
      }
      return;
    }
    this.saveAssetStep(
      'facility',
      true,
      true,
      true,
      this.mode === 'Add' ? 'Asset added successfully.' : 'Asset updated successfully.',
      true
    );
  }

  private saveAssetStep(
    step: string,
    includeLand: boolean,
    includeFinance: boolean,
    includeImprovements: boolean,
    successMessage: string,
    isFinalSubmit = false
  ): void {
    this.savingLand = true;
    this.errorMsg = '';
    this.assignFacility(includeLand, includeFinance, includeImprovements);
    this.facility.status = isFinalSubmit ? 'SignedOff' : 'Saved';
    if (isFinalSubmit) {
      this.facility.modifierId = this.currentUser?.id;
      this.facility.modifiedDate = new Date();
    }

    this.facilityService.saveFacility(this.facility, step).pipe(first()).subscribe({
      next: response => {
        if (!response) {
          this.savingLand = false;
          this.errorMsg = isFinalSubmit && this.mode === 'Edit'
            ? 'The asset could not be updated. Please try again.'
            : 'Unable to save the asset. Please check the information and try again.';
          this.toastService.showError(this.errorMsg);
          return;
        }

        const savedFacility = typeof response === 'object' ? response : this.facility;
        this.facility = savedFacility;
        if (isFinalSubmit) {
          this.pendingFinalAsset = savedFacility;
        }
        this.uploadPendingFiles().pipe(first()).subscribe({
          next: () => {
            this.savingLand = false;
            if (isFinalSubmit) {
              this.finishFinalSubmit(savedFacility);
            } else {
              this.showToast('Saved', successMessage);
            }
          },
          error: () => {
            this.savingLand = false;
            this.handleUploadError();
          }
        });
      },
      error: (error: HttpErrorResponse) => this.handleSaveError(error)
    });
  }

  retryPendingUploads(): void {
    if (this.savingLand || !this.pendingFinalAsset) {
      return;
    }
    this.savingLand = true;
    this.errorMsg = '';
    this.uploadPendingFiles().pipe(first()).subscribe({
      next: () => {
        this.savingLand = false;
        this.finishFinalSubmit(this.pendingFinalAsset);
      },
      error: () => {
        this.savingLand = false;
        this.handleUploadError();
      }
    });
  }

  private finishFinalSubmit(savedFacility: Facility): void {
    this.pendingFinalAsset = null;
    const response = this.mode === 'Add' ? 'isAddedSuccessful' : 'isUpdatedSuccessful';
    this.newAsset.emit({ mode: this.mode, data: savedFacility, response });
    this.showToast('Saved', this.mode === 'Add' ? 'Asset added successfully.' : 'Asset updated successfully.');
  }

  private uploadPendingFiles(): Observable<void> {
    const uploads = [
      { files: this.uploadedLandFiles, folder: `Land${this.facility.fileReference}` },
      { files: this.uploadedImprovementFiles, folder: `Improvement${this.facility.fileReference}` },
      { files: this.uploadedFinanceFiles, folder: `Finance${this.facility.fileReference}` }
    ].filter(upload => upload.files.length > 0);
    if (!uploads.length) {
      return of(undefined);
    }

    this.uploadingFiles = true;
    return from(uploads).pipe(
      concatMap(upload => this.facilityService.uploadFiles(upload.files, upload.folder).pipe(
        tap(() => upload.files.splice(0, upload.files.length)),
        map(() => undefined)
      )),
      toArray(),
      map(() => undefined),
      finalize(() => this.uploadingFiles = false)
    );
  }

  private handleUploadError(): void {
    this.uploadingFiles = false;
    this.errorMsg = 'The asset was saved, but its supporting files could not be uploaded. Retry the save to finish uploading.';
    this.showToast('Upload error', this.errorMsg);
  }

  private handleSaveError(error: HttpErrorResponse): void {
    this.savingLand = false;
    if (error.status === 401) {
      this.errorMsg = 'Your session has expired. Sign in and try again.';
    } else if (error.status === 403) {
      this.errorMsg = 'You are not authorized to save this asset.';
    } else if (error.status === 404) {
      this.errorMsg = 'The asset could not be found. Refresh the asset list and try again.';
    } else if (error.status === 409) {
      this.errorMsg = 'This asset conflicts with an existing record. Review the asset details and try again.';
    } else if (error.status === 400) {
      this.errorMsg = 'Some asset details are invalid. Review the information and try again.';
    } else if (error.status === 0) {
      this.errorMsg = 'Unable to reach the server. Check your connection and try again.';
    } else if (error.status >= 500) {
      this.errorMsg = 'The server could not save the asset. Please try again later.';
    } else {
      this.errorMsg = 'Unable to save the asset. Please try again.';
    }
    this.showToast('Error', this.errorMsg);
  }
  isArray(obj){
    return !!obj && obj.constructor === Array;
  }

  assignFacility(isLandSave: boolean, isFinancialSave: boolean, isImprovementSave: boolean) {
    if (isLandSave) {
      if (this.facility.land != undefined && this.facility.land != null) {
        let userDepartments = null;
        let departments = this.landForm.controls["userDepartment"].value != undefined ? this.landForm.controls["userDepartment"].value : [];
        if(this.isArray(departments)){
          departments.forEach(element => {
            if(userDepartments == null)
              userDepartments = element.name;
            else
              userDepartments = userDepartments + ' ,' + element.name;
          });
        }else{
          userDepartments = departments.name;
        }
       
        this.facility.clientCode = this.landForm.controls["clientCode"].value;
        this.facility.survey = this.landForm.controls["survey"].value != undefined ? this.landForm.controls["survey"].value.name : null;
        this.facility.type = this.landForm.controls["facilityType"].value != undefined ? this.landForm.controls["facilityType"].value.name : null;
        //this.facility.vestedType = this.landForm.controls["vestedType"].value != undefined ? this.landForm.controls["vestedType"].value.name : null;
        this.facility.userDepartment = userDepartments;
        this.facility.land = {
          id: this.facility.land.id == 0 ? 0 : this.facility.land.id,
         
          type: this.landForm.controls["type"].value != undefined ? this.landForm.controls["type"].value.name : null,
          class: this.landForm.controls["class"].value != undefined ? this.landForm.controls["class"].value.name : null,
          geographicalLocation: {
            id: this.facility.land.geographicalLocation.id == 0 ? 0 : this.facility.land.geographicalLocation.id,
            province: this.landForm.controls["province"].value != undefined ? this.landForm.controls["province"].value.name : null,
            town: this.landForm.controls["town"].value,
            suburb: this.landForm.controls["suburb"].value,
            streetName: this.landForm.controls["streetName"].value,
            streetNumber: Number(this.landForm.controls["streetNumber"].value),
            districtMunicipality: this.landForm.controls["districtMunicipality"].value != undefined ? this.landForm.controls["districtMunicipality"].value.name : null,
            region: this.landForm.controls["region"].value != undefined ? this.landForm.controls["region"].value.name : null,
            localAuthority: this.landForm.controls["localAuthority"].value != undefined ? this.landForm.controls["localAuthority"].value.name : null,
            latitude: this.landForm.controls["latitude"].value,
            longitude: this.landForm.controls["longitude"].value,
            magisterialDistrict: this.landForm.controls["magisterialDistrict"].value != undefined ? this.landForm.controls["magisterialDistrict"].value.name : null,
          },
          propertyDescription: {
            id: this.facility.land.propertyDescription.id == 0 ? 0 : this.facility.land.propertyDescription.id,
            registrationDivision: this.landForm.controls["registrationDivision"].value != undefined ? this.landForm.controls["registrationDivision"].value.name : null,
            townshipName: this.landForm.controls["townshipName"].value,
            landParcel: this.landForm.controls["landParcel"].value,
            landPortion: this.landForm.controls["landPortion"].value,
            oldDescription: this.landForm.controls["oldDescription"].value,
            landRemainder: this.landForm.controls["landRemainder"].value != undefined ? this.landForm.controls["landRemainder"].value.name == "Yes" ? true : false : false,
            farmName: this.landForm.controls["farmName"].value,
            SGDiagramNumber: this.landForm.controls["SGDiagramNumber"].value,
            extent: this.landForm.controls["extent"].value != "" ? Number(this.landForm.controls["extent"].value) : 0,
            LPICode: this.landForm.controls["LPICode"].value,
            acquired: this.landForm.controls["acquired"].value ? this.landForm.controls["acquired"].value.name : null,
            acquiredOther: this.landForm.controls["acquiredOther"].value,
          },
          landUseManagementDetail: {
            id: this.facility.land.landUseManagementDetail.id == 0 ? 0 : this.facility.land.landUseManagementDetail.id,
            titleDeedNumber: this.landForm.controls["titleDeedNumber"].value,
            deedsOffice: this.landForm.controls["deedsOffice"].value != undefined ? this.landForm.controls["deedsOffice"].value.name : null,
            registrationDate: this.landForm.controls["registrationDate"].value != "" ? this.landForm.controls["registrationDate"].value : null,
            registeredOwner: this.landForm.controls["registeredOwner"].value,
            vestingDate: this.landForm.controls["vestingDate"].value != "" ? this.landForm.controls["vestingDate"].value : null,
           // conditionsOfTitle: this.landForm.controls["conditionsOfTitle"].value,
            ownershipCategory: this.landForm.controls["ownershipCategory"].value != undefined ? this.landForm.controls["ownershipCategory"].value.name : null,
            stateOwnedPercentage: this.landForm.controls["stateOwnedPercentage"].value != "" ? this.landForm.controls["stateOwnedPercentage"].value : null,
            landUse: this.landForm.controls["landUse"].value,
            zoning: this.landForm.controls["zoning"].value,
            userDepartment: this.landForm.controls["userDepartment"].value != undefined ? this.landForm.controls["userDepartment"].value.name : null, 
            facilityName: this.landForm.controls["facilityName"].value,
            incomeLeaseStatus: this.landForm.controls["incomeLeaseStatus"].value != undefined ? this.landForm.controls["incomeLeaseStatus"].value.name : null,
          },
          leaseStatus: {
            id: this.facility.land.leaseStatus.id == 0 ? 0 : this.facility.land.leaseStatus.id,
            natureOfLease: this.landForm.controls["natureOfLease"].value ? this.landForm.controls["natureOfLease"].value.name : null,
            IDNumberCompanyRegistrationNumber: this.landForm.controls["IDNumberCompanyRegistrationNumber"].value,
            POBox: this.landForm.controls["POBox"].value != null ?  this.landForm.controls["POBox"].value.toString() : null,
            contactNumber: this.landForm.controls["contactNumber"].value,
            capacityofContactPerson: this.landForm.controls["capacityofContactPerson"].value != "" ? this.landForm.controls["capacityofContactPerson"].value : null,
            contactPerson: this.landForm.controls["contactPerson"].value != "" ? this.landForm.controls["contactPerson"].value : null,
            postalCode: Number(this.landForm.controls["postalCode"].value),
            leaseStatusTown: this.landForm.controls["leaseStatusTown"].value,
            rentalAmount: this.landForm.controls["rentalAmount"].value != "" ? this.landForm.controls["rentalAmount"].value : 0,
            terminationDate: this.landForm.controls["terminationDate"].value != "" ? this.landForm.controls["terminationDate"].value : null,
            startingDate: this.landForm.controls["startingDate"].value != "" ? this.landForm.controls["startingDate"].value : null,
            occupationDate: this.landForm.controls["occupationDate"].value != "" ? this.landForm.controls["occupationDate"].value : null,
            escalation: this.landForm.controls["escalation"].value != "" ? this.landForm.controls["escalation"].value : null,
            vat: this.landForm.controls["vat"].value != undefined ? this.landForm.controls["vat"].value.name : null,
            leaseNumber: this.landForm.controls["leaseNumber"].value != "" ? this.landForm.controls["leaseNumber"].value : null,
            otherCharges: this.landForm.controls["otherCharges"].value != "" ? this.landForm.controls["otherCharges"].value : 0,
          }
        };
      }
    }
    if (isFinancialSave) {
      if (this.facility.finance != undefined && this.facility.finance != null) {
        this.facility.finance = {
          id: this.facility.finance.id == 0 ? 0 : this.facility.finance.id,
          landUseClass: this.financialForm.controls["landUseClass"].value,
          natureofAsset: this.financialForm.controls["natureofAsset"].value,
          afs: this.financialForm.controls["afs"].value != undefined ? this.financialForm.controls["afs"].value.name : null,
          secondaryInformationNote: {
            id: this.facility.finance.secondaryInformationNote.id == 0 ? 0 : this.facility.finance.secondaryInformationNote.id,
            additionCash: this.financialForm.controls["additionCash"].value != "" ? this.financialForm.controls["additionCash"].value : 0,
            additionNonCash: this.financialForm.controls["additionNonCash"].value != "" ? this.financialForm.controls["additionNonCash"].value : 0,
            addition: this.financialForm.controls["addition"].value != "" ? this.financialForm.controls["addition"].value : 0,
            disposal: this.financialForm.controls["disposal"].value != "" ? this.financialForm.controls["disposal"].value : 0,
            openingBalance: this.financialForm.controls["openingBalance"].value != "" ? Number(this.financialForm.controls["openingBalance"].value) : 0,
            closingBalance: this.financialForm.controls["closingBalance"].value != "" ? this.financialForm.controls["closingBalance"].value : 0,
          },
          valuation: {
            id: this.facility.finance.valuation.id == 0 ? 0 : this.facility.finance.valuation.id,
            municipalValuationDate: this.financialForm.controls["municipalValuationDate"].value != "" ?  this.financialForm.controls["municipalValuationDate"].value : null,
            nonMunicipalValuationDate:  this.financialForm.controls["nonMunicipalValuationDate"].value != "" ? this.financialForm.controls["nonMunicipalValuationDate"].value : null,
            municipalValuation: this.financialForm.controls["municipalValuation"].value,
            nonMunicipalValuation: this.financialForm.controls["nonMunicipalValuation"].value,
            propetyRatesAccount: this.financialForm.controls["propetyRatesAccount"].value,
            value: this.financialForm.controls["value"].value,
            accountNoForService: this.financialForm.controls["accountNoForService"].value,
            personInstitutionResposible: this.financialForm.controls["personInstitutionResposible"].value,
          }
        }
      }
    }
    if (isImprovementSave) {
      if (this.facility.improvements != undefined && this.facility.improvements != null) {
        this.facility.improvements = this.improvements;
      }
    }
  }

  buildForm() {
    this.landForm = this.formBuilder.group({
      survey:[''],
      facilityType:['', Validators.required],
      clientCode:['', Validators.required],
      deedsOffice: [''],
      class: [''],     
      //vestedType: [''],
      type: [''],
      province: [''],
      town: [''],
      suburb: [''],
      streetName: [''],
      streetNumber: ['', Validators.min(0)],
      districtMunicipality: [''],
      region: [''],
      localAuthority: [''],
      latitude: [''],
      longitude: [''],
      registrationDivision: [''],
      townshipName: [''],
      landParcel: [''],
      landPortion: [''],
      oldDescription: [''],
      landRemainder: [''],
      farmName: [''],
      SGDiagramNumber: [''],
      extent: ['', Validators.min(0)],
      LPICode: [''],
      acquired: [''],
      acquiredOther: [''],
      titleDeedNumber: [''],
      registrationDate: [this.today],
      registeredOwner: [''],
      vestingDate: [''],
      //conditionsOfTitle: [''],
      ownershipCategory: [''],
      stateOwnedPercentage: ['', Validators.min(0)],
      landUse: [''],
      zoning: [''],
      userDepartment: [''],
      facilityName: ['', Validators.required],
      incomeLeaseStatus: [''],
      vat: [''],
      leaseNumber: [''],
      otherCharges: [0],
      rentalAmount: [0],
      terminationDate: [''],
      startingDate: [''],
      occupationDate: [''],
      escalation: [''],
      contactNumber: [''],
      capacityofContactPerson: [''],
      contactPerson: [''],
      postalCode: [''],
      leaseStatusTown: [''],
      POBox: [''],
      IDNumberCompanyRegistrationNumber: [''],
      natureOfLease: [''],
      magisterialDistrict: ['']
    });
    this.improvementForm = this.formBuilder.group({
      buildingName: ['', Validators.required],
      type: ['', Validators.required],
      size: ['', [Validators.required, Validators.min(0)]],
      potentialUse: ['', [Validators.required]],
      siteCoverag: ['', [Validators.required, Validators.min(0)]],
      levelofUtilization: ['', [Validators.required]],
      extentofBuilding: ['', [Validators.required, Validators.min(0)]],
      conditionRating: ['', [Validators.required]],
      usableArea: ['', [Validators.required, Validators.min(0)]],
      functionalPerformanceRating: ['', [Validators.required]],
      comment: ['', [Validators.required]],
    });
    this.financialForm = this.formBuilder.group({
      landUseClass: [''],
      afs: [''],
      natureofAsset: [''],
      additionCash: [0],
      additionNonCash: [0],
      addition: [0],
      disposal: [0],
      openingBalance:[0],
      closingBalance: [0],
      municipalValuationDate: [''],
      nonMunicipalValuationDate: [''],
      municipalValuation: [''],
      nonMunicipalValuation: [''],
      propetyRatesAccount: [''],
      value: [''],
      accountNoForService: [''],
      personInstitutionResposible: [''],
    });

    this.potentialUseList = [
      { name: 'Agriculture', code: 'A', factor: 1 },
      { name: 'Alternative Payments-Sliding Scales', code: 'AP', factor: 3 },
      { name: 'Flats', code: 'F', factor: 3 },
      { name: 'Industrial', code: 'I', factor: 1 },
      { name: 'Offices', code: 'O', factor: 2 },
      { name: 'Residential', code: 'R', factor: 2 },   
      { name: 'Vacant Land', code: 'VL', factor: 1 },
      { name: 'Sold', code: 'S', factor: 2 },
      { name: 'Other Uses', code: 'OU', factor: 3 },
    ];

    this.typeOfImprovements = [
      { name: 'Hotel', code: 'H', factor: 1 },
      { name: 'House', code: 'HH', factor: 2 },
      { name: 'Farm', code: 'F', factor: 3 }
      ];

    this.userDepartments = this.sharedService.getDepartments();
    this.registrationDivisions = [
      { name: 'Bloemfontein', code: 'B', factor: 1 },
      { name: 'Johannesburg', code: 'J', factor: 2 },
      { name: 'King Williams town', code: 'KWT', factor: 3 },
      { name: 'Mpumalanga', code: 'M', factor: 4 },
      { name: 'Pretoria ', code: 'P', factor: 5 },
      { name: 'Cape town', code: 'CT', factor: 6 },
      { name: 'Kimberly', code: 'K', factor: 7 },
      { name: 'Limpopo', code: 'L', factor: 8 },
      { name: 'Pietermaritzburg', code: 'P', factor: 9 },
      { name: 'Umtata', code: 'U', factor: 10 },
      { name: 'Vryburg', code: 'V', factor: 11 },
      { name: 'HS', code: 'HS', factor: 12 },
      { name: 'HT', code: 'HT', factor: 13 }, 
      { name: 'IR', code: 'IR', factor: 14 },
      { name: 'IS', code: 'IS', factor: 15 },
      { name: 'IT', code: 'IT', factor: 16 },     
      { name: 'JS', code: 'JS', factor: 17 },
      { name: 'JT', code: 'JT', factor: 18 },
      { name: 'JU', code: 'JU', factor: 19 },
      { name: 'KT', code: 'VKT', factor: 20 },    
      
    ];

    this.ownershipCategories = [
      { name: 'State Owned', code: 'SO', factor: 1 },
      { name: 'Non State Owned', code: 'NSO', factor: 2 },
    ];
    this.classes = [
      { name: 'Urban', code: 'U', factor: 1 },
      { name: 'Rural', code: 'R', factor: 2 },
    ];
    
    this.types = this.sharedService.getAssetTypes();

    this.deedsOffices = [
      { name: 'Head Office', code: 'H', factor: 1 },
      { name: 'Bloemfontein', code: 'B', factor: 2 },
      { name: 'Cape Town', code: 'CT', factor: 3 },
      { name: 'Johannesburg', code: 'J', factor: 4 },
      { name: 'Kimberly', code: 'K', factor: 5 },
      { name: 'King Williams Town', code: 'K', factor: 6 },
      { name: 'Limpopo', code: 'B', factor: 2 },
      { name: 'Mpumalanga', code: 'CT', factor: 3 },
      { name: 'Pietermaritzburg', code: 'J', factor: 4 },
      { name: 'Pretoria', code: 'K', factor: 5 },
      { name: 'Umtata', code: 'K', factor: 6 },
      { name: 'Vryburg', code: 'K', factor: 6 },
    ];
    this.provinces = [
      { name: 'Mpumalanga', code: 'MP', factor: 1 },
      { name: 'Eastern Cape', code: 'EC', factor: 2 },
      { name: 'Free State', code: 'FS', factor:3 },
      { name: 'Gauteng', code: 'G', factor: 4 },
      { name: 'Kwazulu Natal', code: 'KZN', factor: 5},
      { name: 'Limpopo', code: 'L', factor: 6 },
      { name: 'Northern Cape', code: 'NC', factor: 7 },
      { name: 'North West', code: 'NW', factor: 8 },
      { name: 'Western Cape', code: 'WC', factor: 9 }
    ];

    this.districtMunicipalities = this.sharedService.getDistricts();

    this.landRemainders = [
      { name: 'Yes', code: 'Y', factor: 1 },
      { name: 'No', code: 'N', factor: 2 },
    ];

    this.aFSs = [
      { name: 'Yes', code: 'Y', factor: 1 },
      { name: 'No', code: 'N', factor: 2 },
    ];

    /*this.vestedTypes = [
      { name: 'Vested', code: 'V', factor: 1 },
      { name: 'Non-Vested', code: 'NV', factor: 2 },
      { name: 'Application submitted', code: 'AS', factor: 3 },
      { name: 'Certificate Issued ', code: 'CI', factor: 3 }           
    ];*/

    this.vats = [
      { name: 'Incl', code: 'I', factor: 1 },
      { name: 'Excl', code: 'E', factor: 2 },
    ];

    this.functionalPerformanceRatings = [
      { name: '1 - The asset standards exceeds the level expected for functional and operational requirements', code: '1', factor: 1 },
      { name: '2 - Functional Performance meets the standards expected for functional and operational requirements', code: '2', factor: 2 },
      { name: '3 -Functional Performance does not meet the standard expected for functional and operational requirements', code: '3', factor: 3 }
    ];

    this.howAcquireds = [
      { name: 'Purchased', code: 'P', factor: 1 },
      { name: 'Expropriated', code: 'E', factor: 2 },
      { name: 'Donation', code: 'D', factor: 3 },
      { name: 'Exchanged', code: 'EX', factor: 4 },
      { name: 'Revision', code: 'R', factor: 5 },
      { name: 'Repossession', code: 'RP', factor: 6 },
      { name: 'Prescription', code: 'PS', factor: 7 },
      { name: 'Lease Contract', code: 'LC', factor: 8 },
      { name: 'Inherited', code: 'I', factor: 9 },
      { name: 'Other', code: 'O', factor: 10 }
    ];
    this.regions = [
      { name: 'Ehlanzeni ', code: 'U', factor: 1 },
      { name: 'Gert Sibande', code: 'R', factor: 2 },
      { name: 'Nkangala', code: 'U', factor: 3 }
    ];

    this.conditionRatings = [
      { name: 'C1 (Excellent)', code: 'C1', factor: 1 },
      { name: 'C2 (Good)', code: 'C2', factor: 2 },
      { name: 'C3 (Fair)', code: 'C3', factor: 3 },
      { name: 'C4 (Poor)', code: 'C4', factor: 4 },
      { name: 'C5 (Very Poor)', code: 'C5', factor: 5 },
    ];

    this.facilityTypes = [
      { name: 'Dwelling', code: 'D', factor: 1 },
      { name: 'Vacant Land', code: 'VL', factor: 2 },
      { name: 'Non Residential', code: 'NR', factor: 3 },
    ];

    this.surveys = [
      {name: 'Surveyed', code: 's', factor: 1},
      {name: 'Non-Surveyed', code: 'ns', factor: 1}
    ]; 

    this.incomeLeaseStatuses = [
      { name: 'No', code: 'N', factor: 1 },
      { name: 'Yes', code: 'Y', factor: 2 }     
    ];

    this.natureOfLeases = [
      { name: 'Residential', code: 'R', factor: 1 },
      { name: 'Business', code: 'B', factor: 2 }
    ];
  }

  showToast(summary: string, detail: string) {
    if (summary === 'Saved') {
      this.toastService.showSuccess(detail);
      return;
    }
    this.toastService.showError(detail);
  }

  onOptionClick(e, f?){}

  initFacility() {
    this.improvements = this.facility.improvements || [];
    this.updatePagedImprovements();
    if (this.facility.land == undefined) {
      this.facility.land = { id: 0 }
    }
    if (this.facility.land.geographicalLocation == undefined) {
      this.facility.land.geographicalLocation = { id: 0 }
    }

    if (this.facility.land.propertyDescription == undefined) {
      this.facility.land.propertyDescription = { id: 0 }
    }

    if (this.facility.land.landUseManagementDetail == undefined) {
      this.facility.land.landUseManagementDetail = { id: 0 }
    }
    if (this.facility.land.leaseStatus == undefined) {
      this.facility.land.leaseStatus = { id: 0 }
    }

    if (this.facility.finance == undefined) {
      this.facility.finance = { id: 0 }
    }
    if (this.facility.finance.secondaryInformationNote == undefined) {
      this.facility.finance.secondaryInformationNote = { id: 0 }
    }
    if (this.facility.finance.valuation == undefined) {
      this.facility.finance.valuation = { id: 0 }
    }

    const deedsOffice = this.findOption(this.deedsOffices, this.facility.land.deedsOffice);
    const type = this.findOption(this.types, this.facility.land.type);
    const assetClass = this.findOption(this.classes, this.facility.land.class);
    const province = this.findOption(this.provinces, this.facility.land.geographicalLocation.province);
    const districtMunicipality = this.findOption(this.districtMunicipalities, this.facility.land.geographicalLocation.districtMunicipality);
    const afs = this.findOption(this.aFSs, this.facility.afs);
    //let vestedType = this.vestedTypes.filter(d => d.name.toLowerCase().trim() == (this.facility.vestedType != undefined ? this.facility.vestedType.toLowerCase().trim() : this.facility.vestedType))[0];
    const facilityType = this.findOption(this.facilityTypes, this.facility.type);
    const region = this.findOption(this.regions, this.facility.land.region);
    const registrationDivision = this.findOption(this.registrationDivisions, this.facility.land.propertyDescription.registrationDivision);
    const landRemainder = this.landRemainders.find(item =>
      item.name === (this.facility.land.propertyDescription.landRemainder === false ? 'No' : 'Yes')
    );
    const acquired = this.findOption(this.howAcquireds, this.facility.land.propertyDescription.acquired);
    const ownershipCategory = this.findOption(this.ownershipCategories, this.facility.land.landUseManagementDetail.ownershipCategory);
    const departments = String(this.facility.land.landUseManagementDetail.userDepartment ?? '')
      .split(',')
      .map(name => this.findOption(this.userDepartments, name.trim()))
      .filter(Boolean);
    const incomeLeaseStatus = this.findOption(this.incomeLeaseStatuses, this.facility.land.landUseManagementDetail.incomeLeaseStatus);
    const natureOfLease = this.findOption(this.natureOfLeases, this.facility.land.leaseStatus.natureOfLease);
    const vat = this.vats.find(item => item.name === this.facility.land.leaseStatus.vat);
    let _districtMunicipality = {
      value: districtMunicipality
    };
    this.setDistrictMunicipality(_districtMunicipality);
    const localAuthority = this.findOption(this.localAuthorities, this.facility.land.geographicalLocation.localAuthority);
    
    const magisterialDistrict = this.findOption(this.magisterialDistricts, this.facility.land.geographicalLocation.magisterialDistrict);

    let survey = this.findOption(this.surveys, this.facility.survey);
    
    if(this.facility.land.propertyDescription.sgDiagramNumber){
      survey = this.surveys[0];
    }
    this.landForm = this.formBuilder.group({
      survey:[survey],
      facilityType:[facilityType, Validators.required],
      clientCode:[this.facility.clientCode, Validators.required],
      deedsOffice: [deedsOffice],
      class: [assetClass],
      afs: [afs],
      //vestedType: [vestedType],
      type: [type],
      province: [province],
      town: [this.facility.land.geographicalLocation.town],
      suburb: [this.facility.land.geographicalLocation.suburb],
      streetName: [this.facility.land.geographicalLocation.streetName],
      streetNumber: [this.facility.land.geographicalLocation.streetNumber, Validators.min(0)],
      districtMunicipality: [districtMunicipality],
      region: [region],
      localAuthority: [localAuthority],
      latitude: [this.facility.land.geographicalLocation.latitude],
      longitude: [this.facility.land.geographicalLocation.longitude],
      magisterialDistrict: [magisterialDistrict],
      registrationDivision: [registrationDivision],
      townshipName: [this.facility.land.propertyDescription.townshipName],
      landParcel: [this.facility.land.propertyDescription.landParcel],
      landPortion: [this.facility.land.propertyDescription.landPortion],
      oldDescription: [this.facility.land.propertyDescription.oldDescription],
      landRemainder: [landRemainder],
      farmName: [this.facility.land.propertyDescription.farmName],
      SGDiagramNumber: [this.facility.land.propertyDescription.sgDiagramNumber],
      extent: [this.facility.land.propertyDescription.extent, Validators.min(0)],
      LPICode: [this.facility.land.propertyDescription.lPICode],
      acquired: [acquired],
      acquiredOther: [this.facility.land.propertyDescription.acquiredOther],
      titleDeedNumber: [this.facility.land.landUseManagementDetail.titleDeedNumber],
      registrationDate: [this.facility.land.landUseManagementDetail.registrationDate != undefined ? new Date(this.facility.land.landUseManagementDetail.registrationDate) : new Date()],
      registeredOwner: [this.facility.land.landUseManagementDetail.registeredOwner],
      vestingDate: [this.facility.land.landUseManagementDetail.vestingDate != undefined ? new Date(this.facility.land.landUseManagementDetail.vestingDate) : new Date()],
      //conditionsOfTitle: [this.facility.land.landUseManagementDetail.conditionsOfTitle],
      ownershipCategory: [ownershipCategory],
      stateOwnedPercentage: [this.facility.land.landUseManagementDetail.stateOwnedPercentage, Validators.min(0)],
      landUse: [this.facility.land.landUseManagementDetail.landUse],
      zoning: [this.facility.land.landUseManagementDetail.zoning],
      userDepartment: [departments],
      facilityName: [this.facility.land.landUseManagementDetail.facilityName, Validators.required],
      incomeLeaseStatus: [incomeLeaseStatus],
      leaseNumber: [this.facility.land.leaseStatus.leaseNumber],
      otherCharges: [this.facility.land.leaseStatus.otherCharges],
      rentalAmount: [this.facility.land.leaseStatus.rentalAmount],
      terminationDate: [this.facility.land.leaseStatus.terminationDate != undefined ? new Date(this.facility.land.leaseStatus.terminationDate) : new Date()],
      startingDate: [this.facility.land.leaseStatus.startingDate != undefined ? new Date(this.facility.land.leaseStatus.startingDate) : new Date()],
      occupationDate: [this.facility.land.leaseStatus.occupationDate != undefined ? new Date(this.facility.land.leaseStatus.occupationDate) : new Date()],
      escalation: [this.facility.land.leaseStatus.escalation],
      contactNumber: [this.facility.land.leaseStatus.contactNumber],
      capacityofContactPerson: [this.facility.land.leaseStatus.capacityofContactPerson],
      contactPerson: [this.facility.land.leaseStatus.contactPerson],
      postalCode: [this.facility.land.leaseStatus.postalCode],
      leaseStatusTown: [this.facility.land.leaseStatus.leaseStatusTown],
      POBox: [this.facility.land.leaseStatus.pOBox],
      IDNumberCompanyRegistrationNumber: [this.facility.land.leaseStatus.IDNumberCompanyRegistrationNumber],
      natureOfLease: [natureOfLease],
      vat: [vat],
    });
    this.improvementForm = this.formBuilder.group({
      buildingName: ['', Validators.required],
      type: ['', Validators.required],
      size: ['', [Validators.required, Validators.min(0)]],
      potentialUse: ['', [Validators.required]],
      siteCoverag: ['', [Validators.required, Validators.min(0)]],
      levelofUtilization: ['', [Validators.required]],
      extentofBuilding: ['', [Validators.required, Validators.min(0)]],
      conditionRating: ['', [Validators.required]],
      usableArea: ['', [Validators.required, Validators.min(0)]],
      functionalPerformanceRating: ['', [Validators.required]],
      comment: ['', [Validators.required]],
    });
    this.financialForm = this.formBuilder.group({
      landUseClass: [this.facility.finance.landUseClass],
      natureofAsset: [this.facility.finance.natureofAsset],
      afs: [this.facility.finance.afs],
      additionCash: [this.facility.finance.secondaryInformationNote.additionCash],
      additionNonCash: [this.facility.finance.secondaryInformationNote.additionNonCash],
      addition: [this.facility.finance.secondaryInformationNote.addition],
      disposal: [this.facility.finance.secondaryInformationNote.disposal],
      openingBalance: [this.facility.finance.secondaryInformationNote.openingBalance],
      closingBalance: [this.facility.finance.secondaryInformationNote.closingBalance],
      municipalValuationDate: [this.facility.finance.valuation.municipalValuationDate != undefined ? new Date(this.facility.finance.valuation.municipalValuationDate) : new Date()],
      nonMunicipalValuationDate: [this.facility.finance.valuation.nonMunicipalValuationDate != undefined ? new Date(this.facility.finance.valuation.nonMunicipalValuationDate) : new Date()],
      municipalValuation: [this.facility.finance.valuation.municipalValuation],
      nonMunicipalValuation: [this.facility.finance.valuation.nonMunicipalValuation],
      propetyRatesAccount: [this.facility.finance.valuation.propetyRatesAccount],
      value: [this.facility.finance.valuation.value],
      accountNoForService: [this.facility.finance.valuation.accountNoForService],
      personInstitutionResposible: [this.facility.finance.valuation.personInstitutionResposible],
    });
  }

  navigate(url){
    this.router.navigate([url]);
  }

  confirmDelete() {
    const index = this.improvements.indexOf(this.selectedImprovement);
    if (index >= 0) {
      this.improvements.splice(index, 1);
      this.updatePagedImprovements();
    }
  }

  improvementValue(row: any, field: string): string {
    return String(row[field] ?? '');
  }

  updatePagedImprovements() {
    const filter = this.improvementFilter.trim().toLowerCase();
    let rows = this.improvements.filter(row =>
      !filter || this.improvementCols.some(column =>
        this.improvementValue(row, column.field).toLowerCase().includes(filter)
      )
    );
    if (this.improvementSortField) {
      const field = this.improvementSortField;
      rows = rows.sort((left, right) => {
        const result = this.improvementValue(left, field).localeCompare(
          this.improvementValue(right, field),
          undefined,
          { numeric: true, sensitivity: 'base' }
        );
        return this.improvementSortAscending ? result : -result;
      });
    }
    this.improvementCount = rows.length;
    const lastPage = Math.max(0, Math.ceil(rows.length / this.improvementPageSize) - 1);
    this.improvementPageIndex = Math.min(this.improvementPageIndex, lastPage);
    const start = this.improvementPageIndex * this.improvementPageSize;
    this.pagedImprovements = rows.slice(start, start + this.improvementPageSize);
  }

  filterImprovements(value: string) {
    this.improvementFilter = value;
    this.improvementPageIndex = 0;
    this.updatePagedImprovements();
  }

  sortImprovements(field: string) {
    if (this.improvementSortField === field) {
      this.improvementSortAscending = !this.improvementSortAscending;
    } else {
      this.improvementSortField = field;
      this.improvementSortAscending = true;
    }
    this.updatePagedImprovements();
  }

  pageImprovements(event: PageEvent) {
    this.improvementPageIndex = event.pageIndex;
    this.improvementPageSize = event.pageSize;
    this.updatePagedImprovements();
  }

  editImprovement() {
    this.improvementForm = this.formBuilder.group({
      buildingName: [this.selectedImprovement.buildingName, Validators.required],
      typeOfImprovement: [this.selectedImprovement.typeOfImprovement, Validators.required],
      sizeofImprovement: [this.selectedImprovement.sizeofImprovement, [Validators.required, Validators.min(0)]],
      potentialUse: [this.selectedImprovement.potentialUse, [Validators.required]],
      town: [this.selectedImprovement.town, [Validators.required]],
      suburb: [this.selectedImprovement.suburb, [Validators.required]],
      streetName: [this.selectedImprovement.streetName, [Validators.required]],
      streetNumber: [this.selectedImprovement.streetNumber, [Validators.required, Validators.min(0)]],
      siteCoverag: [this.selectedImprovement.siteCoverag, [Validators.required, Validators.min(0)]],
      functionalPerformanceRating: [this.selectedImprovement.functionalPerformanceRating, [Validators.required]],
      extentofBuilding: [this.selectedImprovement.extentofBuilding, [Validators.required, Validators.min(0)]],
      conditionRating: [this.selectedImprovement.conditionRating, [Validators.required]],
      usableArea: [this.selectedImprovement.usableArea, [Validators.required, Validators.min(0)]],
      comment: [this.selectedImprovement.comment, [Validators.required]],
    });
  }

  selectImprovement(improvement) {
    this.selectedImprovement = improvement;
  }

  validateTitleDeed(e){
    this.titleDeedIsInvalid = false;
    const titleDeeed = this.landForm.controls["titleDeedNumber"].value;
    var firstNumbers = titleDeeed.substring(1, 5);
    var specialCharacter = titleDeeed.substring(5, 6);
    var lastNumbers = titleDeeed.substring(6, 10);
    const firstLetter = titleDeeed.substring(0, 1).charAt(0);
    if(!firstLetter.match(/[a-z]/i))
    {
      this.titleDeedIsInvalid = true;
    }
    if(lastNumbers.length != 4 || !Number.isFinite(Number(lastNumbers)))
      this.titleDeedIsInvalid = true;
   
    if(specialCharacter != '/')
      this.titleDeedIsInvalid = true;

    if(firstNumbers.length != 4 || !Number.isFinite(Number(firstNumbers)))
      this.titleDeedIsInvalid = true;
  }

  AddImprovement() {
    //if (this.improvementForm.valid) {
      let improvement = {
        id: 0,
        buildingName: this.improvementForm.controls["buildingName"].value,
        type: this.improvementForm.controls["type"].value != undefined ? this.improvementForm.controls["type"].value.name : null,
        size: this.improvementForm.controls["size"].value,
        potentialUse: this.improvementForm.controls["potentialUse"].value != undefined ? this.improvementForm.controls["potentialUse"].value.name : null,
        siteCoverag: this.improvementForm.controls["siteCoverag"].value != "" ? this.improvementForm.controls["siteCoverag"].value.toString() : null,
        levelofUtilization: this.improvementForm.controls["levelofUtilization"].value != "" ? this.improvementForm.controls["levelofUtilization"].value.toString() : null,
        extentofBuilding: this.improvementForm.controls["extentofBuilding"].value != "" ? this.improvementForm.controls["extentofBuilding"].value.toString() : null,
        conditionRating: this.improvementForm.controls["conditionRating"].value != undefined ? this.improvementForm.controls["conditionRating"].value.name: null,
        usableArea: this.improvementForm.controls["usableArea"].value != "" ? this.improvementForm.controls["usableArea"].value.toString() : null,
        functionalPerformanceRating: this.improvementForm.controls["functionalPerformanceRating"].value != undefined ? this.improvementForm.controls["functionalPerformanceRating"].value.name : null,
        comment: this.improvementForm.controls["comment"].value,
      };
      this.improvements.push(improvement);
      this.updatePagedImprovements();
   // }
  }

  makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  onLandSelectFile(files: FileList | File[]) {
    this.addSelectedFiles(this.uploadedLandFiles, files);
  }

  onFinanceSelectFile(files: FileList | File[]) {
    this.addSelectedFiles(this.uploadedFinanceFiles, files);
  }

  onImprovementSelectFile(files: FileList | File[]) {
    this.addSelectedFiles(this.uploadedImprovementFiles, files);
  }

  private addSelectedFiles(target: File[], selection: FileList | File[] | null): void {
    this.fileSelectionError = '';
    const selected = Array.from(selection ?? []);
    const additions = selected.filter(file => !target.some(existing =>
      existing.name === file.name &&
      existing.size === file.size &&
      existing.lastModified === file.lastModified
    ));
    if (additions.length !== selected.length) {
      this.fileSelectionError = 'Duplicate files were skipped.';
    }
    target.push(...additions);
  }

  onLandRemoveFile(file: File) {
    const fileIndex = this.uploadedLandFiles.indexOf(file);
    if (fileIndex >= 0) this.uploadedLandFiles.splice(fileIndex, 1);
  }

  onFinanceRemoveFile(file: File) {
    const fileIndex = this.uploadedFinanceFiles.indexOf(file);
    if (fileIndex >= 0) this.uploadedFinanceFiles.splice(fileIndex, 1);
  }

  onImprovementRemoveFile(file: File) {
    const fileIndex = this.uploadedImprovementFiles.indexOf(file);
    if (fileIndex >= 0) this.uploadedImprovementFiles.splice(fileIndex, 1);
  }

  setFacilityType(e){
    this.facility.type = e.value.name;
  }

  goToLink(url){
    window.open(url, "_blank");
  }

  getFiles(fileReference:string){    
    if (!fileReference) {
      this.filesAreLoaded = true;
      this.filesLoading = false;
      return;
    }
    this.filesLoading = true;
    this.filesError = false;
    this.facilityService.getFiles(fileReference).pipe(first()).subscribe({
      next: files => {
        this.landFiles = [];
        this.financeFiles = [];
        this.improvementFiles = [];
        (files ?? []).forEach((filePath, index) => {
          const path = String(filePath);
          const name = path.split(/[\\/]/).pop();
          if (!name) {
            return;
          }
          const file = { url: `/Uploads/Facilities/${encodeURIComponent(name)}`, name };
          if (path.includes('Land')) {
            this.landFiles.push({ ...file, name: `Land${fileReference}_${index}` });
          }
          if (path.includes('Finance')) {
            this.financeFiles.push({ ...file, name: `Finance${fileReference}_${index}` });
          }
          if (path.includes('Improvement')) {
            this.improvementFiles.push({ ...file, name: `Improvement${fileReference}_${index}` });
          }
        });
        this.filesLoading = false;
        this.filesAreLoaded = true;
      },
      error: () => {
        this.filesLoading = false;
        this.filesError = true;
        this.filesAreLoaded = false;
        this.toastService.showError('Unable to load supporting documents. Please try again.');
      }
    });
  }

}
