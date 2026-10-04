import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { Facility } from 'src/app/models/facility.model';
import { MenuItem, MessageService } from 'primeng/api';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FacilityService } from 'src/app/services/facility/facility.service';
import { UAMP } from 'src/app/models/uamp.model';
import { StrategicAssessment } from 'src/app/models/strategic-assessment.model';
import { StrategicNeedsAssessment } from 'src/app/models/strategic-needs-assessment';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-template-three',
  templateUrl: './template-three.component.html',
  styleUrls: ['./template-three.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService]
})
export class TemplateThreeComponent implements OnInit {
  showFields: boolean = false;
  rowGroupMetadata: any;
  strategicAssessments: Array<StrategicAssessment> = [];
  @Input() properties: Facility[];
  assessmentStrategicForm: FormGroup;
  buttonItems: MenuItem[];
  uamp: UAMP;
  showComfirmationDelete: boolean = false;
  isEdit: boolean = false;
  selectedStrategicAssessment:StrategicAssessment;
  displayDialog: boolean = false;
  dialogHeader: string = '';
  mode: string = 'Edit';
  isLoading: boolean = false;

  constructor(private router: Router, public uampService: UampService, private formBuilder: FormBuilder, private messageService: MessageService) {
    
    this.uampService.uampChange.subscribe((value) => {
      if(value)
      {
        this.uamp = value;
      }    
      
      this.strategicAssessments = this.uamp.templeteThree.strategicAssessments;
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
  }

  assginData(){
    this.uamp = this.uampService.uamp;
    if(!this.uamp)
      this.router.navigate(['uamp']);
      
    this.strategicAssessments = this.uamp.templeteThree.strategicAssessments;
    this.onSort();
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

    var index = this.strategicAssessments.indexOf(this.selectedStrategicAssessment); 
    this.strategicAssessments[index] = strategicAssessment;
    this.isEdit = false;
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
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
  }

  confirmDelete() {
    this.showComfirmationDelete = true;
  }

  selectStrategicNeedsAssessment(strategicNeedsAssessment: StrategicAssessment){
    this.selectedStrategicAssessment = strategicNeedsAssessment;
  }

  deleteStrategicAssessment(){
    if(this.selectedStrategicAssessment.id == 0){
      var index = this.strategicAssessments.indexOf(this.selectedStrategicAssessment);    
      this.strategicAssessments.splice(index, 1);
    }else{
      this.uampService.deleteStrategicAssessment(this.selectedStrategicAssessment).pipe(first()).subscribe(isDeleted => {
        if (isDeleted) {
          this.messageService.add({ severity: 'warn', summary: 'Delete Strategic Assessment', detail: 'Strategic Assessment has been deleted successful.' });   
          var index = this.strategicAssessments.indexOf(this.selectedStrategicAssessment);    
          this.strategicAssessments.splice(index, 1);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Delete Strategic Assessment', detail: 'Strategic Assessment is not deleted successful.' });
        }
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Error Occurred', detail: 'An error occurred while processing your request. please try again!' });
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
    this.displayDialog = false;
  }

  cancel(){
    this.displayDialog = false;
  }

  resetForm() {
    this.assessmentStrategicForm.reset();
  }

  onSort() {
    this.updateRowGroupMetaData();
  }

  updateRowGroupMetaData() {
    this.rowGroupMetadata = {};
    if (this.strategicAssessments) {
        for (let i = 0; i < this.strategicAssessments.length; i++) {
            let rowData = this.strategicAssessments[i];
            let district = rowData.district;
            if (i == 0) {
                this.rowGroupMetadata[district] = { index: 0, size: 1 };
            }
            else {
                let previousRowData = this.strategicAssessments[i - 1];
                let previousRowGroup = previousRowData.district;
                if (district === previousRowGroup)
                    this.rowGroupMetadata[district].size++;
                else
                    this.rowGroupMetadata[district] = { index: i, size: 1 };
            }
        }
    }
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
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get template data' });
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
      this.messageService.add({ severity: 'success', summary: 'Save UAMP', detail: 'UAMP has been saved successful.' });
      this.cancelSave();
    },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to save UAMP' });
      });
  }

  cancelSave() {
    this.router.navigate(['uamp']);
  }
}

