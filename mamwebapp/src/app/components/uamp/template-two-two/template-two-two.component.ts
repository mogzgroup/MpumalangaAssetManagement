import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Facility } from 'src/app/models/facility.model';
import { Property } from 'src/app/models/property.model';
import { UAMP } from 'src/app/models/uamp.model';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { SharedService } from 'src/app/services/shared.service';
import { User } from 'src/app/models/user.model';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-template-two-two',
  templateUrl: './template-two-two.component.html',
  styleUrls: ['./template-two-two.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TemplateTwoTwoComponent implements OnInit {
  properties: Property[] = [];
  pagedProperties: Property[] = [];
  pageIndex = 0;
  pageSize = 5;
  stateOwnedFacilities: Facility[];
  leasedFacilities: Facility[];
  stateOwnedFacilitiesExtentTotal = 0;
  leasedFacilitiesExtentTotal = 0;
  submitted: boolean = false;
  propertyForm: FormGroup;
  uamp: UAMP;
  conditionRatings: any[];
  functionalPerformanceIndexs: any[];
  operatingPerformanceIndexs: any[];
  suitabilityIndexs: any[];
  accessibilities: any[];
  requiredPerformanceStandards: any[];
  regions: any[];
  localMunicipalities: any[];
  types: any[];
  currentUser: User;
  displayDialog: boolean = false;
  dialogHeader: string = '';
  isLoading: boolean = false;
  isSavingProperty = false;
  isViewOnly: boolean = false;
  isEdit: boolean = false;

  @ViewChild('formDialog') private formDialogTemplate: TemplateRef<unknown>;
  openAddDialog() {
    this.dialogHeader = 'Add Property';
    this.isEdit = false;
    this.openFormDialog();
  }

  constructor(private toastService: ToastService, private router: Router, private uampService: UampService, private sharedService: SharedService, private formBuilder: FormBuilder, private authenticationService: AuthenticationService, private dialog: MatDialog) {
    this.uampService.uampChange.subscribe((value) => {
      if (value) {
        this.properties = [];
        this.uamp = value;
        const templateProperties = this.uamp.templeteTwoPointTwo?.properties ?? [];
        templateProperties.forEach(element => {

          element.leaseStartDate = element.leaseStartDate != null ? new Date(element.leaseStartDate) : undefined;
          element.leaseEndDate = element.leaseEndDate != null ? new Date(element.leaseEndDate) : undefined;
          this.properties.push(element);
        })
        this.updatePagedProperties();
      }
    })
  }

  assginData() {
    this.uamp = this.uampService.uamp;
    if (!this.uamp) {
      this.router.navigate(['uamp']);
      return;
    }

    this.properties = this.uamp.templeteTwoPointTwo?.properties ?? [];
    this.updatePagedProperties();
    this.properties.forEach(element => {
      if(element.districtRegion){
        this.localMunicipalities = this.sharedService.getLocalMunicipalitiesByName(element.districtRegion);
        element.districtObj = this.sharedService.getRegionByName(element.districtRegion);
        element.localMunicipalityObj = this.sharedService.getLocalMunicipalityByName(element.localMunicipality);
      }
    });

  }

  ngOnInit() {
    this.assginData();
    this.propertyForm = this.formBuilder.group({
      fileReferenceNo: [''],
      serialNo: [''],
      district: ['', Validators.required],
      town: ['', Validators.required],
      localMunicipality: ['', Validators.required],
      localAuthority: [''],
      assetDescription: ['', Validators.required],
      oldStreetAddress: [''],
      currentStreetAddress: [''],
      propertyDescription: ['', Validators.required],
      assetType: ['', Validators.required],
      noofParkingBays: ['', Validators.min(0)],
      noofParkingBaysAllocated: ['', Validators.min(0)],
      usableAllocatedSpace: ['', Validators.min(0)],
      lettableSpace: ['', Validators.min(0)],
      extentofLand: ['', Validators.min(0)],
      rentalPM: ['', Validators.min(0)],
      rentalPA: ['', Validators.min(0)],
      rentalRate: ['', Validators.min(0)],
      municipalUtilityServices: [''],
      MunicipalUtilityServiceTotal: [''],
      propertyRatesTaxes: [''],
      operationalCosts: ['', Validators.min(0)],
      requiredPerformanceStandard: ['', Validators.required],
      accessibility: ['', Validators.required],
      conditionRating: ['', Validators.required],
      suitabilityIndex: ['', Validators.required],
      operatingPerformanceIndex: ['', Validators.required],
      functionalPerformanceIndex: ['', Validators.required],
      leaseStartDate: ['', Validators.required],
      leaseEndDate: ['', Validators.required],
      leaseTerm: [''],
      comment: ['']
    });

    this.regions = this.sharedService.getRegions();
    this.types = this.sharedService.getAssetTypes();
    this.conditionRatings = this.sharedService.getConditionRatings();
    this.functionalPerformanceIndexs = this.sharedService.getFunctionalPerformanceIndexs();
    this.operatingPerformanceIndexs = this.sharedService.getOperatingPerformanceIndexs();
    this.suitabilityIndexs = this.sharedService.getsuitabilityIndexs()
    this.accessibilities = this.sharedService.getAccessibilities();
    this.requiredPerformanceStandards = this.sharedService.getRequiredPerformanceStandards();

    this.authenticationService.currentUser.pipe().subscribe(x => {
      this.currentUser = x;
    });

  }

  get tableRowArray(): FormArray {
    return this.propertyForm.get('tableRowArray') as FormArray;
  }

  get p() { return this.propertyForm.controls; }

  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedProperties();
  }

  private updatePagedProperties() {
    const start = this.pageIndex * this.pageSize;
    this.pagedProperties = this.properties.slice(start, start + this.pageSize);
  }

  setLocalMunicipalities(e, property?: Property) {
    if (e != undefined) {
      if (e.value != undefined) {
        this.localMunicipalities = this.sharedService.getLocalMunicipalities(e.value.factor);
        if (property) {
          property.districtRegion = e.value.name;
        }
      }
    }
  }

  onRequiredPerformanceStandardChange(property: Property, e) {
    if (property) {
      property.requiredPerformanceStandard = e.value.name;
    }
  }

  onSuitabilityIndexChange(property: Property, e) {
    if (property) {
      property.suitabilityIndex = e.value.name;
    }
  }

  onOperatingPerformanceIndexChange(property: Property, e) {
    if (property) {
      property.operatingPerformanceIndex = e.value.name;
    }
  }

  onFunctionalPerformanceChange(property: Property, e) {
    if (property) {
      property.functionalPerformanceIndex = e.value.name;
    }
  }

  onUpdate() {
    this.addProperty();
  }

  addProperty() {
    if (this.isSavingProperty || !this.propertyForm) {
      return;
    }
    this.submitted = true;
    this.propertyForm.markAllAsTouched();
    if (this.propertyForm.invalid) {
      return;
    }
    if (!this.currentUser || !this.uamp) {
      this.toastService.showError('Unable to add the property because the UAMP session is unavailable.');
      return;
    }
    this.isSavingProperty = true;
    const property: Property = {
      id: 0,
      userImmovableAssetManagementPlanId: this.uampService.uamp.id,
      fileReferenceNo: this.sharedService.getRandomString(8),
      serialNo: 'IMP' + new Date().getFullYear() + this.sharedService.getRandomNumber(4),
      userDepartmentCode: this.sharedService.getDepartmentCode(this.currentUser.department),
      district: this.propertyForm.controls["district"].value.name,
      districtRegion: this.propertyForm.controls["district"].value.name,
      town: this.propertyForm.controls["town"].value,
      localMunicipality: this.propertyForm.controls["localMunicipality"].value?.name ?? '',
      assetDescription: this.propertyForm.controls["assetDescription"].value,
      oldStreetAddress: this.propertyForm.controls["oldStreetAddress"].value,
      currentStreetAddress: this.propertyForm.controls["currentStreetAddress"].value,
      propertyDescription: this.propertyForm.controls["propertyDescription"].value,
      assetType: this.propertyForm.controls["assetType"].value.name,
      noofParkingBaysAllocated: this.propertyForm.controls["noofParkingBaysAllocated"].value,
      lettableSpace: this.propertyForm.controls["lettableSpace"].value,
      extentofLand: this.propertyForm.controls["extentofLand"].value,
      rentalRate: this.propertyForm.controls["rentalRate"].value,
      rentalPM: this.propertyForm.controls["rentalPM"].value,
      rentalPA: this.propertyForm.controls["rentalPA"].value,
      operationalCosts: this.propertyForm.controls["operationalCosts"].value,
      requiredPerformanceStandard: this.propertyForm.controls["requiredPerformanceStandard"].value?.name ?? '',
      accessibility: this.propertyForm.controls["accessibility"].value?.name ?? '',
      conditionRating: this.propertyForm.controls["conditionRating"].value?.name ?? '',
      suitabilityIndex: this.propertyForm.controls["suitabilityIndex"].value?.name ?? '',
      operatingPerformanceIndex: this.propertyForm.controls["operatingPerformanceIndex"].value?.name ?? '',
      functionalPerformanceIndex: this.propertyForm.controls["functionalPerformanceIndex"].value?.name ?? '',
      leaseStartDate: this.propertyForm.controls["leaseStartDate"].value,
      leaseEndDate: this.propertyForm.controls["leaseEndDate"].value,
      leaseTerm: this.propertyForm.controls["leaseTerm"].value,
      accessibilityObj: this.propertyForm.controls["accessibility"].value,
      operatingPerformanceIndexObj: this.propertyForm.controls["operatingPerformanceIndex"].value,
      functionalPerformanceIndexObj: this.propertyForm.controls["functionalPerformanceIndex"].value,
      requiredPerformanceStandardObj: this.propertyForm.controls["requiredPerformanceStandard"].value,
      conditionRatingObj: this.propertyForm.controls["conditionRating"].value,
      suitabilityIndexObj: this.propertyForm.controls["suitabilityIndex"].value,
      localMunicipalityObj: this.propertyForm.controls["localMunicipality"].value,
      districtObj: this.propertyForm.controls["district"].value,
    }

    this.properties.push(property);
    this.updatePagedProperties();

    if (this.uamp.templeteTwoPointTwo != null) {
      this.uamp.templeteTwoPointTwo.properties = this.properties
    } else {
      this.uamp.templeteTwoPointTwo = {
        id: 0,
        properties: this.properties
      };
    }
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.closeFormDialog();
    this.isSavingProperty = false;
    this.submitted = false;
    this.toastService.showInfo('Property added to this UAMP. Save the UAMP to persist your changes.');
  }

  resetForm() {
    this.propertyForm.reset();
  }

  nextPage() {
    this.getDataForNextTemplate();
  }
  
  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 3).subscribe(
      (templeteThree) => {
        this.uamp.templeteThree = templeteThree;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp3']);
      },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isLoading = false;
      }
    );
  }

  back() {
    this.router.navigate(['uampDetails/uampTemp21']);
  }

  localMunicipalitiesChanged(e, property: Property) {
    if (e != undefined) {
      if (e.value != undefined) {
        this.localMunicipalities = this.sharedService.getLocalMunicipalities(e.value.factor);
        property.localMunicipality = e.value.name;
      }
    }
  }

  save() {
    this.uamp.status = "Saved";
    this.uampService.saveUamp(this.uamp).pipe(first()).subscribe(uamp => {
      this.uamp = uamp;
      this.uampService.assignUamp(uamp);
      this.toastService.showSuccess('UAMP has been saved successfully.');
      this.cancel();
    },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  cancel() {
    this.router.navigate(['uamp']);
  }

  conditionRatingCahnged(property: Property, e) {
    property.conditionRating = e.value.factor;
  }
  private formDialogRef: MatDialogRef<unknown> | null = null;

  private openFormDialog() {
    this.displayDialog = true;
    const dialogRef = this.dialog.open(this.formDialogTemplate, { maxWidth: '95vw' });
    this.formDialogRef = dialogRef;
    dialogRef.afterClosed().subscribe(() => {
      if (this.formDialogRef === dialogRef) {
        this.formDialogRef = null;
        this.displayDialog = false;
      }
    });
  }

  closeFormDialog() {
    this.formDialogRef?.close();
    this.formDialogRef = null;
    this.displayDialog = false;
  }

}
