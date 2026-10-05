import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-report-fault',
  templateUrl: './report.fault.component.html',
  styleUrls: ['./report.fault.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ReportFaultComponent implements OnInit, AfterViewInit {
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
  @ViewChild('reportFaultDialog') reportFaultDialog: TemplateRef<unknown>;
  @ViewChild('trackTicketDialog') trackTicketDialog: TemplateRef<unknown>;
  @ViewChild('reportFaultChoiceDialog') reportFaultChoiceDialog: TemplateRef<unknown>;
  private reportFaultDialogRef: MatDialogRef<unknown> | null = null;
  private trackTicketDialogRef: MatDialogRef<unknown> | null = null;
  private reportFaultChoiceDialogRef: MatDialogRef<unknown> | null = null;

  constructor(private formBuilder: FormBuilder, private dialog: MatDialog) {}

  ngOnInit() {
    this.buildForm();
  }

  ngAfterViewInit() {
    if (this.showReportFaultDialog) {
      this.openReportFaultDialog();
    }
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

  openReportFaultDialog() {
    this.showReportFaultDialog = true;
    if (this.reportFaultDialogRef) {
      return;
    }
    this.reportFaultDialogRef = this.dialog.open(this.reportFaultDialog);
    this.reportFaultDialogRef.afterClosed().subscribe(() => {
      this.showReportFaultDialog = false;
      this.reportFaultDialogRef = null;
    });
  }

  closeReportFaultDialog() {
    this.reportFaultDialogRef?.close();
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

  openReportFaultChoiceDialog() {
    this.showDialog = true;
    if (this.reportFaultChoiceDialogRef) {
      return;
    }
    this.reportFaultChoiceDialogRef = this.dialog.open(this.reportFaultChoiceDialog);
    this.reportFaultChoiceDialogRef.afterClosed().subscribe(() => {
      this.showDialog = false;
      this.reportFaultChoiceDialogRef = null;
    });
  }

  reportFaultFromChoice() {
    this.reportFaultChoiceDialogRef?.close();
    this.openReportFaultDialog();
  }

  trackTicketFromChoice() {
    this.reportFaultChoiceDialogRef?.close();
    this.openTrackTicketDialog();
  }

  closeReportFaultChoiceDialog() {
    this.reportFaultChoiceDialogRef?.close();
  }
}
