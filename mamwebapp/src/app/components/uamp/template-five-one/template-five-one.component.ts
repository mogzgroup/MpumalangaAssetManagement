import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { first } from 'rxjs/operators';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { MenuItem, MessageService } from 'primeng/api';
import { CurrentUtlisation } from '../../../models/current-utilisation.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FacilityService } from 'src/app/services/facility/facility.service';
import { UAMP } from 'src/app/models/uamp.model';
import { OperationPlan } from 'src/app/models/operation-plan.model';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  standalone: false,
  selector: 'app-template-five-one',
  templateUrl: './template-five-one.component.html',
  styleUrls: ['./template-five-one.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService]
})
export class TemplateFiveOneComponent implements OnInit {
  scheduleCurrentUtilisation: CurrentUtlisation[] = [];
  operationPlanForm: FormGroup;
  submitted: boolean = false;
  regions: any[];
  initialNeedYears: any[];
  statuses: any[];
  operationTypes: any[];
  operationPlans: Array<OperationPlan> = [];
  buttonItems: MenuItem[];
  uamp: UAMP;
  showComfirmationDelete:boolean = false;
  selectedOperationPlan: OperationPlan;
  isEdit: boolean = false;
  displayDialog: boolean = false;
  dialogHeader: string = '';
  mode: string = 'Edit';
  isLoading: boolean = false;

