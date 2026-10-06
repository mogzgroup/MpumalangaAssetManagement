import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FaultService } from 'src/app/services/facility-management/fault.service';
import { ProjectService } from 'src/app/services/facility-management/project.service';
import { ToastService } from 'src/app/services/toast.service';
import { Fault } from '../../../../models/fault.model';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger, MatAutocomplete, MatOption } from '@angular/material/autocomplete';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { TrackTicketComponent } from '../trackticket/track.ticket.component';

@Component({
    selector: 'app-add-fault',
    templateUrl: './add.fault.component.html',
    styleUrls: ['./add.fault.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatAutocompleteTrigger, MatAutocomplete, MatOption, MatError, MatIconButton, MatIcon, MatButton, MatProgressSpinner, MatCard, MatCardHeader, MatCardTitle, MatCardContent, TrackTicketComponent]
})
export class AddFaultComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private faultService = inject(FaultService);
  private toastService = inject(ToastService);
  private projectService = inject(ProjectService);
  private dialog = inject(MatDialog);


  public fault: Fault;
  public attachments: File[] = [];
  public submitted = false;
  public isSuccessful = false;
  public isSubmitting = false;
  public isUploading = false;
  public loadingTowns = false;
  public loadingBuildings = false;
  public reportFaultForm: FormGroup;
  public showTrackTicketDialog = false;
  public referenceNumber = '';
  public properties: any = [];
  public towns: any = [];
  public filteredTowns: any = [];
  public filteredBuildings: any = [];
  public buildings: any = [];
  public enableBuilding = false;
  @ViewChild('trackTicketDialog') trackTicketDialog: TemplateRef<unknown>;
  private trackTicketDialogRef: MatDialogRef<unknown> | null = null;

  getReferenceNumber(length): string {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  constructor() {
      const now = new Date();
      const today = new Date(now.setHours(now.getHours() + 2));
      
    this.fault = {
      id: 0,
      town: '',
      facilityId: 1,
      facilityName: null,
      propertyDescription: '',
      incidentDescription: '',
      contactName: '',
      contactNumber: '',
      createdDate: today,
      modifiedDate: null,
      referenceNo: this.getReferenceNumber(7),
      hasCompletionCertificate: false,
      hasContractInvoice: false,
      supplierId: null,
      projectId: null,
      faultNotes: [],
      status: 'New',
      isDeleted: false,
    };
  }

  ngOnInit() {
    this.buildForm();

    this.loadingTowns = true;
    this.projectService.getTowns().subscribe(towns => {
      this.loadingTowns = false;
      if (!Array.isArray(towns)) {
        this.toastService.showError('Unable to load towns. Please try again.');
        return;
      }
      this.towns = towns.map((element, index) => ({ name: element, code: index, factor: index }));
      this.filteredTowns = this.towns;
    }, error => {
        this.loadingTowns = false;
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isSuccessful = false;
      });
  }

  get f() { return this.reportFaultForm.controls; }

  buildForm() {
    this.reportFaultForm = this.formBuilder.group({
      townName: ['', [Validators.required, this.selectedOptionRequired]],
      buildingName: ['', [Validators.required, this.selectedOptionRequired]],
      propertyDescription: ['', Validators.required],
      descriptionoftheIssue: ['', Validators.required],
      nameSurname: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^[0-9]+$/)]]
    });
  }

  private selectedOptionRequired(control: AbstractControl): ValidationErrors | null {
    return control.value && typeof control.value === 'object' && control.value.code != null
      ? null
      : { selectionRequired: true };
  }

  displayOption(option: any): string {
    return option?.name ?? '';
  }

  onRemoveAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  onBuildingChange(building: any) {
    this.fault.facilityId = Number(building.code);
  }

  onSubmit() {
    this.submitted = true;
    this.isSuccessful = false;
    if (this.isSubmitting || this.isUploading || !this.reportFaultForm) {
      return;
    }
    this.reportFaultForm.markAllAsTouched();
    if (this.reportFaultForm.invalid) {
      return;
    }

    this.fault.incidentDescription = this.reportFaultForm.controls['descriptionoftheIssue'].value;
    this.fault.propertyDescription = this.reportFaultForm.controls['propertyDescription'].value;
    this.fault.contactNumber = this.reportFaultForm.controls['contactNumber'].value;
    this.fault.contactName = this.reportFaultForm.controls['nameSurname'].value;

    this.isSubmitting = true;
    this.faultService.addFault(this.fault).pipe().subscribe(id => {
      this.isSubmitting = false;
        if (id > 0) {
          this.fault.id = id;
          this.isSuccessful = true;
          this.toastService.showSuccess('Fault report submitted successfully. Your reference number is ' + this.fault.referenceNo + '.');
          if (this.attachments.length > 0) {
            this.uploadFiles();
          }
        } else {
          this.toastService.showError('Unable to submit the fault report. Please try again.');
        }
      }, error => {
          this.isSubmitting = false;
          this.isSuccessful = false;
          this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  onChooseFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.attachments.push(...Array.from(input.files));
      input.value = '';
    }
  }

  uploadFiles() {
    if (this.isUploading || this.attachments.length === 0) {
      return;
    }
    this.isUploading = true;
    this.faultService.uploadFiles(this.attachments, 'Fault' + this.fault.referenceNo + '_' + this.fault.id).subscribe(isUploaded => {
      this.isUploading = false;
      if (isUploaded) {
        this.toastService.showSuccess('Attachments uploaded successfully.');
      } else {
        this.toastService.showWarning('Your fault was reported, but the attachments could not be uploaded.');
      }
      this.isSuccessful = true;
    }, error => {
      this.isUploading = false;
      this.isSuccessful = true;
      this.toastService.showWarning('Your fault was reported, but the attachments could not be uploaded. ' +
        this.toastService.getApiErrorMessage(error));
    });
  }

  filterBuilding(query: string) {
    const normalizedQuery = (query ?? '').toLowerCase();
    this.filteredBuildings = this.buildings.filter(building =>
      building.name.toLowerCase().startsWith(normalizedQuery)
    );
  }

  filterTown(query: string) {
    const normalizedQuery = (query ?? '').toLowerCase();
    this.filteredTowns = this.towns.filter(town =>
      town.name.toLowerCase().startsWith(normalizedQuery)
    );
  }

  onTownChange(town: any) {
    this.enableBuilding = false;
    const townName = town.name;
    this.fault.town = townName;
    this.reportFaultForm.controls['buildingName'].reset();
    this.buildings = [];
    this.filteredBuildings = [];
      this.loadingBuildings = true;
      this.projectService.getBuildingByTown(townName).subscribe(buildings => {
        this.loadingBuildings = false;
        if (!Array.isArray(buildings)) {
          this.toastService.showError('Unable to load buildings for the selected town. Please try again.');
          return;
        }
        buildings.forEach(element => {
          const option = { name: element.name + ' - ' + element.clientCode, code: element.id, factor: element.id };
          this.buildings.push(option);
        });
        this.filteredBuildings = this.buildings;
        this.enableBuilding = this.buildings.length > 0;
      }, error => {
        this.loadingBuildings = false;
        this.enableBuilding = false;
        this.isSuccessful = false;
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  onDone() {
      const now = new Date();
      this.fault = {
        ...this.fault,
        id: 0,
        facilityId: 1,
        facilityName: null,
        town: '',
        propertyDescription: '',
        incidentDescription: '',
        contactName: '',
        contactNumber: '',
        createdDate: new Date(now.setHours(now.getHours() + 2)),
        modifiedDate: null,
        referenceNo: this.getReferenceNumber(7),
        hasCompletionCertificate: false,
        hasContractInvoice: false,
        supplierId: null,
        projectId: null,
        faultNotes: [],
        status: 'New',
        isDeleted: false,
      };
      this.reportFaultForm.reset();
      this.attachments = [];
      this.buildings = [];
      this.filteredBuildings = [];
      this.enableBuilding = false;
      this.isSuccessful = false;
      this.submitted = false;
  }

  openTrackTicketDialog() {
    this.showTrackTicketDialog = true;
    if (this.trackTicketDialogRef) {
      return;
    }
    this.trackTicketDialogRef = this.dialog.open(this.trackTicketDialog);
    this.trackTicketDialogRef.afterClosed().subscribe(() => {
      this.showTrackTicketDialog = false;
      this.trackTicketDialogRef = null;
    });
  }

  closeTrackTicketDialog() {
    this.trackTicketDialogRef?.close();
  }
}
