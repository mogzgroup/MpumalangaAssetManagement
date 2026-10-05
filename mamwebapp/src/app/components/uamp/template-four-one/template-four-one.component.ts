import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AcquisitionPlan } from 'src/app/models/acquisition-plan.model';
import { first } from 'rxjs/operators';
import { UAMP } from 'src/app/models/uamp.model';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  standalone: false,
  selector: 'app-template-four-one',
  templateUrl: './template-four-one.component.html',
  styleUrls: ['./template-four-one.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class TemplateFourOneComponent implements OnInit {
  scheduleCurrentUtilisation: any[] = [];
  acquisitionPlanForm: FormGroup;
  submitted: boolean = false;
  regions: any[];
  initialNeedYears: any[];
  statuses: any[];
  localMunicipalities: any[];
  acquisitionTypes: any[];
  acquisitionPlans: Array<AcquisitionPlan> = [];
  uamp: UAMP;
  showComfirmationDelete: boolean = false;
  selectedAcquisitionPlan: AcquisitionPlan;
  isEdit: boolean = false;
  displayDialog: boolean = false;
  dialogHeader: string = '';
  mode: string = 'Edit';
  isLoading: boolean = false;
  pageIndex = 0;
  pageSize = 5;
  pagedAcquisitionPlans: Array<AcquisitionPlan> = [];

  @ViewChild('formDialog') private formDialogTemplate: TemplateRef<unknown>;
  @ViewChild('deleteConfirmationDialog') private deleteConfirmationTemplate: TemplateRef<unknown>;
  openAddDialog() {
    this.dialogHeader = 'Add Acquisition Plan';
    this.isEdit = false;
    this.resetForm();
    this.openFormDialog();
  }

  constructor(private sharedService: SharedService, private router: Router, public uampService: UampService, private formBuilder: FormBuilder, private toastService: ToastService, private dialog: MatDialog) {
    this.uampService.uampChange.subscribe((value) => {
      if (value) {
        this.uamp = value;
        this.acquisitionPlans = this.uamp.templeteFourPointOne.acquisitionPlans;
        this.updatePagedAcquisitionPlans();
      }
    });
    this.acquisitionPlanForm = this.formBuilder.group({
      districtRegion: [''],
      town: [''],
      serviceDescription: [''],
      budgetType: [''],
      extent: [''],
      initialNeedYear: [''],
      acquisitionType: [''],
      status: [''],
      totalAmountRequired: [''],
      cashFlowYear1: [''],
      cashFlowYear2: [''],
      cashFlowYear3: [''],
      cashFlowYear4: [''],
      cashFlowYear5: [''],
    });
  }

  ngOnInit() {
    this.assginData();
    this.regions = this.sharedService.getRegions();

    this.initialNeedYears = this.sharedService.getInitialNeedYears();

    this.acquisitionTypes = this.sharedService.getAcquisitionTypes();

    this.statuses = this.sharedService.getStatuses();
  }

  assginData() {
    this.uamp = this.uampService.uamp;
    if (!this.uamp)
      this.router.navigate(['uamp']);

    this.acquisitionPlans = this.uamp.templeteFourPointOne.acquisitionPlans;
    this.updatePagedAcquisitionPlans();
  }

  update() {
    const districtRegion = this.regions.filter(r => r.name == this.selectedAcquisitionPlan.districtRegion)[0];
    const initialNeedYear = this.initialNeedYears.filter(r => r.name == this.selectedAcquisitionPlan.initialNeedYear)[0];
    const status = this.statuses.filter(r => r.name == this.selectedAcquisitionPlan.status)[0];
    const acquisitionType = this.acquisitionTypes.filter(r => r.name == this.selectedAcquisitionPlan.acquisitionType)[0];

    this.acquisitionPlanForm = this.formBuilder.group({
      districtRegion: [districtRegion],
      town: [this.selectedAcquisitionPlan.town],
      serviceDescription: [this.selectedAcquisitionPlan.serviceDescription],
      budgetType: [this.selectedAcquisitionPlan.budgetType],
      extent: [this.selectedAcquisitionPlan.extent],
      initialNeedYear: [initialNeedYear],
      acquisitionType: [acquisitionType],
      status: [status],
      totalAmountRequired: [this.selectedAcquisitionPlan.totalAmountRequired],
      cashFlowYear1: [this.selectedAcquisitionPlan.cashFlowYear1],
      cashFlowYear2: [this.selectedAcquisitionPlan.cashFlowYear2],
      cashFlowYear3: [this.selectedAcquisitionPlan.cashFlowYear3],
      cashFlowYear4: [this.selectedAcquisitionPlan.cashFlowYear4],
      cashFlowYear5: [this.selectedAcquisitionPlan.cashFlowYear5],
    });
    this.isEdit = true;
    this.dialogHeader = 'Update Acquisition Plan';
    this.openFormDialog();
  }

  onUpdate() {
    const acquisitionPlan: AcquisitionPlan = {
      id: this.selectedAcquisitionPlan.id,
      userImmovableAssetManagementPlanId: this.uamp.id,
      prooertyId: 0,
      templeteNumber: 4.1,
      districtRegion: this.acquisitionPlanForm.controls["districtRegion"].value.name,
      town: this.acquisitionPlanForm.controls["town"].value,
      serviceDescription: this.acquisitionPlanForm.controls["serviceDescription"].value,
      budgetType: this.acquisitionPlanForm.controls["budgetType"].value,
      extent: this.acquisitionPlanForm.controls["extent"].value,
      initialNeedYear: Number(this.acquisitionPlanForm.controls["initialNeedYear"].value.name),
      acquisitionType: this.acquisitionPlanForm.controls["acquisitionType"].value.name,
      status: this.acquisitionPlanForm.controls["status"].value.name,
      totalAmountRequired: this.acquisitionPlanForm.controls["totalAmountRequired"].value,
      cashFlowYear1: this.acquisitionPlanForm.controls["cashFlowYear1"].value,
      cashFlowYear2: this.acquisitionPlanForm.controls["cashFlowYear2"].value,
      cashFlowYear3: this.acquisitionPlanForm.controls["cashFlowYear3"].value,
      cashFlowYear4: this.acquisitionPlanForm.controls["cashFlowYear4"].value,
      cashFlowYear5: this.acquisitionPlanForm.controls["cashFlowYear5"].value,
    };

    var index = this.acquisitionPlans.indexOf(this.selectedAcquisitionPlan);
    this.acquisitionPlans[index] = acquisitionPlan;
    this.isEdit = false;
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.closeFormDialog();
  }

  confirmDelete() {
    this.showComfirmationDelete = true;
    this.openConfirmationDialog(this.deleteConfirmationTemplate);
  }

  selectAcquisitionPlan(acquisitionPlan: AcquisitionPlan) {
    this.selectedAcquisitionPlan = acquisitionPlan;
  }

  deleteOperationPlan() {
    this.deleteAcquisitionPlan();
  }

  deleteAcquisitionPlan() {
    if (this.selectedAcquisitionPlan.id == 0) {
      var index = this.acquisitionPlans.indexOf(this.selectedAcquisitionPlan);
      this.acquisitionPlans.splice(index, 1);
      this.updatePagedAcquisitionPlans();
      this.closeDeleteConfirmation();
    } else {
      this.setDeleteInProgress(true);
      this.uampService.deleteAcquisitionPlan(this.selectedAcquisitionPlan).pipe(first()).subscribe(isDeleted => {
        if (isDeleted) {
          this.toastService.showSuccess('Acquisition plan has been deleted successfully.');
          var index = this.acquisitionPlans.indexOf(this.selectedAcquisitionPlan);
          this.acquisitionPlans.splice(index, 1);
          this.updatePagedAcquisitionPlans();
          this.closeDeleteConfirmation();
        } else {
          this.setDeleteInProgress(false);
          this.toastService.showError('Unable to delete the acquisition plan. Please try again.');
        }
      }, error => {
        this.setDeleteInProgress(false);
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
    }
  }

  updateStrategicNeedsAssessment() {
    if (this.isEdit) {
      this.onUpdate();
    } else {
      this.addAcquisitionPlan();
    }
  }

  addAcquisitionPlan() {
    const acquisitionPlan: AcquisitionPlan = {
      id: 0,
      userImmovableAssetManagementPlanId: this.uamp.id,
      prooertyId: 0,
      templeteNumber: 4.1,
      districtRegion: this.acquisitionPlanForm.controls["districtRegion"].value.name,
      town: this.acquisitionPlanForm.controls["town"].value,
      serviceDescription: this.acquisitionPlanForm.controls["serviceDescription"].value,
      budgetType: this.acquisitionPlanForm.controls["budgetType"].value,
      extent: this.acquisitionPlanForm.controls["extent"].value,
      initialNeedYear: Number(this.acquisitionPlanForm.controls["initialNeedYear"].value.name),
      acquisitionType: this.acquisitionPlanForm.controls["acquisitionType"].value.name,
      status: this.acquisitionPlanForm.controls["status"].value.name,
      totalAmountRequired: this.acquisitionPlanForm.controls["totalAmountRequired"].value,
      cashFlowYear1: this.acquisitionPlanForm.controls["cashFlowYear1"].value,
      cashFlowYear2: this.acquisitionPlanForm.controls["cashFlowYear2"].value,
      cashFlowYear3: this.acquisitionPlanForm.controls["cashFlowYear3"].value,
      cashFlowYear4: this.acquisitionPlanForm.controls["cashFlowYear4"].value,
      cashFlowYear5: this.acquisitionPlanForm.controls["cashFlowYear5"].value,
      reqiured: 'false'
    };
    this.acquisitionPlans.push(acquisitionPlan);
    this.updatePagedAcquisitionPlans();
    if (this.uamp.templeteFourPointOne != null) {
      this.uamp.templeteFourPointOne.acquisitionPlans = this.acquisitionPlans
    } else {
      this.uamp.templeteFourPointOne = {
        id: 0,
        acquisitionPlans: this.acquisitionPlans
      };
    }
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.closeFormDialog();
  }

  resetForm() {
    this.acquisitionPlanForm.reset();
  }

  calculateTotalAmountRequired() {
    const year1 = this.acquisitionPlanForm.controls["cashFlowYear1"].value;
    const year2 = this.acquisitionPlanForm.controls["cashFlowYear2"].value;
    const year3 = this.acquisitionPlanForm.controls["cashFlowYear3"].value;
    const year4 = this.acquisitionPlanForm.controls["cashFlowYear4"].value;
    const year5 = this.acquisitionPlanForm.controls["cashFlowYear5"].value;
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

    this.acquisitionPlanForm.controls["totalAmountRequired"].setValue(total);
  }

  calculateDbTotalAmountRequired(acquisitionPlan: AcquisitionPlan) {
    let total = 0;

    const year1 = acquisitionPlan.cashFlowYear1;
    const year2 = acquisitionPlan.cashFlowYear2;
    const year3 = acquisitionPlan.cashFlowYear3;
    const year4 = acquisitionPlan.cashFlowYear4;
    const year5 = acquisitionPlan.cashFlowYear5;

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

  setLocalMunicipalities(e) {
    const region = e?.value ?? e;
    if (region) {
      this.localMunicipalities = this.sharedService.getLocalMunicipalities(region.factor);
    }
  }

  nextPage() {
    this.getDataForNextTemplate();
  }

  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 4.2).subscribe(
      (templeteFourPointTwo) => {
        this.uamp.templeteFourPointTwo = templeteFourPointTwo;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp42']);
      },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isLoading = false;
      }
    );
  }

  back() {
    this.router.navigate(['uampDetails/uampTemp3']);
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
    this.updatePagedAcquisitionPlans();
  }

  private updatePagedAcquisitionPlans() {
    const start = this.pageIndex * this.pageSize;
    this.pagedAcquisitionPlans = this.acquisitionPlans.slice(start, start + this.pageSize);
  }

  cancel() {
    this.router.navigate(['uamp']);
  }
  private formDialogRef: MatDialogRef<unknown> | null = null;
  private confirmationDialogRef: MatDialogRef<unknown> | null = null;

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

  private openConfirmationDialog(template: TemplateRef<unknown>) {
    const dialogRef = this.dialog.open(template, { width: '460px', maxWidth: '95vw' });
    this.confirmationDialogRef = dialogRef;
    dialogRef.afterClosed().subscribe(() => {
      if (this.confirmationDialogRef === dialogRef) {
        this.confirmationDialogRef = null;
        if (template === this.deleteConfirmationTemplate) {
          this.showComfirmationDelete = false;
        }
      }
    });
  }

  closeDeleteConfirmation() {
    this.confirmationDialogRef?.close();
    this.confirmationDialogRef = null;
    this.showComfirmationDelete = false;
  }

  private setDeleteInProgress(inProgress: boolean) {
    if (this.confirmationDialogRef) {
      this.confirmationDialogRef.disableClose = inProgress;
    }
  }

}
