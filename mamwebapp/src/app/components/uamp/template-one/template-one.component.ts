import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, TemplateRef, AfterViewInit, inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { ToastService } from 'src/app/services/toast.service';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UAMP } from '../../../models/uamp.model'
import { Programme } from 'src/app/models/programme.model';
import { OptimalSupportingAccommodation } from 'src/app/models/optimal-supporting-accommodation.model';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { Router } from '@angular/router';
import { MatCard, MatCardHeader, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-template-one',
    templateUrl: './template-one.component.html',
    styleUrls: ['./template-one.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatCard, MatCardHeader, MatCardSubtitle, MatCardContent, MatFormField, MatLabel, MatInput, FormsModule, MatError, MatHint, MatButton, MatTooltip, MatIcon, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatMenuTrigger, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, MatMenu, MatMenuItem, MatDialogTitle, CdkScrollable, MatDialogContent, ReactiveFormsModule, MatDialogActions]
})
export class TemplateOneComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private toastService = inject(ToastService);
  private uampService = inject(UampService);
  private dialog = inject(MatDialog);

  programmes: Programme[] = [];
  dataSource = new MatTableDataSource<Programme>([]);
  displayedColumns = ['corporateObjective', 'outcomes', 'solution', 'rationale', 'actions'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('programmeDialog') programmeDialog: TemplateRef<unknown>;
  private programmeDialogRef: MatDialogRef<unknown>;
  selectedProgramme: Programme;
  userDepartment = "Public works, roads & transport";
  optimalSupportingAccommodation: OptimalSupportingAccommodation = {
    id: 0,
    supportingAccommodation: undefined,
    mission: undefined
  };
  programmeForm: FormGroup;
  submitted = false;
  showComfirmationDelete = false;
  isEdit = false;
  dialogHeader = '';
  uamp: UAMP = { templeteOne: { id: 0, optimalSupportingAccommodation: this.optimalSupportingAccommodation, programmes: [] } };
  @Output() updatedUamp = new EventEmitter();
  isLoading = false;
  mode = 'Edit';

  get o() {
    return {
      mission: { errors: null },
      optimalSupportingAccommodation: { errors: null }
    };
  }

  get p() {
    return this.programmeForm ? this.programmeForm.controls : {};
  }

  constructor() {
    this.uampService.uampChange.subscribe((value) => {
      if (value) {
        this.uamp = value;
        this.programmes = this.uamp.templeteOne.programmes;
        this.dataSource.data = this.programmes;
      }
    });
  }

  ngOnInit() {
    this.assginData();

    this.programmeForm = this.formBuilder.group({
      corporateObjective: [''],
      outcomes: [''],
      optimalSupportingAccommodationSolution: [''],
      rationaleChosenSolution: [''],
    });

    this.optimalSupportingAccommodation.mission = this.uamp.templeteOne.optimalSupportingAccommodation.mission;
    this.optimalSupportingAccommodation.supportingAccommodation = this.uamp.templeteOne.optimalSupportingAccommodation.supportingAccommodation;

    this.programmes = this.uamp.templeteOne.programmes;
    this.dataSource.data = this.programmes;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  assginData() {
    this.uamp = this.uampService.uamp;
    if (!this.uamp)
      this.router.navigate(['uamp']);

    this.programmes = this.uamp.templeteOne.programmes;
  }

  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 2.1).subscribe(
      (templeteTwoPointOne) => {
        this.uamp.templeteTwoPointOne = templeteTwoPointOne;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp21']);
      },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isLoading = false;
      }
    );
  }

  update() {
    this.programmeForm = this.formBuilder.group({
      corporateObjective: [this.selectedProgramme.corporateObjective],
      outcomes: [this.selectedProgramme.outcomes],
      optimalSupportingAccommodationSolution: [this.selectedProgramme.optimalSupportingAccommodationSolution],
      rationaleChosenSolution: [this.selectedProgramme.rationaleChosenSolution],
    });
    this.isEdit = true;
    this.dialogHeader = 'Update Programme';
    this.openProgrammeDialog();
  }

  onUpdate() {
    const programme: Programme = {
      id: this.selectedProgramme.id,
      userImmovableAssetManagementPlanId: this.uamp.id,
      corporateObjective: this.programmeForm.controls["corporateObjective"].value,
      outcomes: this.programmeForm.controls["outcomes"].value,
      optimalSupportingAccommodationSolution: this.programmeForm.controls["optimalSupportingAccommodationSolution"].value,
      rationaleChosenSolution: this.programmeForm.controls["rationaleChosenSolution"].value,
    };

    const index = this.programmes.indexOf(this.selectedProgramme);
    this.programmes[index] = programme;
    this.dataSource.data = this.programmes;
    this.isEdit = false;
    this.updatedUamp.emit(this.uamp);
    this.resetForm();
    this.closeProgrammeDialog();
  }

  updateUamp() {
    this.updatedUamp.emit(this.uamp);
  }

  confirmDelete() {
    this.showComfirmationDelete = true;
  }

  deleteProgramme() {
    if (this.selectedProgramme.id == 0) {
      const index = this.programmes.indexOf(this.selectedProgramme);
      this.programmes.splice(index, 1);
    } else {
      this.uampService.deleteProgramme(this.selectedProgramme).pipe(first()).subscribe(isDeleted => {
        if (isDeleted) {
          this.toastService.showSuccess('Programme has been deleted successfully.');
          const index = this.programmes.indexOf(this.selectedProgramme);
          this.programmes.splice(index, 1);
        } else {
          this.toastService.showError('Unable to delete the programme. Please try again.');
        }
      }, error => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
    }
  }

  addProgram() {

    const programme: Programme = {
      id: 0,
      userImmovableAssetManagementPlanId: this.uamp.id,
      corporateObjective: this.programmeForm.controls["corporateObjective"].value,
      outcomes: this.programmeForm.controls["outcomes"].value,
      optimalSupportingAccommodationSolution: this.programmeForm.controls["optimalSupportingAccommodationSolution"].value,
      rationaleChosenSolution: this.programmeForm.controls["rationaleChosenSolution"].value,
    };
    this.programmes.push(programme);
    this.dataSource.data = this.programmes;
    this.updatedUamp.emit(this.uamp);
    this.resetForm();
    this.closeProgrammeDialog();
  }

  resetForm() {
    this.programmeForm.reset();
  }

  selectProgramme(programme: Programme) {
    this.selectedProgramme = programme;
  }

  nextPage() {
   this.getDataForNextTemplate(); 
  }

  openAddProgremme() {
    this.isEdit = false;
    this.dialogHeader = 'Add Programme';
    this.programmeForm.reset();
    this.openProgrammeDialog();
  }

  private openProgrammeDialog() {
    this.programmeDialogRef = this.dialog.open(this.programmeDialog, {
      width: 'min(900px, 90vw)',
      data: { header: this.dialogHeader }
    });
  }

  closeProgrammeDialog() {
    this.programmeDialogRef?.close();
  }

  cancel() {
    this.router.navigate(['uamp']);
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
}
