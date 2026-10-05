import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { SurrenderPlan } from 'src/app/models/surrender-plan.model';
import { UAMP } from 'src/app/models/uamp.model';
import { StrategicAssessment } from 'src/app/models/strategic-assessment.model';
import { Property } from 'src/app/models/property.model';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { first } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-template-six',
  templateUrl: './template-six.component.html',
  styleUrls: ['./template-six.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class TemplateSixComponent implements OnInit {
  surrenderPlans: Array<SurrenderPlan> = [];
  pagedSurrenderPlans: Array<SurrenderPlan> = [];
  pageIndex = 0;
  pageSize = 5;
  pendingRelinquishPlan: SurrenderPlan | null = null;
  localMunicipalities: any[];
  assetTypes: any[];
  regions: any[];
  newSurrenderPlanForm: FormGroup;
  uamp: UAMP;
  displayDialog: boolean = false;
  dialogHeader: string = '';
  isEdit: boolean = false;
  mode: string = 'Edit';
  isLoading: boolean = false;

  @ViewChild('formDialog') private formDialogTemplate: TemplateRef<unknown>;
  @ViewChild('relinquishConfirmationDialog') private relinquishConfirmationTemplate: TemplateRef<unknown>;
  openAddDialog() {
    this.dialogHeader = 'Add Surrender Plan';
    this.isEdit = false;
    this.openFormDialog();
  }

  constructor(private router: Router, private sharedService: SharedService, private uampService: UampService, private formBuilder: FormBuilder, private toastService: ToastService, private dialog: MatDialog) {
    this.uampService.uampChange.subscribe((value) => {
      if (value) {
        this.uamp = value;
      }
      this.uamp.templeteSix.surrenderPlans.forEach(element => {
        if (element.proposedHandOverDate)
          element.proposedHandOverDate = new Date(element.proposedHandOverDate);
        this.surrenderPlans.push(element);
      });

      this.uamp.templeteThree.strategicAssessments.forEach(element => {
        const matchItem = this.uamp.templeteSix.surrenderPlans.filter(s => s.strategicAssessmentId == element.id);
        if (element.percentageUtilised < 0 && matchItem.length > 0) {
          this.surrenderPlans.push(this.createSPFromStrategicAssessment(element));
        }
      });

      this.uamp.templeteThree.strategicAssessments.forEach(element => {
        const matchItem = this.surrenderPlans.filter(s => s.strategicAssessmentId == element.id);

        if (element.percentageUtilised < 0 && matchItem.length > 0) {
          this.surrenderPlans.push(this.createSPFromStrategicAssessment(element));
        }
      });

      this.uamp.templeteTwoPointTwo.properties.forEach(element => {
        const matchItem = this.surrenderPlans.filter(s => s.propertyId == element.id);

        if (element.leaseEndDate < new Date() && matchItem.length == 0) {
          this.surrenderPlans.push(this.createSPFromProperty(element));
        }
      });
      this.updatePagedSurrenderPlans();
    });
  }

  ngOnInit() {
    this.assginData();
    this.newSurrenderPlanForm = this.formBuilder.group({
      district: [''],
      town: [''],
      localMunicipality: [''],
      currentStreetAddress: [''],
      assetType: [''],
      propertyDescription: [''],
      allocatedLettableSpace: [''],
      extentofLand: [''],
      surrenderRationale: [''],
      proposedHandOverDate: [''],
      contractualObligations: [''],
    });

    this.assetTypes = this.sharedService.getAssetTypes();

    this.regions = this.sharedService.getRegions();
  }

  assginData() {
    this.uamp = this.uampService.uamp;
    if (!this.uamp)
      this.router.navigate(['uamp']);

    this.surrenderPlans = this.uamp.templeteSix.surrenderPlans;
    this.updatePagedSurrenderPlans();
  }

  createSPFromProperty(property: Property): SurrenderPlan {
    const surrenderPlan: SurrenderPlan = {
      id: 0,
      userImmovableAssetManagementPlanId: this.uamp.id,
      propertyId: property.id,
      strategicAssessmentId: undefined,
      district: property.district,
      town: undefined,
      localMunicipality: undefined,
      currentStreetAddress: undefined,
      assetType: undefined,
      propertyDescription: undefined,
      allocatedLettableSpace: undefined,
      extentofLand: undefined,
      surrenderRationale: undefined,
      proposedHandOverDate: undefined,
      contractualObligations: undefined,
      relinquish: undefined
    };
    return surrenderPlan;
  }

  createSPFromStrategicAssessment(strategicAssessment: StrategicAssessment): SurrenderPlan {
    const surrenderPlan: SurrenderPlan = {
      id: 0,
      userImmovableAssetManagementPlanId: this.uamp.id,
      strategicAssessmentId: strategicAssessment.id,
      propertyId: undefined,
      district: strategicAssessment.district,
      town: undefined,
      localMunicipality: undefined,
      currentStreetAddress: undefined,
      assetType: undefined,
      propertyDescription: undefined,
      allocatedLettableSpace: undefined,
      extentofLand: undefined,
      surrenderRationale: undefined,
      proposedHandOverDate: undefined,
      contractualObligations: undefined,
      relinquish: undefined
    };
    return surrenderPlan;
  }

  relinquishSurrenderPlan(surrenderPlan: SurrenderPlan, $event) {
    if ($event.checked) {
      surrenderPlan.relinquish = false;
      this.pendingRelinquishPlan = surrenderPlan;
      this.openConfirmationDialog(this.relinquishConfirmationTemplate);
    } else {
      surrenderPlan.relinquish = false;
    }
  }

  confirmRelinquish() {
    if (this.pendingRelinquishPlan) {
      this.pendingRelinquishPlan.relinquish = true;
    }
    this.pendingRelinquishPlan = null;
    this.closeRelinquishConfirmation();
  }

  cancelRelinquish() {
    this.pendingRelinquishPlan = null;
    this.closeRelinquishConfirmation();
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
      this.addSurrenderPlan();
    } else {
      this.addSurrenderPlan();
    }
  }

  addSurrenderPlan() {
    const surrenderPlan: SurrenderPlan = {
      id: 0,
      userImmovableAssetManagementPlanId: this.uamp.id,
      district: this.newSurrenderPlanForm.controls["district"].value.name,
      town: this.newSurrenderPlanForm.controls["town"].value,
      localMunicipality: this.newSurrenderPlanForm.controls["localMunicipality"].value.name,
      currentStreetAddress: this.newSurrenderPlanForm.controls["currentStreetAddress"].value,
      assetType: this.newSurrenderPlanForm.controls["assetType"].value.name,
      propertyDescription: this.newSurrenderPlanForm.controls["propertyDescription"].value,
      allocatedLettableSpace: this.newSurrenderPlanForm.controls["allocatedLettableSpace"].value,
      extentofLand: this.newSurrenderPlanForm.controls["extentofLand"].value,
      surrenderRationale: this.newSurrenderPlanForm.controls["surrenderRationale"].value,
      proposedHandOverDate: this.newSurrenderPlanForm.controls["proposedHandOverDate"].value,
      contractualObligations: this.newSurrenderPlanForm.controls["contractualObligations"].value,
      relinquish: true
    }

    this.surrenderPlans.push(surrenderPlan);
    this.updatePagedSurrenderPlans();
    if (this.uamp.templeteSix != null) {
      this.uamp.templeteSix.surrenderPlans = this.surrenderPlans
    } else {
      this.uamp.templeteSix = {
        id: 0,
        surrenderPlans: this.surrenderPlans
      };
    }
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.closeFormDialog();
  }

  resetForm() {
    this.newSurrenderPlanForm.reset();
  }

  nextPage() {
   this.getDataForNextTemplate();
  }

  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 7).subscribe(
      (templeteSeven) => {
        this.uamp.templeteSeven = templeteSeven;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp7']);
      },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isLoading = false;
      }
    );
  }

  back() {
    this.router.navigate(['uampDetails/uampTemp53']);
  }

  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedSurrenderPlans();
  }

  private updatePagedSurrenderPlans() {
    const start = this.pageIndex * this.pageSize;
    this.pagedSurrenderPlans = this.surrenderPlans.slice(start, start + this.pageSize);
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
        if (template === this.relinquishConfirmationTemplate) {
          this.pendingRelinquishPlan = null;
        }
      }
    });
  }

  private closeRelinquishConfirmation() {
    this.confirmationDialogRef?.close();
    this.confirmationDialogRef = null;
  }

}
