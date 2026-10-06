import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UAMP } from 'src/app/models/uamp.model';
import { MatButton } from '@angular/material/button';
import { PrintSectionDirective } from '../../../common/print-section/print-section.directive';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { DecimalPipe, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-view-uamp',
    templateUrl: './view-uamp.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./view-uamp.component.css'],
    imports: [MatButton, PrintSectionDirective, MatIcon, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, DecimalPipe, CurrencyPipe, DatePipe]
})
export class ViewUampComponent implements OnInit {
  activeIndex = 0;
  municipalUtilityServices: any[] = [];
  @Input() uamp: UAMP;

  constructor() { }

  ngOnInit() {
    const df = this.uamp;
    if(this.uamp.templeteTwoPointTwo.properties){
      this.municipalUtilityServices = this.getMunicipalUtilityServices(this.uamp.templeteTwoPointTwo.properties);
    }
  }

  newCapitalWorksT41RequiredBudget() {
    const amount = 0;
    if (this.uamp.templeteFourPointOne) {
      /*this.uamp.templeteFourPointOne.forEach(acquisitionPlan=> {
        amount = amount + acquisitionPlan.totalAmountRequired;
      }); */
    }
    return amount;
  }

  mtefAllocatoion(year: number, mtefAllocatoion: string, previousYearMtefAllocatoion: string, templete: string) {
    let amount = 0;
    const arraryList = this.getTempleteDate(templete);
    arraryList.forEach(element => {
      if (element[previousYearMtefAllocatoion]) {
        if (year === 1) {
          amount = amount + element[previousYearMtefAllocatoion];
        }
      }
    });
    if (year !== 1) {
      amount = (6 / 100 * this.uamp.templeteSeven[previousYearMtefAllocatoion]) + this.uamp.templeteSeven[previousYearMtefAllocatoion];
    }
    //}
    this.uamp.templeteSeven[mtefAllocatoion] = amount;
    return amount;
  }

  amountRequired(year: number, mtefAllocatoion: string, amountRequired: string, templete: string) {
    let amount = 0;

    if (this.uamp[templete]) {
      amount = (4 / 100 * this.uamp.templeteSeven[mtefAllocatoion]) + this.uamp.templeteSeven[mtefAllocatoion];
    }
    this.uamp.templeteSeven[amountRequired] = amount;
    return amount;
  }

  shortfall(year: number, mtefAllocatoion: string, amountRequired: string, templete: string) {
    let amount = 0;
    const name = "shortfall" + mtefAllocatoion + year;

    if (this.uamp[templete]) {
      amount = this.uamp.templeteSeven[mtefAllocatoion] - this.uamp.templeteSeven[amountRequired];
    }
    this.uamp.templeteSeven[name] = amount;
    return amount;
  }

  totalCurrentCosts(year: number, startWith: string, containStr: string) {
    let amount = 0;

    for (const propertyName in this.uamp.templeteSeven) {
      if (propertyName && propertyName != 'undefined') {
        let _property = propertyName.startsWith(startWith);
        if (_property && containStr) {
          const splitted = containStr.split(" ");
          _property = propertyName.includes(splitted[0]) || propertyName.includes(splitted[1]) ? true : false;
        }

        const property = propertyName.endsWith(year.toString());
        if (_property && property) {
          if (_property && containStr) {
            amount = amount + this.uamp.templeteSeven[propertyName];
          }
          else {
            amount = amount + this.uamp.templeteSeven[propertyName];
          }
        }
      }
    };

    if (containStr) {
      const colName = 'totalCapitalCosts' + startWith + year
      this.uamp.templeteSeven[colName] = amount;
    }
    else {
      const colName = 'totalCurrentCosts' + startWith + year
      const totalCurrentCosts = 'totalCapitalCosts' + startWith + year;
      if (this.uamp.templeteSeven[totalCurrentCosts] != 0)
        amount = amount - this.uamp.templeteSeven[totalCurrentCosts];
      this.uamp.templeteSeven[colName] = amount;
    }

    return amount;
  }

  totalCapitalWorksAndRecurrentCosts(year: number, startWith: string) {
    let amount = 0;

    for (const propertyName in this.uamp.templeteSeven) {
      if (propertyName && propertyName != 'undefined') {
        const _property = propertyName.startsWith(startWith);
        const property = propertyName.endsWith(year.toString());
        if (_property && property)
          amount = amount + this.uamp.templeteSeven[propertyName];
      }

    };
    const colName = 'totalCapitalCostsAndRecurrentCosts' + startWith + year
    this.uamp.templeteSeven[colName] = amount;

    return amount;
  }

