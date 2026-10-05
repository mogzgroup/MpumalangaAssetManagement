import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { OperationPlan } from 'src/app/models/operation-plan.model';
import { UAMP } from 'src/app/models/uamp.model';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { first } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-template-five-two',
  templateUrl: './template-five-two.component.html',
  styleUrls: ['./template-five-two.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class TemplateFiveTwoComponent implements OnInit {
  operationPlans: Array<OperationPlan> = [];
  operationPlanForm: FormGroup;
  newOperationPlanForm: FormGroup;
  prioities: any[];
  initialNeedYears: any[];
  regions: any[];
  localMunicipalities: any[];
  uamp: UAMP;
  displayDialog: boolean = false;
  dialogHeader: string = '';
  isEdit: boolean = false;
  mode: string = 'Edit';
  isLoading: boolean = false;
  pageIndex = 0;
  pageSize = 5;
  pagedOperationPlans: Array<OperationPlan> = [];

  @ViewChild('formDialog') private formDialogTemplate: TemplateRef<unknown>;
  openAddDialog() {
    this.dialogHeader = 'Add Operation Plan';
    this.isEdit = false;
    this.resetForm();
    this.openFormDialog();
  }

  constructor(private router: Router, private sharedService: SharedService, private uampService: UampService, private formBuilder: FormBuilder, private toastService: ToastService, private dialog: MatDialog) {
    this.uampService.uampChange.subscribe((value) => {
      if (value) {
        this.uamp = value;
      }
      this.operationPlans = [];
      this.uamp.templeteFivePointTwo.operationPlans.forEach(element => {
        if (element.priorityServiceRanking)
          element.initialNeedYearObj = this.initialNeedYears.filter(p => p.name == element.initialNeedYear)[0];
        element.priorityServiceRankingObj = this.prioities.filter(p => p.name == element.priorityServiceRanking)[0];
        this.operationPlans.push(element);
      });
      this.updatePagedOperationPlans();
    });
  }

  ngOnInit() {
    this.assginData();
    this.newOperationPlanForm = this.formBuilder.group({
      districtRegion: [''],
      town: [''],
      localMunicipality: [''],
      assetDescription: [''],
      repairDescription: [''],
      priorityServiceRanking: [''],
      initialNeedYear: [''],
      cashFlowYear1: [''],
      cashFlowYear2: [''],
      cashFlowYear3: [''],
      cashFlowYear4: [''],
      cashFlowYear5: [''],
      totalAmountRequired: ['']
    });

    this.prioities = this.sharedService.getPrioities();

    this.regions = this.sharedService.getRegions();

    this.initialNeedYears = this.sharedService.getInitialNeedYears();
  }

  assginData() {
    this.uamp = this.uampService.uamp;
    if (!this.uamp)
      this.router.navigate(['uamp']);

    this.operationPlans = this.uamp.templeteFivePointTwo.operationPlans;
    this.updatePagedOperationPlans();
  }

  onPrioityServiceReankingChange(operationPlan: OperationPlan, e) {
    operationPlan.priorityServiceRanking = (e.value ?? e).name;
  }
  onInitialNeedYearChange(operationPlan: OperationPlan, e) {
    operationPlan.initialNeedYear = Number((e.value ?? e).name);
  }

  calculateDbTotalAmountRequired(operationPlan: OperationPlan) {
    let total = 0;
    let year1 = operationPlan.cashFlowYear1;
    let year2 = operationPlan.cashFlowYear2;
    let year3 = operationPlan.cashFlowYear3;
    let year4 = operationPlan.cashFlowYear4;
    let year5 = operationPlan.cashFlowYear5;

    if (year1)
      total = total + year1;
    if (year2)
      total = total + year2;
    if (year3)
      total = total + year3;
    if (year4)
      total = total + year4;
    if (year5)
      total = total + year5;

    return total;

  }

  calculateTotalAmountRequired() {
    const year1 = this.newOperationPlanForm.controls["cashFlowYear1"].value;
    const year2 = this.newOperationPlanForm.controls["cashFlowYear2"].value;
    const year3 = this.newOperationPlanForm.controls["cashFlowYear3"].value;
    const year4 = this.newOperationPlanForm.controls["cashFlowYear4"].value;
    const year5 = this.newOperationPlanForm.controls["cashFlowYear5"].value;
    let total = 0;

    if (year1)
      total = total + year1;
    if (year2)
      total = total + year2;
    if (year3)
      total = total + year3;
    if (year4)
      total = total + year4;
    if (year5)
      total = total + year5;

    this.newOperationPlanForm.controls["totalAmountRequired"].setValue(total);
  }

  setLocalMunicipalities(e) {
    if (e != undefined) {
      if (e.value != undefined) {
        this.localMunicipalities = this.sharedService.getLocalMunicipalities(e.value.factor);
      }
    }
  }

  updateOperationPlan() {
    if (this.isEdit) {
      this.addOperationPlan();
    } else {
      this.addOperationPlan();
    }
  }

  addOperationPlan() {
    const operationPlan: OperationPlan = {
      id: 0,
      userImmovableAssetManagementPlanId: this.uamp.id,
      templeteNumber: 5.1,
      districtRegion: this.newOperationPlanForm.controls["districtRegion"].value.name,
      town: this.newOperationPlanForm.controls["town"].value,
      initialNeedYear: Number(this.newOperationPlanForm.controls["initialNeedYear"].value.name),
      totalAmountRequired: this.newOperationPlanForm.controls["totalAmountRequired"].value,
      cashFlowYear1: this.newOperationPlanForm.controls["cashFlowYear1"].value,
      cashFlowYear2: this.newOperationPlanForm.controls["cashFlowYear2"].value,
      cashFlowYear3: this.newOperationPlanForm.controls["cashFlowYear3"].value,
      cashFlowYear4: this.newOperationPlanForm.controls["cashFlowYear4"].value,
      cashFlowYear5: this.newOperationPlanForm.controls["cashFlowYear5"].value,
      localMunicipality: this.newOperationPlanForm.controls["localMunicipality"].value.name,
      assetDescription: this.newOperationPlanForm.controls["assetDescription"].value,
      repairDescription: this.newOperationPlanForm.controls["repairDescription"].value,
      priorityServiceRanking: this.newOperationPlanForm.controls["priorityServiceRanking"].value.name,
      priorityServiceRankingObj: this.newOperationPlanForm.controls["priorityServiceRanking"].value,
      initialNeedYearObj: this.newOperationPlanForm.controls["initialNeedYear"].value,
    };
    this.operationPlans.push(operationPlan);
    if (this.uamp.templeteFivePointTwo != null) {
      this.uamp.templeteFivePointTwo.operationPlans = this.operationPlans
    } else {
      this.uamp.templeteFivePointTwo = {
        id: 0,
        operationPlans: this.operationPlans
      };
    }
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.closeFormDialog();
  }

  resetForm() {
    this.newOperationPlanForm.reset();
  }

  nextPage() {
    this.getDataForNextTemplate();
  }

  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 5.3).subscribe(
      (templeteFivePointThree) => {
        this.uamp.templeteFivePointThree = templeteFivePointThree;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp53']);
      },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isLoading = false;
      }
    );
  }

  back() {
    this.router.navigate(['uampDetails/uampTemp51']);
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

  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedOperationPlans();
  }

  private updatePagedOperationPlans() {
    const start = this.pageIndex * this.pageSize;
    this.pagedOperationPlans = this.operationPlans.slice(start, start + this.pageSize);
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
