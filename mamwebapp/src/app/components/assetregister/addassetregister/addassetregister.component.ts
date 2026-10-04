import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/internal/operators/first';
import { Facility } from 'src/app/models/facility.model';
import { FacilityService } from 'src/app/services/facility/facility.service';
import { ConfirmationService } from 'primeng/api';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-addassetregister',
  templateUrl: './addassetregister.component.html',
  styleUrls: ['./addassetregister.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService, ConfirmationService]
})

export class AddassetregisterComponent implements OnInit {
  @Output() newAsset = new EventEmitter<any>();
  @Input() selectedAsset: any;
  steps: MenuItem[];
  improvements = [];
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
  error = '';
  today = new Date();
  subscription: Subscription;
  activeItem: MenuItem;
  loading = true;
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
  buttonItems: MenuItem[];
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
  constructor(private router: Router,private sharedService: SharedService, private authenticationService: AuthenticationService, private confirmationService: ConfirmationService, public facilityService: FacilityService, private formBuilder: FormBuilder, private messageService: MessageService) { }

  ngOnInit() {
    this.buildForm();
    this.authenticationService.currentUser.pipe().subscribe(x => {
      this.currentUser = x;
    });

    if (this.selectedAsset.facilityId != undefined) {      
      this.mode = this.selectedAsset.mode;      
      if (this.mode == "Edit" || this.mode == "View") {
        this.loading = false;
        this.facility = this.selectedAsset.facility;
        this.getFiles(this.selectedAsset.facility.fileReference);
        this.initFacility();
      } else {
        this.facilityService.getFacilityById(this.selectedAsset.facilityId, this.selectedAsset.facilityType).pipe(first()).subscribe(facility => {
          this.loading = false;
          this.getFiles(facility.fileReference);
          this.facility = facility;
          this.initFacility();
        });
      }

    } else {
      this.facility = {
        id: 0,
        name: 'Land T0IS00000000000700020',
        fileReference: undefined,
        type: undefined,
        clientCode: 'T0IS00000000000700020',
        userId: this.currentUser.id,
        status: "New",
        capturerId: this.currentUser.id,
        createdDate: new Date(),
        modifierId: this.currentUser.id,
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
      this.buildForm();
      this.mode = this.selectedAsset.mode;
      this.loading = false;
    }   
    if(this.currentUser.roleId == 1 || this.currentUser.roleId == 5 || this.currentUser.roleId == 4)
    {
        this.mode == 'View';
    }else{
      this.isViewOnly = this.mode == 'View' ? true :  false;
    }
  }

  get l() { return this.landForm.controls; }
  get f() { return this.financialForm.controls; }
  get I() { return this.improvementForm.controls; }

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
    //this.financeIsSubmitted = true;
    //if (this.financialForm.valid) {
      this.assignFacility(false, true, false);
      this.facility.status = 'Saved';
      this.facilityService.saveFacility(this.facility, "finance").pipe(first()).subscribe(isSaved => {
        if (isSaved) {
          this.savingLand = false;
          if(this.uploadedLandFiles.length > 0)
          this.uploadLandFiles();
        if(this.uploadedFinanceFiles.length > 0)
          this.uploadFinanceFiles();
        if(this.uploadedImprovementFiles.length > 0)
          this.uploadImprovementFiles();
          this.messageService.add({ severity: 'success', summary: 'Saving', detail: 'Financial records are saved successful.' });
        }
        else {
          this.savingLand = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while saving!' });
        }
      });
    //}
  }

  onImprovementFormSubmit() {
    //this.improvementIsSubmitted = true;
    //if (this.landForm.valid) {
      this.assignFacility(false, false, true);
      this.facility.status = 'Saved';
      this.facilityService.saveFacility(this.facility, "improvement").pipe(first()).subscribe(isSaved => {
        if (isSaved) {
          if(this.uploadedLandFiles.length > 0)
            this.uploadLandFiles();
          if(this.uploadedFinanceFiles.length > 0)
            this.uploadFinanceFiles();
          if(this.uploadedImprovementFiles.length > 0)
            this.uploadImprovementFiles();
          this.savingLand = false;
          this.messageService.add({ severity: 'success', summary: 'Saving', detail: 'Improvement records are saved successful.' });
        }
        else {
          this.savingLand = false;
          this.messageService.add({ severity: 'error', summary: 'Error Occurred', detail: 'An error occurred while processing your request. please try again!' });
        }
      });
   // }
  }



