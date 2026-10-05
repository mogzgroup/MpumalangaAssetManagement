import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';

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

  constructor(
    public dialogRef: MatDialogRef<AddMunicipalUtilityServicesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { property: any },
    private formBuilder: FormBuilder
  ) {
    this.municipalUtilityServiceForm = this.formBuilder.group({
        name: [undefined, Validators.required],
        cost: [undefined, Validators.required],        
      });     
      this.property = data.property;
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
    this.dialogRef.close();
  }

  cancal(){
    this.cancel();
  }
}
