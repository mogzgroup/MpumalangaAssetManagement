import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { OperationPlan } from 'src/app/models/operation-plan.model';
import { UAMP } from 'src/app/models/uamp.model';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-template-five-three',
  templateUrl: './template-five-three.component.html',
  styleUrls: ['./template-five-three.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService]
})
export class TemplateFiveThreeComponent implements OnInit {
  operationPlans: Array<OperationPlan> = [];
  operationPlanForm: FormGroup;
  leaseTypes: any[];
  prioities: any[];
  uamp: UAMP;
  isLoading: boolean = false;
  
  constructor(private router: Router, private sharedService: SharedService,  private confirmationService: ConfirmationService,private uampService: UampService, private formBuilder: FormBuilder, private messageService: MessageService) { 
    this.uampService.uampChange.subscribe((value) => {
      if(value)
      {
        this.uamp = value;
      }    

      this.operationPlans = [];
      this.uamp.templeteFivePointThree.operationPlans.forEach(element => {          
        element.leaseStartDate = element.leaseStartDate != null ? new Date(element.leaseStartDate) : undefined;
        element.leaseEndDate = element.leaseEndDate != null ? new Date(element.leaseEndDate): undefined;
        this.operationPlans.push(element);          
      })      
    });
  }

  ngOnInit() {
    this.assginData();
    this.prioities = this.sharedService.getPrioities();

    this.leaseTypes = this.sharedService.getLeaseTypes();
  }

  assginData(){
    this.uamp = this.uampService.uamp;
    if(!this.uamp)
      this.router.navigate(['uamp']);
      
    this.operationPlans = this.uamp.templeteFivePointThree.operationPlans;
  } 

  onLeased(operationPlan: OperationPlan, e, index?: number){
    if(e.checked){
      this.confirmationService.confirm({
        message: 'Are you sure that this property is leased?',
        accept: () => {
          operationPlan.leased = true;
        },
        reject:() =>{
          operationPlan.leased = false;
        }
    });
    }else{
      operationPlan.leased = false;
    }
  }

  onLeaseTypeChange(operationPlan: OperationPlan, e) {
    if (operationPlan) {
      operationPlan.leaseType = e.value && e.value.name ? e.value.name : e.value;
    }
  }

  nextPage(){
    this.getDataForNextTemplate();
  }

  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 6).subscribe(
      (templeteSix) => {
        this.uamp.templeteSix = templeteSix;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp6']);
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get template data' });
        this.isLoading = false;
      }
    );
  }

  back(){
    this.router.navigate(['uampDetails/uampTemp52']);
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

  cancel() {
    this.router.navigate(['uamp']);
  }

  onAccessibilityChange(operationPlan: OperationPlan, e) {
    operationPlan.leaseType = e.value.name;
  }
}

