import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { MtefBudgetPeriod } from 'src/app/models/mtef-budget-period.model';
import { UAMP } from 'src/app/models/uamp.model';
import { SharedService } from 'src/app/services/shared.service';
import { UampService } from 'src/app/services/uamp/uamp.service';

@Component({
  standalone: false,
  selector: 'app-template-seven',
  templateUrl: './template-seven.component.html',
  styleUrls: ['./template-seven.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class TemplateSevenComponent implements OnInit {
  uamp: UAMP;
  municipalUtilityServices: any;
  budgetPeriodForm: FormGroup;
  showFields: boolean = false;
  groups: any[];
  mtefBudgetPeriods: MtefBudgetPeriod[];
  displayDialog: boolean = false;
  dialogHeader: string = '';
  isEdit: boolean = false;
  mode: string = 'Edit';
  year1Allocation: number = 0;
  pageIndex = 0;
  pageSize = 5;
  pagedBudgetPeriods: MtefBudgetPeriod[] = [];

  @ViewChild('formDialog') private formDialogTemplate: TemplateRef<unknown>;
  openAddDialog() {
    this.dialogHeader = 'Add Budget for MTEF Period';
    this.isEdit = false;
    this.resetForm();
    this.openFormDialog();
  }

  constructor(private toastService: ToastService, private sharedService: SharedService, private router: Router, private uampService: UampService, private formBuilder: FormBuilder, private dialog: MatDialog) {
    this.uampService.uampChange.subscribe((value) => {
      if (value) {
        this.uamp = value;
        this.mtefBudgetPeriods = this.uamp.templeteSeven.mtefBudgetPeriods
        this.updatePagedBudgetPeriods();
      }
    });
  }

  ngOnInit() {
    this.assginData();
    this.budgetPeriodForm = this.formBuilder.group({
      group: [''],
      title: [''],
      year1Allocation: [''],
      year1RequiredBudget: [''],
      year1Shortfall: [''],
      year2Allocation: [''],
      year2RequiredBudget: [''],
      year2Shortfall: [''],
      year3Allocation: [''],
      year3RequiredBudget: [''],
      year3Shortfall: [''],
      year4Allocation: [''],
      year4RequiredBudget: [''],
      year4Shortfall: [''],
      year5Allocation: [''],
      year5RequiredBudget: [''],
      year5Shortfall: [''],
    });

    this.groups = [
      { name: 'Capital Projects', code: 'CP', factor: 1 },
      { name: 'Current Expenditure', code: 'CE', factor: 2 },
    ];
  }

  assginData() {
    this.uamp = this.uampService.uamp;
    if (!this.uamp || this.uamp == undefined)
      this.router.navigate(['uamp']);

    this.mtefBudgetPeriods =  this.sharedService.calculateBudgetPeriods(this.uamp).templeteSeven.mtefBudgetPeriods;
    this.updatePagedBudgetPeriods();
  }

  updateOperationPlan() {
    if (this.isEdit) {
      this.addBudgetforMtefPeriod();
    } else {
      this.addBudgetforMtefPeriod();
    }
  }

  onKeydown(event,  mtefBudgetPeriod: MtefBudgetPeriod) {
    if (!isNaN(event)) {
      var index = this.mtefBudgetPeriods.findIndex(b => b.title == mtefBudgetPeriod.title);
      this.uamp.templeteSeven.mtefBudgetPeriods[index].year1Allocation = Number(event);
      this.mtefBudgetPeriods =  this.sharedService.calculateBudgetPeriods(this.uamp).templeteSeven.mtefBudgetPeriods;
      this.onSort();
    }
  }

  umapTempleteValidate() {
    let isValid: boolean = true;

    return isValid;
  }

  newCapitalWorksT41RequiredBudget() {
    let amount: number = 0;
    if (this.uamp.templeteFourPointOne) {
      /*this.uamp.templeteFourPointOne.forEach(acquisitionPlan=> {
        amount = amount + acquisitionPlan.totalAmountRequired;
      }); */
    }
    return amount;
  }

  mtefAllocatoion(year: number, mtefAllocatoion: string, previousYearMtefAllocatoion: string, templete: string) {
    let amount: number = 0;
    let arraryList = this.getTempleteDate(templete);
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
    let amount: number = 0;

    if (this.uamp[templete]) {
      amount = (4 / 100 * this.uamp.templeteSeven[mtefAllocatoion]) + this.uamp.templeteSeven[mtefAllocatoion];
    }
    this.uamp.templeteSeven[amountRequired] = amount;
    return amount;
  }

  shortfall(year: number, mtefAllocatoion: string, amountRequired: string, templete: string) {
    let amount: number = 0;
    let name = "shortfall" + mtefAllocatoion + year;

    if (this.uamp[templete]) {
      amount = this.uamp.templeteSeven[mtefAllocatoion] - this.uamp.templeteSeven[amountRequired];
    }
    this.uamp.templeteSeven[name] = amount;
    return amount;
  }

  totalCurrentCosts(year: number, startWith: string, containStr: string) {
    let amount: number = 0;

    for (var propertyName in this.uamp.templeteSeven) {
      if (propertyName && propertyName != 'undefined') {
        let _property = propertyName.startsWith(startWith);
        if (_property && containStr) {
          var splitted = containStr.split(" ");
          _property = propertyName.includes(splitted[0]) || propertyName.includes(splitted[1]) ? true : false;
        }

        let property = propertyName.endsWith(year.toString());
        if (_property && property) {
          if (!Number.isNaN(Number(this.uamp.templeteSeven[propertyName]))) {
            if (_property && containStr) {
              amount = amount + this.uamp.templeteSeven[propertyName];
            }
            else {
              amount = amount + this.uamp.templeteSeven[propertyName];
            }
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
    let amount: number = 0;

    for (var propertyName in this.uamp.templeteSeven) {
      if (propertyName && propertyName != 'undefined') {
        let _property = propertyName.startsWith(startWith);
        let property = propertyName.endsWith(year.toString());
        if (_property && property) {
          if (!Number.isNaN(Number(this.uamp.templeteSeven[propertyName]))) {
            amount = amount + this.uamp.templeteSeven[propertyName];
          }
        }
      }

    };
    const colName = 'totalCapitalCostsAndRecurrentCosts' + startWith + year
    this.uamp.templeteSeven[colName] = amount;

    return amount;
  }

  shorfallCapitalWorksAndRecurrentCosts(year: number) {
    let amount: number = 0;
    const mtefAllocatoion = 'totalCapitalCostsAndRecurrentCostsmtefAllocatoion' + year;
    const shortfall = 'totalCapitalCostsAndRecurrentCostsshortfall' + year;
    amount = this.uamp.templeteSeven[shortfall] / this.uamp.templeteSeven[mtefAllocatoion];

    const colName = 'shortfallCapitalCostsAndRecurrentCosts' + year
    this.uamp.templeteSeven[colName] = amount;

    return amount;
  }

  shortfallCapitalCosts(year: number) {
    let amount: number = 0;
    const mtefAllocatoion = 'totalCapitalCostsmtefAllocatoion' + year;
    const shortfall = 'totalCapitalCostsshortfall' + year;
    amount = this.uamp.templeteSeven[shortfall] / this.uamp.templeteSeven[mtefAllocatoion];

    const colName = 'shortfallCurrentCosts' + year
    this.uamp.templeteSeven[colName] = amount;

    return amount;
  }

  mtefAllocatoionMUS(year: number, mtefAllocatoion: string, previousYearMtefAllocatoion: string, value: number) {
    let amount: number = 0;
    if (year === 1) {
      amount = amount + value;
    }
    if (year !== 1) {
      amount = (6 / 100 * this.uamp.templeteSeven[previousYearMtefAllocatoion]) + this.uamp.templeteSeven[previousYearMtefAllocatoion];
    }

    this.uamp.templeteSeven[mtefAllocatoion] = amount;
    return amount;
  }

  amountRequiredMUS(year: number, mtefAllocatoion: string, amountRequired: string) {
    let amount: number = 0;

    if (mtefAllocatoion) {
      amount = (4 / 100 * this.uamp.templeteSeven[mtefAllocatoion]) + this.uamp.templeteSeven[mtefAllocatoion];
    }
    this.uamp.templeteSeven[amountRequired] = amount;
    return amount;
  }

  shortfallMUS(year: number, mtefAllocatoion: string, amountRequired: string) {
    let amount: number = 0;
    let name = "shortfall" + mtefAllocatoion + year;

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
          let _municipalUtilityServices = municipalUtilityServices.filter(m => m.name == ele.name);
          if (_municipalUtilityServices.length > 0) {
            _municipalUtilityServices[0].totalCost = _municipalUtilityServices[0].totalCost + ele.cost;
          } else {
            let municipalUtilityService = {
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

  getTempleteDate(templete) {
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

  onSort() {
    this.updatePagedBudgetPeriods();
  }

  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedBudgetPeriods();
  }

  isBudgetGroupStart(period: MtefBudgetPeriod, pageRowIndex: number): boolean {
    const periodIndex = this.pageIndex * this.pageSize + pageRowIndex;
    return periodIndex === 0 || this.mtefBudgetPeriods[periodIndex - 1]?.group !== period.group;
  }

  private updatePagedBudgetPeriods() {
    const start = this.pageIndex * this.pageSize;
    this.pagedBudgetPeriods = this.mtefBudgetPeriods?.slice(start, start + this.pageSize) ?? [];
  }

  addBudgetforMtefPeriod() {
    const mtefBudgetPeriod: MtefBudgetPeriod = {
      id: this.sharedService.getRandomNumber(4),
      userImmovableAssetManagementPlanId: this.uamp.id,      
      title: this.budgetPeriodForm.controls["title"].value,
      group: this.budgetPeriodForm.controls["group"].value.name,
      year1Allocation: this.budgetPeriodForm.controls["year1Allocation"].value,
      year1RequiredBudget: this.budgetPeriodForm.controls["year1RequiredBudget"].value,
      year1Shortfall: this.budgetPeriodForm.controls["year1Shortfall"].value,
      year2Allocation: this.budgetPeriodForm.controls["year2Allocation"].value,
      year2RequiredBudget: this.budgetPeriodForm.controls["year2RequiredBudget"].value,
      year2Shortfall: this.budgetPeriodForm.controls["year2Shortfall"].value,
      year3Allocation: this.budgetPeriodForm.controls["year3Allocation"].value,
      year3RequiredBudget: this.budgetPeriodForm.controls["year3RequiredBudget"].value,
      year3Shortfall: this.budgetPeriodForm.controls["year3Shortfall"].value,
      year4Allocation: this.budgetPeriodForm.controls["year4Allocation"].value,
      year4RequiredBudget: this.budgetPeriodForm.controls["year4RequiredBudget"].value,
      year4Shortfall: this.budgetPeriodForm.controls["year4Shortfall"].value,
      year5Allocation: this.budgetPeriodForm.controls["year5Allocation"].value,
      year5RequiredBudget: this.budgetPeriodForm.controls["year5RequiredBudget"].value,
      year5Shortfall: this.budgetPeriodForm.controls["year5Shortfall"].value,
      order: this.sharedService.getRandomNumber(4),
      isHeader: false,
      isPercentage: false,
    };

    this.mtefBudgetPeriods.push(mtefBudgetPeriod);
    if (this.uamp.templeteSeven != null) {
      this.uamp.templeteSeven.mtefBudgetPeriods = this.mtefBudgetPeriods
    } else {
      this.uamp.templeteSeven = {
        id: 0,
        mtefBudgetPeriods: this.mtefBudgetPeriods
      };
    }
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.onSort();
    this.closeFormDialog();
  }

  resetForm() {
    this.budgetPeriodForm.reset();
  }

  back() {
    this.router.navigate(['uampDetails/uampTemp6']);
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

  submit() {
    this.uamp.status = "Submitted";
    this.uampService.saveUamp(this.uamp).pipe(first()).subscribe(uamp => {
      this.uamp = uamp;
      this.uampService.assignUamp(uamp);
      this.toastService.showSuccess('UAMP has been submitted successfully.');
      this.cancel();
    },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  cancel() {
    this.router.navigate(['uamp']);
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