  constructor(private sharedService: SharedService, private router: Router, private facilityService: FacilityService, public uampService: UampService, private formBuilder: FormBuilder, private messageService: MessageService) {
    
    this.uampService.uampChange.subscribe((value) => {
      if(value)
      {
        this.uamp = value;
        this.operationPlans = this.uamp.templeteFivePointOne.operationPlans;
      }          
    });

    this.operationPlanForm = this.formBuilder.group({
      districtRegion: [''],
      town: [''],
      serviceDescription: [''],
      budgetType: [''],
      initialNeedYear: [''],
      status:[''],
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

    this.buttonItems = [     
      {label: 'Update', icon: 'pi pi-pencil', command: () => 
          this.update()
      },
      {separator: true},
      {label: 'Delete', icon: 'pi pi-trash', command: () => 
          this.confirmDelete()
      }
    ]; 
    this.regions = this.sharedService.getRegions();

    this.initialNeedYears = this.sharedService.getInitialNeedYears();

    this.operationTypes =this.sharedService.getOperationTypes();

    this.statuses = this.sharedService.getStatuses();
  }

  assginData(){
    this.uamp = this.uampService.uamp;
    if(!this.uamp)
      this.router.navigate(['uamp']);

    this.operationPlans = this.uamp.templeteFivePointOne.operationPlans;
  }  

  updateOperationPlan() {
    if (this.isEdit) {
      this.onUpdate();
    } else {
      this.addOperationPlan();
    }
  }

  update() {
    const districtRegion = this.regions.filter(r => r.name == this.selectedOperationPlan.districtRegion)[0];
    const initialNeedYear = this.initialNeedYears.filter(r => r.name == this.selectedOperationPlan.initialNeedYear)[0];
    const status = this.statuses.filter(r => r.name == this.selectedOperationPlan.status)[0];

    this.operationPlanForm = this.formBuilder.group({
      districtRegion: [districtRegion],
      town: [this.selectedOperationPlan.town],
      serviceDescription: [this.selectedOperationPlan.serviceDescription],
      budgetType: [this.selectedOperationPlan.budgetType],
      initialNeedYear: [initialNeedYear],
      status:[status],
      totalAmountRequired: [this.selectedOperationPlan.totalAmountRequired],
      cashFlowYear1: [this.selectedOperationPlan.cashFlowYear1],
      cashFlowYear2: [this.selectedOperationPlan.cashFlowYear2],
      cashFlowYear3: [this.selectedOperationPlan.cashFlowYear3],
      cashFlowYear4: [this.selectedOperationPlan.cashFlowYear4],
      cashFlowYear5: [this.selectedOperationPlan.cashFlowYear5],
    });
    this.isEdit = true;
  }

  onUpdate() {
    const operationPlan: OperationPlan = {
      id: this.selectedOperationPlan.id,
      userImmovableAssetManagementPlanId: this.uamp.id,
      templeteNumber: 5.1,
      districtRegion: this.operationPlanForm.controls["districtRegion"].value.name,
      town: this.operationPlanForm.controls["town"].value,
      serviceDescription: this.operationPlanForm.controls["serviceDescription"].value,
      budgetType: this.operationPlanForm.controls["budgetType"].value,
      initialNeedYear: Number(this.operationPlanForm.controls["initialNeedYear"].value.name),
      status: this.operationPlanForm.controls["status"].value.name,
      totalAmountRequired: this.operationPlanForm.controls["totalAmountRequired"].value,
      cashFlowYear1: this.operationPlanForm.controls["cashFlowYear1"].value,
      cashFlowYear2: this.operationPlanForm.controls["cashFlowYear2"].value,
      cashFlowYear3: this.operationPlanForm.controls["cashFlowYear3"].value,
      cashFlowYear4: this.operationPlanForm.controls["cashFlowYear4"].value,
      cashFlowYear5: this.operationPlanForm.controls["cashFlowYear5"].value,
      localMunicipality: null,
      assetDescription:null,
      repairDescription: null,
      priorityServiceRanking: null,
      priorityServiceRankingObj: null,
      initialNeedYearObj: null,
      streetDescription: null,
      propertyDescription: null,
      leaseType: null,
      noofParkingBays: null,
      usableSpace: null,
      constructionArea: null,
      extentofLand: null,
      leaseStartDate : null,
      leaseEndDate: null,
      rentalPM: null,
      rentalPA: null,
      comment: null,
      leased: false
    };

    var index = this.operationPlans.indexOf(this.selectedOperationPlan); 
    this.operationPlans[index] = operationPlan;
    this.isEdit = false;
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.displayDialog = false;
  }

  confirmDelete() {
    this.showComfirmationDelete = true;
  }

  selectOperationPlan(operationPlan: OperationPlan){
    this.selectedOperationPlan = operationPlan;
  }

  deleteOperationPlan(){
    if(this.selectedOperationPlan.id == 0){
      var index = this.operationPlans.indexOf(this.selectedOperationPlan);    
      this.operationPlans.splice(index, 1);
    }else{
      this.uampService.deleteOperationPlan(this.selectedOperationPlan).pipe(first()).subscribe(isDeleted => {
        if (isDeleted) {
          this.messageService.add({ severity: 'warn', summary: 'Delete Operation Plan', detail: 'Operation plan has been deleted successful.' });   
          var index = this.operationPlans.indexOf(this.selectedOperationPlan);    
          this.operationPlans.splice(index, 1);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Delete Operation Plan', detail: 'Operation plan is not deleted successful.' });
        }
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Error Occurred', detail: 'An error occurred while processing your request. please try again!' });
      });
    }    
  }

  addOperationPlan() {
    const operationPlan: OperationPlan = {
      id: 0,
      userImmovableAssetManagementPlanId: this.uamp.id,
      templeteNumber: 5.1,
      districtRegion: this.operationPlanForm.controls["districtRegion"].value.name,
      town: this.operationPlanForm.controls["town"].value,
      serviceDescription: this.operationPlanForm.controls["serviceDescription"].value,
      budgetType: this.operationPlanForm.controls["budgetType"].value,
      initialNeedYear: Number(this.operationPlanForm.controls["initialNeedYear"].value.name),
      status: this.operationPlanForm.controls["status"].value.name,
      totalAmountRequired: this.operationPlanForm.controls["totalAmountRequired"].value,
      cashFlowYear1: this.operationPlanForm.controls["cashFlowYear1"].value,
      cashFlowYear2: this.operationPlanForm.controls["cashFlowYear2"].value,
      cashFlowYear3: this.operationPlanForm.controls["cashFlowYear3"].value,
      cashFlowYear4: this.operationPlanForm.controls["cashFlowYear4"].value,
      cashFlowYear5: this.operationPlanForm.controls["cashFlowYear5"].value,
      localMunicipality: null,
      assetDescription:null,
      repairDescription: null,
      priorityServiceRanking: null,
      priorityServiceRankingObj: null,
      initialNeedYearObj: null,
      streetDescription: null,
      propertyDescription: null,
      leaseType: null,
      noofParkingBays: null,
      usableSpace: null,
      constructionArea: null,
      extentofLand: null,
      leaseStartDate : null,
      leaseEndDate: null,
      rentalPM: null,
      rentalPA: null,
      comment: null,
      leased: false
    };
    this.operationPlans.push(operationPlan);
    if(this.uamp.templeteFivePointOne != null)
    {
      this.uamp.templeteFivePointOne.operationPlans = this.operationPlans
    }else{
      this.uamp.templeteFivePointOne = {
        id: 0,
        operationPlans: this.operationPlans
      };
    }
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.displayDialog = false;
  }

  resetForm(){
    this.operationPlanForm.reset();
  }

  calculateTotalAmountRequired(){
    const year1 = this.operationPlanForm.controls["cashFlowYear1"].value;
    const year2 = this.operationPlanForm.controls["cashFlowYear2"].value;
    const year3 = this.operationPlanForm.controls["cashFlowYear3"].value;
    const year4 = this.operationPlanForm.controls["cashFlowYear4"].value;
    const year5 = this.operationPlanForm.controls["cashFlowYear5"].value;
    let total = 0;

      if(year1)
        total = total + year1;
      if(year2)
      total = total + year2;
      if(year3)
      total = total + year3;
      if(year4)
      total = total + year4;
      if(year5)
      total = total + year5;

      this.operationPlanForm.controls["totalAmountRequired"].setValue(total);  
  }

  nextPage(){
    this.getDataForNextTemplate();
  }

  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 5.2).subscribe(
      (templeteFivePointTwo) => {
        this.uamp.templeteFivePointTwo = templeteFivePointTwo;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp52']);
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get template data' });
        this.isLoading = false;
      }
    );
  }

  back(){
    this.router.navigate(['uampDetails/uampTemp42']);
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
}