  mtefAllocatoionMUS(year: number, mtefAllocatoion: string, previousYearMtefAllocatoion: string, value: number) {
    let amount = 0;
    if (year === 1) {
      amount = amount + value;
    }
    if (year !== 1) {
      amount = (6 / 100 * this.uamp.templeteSeven[previousYearMtefAllocatoion]) + this.uamp.templeteSeven[previousYearMtefAllocatoion];
    }

    this.uamp.templeteSeven[mtefAllocatoion] = amount;
    return amount;
  }

  amountRequiredMUS(year: number, mtefAllocatoion: string, amountRequired: string, value?: number) {
    let amount = 0;

    if (mtefAllocatoion) {
      amount = (4 / 100 * this.uamp.templeteSeven[mtefAllocatoion]) + this.uamp.templeteSeven[mtefAllocatoion];
    }
    this.uamp.templeteSeven[amountRequired] = amount;
    return amount;
  }

  shortfallMUS(year: number, mtefAllocatoion: string, amountRequired: string, value?: number) {
    let amount = 0;
    const name = "shortfall" + mtefAllocatoion + year;

    if (mtefAllocatoion && amountRequired) {
      amount = this.uamp.templeteSeven[mtefAllocatoion] - this.uamp.templeteSeven[amountRequired];
    }
    this.uamp.templeteSeven[name] = amount;
    return amount;
  }

  getMunicipalUtilityServices(properties: any[]) {

    const municipalUtilityServices: any[] = [];

    properties.forEach(property => {
      if (property.municipalUtilityServices) {
        property.municipalUtilityServices.forEach(ele => {
          const _municipalUtilityServices = municipalUtilityServices.filter(m => m.name == ele.name);
          if (_municipalUtilityServices.length > 0) {
            _municipalUtilityServices[0].totalCost = _municipalUtilityServices[0].totalCost + ele.cost;
          } else {
            const municipalUtilityService = {
              name: ele.name,
              totalCost: ele.cost
            };
            municipalUtilityServices.push(municipalUtilityService);
          }
        });
      }
    });

    return municipalUtilityServices;
  }

  shortfallCapitalCosts(year: number) {
    let amount = 0;
    const mtefAllocatoion = 'totalCapitalCostsmtefAllocatoion' + year;
    const shortfall = 'totalCapitalCostsshortfall' + year;
    amount = this.uamp.templeteSeven[shortfall] / this.uamp.templeteSeven[mtefAllocatoion];
   
    const colName = 'shortfallCurrentCosts' + year
    this.uamp.templeteSeven[colName] = amount;

    return amount;
  }

  shorfallCapitalWorksAndRecurrentCosts(year: number) {
    let amount = 0;
    const mtefAllocatoion = 'totalCapitalCostsAndRecurrentCostsmtefAllocatoion' + year;
    const shortfall = 'totalCapitalCostsAndRecurrentCostsshortfall' + year;
    amount = this.uamp.templeteSeven[shortfall] / this.uamp.templeteSeven[mtefAllocatoion] ;
   
    const colName = 'shortfallCapitalCostsAndRecurrentCosts' + year
    this.uamp.templeteSeven[colName] = amount;

    return amount;
  }

  getTempleteDate(templete){
    let arraryList = []
    switch (templete) {
      case 'templeteFourPointOne':
        arraryList = this.uamp.templeteFourPointOne.acquisitionPlans;
        break;
      case 'templeteFourPointTwo':
        arraryList = this.uamp.templeteFourPointTwo.acquisitionPlans;
        break;
      case 'templeteTwoPointOne':
        arraryList = this.uamp.templeteTwoPointOne.properties;
        break;
      case 'templeteTwoPointTwo':
        arraryList = this.uamp.templeteTwoPointTwo.properties;
        break;    
        case 'templeteThree':
          arraryList = this.uamp.templeteThree.strategicAssessments;
          break;
        case 'templeteFivePointOne':
          arraryList = this.uamp.templeteFivePointOne.operationPlans;
          break;
        case 'templeteFivePointTwo':
          arraryList = this.uamp.templeteFivePointTwo.operationPlans;
          break;
        case 'templeteFivePointThree':
          arraryList = this.uamp.templeteFivePointThree.operationPlans;
          case 'templeteSix':
          arraryList = this.uamp.templeteSix.surrenderPlans;
          break; 
    }
    return arraryList;
  }

}
