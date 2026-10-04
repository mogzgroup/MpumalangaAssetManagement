import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { Facility } from 'src/app/models/facility.model';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { SurrenderPlan } from 'src/app/models/surrender-plan.model';
import { UAMP } from 'src/app/models/uamp.model';
import { StrategicAssessment } from 'src/app/models/strategic-assessment.model';
import { Property } from 'src/app/models/property.model';
import { AcquisitionPlan } from 'src/app/models/acquisition-plan.model';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { first } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-template-six',
  templateUrl: './template-six.component.html',
  styleUrls: ['./template-six.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService]
})
export class TemplateSixComponent implements OnInit {
  surrenderPlans: Array<SurrenderPlan> = [];
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

  constructor(private router: Router, private sharedService: SharedService, private confirmationService: ConfirmationService, private uampService: UampService, private formBuilder: FormBuilder, private messageService: MessageService) {
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
      this.confirmationService.confirm({
        message: 'Are you sure that you want to relinquish this property?',
        accept: () => {
          surrenderPlan.relinquish = true;
        },
        reject: () => {
          surrenderPlan.relinquish = false;
        }
      });
    }
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
    this.displayDialog = false;
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
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get template data' });
        this.isLoading = false;
      }
    );
  }

  back() {
    this.router.navigate(['uampDetails/uampTemp53']);
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

