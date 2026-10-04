import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { first } from 'rxjs/operators';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CurrentUtlisation } from '../../../models/current-utilisation.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FacilityService } from 'src/app/services/facility/facility.service';
import { AcquisitionPlan } from 'src/app/models/acquisition-plan.model';
import { UAMP } from 'src/app/models/uamp.model';
import { Property } from 'src/app/models/property.model';
import { SurrenderPlan } from 'src/app/models/surrender-plan.model';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  standalone: false,
  selector: 'app-template-four-two',
  templateUrl: './template-four-two.component.html',
  styleUrls: ['./template-four-two.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService]
})
export class TemplateFourTwoComponent implements OnInit {
  acquisitionPlanForm: FormGroup;
  submitted: boolean = false;
  regions: any[];
  initialNeedYears: any[];
  statuses: any[];
  acquisitionTypes: any[];
  acquisitionPlans: Array<AcquisitionPlan> = [];
  buttonItems: MenuItem[];
  uamp: UAMP;
  showComfirmationDelete:boolean = false;
  selectedAcquisitionPlan: AcquisitionPlan;
  isEdit: boolean = false;
  requiredOptions: any[];
  displayDialog: boolean = false;
  dialogHeader: string = '';
  mode: string = 'Edit';
  index: number = 0;
  isLoading: boolean = false;

  constructor(private sharedService: SharedService, private router: Router, private confirmationService: ConfirmationService, public uampService: UampService, private formBuilder: FormBuilder, private messageService: MessageService) {
    this.uampService.uampChange.subscribe((value) => {
      if(value)
      {
        this.uamp = value;
        this.acquisitionPlans = this.uamp.templeteFourPointTwo.acquisitionPlans;

        
        this.uamp.templeteTwoPointTwo.properties.forEach(element => {
          const matchItem = this.acquisitionPlans.filter(p => p.prooertyId == element.id);

          if(element.leaseEndDate < new Date() && matchItem.length == 0){
            this.acquisitionPlans.push(this.create(element));
          }
        });
        
      }  
    });
    this.acquisitionPlanForm = this.formBuilder.group({
      districtRegion: [''],
      town: [''],
      serviceDescription: [''],
      budgetType: [''],
      extent: [''],      
      acquisitionType:[''],
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
    this.requiredOptions = [{label: 'Yes', value: 'true'}, {label: 'No', value: 'false'}];

    this.regions = this.sharedService.getRegions();

    this.initialNeedYears = this.sharedService.getInitialNeedYears();

    this.acquisitionTypes = this.sharedService.getAcquisitionTypes();

    this.statuses = this.sharedService.getStatuses();
  }

  assginData(){
    this.uamp = this.uampService.uamp;
    if(!this.uamp)
      this.router.navigate(['uamp']);
      
    this.acquisitionPlans = this.uamp.templeteFourPointTwo.acquisitionPlans;
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
      acquisitionType:[acquisitionType],
      status:[status],
      totalAmountRequired: [this.selectedAcquisitionPlan.totalAmountRequired],
      cashFlowYear1: [this.selectedAcquisitionPlan.cashFlowYear1],
      cashFlowYear2: [this.selectedAcquisitionPlan.cashFlowYear2],
      cashFlowYear3: [this.selectedAcquisitionPlan.cashFlowYear3],
      cashFlowYear4: [this.selectedAcquisitionPlan.cashFlowYear4],
      cashFlowYear5: [this.selectedAcquisitionPlan.cashFlowYear5],
    });
    this.isEdit = true;
  }