  onLandFormSubmit() {
    //this.landIsSubmitted = true;
    //if (this.landForm.valid) {    
      this.assignFacility(true, false, false);
      this.facility.status = 'Saved';
      this.facilityService.saveFacility(this.facility, "land").pipe(first()).subscribe(facility => {
        if (facility) {
          this.savingLand = false;
          if(this.uploadedLandFiles.length > 0)
            this.uploadLandFiles();
          if(this.uploadedFinanceFiles.length > 0)
            this.uploadFinanceFiles();
          if(this.uploadedImprovementFiles.length > 0)
            this.uploadImprovementFiles();
          this.facility = facility;
          this.messageService.add({ severity: 'success', summary: 'Saving', detail: 'Land records are saved successful.' });
        }
        else {
          this.savingLand = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while saving!' });
        }
      });

   // }
  }

  onSubmit() {
    this.errorMsg = '';
    this.isSubmitted = true;
    if (this.landForm.invalid && this.improvementForm.invalid && this.financialForm.invalid) {
      this.errorMsg = "Please capture all required information"
      return;
    }
    this.assignFacility(true, true, true);
    this.facility.status = 'SignedOff';
    this.facility.modifierId = this.currentUser.id;
    this.facility.modifiedDate = new Date();
    this.facilityService.saveFacility(this.facility, "facility").pipe(first()).subscribe(isSaved => {
      if (isSaved) {
        if(this.uploadedLandFiles.length > 0)
        this.uploadLandFiles();
      if(this.uploadedFinanceFiles.length > 0)
        this.uploadFinanceFiles();
      if(this.uploadedImprovementFiles.length > 0)
        this.uploadImprovementFiles();
        this.newAsset.emit({ mode: "Add", data: this.facility, response: "isAddedSuccessful" });
        this.savingLand = false;
        this.messageService.add({ severity: 'warn', summary: 'Deleted', detail: 'Asset is added successful.' });
      }
      else {
        this.savingLand = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while adding an asset.' });
      }
    });

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
      facilityType:[''],
      clientCode:[''],
      deedsOffice: [''],
      class: [''],     
      //vestedType: [''],
      type: [''],
      province: [''],
      town: [''],
      suburb: [''],
      streetName: [''],
      streetNumber: [''],
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
      extent: [''],
      LPICode: [''],
      acquired: [''],
      acquiredOther: [''],
      titleDeedNumber: [''],
      registrationDate: [this.today],
      registeredOwner: [''],
      vestingDate: [''],
      //conditionsOfTitle: [''],
      ownershipCategory: [''],
      stateOwnedPercentage: [''],
      landUse: [''],
      zoning: [''],
      userDepartment: [''],
      facilityName: [''],
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
      size: ['', [Validators.required]],
      potentialUse: ['', [Validators.required]],
      siteCoverag: ['', [Validators.required]],
      levelofUtilization: ['', [Validators.required]],
      extentofBuilding: ['', [Validators.required]],
      conditionRating: ['', [Validators.required]],
      usableArea: ['', [Validators.required]],
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

    this.buttonItems = [     
      {
        label: 'Update', icon: 'pi pi-pencil', command: () =>
          this.editImprovement()
      },
      { separator: true },
      {
        label: 'Delete', icon: 'pi pi-trash', command: () =>
          this.confirmDelete()
      }
    ];
    this.steps = [
      { label: 'Land', icon: 'pi pi-fw pi-globe' },
      { label: 'Finane', icon: 'pi pi-fw pi-money-bill' },
      { label: 'Impronements', icon: 'pi pi-fw pi-home' }
    ];

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

    this.activeItem = this.steps[0];

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
    this.messageService.add({ severity: 'success', summary: summary, detail: detail });
  }

