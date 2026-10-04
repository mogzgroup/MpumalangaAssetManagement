import { MessageService } from 'primeng/api';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UAMP } from 'src/app/models/uamp.model';
import { DialogService } from 'primeng/dynamicdialog';
import { FormControl, FormArray } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Property } from 'src/app/models/property.model';
import { UampService } from '../../../services/uamp/uamp.service';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { TempleteTwoPointOne } from 'src/app/models/templetes/templete-two-point-one.model';
import { AddMunicipalUtilityServicesComponent } from './add-municipal-utility-services/add-municipal-utility-services';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { first } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-template-two-one',
  templateUrl: './template-two-one.component.html',
  styleUrls: ['./template-two-one.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService, DialogService, DynamicDialogRef]
})
export class TemplateTwoOneComponent implements OnInit {
  rowGroupMetadata: any;
  properties: Array<Property> = [];
  submitted: boolean = false;
  propertyForm: FormGroup;
  municipalUtilityServices: any[];
  operationalCosts: any[];
  conditionRatings: any[];
  functionalPerformanceIndexs: any[];
  operatingPerformanceIndexs: any[];
  suitabilityIndexs: any[];
  accessibilities: any[];
  requiredPerformanceStandards: any[];
  uamp: UAMP;
  isLoading: boolean = false;

  constructor(private uampService: UampService,
    private messageService: MessageService,
    private sharedService: SharedService,
    public ref: DynamicDialogRef,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router) {

    this.uampService.uampChange.subscribe((value) => {
      if (value) {
        this.properties = [];
        this.uamp = value;
      }
    });
  }

  ngOnInit() {    
    this.municipalUtilityServices = this.sharedService.getMunicipalUtilityServices();
    this.operationalCosts = this.sharedService.getOperationalCosts();
    this.conditionRatings = this.sharedService.getConditionRatings();
    this.functionalPerformanceIndexs = this.sharedService.getFunctionalPerformanceIndexs();
    this.operatingPerformanceIndexs = this.sharedService.getOperatingPerformanceIndexs();
    this.suitabilityIndexs = this.sharedService.getsuitabilityIndexs();
    this.accessibilities = this.sharedService.getAccessibilities();
    this.requiredPerformanceStandards = this.sharedService.getRequiredPerformanceStandards();
    this.assginData();
  }

  assginData() {
    this.uamp = this.uampService.uamp;
    if (!this.uamp)
      this.router.navigate(['uamp']);
      
    this.buildHtml();
  }

  buildHtml(){
    this.uamp.templeteTwoPointOne.properties.forEach(element => {
      if (element.accessibility)
        element.accessibilityObj = this.accessibilities.filter(a => a.name == element.accessibility)[0];

      if (element.conditionRating)
        element.conditionRatingObj = this.accessibilities.filter(a => a.name == element.conditionRating)[0];

      if (element.suitabilityIndex)
        element.suitabilityIndexObj = this.suitabilityIndexs.filter(a => a.name == element.suitabilityIndex)[0];

      if (element.operatingPerformanceIndex)
        element.operatingPerformanceIndexObj = this.operatingPerformanceIndexs.filter(a => a.name == element.operatingPerformanceIndex)[0];

      if (element.functionalPerformanceIndex)
        element.functionalPerformanceIndexObj = this.functionalPerformanceIndexs.filter(a => a.name == element.functionalPerformanceIndex)[0];

      if (element.requiredPerformanceStandard)
        element.requiredPerformanceStandardObj = this.requiredPerformanceStandards.filter(a => a.name == element.requiredPerformanceStandard)[0];

      this.properties.push(element);
    }
    )
  }

  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 2.2).subscribe(
      (templeteTwoPointTwo) => {
        this.uamp.templeteTwoPointTwo = templeteTwoPointTwo;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp22']); 
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get template data' });
        this.isLoading = false;
      }
    );
  }

  get p() { return this.propertyForm.controls; }

  conditionRatingCahnged(property: Property, e) {
    property.conditionRating = e.value.factor;
  }

  onRequiredPerformanceStandardChange(property: Property, e) {
    property.requiredPerformanceStandard = e.value.name;
  }

  onAccessibilityChange(property: Property, e) {
    property.accessibility = e.value.name;
  }

  onSuitabilityIndexChange(property: Property, e) {
    property.suitabilityIndex = e.value.name;
  }

  onOperatingPerformanceIndexChange(property: Property, e) {
    property.operatingPerformanceIndex = e.value.name;
  }

  onFunctionalPerformanceChange(property: Property, e) {
    property.functionalPerformanceIndex = e.value.name;
  }

  show(property: any) {
    const ref = this.dialogService.open(AddMunicipalUtilityServicesComponent, {
      header: 'Municipal Utility Service',
      width: '40%',
      contentStyle: { "max-height": "500px", "overflow": "auto" },
      baseZIndex: 10000,
      data: { property: property }
    });

    ref.onClose.subscribe(result => {
      console.log(result);
      if (property) {
        property = property;
      }
    });
  }

  onSort() {
    this.updateRowGroupMetaData();
  }

  updateRowGroupMetaData() {
    this.rowGroupMetadata = {};
    if (this.properties) {
      for (let i = 0; i < this.properties.length; i++) {
        let rowData = this.properties[i];
        let brand = rowData.assetDescription;
        if (i == 0) {
          this.rowGroupMetadata[brand] = { index: 0, size: 1 };
        }
        else {
          let previousRowData = this.properties[i - 1];
          let previousRowGroup = previousRowData.assetDescription;
          if (brand === previousRowGroup)
            this.rowGroupMetadata[brand].size++;
          else
            this.rowGroupMetadata[brand] = { index: i, size: 1 };
        }
      }
    }
  }

  nextPage() {
    this.getDataForNextTemplate();    
  }

  back() {
    this.router.navigate(['uampDetails/uampTemp1']);
  }

  save() {
    this.uamp.status = "Saved";
    this.uampService.saveUamp(this.uamp).pipe(first()).subscribe(uamp => {
      this.uamp = uamp;
      this.uampService.assignUamp(uamp);
      this.messageService.add({ severity: 'success', summary: 'Save UAMP', detail: 'UAMP has been saved successful.' });
      this.cancel();
    },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to save UAMP' });
      });
  }

  cancel() {
    this.router.navigate(['uamp']);
  }
}

