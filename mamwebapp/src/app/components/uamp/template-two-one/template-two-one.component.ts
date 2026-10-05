import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from 'src/app/services/toast.service';
import { PageEvent } from '@angular/material/paginator';
import { UAMP } from 'src/app/models/uamp.model';
import { Property } from 'src/app/models/property.model';
import { UampService } from '../../../services/uamp/uamp.service';
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
  changeDetection: ChangeDetectionStrategy.Eager
})
export class TemplateTwoOneComponent implements OnInit {
  properties: Array<Property> = [];
  pagedProperties: Array<Property> = [];
  pageIndex = 0;
  pageSize = 5;
  submitted: boolean = false;
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
    private toastService: ToastService,
    private sharedService: SharedService,
    private dialog: MatDialog,
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
    if (!this.uamp) {
      this.router.navigate(['uamp']);
      return;
    }

    this.buildHtml();
  }

  buildHtml(){
    this.properties = [];
    const templateProperties = this.uamp.templeteTwoPointOne?.properties ?? [];
    templateProperties.forEach(element => {
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
    );
    this.properties.sort((first, second) => (first.assetDescription || '').localeCompare(second.assetDescription || ''));
    this.updatePagedProperties();
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
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isLoading = false;
      }
    );
  }

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
    this.dialog.open(AddMunicipalUtilityServicesComponent, {
      width: 'min(700px, 95vw)',
      maxHeight: '90vh',
      data: { property }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedProperties();
  }

  isGroupStart(property: Property, pageRowIndex: number): boolean {
    const propertyIndex = this.pageIndex * this.pageSize + pageRowIndex;
    return propertyIndex === 0 ||
      this.properties[propertyIndex - 1]?.assetDescription !== property.assetDescription;
  }

  private updatePagedProperties() {
    const start = this.pageIndex * this.pageSize;
    this.pagedProperties = this.properties.slice(start, start + this.pageSize);
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
}