  onOptionClick(e, f?){}

  initFacility() {
    this.improvements = this.facility.improvements;
    if (this.facility.land == undefined) {
      this.facility.land = { id: 0 }
    }
    if (this.facility.land.geographicalLocation == undefined) {
      this.facility.land.geographicalLocation = { id: 0 }
    }

    if (this.facility.land.geographicalLocation == undefined) {
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

    let deedsOffice = this.deedsOffices.filter(d => d.name.toLowerCase().trim() == (this.facility.land.deedsOffice != undefined ? this.facility.land.deedsOffice.toLowerCase().trim() : this.facility.land.deedsOffice))[0];
    let type = this.types.filter(d => d.name.toLowerCase().trim() == (this.facility.land.type != undefined ? this.facility.land.type.toLowerCase().trim() : this.facility.land.type))[0];
    let assetClass = this.classes.filter(d => d.name.toLowerCase().trim() == (this.facility.land.class != undefined ? this.facility.land.class.toLowerCase().trim() : this.facility.land.class))[0];
    let province = this.provinces.filter(d => d.name.toLowerCase().trim() == (this.facility.land.geographicalLocation.province != undefined ? this.facility.land.geographicalLocation.province.toLowerCase().trim() : this.facility.land.geographicalLocation.province))[0];
    let districtMunicipality = this.districtMunicipalities.filter(d => d.name.toLowerCase().trim() == (this.facility.land.geographicalLocation.districtMunicipality != undefined ? this.facility.land.geographicalLocation.districtMunicipality.toLowerCase().trim() : this.facility.land.geographicalLocation.districtMunicipality))[0];

    let afs = this.aFSs.filter(d => d.name.trim() == (this.facility.afs != undefined ? this.facility.afs.trim() : this.facility.afs))[0];
    //let vestedType = this.vestedTypes.filter(d => d.name.toLowerCase().trim() == (this.facility.vestedType != undefined ? this.facility.vestedType.toLowerCase().trim() : this.facility.vestedType))[0];
    let facilityType = this.facilityTypes.filter(d => d.name.toLowerCase().trim() == (this.facility.type != undefined ? this.facility.type.toLowerCase().trim() : this.facility.type))[0];

    let region = this.regions.filter(d => d.name.toLowerCase().trim() == (this.facility.land.region != undefined ? this.facility.land.region.toLowerCase().trim() : this.facility.land.region))[0];
    let registrationDivision = this.registrationDivisions.filter(d => d.name.toLowerCase().trim() == (this.facility.land.propertyDescription.registrationDivision != undefined ? this.facility.land.propertyDescription.registrationDivision.toLowerCase().trim() : this.facility.land.propertyDescription.registrationDivision))[0];
    let landRemainder = this.landRemainders.filter(d => d.name == (this.facility.land.propertyDescription.landRemainder == false ? 'No' : 'Yes'))[0];
    let acquired = this.howAcquireds.filter(d => d.name.toLowerCase().trim() == (this.facility.land.propertyDescription.acquired != undefined ? this.facility.land.propertyDescription.acquired.toLowerCase().trim() : this.facility.land.propertyDescription.acquired))[0];
    let ownershipCategory = this.ownershipCategories.filter(d => d.name.toLowerCase().trim() == (this.facility.land.landUseManagementDetail.ownershipCategory != undefined ? this.facility.land.landUseManagementDetail.ownershipCategory.toLowerCase().trim() : this.facility.land.landUseManagementDetail.ownershipCategory))[0];
    let userDepartment = this.userDepartments.filter(d => d.name.toLowerCase().trim() == (this.facility.land.landUseManagementDetail.userDepartment != undefined ? this.facility.land.landUseManagementDetail.userDepartment.toLowerCase().trim() : this.facility.land.landUseManagementDetail.userDepartment));
    let incomeLeaseStatus = this.incomeLeaseStatuses.filter(d => d.name.toLowerCase().trim() == (this.facility.land.landUseManagementDetail.incomeLeaseStatus != undefined ? this.facility.land.landUseManagementDetail.incomeLeaseStatus.toLowerCase().trim() : this.facility.land.landUseManagementDetail.incomeLeaseStatus))[0];
    let natureOfLease = this.natureOfLeases.filter(d => d.name.toLowerCase().trim() == (this.facility.land.leaseStatus.natureOfLease != undefined ? this.facility.land.leaseStatus.natureOfLease.toLowerCase().trim() : this.facility.land.leaseStatus.natureOfLease))[0];
    let vat = this.vats.filter(d => d.name == this.facility.land.leaseStatus.vat)[0];
    let _districtMunicipality = {
      value: districtMunicipality
    };
    this.setDistrictMunicipality(_districtMunicipality);
    let localAuthority = this.localAuthorities.filter(d => d.name.toLowerCase().trim() == (_districtMunicipality.value != undefined ? this.facility.land.geographicalLocation.localAuthority.toLowerCase().trim()  : this.facility.land.geographicalLocation.localAuthority))[0];
    
    let magisterialDistrict = this.magisterialDistricts.filter(d => d.name.toLowerCase().trim() == (_districtMunicipality.value != undefined ? this.facility.land.geographicalLocation.magisterialDistrict.toLowerCase().trim()  : this.facility.land.geographicalLocation.magisterialDistrict))[0];

    let survey = this.surveys.filter(d => d.name.toLowerCase().trim() == (this.facility.survey != undefined ? this.facility.survey.toLowerCase().trim() : this.facility.survey))[0];
    
    if(this.facility.land.propertyDescription.sgDiagramNumber){
      survey = this.surveys[0];
    }
    this.landForm = this.formBuilder.group({
      survey:[survey],
      facilityType:[facilityType],
      clientCode:[this.facility.clientCode],
      deedsOffice: [deedsOffice],
      class: [assetClass],
      afs: [afs],
      //vestedType: [vestedType],
      type: [type],
      province: [province],
      town: [this.facility.land.geographicalLocation.town],
      suburb: [this.facility.land.geographicalLocation.suburb],
      streetName: [this.facility.land.geographicalLocation.streetName],
      streetNumber: [this.facility.land.geographicalLocation.streetNumber],
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
      extent: [this.facility.land.propertyDescription.extent],
      LPICode: [this.facility.land.propertyDescription.lPICode],
      acquired: [acquired],
      acquiredOther: [this.facility.land.propertyDescription.acquiredOther],
      titleDeedNumber: [this.facility.land.landUseManagementDetail.titleDeedNumber],
      registrationDate: [this.facility.land.landUseManagementDetail.registrationDate != undefined ? new Date(this.facility.land.landUseManagementDetail.registrationDate) : new Date()],
      registeredOwner: [this.facility.land.landUseManagementDetail.registeredOwner],
      vestingDate: [this.facility.land.landUseManagementDetail.vestingDate != undefined ? new Date(this.facility.land.landUseManagementDetail.vestingDate) : new Date()],
      //conditionsOfTitle: [this.facility.land.landUseManagementDetail.conditionsOfTitle],
      ownershipCategory: [ownershipCategory],
      stateOwnedPercentage: [this.facility.land.landUseManagementDetail.stateOwnedPercentage],
      landUse: [this.facility.land.landUseManagementDetail.landUse],
      zoning: [this.facility.land.landUseManagementDetail.zoning],
      userDepartment: [userDepartment],
      facilityName: [this.facility.land.landUseManagementDetail.facilityName],
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
      size: ['', [Validators.required]],
      potentialUse: ['', [Validators.required]],
      siteCoverag: ['', [Validators.required]],
      levelofUtilization: ['', [Validators.required]],
      extentofBuilding: ['', [Validators.required]],
      conditionRating: ['', [Validators.required]],
      usableArea: ['', [Validators.required]],
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
    this.improvements.splice(this.selectedImprovement);
  }

  editImprovement() {
    this.improvementForm = this.formBuilder.group({
      buildingName: [this.selectedImprovement.buildingName, Validators.required],
      typeOfImprovement: [this.selectedImprovement.typeOfImprovement, Validators.required],
      sizeofImprovement: [this.selectedImprovement.sizeofImprovement, [Validators.required]],
      potentialUse: [this.selectedImprovement.potentialUse, [Validators.required]],
      town: [this.selectedImprovement.town, [Validators.required]],
      suburb: [this.selectedImprovement.suburb, [Validators.required]],
      streetName: [this.selectedImprovement.streetName, [Validators.required]],
      streetNumber: [this.selectedImprovement.streetNumber, [Validators.required]],
      siteCoverag: [this.selectedImprovement.siteCoverag, [Validators.required]],
      functionalPerformanceRating: [this.selectedImprovement.functionalPerformanceRating, [Validators.required]],
      extentofBuilding: [this.selectedImprovement.extentofBuilding, [Validators.required]],
      conditionRating: [this.selectedImprovement.conditionRating, [Validators.required]],
      usableArea: [this.selectedImprovement.usableArea, [Validators.required]],
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

  onLandSelectFile(evt: any) {
    let uploadedFile = evt[0];
    this.uploadedLandFiles.push(uploadedFile);    
  }

  onFinanceSelectFile(evt: any) {
    let uploadedFile = evt[0];
    this.uploadedFinanceFiles.push(uploadedFile);    
  }

  onImprovementSelectFile(evt: any) {
    let uploadedFile = evt[0];
    this.uploadedImprovementFiles.push(uploadedFile);    
  }

  onLandRemoveFile(evt: any){
    var fileIndex = this.uploadedLandFiles.indexOf(evt.file)
    this.uploadedLandFiles.slice(-1, fileIndex);
  }

  onFinanceRemoveFile(evt: any){
    var fileIndex = this.uploadedFinanceFiles.indexOf(evt.file)
    this.uploadedFinanceFiles.slice(-1, fileIndex);
  }

  onImprovementRemoveFile(evt: any){
    var fileIndex = this.uploadedImprovementFiles.indexOf(evt.file)
    this.uploadedImprovementFiles.slice(-1, fileIndex);
  }

  uploadLandFiles(){    
    this.facilityService.uploadFiles(this.uploadedLandFiles, 'Land'+ this.facility.fileReference).pipe(first()).subscribe(uploaded => {    
    });
  }

  uploadImprovementFiles(){    
    this.facilityService.uploadFiles(this.uploadedImprovementFiles, 'Improvement'+ this.facility.fileReference).pipe(first()).subscribe(uploaded => {    
    });
  }

  uploadFinanceFiles(){    
    this.facilityService.uploadFiles(this.uploadedFinanceFiles, 'Finance'+ this.facility.fileReference).pipe(first()).subscribe(uploaded => {    
    });
  }

  setFacilityType(e){
    this.facility.type = e.value.name;
  }

  goToLink(url){
    window.open(url, "_blank");
  }

  getFiles(fileReference:string){    
    this.facilityService.getFiles(fileReference).pipe(first()).subscribe(files => {
     
      for (let i = 0; i < files.length ; i++) {
        if(files[i].toString().includes('Land'))
        {
          let name = files[i].split('\\').pop();
          let url = "https://amethysthemisphere.dedicated.co.za:81/Uploads/Facilities/"+ name;
          this.landFiles.push({url: url, name: 'Land'+fileReference+'_'+i});
        } 
        if(files[i].toString().includes('Finance'))
        {
          let name = files[i].split('\\').pop();
          let url = "https://amethysthemisphere.dedicated.co.za:81/Uploads/Facilities/"+ name;
          this.financeFiles.push({url: url, name: 'Finance'+fileReference+'_'+i});
        } 
        if(files[i].toString().includes('Improvement'))
        {
          let name = files[i].split('\\').pop();
          let url = "https://amethysthemisphere.dedicated.co.za:81/Uploads/Facilities/"+ name;
          this.improvementFiles.push({url: url, name: 'Improvement'+fileReference+'_'+i});
        }       
      };
      this.filesAreLoaded = true;
    });
  }

}