  updateAcquisitionPlan() {
    const acquisitionPlan: AcquisitionPlan = {
      id: this.selectedAcquisitionPlan.id,
      userImmovableAssetManagementPlanId: this.uamp.id,
      prooertyId:0,
      templeteNumber: 4.1,
      districtRegion: this.acquisitionPlanForm.controls["districtRegion"].value.name,
      town: this.acquisitionPlanForm.controls["town"].value,
      serviceDescription: this.acquisitionPlanForm.controls["serviceDescription"].value,
      budgetType: this.acquisitionPlanForm.controls["budgetType"].value,
      extent: this.acquisitionPlanForm.controls["extent"].value,
      acquisitionType: this.acquisitionPlanForm.controls["acquisitionType"].value.name,
      status: this.acquisitionPlanForm.controls["status"].value.name,
      totalAmountRequired: this.acquisitionPlanForm.controls["totalAmountRequired"].value,
      cashFlowYear1: this.acquisitionPlanForm.controls["cashFlowYear1"].value,
      cashFlowYear2: this.acquisitionPlanForm.controls["cashFlowYear2"].value,
      cashFlowYear3: this.acquisitionPlanForm.controls["cashFlowYear3"].value,
      cashFlowYear4: this.acquisitionPlanForm.controls["cashFlowYear4"].value,
      cashFlowYear5: this.acquisitionPlanForm.controls["cashFlowYear5"].value,
      reqiured: 'true'
    };

    //var index = this.acquisitionPlans.indexOf(this.selectedAcquisitionPlan); 
    this.acquisitionPlans[this.index] = acquisitionPlan;
    this.isEdit = false;
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.displayDialog = false;
  }
  
  confirmDelete() {
    this.showComfirmationDelete = true;
  }

  selectAcquisitionPlan(acquisitionPlan: AcquisitionPlan){
    this.selectedAcquisitionPlan = acquisitionPlan;
  }

  deleteAcquisitionPlan(){
    if(this.selectedAcquisitionPlan.id == 0){
      var index = this.acquisitionPlans.indexOf(this.selectedAcquisitionPlan);    
      this.acquisitionPlans.splice(index, 1);
    }else{
      this.uampService.deleteAcquisitionPlan(this.selectedAcquisitionPlan).pipe(first()).subscribe(isDeleted => {
        if (isDeleted) {
          this.messageService.add({ severity: 'warn', summary: 'Delete Acquisition Plan', detail: 'Acquisition plan has been deleted successful.' });   
          var index = this.acquisitionPlans.indexOf(this.selectedAcquisitionPlan);    
          this.acquisitionPlans.splice(index, 1);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Delete Acquisition Plan', detail: 'Acquisition plan is not deleted successful.' });
        }
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Error Occurred', detail: 'An error occurred while processing your request. please try again!' });
      });
    }    
  }

  updateOperationPlan() {
    if (this.isEdit) {
      this.updateAcquisitionPlan();
    } else {
      this.addAcquisitionPlan();
    }
  }

  addAcquisitionPlan() {
    const acquisitionPlan: AcquisitionPlan = {
      id: 0,
      userImmovableAssetManagementPlanId: this.uamp.id,
      prooertyId: 0,
      templeteNumber: 4.2,
      districtRegion: this.acquisitionPlanForm.controls["districtRegion"].value.name,
      town: this.acquisitionPlanForm.controls["town"].value,
      serviceDescription: this.acquisitionPlanForm.controls["serviceDescription"].value,
      budgetType: this.acquisitionPlanForm.controls["budgetType"].value,
      extent: this.acquisitionPlanForm.controls["extent"].value,
      acquisitionType: this.acquisitionPlanForm.controls["acquisitionType"].value.name,
      status: this.acquisitionPlanForm.controls["status"].value.name,
      totalAmountRequired: this.acquisitionPlanForm.controls["totalAmountRequired"].value,
      cashFlowYear1: this.acquisitionPlanForm.controls["cashFlowYear1"].value,
      cashFlowYear2: this.acquisitionPlanForm.controls["cashFlowYear2"].value,
      cashFlowYear3: this.acquisitionPlanForm.controls["cashFlowYear3"].value,
      cashFlowYear4: this.acquisitionPlanForm.controls["cashFlowYear4"].value,
      cashFlowYear5: this.acquisitionPlanForm.controls["cashFlowYear5"].value,
      reqiured: "true"
    };
    this.acquisitionPlans.push(acquisitionPlan);
    if(this.uamp.templeteFourPointTwo != null)
    {
      this.uamp.templeteFourPointTwo.acquisitionPlans = this.acquisitionPlans
    }else{
      this.uamp.templeteFourPointTwo = {
        id: 0,
        acquisitionPlans: this.acquisitionPlans
      };
    }
    this.uampService.assignUamp(this.uamp);
    this.resetForm();
    this.displayDialog = false;
  }

  resetForm(){
    this.acquisitionPlanForm.reset();
  }

