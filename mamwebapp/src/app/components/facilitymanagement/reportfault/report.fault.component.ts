import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { RadioButtonModule, RadioControlRegistry } from 'primeng/radiobutton';
import { Project } from 'src/app/models/project.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  standalone: false,
  selector: 'app-report-fault',
  templateUrl: './report.fault.component.html',
  styleUrls: ['./report.fault.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService, ConfirmationService, RadioControlRegistry]
})
export class ReportFaultComponent implements OnInit {
  public error = '';
  public errorMsg = '';
  public showDialog = false;
  public submitted = false;
  public isSuccessful = false;
  public reportFaultForm: FormGroup;
  public referenceNumber = '';
  public showTrackTicketDialog = false;
  public showReportFaultDialog = true;
  public title = 'app';
  public elementType = 'url';
  public value = 'Techiediaries';

  constructor(private authenticationService: AuthenticationService, private formBuilder: FormBuilder, private sharedService: SharedService)
  {
  }

  ngOnInit() {
    this.buildForm();
  }

  get f() { return this.reportFaultForm.controls; }

  buildForm() {
    this.reportFaultForm = this.formBuilder.group({
      buildingName: [''],
      propertyDescription: [''],
      descriptionoftheIssue: [''],
      nameSurname: [''],
      contactNumber: ['']
    });
  }

  onRemoveAttachment(e) { }

  onSelectAttachment(files) { }

  onSubmit() {
    this.submitted = true;
    if (this.reportFaultForm.valid) {
      this.isSuccessful = true;
      this.referenceNumber = this.getReferenceNumber(7);
    }
  }

  getReferenceNumber(length): string {
    let result = '';
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

