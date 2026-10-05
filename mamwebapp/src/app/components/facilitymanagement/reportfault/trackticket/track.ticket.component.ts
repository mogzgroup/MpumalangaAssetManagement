import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FaultService } from 'src/app/services/facility-management/fault.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: false,
  selector: 'app-track-ticket',
  templateUrl: './track.ticket.component.html',
  styleUrls: ['./track.ticket.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class TrackTicketComponent implements OnInit {

  public attachments: [];
  public submitted = false;
  public ticketisFound = false;
  public trackFaultForm: FormGroup;
  public referenceNumber = '';
  public status = '';
  public buildings = [
    { code: 'supplier', name: 'Vacant Land (Loshlelo Roads Camp) - Stinkhout Street, Bethal Rand, Bethal, Mpumalanga' },
    { code: 'companyName', name: 'Land for Cultural Hub - Cnr Brugman Street/Pienaar Street, Badplaas, Badplaas, Mpumalanga' },
    { code: 'companyNumber', name: 'Township Development - Brugman Street, Badplaas, Badplaas, Mpumalanga' },
    { code: 'contactName', name: 'Farm - Sarel Cilliers Street, Badplaas, Badplaas, Mpumalanga' },
    { code: 'contactNumber', name: 'Lynnville Township - Louws Creek Street 6, Aerorand, Middelburg, Mpumalanga' }
  ];

  constructor(
    private faultService: FaultService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  )
  {
  
  }

  ngOnInit() {
    this.buildForm();
  }

  get f() { return this.trackFaultForm.controls; }

  buildForm() {
    this.trackFaultForm = this.formBuilder.group({
      referenceNumber: [''],
    });
  }

  onRemoveAttachment(e) { }

  onSelectAttachment(files) { }

  onSearch() {
    this.submitted = true;
    this.ticketisFound = false;

    if (this.trackFaultForm.valid) {
      const referenceNo = this.trackFaultForm.controls['referenceNumber'].value;
      this.faultService.getFaultReferenceNo(referenceNo).subscribe(fault => {
        if (fault.id > 0) {
          this.status = fault.status;
          this.ticketisFound = true;
        } else {
          this.toastService.showWarning('No fault was found with that reference number.');
        }
      },
      error => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.ticketisFound = false;
      });
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