  calculateTotalAmountRequired(){
    let total = 0;

    const year1 = this.acquisitionPlanForm.controls["cashFlowYear1"].value;
    const year2 = this.acquisitionPlanForm.controls["cashFlowYear2"].value;
    const year3 = this.acquisitionPlanForm.controls["cashFlowYear3"].value;
    const year4 = this.acquisitionPlanForm.controls["cashFlowYear4"].value;
    const year5 = this.acquisitionPlanForm.controls["cashFlowYear5"].value;   

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

      this.acquisitionPlanForm.controls["totalAmountRequired"].setValue(total);  
  }

  calculateDbTotalAmountRequired(acquisitionPlan: AcquisitionPlan){
    let total = 0;
    
    const year1 = acquisitionPlan.cashFlowYear1;
    const year2 = acquisitionPlan.cashFlowYear2;
    const year3 = acquisitionPlan.cashFlowYear3;
    const year4 = acquisitionPlan.cashFlowYear4;
    const year5 = acquisitionPlan.cashFlowYear5;   

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

     return total;   
  }

  create(property: Property){
    const acquisitionPlan: AcquisitionPlan = {
      id: 0,
      userImmovableAssetManagementPlanId: this.uamp.id,
      prooertyId: 0,
      templeteNumber: 4.2,
      districtRegion: property.district,
      town: property.town,
      serviceDescription: undefined,
      budgetType: undefined,
      extent: property.extentofLand,
      acquisitionType: undefined,
      status: undefined,
      totalAmountRequired: 0,
      cashFlowYear1: 0,
      cashFlowYear2: 0,
      cashFlowYear3: 0,
      cashFlowYear4: 0,
      cashFlowYear5: 0,
      reqiured: 'false'
    }
    return acquisitionPlan;
  }  

  onReqiured(acquisitionPlan: AcquisitionPlan, e, index: number){
    this.index = index;
    if(e.value === 'true'){
      this.confirmationService.confirm({
        message: 'Are you sure that this property is still reqiured?',
        accept: () => {
          this.isEdit = true;
          this.displayDialog = true;
          this.selectedAcquisitionPlan = acquisitionPlan;
          const districtRegion = this.sharedService.getRegions().filter(r => r.name == acquisitionPlan.districtRegion)[0];
          const acquisitionType = this.sharedService.getAcquisitionTypes().filter(r => r.name == acquisitionPlan.acquisitionType)[0];
          const status = this.sharedService.getStatuses().filter(r => r.name == acquisitionPlan.status)[0];

          this.acquisitionPlanForm.controls["districtRegion"].setValue(districtRegion); 
          this.acquisitionPlanForm.controls["town"].setValue(acquisitionPlan.town); 
          this.acquisitionPlanForm.controls["serviceDescription"].setValue(acquisitionPlan.serviceDescription); 
          this.acquisitionPlanForm.controls["budgetType"].setValue(acquisitionPlan.budgetType); 
          this.acquisitionPlanForm.controls["extent"].setValue(acquisitionPlan.extent); 
          this.acquisitionPlanForm.controls["acquisitionType"].setValue(acquisitionType); 
          this.acquisitionPlanForm.controls["status"].setValue(status); 
          this.acquisitionPlanForm.controls["totalAmountRequired"].setValue(acquisitionPlan.totalAmountRequired); 
          this.acquisitionPlanForm.controls["cashFlowYear1"].setValue(acquisitionPlan.cashFlowYear1); 
          this.acquisitionPlanForm.controls["cashFlowYear2"].setValue(acquisitionPlan.cashFlowYear2); 
          this.acquisitionPlanForm.controls["cashFlowYear3"].setValue(acquisitionPlan.cashFlowYear3); 
          this.acquisitionPlanForm.controls["cashFlowYear4"].setValue(acquisitionPlan.cashFlowYear4); 
          this.acquisitionPlanForm.controls["cashFlowYear5"].setValue(acquisitionPlan.cashFlowYear5); 
          acquisitionPlan.reqiured = 'true';
        },
        reject:() =>{
          acquisitionPlan.reqiured = 'false';
        }
    });
    }else{
      acquisitionPlan.reqiured = 'false';
    }
  }

  nextPage(){
    this.getDataForNextTemplate();
  }

  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 5.1).subscribe(
      (templeteFivePointOne) => {
        this.uamp.templeteFivePointOne = templeteFivePointOne;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp51']);
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get template data' });
        this.isLoading = false;
      }
    );
  }

  back(){
    this.router.navigate(['uampDetails/uampTemp41']);
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
