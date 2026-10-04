import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { MenuItem } from 'primeng/api';
import { Valuation } from 'src/app/models/facility.model';
import { FacilityService } from 'src/app/services/facility/facility.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';


@Component({
  standalone: false,
  selector: 'app-add-municipal-utility-services',
  templateUrl: './add-municipal-utility-services.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./add-municipal-utility-services.css']
})
export class AddMunicipalUtilityServicesComponent implements OnInit {
  submitted: boolean = false;
  municipalUtilityServices: any[] = [];
  municipalUtilityServiceForm: FormGroup;
  property: any;
  total: number = 0;
  names: any[];

  constructor(public dialogRef: DynamicDialogRef, public config: DynamicDialogConfig, private formBuilder: FormBuilder) {
    this.municipalUtilityServiceForm = this.formBuilder.group({
        name: [undefined, Validators.required],
        cost: [undefined, Validators.required],        
      });     
      this.property = config.data.property;
  }

  ngOnInit() {
    this.names = [
      { name: 'Electricity', code: 'E', factor: 1 },
      { name: 'Sewer & Refuse', code: 'SR', factor: 2 },
      { name: 'Security', code: 'S', factor: 3 },
      { name: 'Telephone', code: 'T', factor: 4 },
      { name: 'Gardening', code: 'G', factor: 5 },
      { name: 'Cleaning', code: 'C', factor: 6 },
      { name: 'Water', code: 'W', factor: 7 },
      { name: 'Other', code: 'O', factor: 8 },
    ];
  }

  resetForm(){    
    this.municipalUtilityServiceForm.reset();
  }

  addMunicipalUtilityService(){
    this.submitted = true;

    if(this.municipalUtilityServiceForm.valid){
        const municipalUtilityService = {
            id: 0,
            name: this.municipalUtilityServiceForm.controls["name"].value.name,
            cost: this.municipalUtilityServiceForm.controls["cost"].value,
        };
        this.municipalUtilityServices.push(municipalUtilityService);
        this.resetForm();
    }    
  }

  deleteMunicipalUtilityService(index){
      this.municipalUtilityServices.splice(index, 1);
  }

  sum(){
      let total = 0;
      this.municipalUtilityServices.forEach( ele => {
        total = total + ele.cost;
      });
      this.total = total;
      return total;
  }

  onSubmit(){
    this.property.municipalUtilityServices = this.municipalUtilityServices;
    this.property.municipalUtilityServiceTotal = this.total;
    this.dialogRef.close(this.property);
  }

  cancel(){
    this.resetForm();
  }

  cancal(){
    this.cancel();
  }
}
