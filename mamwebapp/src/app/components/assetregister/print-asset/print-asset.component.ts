import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { PrintSectionDirective } from '../../../common/print-section/print-section.directive';


@Component({
    selector: 'app-print-asset',
    templateUrl: './print-asset.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./print-asset.component.css'],
    imports: [MatButton, PrintSectionDirective]
})
export class PrintAssetComponent implements OnInit {
  activeIndex = 0;
  @Input() selectedFacility;

  constructor() { }

  ngOnInit() {
    if(this.selectedFacility.land == undefined){
      this.selectedFacility.land = {}
    }
    if(this.selectedFacility.finance == undefined){
      this.selectedFacility.finance = {};
    }
    if(this.selectedFacility.improvements == undefined){
      this.selectedFacility.improvements = [];
    }
    if(this.selectedFacility.finance.secondaryInformationNote == undefined){
      this.selectedFacility.finance.secondaryInformationNote = {};
    }
    if(this.selectedFacility.finance.valuation == undefined){
      this.selectedFacility.finance.valuation = {};
    }

    if(this.selectedFacility.finance.leaseStatus == undefined){
      this.selectedFacility.finance.leaseStatus = {};
    }
    if(this.selectedFacility.finance.landUseManagementDetail == undefined){
      this.selectedFacility.finance.landUseManagementDetail = {};
    }
    if(this.selectedFacility.finance.propertyDescription == undefined){
      this.selectedFacility.finance.propertyDescription = {};
    }
    if(this.selectedFacility.finance.geographicalLocation == undefined){
      this.selectedFacility.finance.geographicalLocation = {};
    }    
  }
}

