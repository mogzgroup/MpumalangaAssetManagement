import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { MenuItem, MessageService } from 'primeng/api';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FacilityService } from 'src/app/services/facility/facility.service';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService]
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
  buttonItems: MenuItem[];
  uamp: UAMP;
  showComfirmationDelete: boolean = false;
  selectedAcquisitionPlan: AcquisitionPlan;
  isEdit: boolean = false;
  displayDialog: boolean = false;
  dialogHeader: string = '';
  mode: string = 'Edit';
  isLoading: boolean = false;

  constructor(private sharedService: SharedService, private router: Router, public uampService: UampService, private formBuilder: FormBuilder, private messageService: MessageService) {
    this.uampService.uampChange.subscribe((value) => {
      if (value) {
        this.uamp = value;
        this.acquisitionPlans = this.uamp.templeteFourPointOne.acquisitionPlans;
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
  }

  confirmDelete() {
    this.showComfirmationDelete = true;
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
    } else {
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
    this.displayDialog = false;
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
    if (e != undefined) {
      if (e.value != undefined) {
        this.localMunicipalities = this.sharedService.getLocalMunicipalities(e.value.factor);
      }
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
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get template data' });
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
