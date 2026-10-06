import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild, inject } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UAMP } from 'src/app/models/uamp.model';
import { StrategicAssessment } from 'src/app/models/strategic-assessment.model';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatCard, MatCardSubtitle, MatCardContent, MatCardHeader, MatCardTitle, MatCardActions } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-template-three',
    templateUrl: './template-three.component.html',
    styleUrls: ['./template-three.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatCard, MatCardSubtitle, MatCardContent, MatButton, MatTooltip, MatIcon, MatIconButton, MatMenuTrigger, MatPaginator, MatMenu, MatMenuItem, MatCardHeader, MatDialogTitle, MatCardTitle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatHint, MatCardActions, MatDialogActions, DecimalPipe]
})
export class TemplateThreeComponent implements OnInit {
  private router = inject(Router);
  uampService = inject(UampService);
  private formBuilder = inject(FormBuilder);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);

  showFields = false;
  strategicAssessments: StrategicAssessment[] = [];
  pagedStrategicAssessments: StrategicAssessment[] = [];
  pageIndex = 0;
  pageSize = 5;
  assessmentStrategicForm: FormGroup;
  uamp: UAMP;
  showComfirmationDelete = false;
  isEdit = false;
  selectedStrategicAssessment:StrategicAssessment;
  displayDialog = false;
  dialogHeader = '';
  mode = 'Edit';
  isLoading = false;

  @ViewChild('formDialog') private formDialogTemplate: TemplateRef<unknown>;
  @ViewChild('deleteConfirmationDialog') private deleteConfirmationTemplate: TemplateRef<unknown>;
  openAddDialog() {
    this.dialogHeader = 'Add Strategic Assessment';
    this.isEdit = false;
    this.resetForm();
    this.openFormDialog();
  }

  constructor() {
    
    this.uampService.uampChange.subscribe((value) => {
      if(value)
      {
        this.uamp = value;
      }    
      
      this.strategicAssessments = this.uamp.templeteThree.strategicAssessments;
      this.updatePagedStrategicAssessments();
  });
  }

  ngOnInit() {
    this.assginData();
    this.assessmentStrategicForm = this.formBuilder.group({
      district: [''],
      position: [''],
      postDescriptionTitle: [''],
      allocatedSpace: [''],
      fbpLevel: [''],
      fbpQuantity: [''],
      fbpNorm: [''],
      aoLevel: [''],
      aoQuantity: [''],
      aoNorm: [''],
    });
  }

  assginData(){
    this.uamp = this.uampService.uamp;
    if(!this.uamp)
      this.router.navigate(['uamp']);
      
    this.strategicAssessments = this.uamp.templeteThree.strategicAssessments;
    this.updatePagedStrategicAssessments();
  } 

  onUpdate() {
    const allocatedSpace = this.assessmentStrategicForm.controls["allocatedSpace"].value;
    const aoRequirement = (this.assessmentStrategicForm.controls["aoNorm"].value * this.assessmentStrategicForm.controls["aoQuantity"].value);
    const strategicAssessment: StrategicAssessment = {
      id: this.selectedStrategicAssessment.id,
      district: this.assessmentStrategicForm.controls["district"].value,
      postDescriptionTitle: this.assessmentStrategicForm.controls["postDescriptionTitle"].value,
      allocatedSpace: allocatedSpace,
      userImmovableAssetManagementPlanId: this.uamp.id,
      surplusShortageAccommodation: (allocatedSpace - aoRequirement),
      percentageUtilised: (allocatedSpace / aoRequirement),
      fbpLevel: this.assessmentStrategicForm.controls["fbpLevel"].value,
      fbpQuantity: this.assessmentStrategicForm.controls["fbpQuantity"].value,
      fbpNorm: this.assessmentStrategicForm.controls["fbpNorm"].value,
      fbpRequirement: (this.assessmentStrategicForm.controls["fbpLevel"].value + this.assessmentStrategicForm.controls["fbpQuantity"].value),
      aoLevel: this.assessmentStrategicForm.controls["aoLevel"].value,
      aoQuantity: this.assessmentStrategicForm.controls["aoQuantity"].value,
      aoNorm: this.assessmentStrategicForm.controls["aoNorm"].value,
      aoRequirement: aoRequirement,
    };

    const index = this.strategicAssessments.indexOf(this.selectedStrategicAssessment); 
    this.strategicAssessments[index] = strategicAssessment;
    this.isEdit = false;
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.closeFormDialog();
  }

  onBlurDistrict(){
      const district = this.assessmentStrategicForm.controls["district"].value;
      if(district){
        this.showFields = district.length > 2 ? true : false;
      }      
  }

  update() {
    this.assessmentStrategicForm = this.formBuilder.group({
      district: [this.selectedStrategicAssessment.district],
      postDescriptionTitle: [this.selectedStrategicAssessment.postDescriptionTitle],
      allocatedSpace: [this.selectedStrategicAssessment.allocatedSpace],
      fbpLevel: [this.selectedStrategicAssessment.fbpLevel],
      fbpQuantity: [this.selectedStrategicAssessment.fbpQuantity],
      fbpNorm: [this.selectedStrategicAssessment.fbpNorm],
      aoLevel: [this.selectedStrategicAssessment.aoLevel],
      aoQuantity: [this.selectedStrategicAssessment.aoQuantity],
      aoNorm: [this.selectedStrategicAssessment.aoNorm],
    });
    this.isEdit = true;
    this.dialogHeader = 'Update Strategic Assessment';
    this.openFormDialog();
  }

  confirmDelete() {
    this.showComfirmationDelete = true;
    this.openConfirmationDialog(this.deleteConfirmationTemplate);
  }

  selectStrategicNeedsAssessment(strategicNeedsAssessment: StrategicAssessment){
    this.selectedStrategicAssessment = strategicNeedsAssessment;
  }

  setDeleteInProgress(inProgress: boolean) {
    if (this.confirmationDialogRef) {
      this.confirmationDialogRef.disableClose = inProgress;
    }
  }

  deleteStrategicAssessment(){
    if(this.selectedStrategicAssessment.id == 0){
      const index = this.strategicAssessments.indexOf(this.selectedStrategicAssessment);    
      this.strategicAssessments.splice(index, 1);
      this.updatePagedStrategicAssessments();
      this.closeDeleteConfirmation();
    }else{
      this.setDeleteInProgress(true);
      this.uampService.deleteStrategicAssessment(this.selectedStrategicAssessment).pipe(first()).subscribe(isDeleted => {
        if (isDeleted) {
          this.toastService.showSuccess('Strategic assessment has been deleted successfully.');
          const index = this.strategicAssessments.indexOf(this.selectedStrategicAssessment);    
          this.strategicAssessments.splice(index, 1);
          this.updatePagedStrategicAssessments();
          this.closeDeleteConfirmation();
        } else {
          this.setDeleteInProgress(false);
          this.toastService.showError('Unable to delete the strategic assessment. Please try again.');
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
      this.addStrategicNeedsAssessment();
    }
  }

  addStrategicNeedsAssessment() {
    const allocatedSpace = this.assessmentStrategicForm.controls["allocatedSpace"].value;
    const aoRequirement = (this.assessmentStrategicForm.controls["aoNorm"].value * this.assessmentStrategicForm.controls["aoQuantity"].value);
    
    const strategicAssessment: StrategicAssessment = {
      id: 0,
      postDescriptionTitle: this.assessmentStrategicForm.controls["postDescriptionTitle"].value,
      district: this.assessmentStrategicForm.controls["district"].value,
      allocatedSpace: allocatedSpace,
      userImmovableAssetManagementPlanId: this.uamp.id,
      surplusShortageAccommodation: (allocatedSpace - aoRequirement),
      percentageUtilised: (allocatedSpace / aoRequirement),
      fbpLevel: this.assessmentStrategicForm.controls["fbpLevel"].value,
      fbpQuantity: this.assessmentStrategicForm.controls["fbpQuantity"].value,
      fbpNorm: this.assessmentStrategicForm.controls["fbpNorm"].value,
      fbpRequirement: (this.assessmentStrategicForm.controls["fbpLevel"].value + this.assessmentStrategicForm.controls["fbpQuantity"].value),
      aoLevel: this.assessmentStrategicForm.controls["aoLevel"].value,
      aoQuantity: this.assessmentStrategicForm.controls["aoQuantity"].value,
      aoNorm: this.assessmentStrategicForm.controls["aoNorm"].value,
      aoRequirement: aoRequirement,
    };
    this.strategicAssessments.push(strategicAssessment);
    this.updatePagedStrategicAssessments();
    if(this.uamp.templeteThree != null)
    {
      this.uamp.templeteThree.strategicAssessments = this.strategicAssessments
    }else{
      this.uamp.templeteThree = {
        id: 0,
        strategicAssessments: this.strategicAssessments
      };
    }
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.onSort();
    this.closeFormDialog();
  }

  cancel(){
    this.closeFormDialog();
  }

  resetForm() {
    this.assessmentStrategicForm.reset();
  }

  onSort() {
    this.updatePagedStrategicAssessments();
  }

  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedStrategicAssessments();
  }

  isDistrictGroupStart(assessment: StrategicAssessment, rowIndex: number): boolean {
    const assessmentIndex = this.pageIndex * this.pageSize + rowIndex;
    return assessmentIndex === 0 ||
      this.strategicAssessments[assessmentIndex - 1]?.district !== assessment.district;
  }

  private updatePagedStrategicAssessments() {
    const start = this.pageIndex * this.pageSize;
    this.pagedStrategicAssessments = this.strategicAssessments.slice(start, start + this.pageSize);
  }

  nextPage(){
   this.getDataForNextTemplate();
  }

  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 4.1).subscribe(
      (templeteFourPointOne) => {
        this.uamp.templeteFourPointOne = templeteFourPointOne;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp41']);
      },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isLoading = false;
      }
    );
  }

  back(){
    this.router.navigate(['uampDetails/uampTemp22']);
  }

  save() {
    this.uamp.status = "Saved";
    this.uampService.saveUamp(this.uamp).pipe(first()).subscribe(uamp => {
      this.uamp = uamp;
      this.uampService.assignUamp(uamp);
      this.toastService.showSuccess('UAMP has been saved successfully.');
      this.cancelSave();
    },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  cancelSave() {
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

}
