import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild, inject } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { OperationPlan } from 'src/app/models/operation-plan.model';
import { UAMP } from 'src/app/models/uamp.model';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { first } from 'rxjs/operators';
import { MatCard, MatCardSubtitle, MatCardContent, MatCardHeader, MatCardTitle, MatCardActions } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
    selector: 'app-template-five-two',
    templateUrl: './template-five-two.component.html',
    styleUrls: ['./template-five-two.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatCard, MatCardSubtitle, MatCardContent, MatButton, MatTooltip, MatIcon, MatInput, FormsModule, MatSelect, MatOption, MatPaginator, MatCardHeader, MatDialogTitle, MatCardTitle, CdkScrollable, MatDialogContent, ReactiveFormsModule, MatFormField, MatLabel, MatCardActions, MatDialogActions, CurrencyPipe]
})
export class TemplateFiveTwoComponent implements OnInit {
  private router = inject(Router);
  private sharedService = inject(SharedService);
  private uampService = inject(UampService);
  private formBuilder = inject(FormBuilder);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);

  operationPlans: OperationPlan[] = [];
  operationPlanForm: FormGroup;
  newOperationPlanForm: FormGroup;
  prioities: any[];
  initialNeedYears: any[];
  regions: any[];
  localMunicipalities: any[];
  uamp: UAMP;
  displayDialog = false;
  dialogHeader = '';
  isEdit = false;
  mode = 'Edit';
  isLoading = false;
  pageIndex = 0;
  pageSize = 5;
  pagedOperationPlans: OperationPlan[] = [];

  @ViewChild('formDialog') private formDialogTemplate: TemplateRef<unknown>;
  openAddDialog() {
    this.dialogHeader = 'Add Operation Plan';
    this.isEdit = false;
    this.resetForm();
    this.openFormDialog();
  }

  constructor() {
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
    const year1 = operationPlan.cashFlowYear1;
    const year2 = operationPlan.cashFlowYear2;
    const year3 = operationPlan.cashFlowYear3;
    const year4 = operationPlan.cashFlowYear4;
    const year5 = operationPlan.cashFlowYear5;

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
