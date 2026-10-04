import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UAMP } from '../../../models/uamp.model'
import { Programme } from 'src/app/models/programme.model';
import { OptimalSupportingAccommodation } from 'src/app/models/optimal-supporting-accommodation.model';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-template-one',
  templateUrl: './template-one.component.html',
  styleUrls: ['./template-one.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService]
})
export class TemplateOneComponent implements OnInit {
  programmes: Programme[] = [];
  selectedProgramme: Programme;
  userDepartment: string = "Public works, roads & transport";
  optimalSupportingAccommodation: OptimalSupportingAccommodation = {
    id: 0,
    supportingAccommodation: undefined,
    mission: undefined
  };
  programmeForm: FormGroup;
  submitted: boolean = false;
  buttonItems: MenuItem[];
  showComfirmationDelete = false;
  isEdit = false;
  displayDialog: boolean = false;
  dialogHeader: string = '';
  uamp: UAMP = { templeteOne: { id: 0, optimalSupportingAccommodation: this.optimalSupportingAccommodation, programmes: [] } };
  @Output() updatedUamp = new EventEmitter();
  isLoading: boolean = false;
  mode: string = 'Edit';

  get o() {
    return {
      mission: { errors: null },
      optimalSupportingAccommodation: { errors: null }
    };
  }

  get p() {
    return this.programmeForm ? this.programmeForm.controls : {};
  }

  constructor(private router: Router, private formBuilder: FormBuilder, private messageService: MessageService, private uampService: UampService) {
    this.uampService.uampChange.subscribe((value) => {
      if (value) {
        this.uamp = value;
        this.programmes = this.uamp.templeteOne.programmes;
      }
    });
  }

  ngOnInit() {
    this.assginData();
    this.buttonItems = [
      {
        label: 'Update', icon: 'pi pi-pencil', command: () =>
          this.update()
      },
      { separator: true },
      {
        label: 'Delete', icon: 'pi pi-trash', command: () =>
          this.confirmDelete()
      }
    ];

    this.programmeForm = this.formBuilder.group({
      corporateObjective: [''],
      outcomes: [''],
      optimalSupportingAccommodationSolution: [''],
      rationaleChosenSolution: [''],
    });

    this.optimalSupportingAccommodation.mission = this.uamp.templeteOne.optimalSupportingAccommodation.mission;
    this.optimalSupportingAccommodation.supportingAccommodation = this.uamp.templeteOne.optimalSupportingAccommodation.supportingAccommodation;

    this.programmes = this.uamp.templeteOne.programmes;
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
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get template data' });
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

    var index = this.programmes.indexOf(this.selectedProgramme);
    this.programmes[index] = programme;
    this.isEdit = false;
    this.updatedUamp.emit(this.uamp);
    this.resetForm();
  }

  updateUamp() {
    this.updatedUamp.emit(this.uamp);
  }

  confirmDelete() {
    this.showComfirmationDelete = true;
  }

  deleteProgramme() {
    if (this.selectedProgramme.id == 0) {
      var index = this.programmes.indexOf(this.selectedProgramme);
      this.programmes.splice(index, 1);
    } else {
      this.uampService.deleteProgramme(this.selectedProgramme).pipe(first()).subscribe(isDeleted => {
        if (isDeleted) {
          this.messageService.add({ severity: 'warn', summary: 'Delete Programme', detail: 'Programme has been deleted successful.' });
          var index = this.programmes.indexOf(this.selectedProgramme);
          this.programmes.splice(index, 1);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Delete Programme', detail: 'Programme is not deleted successful.' });
        }
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Error Occurred', detail: 'An error occurred while processing your request. please try again!' });
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
    this.updatedUamp.emit(this.uamp);
    this.resetForm();
    this.displayDialog = false;
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
    this.displayDialog = true;
    this.dialogHeader = 'Add Programme'
  }

  cancel() {
    this.router.navigate(['uamp']);
  }

  save() {
    this.uamp.status = "Saved";
    this.uampService.saveUamp(this.uamp).pipe(first()).subscribe(uamp => {
      this.uamp = uamp;
      this.uampService.assignUamp(uamp);
      this.messageService.add({ severity: 'success', summary: 'Save UAMP', detail: 'UAMP has been saved successful.' });
      this.cancel();
    },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to save UAMP' });
      });
  }
}
